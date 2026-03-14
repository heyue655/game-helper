import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import useAuthStore from './store/auth'
import { getDeviceId, hasUrlDeviceId } from './utils/deviceId'
import { isWechatBrowser } from './utils/platform'
import { getMe } from './api'
import HomePage from './pages/Home'
import ZonePage from './pages/Zone'
import MyPage from './pages/My'
import ProductDetailPage from './pages/ProductDetail'
import LoginPage from './pages/Login'
import OrderListPage from './pages/OrderList'
import OrderDetailPage from './pages/OrderDetail'
import MyTasksPage from './pages/MyTasks'
import FavoritesPage from './pages/Favorites'
import ComplaintPage from './pages/Complaint'
import ProfileEditPage from './pages/ProfileEdit'
import PayPage from './pages/Pay'
import PayResultPage from './pages/PayResult'
import EarningsPage from './pages/Earnings'
import CustomerServicePage from './pages/CustomerService'

export default function App() {
  const { token, initialized, silentLogin, setInitialized, setUser } = useAuthStore()

  useEffect(() => {
    const init = async () => {
      if (initialized) return

      // 微信浏览器：注入 deviceId 到 URL
      if (isWechatBrowser() && !hasUrlDeviceId()) {
        const deviceId = localStorage.getItem('game_device_id') || crypto.randomUUID()
        localStorage.setItem('game_device_id', deviceId)
        const url = new URL(window.location.href)
        url.searchParams.set('deviceId', deviceId)
        window.history.replaceState({}, '', url.pathname + url.search)
      }

      // 检查当前 token 是否有效且有手机号
      if (token) {
        try {
          const res = await getMe()
          setUser(res.data)
          // 有手机号 → 保持手机号身份（最高优先级）
          if (res.data.phone) {
            setInitialized(true)
            return
          }
          // 无手机号 → 游客身份，继续检查 URL deviceId
        } catch {
          // token 无效
          localStorage.removeItem('token')
        }
      }

      // URL 有 deviceId → 用 deviceId 登录
      if (hasUrlDeviceId()) {
        const deviceId = getDeviceId()
        await silentLogin(deviceId)
        return
      }

      // 无 token → 用本地 deviceId 登录
      const deviceId = getDeviceId()
      await silentLogin(deviceId)
    }
    init()
  }, [])

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <span className="text-gray-400 text-sm">加载中...</span>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/zone" element={<ZonePage />} />
      <Route path="/my" element={<MyPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/pay/:id" element={<PayPage />} />
      <Route path="/pay/result" element={<PayResultPage />} />
      <Route path="/earnings" element={<EarningsPage />} />
      <Route path="/orders" element={<OrderListPage />} />
      <Route path="/orders/:id" element={<OrderDetailPage />} />
      <Route path="/my-tasks" element={<MyTasksPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/complaint/:orderId" element={<ComplaintPage />} />
      <Route path="/profile/edit" element={<ProfileEditPage />} />
      <Route path="/customer-service" element={<CustomerServicePage />} />
    </Routes>
  )
}
