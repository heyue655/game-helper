import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import useAuthStore from '../store/auth'
import { getMe, getOrderCounts } from '../api'

const ORDER_TABS = [
    { key: 'ALL', label: '全部' },
    { key: 'PENDING_PAY', label: '待付款' },
    { key: 'PENDING_ASSIGN', label: '待分配' },
    { key: 'PENDING_DELIVERY', label: '待交单' },
]

function Badge({ count }) {
    if (!count) return null
    return (
        <span
            className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center text-white font-bold"
            style={{ fontSize: 10, background: '#e83030', lineHeight: 1 }}
        >
            {count > 99 ? '99+' : count}
        </span>
    )
}

export default function MyPage() {
    const navigate = useNavigate()
    const { user, token, setUser, logout } = useAuthStore()
    const [counts, setCounts] = useState({})

    useEffect(() => {
        if (token && !user) getMe().then((r) => setUser(r.data)).catch(() => { })
    }, [token])

    useEffect(() => {
        if (!token) return
        getOrderCounts().then((r) => setCounts(r.data || {})).catch(() => { })
    }, [token])

    return (
        <PageLayout>
            <div className="relative h-52 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(232,48,48,0.15) 0%, rgba(168,85,247,0.12) 100%)' }}>
                <div className="absolute -top-10 -right-8 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(232,48,48,0.2) 0%, transparent 70%)', filter: 'blur(40px)' }} />
                <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                    <div
                        className="w-16 h-16 rounded-full overflow-hidden cursor-pointer"
                        style={{ background: 'rgba(30,30,35,0.9)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
                        onClick={() => (token ? navigate('/profile/edit') : navigate('/login'))}
                    >
                        {user?.avatar
                            ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                            : <svg viewBox="0 0 24 24" fill="#6b7280" className="w-full h-full p-2"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
                        }
                    </div>
                    {token && user
                        ? <p className="text-gray-100 font-semibold mt-3">{user.nickname}</p>
                        : <button onClick={() => navigate('/login')} className="mt-3 bg-primary text-white text-sm px-5 py-2 rounded-full font-medium" style={{ boxShadow: '0 2px 10px rgba(232,48,48,0.3)' }}>立即登录</button>
                    }
                </div>
            </div>

            <div className="px-4 space-y-3 pb-4 -mt-5 relative z-[1]">
                <div className="rounded-2xl p-4" style={{ background: 'rgba(30,30,35,0.8)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-100 font-medium">我的订单</span>
                        <button onClick={() => navigate('/orders')} className="text-gray-500 text-xs bg-transparent">全部 &gt;</button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {ORDER_TABS.map((tab) => (
                            <button key={tab.key} onClick={() => navigate('/orders?status=' + tab.key)} className="flex flex-col items-center gap-1 py-2 bg-transparent">
                                <div className="relative w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(45,45,55,0.8)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                                    <svg viewBox="0 0 24 24" fill="#6b7280" className="w-5 h-5"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
                                    <Badge count={counts[tab.key]} />
                                </div>
                                <span className="text-gray-500 text-xs">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(30,30,35,0.8)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                    {[
                        { label: '我的任务', to: '/my-tasks', badge: counts.taskPendingDelivery },
                        { label: '我的收益', to: '/earnings', badge: 0 },
                        { label: '我的收藏', to: '/favorites', badge: 0 },
                        { label: '我的投诉', to: '/orders?tab=COMPLETED', badge: 0 },
                        { label: '关于我们', to: '/', badge: 0 },
                    ].map((item, i, arr) => (
                        <button
                            key={item.label}
                            onClick={() => (token ? navigate(item.to) : navigate('/login'))}
                            className={'w-full flex items-center gap-3 px-4 py-4 text-left bg-transparent active:bg-white/10' + (i < arr.length - 1 ? ' border-b' : '')}
                            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                        >
                            <span className="text-gray-100 text-sm flex-1">{item.label}</span>
                            {!!item.badge && (
                                <span className="min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-white font-bold" style={{ fontSize: 11, background: '#e83030' }}>
                                    {item.badge > 99 ? '99+' : item.badge}
                                </span>
                            )}
                            <svg viewBox="0 0 24 24" fill="#6b7280" className="w-4 h-4 flex-shrink-0"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" /></svg>
                        </button>
                    ))}
                </div>

                {token && (
                    <button onClick={() => { logout(); navigate('/') }} className="w-full rounded-2xl py-4 text-sm font-medium" style={{ background: 'rgba(30,30,35,0.8)', border: '1px solid rgba(255,255,255,0.08)', color: '#e83030' }}>
                        退出登录
                    </button>
                )}
            </div>
        </PageLayout>
    )
}
