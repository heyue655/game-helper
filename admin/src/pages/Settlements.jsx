import React, { useState, useEffect } from 'react'
import { Table, Typography, Input, Statistic, Row, Col, Card } from 'antd'
import { getAdminSettlements } from '../api'
import dayjs from 'dayjs'

export default function SettlementsPage() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')

  function fetchData(p = page) {
    setLoading(true)
    getAdminSettlements({ page: p, pageSize: 20, keyword })
      .then((r) => { setItems(r.data?.items || []); setTotal(r.data?.total || 0) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [page, keyword])

  const totalPlayer = items.reduce((s, i) => s + (i.playerAmount || 0), 0)
  const totalPlatform = items.reduce((s, i) => s + (i.platformAmount || 0), 0)

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', width: 170, ellipsis: true },
    { title: '商品名称', dataIndex: 'productName', ellipsis: true },
    { title: '玩家昵称', dataIndex: 'user', render: (u) => u?.nickname || '-', width: 110 },
    { title: '交单人', dataIndex: 'assignee', render: (a) => a?.nickname || '-', width: 110 },
    { title: '订单金额', dataIndex: 'price', width: 100, render: (v) => `¥${Number(v).toFixed(2)}` },
    { title: '打手收益', dataIndex: 'playerAmount', width: 100, render: (v) => v != null ? <span style={{ color: '#22c55e' }}>¥{Number(v).toFixed(2)}</span> : '-' },
    { title: '平台收益', dataIndex: 'platformAmount', width: 100, render: (v) => v != null ? <span style={{ color: '#6366f1' }}>¥{Number(v).toFixed(2)}</span> : '-' },
    { title: '结算时间', dataIndex: 'settledAt', width: 140, render: (v) => v ? dayjs(v).format('MM-DD HH:mm') : '-' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>结算管理</Typography.Title>
        <Input.Search placeholder="搜索订单号/商品" onSearch={(v) => { setKeyword(v); setPage(1) }} allowClear style={{ width: 240 }} />
      </div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small">
            <Statistic title="当页打手总收益" value={totalPlayer.toFixed(2)} prefix="¥" valueStyle={{ color: '#22c55e' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic title="当页平台总收益" value={totalPlatform.toFixed(2)} prefix="¥" valueStyle={{ color: '#6366f1' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic title="当页结算笔数" value={items.length} suffix="笔" />
          </Card>
        </Col>
      </Row>
      <Table
        dataSource={items}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ current: page, total, pageSize: 20, onChange: (p) => setPage(p) }}
        scroll={{ x: 900 }}
      />
    </div>
  )
}
