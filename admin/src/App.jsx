import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Login'
import Layout from './components/Layout'
import DashboardPage from './pages/Dashboard'
import ProductsPage from './pages/Products'
import OrdersPage from './pages/Orders'
import UsersPage from './pages/Users'
import SystemPage from './pages/System'
import BannersPage from './pages/Banners'
import GamesPage from './pages/Games'
import ZonesPage from './pages/Zones'
import useAdminStore from './store/auth'

function PrivateRoute({ children }) {
  const token = useAdminStore((s) => s.token)
  return token ? children : <Navigate to="/login" replace />
}

function RoleRedirect() {
  const admin = useAdminStore((s) => s.admin)
  return <Navigate to={admin?.role === 'SUPER' ? '/dashboard' : '/orders'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<RoleRedirect />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="banners" element={<BannersPage />} />
        <Route path="games" element={<GamesPage />} />
        <Route path="zones" element={<ZonesPage />} />
        <Route path="system" element={<SystemPage />} />
      </Route>
    </Routes>
  )
}
