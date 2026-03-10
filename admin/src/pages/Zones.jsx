import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, Popconfirm, message, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { getAdminZones, createZone, updateZone, deleteZone } from '../api'

export default function ZonesPage() {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()

  function fetchZones() {
    setLoading(true)
    getAdminZones().then((r) => setZones(r.data || [])).finally(() => setLoading(false))
  }
  useEffect(() => { fetchZones() }, [])

  async function handleSave() {
    const values = await form.validateFields()
    try {
      if (editingId) {
        await updateZone(editingId, values)
        message.success('更新成功')
      } else {
        await createZone(values)
        message.success('创建成功')
      }
      setModalOpen(false)
      fetchZones()
    } catch (e) {
      message.error(e.response?.data?.message || '操作失败')
    }
  }

  const columns = [
    { title: '专区名称', dataIndex: 'name', width: 160 },
    { title: '图标', dataIndex: 'icon', render: (v) => v ? <img src={v} style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 4 }} /> : '-' },
    { title: '排序', dataIndex: 'sort', width: 80 },
    {
      title: '操作', width: 160,
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => { setEditingId(r.id); form.setFieldsValue(r); setModalOpen(true) }}>编辑</Button>
          <Popconfirm title="确认删除该专区？" onConfirm={async () => { await deleteZone(r.id); message.success('已删除'); fetchZones() }}>
            <Button size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>专区管理</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true) }}>新增专区</Button>
      </div>
      <Table dataSource={zones} columns={columns} rowKey="id" loading={loading} pagination={false} />
      <Modal
        title={editingId ? '编辑专区' : '新增专区'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="保存"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="专区名称" rules={[{ required: true, message: '请输入专区名称' }]}>
            <Input placeholder="如：性价比专区" />
          </Form.Item>
          <Form.Item name="icon" label="图标 URL">
            <Input placeholder="可选，专区图标图片地址" />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <Input type="number" placeholder="数字越小越靠前，默认99" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
