import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getOrderByNo } from '../api'

/**
 * 支付宝 return_url 跳回页面
 *
 * 支付宝回跳时会携带以下参数（均为 query string）：
 *   out_trade_no  — 即我们下单时传入的 orderNo
 *   trade_no      — 支付宝流水号
 *   total_amount  — 支付金额
 *   sign / ...    — 验签字段（前端仅做展示，真实验签在后端 notify 接口完成）
 *
 * 本页面逻辑：
 *   1. 取 out_trade_no 从后端按 orderNo 查询订单
 *   2. 若订单已付款（非 PENDING_PAY）→ 视为成功，3秒后跳转订单详情
 *   3. 若订单仍为 PENDING_PAY → 支付宝同步回调不一定可靠，提示用户稍候或去订单列表查看
 *   4. 若查询失败 → 提示异常
 */
export default function PayResultPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading | success | pending | error
  const [orderId, setOrderId] = useState(null)
  const [countdown, setCountdown] = useState(3)

  const orderNo = searchParams.get('out_trade_no')

  useEffect(() => {
    if (!orderNo) {
      setStatus('error')
      return
    }
    getOrderByNo(orderNo)
      .then((r) => {
        const order = r.data
        setOrderId(order.id)
        setStatus(order.status === 'PENDING_PAY' ? 'pending' : 'success')
      })
      .catch(() => setStatus('error'))
  }, [orderNo])

  useEffect(() => {
    if (status !== 'success') return
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(t); navigate(`/orders/${orderId}`, { replace: true }); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [status, orderId])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(145deg, #f0f4ff 0%, #fdf4ff 55%, #f0f9fe 100%)' }}
    >
      {status === 'loading' && (
        <p className="text-slate-400 text-sm">查询支付结果...</p>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.12)' }}>
            <svg viewBox="0 0 24 24" fill="#22c55e" className="w-10 h-10">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
          <p className="text-xl font-bold text-slate-800">支付成功</p>
          <p className="text-sm text-slate-400">{countdown} 秒后自动跳转到订单详情</p>
          <button
            onClick={() => navigate(`/orders/${orderId}`, { replace: true })}
            className="mt-2 px-8 py-2.5 rounded-2xl text-white text-sm font-medium"
            style={{ background: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)' }}
          >
            立即查看
          </button>
        </div>
      )}

      {status === 'pending' && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(234,179,8,0.12)' }}>
            <svg viewBox="0 0 24 24" fill="#eab308" className="w-10 h-10">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </div>
          <p className="text-xl font-bold text-slate-800">支付确认中</p>
          <p className="text-sm text-slate-400 text-center leading-relaxed">
            支付结果正在处理，请稍候片刻后前往订单列表查看
          </p>
          <button
            onClick={() => navigate('/orders', { replace: true })}
            className="mt-2 px-8 py-2.5 rounded-2xl text-white text-sm font-medium"
            style={{ background: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)' }}
          >
            前往订单列表
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.10)' }}>
            <svg viewBox="0 0 24 24" fill="#ef4444" className="w-10 h-10">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </div>
          <p className="text-xl font-bold text-slate-800">查询异常</p>
          <p className="text-sm text-slate-400">无法获取订单信息，请前往订单列表查看</p>
          <button
            onClick={() => navigate('/orders', { replace: true })}
            className="mt-2 px-8 py-2.5 rounded-2xl text-white text-sm font-medium"
            style={{ background: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)' }}
          >
            前往订单列表
          </button>
        </div>
      )}
    </div>
  )
}
