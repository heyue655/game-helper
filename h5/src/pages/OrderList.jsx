import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getOrders } from '../api'

const STATUS_MAP = {
    PENDING_PAY: { label: '待付款', color: 'text-yellow-400' },
    PENDING_ASSIGN: { label: '待分配', color: 'text-blue-400' },
    PENDING_DELIVERY: { label: '待交单', color: 'text-purple-400' },
    PENDING_REVIEW: { label: '待确认', color: 'text-orange-400' },
    COMPLETED: { label: '已完成', color: 'text-green-400' },
    PENDING_SETTLEMENT: { label: '待结算', color: 'text-gray-400' },
    SETTLED: { label: '已结算', color: 'text-gray-500' },
}

const TABS = [
    { key: 'ALL', label: '全部' },
    { key: 'PENDING_PAY', label: '待付款' },
    { key: 'PENDING_ASSIGN', label: '待分配' },
    { key: 'PENDING_DELIVERY', label: '待交单' },
]

export default function OrderListPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [activeTab, setActiveTab] = useState(searchParams.get('status') || 'ALL')
    const [orders, setOrders] = useState([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const loaderRef = useRef(null)

    const fetchOrders = useCallback(async (nextPage = 1, replace = false) => {
        if (loading) return
        setLoading(true)
        try {
            const res = await getOrders({ status: activeTab === 'ALL' ? '' : activeTab, page: nextPage, pageSize: 10 })
            const items = res.data?.items || []
            setOrders((prev) => (replace ? items : [...prev, ...items]))
            setHasMore(items.length === 10)
            setPage(nextPage)
        } finally {
            setLoading(false)
        }
    }, [activeTab, loading])

    useEffect(() => {
        setOrders([])
        setPage(1)
        setHasMore(true)
        fetchOrders(1, true)
    }, [activeTab])

    useEffect(() => {
        if (!loaderRef.current) return
        const ob = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loading) fetchOrders(page + 1)
        }, { threshold: 0.1 })
        ob.observe(loaderRef.current)
        return () => ob.disconnect()
    }, [hasMore, loading, page, fetchOrders])

    return (
        <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
            <div className="sticky top-0 z-10 border-b border-dark-border" style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                <div className="flex items-center px-4 h-12">
                    <button onClick={() => navigate(-1)} className="text-gray-100 p-1 -ml-1">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
                    </button>
                    <span className="flex-1 text-center text-gray-100 font-medium">我的订单</span>
                </div>
                <div className="flex border-t border-dark-border">
                    {TABS.map((tab) => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 py-3 text-sm transition-colors ${activeTab === tab.key ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 space-y-3">
                {orders.map((order) => {
                    const s = STATUS_MAP[order.status] || { label: order.status, color: 'text-gray-400' }
                    return (
                        <div key={order.id} className="bg-dark-card rounded-xl p-4 cursor-pointer active:opacity-80" onClick={() => navigate(`/orders/${order.id}`)}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-500 text-xs">订单号：{order.orderNo}</span>
                                <span className={`text-xs font-medium ${s.color}`}>{s.label}</span>
                            </div>
                            <div className="flex gap-3">
                                {order.product?.thumbnail && (
                                    <img src={order.product.thumbnail} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                    <p className="text-gray-100 text-sm font-medium line-clamp-2">{order.productName}</p>
                                    {order.spec && <p className="text-gray-500 text-xs mt-1">{order.spec}</p>}
                                    <p className="text-primary font-bold mt-1">￥{Number(order.price).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={loaderRef} className="py-4 text-center text-gray-400 text-sm">
                    {loading ? '加载中...' : !hasMore && orders.length > 0 ? '没有更多了' : ''}
                </div>
                {!loading && orders.length === 0 && <div className="text-center text-gray-500 py-16">暂无订单</div>}
            </div>
        </div>
    )
}
