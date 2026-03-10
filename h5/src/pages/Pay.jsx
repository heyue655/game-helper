import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { getOrder, mockPayOrder } from '../api'

export default function PayPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [countdown, setCountdown] = useState(15 * 60)

  useEffect(() => {
    getOrder(id)
      .then((r) => {
        const o = r.data
        setOrder(o)
        if (o.status !== 'PENDING_PAY') {
          navigate(`/orders/${id}`, { replace: true })
          return
        }
        if (state?.payUrl) {
          window.location.href = state.payUrl
        }
      })
      .catch(() => navigate('/orders', { replace: true }))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!order || order.status !== 'PENDING_PAY') return
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); navigate('/orders', { replace: true }); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [order])

  async function handlePay() {
    setPaying(true)
    try {
      await mockPayOrder(id)
      navigate(`/orders/${id}?paid=1`, { replace: true })
    } catch (e) {
      alert(e.message)
    } finally {
      setPaying(false)
    }
  }

  function handleCancel() {
    navigate(`/orders/${id}`, { replace: true })
  }

  const mm = String(Math.floor(countdown / 60)).padStart(2, '0')
  const ss = String(countdown % 60).padStart(2, '0')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(145deg,#f0f4ff 0%,#fdf4ff 55%,#f0f9fe 100%)' }}>
        <span className="text-slate-400 text-sm">加载中...</span>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(145deg,#f0f4ff 0%,#fdf4ff 55%,#f0f9fe 100%)' }}>
      {/* 顶部栏 */}
      <div
        className="sticky top-0 z-10 px-4 h-12 flex items-center"
        style={{ background: 'rgba(248,250,252,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(148,163,184,0.2)' }}
      >
        <button onClick={handleCancel} className="p-1 -ml-1 text-slate-500">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M19 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H19v-2z" /></svg>
        </button>
        <span className="flex-1 text-center text-slate-800 font-semibold">收银台</span>
        <span className="text-xs text-slate-400 tabular-nums">{mm}:{ss}</span>
      </div>

      {/* 金额区 */}
      <div className="flex flex-col items-center pt-8 pb-6">
        <span className="text-slate-500 text-sm mb-1">需付金额（元）</span>
        <div className="flex items-end gap-1">
          <span className="text-slate-700 text-lg font-medium mb-1">¥</span>
          <span className="text-4xl font-bold" style={{ color: '#e83030' }}>{Number(order.price).toFixed(2)}</span>
        </div>
        <p className="text-slate-400 text-xs mt-2 px-8 text-center line-clamp-1">{order.productName}{order.spec ? ` · ${order.spec}` : ''}</p>
        <p className="text-slate-300 text-xs mt-0.5">订单号：{order.orderNo}</p>
      </div>

      {/* 支付方式 */}
      <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(99,102,241,0.08)' }}>
        <div className="px-4 py-2 border-b" style={{ borderColor: 'rgba(226,232,240,0.6)' }}>
          <span className="text-slate-400 text-xs">选择支付方式</span>
        </div>
        {/* 支付宝 */}
        <div className="flex items-center px-4 py-4" style={{ borderBottom: '1px solid rgba(226,232,240,0.4)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mr-3 flex-shrink-0" style={{ background: '#1677ff' }}>
            <svg viewBox="0 0 48 48" fill="white" className="w-5 h-5">
              <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm8.6 26.2c-2.1 1-4.6 1.6-7.2 1.6-2 0-3.8-.3-5.4-.9l-.8 2.2h-3.4l1.2-3.3c-3.1-1.8-5.1-4.8-5.1-8.4 0-5.5 4.5-10 10-10s10 4.5 10 10c0 2.1-.6 4-1.7 5.6l2.4 1.1-0 2.1zM24 14c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-slate-800 text-sm font-medium">支付宝</p>
            <p className="text-slate-400 text-xs">推荐使用支付宝支付</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(234,179,8,0.12)', color: '#b45309' }}>沙箱模式</span>
            <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#6366f1' }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#6366f1' }} />
            </div>
          </div>
        </div>
        {/* 微信（暂不支持灰显） */}
        <div className="flex items-center px-4 py-4 opacity-40">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mr-3 flex-shrink-0" style={{ background: '#07c160' }}>
            <svg viewBox="0 0 48 48" fill="white" className="w-5 h-5">
              <path d="M19.2 10C11.8 10 6 15 6 21.2c0 3.4 1.8 6.5 4.6 8.5l-1.2 3.6 4-2c1.5.5 3.1.7 4.8.7.4 0 .8 0 1.2-.1-.3-.9-.4-1.8-.4-2.7C19 23 24.8 18.4 32 18c-.9-4.5-6.2-8-12.8-8zm-4 6.5c1 0 1.8.8 1.8 1.8S16.2 20 15.2 20s-1.8-.8-1.8-1.8.8-1.7 1.8-1.7zm8 0c1 0 1.8.8 1.8 1.8S24.2 20 23.2 20s-1.8-.8-1.8-1.8.8-1.7 1.8-1.7zM30 20c-6.6 0-12 4.5-12 10s5.4 10 12 10c1.5 0 3-.2 4.4-.7l3.2 1.6-1-3c2.3-1.8 3.8-4.4 3.8-7.2C42.4 24.5 37 20 30 20zm-3.5 5.5c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5.7-1.5 1.5-1.5zm7 0c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5.7-1.5 1.5-1.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-slate-800 text-sm font-medium">微信支付</p>
            <p className="text-slate-400 text-xs">暂未开放</p>
          </div>
        </div>
      </div>

      {/* 说明 */}
      <div className="mx-4 mt-3 px-3 py-2.5 rounded-xl flex items-start gap-2" style={{ background: 'rgba(99,102,241,0.06)' }}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#6366f1' }}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
        <p className="text-xs leading-relaxed" style={{ color: '#6366f1' }}>
          当前为沙箱模式，点击「确认支付」将模拟完成支付流程。正式上线后将对接真实支付宝支付。
        </p>
      </div>

      {/* 底部按钮 */}
      <div className="flex-1" />
      <div className="sticky bottom-0 px-4 py-4" style={{ background: 'rgba(248,250,252,0.85)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(148,163,184,0.15)' }}>
        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-base disabled:opacity-60 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)', boxShadow: '0 6px 20px rgba(22,119,255,0.35)' }}
        >
          {paying ? '支付中...' : `确认支付 ¥${Number(order.price).toFixed(2)}`}
        </button>
        <button onClick={handleCancel} className="w-full py-2.5 mt-2 text-slate-400 text-sm">
          暂不支付
        </button>
      </div>
    </div>
  )
}
