const { PrismaClient } = require('@prisma/client')
const { success, fail } = require('../utils/response')

const prisma = new PrismaClient()

function serializeProduct(p) {
  return {
    id: p.id.toString(),
    gameName: p.gameName,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    originalPrice: Number(p.originalPrice),
    thumbnail: p.thumbnail,
    images: p.images || [],
    specs: p.specs || [],
    detailContent: p.detailContent,
    status: p.status,
    sales: p.sales,
    views: p.views,
    zones: (p.productZones || []).map((pz) => ({
      id: pz.zone.id,
      name: pz.zone.name,
    })),
    createdAt: p.createdAt,
  }
}

// GET /api/products
async function listProducts(req, res) {
  const { keyword, gameName, zoneId, page = 1, pageSize = 6 } = req.query
  const skip = (parseInt(page) - 1) * parseInt(pageSize)

  const where = {
    status: 'ON',
    ...(keyword && { name: { contains: keyword } }),
    ...(gameName && { gameName: { contains: gameName } }),
    ...(zoneId && {
      productZones: { some: { zoneId: parseInt(zoneId) } },
    }),
  }

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
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    items: items.map(serializeProduct),
  })
}

// GET /api/products/:id
async function getProduct(req, res) {
  const id = BigInt(req.params.id)
  const product = await prisma.product.findUnique({
    where: { id },
    include: { productZones: { include: { zone: true } } },
  })
  if (!product || product.status === 'OFF') return fail(res, '商品不存在', 404)

  // 浏览量+1（异步，不影响响应）
  prisma.product.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {})

  return success(res, serializeProduct(product))
}

// GET /api/products/platform-note
async function getPlatformNote(req, res) {
  const note = await prisma.platformNote.findFirst()
  return success(res, { content: note?.content || '' })
}

module.exports = { listProducts, getProduct, getPlatformNote }
