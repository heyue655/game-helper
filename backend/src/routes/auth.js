const router = require('express').Router()
const { sendCode, login, adminLogin, updateProfile, getMe } = require('../controllers/auth')
const { authUser } = require('../middleware/auth')

router.post('/send-code', sendCode)
router.post('/login', login)
router.post('/admin-login', adminLogin)
router.get('/me', authUser, getMe)
router.put('/profile', authUser, updateProfile)

module.exports = router
