const { AlipaySdk, AlipayFormData } = require('alipay-sdk')

let sdk = null

function getClient() {
  if (!sdk) {
    sdk = new AlipaySdk({
      appId: process.env.ALIPAY_APP_ID,
      privateKey: process.env.ALIPAY_PRIVATE_KEY,
      alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
      gateway: 'https://openapi.alipay.com/gateway.do',
      signType: 'RSA2',
    })
  }
  return sdk
}

/**
 * 创建手机网页支付表单（WAP支付）
 * @param {object} params 订单参数
 * @param {string} params.orderNo 订单号
 * @param {string} params.subject 商品标题
 * @param {string} params.totalAmount 金额（字符串，精确到分）
 * @returns {Promise<string>} 支付宝支付页面 HTML 表单字符串
 */
async function createWapPay({ orderNo, subject, totalAmount }) {
  const client = getClient()
  const formData = new AlipayFormData()
  formData.setMethod('get')
  formData.addField('notifyUrl', process.env.ALIPAY_NOTIFY_URL)
  formData.addField('returnUrl', process.env.ALIPAY_RETURN_URL)
  formData.addField('bizContent', {
    outTradeNo: orderNo,
    productCode: 'QUICK_WAP_WAY',
    totalAmount,
    subject,
  })

  const result = await client.exec(
    'alipay.trade.wap.pay',
    {},
    formData,
  )
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
