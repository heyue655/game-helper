import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Tag, Select, Modal, Form, InputNumber, message, Typography, Input } from 'antd'
import { getAdminOrders, assignOrder, settleOrder, getBuiltinPlayers } from '../api'
import dayjs from 'dayjs'

const STATUS_COLOR = {
  PENDING_PAY: 'default', PENDING_ASSIGN: 'blue', PENDING_DELIVERY: 'purple',
  COMPLETED: 'green', PENDING_SETTLEMENT: 'cyan', SETTLED: 'default', CLOSED: 'default',
}
const STATUS_LABEL = {
  PENDING_PAY: '待付款', PENDING_ASSIGN: '待分配', PENDING_DELIVERY: '待交单',
  COMPLETED: '已完成', PENDING_SETTLEMENT: '待结算', SETTLED: '已结算', CLOSED: '已关闭',
}

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
  const [settleModal, setSettleModal] = useState({ open: false, order: null })
  const [settleForm] = Form.useForm()
  const [settling, setSettling] = useState(false)

  useEffect(() => { getBuiltinPlayers().then((r) => setPlayers(r.data || [])) }, [])

  function fetchOrders(p = page) {
    setLoading(true)
    getAdminOrders({ page: p, pageSize: 20, status: statusFilter, keyword })
      .then((r) => { setOrders(r.data?.items || []); setTotal(r.data?.total || 0) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchOrders() }, [page, statusFilter, keyword])

  function openSettleModal(order) {
    const price = Number(order.price)
    const playerAmt = Math.round(price * 0.8 * 100) / 100
    const platformAmt = Math.round((price - playerAmt) * 100) / 100
    settleForm.setFieldsValue({ playerAmount: playerAmt, platformAmount: platformAmt })
    setSettleModal({ open: true, order })
  }

  function onPlayerAmountChange(val) {
    const price = Number(settleModal.order?.price || 0)
    if (val != null) settleForm.setFieldValue('platformAmount', Math.round((price - val) * 100) / 100)
  }

  function onPlatformAmountChange(val) {
    const price = Number(settleModal.order?.price || 0)
    if (val != null) settleForm.setFieldValue('playerAmount', Math.round((price - val) * 100) / 100)
  }

  async function handleSettle() {
    try {
      const vals = await settleForm.validateFields()
      const price = Number(settleModal.order.price)
      const sum = Number((vals.playerAmount + vals.platformAmount).toFixed(2))
      if (Math.abs(sum - price) > 0.001) {
        message.error(`分配金额之和（¥${sum}）必须等于订单金额（¥${price}），无法保存`)
        return
      }
      setSettling(true)
      await settleOrder(settleModal.order.id, { playerAmount: vals.playerAmount, platformAmount: vals.platformAmount })
      message.success('结算成功')
      setSettleModal({ open: false, order: null })
      fetchOrders()
    } catch (e) {
      if (e?.errorFields) {
        message.error('请检查金额分配，两项之和必须等于订单金额')
      } else {
        message.error(e?.message || '结算失败')
      }
    } finally {
      setSettling(false)
    }
  }

  async function handleAssign() {
    if (!selectedPlayer) return message.warning('请选择玩家')
    await assignOrder(assignModal.orderId, selectedPlayer)
    message.success('分配成功')
    setAssignModal({ open: false, orderId: null })
    setSelectedPlayer(null)
    fetchOrders()
  }

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', width: 160, ellipsis: true },
    { title: '商品名称', dataIndex: 'productName', ellipsis: true },
    { title: '玩家昵称', dataIndex: 'user', render: (u) => u?.nickname || '-', width: 100 },
    { title: '交接人', dataIndex: 'assignee', render: (a) => a?.nickname || '-', width: 100 },
    { title: '价格', dataIndex: 'price', width: 90, render: (v) => `¥${v}` },
    { title: '状态', dataIndex: 'status', width: 100, render: (v) => <Tag color={STATUS_COLOR[v] || 'default'}>{STATUS_LABEL[v] || v}</Tag> },
    {
      title: '投诉', dataIndex: 'isComplained', width: 90,
      render: (v, r) => v ? (
        <Button size="small" danger type="link" style={{ padding: 0 }}
          onClick={() => setComplaintModal({ open: true, reason: r.complaintReason || '无原因', at: r.complaintAt })}>
          已投诉 >
        </Button>
      ) : '-',
    },
    { title: '下单时间', dataIndex: 'createdAt', width: 140, render: (v) => dayjs(v).format('MM-DD HH:mm') },
    {
      title: '操作', width: 130,
      render: (_, r) => (
        <Space>
          {r.status === 'PENDING_ASSIGN' && (
            <Button size="small" type="primary"
              onClick={() => { setAssignModal({ open: true, orderId: r.id }); setSelectedPlayer(null) }}>
              分配
            </Button>
          )}
          {r.status === 'PENDING_SETTLEMENT' && (
            <Button size="small" type="primary" onClick={() => openSettleModal(r)}>结算</Button>
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
          <Select
            placeholder="全部状态"
            allowClear
            style={{ width: 130 }}
            onChange={(v) => { setStatusFilter(v || ''); setPage(1) }}
            options={Object.entries(STATUS_LABEL).map(([k, v]) => ({ value: k, label: v }))}
          />
          <Input.Search placeholder="搜索订单号/商品" onSearch={(v) => { setKeyword(v); setPage(1) }} allowClear style={{ width: 220 }} />
        </Space>
      </div>
      <Table dataSource={orders} columns={columns} rowKey="id" loading={loading}
        pagination={{ current: page, total, pageSize: 20, onChange: (p) => setPage(p) }}
        scroll={{ x: 1000 }} />

      <Modal title="分配订单" open={assignModal.open} onOk={handleAssign} onCancel={() => setAssignModal({ open: false, orderId: null })} okText="确认分配">
        <Select placeholder="选择打手" style={{ width: '100%' }} value={selectedPlayer} onChange={setSelectedPlayer}
          options={players.map((p) => ({ value: p.id, label: p.nickname }))} />
      </Modal>

      <Modal
        title={`订单结算 - 订单金额 ¥${settleModal.order?.price}`}
        open={settleModal.open}
        onOk={handleSettle}
        onCancel={() => setSettleModal({ open: false, order: null })}
        okText="确认结算"
        confirmLoading={settling}
      >
        <Form form={settleForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="打手收益（元）" name="playerAmount" rules={[{ required: true, message: '请输入' }]}>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={Number(settleModal.order?.price || 0)}
              precision={2}
              onChange={onPlayerAmountChange}
              addonBefore="¥"
            />
          </Form.Item>
          <Form.Item
            label="平台收益（元）"
            name="platformAmount"
            dependencies={['playerAmount']}
            rules={[
              { required: true, message: '请输入' },
              {
                validator: (_, val) => {
                  const playerAmt = settleForm.getFieldValue('playerAmount')
                  const price = Number(settleModal.order?.price || 0)
                  const sum = Number(((playerAmt ?? 0) + (val ?? 0)).toFixed(2))
                  if (price > 0 && Math.abs(sum - price) > 0.001) {
                    return Promise.reject(new Error(`分配金额之和（¥${sum}）必须等于订单金额（¥${price}），无法保存`))
                  }
                  return Promise.resolve()
                },
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={Number(settleModal.order?.price || 0)}
              precision={2}
              onChange={onPlatformAmountChange}
              addonBefore="¥"
            />
          </Form.Item>
          <div style={{ color: '#94a3b8', fontSize: 13 }}>
            默认打手 80%、平台 20%，修改任意一项另一项自动计算。两项之和必须等于订单金额。
          </div>
        </Form>
      </Modal>

      <Modal title="投诉详情" open={complaintModal.open} onCancel={() => setComplaintModal({ open: false, reason: '', at: null })} footer={null}>
        <p style={{ marginBottom: 8 }}><strong>投诉原因：</strong>{complaintModal.reason}</p>
        {complaintModal.at && <p style={{ color: '#94a3b8', fontSize: 13 }}>投诉时间：{dayjs(complaintModal.at).format('YYYY-MM-DD HH:mm')}</p>}
      </Modal>
    </div>
  )
}
