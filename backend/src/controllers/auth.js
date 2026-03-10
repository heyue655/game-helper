const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const redis = require('../utils/redis')
const { sendVerifyCode } = require('../utils/sms')
const { success, fail } = require('../utils/response')

const prisma = new PrismaClient()
const CODE_TTL = 300 // 验证码有效期5分钟

// POST /api/auth/send-code
async function sendCode(req, res) {
  const { phone } = req.body
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    return fail(res, '手机号格式不正确')
  }

  const lockKey = `sms:lock:${phone}`
  const locked = await redis.get(lockKey)
  if (locked) return fail(res, '发送太频繁，请60秒后再试')

  // TODO: 对接阿里云SMS后移除固定验证码
  const code = '123456'
  await redis.setex(`sms:code:${phone}`, CODE_TTL, code)
  await redis.setex(lockKey, 60, '1')

  return success(res, null, '验证码已发送（当前固定为 123456）')
}

// POST /api/auth/login
async function login(req, res) {
  const { phone, code } = req.body
  if (!phone || !code) return fail(res, '参数不完整')

  const storedCode = await redis.get(`sms:code:${phone}`)
  if (!storedCode || storedCode !== code) {
    return fail(res, '验证码错误或已过期')
  }

  await redis.del(`sms:code:${phone}`)

  let user = await prisma.user.findUnique({ where: { phone } })
  if (!user) {
    user = await prisma.user.create({
      data: { phone, nickname: `用户${phone.slice(-4)}` },
    })
  }

  if (user.isBlacklisted) return fail(res, '账号已被封禁', 403)

  const token = jwt.sign(
    { id: user.id.toString(), type: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  )

  return success(res, {
    token,
    user: {
      id: user.id.toString(),
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      gender: user.gender,
      age: user.age,
      game: user.game,
    },
  })
}

// POST /api/auth/admin-login
async function adminLogin(req, res) {
  const { username, password } = req.body
  if (!username || !password) return fail(res, '参数不完整')

  const admin = await prisma.admin.findUnique({ where: { username } })
  if (!admin) return fail(res, '账号或密码错误')

  const valid = await bcrypt.compare(password, admin.passwordHash)
  if (!valid) return fail(res, '账号或密码错误')

  const token = jwt.sign(
    { id: admin.id.toString(), type: 'admin', role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  )

  return success(res, {
    token,
    admin: {
      id: admin.id.toString(),
      username: admin.username,
      role: admin.role,
    },
  })
}

// PUT /api/auth/profile — 更新个人信息
async function updateProfile(req, res) {
  const { nickname, avatar, gender, age, game } = req.body
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      ...(nickname !== undefined && { nickname }),
      ...(avatar !== undefined && { avatar }),
      ...(gender !== undefined && { gender: parseInt(gender) }),
      ...(age !== undefined && { age: parseInt(age) }),
      ...(game !== undefined && { game }),
    },
  })
  return success(res, {
    id: user.id.toString(),
    phone: user.phone,
    nickname: user.nickname,
    avatar: user.avatar,
    gender: user.gender,
    age: user.age,
    game: user.game,
  })
}

// GET /api/auth/me
async function getMe(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) return fail(res, '用户不存在', 404)
  return success(res, {
    id: user.id.toString(),
    phone: user.phone,
    nickname: user.nickname,
    avatar: user.avatar,
    gender: user.gender,
    age: user.age,
    game: user.game,
  })
}

module.exports = { sendCode, login, adminLogin, updateProfile, getMe }
