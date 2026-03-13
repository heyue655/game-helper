const { AlipaySdk } = require('alipay-sdk')

let sdk = null

function getClient() {
  if (!sdk) {
    const gateway = process.env.ALIPAY_SANDBOX === 'true' ? 'https://openapi.alipaydev.com/gateway.do' : 'https://openapi.alipay.com/gateway.do'
    console.log('[Alipay] Initializing SDK (密钥模式), gateway:', gateway)

    try {
      sdk = new AlipaySdk({
        appId: process.env.ALIPAY_APP_ID,
        privateKey: process.env.ALIPAY_PRIVATE_KEY,
        alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
        gateway: gateway,
        signType: 'RSA2',
        keyType: 'PKCS1',
      })
      console.log('[Alipay] SDK initialized successfully')
    } catch (err) {
      console.error('[Alipay] SDK init error:', err.message)
      throw err
    }
  }
  return sdk
}

/**
 * 创建手机网页支付表单（WAP支付）
 * @param {object} params 订单参数
 * @param {string} params.orderNo 订单号
 * @param {string} params.subject 商品标题
 * @param {string} params.totalAmount 金额（字符串，精确到分）
 * @param {string} [params.returnUrl] 自定义返回URL（可选）
 * @returns {string} 支付宝支付页面 URL
 */
function createWapPay({ orderNo, subject, totalAmount, returnUrl }) {
  const client = getClient()

  const result = client.pageExec('alipay.trade.wap.pay', 'GET', {
    bizContent: {
      outTradeNo: orderNo,
      productCode: 'QUICK_WAP_WAY',
      totalAmount,
      subject,
      timeoutExpress: '30m',
    },
    returnUrl: returnUrl || process.env.ALIPAY_RETURN_URL,
    notifyUrl: process.env.ALIPAY_NOTIFY_URL,
  })

  console.log('[Alipay] pageExec result length:', result?.length)
  return result
}

/**
 * 验证支付宝异步通知签名
 */
function verifyNotify(params) {
  const client = getClient()
  return client.checkNotifySign(params)
}

module.exports = { createWapPay, verifyNotify }
