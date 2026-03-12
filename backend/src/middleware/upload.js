const multer = require('multer')
const path = require('path')
const crypto = require('crypto')

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']

const MAGIC_NUMBERS = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]],
}

function checkMagicNumber(buffer, mimeType) {
  const magicBytes = MAGIC_NUMBERS[mimeType]
  if (!magicBytes) return true

  return magicBytes.some((pattern) => {
    for (let i = 0; i < pattern.length; i++) {
      if (buffer[i] !== pattern[i]) return false
    }
    return true
  })
}

function sanitizeFilename(filename) {
  const ext = path.extname(filename).toLowerCase()
  const baseName = path.basename(filename, ext).replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
  const randomSuffix = crypto.randomBytes(8).toString('hex')
  return `${baseName}_${randomSuffix}${ext}`
}

const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    console.log('[Multer fileFilter] originalname:', file.originalname, 'mimetype:', file.mimetype)
    const ext = path.extname(file.originalname).toLowerCase()
    console.log('[Multer fileFilter] ext:', ext)

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      console.log('[Multer fileFilter] 拒绝: 扩展名不支持')
      return cb(new Error('不支持的文件类型，仅支持 JPG/PNG/GIF/WebP/SVG'))
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      console.log('[Multer fileFilter] 拒绝: MIME类型不支持')
      return cb(new Error('不支持的文件格式'))
    }

    console.log('[Multer fileFilter] 接受文件')
    cb(null, true)
  },
})

function validateImageBuffer(buffer, mimetype) {
  if (mimetype === 'image/svg+xml') return true
  return checkMagicNumber(buffer, mimetype)
}

module.exports = { upload, sanitizeFilename, validateImageBuffer, ALLOWED_EXTENSIONS }
