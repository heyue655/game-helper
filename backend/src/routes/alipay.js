const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const { verifyNotify } = require('../utils/alipay')

const prisma = new PrismaClient()

// POST /api/alipay/notify  — 支付宝异步通知
router.post('/notify', async (req, res) => {
  const params = req.body
  try {
    const valid = verifyNotify(params)
    if (!valid) return res.send('fail')

    const { out_trade_no, trade_status, trade_no } = params

    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      const order = await prisma.order.findUnique({ where: { orderNo: out_trade_no } })
      if (order && order.status === 'PENDING_PAY') {
        await prisma.order.update({
          where: { orderNo: out_trade_no },
          data: {
            status: 'PENDING_ASSIGN',
            payTime: new Date(),
            alipayTradeNo: trade_no,
          },
        })

        // 销量+1
        await prisma.product.update({
          where: { id: order.productId },
          data: { sales: { increment: 1 } },
        })
      }
    }

    return res.send('success')
  } catch (err) {
    console.error('[Alipay notify error]', err.message)
    return res.send('fail')
  }
})

module.exports = router
