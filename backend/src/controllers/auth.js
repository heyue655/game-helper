const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const redis = require('../utils/redis')
const { sendVerifyCode } = require('../utils/sms')
const { success, fail } = require('../utils/response')

const prisma = new PrismaClient()
const CODE_TTL = 300
const AUTH_CODE_TTL = 15 * 60 * 1000

// POST /api/auth/send-code
async function sendCode(req, res) {
  const { phone } = req.body
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    return fail(res, '手机号格式不正确')
  }

  const lockKey = `sms:lock:${phone}`
  const locked = await redis.get(lockKey)
  if (locked) return fail(res, '发送太频繁，请60秒后再试')

  const code = String(Math.floor(100000 + Math.random() * 900000))
  
  try {
    console.log('[SMS] 发送验证码, phone:', phone, 'code:', code)
    await sendVerifyCode(phone, code)
    console.log('[SMS] 发送成功, phone:', phone)
    await redis.setex(`sms:code:${phone}`, CODE_TTL, code)
    await redis.setex(lockKey, 60, '1')
    return success(res, null, '验证码已发送')
  } catch (err) {
    console.error('[SMS] 发送失败:', err.message, err.data || '')
    return fail(res, '验证码发送失败，请稍后重试')
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { phone, code, deviceId } = req.body
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

  if (deviceId) {
    const existingUser = await prisma.user.findUnique({ where: { deviceId } })
    if (existingUser && existingUser.id !== user.id) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { deviceId: null },
      })
    }
    user = await prisma.user.update({
      where: { id: user.id },
      data: { deviceId },
    })
  }

  const token = jwt.sign(
    { id: user.id.toString(), type: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  )

  return success(res, {
    token,
    user: formatUser(user),
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
    deviceId: user.deviceId,
    nickname: user.nickname,
    avatar: user.avatar,
    gender: user.gender,
    age: user.age,
    game: user.game,
  })
}

function formatUser(user) {
  return {
    id: user.id.toString(),
    phone: user.phone,
    deviceId: user.deviceId,
    nickname: user.nickname,
    avatar: user.avatar,
    gender: user.gender,
    age: user.age,
    game: user.game,
  }
}

// POST /api/auth/check-device
async function checkDevice(req, res) {
  const { deviceId } = req.body
  if (!deviceId) return fail(res, 'deviceId 必填')

  const user = await prisma.user.findUnique({ where: { deviceId } })
  if (!user) return success(res, { exists: false })

  return success(res, {
    exists: true,
    hasPhone: !!user.phone,
    user: user.phone ? formatUser(user) : null,
  })
}

// POST /api/auth/silent
async function silentLogin(req, res) {
  const { deviceId } = req.body
  if (!deviceId) return fail(res, 'deviceId 必填')

  let user = await prisma.user.findUnique({ where: { deviceId } })
  let isNewUser = false

  if (!user) {
    user = await prisma.user.create({
      data: {
        deviceId,
        nickname: `用户${deviceId.slice(-6)}`,
      },
    })
    isNewUser = true
  }

  if (user.isBlacklisted) return fail(res, '账号已被封禁', 403)

  const token = jwt.sign(
    { id: user.id.toString(), type: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' },
  )

  console.log('[silentLogin] deviceId:', deviceId, 'userId:', user.id.toString(), 'phone:', user.phone, 'isNewUser:', isNewUser)
  return success(res, { token, user: formatUser(user), isNewUser })
}

// POST /api/auth/exchange
async function exchangeCode(req, res) {
  const { code } = req.body
  if (!code) return fail(res, '授权码必填')

  const authCode = await prisma.authCode.findUnique({ 
    where: { code },
    include: { user: true }
  })

  if (!authCode) return fail(res, '授权码无效', 401)
  if (authCode.expiresAt < new Date()) return fail(res, '授权码已过期', 401)
  if (authCode.user.isBlacklisted) return fail(res, '账号已被封禁', 403)

  await prisma.authCode.delete({ where: { code } })

  const token = jwt.sign(
    { id: authCode.user.id.toString(), type: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' },
  )

  return success(res, { token, user: formatUser(authCode.user) })
}

async function createAuthCode(userId, orderId = null) {
  const code = crypto.randomBytes(32).toString('hex')
  await prisma.authCode.create({
    data: {
      code,
      userId,
      orderId,
      expiresAt: new Date(Date.now() + AUTH_CODE_TTL),
    },
  })
  return code
}

async function bindPhone(req, res) {
  const { phone, code } = req.body
  if (!phone || !code) return fail(res, '参数不完整')
  if (!/^1[3-9]\d{9}$/.test(phone)) return fail(res, '手机号格式不正确')

  const storedCode = await redis.get(`sms:code:${phone}`)
  if (!storedCode || storedCode !== code) {
    return fail(res, '验证码错误或已过期')
  }

  await redis.del(`sms:code:${phone}`)

  const existingUser = await prisma.user.findUnique({ where: { phone } })
  if (existingUser && existingUser.id.toString() !== req.userId.toString()) {
    return fail(res, '该手机号已被其他账号绑定')
  }

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { phone },
  })

  return success(res, formatUser(user))
}

module.exports = { 
  sendCode, 
  login, 
  adminLogin, 
  updateProfile, 
  getMe,
  silentLogin,
  checkDevice,
  exchangeCode, 
  bindPhone, 
  createAuthCode,
}
