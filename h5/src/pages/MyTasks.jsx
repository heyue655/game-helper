import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyTasks } from '../api'

const STATUS_LABEL = { PENDING_DELIVERY: '待交单', COMPLETED: '已交单' }
const STATUS_STYLE = {
    PENDING_DELIVERY: { background: 'rgba(232,48,48,0.15)', color: '#e83030' },
    COMPLETED: { background: 'rgba(34,197,94,0.15)', color: '#22c55e' },
}

export default function MyTasksPage() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [pendingCount, setPendingCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getMyTasks({ pageSize: 100 })
            .then((r) => {
                const items = r.data?.items || []
                setOrders(items)
                setPendingCount(items.filter((o) => o.status === 'PENDING_DELIVERY').length)
            })
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
            <div className="sticky top-0 border-b px-4 h-12 flex items-center" style={{ background: 'rgba(10,10,15, 0.85)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <button onClick={() => navigate(-1)} className="text-gray-100 p-1 -ml-1">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
                </button>
                <span className="flex-1 text-center text-gray-100 font-medium">我的任务</span>
                {pendingCount > 0 && (
                    <span
                        className="min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ fontSize: 11, background: '#e83030' }}
                    >
                        {pendingCount > 99 ? '99+' : pendingCount}
                    </span>
                )}
            </div>

            <div className="p-4 space-y-3">
                {loading && <div className="text-center text-gray-400 py-8">加载中...</div>}
                {!loading && orders.length === 0 && (
                    <div className="text-center text-gray-500 py-16">暂无任务记录</div>
                )}
                {!loading && orders.length > 0 && (
                    <>
                        {/* 待交单分组 */}
                        {orders.some((o) => o.status === 'PENDING_DELIVERY') && (
                            <p className="text-gray-400 text-xs font-medium px-1">进行中</p>
                        )}
                        {orders.filter((o) => o.status === 'PENDING_DELIVERY').map((order) => (
                            <TaskCard key={order.id} order={order} navigate={navigate} />
                        ))}

                        {/* 已交单分组 */}
                        {orders.some((o) => o.status === 'COMPLETED') && (
                            <p className="text-gray-400 text-xs font-medium px-1 pt-2">已完成</p>
                        )}
                        {orders.filter((o) => o.status === 'COMPLETED').map((order) => (
                            <TaskCard key={order.id} order={order} navigate={navigate} />
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}

function TaskCard({ order, navigate }) {
    return (
        <div
            className="rounded-xl p-4 cursor-pointer active:opacity-80"
            style={{ background: 'rgba(30,30,35, 0.8)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
            onClick={() => navigate(`/orders/${order.id}`)}
        >
            <div className="flex justify-between mb-2">
                <span className="text-gray-500 text-xs">{order.orderNo}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={STATUS_STYLE[order.status] || {}}>
                    {STATUS_LABEL[order.status] || order.status}
                </span>
            </div>
            <p className="text-gray-100 text-sm font-medium mb-1">{order.productName}</p>
            {order.spec && <p className="text-gray-500 text-xs mb-1">{order.spec}</p>}
            <div className="flex items-center justify-between mt-1">
                <span className="text-primary font-bold">￥{Number(order.price).toFixed(2)}</span>
                <span className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
        </div>
    )
}
