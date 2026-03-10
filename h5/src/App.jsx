import React from 'react'
import { Routes, Route } from 'react-router-dom'
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/zone" element={<ZonePage />} />
      <Route path="/my" element={<MyPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/pay/:id" element={<PayPage />} />
      <Route path="/orders" element={<OrderListPage />} />
      <Route path="/orders/:id" element={<OrderDetailPage />} />
      <Route path="/my-tasks" element={<MyTasksPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/complaint/:orderId" element={<ComplaintPage />} />
      <Route path="/profile/edit" element={<ProfileEditPage />} />
    </Routes>
  )
}
