const { PrismaClient } = require('@prisma/client')
const dayjs = require('dayjs')
const { createWapPay } = require('../utils/alipay')
const { success, fail } = require('../utils/response')

const prisma = new PrismaClient()

function genOrderNo() {
  return `GH${dayjs().format('YYYYMMDDHHmmss')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
}

function serializeOrder(o) {
  return {
    id: o.id.toString(),
    orderNo: o.orderNo,
    productId: o.productId.toString(),
    productName: o.productName,
    spec: o.spec,
    price: Number(o.price),
    status: o.status,
    assigneeId: o.assigneeId?.toString() || null,
    assignee: o.assignee
      ? { id: o.assignee.id.toString(), nickname: o.assignee.nickname, avatar: o.assignee.avatar }
      : null,
    product: o.product
      ? {
          id: o.product.id.toString(),
          name: o.product.name,
          thumbnail: o.product.thumbnail,
        }
      : null,
    isComplained: o.isComplained,
    payTime: o.payTime,
    deliverTime: o.deliverTime,
    completedAt: o.completedAt,
    createdAt: o.createdAt,
  }
}

// POST /api/orders  — 创建订单并返回支付宝支付链接
async function createOrder(req, res) {
  const { productId, spec } = req.body
  if (!productId) return fail(res, '请选择商品')

  const product = await prisma.product.findUnique({ where: { id: BigInt(productId) } })
  if (!product || product.status === 'OFF') return fail(res, '商品不存在或已下架', 404)

  // 检查用户是否被拉黑
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (user?.isBlacklisted) return fail(res, '账号已被封禁，无法下单', 403)

  const orderNo = genOrderNo()

  const order = await prisma.order.create({
    data: {
      orderNo,
      userId: req.userId,
      productId: product.id,
      productName: product.name,
      spec: spec || '',
      price: product.price,
      status: 'PENDING_PAY',
    },
  })

  let payUrl = null
  try {
    payUrl = await createWapPay({
      orderNo,
      subject: product.name,
      totalAmount: Number(product.price).toFixed(2),
    })
  } catch (err) {
    console.error('[Alipay createWapPay error]', err.message)
  }

  return success(res, {
    orderId: order.id.toString(),
    orderNo,
    payUrl,
  })
}

// GET /api/orders  — 我的订单列表
async function listOrders(req, res) {
  const { status, page = 1, pageSize = 10 } = req.query
  const skip = (parseInt(page) - 1) * parseInt(pageSize)

  const where = {
    userId: req.userId,
    ...(status && status !== 'ALL' && { status }),
  }

  const [total, items] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: parseInt(pageSize),
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, thumbnail: true } },
        assignee: { select: { id: true, nickname: true, avatar: true } },
      },
    }),
  ])

  return success(res, {
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    items: items.map(serializeOrder),
  })
}

// GET /api/orders/:id  — 订单详情
async function getOrder(req, res) {
  const order = await prisma.order.findFirst({
    where: {
      id: BigInt(req.params.id),
      OR: [{ userId: req.userId }, { assigneeId: req.userId }],
    },
    include: {
      product: { select: { id: true, name: true, thumbnail: true } },
      assignee: { select: { id: true, nickname: true, avatar: true } },
      complaint: true,
    },
  })
  if (!order) return fail(res, '订单不存在', 404)
  return success(res, serializeOrder(order))
}


// POST /api/orders/:id/deliver  — 接单人交单（PENDING_DELIVERY → COMPLETED）
async function deliverOrder(req, res) {
  const order = await prisma.order.findFirst({
    where: { id: BigInt(req.params.id), assigneeId: req.userId, status: 'PENDING_DELIVERY' },
  })
  if (!order) return fail(res, '订单不存在或状态不正确', 404)

  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'COMPLETED', deliverTime: new Date(), completedAt: new Date() },
  })
  return success(res, null, '交单成功')
}
// POST /api/orders/:id/review  — 用户评论（待评论 -> 已完成）
async function reviewOrder(req, res) {
  const order = await prisma.order.findFirst({
    where: { id: BigInt(req.params.id), userId: req.userId, status: 'PENDING_REVIEW' },
  })
  if (!order) return fail(res, '订单不存在或状态不正确', 404)

  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'COMPLETED', completedAt: new Date() },
  })
  return success(res, null, '评论成功')
}

// POST /api/orders/:id/complaint  — 投诉（已完成的订单）
async function complainOrder(req, res) {
  const { reason } = req.body
  if (!reason?.trim()) return fail(res, '请填写投诉原因')

  const order = await prisma.order.findFirst({
    where: { id: BigInt(req.params.id), userId: req.userId, status: 'COMPLETED' },
  })
  if (!order) return fail(res, '仅可对已完成订单发起投诉', 400)
  if (order.isComplained) return fail(res, '该订单已投诉')

  await prisma.$transaction([
    prisma.complaint.create({
      data: { orderId: order.id, userId: req.userId, reason: reason.trim() },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: { isComplained: true },
    }),
  ])

  return success(res, null, '投诉已提交')
}


// POST /api/orders/:id/mock-pay  — 模拟支付（支付宝未配置时使用）
async function mockPayOrder(req, res) {
  const order = await prisma.order.findFirst({
    where: { id: BigInt(req.params.id), userId: req.userId, status: 'PENDING_PAY' },
  })
  if (!order) return fail(res, '订单不存在或状态不正确', 404)

  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'PENDING_ASSIGN', payTime: new Date() },
  })
  return success(res, null, '支付成功')
}

// GET /api/orders/counts — 当前用户各状态订单数 + 接单人待交单数
async function getOrderCounts(req, res) {
  const [pendingPay, pendingAssign, pendingDelivery, taskCount] = await Promise.all([
    prisma.order.count({ where: { userId: req.userId, status: 'PENDING_PAY' } }),
    prisma.order.count({ where: { userId: req.userId, status: 'PENDING_ASSIGN' } }),
    prisma.order.count({ where: { userId: req.userId, status: 'PENDING_DELIVERY' } }),
    prisma.order.count({ where: { assigneeId: req.userId, status: 'PENDING_DELIVERY' } }),
  ])
  return success(res, {
    PENDING_PAY: pendingPay,
    PENDING_ASSIGN: pendingAssign,
    PENDING_DELIVERY: pendingDelivery,
    taskPendingDelivery: taskCount,
  })
}

// GET /api/tasks — 接单人视角：分配给我的任务（待交单 + 已完成）
async function listMyTasks(req, res) {
  const { page = 1, pageSize = 50 } = req.query
  const skip = (parseInt(page) - 1) * parseInt(pageSize)
  const where = { assigneeId: req.userId, status: { in: ['PENDING_DELIVERY', 'COMPLETED'] } }
  const [total, items] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: parseInt(pageSize),
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, thumbnail: true } },
        assignee: { select: { id: true, nickname: true, avatar: true } },
      },
    }),
  ])
  return success(res, { total, items: items.map(serializeOrder) })
}

// POST /api/orders/:id/close — 超时关闭待付款订单
async function closeOrder(req, res) {
  const order = await prisma.order.findFirst({
    where: { id: BigInt(req.params.id), userId: req.userId, status: 'PENDING_PAY' },
  })
  if (!order) return fail(res, '订单不存在或状态不正确', 404)

  const expireAt = new Date(order.createdAt.getTime() + 30 * 60 * 1000)
  if (new Date() < expireAt) return fail(res, '订单尚未超时', 400)

  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'CLOSED' },
  })
  return success(res, null, '订单已关闭')
}
module.exports = { createOrder, listOrders, getOrder, deliverOrder, reviewOrder, complainOrder, mockPayOrder, getOrderCounts, listMyTasks, closeOrder }




