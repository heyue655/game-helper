const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const { success } = require('../utils/response')

const prisma = new PrismaClient()

router.get('/', async (req, res) => {
  const zones = await prisma.zone.findMany({ orderBy: { sort: 'asc' } })
  return success(res, zones)
})

module.exports = router
