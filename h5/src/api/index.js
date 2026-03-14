import request from './request'

// 认证
export const sendCode = (phone) => request.post('/auth/send-code', { phone })
export const login = (phone, code, from, deviceId) => request.post('/auth/login', { phone, code, from, deviceId })
export const silentLogin = (deviceId) => request.post('/auth/silent', { deviceId })
export const checkDevice = (deviceId) => request.post('/auth/check-device', { deviceId })
export const exchangeCode = (code) => request.post('/auth/exchange', { code })
export const bindPhone = (phone, code) => request.post('/auth/bind-phone', { phone, code })
export const getMe = () => request.get('/auth/me')
export const updateProfile = (data) => request.put('/auth/profile', data)
export const uploadAvatar = (file) => {
  const form = new FormData()
  form.append('file', file)
  return request.post('/upload/avatar', form)
}

// 商品
export const getProducts = (params) => request.get('/products', { params })
export const getProduct = (id) => request.get(`/products/${id}`)
export const getPlatformNote = () => request.get('/products/platform-note')

// 专区
export const getZones = () => request.get('/zones')
export const getGames = () => request.get('/games')

// Banner
export const getBanners = () => request.get('/banners')

// 订单
export const createOrder = (data) => request.post('/orders', data)
export const getOrderCounts = () => request.get('/orders/counts')
export const getOrders = (params) => request.get('/orders', { params })
export const getOrder = (id) => request.get(`/orders/${id}`)
export const getOrderPayUrl = (id) => request.get(`/orders/${id}/pay-url`)
export const getOrderByNo = (orderNo) => request.get(`/orders/by-no/${orderNo}`)
export const closeOrder = (id) => request.post(`/orders/${id}/close`)
export const deliverOrder = (id) => request.post(`/orders/${id}/deliver`)
export const reviewOrder = (id) => request.post(`/orders/${id}/review`)
export const complainOrder = (id, reason) => request.post(`/orders/${id}/complaint`, { reason })

// 我的任务（接单人视角）
export const getMyTasks = (params) => request.get('/tasks', { params })
export const getMyEarnings = (params) => request.get('/orders/earnings', { params })

// 收藏
export const getFavorites = (params) => request.get('/favorites', { params })
export const toggleFavorite = (productId) => request.post(`/favorites/${productId}`)
export const checkFavorite = (productId) => request.get(`/favorites/check/${productId}`)
