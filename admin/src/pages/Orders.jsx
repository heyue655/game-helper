import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Tag, Select, Modal, message, Typography, Input, Tooltip } from 'antd'
import { getAdminOrders, assignOrder, settleOrder, getBuiltinPlayers } from '../api'
import dayjs from 'dayjs'

const STATUS_COLOR = { PENDING_PAY: 'default', PENDING_ASSIGN: 'blue', PENDING_DELIVERY: 'purple', COMPLETED: 'green', PENDING_SETTLEMENT: 'cyan', SETTLED: 'default', CLOSED: 'default' }
const STATUS_LABEL = { PENDING_PAY: '待付款', PENDING_ASSIGN: '待分配', PENDING_DELIVERY: '待交单', COMPLETED: '已完成', PENDING_SETTLEMENT: '待结算', SETTLED: '已结算', CLOSED: '已关闭' }

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [keyword, setKeyword] = useState('')
  const [players, setPlayers] = useState([])
  const [assignModal, setAssignModal] = useState({ open: false, orderId: null })
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [complaintModal, setComplaintModal] = useState({ open: false, reason: '', at: null })

  useEffect(() => { getBuiltinPlayers().then((r) => setPlayers(r.data || [])) }, [])

  function fetchOrders(p = page) {
    setLoading(true)
    getAdminOrders({ page: p, pageSize: 20, status: statusFilter, keyword })
      .then((r) => { setOrders(r.data?.items || []); setTotal(r.data?.total || 0) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchOrders() }, [page, statusFilter, keyword])

  async function handleAssign() {
    if (!selectedPlayer) return message.warning('请选择玩家')
    await assignOrder(assignModal.orderId, selectedPlayer)
    message.success('分配成功'); setAssignModal({ open: false, orderId: null }); setSelectedPlayer(null); fetchOrders()
  }

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', width: 160, ellipsis: true },
    { title: '商品名称', dataIndex: 'productName', ellipsis: true },
    { title: '玩家昵称', dataIndex: 'user', render: (u) => u?.nickname || '-', width: 100 },
    { title: '接单人', dataIndex: 'assignee', render: (a) => a?.nickname || '-', width: 100 },
    { title: '价格', dataIndex: 'price', width: 90, render: (v) => `￥${v}` },
    { title: '状态', dataIndex: 'status', width: 100, render: (v) => <Tag color={STATUS_COLOR[v] || 'default'}>{STATUS_LABEL[v] || v}</Tag> },
    {
      title: '投诉',
      dataIndex: 'isComplained',
      width: 90,
      render: (v, r) =>
        v ? (
          <Button
            size="small"
            danger
            type="link"
            style={{ padding: 0 }}
            onClick={() => setComplaintModal({ open: true, reason: r.complaintReason || '（无原因）', at: r.complaintAt })}
          >
            已投诉 &gt;
          </Button>
        ) : '-',
    },
    { title: '下单时间', dataIndex: 'createdAt', width: 140, render: (v) => dayjs(v).format('MM-DD HH:mm') },
    {
      title: '操作', width: 120,
      render: (_, r) => (
        <Space>
          {r.status === 'PENDING_ASSIGN' && (
            <Button size="small" type="primary" onClick={() => { setAssignModal({ open: true, orderId: r.id }); setSelectedPlayer(null) }}>分配</Button>
          )}
          {r.status === 'PENDING_SETTLEMENT' && (
            <Button size="small" type="primary" onClick={async () => { await settleOrder(r.id); message.success('结算成功'); fetchOrders() }}>结算</Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>订单管理</Typography.Title>
        <Space>
          <Input.Search placeholder="搜索商品/订单号" onSearch={(v) => { setKeyword(v); setPage(1) }} allowClear style={{ width: 200 }} />
          <Select value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1) }} style={{ width: 140 }}
            options={[{ value: '', label: '全部状态' }, ...Object.entries(STATUS_LABEL).map(([k, v]) => ({ value: k, label: v }))]} />
        </Space>
      </div>
      <Table dataSource={orders} columns={columns} rowKey="id" loading={loading} pagination={{ current: page, total, pageSize: 20, onChange: (p) => setPage(p) }} scroll={{ x: 950 }} />

      <Modal title="分配接单人" open={assignModal.open} onOk={handleAssign} onCancel={() => setAssignModal({ open: false, orderId: null })} okText="确认分配">
        <Select style={{ width: '100%' }} placeholder="请选择内置玩家" value={selectedPlayer} onChange={setSelectedPlayer}
          options={players.map((p) => ({ value: p.id, label: `${p.nickname} (${p.game || '游戏未知'})` }))} />
      </Modal>

      <Modal
        title="投诉详情"
        open={complaintModal.open}
        onCancel={() => setComplaintModal({ open: false, reason: '', at: null })}
        footer={<Button onClick={() => setComplaintModal({ open: false, reason: '', at: null })}>关闭</Button>}
      >
        {complaintModal.at && (
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
            投诉时间：{dayjs(complaintModal.at).format('YYYY-MM-DD HH:mm:ss')}
          </Typography.Text>
        )}
        <Typography.Paragraph style={{ background: '#f8fafc', borderRadius: 8, padding: 12, marginBottom: 0 }}>
          {complaintModal.reason}
        </Typography.Paragraph>
      </Modal>
    </div>
  )
}
