function success(res, data = null, message = 'ok', statusCode = 200) {
  return res.status(statusCode).json({ code: 0, message, data })
}

function fail(res, message = 'error', statusCode = 400, code = 1) {
  return res.status(statusCode).json({ code, message, data: null })
}

module.exports = { success, fail }
