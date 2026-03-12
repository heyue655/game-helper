const router = require('express').Router()
const multer = require('multer')
const { uploadBuffer } = require('../utils/oss')
const { success, fail } = require('../utils/response')
const { authAdmin, authUser } = require('../middleware/auth')

const simpleUpload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
})

router.post('/', authAdmin, simpleUpload.single('file'), async (req, res) => {
  console.log('[Upload] 收到上传请求')
  console.log('[Upload] Content-Type:', req.headers['content-type'])
  console.log('[Upload] file:', req.file ? { name: req.file.originalname, size: req.file.size } : null)
  console.log('[Upload] body keys:', Object.keys(req.body))

  if (!req.file) {
    return fail(res, '未上传文件')
  }

  try {
    const folder = req.query.folder || 'uploads'
    const url = await uploadBuffer(req.file.buffer, req.file.originalname, folder)
    console.log('[Upload] 上传成功, url:', url)
    return success(res, { url })
  } catch (err) {
    console.error('[Upload error]', err.message)
    return fail(res, '文件上传失败: ' + err.message)
  }
})

router.post('/avatar', authUser, simpleUpload.single('file'), async (req, res) => {
  console.log('[Upload avatar] 收到上传请求')

  if (!req.file) {
    return fail(res, '未上传文件')
  }

  try {
    const url = await uploadBuffer(req.file.buffer, req.file.originalname, 'avatars')
    console.log('[Upload avatar] 上传成功, url:', url)
    return success(res, { url })
  } catch (err) {
    console.error('[Upload avatar error]', err.message)
    return fail(res, '头像上传失败: ' + err.message)
  }
})

module.exports = router
