const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const { success } = require('../utils/response')

const prisma = new PrismaClient()

router.get('/', async (req, res) => {
  const games = await prisma.game.findMany({
    where: { isActive: true },
    orderBy: [{ sort: 'asc' }, { id: 'asc' }],
  })
  return success(res, games)
})

module.exports = router
