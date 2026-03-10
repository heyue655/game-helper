import request from './request'

// 认证
export const adminLogin = (data) => request.post('/auth/admin-login', data)

// 看板
export const getDashboard = () => request.get('/admin/dashboard')

// 商品管理
export const getAdminProducts = (params) => request.get('/admin/products', { params })
export const createProduct = (data) => request.post('/admin/products', data)
export const updateProduct = (id, data) => request.put(`/admin/products/${id}`, data)
export const setProductStatus = (id, status) => request.patch(`/admin/products/${id}/status`, { status })
export const deleteProduct = (id) => request.delete(`/admin/products/${id}`)

// 订单管理
export const getAdminOrders = (params) => request.get('/admin/orders', { params })
export const assignOrder = (id, assigneeId) => request.post(`/admin/orders/${id}/assign`, { assigneeId })
export const deliverOrder = (id) => request.post(`/admin/orders/${id}/deliver`)
export const settleOrder = (id) => request.post(`/admin/orders/${id}/settle`)

// 玩家管理
export const getAdminUsers = (params) => request.get('/admin/users', { params })
export const setBlacklist = (id, blacklisted) => request.patch(`/admin/users/${id}/blacklist`, { blacklisted })

// 系统管理
export const getAdmins = () => request.get('/admin/admins')
export const createAdmin = (data) => request.post('/admin/admins', data)
export const deleteAdmin = (id) => request.delete(`/admin/admins/${id}`)

// 内置玩家（分配用）
export const getBuiltinPlayers = () => request.get('/admin/builtin-players')

// Banner 管理
export const getAdminBanners = () => request.get('/admin/banners')
export const createBanner = (data) => request.post('/admin/banners', data)
export const updateBanner = (id, data) => request.put(`/admin/banners/${id}`, data)
export const deleteBanner = (id) => request.delete(`/admin/banners/${id}`)

// 游戏管理
export const getAdminGames = () => request.get('/admin/games')
export const createGame = (data) => request.post('/admin/games', data)
export const updateGame = (id, data) => request.put(`/admin/games/${id}`, data)
export const deleteGame = (id) => request.delete(`/admin/games/${id}`)

// 专区管理
export const getZones = () => request.get('/zones')
export const getAdminZones = () => request.get('/admin/zones')
export const createZone = (data) => request.post('/admin/zones', data)
export const updateZone = (id, data) => request.put(`/admin/zones/${id}`, data)
export const deleteZone = (id) => request.delete(`/admin/zones/${id}`)

// 平台说明
export const getAdminPlatformNote = () => request.get('/admin/platform-note')
export const updatePlatformNote = (content) => request.put('/admin/platform-note', { content })

// 上传
export const uploadFile = (file, folder = 'products') => {
  const form = new FormData()
  form.append('file', file)
  return request.post(`/upload?folder=${folder}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
}
