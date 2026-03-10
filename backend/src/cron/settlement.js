const cron = require('node-cron')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// 每5分钟执行一次：将已完成超2小时且未被投诉的订单自动转为待结算
cron.schedule('*/5 * * * *', async () => {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)

    // 兼容 completedAt 为 null 的情况（以 deliverTime 作为兜底判断时间）
    const result = await prisma.order.updateMany({
      where: {
        status: 'COMPLETED',
        isComplained: false,
        OR: [
          { completedAt: { lte: twoHoursAgo } },
          { completedAt: null, deliverTime: { lte: twoHoursAgo } },
        ],
      },
      data: { status: 'PENDING_SETTLEMENT' },
    })

    if (result.count > 0) {
      console.log(`[Cron] Auto-settlement: ${result.count} orders moved to PENDING_SETTLEMENT`)
    }
  } catch (err) {
    console.error('[Cron] settlement error:', err.message)
  }
})

console.log('[Cron] settlement job registered')
