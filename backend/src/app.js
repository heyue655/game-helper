require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/static', express.static(path.join(__dirname, '..', 'public')))

// 路由
app.use('/api/auth', require('./routes/auth'))
app.use('/api/products', require('./routes/products'))
app.use('/api/games', require('./routes/games'))
app.use('/api/zones', require('./routes/zones'))
app.use('/api/banners', require('./routes/banners'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/tasks', require('./routes/tasks'))
app.use('/api/favorites', require('./routes/favorites'))
app.use('/api/alipay', require('./routes/alipay'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/upload', require('./routes/upload'))

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.message, err.stack)

  // Multer 错误处理
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ code: 400, message: '文件大小超出限制（最大10MB）', data: null })
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ code: 400, message: '意外的文件字段', data: null })
  }
  if (err.message && err.message.includes('不支持的文件')) {
    return res.status(400).json({ code: 400, message: err.message, data: null })
  }

  res.status(500).json({ code: 500, message: err.message || '服务器内部错误', data: null })
})

module.exports = app
