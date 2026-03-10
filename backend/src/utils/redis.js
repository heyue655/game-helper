const Redis = require('ioredis')

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 100, 3000),
})

redis.on('error', (err) => {
  console.error('[Redis] connection error:', err.message)
})

redis.on('connect', () => {
  console.log('[Redis] connected')
})

module.exports = redis
