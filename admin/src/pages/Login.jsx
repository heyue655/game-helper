import React from 'react'
import { Form, Input, Button, Card, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../api'
import useAdminStore from '../store/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAdminStore((s) => s.setAuth)
  const [form] = Form.useForm()

  async function onFinish(values) {
    try {
      const res = await adminLogin(values)
      setAuth(res.data.admin, res.data.token)
      navigate(res.data.admin?.role === 'SUPER' ? '/dashboard' : '/orders')
    } catch {}
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(145deg, #f0f4ff 0%, #fdf4ff 55%, #f0f9fe 100%)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -60, right: -40, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)', filter: 'blur(30px)' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -40, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.16) 0%, transparent 70%)', filter: 'blur(30px)' }} />
      <Card style={{ width: 420, borderRadius: 28, background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(255,255,255,0.82)', boxShadow: '0 20px 60px rgba(99,102,241,0.12)', backdropFilter: 'blur(18px)' }} styles={{ body: { padding: 28 } }}>
        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 8, color: '#312e81' }}>游戏接单系统</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 28 }}>后台管理登录</Typography.Paragraph>
        <Form form={form} onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="username" label="账号" rules={[{ required: true, message: '请输入账号' }]}>
            <Input prefix={React.createElement(UserOutlined)} placeholder="账号" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={React.createElement(LockOutlined)} placeholder="密码" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block>登录</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
