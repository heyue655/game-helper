const router = require('express').Router()
const { sendCode, login, adminLogin, updateProfile, getMe, silentLogin, checkDevice, exchangeCode, bindPhone } = require('../controllers/auth')
const { authUser } = require('../middleware/auth')

router.post('/send-code', sendCode)
router.post('/login', login)
router.post('/admin-login', adminLogin)
router.post('/silent', silentLogin)
router.post('/check-device', checkDevice)
router.post('/exchange', exchangeCode)
router.post('/bind-phone', authUser, bindPhone)
router.get('/me', authUser, getMe)
router.put('/profile', authUser, updateProfile)

module.exports = router
