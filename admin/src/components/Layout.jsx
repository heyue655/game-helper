import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Typography } from 'antd'
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  OrderedListOutlined,
  TeamOutlined,
  SettingOutlined,
  PictureOutlined,
  LogoutOutlined,
  TagsOutlined,
} from '@ant-design/icons'
import useAdminStore from '../store/auth'
import logoSrc from '../assets/logo.svg'

const { Sider, Header, Content } = Layout

const ALL_MENU_ITEMS = [
  { key: '/dashboard',  icon: React.createElement(DashboardOutlined),  label: '????',    roles: ['SUPER'] },
  { key: '/orders',     icon: React.createElement(OrderedListOutlined), label: '????',    roles: ['SUPER', 'ADMIN'] },
  { key: '/products',   icon: React.createElement(ShoppingOutlined),   label: '????',    roles: ['SUPER', 'ADMIN'] },
  { key: '/users',      icon: React.createElement(TeamOutlined),        label: '????',    roles: ['SUPER', 'ADMIN'] },
  { key: '/games',      icon: React.createElement(AppstoreOutlined),    label: '????',    roles: ['SUPER', 'ADMIN'] },
  { key: '/zones',      icon: React.createElement(TagsOutlined),        label: '????',    roles: ['SUPER', 'ADMIN'] },
  { key: '/banners',    icon: React.createElement(PictureOutlined),     label: 'Banner ??', roles: ['SUPER', 'ADMIN'] },
  { key: '/system',     icon: React.createElement(SettingOutlined),     label: '????',    roles: ['SUPER'] },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { admin, logout } = useAdminStore()

  const role = admin?.role || 'ADMIN'
  const menuItems = ALL_MENU_ITEMS.filter((item) => item.roles.includes(role))

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent', padding: 16, gap: 16 }}>
      <Sider width={220} theme="light" style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.82)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 14px 40px rgba(99,102,241,0.10)', backdropFilter: 'blur(18px)' }}>
        <div style={{ padding: '18px 14px', textAlign: 'center', borderBottom: '1px solid rgba(148,163,184,0.16)' }}>
          <img src={logoSrc} alt="????" style={{ width: 52, height: 52, marginBottom: 8 }} />
          <Typography.Text strong style={{ color: '#4338ca', fontSize: 18, display: 'block' }}>????</Typography.Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: 'transparent', borderRight: 'none', padding: 12 }}
        />
      </Sider>
      <Layout style={{ background: 'transparent' }}>
        <Header style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.82)', borderRadius: 24, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 14px 40px rgba(99,102,241,0.08)', backdropFilter: 'blur(18px)' }}>
          <Typography.Title level={5} style={{ margin: 0, color: '#312e81' }}>????</Typography.Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Typography.Text style={{ color: '#475569' }}>{admin?.username}?{role === 'SUPER' ? '?????' : '???'}?</Typography.Text>
            <Button icon={React.createElement(LogoutOutlined)} type="text" onClick={() => { logout(); navigate('/login') }} style={{ color: '#6366f1' }}>??</Button>
          </div>
        </Header>
        <Content style={{ paddingTop: 16, background: 'transparent', minHeight: 'calc(100vh - 96px)' }}>
          <div style={{ background: 'rgba(255,255,255,0.56)', border: '1px solid rgba(255,255,255,0.78)', borderRadius: 24, padding: 24, boxShadow: '0 14px 40px rgba(99,102,241,0.06)', backdropFilter: 'blur(12px)' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
