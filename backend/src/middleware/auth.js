const jwt = require('jsonwebtoken')
const { fail } = require('../utils/response')

function authUser(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return fail(res, '请先登录', 401)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (payload.type !== 'user') return fail(res, '无权限', 403)
    req.userId = BigInt(payload.id)
    next()
  } catch {
    fail(res, 'token 已过期，请重新登录', 401)
  }
}

function authAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return fail(res, '请先登录', 401)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (payload.type !== 'admin') return fail(res, '无权限', 403)
    req.adminId = BigInt(payload.id)
    req.adminRole = payload.role
    next()
  } catch {
    fail(res, 'token 已过期，请重新登录', 401)
  }
}

function authSuper(req, res, next) {
  authAdmin(req, res, () => {
    if (req.adminRole !== 'SUPER') return fail(res, '需要超级管理员权限', 403)
    next()
  })
}

module.exports = { authUser, authAdmin, authSuper }
