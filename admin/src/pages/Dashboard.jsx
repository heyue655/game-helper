import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Typography } from 'antd'
import { ShoppingCartOutlined, MoneyCollectOutlined, CheckCircleOutlined, DollarOutlined } from '@ant-design/icons'
import { getDashboard } from '../api'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { getDashboard().then((r) => setData(r.data)).finally(() => setLoading(false)) }, [])
  const stats = data ? [
    { title: '今日订单总额', value: data.todayOrderAmount, prefix: '￥', icon: React.createElement(ShoppingCartOutlined, { style: { color: '#c8a054' } }), color: '#c8a054' },
    { title: '累计订单总额', value: data.totalOrderAmount, prefix: '￥', icon: React.createElement(MoneyCollectOutlined, { style: { color: '#1677ff' } }), color: '#1677ff' },
    { title: '今日待交单', value: data.todayPendingDelivery, suffix: '单', icon: React.createElement(CheckCircleOutlined, { style: { color: '#faad14' } }), color: '#faad14' },
    { title: '今日待结算', value: data.todayPendingSettlement, prefix: '￥', icon: React.createElement(DollarOutlined, { style: { color: '#ff4d4f' } }), color: '#ff4d4f' },
    { title: '累计已交单', value: data.totalDelivered, suffix: '单', icon: React.createElement(CheckCircleOutlined, { style: { color: '#52c41a' } }), color: '#52c41a' },
    { title: '累计已结算', value: data.totalSettled, prefix: '￥', icon: React.createElement(DollarOutlined, { style: { color: '#52c41a' } }), color: '#52c41a' },
  ] : []
  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 24 }}>数据看板</Typography.Title>
      <Row gutter={[16, 16]}>
        {stats.map((s) => (
          <Col xs={24} sm={12} lg={8} key={s.title}>
            <Card loading={loading} style={{ borderColor: '#2e2e2e' }}>
              <Statistic title={s.title} value={s.value ?? 0} precision={s.prefix === '￥' ? 2 : 0} valueStyle={{ color: s.color, fontSize: 28 }}
                prefix={<span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>{s.icon}{s.prefix}</span>} suffix={s.suffix} />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
