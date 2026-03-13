import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getOrderByNo } from '../api'
import useAuthStore from '../store/auth'

export default function PayResultPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [status, setStatus] = useState('loading')
    const [orderId, setOrderId] = useState(null)
    const [countdown, setCountdown] = useState(3)
    const { exchangeCode } = useAuthStore()
  
    const orderNo = searchParams.get('out_trade_no')
    const authCode = searchParams.get('authCode')
  
    useEffect(() => {
        const init = async () => {
            if (authCode) {
                const result = await exchangeCode(authCode)
                if (!result.success) {
                    console.warn('[PayResult] exchangeCode failed:', result.error)
                }
            }

            if (!orderNo) {
                setStatus('error')
                return
            }

            try {
                const r = await getOrderByNo(orderNo)
                const order = r.data
                setOrderId(order.id)
                setStatus(order.status === 'PENDING_PAY' ? 'pending' : 'success')
            } catch {
                setStatus('error')
            }
        }
        init()
    }, [orderNo, authCode])
  
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
            style={{ background: '#0a0a0f' }}
        >
            {status === 'loading' && (
                <p className="text-gray-400 text-sm">查询支付结果...</p>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.12)' }}>
                        <svg viewBox="0 0 24 24" fill="#22c55e" className="w-10 h-10">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                    </div>
                    <p className="text-xl font-bold text-gray-100">支付成功</p>
                    <p className="text-sm text-gray-400">{countdown} 秒后自动跳转到订单详情</p>
                    <button
                        onClick={() => navigate(`/orders/${orderId}`, { replace: true })}
                        className="mt-2 px-8 py-2.5 rounded-2xl text-white text-sm font-medium"
                        style={{ background: 'linear-gradient(135deg, #e83030 0%, #f87171 100%)' }}
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
                    <p className="text-xl font-bold text-gray-100">支付确认中</p>
                    <p className="text-sm text-gray-400 text-center leading-relaxed">
                        支付结果正在处理，请稍候片刻后前往订单列表查看
                    </p>
                    <button
                        onClick={() => navigate('/orders', { replace: true })}
                        className="mt-2 px-8 py-2.5 rounded-2xl text-white text-sm font-medium"
                        style={{ background: 'linear-gradient(135deg, #e83030 0%, #f87171 100%)' }}
                    >
                        前往订单列表
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                        <svg viewBox="0 0 24 24" fill="#ef4444" className="w-10 h-10">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 17.59 6.41 19 12 13.41 17.59 19 12 12 13.41 17.59 10 6.41z" />
                        </svg>
                    </div>
                    <p className="text-xl font-bold text-gray-100">查询异常</p>
                    <p className="text-sm text-gray-400">无法获取订单信息，请前往订单列表查看</p>
                    <button
                        onClick={() => navigate('/orders', { replace: true })}
                        className="mt-2 px-8 py-2.5 rounded-2xl text-white text-sm font-medium"
                        style={{ background: 'linear-gradient(135deg, #e83030 0%, #f87171 100%)' }}
                    >
                        前往订单列表
                    </button>
                </div>
            )}
        </div>
    )
}
