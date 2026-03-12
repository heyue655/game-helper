const Core = require('@alicloud/pop-core')

console.log('[SMS] 初始化 SDK')
console.log('[SMS] accessKeyId:', process.env.SMS_ACCESS_KEY_ID ? '已配置' : '未配置')
console.log('[SMS] accessKeySecret:', process.env.SMS_ACCESS_KEY_SECRET ? '已配置' : '未配置')
console.log('[SMS] signName:', process.env.SMS_SIGN_NAME)
console.log('[SMS] templateCode:', process.env.SMS_TEMPLATE_CODE)

const client = new Core({
  accessKeyId: process.env.SMS_ACCESS_KEY_ID,
  accessKeySecret: process.env.SMS_ACCESS_KEY_SECRET,
  endpoint: 'https://dysmsapi.aliyuncs.com',
  apiVersion: '2017-05-25',
})

/**
 * 发送短信验证码
 * @param {string} phone 手机号
 * @param {string} code 验证码
 */
async function sendVerifyCode(phone, code) {
  const params = {
    PhoneNumbers: phone,
    SignName: process.env.SMS_SIGN_NAME,
    TemplateCode: process.env.SMS_TEMPLATE_CODE,
    TemplateParam: JSON.stringify({ code }),
  }

  console.log('[SMS] 请求参数:', JSON.stringify(params, null, 2))

  const requestOption = {
    method: 'POST',
    formatParams: false,
  }

  try {
    const result = await client.request('SendSms', params, requestOption)
    console.log('[SMS] 响应结果:', JSON.stringify(result, null, 2))
    return result
  } catch (err) {
    console.error('[SMS] 调用失败:', err.message)
    console.error('[SMS] 错误详情:', err.code, err.data)
    throw err
  }
}

module.exports = { sendVerifyCode }
