import React, { useState, useEffect } from 'react'
import { Table, Button, Popconfirm, Tag, Typography, Input, message, Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { getAdminUsers, setBlacklist } from '../api'
import dayjs from 'dayjs'

const GENDER_LABEL = { 0: '未知', 1: '男', 2: '女' }

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')

  function fetchUsers(p = page) {
    setLoading(true)
    getAdminUsers({ page: p, pageSize: 20, keyword }).then((r) => { setUsers(r.data?.items || []); setTotal(r.data?.total || 0) }).finally(() => setLoading(false))
  }
  useEffect(() => { fetchUsers() }, [page, keyword])

  const columns = [
    { title: '头像', dataIndex: 'avatar', width: 60, render: (v) => <Avatar src={v} icon={<UserOutlined />} /> },
    { title: '昵称', dataIndex: 'nickname' },
    { title: '手机号', dataIndex: 'phone', width: 130 },
    { title: '性别', dataIndex: 'gender', width: 70, render: (v) => GENDER_LABEL[v] || '未知' },
    { title: '年龄', dataIndex: 'age', width: 60, render: (v) => v || '-' },
    { title: '游戏', dataIndex: 'game', width: 100, render: (v) => v || '-' },
    { title: '内置玩家', dataIndex: 'isBuiltin', width: 90, render: (v) => v ? <Tag color="blue">是</Tag> : '-' },
    { title: '状态', dataIndex: 'isBlacklisted', width: 80, render: (v) => v ? <Tag color="red">已拉黑</Tag> : <Tag color="green">正常</Tag> },
    { title: '注册时间', dataIndex: 'createdAt', width: 120, render: (v) => dayjs(v).format('MM-DD HH:mm') },
    {
      title: '操作', width: 100,
      render: (_, r) => (
        <Popconfirm title={r.isBlacklisted ? '确认解除拉黑？' : '确认拉黑该用户？'}
          onConfirm={async () => { await setBlacklist(r.id, !r.isBlacklisted); message.success(r.isBlacklisted ? '已解除' : '已拉黑'); fetchUsers() }}>
          <Button size="small" danger={!r.isBlacklisted}>{r.isBlacklisted ? '解除拉黑' : '拉黑'}</Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>玩家管理</Typography.Title>
        <Input.Search placeholder="搜索昵称/手机号" onSearch={(v) => { setKeyword(v); setPage(1) }} allowClear style={{ width: 220 }} />
      </div>
      <Table dataSource={users} columns={columns} rowKey="id" loading={loading} pagination={{ current: page, total, pageSize: 20, onChange: (p) => setPage(p) }} scroll={{ x: 800 }} />
    </div>
  )
}
