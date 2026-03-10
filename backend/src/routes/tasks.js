const router = require('express').Router()
const { listMyTasks } = require('../controllers/orders')
const { authUser } = require('../middleware/auth')

router.use(authUser)
router.get('/', listMyTasks)

module.exports = router
