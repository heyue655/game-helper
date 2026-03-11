const router = require('express').Router()
const { createOrder, listOrders, getOrder, getOrderByNo, deliverOrder, reviewOrder, complainOrder, mockPayOrder, getOrderCounts, listMyTasks, closeOrder, getMyEarnings } = require('../controllers/orders')
const { authUser } = require('../middleware/auth')

router.use(authUser)
router.post('/', createOrder)
router.get('/counts', getOrderCounts)
router.get('/earnings', getMyEarnings)
router.get('/by-no/:orderNo', getOrderByNo)
router.get('/', listOrders)
router.get('/:id', getOrder)
router.post('/:id/close', closeOrder)
router.post('/:id/mock-pay', mockPayOrder)
router.post('/:id/deliver', deliverOrder)
router.post('/:id/review', reviewOrder)
router.post('/:id/complaint', complainOrder)

module.exports = router
