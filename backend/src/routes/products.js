const router = require('express').Router()
const { listProducts, getProduct, getPlatformNote } = require('../controllers/products')

router.get('/', listProducts)
router.get('/platform-note', getPlatformNote)
router.get('/:id', getProduct)

module.exports = router
