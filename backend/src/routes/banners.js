const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const { success } = require('../utils/response')

const prisma = new PrismaClient()

router.get('/', async (req, res) => {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { sort: 'asc' },
    take: 3,
  })
  return success(res, banners)
})

module.exports = router
