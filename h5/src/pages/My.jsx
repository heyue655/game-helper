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
    if (token && !user) getMe().then((r) => setUser(r.data)).catch(() => {})
  }, [token])

  useEffect(() => {
    if (!token) return
    getOrderCounts().then((r) => setCounts(r.data || {})).catch(() => {})
  }, [token])

  return (
    <PageLayout>
      <div className="relative h-52 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.16) 50%, rgba(236,72,153,0.12) 100%)' }} />
        <div className="absolute -top-10 -right-8 w-40 h-40 rounded-full bg-indigo-300/25 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-pink-300/20 blur-3xl" />
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <div className="w-16 h-16 rounded-full bg-dark-surface border border-white/70 overflow-hidden cursor-pointer shadow-sm" onClick={() => (token ? navigate('/profile/edit') : navigate('/login'))}>
            {user?.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : <svg viewBox="0 0 24 24" fill="#94a3b8" className="w-full h-full p-2"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>}
          </div>
          {token && user
            ? <p className="text-slate-800 font-semibold mt-3">{user.nickname}</p>
            : <button onClick={() => navigate('/login')} className="mt-3 bg-primary text-white text-sm px-5 py-2 rounded-full font-medium shadow-sm">立即登录</button>
          }
        </div>
      </div>

      <div className="px-4 space-y-3 pb-4 -mt-5 relative z-[1]">
        {/* 订单入口 */}
        <div className="bg-dark-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-medium">我的订单</span>
            <button onClick={() => navigate('/orders')} className="text-gray-400 text-xs bg-transparent">全部 &gt;</button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {ORDER_TABS.map((tab) => (
              <button key={tab.key} onClick={() => navigate('/orders?status=' + tab.key)} className="flex flex-col items-center gap-1 py-2 bg-transparent">
                <div className="relative w-10 h-10 rounded-full bg-dark-surface flex items-center justify-center shadow-sm">
                  <svg viewBox="0 0 24 24" fill="#94a3b8" className="w-5 h-5"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
                  <Badge count={counts[tab.key]} />
                </div>
                <span className="text-gray-400 text-xs">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 功能菜单 */}
        <div className="bg-dark-card rounded-2xl overflow-hidden">
          {[
            { label: '我的任务', to: '/my-tasks', badge: counts.taskPendingDelivery },
            { label: '我的收藏', to: '/favorites', badge: 0 },
            { label: '我的投诉', to: '/orders?tab=COMPLETED', badge: 0 },
            { label: '关于我们', to: '/', badge: 0 },
          ].map((item, i, arr) => (
            <button
              key={item.label}
              onClick={() => (token ? navigate(item.to) : navigate('/login'))}
              className={'w-full flex items-center gap-3 px-4 py-4 text-left bg-transparent active:bg-white/60' + (i < arr.length - 1 ? ' border-b border-dark-border' : '')}
            >
              <span className="text-white text-sm flex-1">{item.label}</span>
              {!!item.badge && (
                <span
                  className="min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ fontSize: 11, background: '#e83030' }}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
              <svg viewBox="0 0 24 24" fill="#94a3b8" className="w-4 h-4 flex-shrink-0"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" /></svg>
            </button>
          ))}
        </div>

        {token && (
          <button onClick={() => { logout(); navigate('/') }} className="w-full bg-dark-card text-primary rounded-2xl py-4 text-sm font-medium">
            退出登录
          </button>
        )}
      </div>
    </PageLayout>
  )
}
