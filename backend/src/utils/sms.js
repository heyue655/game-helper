const Core = require('@alicloud/pop-core')

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

  const requestOption = {
    method: 'POST',
    formatParams: false,
  }

  return client.request('SendSms', params, requestOption)
}

module.exports = { sendVerifyCode }
