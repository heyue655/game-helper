const router = require('express').Router()
const upload = require('../middleware/upload')
const { uploadBuffer } = require('../utils/oss')
const { success, fail } = require('../utils/response')
const { authAdmin, authUser } = require('../middleware/auth')

router.post('/', authAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return fail(res, '未上传文件')
  try {
    const folder = req.query.folder || 'uploads'
    const url = await uploadBuffer(req.file.buffer, req.file.originalname, folder)
    return success(res, { url })
  } catch (err) {
    console.error('[OSS upload error]', err.message)
    return fail(res, '文件上传失败')
  }
})

router.post('/avatar', authUser, upload.single('file'), async (req, res) => {
  if (!req.file) return fail(res, '未上传文件')
  try {
    const url = await uploadBuffer(req.file.buffer, req.file.originalname, 'avatars')
    return success(res, { url })
  } catch (err) {
    console.error('[avatar upload error]', err.message)
    return fail(res, '头像上传失败')
  }
})

module.exports = router
