import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getOrder, getOrderPayUrl } from '../api'

export default function PayPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { state } = useLocation()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

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
                } else {
                    getOrderPayUrl(id).then((res) => {
                        if (res.data?.payUrl) {
                            window.location.href = res.data.payUrl
                        } else {
                            setError('获取支付链接失败')
                        }
                    }).catch((e) => {
                        setError(e.message || '获取支付链接失败')
                    })
                }
            })
            .catch(() => navigate('/orders', { replace: true }))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
                <span className="text-gray-400 text-sm">正在跳转支付宝...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#0a0a0f' }}>
                <span className="text-red-400 text-sm mb-4">{error}</span>
                <button onClick={() => navigate(`/orders/${id}`)} className="text-primary text-sm">返回订单详情</button>
            </div>
        )
    }

    return null
}
