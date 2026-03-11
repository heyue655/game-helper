import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { getMyEarnings } from '../api'
import dayjs from 'dayjs'

export default function EarningsPage() {
  const navigate = useNavigate()
  const [data, setData] = useState({ totalEarnings: 0, total: 0, items: [] })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 15

  useEffect(() => {
    setLoading(true)
    getMyEarnings({ page, pageSize: PAGE_SIZE })
      .then((r) => setData(r.data || { totalEarnings: 0, total: 0, items: [] }))
      .finally(() => setLoading(false))
  }, [page])

  const hasMore = data.items.length < data.total

  return (
    <PageLayout noNav>
      {/* 顶部导航栏 */}
      <div
        className="sticky top-0 z-10 px-4 h-12 flex items-center"
        style={{ background: 'rgba(248,250,252,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(148,163,184,0.2)' }}
      >
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-slate-500">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M19 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H19v-2z" /></svg>
        </button>
        <span className="flex-1 text-center text-slate-800 font-semibold">我的收益</span>
      </div>

      {/* 累计收益卡片 */}
      <div className="mx-4 mt-4 rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
        <p className="text-white/70 text-sm mb-1">累计收益（元）</p>
        <div className="flex items-end gap-1">
          <span className="text-white text-lg font-medium mb-0.5">¥</span>
          <span className="text-white text-4xl font-bold">{Number(data.totalEarnings).toFixed(2)}</span>
        </div>
        <p className="text-white/60 text-xs mt-2">共 {data.total} 笔已结算订单</p>
      </div>

      {/* 收益明细 */}
      <div className="mx-4 mt-4">
        <p className="text-slate-500 text-sm font-medium mb-3">收益明细</p>
        {loading && (
          <div className="flex items-center justify-center py-12">
            <span className="text-slate-400 text-sm">加载中...</span>
          </div>
        )}
        {!loading && data.items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <svg viewBox="0 0 24 24" fill="#cbd5e1" className="w-12 h-12"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
            <span className="text-slate-400 text-sm">暂无收益记录</span>
          </div>
        )}
        <div className="space-y-3">
          {data.items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 text-sm font-medium truncate">{item.productName}</p>
                  <p className="text-slate-400 text-xs mt-0.5">玩家：{item.user?.nickname || '-'}</p>
                  <p className="text-slate-300 text-xs mt-0.5">订单号：{item.orderNo}</p>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-lg font-bold" style={{ color: '#22c55e' }}>
                    +¥{item.playerAmount != null ? Number(item.playerAmount).toFixed(2) : '-'}
                  </span>
                  <span className="text-slate-300 text-xs mt-0.5">
                    {item.settledAt ? dayjs(item.settledAt).format('MM-DD HH:mm') : '-'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {hasMore && (
          <button
            onClick={() => setPage((p) => p + 1)}
            className="w-full mt-4 py-3 text-sm rounded-2xl"
            style={{ color: '#6366f1', background: 'rgba(99,102,241,0.07)' }}
          >
            加载更多
          </button>
        )}
        <div style={{ height: 24 }} />
      </div>
    </PageLayout>
  )
}
