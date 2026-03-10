const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const DEFAULT_BANNERS = [
  {
    imageUrl: '/static/banners/banner-hok.svg',
    link: '/zone?game=honor-of-kings',
    sort: 1,
    isActive: true,
  },
  {
    imageUrl: '/static/banners/banner-lol.svg',
    link: '/zone?game=league-of-legends',
    sort: 2,
    isActive: true,
  },
  {
    imageUrl: '/static/banners/banner-delta.svg',
    link: '/zone?game=delta-force',
    sort: 3,
    isActive: true,
  },
]

const DEFAULT_GAMES = [
  { name: '三角洲', sort: 1, isActive: true },
  { name: '王者荣耀', sort: 2, isActive: true },
  { name: '英雄联盟', sort: 3, isActive: true },
  { name: '原神', sort: 4, isActive: true },
  { name: '和平精英', sort: 5, isActive: true },
]

async function seedDefaultBanners() {
  const count = await prisma.banner.count()
  if (count > 0) return
  await prisma.banner.createMany({ data: DEFAULT_BANNERS })
  console.log('[Seed] default banners created')
}

async function seedDefaultGames() {
  try {
    const count = await prisma.game.count()
    if (count > 0) return
    await prisma.game.createMany({ data: DEFAULT_GAMES })
    console.log('[Seed] default games created')
  } catch (err) {
    console.warn('[Seed] default games skipped:', err.message)
  }
}



async function seedDefaultAdmin() {
  try {
    const bcrypt = require('bcrypt')
    const existing = await prisma.admin.findUnique({ where: { username: 'admin' } })
    if (existing) {
      if (existing.role !== 'SUPER') {
        await prisma.admin.update({ where: { username: 'admin' }, data: { role: 'SUPER' } })
        console.log('[Seed] admin upgraded to SUPER')
      }
      return
    }
    const passwordHash = await bcrypt.hash('admin123', 10)
    await prisma.admin.create({ data: { username: 'admin', passwordHash, role: 'SUPER' } })
    console.log('[Seed] default SUPER admin created (admin / admin123)')
  } catch (err) {
    console.warn('[Seed] seedDefaultAdmin skipped:', err.message)
  }
}
module.exports = { seedDefaultBanners, seedDefaultGames, seedDefaultAdmin }

