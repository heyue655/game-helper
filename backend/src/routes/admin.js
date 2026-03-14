const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const { authAdmin, authSuper } = require('../middleware/auth')
const { success, fail } = require('../utils/response')

const prisma = new PrismaClient()

// ── 仪表盘 ────────────────────────────────────────────────────────────────
router.get('/dashboard', authAdmin, async (req, res) => {
  // 超级管理员才能看数据看板
  if (req.adminRole !== 'SUPER') return fail(res, '无权限', 403)

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [
    todayOrderAmount,
    totalOrderAmount,
    todayPendingDelivery,
    todayPendingSettlement,
    totalDelivered,
    totalSettled,
  ] = await Promise.all([
    // 今日订单总额（排除待支付和已关闭）
    prisma.order.aggregate({
      where: { status: { notIn: ['PENDING_PAY', 'CLOSED'] }, createdAt: { gte: todayStart } },
      _sum: { price: true },
    }),
    // 累计订单总额（排除待支付和已关闭）
    prisma.order.aggregate({
      where: { status: { notIn: ['PENDING_PAY', 'CLOSED'] } },
      _sum: { price: true },
    }),
    // 今日待交单数量
    prisma.order.count({
      where: { status: 'PENDING_DELIVERY', createdAt: { gte: todayStart } },
    }),
    // 今日待结算金额
    prisma.order.aggregate({
      where: { status: 'PENDING_DELIVERY', createdAt: { gte: todayStart } },
      _sum: { price: true },
    }),
    // 累计已交单数量（COMPLETED + PENDING_SETTLEMENT + SETTLED，排除关闭）
    prisma.order.count({
      where: { status: { in: ['COMPLETED', 'PENDING_SETTLEMENT', 'SETTLED'] } },
    }),
    // 累计已结算金额（仅统计 SETTLED 状态）
    prisma.order.aggregate({
      where: { status: 'SETTLED' },
      _sum: { price: true },
    }),
  ])

  return success(res, {
    todayOrderAmount: Number(todayOrderAmount._sum.price || 0),
    totalOrderAmount: Number(totalOrderAmount._sum.price || 0),
    todayPendingDelivery,
    todayPendingSettlement: Number(todayPendingSettlement._sum.price || 0),
    totalDelivered,
    totalSettled: Number(totalSettled._sum.price || 0),
  })
})

// ── 商品管理 ──────────────────────────────────────────────────────────────
router.get('/products', authAdmin, async (req, res) => {
  const { keyword, page = 1, pageSize = 20 } = req.query
  const skip = (parseInt(page) - 1) * parseInt(pageSize)
  const where = keyword ? { name: { contains: keyword } } : {}

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: parseInt(pageSize),
      orderBy: { createdAt: 'desc' },
      include: { productZones: { include: { zone: true } } },
    }),
  ])

  return success(res, {
    total,
    items: items.map((p) => ({
      id: p.id.toString(),
      gameName: p.gameName,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      originalPrice: Number(p.originalPrice),
      sales: p.sales,
      views: p.views,
      status: p.status,
      thumbnail: p.thumbnail,
      detailContent: p.detailContent,
      zones: p.productZones.map((pz) => ({ id: pz.zone.id, name: pz.zone.name })),
      createdAt: p.createdAt,
    })),
  })
})

router.post('/products', authAdmin, async (req, res) => {
  const { gameName, name, description, price, originalPrice, thumbnail, images, specs, detailContent, zoneIds } = req.body
  if (!name || !price || !originalPrice) return fail(res, '请填写必要信息')

  const product = await prisma.product.create({
    data: {
      gameName: gameName || '',
      name,
      description,
      price: parseFloat(price),
      originalPrice: parseFloat(originalPrice),
      thumbnail: thumbnail || '',
      images: images || [],
      specs: specs || [],
      detailContent,
      status: 'OFF',
      productZones: zoneIds?.length
        ? { create: zoneIds.map((zid) => ({ zoneId: parseInt(zid) })) }
        : undefined,
    },
  })
  return success(res, { id: product.id.toString() }, '创建成功', 201)
})

router.put('/products/:id', authAdmin, async (req, res) => {
  const id = BigInt(req.params.id)
  const { gameName, name, description, price, originalPrice, thumbnail, images, specs, detailContent, zoneIds } = req.body

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        ...(gameName !== undefined && { gameName }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(originalPrice !== undefined && { originalPrice: parseFloat(originalPrice) }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(images !== undefined && { images }),
        ...(specs !== undefined && { specs }),
        ...(detailContent !== undefined && { detailContent }),
      },
    })

    if (zoneIds !== undefined) {
      await tx.productZone.deleteMany({ where: { productId: id } })
      if (zoneIds.length > 0) {
        await tx.productZone.createMany({
          data: zoneIds.map((zid) => ({ productId: id, zoneId: parseInt(zid) })),
        })
      }
    }
  })

  return success(res, null, '更新成功')
})

router.patch('/products/:id/status', authAdmin, async (req, res) => {
  const { status } = req.body
  if (!['ON', 'OFF'].includes(status)) return fail(res, '无效的状态')
  await prisma.product.update({ where: { id: BigInt(req.params.id) }, data: { status } })
  return success(res, null, status === 'ON' ? '已上架' : '已下架')
})

router.delete('/products/:id', authAdmin, async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: BigInt(req.params.id) } })
  if (!product) return fail(res, '商品不存在', 404)
  if (product.status === 'ON') return fail(res, '请先下架商品再删除')

  await prisma.$transaction([
    prisma.productZone.deleteMany({ where: { productId: product.id } }),
    prisma.product.delete({ where: { id: product.id } }),
  ])
  return success(res, null, '删除成功')
})

// ── 订单管理 ──────────────────────────────────────────────────────────────
router.get('/orders', authAdmin, async (req, res) => {
  const { status, keyword, page = 1, pageSize = 20 } = req.query
  const skip = (parseInt(page) - 1) * parseInt(pageSize)
  const where = {
    ...(status && { status }),
    ...(keyword && {
      OR: [
        { productName: { contains: keyword } },
        { orderNo: { contains: keyword } },
      ],
    }),
  }

  const [total, items] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: parseInt(pageSize),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, nickname: true, phone: true } },
        assignee: { select: { id: true, nickname: true } },
        complaint: { select: { reason: true, createdAt: true } },
      },
    }),
  ])

  return success(res, {
    total,
    items: items.map((o) => ({
      id: o.id.toString(),
      orderNo: o.orderNo,
      productName: o.productName,
      price: Number(o.price),
      status: o.status,
      isComplained: o.isComplained,
      spec: o.spec,
      user: o.user ? { id: o.user.id.toString(), nickname: o.user.nickname, phone: o.user.phone } : null,
      assignee: o.assignee ? { id: o.assignee.id.toString(), nickname: o.assignee.nickname } : null,
      payTime: o.payTime,
      createdAt: o.createdAt,
      complaintReason: o.complaint?.reason || null,
      complaintAt: o.complaint?.createdAt || null,
    })),
  })
})

// 分配玩家（待分配 -> 待交单）
router.post('/orders/:id/assign', authAdmin, async (req, res) => {
  const { assigneeId } = req.body
  if (!assigneeId) return fail(res, '请选择玩家')

  const order = await prisma.order.findUnique({ where: { id: BigInt(req.params.id) } })
  if (!order) return fail(res, '订单不存在', 404)
  if (order.status !== 'PENDING_ASSIGN') return fail(res, '当前订单状态不可分配')

  const player = await prisma.user.findFirst({ where: { id: BigInt(assigneeId), isBuiltin: true } })
  if (!player) return fail(res, '玩家不存在')

  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'PENDING_DELIVERY', assigneeId: player.id },
  })
  return success(res, null, '分配成功')
})

// 交单入口已移除：交单操作仅由 H5 接单人操作，管理后台不提供此功能

// 结算（待结算 -> 已结算），需传入打手收益和平台收益，两者之和必须等于订单金额
router.post('/orders/:id/settle', authAdmin, async (req, res) => {
  const { playerAmount, platformAmount } = req.body
  if (playerAmount == null || platformAmount == null) return fail(res, '请填写收益分配金额')

  const order = await prisma.order.findUnique({ where: { id: BigInt(req.params.id) } })
  if (!order) return fail(res, '订单不存在', 404)
  if (order.status !== 'PENDING_SETTLEMENT') return fail(res, '当前订单状态不可结算')

  const pa = parseFloat(playerAmount)
  const pla = parseFloat(platformAmount)
  const total = parseFloat(order.price)
  if (Math.abs(pa + pla - total) > 0.001) return fail(res, `分配金额之和（${(pa + pla).toFixed(2)}）必须等于订单金额（${total.toFixed(2)}）`)

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'SETTLED',
      playerAmount: pa,
      platformAmount: pla,
      settledAt: new Date(),
    },
  })
  return success(res, null, '结算成功')
})

// 结算管理列表
router.get('/settlements', authAdmin, async (req, res) => {
  const { page = 1, pageSize = 20, keyword } = req.query
  const skip = (parseInt(page) - 1) * parseInt(pageSize)
  const where = {
    status: 'SETTLED',
    ...(keyword && {
      OR: [
        { productName: { contains: keyword } },
        { orderNo: { contains: keyword } },
      ],
    }),
  }
  const [total, items] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: parseInt(pageSize),
      orderBy: { settledAt: 'desc' },
      include: {
        user: { select: { id: true, nickname: true } },
        assignee: { select: { id: true, nickname: true } },
      },
    }),
  ])
  return success(res, {
    total,
    items: items.map((o) => ({
      id: o.id.toString(),
      orderNo: o.orderNo,
      productName: o.productName,
      price: Number(o.price),
      playerAmount: o.playerAmount != null ? Number(o.playerAmount) : null,
      platformAmount: o.platformAmount != null ? Number(o.platformAmount) : null,
      settledAt: o.settledAt,
      user: o.user ? { id: o.user.id.toString(), nickname: o.user.nickname } : null,
      assignee: o.assignee ? { id: o.assignee.id.toString(), nickname: o.assignee.nickname } : null,
    })),
  })
})

// ── 玩家管理 ──────────────────────────────────────────────────────────────
router.get('/users', authAdmin, async (req, res) => {
  const { keyword, page = 1, pageSize = 20 } = req.query
  const skip = (parseInt(page) - 1) * parseInt(pageSize)
  const where = keyword
    ? { OR: [{ nickname: { contains: keyword } }, { phone: { contains: keyword } }] }
    : {}

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: parseInt(pageSize),
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return success(res, {
    total,
    items: items.map((u) => ({
      id: u.id.toString(),
      phone: u.phone,
      nickname: u.nickname,
      avatar: u.avatar,
      gender: u.gender,
      age: u.age,
      game: u.game,
      isBuiltin: u.isBuiltin,
      isBlacklisted: u.isBlacklisted,
      createdAt: u.createdAt,
    })),
  })
})

router.patch('/users/:id/blacklist', authAdmin, async (req, res) => {
  const { blacklisted } = req.body
  await prisma.user.update({
    where: { id: BigInt(req.params.id) },
    data: { isBlacklisted: !!blacklisted },
  })
  return success(res, null, blacklisted ? '已拉黑' : '已解除拉黑')
})

router.patch('/users/:id/builtin', authAdmin, async (req, res) => {
  const { builtin } = req.body
  if (builtin) {
    const user = await prisma.user.findUnique({ where: { id: BigInt(req.params.id) } })
    if (!user) return fail(res, '用户不存在', 404)
    if (!user.phone) return fail(res, '该用户未绑定手机号，无法设为打手')
  }
  await prisma.user.update({
    where: { id: BigInt(req.params.id) },
    data: { isBuiltin: !!builtin },
  })
  return success(res, null, builtin ? '已设为打手' : '已取消打手身份')
})

// ── 系统管理 ──────────────────────────────────────────────────────────────
// 获取管理员列表（超级管理员）
router.get('/admins', authSuper, async (req, res) => {
  const admins = await prisma.admin.findMany({
    select: { id: true, username: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  return success(res, admins.map((a) => ({ ...a, id: a.id.toString() })))
})

// 创建管理员（超级管理员）
router.post('/admins', authSuper, async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return fail(res, '参数不完整')

  const exists = await prisma.admin.findUnique({ where: { username } })
  if (exists) return fail(res, '用户名已存在')

  const passwordHash = await bcrypt.hash(password, 10)
  const admin = await prisma.admin.create({
    data: { username, passwordHash, role: 'ADMIN' },
  })
  return success(res, { id: admin.id.toString(), username: admin.username, role: admin.role }, '创建成功', 201)
})

// 删除管理员（超级管理员，不能删自己）
router.delete('/admins/:id', authSuper, async (req, res) => {
  const id = BigInt(req.params.id)
  if (id === req.adminId) return fail(res, '不能删除自己')
  await prisma.admin.delete({ where: { id } })
  return success(res, null, '删除成功')
})

// 获取内置玩家列表（用于分配订单时选择）
router.get('/builtin-players', authAdmin, async (req, res) => {
  const players = await prisma.user.findMany({
    where: { isBuiltin: true, isBlacklisted: false },
    select: { id: true, nickname: true, avatar: true, game: true },
  })
  return success(res, players.map((p) => ({ ...p, id: p.id.toString() })))
})

// Banner 管理
router.get('/banners', authAdmin, async (req, res) => {
  const banners = await prisma.banner.findMany({ orderBy: { sort: 'asc' } })
  return success(res, banners)
})

router.post('/banners', authAdmin, async (req, res) => {
  const { imageUrl, link, sort } = req.body
  if (!imageUrl) return fail(res, '请上传图片')
  const banner = await prisma.banner.create({ data: { imageUrl, link: link || '', sort: sort || 0 } })
  return success(res, banner, '创建成功', 201)
})

router.put('/banners/:id', authAdmin, async (req, res) => {
  const { imageUrl, link, sort, isActive } = req.body
  await prisma.banner.update({
    where: { id: parseInt(req.params.id) },
    data: {
      ...(imageUrl !== undefined && { imageUrl }),
      ...(link !== undefined && { link }),
      ...(sort !== undefined && { sort: parseInt(sort) }),
      ...(isActive !== undefined && { isActive: !!isActive }),
    },
  })
  return success(res, null, '更新成功')
})

router.delete('/banners/:id', authAdmin, async (req, res) => {
  await prisma.banner.delete({ where: { id: parseInt(req.params.id) } })
  return success(res, null, '删除成功')
})

// 游戏管理
router.get('/games', authAdmin, async (req, res) => {
  const games = await prisma.game.findMany({
    orderBy: [{ sort: 'asc' }, { id: 'asc' }],
  })
  return success(res, games)
})

router.post('/games', authAdmin, async (req, res) => {
  const { name, sort, isActive } = req.body
  const normalizedName = (name || '').trim()
  if (!normalizedName) return fail(res, '游戏名称不能为空')

  const exists = await prisma.game.findFirst({ where: { name: normalizedName } })
  if (exists) return fail(res, '游戏名称已存在')

  const game = await prisma.game.create({
    data: {
      name: normalizedName,
      sort: sort !== undefined ? parseInt(sort) || 0 : 0,
      isActive: isActive !== undefined ? !!isActive : true,
    },
  })
  return success(res, game, '创建成功', 201)
})

router.put('/games/:id', authAdmin, async (req, res) => {
  const id = parseInt(req.params.id)
  const { name, sort, isActive } = req.body
  const data = {}

  if (name !== undefined) {
    const normalizedName = String(name).trim()
    if (!normalizedName) return fail(res, '游戏名称不能为空')
    const conflict = await prisma.game.findFirst({
      where: { name: normalizedName, id: { not: id } },
    })
    if (conflict) return fail(res, '游戏名称已存在')
    data.name = normalizedName
  }
  if (sort !== undefined) data.sort = parseInt(sort) || 0
  if (isActive !== undefined) data.isActive = !!isActive

  await prisma.game.update({ where: { id }, data })
  return success(res, null, '更新成功')
})

router.delete('/games/:id', authAdmin, async (req, res) => {
  await prisma.game.delete({ where: { id: parseInt(req.params.id) } })
  return success(res, null, '删除成功')
})

// 平台说明管理
router.get('/platform-note', authAdmin, async (req, res) => {
  const note = await prisma.platformNote.findFirst()
  return success(res, { content: note?.content || '' })
})

router.put('/platform-note', authAdmin, async (req, res) => {
  const { content } = req.body
  const note = await prisma.platformNote.findFirst()
  if (note) {
    await prisma.platformNote.update({ where: { id: note.id }, data: { content } })
  } else {
    await prisma.platformNote.create({ data: { content } })
  }
  return success(res, null, '更新成功')
})

module.exports = router


// ── 专区管理 ──────────────────────────────────────────────────────────────
router.get('/zones', authAdmin, async (req, res) => {
  const zones = await prisma.zone.findMany({ orderBy: { sort: 'asc' } })
  return success(res, zones.map((z) => ({ ...z, id: z.id.toString() })))
})

router.post('/zones', authAdmin, async (req, res) => {
  const { name, icon, sort } = req.body
  if (!name) return fail(res, '专区名称不能为空')
  const zone = await prisma.zone.create({ data: { name, icon: icon || null, sort: sort ? parseInt(sort) : 99 } })
  return success(res, { ...zone, id: zone.id.toString() })
})

router.put('/zones/:id', authAdmin, async (req, res) => {
  const { name, icon, sort } = req.body
  const zone = await prisma.zone.update({
    where: { id: BigInt(req.params.id) },
    data: { ...(name && { name }), ...(icon !== undefined && { icon }), ...(sort !== undefined && { sort: parseInt(sort) }) },
  })
  return success(res, { ...zone, id: zone.id.toString() })
})

router.delete('/zones/:id', authAdmin, async (req, res) => {
  await prisma.zone.delete({ where: { id: BigInt(req.params.id) } })
  return success(res, null, '删除成功')
})

