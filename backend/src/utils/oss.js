const OSS = require('ali-oss')
const path = require('path')
const dayjs = require('dayjs')

const client = new OSS({
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET,
})

/**
 * 上传文件 Buffer 到 OSS
 * @param {Buffer} buffer 文件内容
 * @param {string} originalname 原始文件名
 * @param {string} folder 存储目录，如 'products', 'avatars', 'banners'
 * @returns {Promise<string>} 文件公开访问URL
 */
async function uploadBuffer(buffer, originalname, folder = 'uploads') {
  const ext = path.extname(originalname).toLowerCase()
  const filename = `${folder}/${dayjs().format('YYYYMMDD')}/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`

  let result
  try {
    result = await client.put(filename, buffer, {
      headers: {
        // If policy allows, make objects readable directly.
        'x-oss-object-acl': 'public-read',
      },
    })
  } catch (err) {
    // Some buckets enforce "forbid public ACL". Retry upload without ACL header.
    const shouldRetryWithoutAcl =
      err?.code === 'AccessDenied' && String(err?.message || '').includes('Put public object acl is not allowed')
    if (!shouldRetryWithoutAcl) throw err
    result = await client.put(filename, buffer)
  }

  if (process.env.OSS_ENDPOINT) {
    const endpoint = process.env.OSS_ENDPOINT.replace(/^https?:\/\//, '')
    const protocol = process.env.OSS_ENDPOINT.startsWith('http://') ? 'http' : 'https'
    return `${protocol}://${process.env.OSS_BUCKET}.${endpoint}/${filename}`
  }

  return result.url
}

module.exports = { uploadBuffer }
