const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const { verifyNotify } = require('../utils/alipay')

const prisma = new PrismaClient()

// 处理中的订单（防止并发重复处理）
const processingOrders = new Set()

// POST /api/alipay/notify  — 支付宝异步通知
router.all('/notify', async (req, res) => {
  // 支付宝可能通过 GET 或 POST 发送通知，参数在 query 或 body 中
  const params = { ...req.query, ...req.body }
  console.log('[Alipay Notify] 收到回调, method:', req.method)
  console.log('[Alipay Notify] params:', JSON.stringify(params))

  try {
    // 验证签名
    const valid = verifyNotify(params)
    console.log('[Alipay Notify] 签名验证结果:', valid)

    if (!valid) {
      console.error('[Alipay Notify] 签名验证失败')
      return res.send('fail')
    }

    const { out_trade_no, trade_status, trade_no, total_amount } = params
    console.log(`[Alipay Notify] 订单号: ${out_trade_no}, 状态: ${trade_status}, 交易号: ${trade_no}, 金额: ${total_amount}`)

    // 只处理支付成功的状态
    if (trade_status !== 'TRADE_SUCCESS' && trade_status !== 'TRADE_FINISHED') {
      console.log('[Alipay Notify] 非支付成功状态，忽略')
      return res.send('success')
    }

    // 查询订单
    const order = await prisma.order.findUnique({ where: { orderNo: out_trade_no } })
    if (!order) {
      console.error('[Alipay Notify] 订单不存在:', out_trade_no)
      return res.send('fail')
    }

    console.log('[Alipay Notify] 当前订单状态:', order.status)

    // 已支付或更晚状态，直接返回成功（幂等）
    if (order.status !== 'PENDING_PAY') {
      console.log('[Alipay Notify] 订单已处理过，跳过')
      return res.send('success')
    }

    // 防止并发重复处理
    if (processingOrders.has(out_trade_no)) {
      console.log('[Alipay Notify] 订单正在处理中，跳过')
      return res.send('success')
    }

    processingOrders.add(out_trade_no)

    try {
      // 更新订单状态
      await prisma.order.update({
        where: { orderNo: out_trade_no },
        data: {
          status: 'PENDING_ASSIGN',
          payTime: new Date(),
          alipayTradeNo: trade_no,
        },
      })
      console.log('[Alipay Notify] 订单状态更新成功:', out_trade_no)

      // 销量+1
      await prisma.product.update({
        where: { id: order.productId },
        data: { sales: { increment: 1 } },
      })
      console.log('[Alipay Notify] 商品销量更新成功, productId:', order.productId)

      return res.send('success')
    } finally {
      processingOrders.delete(out_trade_no)
    }
  } catch (err) {
    console.error('[Alipay Notify] 处理异常:', err.message, err.stack)
    return res.send('fail')
  }
})

module.exports = router
