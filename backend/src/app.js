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
  console.error(err)
  res.status(500).json({ code: 500, message: err.message || '服务器内部错误', data: null })
})

module.exports = app
