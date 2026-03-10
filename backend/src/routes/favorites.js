const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const { success, fail } = require('../utils/response')
const { authUser } = require('../middleware/auth')

const prisma = new PrismaClient()

// GET /api/favorites  — 我的收藏列表
router.get('/', authUser, async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query
  const skip = (parseInt(page) - 1) * parseInt(pageSize)

  const [total, items] = await Promise.all([
    prisma.favorite.count({ where: { userId: req.userId } }),
    prisma.favorite.findMany({
      where: { userId: req.userId },
      skip,
      take: parseInt(pageSize),
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            thumbnail: true,
            price: true,
            originalPrice: true,
            status: true,
          },
        },
      },
    }),
  ])

  return success(res, {
    total,
    items: items.map((f) => ({
      id: f.id.toString(),
      productId: f.productId.toString(),
      product: {
        ...f.product,
        id: f.product.id.toString(),
        price: Number(f.product.price),
        originalPrice: Number(f.product.originalPrice),
      },
      createdAt: f.createdAt,
    })),
  })
})

// POST /api/favorites/:productId — 收藏/取消收藏（toggle）
router.post('/:productId', authUser, async (req, res) => {
  const productId = BigInt(req.params.productId)
  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: req.userId, productId } },
  })

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } })
    return success(res, { favorited: false })
  } else {
    await prisma.favorite.create({ data: { userId: req.userId, productId } })
    return success(res, { favorited: true })
  }
})

// GET /api/favorites/check/:productId — 检查是否已收藏
router.get('/check/:productId', authUser, async (req, res) => {
  const productId = BigInt(req.params.productId)
  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: req.userId, productId } },
  })
  return success(res, { favorited: !!existing })
})

module.exports = router
