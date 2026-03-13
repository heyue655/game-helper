import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { getOrder, deliverOrder, closeOrder } from '../api'
import useAuthStore from '../store/auth'

const STATUS_STEPS = [
  { key: 'PENDING_PAY', label: '待付款' },
  { key: 'PENDING_ASSIGN', label: '待分配' },
  { key: 'PENDING_DELIVERY', label: '待交单' },
  { key: 'COMPLETED', label: '已完成' },
]

function useCountdown(targetMs) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    setRemaining(Math.max(0, targetMs - Date.now()))
    if (targetMs <= 0) return
    const t = setInterval(() => setRemaining(Math.max(0, targetMs - Date.now())), 1000)
    return () => clearInterval(t)
  }, [targetMs])
  return remaining
}

function ConfirmSheet({ open, title, desc, confirmLabel, onConfirm, onCancel, danger }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onCancel}>
      <div className="rounded-t-2xl overflow-hidden" onClick={(e) => e.stopPropagation()} style={{ background: '#1a1a1f' }}>
        <div className="px-6 pt-5 pb-3 text-center">
          <p className="text-gray-100 font-semibold text-base">{title}</p>
          {desc && <p className="text-gray-400 text-sm mt-1">{desc}</p>}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            className="w-full py-4 text-base font-semibold"
            style={{ color: danger ? '#e83030' : '#e83030' }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button className="w-full py-4 text-base text-gray-400" onClick={onCancel}>取消</button>
        </div>
        <div style={{ height: 8 }} />
      </div>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const justPaid = searchParams.get('paid') === '1'
  const user = useAuthStore((s) => s.user)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [showPaidTip, setShowPaidTip] = useState(justPaid)
  const [confirmOpen, setConfirmOpen] = useState(false)

  function refresh() { getOrder(id).then((r) => setOrder(r.data)).finally(() => setLoading(false)) }
  useEffect(() => { refresh() }, [id])
  useEffect(() => {
    if (!showPaidTip) return
    const t = setTimeout(() => setShowPaidTip(false), 3000)
    return () => clearTimeout(t)
  }, [showPaidTip])

  const expireMs = order ? new Date(order.createdAt).getTime() + 30 * 60 * 1000 : 0
  const countdown = useCountdown(expireMs)

  useEffect(() => {
    if (!order || order.status !== 'PENDING_PAY' || countdown > 0) return
    closeOrder(id).then(() => refresh()).catch(() => {})
  }, [countdown, order])

  const isAssignee = user && order && String(user.id) === String(order.assigneeId)
  const isClosed = order?.status === 'CLOSED'

  async function handleDeliver() {
    setConfirmOpen(false)
    setActing(true)
    try { await deliverOrder(id); refresh() }
    catch (e) { alert(e.message) }
    finally { setActing(false) }
  }

  async function handleClose() {
    setActing(true)
    try { await closeOrder(id); refresh() }
    catch (e) { alert(e.message) }
    finally { setActing(false) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400" style={{ background: '#0a0a0f' }}>加载中...</div>
  if (!order) return <div className="min-h-screen flex items-center justify-center text-gray-400" style={{ background: '#0a0a0f' }}>订单不存在</div>

  const currentStep = isClosed ? -1 : STATUS_STEPS.findIndex((s) => s.key === order.status)
  const mm = String(Math.floor(countdown / 60000)).padStart(2, '0')
  const ss = String(Math.floor((countdown % 60000) / 1000)).padStart(2, '0')

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0a0a0f' }}>
      <div className="sticky top-0 border-b px-4 h-12 flex items-center" style={{ background: 'rgba(10,10,15,0.85)', borderColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => navigate(-1)} className="text-gray-100 p-1 -ml-1">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
        </button>
        <span className="flex-1 text-center text-gray-100 font-medium">订单详情</span>
        {isAssignee && !isClosed && (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(232,48,48,0.15)', color: '#e83030' }}>我的任务</span>
        )}
      </div>

      {showPaidTip && (
        <div className="mx-4 mt-3 flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0" style={{ color: '#16a34a' }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span className="text-sm font-medium" style={{ color: '#16a34a' }}>支付成功！正在等待商家分配接单人员</span>
        </div>
      )}

      {/* 已关闭状态横幅 */}
      {isClosed && (
        <div className="mx-4 mt-3 flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.25)' }}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0 text-gray-500">
            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
          </svg>
          <span className="text-sm text-gray-400">订单已关闭（超时未付款）</span>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* 进度步骤 */}
        {!isClosed && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(30,30,35,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, i) => (
                <div key={step.key} className="flex-1 flex flex-col items-center relative">
                  {i > 0 && <div className={`absolute top-3 right-1/2 w-full h-0.5 ${i <= currentStep ? 'bg-primary' : 'bg-dark-border'}`} />}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 text-xs font-bold ${i <= currentStep ? 'bg-primary text-white' : 'bg-dark-surface text-gray-500'}`}>
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs mt-1 text-center ${i <= currentStep ? 'text-primary' : 'text-gray-500'}`}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 待付款倒计时 */}
        {order.status === 'PENDING_PAY' && countdown > 0 && (
          <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(30,30,35,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-gray-400 text-sm">请在以下时间内完成支付</span>
            <span className="font-bold tabular-nums" style={{ color: '#e83030', fontSize: 18 }}>{mm}:{ss}</span>
          </div>
        )}

        <div className="rounded-xl p-4 flex gap-3" style={{ background: 'rgba(30,30,35,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {order.product?.thumbnail && <img src={order.product.thumbnail} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
          <div className="flex-1">
            <p className="text-gray-100 text-sm font-medium">{order.productName}</p>
            {order.spec && <p className="text-gray-500 text-xs mt-1">{order.spec}</p>}
            <p className="text-primary font-bold mt-1">￥{Number(order.price).toFixed(2)}</p>
          </div>
        </div>

        <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(30,30,35,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex justify-between"><span className="text-gray-400 text-sm">订单号</span><span className="text-gray-100 text-sm">{order.orderNo}</span></div>
          {order.assignee && <div className="flex justify-between"><span className="text-gray-400 text-sm">接单人</span><span className="text-gray-100 text-sm">{order.assignee.nickname}</span></div>}
          <div className="flex justify-between"><span className="text-gray-400 text-sm">下单时间</span><span className="text-gray-100 text-sm">{new Date(order.createdAt).toLocaleString('zh-CN')}</span></div>
          {order.payTime && <div className="flex justify-between"><span className="text-gray-400 text-sm">支付时间</span><span className="text-gray-100 text-sm">{new Date(order.payTime).toLocaleString('zh-CN')}</span></div>}
          {order.deliverTime && <div className="flex justify-between"><span className="text-gray-400 text-sm">交单时间</span><span className="text-gray-100 text-sm">{new Date(order.deliverTime).toLocaleString('zh-CN')}</span></div>}
          {order.completedAt && <div className="flex justify-between"><span className="text-gray-400 text-sm">完成时间</span><span className="text-gray-100 text-sm">{new Date(order.completedAt).toLocaleString('zh-CN')}</span></div>}
          {order.isComplained && <div className="flex justify-between"><span className="text-gray-400 text-sm">投诉状态</span><span className="text-yellow-400 text-sm">已投诉</span></div>}
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] border-t px-4 py-3 pb-safe space-y-2" style={{ background: '#0a0a0f', borderColor: 'rgba(255,255,255,0.06)' }}>
        {order.status === 'PENDING_PAY' && !isAssignee && countdown > 0 && (
          <button onClick={() => navigate(`/pay/${id}`)} className="w-full text-white rounded-xl py-3 font-bold" style={{ background: 'linear-gradient(135deg, #e83030 0%, #f87171 100%)' }}>
            去支付 ¥{Number(order.price).toFixed(2)}
          </button>
        )}
        {order.status === 'PENDING_DELIVERY' && isAssignee && (
          <button onClick={() => setConfirmOpen(true)} disabled={acting} className="w-full bg-primary text-white rounded-xl py-3 font-bold disabled:opacity-60">
            {acting ? '提交中...' : '确认交单'}
          </button>
        )}
        {order.status === 'COMPLETED' && !order.isComplained && !isAssignee && (
          <button onClick={() => navigate(`/complaint/${order.id}`)} className="w-full border border-primary text-primary rounded-xl py-3 text-sm">
            提交投诉
          </button>
        )}
      </div>

      <ConfirmSheet
        open={confirmOpen}
        title="确认交单"
        desc="交单后订单将直接变为已完成，此操作不可撤销"
        confirmLabel="确认交单"
        danger
        onConfirm={handleDeliver}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
