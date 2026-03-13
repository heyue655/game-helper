const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearAllData() {
  console.log('开始清空数据...')

  try {
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`

    await prisma.authCode.deleteMany({})
    console.log('✓ auth_codes 已清空')

    await prisma.complaint.deleteMany({})
    console.log('✓ complaints 已清空')

    await prisma.favorite.deleteMany({})
    console.log('✓ favorites 已清空')

    await prisma.order.deleteMany({})
    console.log('✓ orders 已清空')

    await prisma.productZone.deleteMany({})
    console.log('✓ product_zones 已清空')

    await prisma.product.deleteMany({})
    console.log('✓ products 已清空')

    await prisma.banner.deleteMany({})
    console.log('✓ banners 已清空')

    await prisma.zone.deleteMany({})
    console.log('✓ zones 已清空')

    await prisma.game.deleteMany({})
    console.log('✓ games 已清空')

    await prisma.user.deleteMany({})
    console.log('✓ users 已清空')

    await prisma.admin.deleteMany({})
    console.log('✓ admins 已清空')

    await prisma.platformNote.deleteMany({})
    console.log('✓ platform_notes 已清空')

    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`

    console.log('\n所有表数据已清空！')
  } catch (err) {
    console.error('清空数据失败:', err)
  } finally {
    await prisma.$disconnect()
  }
}

clearAllData()
