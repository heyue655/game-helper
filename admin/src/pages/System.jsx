import React, { useState, useEffect } from 'react'
import { Tabs, Table, Button, Modal, Form, Input, Popconfirm, Tag, message, Typography, Switch, Space, Card } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { getAdmins, createAdmin, deleteAdmin, getAdminBanners, createBanner, updateBanner, deleteBanner, getAdminPlatformNote, updatePlatformNote } from '../api'
import useAdminStore from '../store/auth'

function AdminManage() {
  const [admins, setAdmins] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const currentAdmin = useAdminStore((s) => s.admin)
  function fetchAdmins() { getAdmins().then((r) => setAdmins(r.data || [])) }
  useEffect(() => { fetchAdmins() }, [])
  if (currentAdmin?.role !== 'SUPER') return <Typography.Text type="secondary">仅超级管理员可管理账号</Typography.Text>
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span /><Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>新增管理员</Button>
      </div>
      <Table dataSource={admins} columns={[
        { title: '账号', dataIndex: 'username' },
        { title: '角色', dataIndex: 'role', render: (v) => v === 'SUPER' ? <Tag color="gold">超级管理员</Tag> : <Tag>管理员</Tag> },
        { title: '操作', render: (_, r) => r.role !== 'SUPER' ? <Popconfirm title="确认删除？" onConfirm={async () => { await deleteAdmin(r.id); message.success('已删除'); fetchAdmins() }}><Button size="small" danger>删除</Button></Popconfirm> : '-' },
      ]} rowKey="id" pagination={false} />
      <Modal title="新增管理员" open={modalOpen} onOk={async () => { await createAdmin(await form.validateFields()); message.success('创建成功'); setModalOpen(false); form.resetFields(); fetchAdmins() }} onCancel={() => setModalOpen(false)} okText="创建">
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="账号" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, min: 6 }]}><Input.Password /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

function BannerManage() {
  const [banners, setBanners] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()
  function fetchBanners() { getAdminBanners().then((r) => setBanners(r.data || [])) }
  useEffect(() => { fetchBanners() }, [])
  async function handleSave() {
    const values = await form.validateFields()
    if (editingId) { await updateBanner(editingId, values); message.success('更新成功') }
    else { await createBanner(values); message.success('创建成功') }
    setModalOpen(false); fetchBanners()
  }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Text type="secondary">最多展示 5 张 Banner</Typography.Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true) }}>新增 Banner</Button>
      </div>
      <Table dataSource={banners} columns={[
        { title: '图片', dataIndex: 'imageUrl', render: (v) => <img src={v} style={{ width: 80, height: 40, objectFit: 'cover', borderRadius: 4 }} /> },
        { title: '链接', dataIndex: 'link', ellipsis: true },
        { title: '排序', dataIndex: 'sort', width: 70 },
        { title: '启用', dataIndex: 'isActive', width: 80, render: (v, r) => <Switch checked={v} onChange={(checked) => updateBanner(r.id, { isActive: checked }).then(fetchBanners)} /> },
        { title: '操作', width: 140, render: (_, r) => <Space><Button size="small" onClick={() => { setEditingId(r.id); form.setFieldsValue(r); setModalOpen(true) }}>编辑</Button><Popconfirm title="确认删除？" onConfirm={async () => { await deleteBanner(r.id); message.success('已删除'); fetchBanners() }}><Button size="small" danger>删除</Button></Popconfirm></Space> },
      ]} rowKey="id" pagination={false} />
      <Modal title={editingId ? '编辑 Banner' : '新增 Banner'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} okText="保存">
        <Form form={form} layout="vertical">
          <Form.Item name="imageUrl" label="图片URL" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="link" label="跳转链接"><Input /></Form.Item>
          <Form.Item name="sort" label="排序"><Input type="number" /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

function PlatformNoteManage() {
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => { getAdminPlatformNote().then((r) => setContent(r.data?.content || '')) }, [])
  return (
    <Card>
      <Typography.Paragraph type="secondary">此内容会在商品详情页底部展示，支持HTML</Typography.Paragraph>
      <Input.TextArea value={content} onChange={(e) => setContent(e.target.value)} rows={10} placeholder="请输入平台通用说明内容" />
      <Button type="primary" style={{ marginTop: 12 }} loading={saving}
        onClick={async () => { setSaving(true); try { await updatePlatformNote(content); message.success('保存成功') } finally { setSaving(false) } }}>
        保存
      </Button>
    </Card>
  )
}

export default function SystemPage() {
  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 16 }}>系统管理</Typography.Title>
      <Tabs items={[
        { key: 'admins', label: '管理员管理', children: <AdminManage /> },
        { key: 'platform-note', label: '平台说明', children: <PlatformNoteManage /> },
      ]} />
    </div>
  )
}
