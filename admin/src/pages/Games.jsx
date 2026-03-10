import React, { useEffect, useState } from 'react'
import { Table, Typography, Space, Button, Popconfirm, Modal, Form, Input, Switch, message } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { getAdminGames, createGame, updateGame, deleteGame } from '../api'

export default function GamesPage() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()

  function fetchGames() {
    setLoading(true)
    getAdminGames()
      .then((r) => setGames(r.data || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchGames()
  }, [])

  async function handleSave() {
    const values = await form.validateFields()
    if (editingId) {
      await updateGame(editingId, values)
      message.success('更新成功')
    } else {
      await createGame(values)
      message.success('创建成功')
    }
    setModalOpen(false)
    fetchGames()
  }

  const columns = [
    { title: '游戏名称', dataIndex: 'name' },
    { title: '排序', dataIndex: 'sort', width: 100 },
    {
      title: '启用',
      dataIndex: 'isActive',
      width: 100,
      render: (v, r) => (
        <Switch checked={v} onChange={(checked) => updateGame(r.id, { isActive: checked }).then(fetchGames)} />
      ),
    },
    {
      title: '操作',
      width: 160,
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setEditingId(r.id)
              form.setFieldsValue(r)
              setModalOpen(true)
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除？"
            onConfirm={async () => {
              await deleteGame(r.id)
              message.success('已删除')
              fetchGames()
            }}
          >
            <Button size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          游戏管理
        </Typography.Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchGames}>
            刷新
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null)
              form.resetFields()
              form.setFieldsValue({ sort: 0, isActive: true })
              setModalOpen(true)
            }}
          >
            新增游戏
          </Button>
        </Space>
      </div>

      <Table rowKey="id" loading={loading} dataSource={games} columns={columns} pagination={false} />

      <Modal
        title={editingId ? '编辑游戏' : '新增游戏'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="保存"
      >
        <Form form={form} layout="vertical" initialValues={{ sort: 0, isActive: true }}>
          <Form.Item name="name" label="游戏名称" rules={[{ required: true, message: '请输入游戏名称' }]}>
            <Input placeholder="例如：王者荣耀" />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="isActive" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
