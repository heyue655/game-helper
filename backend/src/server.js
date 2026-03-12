process.env.TZ = 'Asia/Shanghai'
require('dotenv').config()
const app = require('./app')
const { PrismaClient } = require('@prisma/client')
const redis = require('./utils/redis')
require('./cron/settlement')
const { seedDefaultBanners, seedDefaultGames, seedDefaultAdmin } = require('./bootstrap/seedDefaults')

const prisma = new PrismaClient()
const PORT = process.env.PORT || 3000

async function main() {
  await redis.connect()
  await prisma.$connect()
  console.log('[DB] connected')
  await seedDefaultBanners()
  await seedDefaultGames()
  await seedDefaultAdmin()

  app.listen(PORT, () => {
    console.log(`[Server] running on http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
