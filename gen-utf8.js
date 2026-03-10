// gen-utf8.js - generates JSX files with correct UTF-8 Chinese characters
const fs = require('fs')
const path = require('path')

function w(rel, content) {
  const full = path.join(__dirname, rel)
  fs.writeFileSync(full, content, 'utf8')
  console.log('wrote', rel)
}

// ===== H5 =====

w('h5/src/components/ProductCard.jsx', `import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  return (
    <div
      className="bg-dark-card rounded-xl overflow-hidden cursor-pointer active:opacity-80"
      onClick={() => navigate(\`/product/\${product.id}\`)}
    >
      <div className="aspect-square bg-dark-surface overflow-hidden">
        {product.thumbnail ? (
          <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="text-white text-sm font-medium line-clamp-2 leading-tight mb-1">{product.name}</p>
        <p className="text-gray-500 text-xs mb-1">\u9500\u91cf {product.sales}&nbsp;&nbsp;\u6d4f\u89c8 {product.views}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-primary font-bold text-sm">\uffe5{Number(product.price).toFixed(2)}</span>
          <span className="text-gray-500 text-xs line-through">\uffe5{Number(product.originalPrice).toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
`)

w('h5/src/pages/Complaint.jsx', `import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { complainOrder } from '../api'

export default function ComplaintPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!reason.trim()) return alert('\u8bf7\u586b\u5199\u6295\u8bc9\u539f\u56e0')
    setSubmitting(true)
    try {
      await complainOrder(orderId, reason.trim())
      alert('\u6295\u8bc9\u5df2\u63d0\u4ea4')
      navigate(-1)
    } catch (e) { alert(e.message) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="sticky top-0 bg-dark border-b border-dark-border px-4 h-12 flex items-center">
        <button onClick={() => navigate(-1)} className="text-white p-1 -ml-1">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <span className="flex-1 text-center text-white font-medium">\u6295\u8bc9</span>
      </div>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-dark-card rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-3">\u8bf7\u8be6\u7ec6\u63cf\u8ff0\u6295\u8bc9\u539f\u56e0\uff0c\u5de5\u4f5c\u4eba\u5458\u4f1a\u5c3d\u5feb\u5904\u7406</p>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="\u8bf7\u8f93\u5165\u6295\u8bc9\u539f\u56e0..." rows={6} maxLength={500}
            className="w-full bg-dark-surface text-white text-sm rounded-lg p-3 outline-none resize-none placeholder-gray-500" />
          <p className="text-gray-500 text-xs text-right mt-1">{reason.length}/500</p>
        </div>
        <button type="submit" disabled={submitting} className="w-full bg-primary text-white rounded-xl py-3 font-bold disabled:opacity-60">
          {submitting ? '\u63d0\u4ea4\u4e2d...' : '\u63d0\u4ea4\u6295\u8bc9'}
        </button>
      </form>
    </div>
  )
}
`)

w('h5/src/pages/Favorites.jsx', `import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFavorites } from '../api'
import ProductCard from '../components/ProductCard'

export default function FavoritesPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFavorites({ pageSize: 50 })
      .then((r) => setItems((r.data?.items || []).map((f) => f.product)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-dark">
      <div className="sticky top-0 bg-dark border-b border-dark-border px-4 h-12 flex items-center">
        <button onClick={() => navigate(-1)} className="text-white p-1 -ml-1">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <span className="flex-1 text-center text-white font-medium">\u6211\u7684\u6536\u85cf</span>
      </div>
      <div className="p-4">
        {loading && <div className="text-center text-gray-400 py-8">\u52a0\u8f7d\u4e2d...</div>}
        {!loading && items.length === 0 && <div className="text-center text-gray-500 py-16">\u6682\u65e0\u6536\u85cf</div>}
        <div className="grid grid-cols-2 gap-3">
          {items.map((p) => p && <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  )
}
`)

w('h5/src/pages/Login.jsx', `import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendCode, login } from '../api'
import useAuthStore from '../store/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  async function handleSendCode() {
    if (!/^1[3-9]\\d{9}$/.test(phone)) return setError('\u624b\u673a\u53f7\u683c\u5f0f\u4e0d\u6b63\u786e')
    try { await sendCode(phone); setCountdown(60); setError('') }
    catch (e) { setError(e.message) }
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!phone || !code) return setError('\u8bf7\u586b\u5199\u624b\u673a\u53f7\u548c\u9a8c\u8bc1\u7801')
    setLoading(true)
    try { const res = await login(phone, code); setAuth(res.data.user, res.data.token); navigate(-1) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-gold text-2xl font-bold mb-8 text-center">\u767b\u5f55</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="\u8bf7\u8f93\u5165\u624b\u673a\u53f7"
            maxLength={11} className="w-full bg-dark-surface text-white rounded-xl px-4 py-3 outline-none text-sm placeholder-gray-500" />
          <div className="flex gap-2">
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="\u8bf7\u8f93\u5165\u9a8c\u8bc1\u7801"
              maxLength={6} className="flex-1 bg-dark-surface text-white rounded-xl px-4 py-3 outline-none text-sm placeholder-gray-500" />
            <button type="button" onClick={handleSendCode} disabled={countdown > 0}
              className="whitespace-nowrap bg-primary text-white rounded-xl px-4 py-3 text-sm disabled:bg-gray-600 disabled:cursor-not-allowed">
              {countdown > 0 ? \`\${countdown}s\` : '\u83b7\u53d6\u9a8c\u8bc1\u7801'}
            </button>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-primary text-white rounded-xl py-3 font-bold text-base disabled:opacity-60">
            {loading ? '\u767b\u5f55\u4e2d...' : '\u767b\u5f55'}
          </button>
        </form>
      </div>
    </div>
  )
}
`)

w('h5/src/pages/My.jsx', `import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import useAuthStore from '../store/auth'
import { getMe } from '../api'

const ORDER_TABS = [
  { key: 'ALL', label: '\u5168\u90e8' },
  { key: 'PENDING_PAY', label: '\u5f85\u4ed8\u6b3e' },
  { key: 'PENDING_ASSIGN', label: '\u5f85\u5206\u914d' },
  { key: 'PENDING_DELIVERY', label: '\u5f85\u4ea4\u5355' },
]

const MENU_ITEMS = [
  { label: '\u6211\u7684\u4efb\u52a1', to: '/my-tasks' },
  { label: '\u6211\u7684\u6536\u85cf', to: '/favorites' },
  { label: '\u6211\u7684\u6295\u8bc9', to: '/orders?tab=COMPLETED' },
  { label: '\u5173\u4e8e\u6211\u4eec', to: '/about' },
]

export default function MyPage() {
  const navigate = useNavigate()
  const { user, token, setUser, logout } = useAuthStore()

  useEffect(() => {
    if (token && !user) getMe().then((r) => setUser(r.data)).catch(() => {})
  }, [token])

  return (
    <PageLayout>
      <div className="relative h-48 bg-gradient-to-b from-indigo-900 via-purple-900 to-dark overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=480')" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <div className="w-16 h-16 rounded-full bg-dark-surface border-2 border-gold overflow-hidden cursor-pointer"
            onClick={() => (token ? navigate('/profile/edit') : navigate('/login'))}>
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              : <svg viewBox="0 0 24 24" fill="#888" className="w-full h-full p-2"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>}
          </div>
          {token && user
            ? <p className="text-white font-medium mt-2">{user.nickname}</p>
            : <button onClick={() => navigate('/login')} className="mt-2 bg-primary text-white text-sm px-5 py-1.5 rounded-full font-medium">\u7acb\u5373\u767b\u5f55</button>}
        </div>
      </div>
      <div className="px-4 space-y-3 pb-4">
        <div className="bg-dark-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-medium">\u6211\u7684\u8ba2\u5355</span>
            <button onClick={() => navigate('/orders')} className="text-gray-400 text-xs">\u5168\u90e8 &gt;</button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {ORDER_TABS.map((tab) => (
              <button key={tab.key} onClick={() => navigate('/orders?status=' + tab.key)} className="flex flex-col items-center gap-1 py-2">
                <div className="w-10 h-10 rounded-full bg-dark-surface flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="#888" className="w-5 h-5"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
                </div>
                <span className="text-gray-400 text-xs">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-dark-card rounded-xl overflow-hidden">
          {MENU_ITEMS.map((item, i) => (
            <button key={item.label} onClick={() => (token ? navigate(item.to) : navigate('/login'))}
              className={'w-full flex items-center gap-3 px-4 py-4 text-left active:bg-dark-surface' + (i < MENU_ITEMS.length - 1 ? ' border-b border-dark-border' : '')}>
              <span className="text-white text-sm flex-1">{item.label}</span>
              <svg viewBox="0 0 24 24" fill="#888" className="w-4 h-4"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" /></svg>
            </button>
          ))}
        </div>
        {token && (
          <button onClick={() => { logout(); navigate('/') }} className="w-full bg-dark-card text-primary rounded-xl py-4 text-sm font-medium">
            \u9000\u51fa\u767b\u5f55
          </button>
        )}
      </div>
    </PageLayout>
  )
}
`)

w('h5/src/pages/MyTasks.jsx', `import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders } from '../api'

export default function MyTasksPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrders({ status: 'PENDING_DELIVERY', pageSize: 50 })
      .then((r) => setOrders(r.data?.items || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-dark">
      <div className="sticky top-0 bg-dark border-b border-dark-border px-4 h-12 flex items-center">
        <button onClick={() => navigate(-1)} className="text-white p-1 -ml-1">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
        </button>
        <span className="flex-1 text-center text-white font-medium">\u6211\u7684\u4efb\u52a1</span>
      </div>
      <div className="p-4 space-y-3">
        {loading && <div className="text-center text-gray-400 py-8">\u52a0\u8f7d\u4e2d...</div>}
        {!loading && orders.length === 0 && <div className="text-center text-gray-500 py-16">\u6682\u65e0\u8fdb\u884c\u4e2d\u7684\u4efb\u52a1</div>}
        {orders.map((order) => (
          <div key={order.id} className="bg-dark-card rounded-xl p-4 cursor-pointer active:opacity-80" onClick={() => navigate(\`/orders/\${order.id}\`)}>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500 text-xs">{order.orderNo}</span>
              <span className="text-purple-400 text-xs font-medium">\u5f85\u4ea4\u5355</span>
            </div>
            <p className="text-white text-sm font-medium mb-1">{order.productName}</p>
            <p className="text-primary font-bold">\uffe5{Number(order.price).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
`)

w('h5/src/pages/OrderDetail.jsx', `import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrder, reviewOrder } from '../api'

const STATUS_STEPS = [
  { key: 'PENDING_PAY', label: '\u5f85\u4ed8\u6b3e' },
  { key: 'PENDING_ASSIGN', label: '\u5f85\u5206\u914d' },
  { key: 'PENDING_DELIVERY', label: '\u5f85\u4ea4\u5355' },
  { key: 'PENDING_REVIEW', label: '\u5f85\u786e\u8ba4' },
  { key: 'COMPLETED', label: '\u5df2\u5b8c\u6210' },
]

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState(false)

  function refresh() { getOrder(id).then((r) => setOrder(r.data)).finally(() => setLoading(false)) }
  useEffect(() => { refresh() }, [id])

  async function handleReview() {
    setReviewing(true)
    try { await reviewOrder(id); refresh() }
    catch (e) { alert(e.message) }
    finally { setReviewing(false) }
  }

  if (loading) return <div className="min-h-screen bg-dark flex items-center justify-center text-gray-400">\u52a0\u8f7d\u4e2d...</div>
  if (!order) return <div className="min-h-screen bg-dark flex items-center justify-center text-gray-400">\u8ba2\u5355\u4e0d\u5b58\u5728</div>

  const currentStep = STATUS_STEPS.findIndex((s) => s.key === order.status)

  return (
    <div className="min-h-screen bg-dark pb-24">
      <div className="sticky top-0 bg-dark border-b border-dark-border px-4 h-12 flex items-center">
        <button onClick={() => navigate(-1)} className="text-white p-1 -ml-1">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
        </button>
        <span className="flex-1 text-center text-white font-medium">\u8ba2\u5355\u8be6\u60c5</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="bg-dark-card rounded-xl p-4">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, i) => (
              <div key={step.key} className="flex-1 flex flex-col items-center relative">
                {i > 0 && <div className={\`absolute top-3 right-1/2 w-full h-0.5 \${i <= currentStep ? 'bg-primary' : 'bg-dark-border'}\`} />}
                <div className={\`w-6 h-6 rounded-full flex items-center justify-center z-10 text-xs font-bold \${i <= currentStep ? 'bg-primary text-white' : 'bg-dark-surface text-gray-500'}\`}>
                  {i < currentStep ? '\u2713' : i + 1}
                </div>
                <span className={\`text-xs mt-1 text-center \${i <= currentStep ? 'text-primary' : 'text-gray-500'}\`}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-dark-card rounded-xl p-4 flex gap-3">
          {order.product?.thumbnail && <img src={order.product.thumbnail} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
          <div className="flex-1">
            <p className="text-white text-sm font-medium">{order.productName}</p>
            {order.spec && <p className="text-gray-500 text-xs mt-1">{order.spec}</p>}
            <p className="text-primary font-bold mt-1">\uffe5{Number(order.price).toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-dark-card rounded-xl p-4 space-y-2">
          <div className="flex justify-between"><span className="text-gray-400 text-sm">\u8ba2\u5355\u53f7</span><span className="text-white text-sm">{order.orderNo}</span></div>
          {order.assignee && <div className="flex justify-between"><span className="text-gray-400 text-sm">\u63a5\u5355\u4eba</span><span className="text-white text-sm">{order.assignee.nickname}</span></div>}
          <div className="flex justify-between"><span className="text-gray-400 text-sm">\u4e0b\u5355\u65f6\u95f4</span><span className="text-white text-sm">{new Date(order.createdAt).toLocaleString('zh-CN')}</span></div>
          {order.isComplained && <div className="flex justify-between"><span className="text-gray-400 text-sm">\u6295\u8bc9\u72b6\u6001</span><span className="text-yellow-400 text-sm">\u5df2\u6295\u8bc9</span></div>}
        </div>
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-dark border-t border-dark-border px-4 py-3 pb-safe space-y-2">
        {order.status === 'PENDING_REVIEW' && (
          <button onClick={handleReview} disabled={reviewing} className="w-full bg-primary text-white rounded-xl py-3 font-bold disabled:opacity-60">
            {reviewing ? '\u786e\u8ba4\u4e2d...' : '\u786e\u8ba4\u6536\u5230\uff0c\u5b8c\u6210\u8ba2\u5355'}
          </button>
        )}
        {order.status === 'COMPLETED' && !order.isComplained && (
          <button onClick={() => navigate(\`/complaint/\${order.id}\`)} className="w-full border border-primary text-primary rounded-xl py-3 text-sm">
            \u63d0\u4ea4\u6295\u8bc9
          </button>
        )}
      </div>
    </div>
  )
}
`)

w('h5/src/pages/OrderList.jsx', `import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getOrders } from '../api'

const STATUS_MAP = {
  PENDING_PAY: { label: '\u5f85\u4ed8\u6b3e', color: 'text-yellow-400' },
  PENDING_ASSIGN: { label: '\u5f85\u5206\u914d', color: 'text-blue-400' },
  PENDING_DELIVERY: { label: '\u5f85\u4ea4\u5355', color: 'text-purple-400' },
  PENDING_REVIEW: { label: '\u5f85\u786e\u8ba4', color: 'text-orange-400' },
  COMPLETED: { label: '\u5df2\u5b8c\u6210', color: 'text-green-400' },
  PENDING_SETTLEMENT: { label: '\u5f85\u7ed3\u7b97', color: 'text-gray-400' },
  SETTLED: { label: '\u5df2\u7ed3\u7b97', color: 'text-gray-500' },
}
const TABS = [
  { key: 'ALL', label: '\u5168\u90e8' },
  { key: 'PENDING_PAY', label: '\u5f85\u4ed8\u6b3e' },
  { key: 'PENDING_ASSIGN', label: '\u5f85\u5206\u914d' },
  { key: 'PENDING_DELIVERY', label: '\u5f85\u4ea4\u5355' },
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
    } finally { setLoading(false) }
  }, [activeTab, loading])

  useEffect(() => { setOrders([]); setPage(1); setHasMore(true); fetchOrders(1, true) }, [activeTab])
  useEffect(() => {
    if (!loaderRef.current) return
    const ob = new IntersectionObserver((entries) => { if (entries[0].isIntersecting && hasMore && !loading) fetchOrders(page + 1) }, { threshold: 0.1 })
    ob.observe(loaderRef.current)
    return () => ob.disconnect()
  }, [hasMore, loading, page, fetchOrders])

  return (
    <div className="min-h-screen bg-dark">
      <div className="sticky top-0 bg-dark border-b border-dark-border z-10">
        <div className="flex items-center px-4 h-12">
          <button onClick={() => navigate(-1)} className="text-white p-1 -ml-1">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
          </button>
          <span className="flex-1 text-center text-white font-medium">\u6211\u7684\u8ba2\u5355</span>
        </div>
        <div className="flex border-t border-dark-border">
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={\`flex-1 py-3 text-sm transition-colors \${activeTab === tab.key ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}\`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 space-y-3">
        {orders.map((order) => {
          const s = STATUS_MAP[order.status] || { label: order.status, color: 'text-gray-400' }
          return (
            <div key={order.id} className="bg-dark-card rounded-xl p-4 cursor-pointer active:opacity-80" onClick={() => navigate(\`/orders/\${order.id}\`)}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500 text-xs">\u8ba2\u5355\u53f7\uff1a{order.orderNo}</span>
                <span className={\`text-xs font-medium \${s.color}\`}>{s.label}</span>
              </div>
              <div className="flex gap-3">
                {order.product?.thumbnail && <img src={order.product.thumbnail} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
                <div className="flex-1">
                  <p className="text-white text-sm font-medium line-clamp-2">{order.productName}</p>
                  {order.spec && <p className="text-gray-500 text-xs mt-1">{order.spec}</p>}
                  <p className="text-primary font-bold mt-1">\uffe5{Number(order.price).toFixed(2)}</p>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={loaderRef} className="py-4 text-center text-gray-500 text-sm">
          {loading ? '\u52a0\u8f7d\u4e2d...' : !hasMore && orders.length > 0 ? '\u6ca1\u6709\u66f4\u591a\u4e86' : ''}
        </div>
        {!loading && orders.length === 0 && <div className="text-center text-gray-500 py-16">\u6682\u65e0\u8ba2\u5355</div>}
      </div>
    </div>
  )
}
`)

w('h5/src/pages/ProductDetail.jsx', `import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import { getProduct, getPlatformNote, toggleFavorite, checkFavorite, createOrder } from '../api'
import useAuthStore from '../store/auth'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const [product, setProduct] = useState(null)
  const [platformNote, setPlatformNote] = useState('')
  const [favorited, setFavorited] = useState(false)
  const [selectedSpec, setSelectedSpec] = useState('')
  const [buying, setBuying] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([getProduct(id), getPlatformNote()]).then(([pRes, noteRes]) => {
      const p = pRes.data; setProduct(p); setPlatformNote(noteRes.data?.content || '')
      if (p.specs?.length > 0) setSelectedSpec(p.specs[0].value || p.specs[0])
    }).finally(() => setLoading(false))
    if (token) checkFavorite(id).then((r) => setFavorited(r.data?.favorited || false))
  }, [id, token])

  async function handleFavorite() {
    if (!token) return navigate('/login')
    const res = await toggleFavorite(id); setFavorited(res.data?.favorited)
  }
  async function handleBuy() {
    if (!token) return navigate('/login')
    setBuying(true)
    try {
      const res = await createOrder({ productId: id, spec: selectedSpec })
      const { payUrl, orderId } = res.data
      if (payUrl) window.location.href = payUrl
      else navigate(\`/orders/\${orderId}\`)
    } catch (e) { alert(e.message) }
    finally { setBuying(false) }
  }

  if (loading) return <div className="min-h-screen bg-dark flex items-center justify-center text-gray-400">\u52a0\u8f7d\u4e2d...</div>
  if (!product) return <div className="min-h-screen bg-dark flex items-center justify-center text-gray-400">\u5546\u54c1\u4e0d\u5b58\u5728</div>

  const images = product.images?.length > 0 ? product.images : product.thumbnail ? [product.thumbnail] : []
  const specs = product.specs || []

  return (
    <div className="min-h-screen bg-dark pb-20">
      <div className="sticky top-0 z-10 bg-dark/90 backdrop-blur flex items-center px-4 h-12">
        <button onClick={() => navigate(-1)} className="text-white p-1 -ml-1">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
        </button>
        <span className="flex-1 text-center text-white font-medium">\u5546\u54c1\u8be6\u60c5</span>
      </div>
      {images.length > 0 && (
        <Swiper modules={[Pagination]} pagination={{ clickable: true }} className="w-full aspect-square">
          {images.map((img, i) => <SwiperSlide key={i}><img src={img} alt="" className="w-full h-full object-cover" /></SwiperSlide>)}
        </Swiper>
      )}
      <div className="space-y-3 px-4 mt-3">
        <div className="bg-dark-card rounded-xl p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h1 className="text-white font-bold text-lg leading-tight">{product.name}</h1>
              {product.description && <p className="text-gray-400 text-sm mt-1">{product.description}</p>}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-primary text-2xl font-bold">\uffe5{Number(product.price).toFixed(2)}</span>
                <span className="text-gray-500 text-sm line-through">\uffe5{Number(product.originalPrice).toFixed(2)}</span>
              </div>
            </div>
            <button onClick={handleFavorite} className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <svg viewBox="0 0 24 24" fill={favorited ? '#e83030' : 'none'} stroke={favorited ? '#e83030' : '#888'} strokeWidth="2" className="w-6 h-6">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className={\`text-xs \${favorited ? 'text-primary' : 'text-gray-500'}\`}>{favorited ? '\u5df2\u6536\u85cf' : '\u6536\u85cf'}</span>
            </button>
          </div>
        </div>
        {specs.length > 0 && (
          <div className="bg-dark-card rounded-xl p-4">
            <h3 className="text-white font-medium mb-3">\u89c4\u683c</h3>
            <div className="flex flex-wrap gap-2">
              {specs.map((spec, i) => {
                const val = typeof spec === 'string' ? spec : spec.value || spec.name
                return <button key={i} onClick={() => setSelectedSpec(val)}
                  className={\`px-3 py-1.5 rounded-lg text-sm border transition-colors \${selectedSpec === val ? 'border-primary text-primary bg-primary/10' : 'border-dark-border text-gray-400'}\`}>{val}</button>
              })}
            </div>
          </div>
        )}
        {product.detailContent && (
          <div className="bg-dark-card rounded-xl p-4">
            <h3 className="text-white font-medium mb-3">\u5546\u54c1\u8be6\u60c5</h3>
            <div className="text-gray-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: product.detailContent }} />
          </div>
        )}
        {platformNote && (
          <div className="bg-dark-card rounded-xl p-4">
            <h3 className="text-white font-medium mb-3">\u5e73\u53f0\u8bf4\u660e</h3>
            <div className="text-gray-400 text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: platformNote }} />
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-dark border-t border-dark-border px-4 py-3 pb-safe flex gap-3">
        <a href="tel:400000000" className="flex-shrink-0 bg-dark-surface text-white rounded-xl px-5 py-3 text-sm flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" /></svg>
          \u8054\u7cfb\u5ba2\u670d
        </a>
        <button onClick={handleBuy} disabled={buying} className="flex-1 bg-primary text-white rounded-xl py-3 font-bold text-base disabled:opacity-60">
          {buying ? '\u5904\u7406\u4e2d...' : '\u7acb\u5373\u8d2d\u4e70'}
        </button>
      </div>
    </div>
  )
}
`)

w('h5/src/pages/ProfileEdit.jsx', `import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/auth'
import { getMe, updateProfile } from '../api'

export default function ProfileEditPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [form, setForm] = useState({ nickname: '', gender: 0, age: '', game: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getMe().then((r) => { const u = r.data; setUser(u); setForm({ nickname: u.nickname || '', gender: u.gender || 0, age: u.age || '', game: u.game || '' }) })
  }, [])

  async function handleSave(e) {
    e.preventDefault(); setSaving(true)
    try { await updateProfile({ ...form, age: form.age ? parseInt(form.age) : undefined }); const res = await getMe(); setUser(res.data); navigate(-1) }
    catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="sticky top-0 bg-dark border-b border-dark-border px-4 h-12 flex items-center">
        <button onClick={() => navigate(-1)} className="text-white p-1 -ml-1">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
        </button>
        <span className="flex-1 text-center text-white font-medium">\u7f16\u8f91\u8d44\u6599</span>
      </div>
      <form onSubmit={handleSave} className="p-4 space-y-4">
        <div className="bg-dark-card rounded-xl overflow-hidden divide-y divide-dark-border">
          <label className="flex items-center px-4 py-3 gap-3">
            <span className="text-gray-400 text-sm w-16 flex-shrink-0">\u6635\u79f0</span>
            <input type="text" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              className="flex-1 bg-transparent text-white text-sm outline-none text-right" placeholder="\u8bf7\u8f93\u5165\u6635\u79f0" />
          </label>
          <label className="flex items-center px-4 py-3 gap-3">
            <span className="text-gray-400 text-sm w-16 flex-shrink-0">\u6027\u522b</span>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: parseInt(e.target.value) })} className="flex-1 bg-transparent text-white text-sm outline-none text-right">
              <option value={0}>\u4fdd\u5bc6</option><option value={1}>\u7537</option><option value={2}>\u5973</option>
            </select>
          </label>
          <label className="flex items-center px-4 py-3 gap-3">
            <span className="text-gray-400 text-sm w-16 flex-shrink-0">\u5e74\u9f84</span>
            <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="flex-1 bg-transparent text-white text-sm outline-none text-right" placeholder="\u8bf7\u8f93\u5165\u5e74\u9f84" min="1" max="100" />
          </label>
          <label className="flex items-center px-4 py-3 gap-3">
            <span className="text-gray-400 text-sm w-16 flex-shrink-0">\u6487\u957f\u6e38\u620f</span>
            <input type="text" value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })}
              className="flex-1 bg-transparent text-white text-sm outline-none text-right" placeholder="\u5982\uff1a\u738b\u8005\u8363\u8000" />
          </label>
        </div>
        <button type="submit" disabled={saving} className="w-full bg-primary text-white rounded-xl py-3 font-bold disabled:opacity-60">
          {saving ? '\u4fdd\u5b58\u4e2d...' : '\u4fdd\u5b58'}
        </button>
      </form>
    </div>
  )
}
`)

w('h5/src/pages/Zone.jsx', `import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { getZones, getProducts } from '../api'

function ZoneProductItem({ product }) {
  const navigate = useNavigate()
  return (
    <div className="flex gap-3 bg-dark-card rounded-xl p-3 cursor-pointer active:opacity-80" onClick={() => navigate(\`/product/\${product.id}\`)}>
      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-dark-surface">
        {product.thumbnail ? <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-dark-surface" />}
      </div>
      <div className="flex-1 flex flex-col justify-between py-0.5">
        <p className="text-white text-sm font-medium line-clamp-2">{product.name}</p>
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold text-base">\uffe5{Number(product.price).toFixed(2)}</span>
          <span className="text-gray-500 text-xs line-through">\uffe5{Number(product.originalPrice).toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export default function ZonePage() {
  const [searchParams] = useSearchParams()
  const initialZoneId = searchParams.get('zoneId') ? parseInt(searchParams.get('zoneId')) : null
  const [zones, setZones] = useState([])
  const [activeZoneId, setActiveZoneId] = useState(initialZoneId)
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const loaderRef = useRef(null)

  useEffect(() => { getZones().then((r) => { const list = r.data || []; setZones(list); if (!activeZoneId && list.length > 0) setActiveZoneId(list[0].id) }) }, [])

  const fetchProducts = useCallback(async (nextPage = 1, replace = false) => {
    if (!activeZoneId || loading) return; setLoading(true)
    try {
      const res = await getProducts({ zoneId: activeZoneId, page: nextPage, pageSize: 6 })
      const items = res.data?.items || []
      setProducts((prev) => (replace ? items : [...prev, ...items])); setHasMore(items.length === 6); setPage(nextPage)
    } finally { setLoading(false) }
  }, [activeZoneId, loading])

  useEffect(() => { if (!activeZoneId) return; setProducts([]); setPage(1); setHasMore(true); fetchProducts(1, true) }, [activeZoneId])
  useEffect(() => {
    if (!loaderRef.current) return
    const ob = new IntersectionObserver((entries) => { if (entries[0].isIntersecting && hasMore && !loading) fetchProducts(page + 1) }, { threshold: 0.1 })
    ob.observe(loaderRef.current); return () => ob.disconnect()
  }, [hasMore, loading, page, fetchProducts])

  return (
    <PageLayout>
      <div className="flex h-screen">
        <div className="w-24 bg-dark-card border-r border-dark-border overflow-y-auto scrollbar-hide flex-shrink-0">
          {zones.map((z) => (
            <div key={z.id} onClick={() => setActiveZoneId(z.id)}
              className={\`px-2 py-4 text-xs text-center cursor-pointer border-b border-dark-border transition-colors \${activeZoneId === z.id ? 'text-primary font-bold bg-dark border-l-2 border-l-primary' : 'text-gray-400'}\`}>
              {z.name}
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto pb-16">
          <div className="p-3 space-y-3">
            {products.map((p) => <ZoneProductItem key={p.id} product={p} />)}
            <div ref={loaderRef} className="py-3 text-center text-gray-500 text-xs">
              {loading ? '\u52a0\u8f7d\u4e2d...' : !hasMore && products.length > 0 ? '\u6ca1\u6709\u66f4\u591a\u4e86' : ''}
            </div>
            {!loading && products.length === 0 && <div className="text-center text-gray-500 py-12">\u6682\u65e0\u5546\u54c1</div>}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
`)

// ===== ADMIN =====

w('admin/src/components/Layout.jsx', `import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Typography } from 'antd'
import { DashboardOutlined, ShoppingOutlined, OrderedListOutlined, TeamOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import useAdminStore from '../store/auth'

const { Sider, Header, Content } = Layout
const menuItems = [
  { key: '/dashboard', icon: React.createElement(DashboardOutlined), label: '\u9996\u9875\u770b\u677f' },
  { key: '/products', icon: React.createElement(ShoppingOutlined), label: '\u5546\u54c1\u7ba1\u7406' },
  { key: '/orders', icon: React.createElement(OrderedListOutlined), label: '\u8ba2\u5355\u7ba1\u7406' },
  { key: '/users', icon: React.createElement(TeamOutlined), label: '\u73a9\u5bb6\u7ba1\u7406' },
  { key: '/system', icon: React.createElement(SettingOutlined), label: '\u7cfb\u7edf\u7ba1\u7406' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { admin, logout } = useAdminStore()
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="dark" style={{ background: '#1a1a1a' }}>
        <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #2e2e2e' }}>
          <Typography.Text strong style={{ color: '#c8a054', fontSize: 16 }}>\u6e38\u620f\u63a5\u5355\u7cfb\u7edf</Typography.Text>
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(key)} style={{ background: '#1a1a1a', borderRight: 'none' }} />
      </Sider>
      <Layout>
        <Header style={{ background: '#1a1a1a', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderBottom: '1px solid #2e2e2e' }}>
          <Typography.Text style={{ marginRight: 16, color: '#ccc' }}>
            {admin?.username}\uff08{admin?.role === 'SUPER' ? '\u8d85\u7ea7\u7ba1\u7406\u5458' : '\u7ba1\u7406\u5458'}\uff09
          </Typography.Text>
          <Button icon={React.createElement(LogoutOutlined)} type="text" onClick={() => { logout(); navigate('/login') }} style={{ color: '#888' }}>\u9000\u51fa</Button>
        </Header>
        <Content style={{ padding: 24, background: '#141414', minHeight: 'calc(100vh - 64px)' }}><Outlet /></Content>
      </Layout>
    </Layout>
  )
}
`)

w('admin/src/pages/Login.jsx', `import React from 'react'
import { Form, Input, Button, Card } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../api'
import useAdminStore from '../store/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAdminStore((s) => s.setAuth)
  const [form] = Form.useForm()
  async function onFinish(values) {
    try { const res = await adminLogin(values); setAuth(res.data.admin, res.data.token); navigate('/dashboard') } catch {}
  }
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d' }}>
      <Card title="\u6e38\u620f\u63a5\u5355\u7cfb\u7edf \u7ba1\u7406\u540e\u53f0" style={{ width: 400 }} styles={{ header: { textAlign: 'center', fontSize: 18, fontWeight: 'bold' } }}>
        <Form form={form} onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="username" rules={[{ required: true, message: '\u8bf7\u8f93\u5165\u8d26\u53f7' }]}>
            <Input prefix={React.createElement(UserOutlined)} placeholder="\u8d26\u53f7" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '\u8bf7\u8f93\u5165\u5bc6\u7801' }]}>
            <Input.Password prefix={React.createElement(LockOutlined)} placeholder="\u5bc6\u7801" />
          </Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" block>\u767b\u5f55</Button></Form.Item>
        </Form>
      </Card>
    </div>
  )
}
`)

w('admin/src/pages/Dashboard.jsx', `import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Typography } from 'antd'
import { ShoppingCartOutlined, MoneyCollectOutlined, CheckCircleOutlined, DollarOutlined } from '@ant-design/icons'
import { getDashboard } from '../api'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { getDashboard().then((r) => setData(r.data)).finally(() => setLoading(false)) }, [])
  const stats = data ? [
    { title: '\u4eca\u65e5\u8ba2\u5355\u603b\u989d', value: data.todayOrderAmount, prefix: '\uffe5', icon: React.createElement(ShoppingCartOutlined, { style: { color: '#c8a054' } }), color: '#c8a054' },
    { title: '\u7d2f\u8ba1\u8ba2\u5355\u603b\u989d', value: data.totalOrderAmount, prefix: '\uffe5', icon: React.createElement(MoneyCollectOutlined, { style: { color: '#1677ff' } }), color: '#1677ff' },
    { title: '\u4eca\u65e5\u5f85\u4ea4\u5355', value: data.todayPendingDelivery, suffix: '\u5355', icon: React.createElement(CheckCircleOutlined, { style: { color: '#faad14' } }), color: '#faad14' },
    { title: '\u4eca\u65e5\u5f85\u7ed3\u7b97', value: data.todayPendingSettlement, prefix: '\uffe5', icon: React.createElement(DollarOutlined, { style: { color: '#ff4d4f' } }), color: '#ff4d4f' },
    { title: '\u7d2f\u8ba1\u5df2\u4ea4\u5355', value: data.totalDelivered, suffix: '\u5355', icon: React.createElement(CheckCircleOutlined, { style: { color: '#52c41a' } }), color: '#52c41a' },
    { title: '\u7d2f\u8ba1\u5df2\u7ed3\u7b97', value: data.totalSettled, prefix: '\uffe5', icon: React.createElement(DollarOutlined, { style: { color: '#52c41a' } }), color: '#52c41a' },
  ] : []
  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 24 }}>\u6570\u636e\u770b\u677f</Typography.Title>
      <Row gutter={[16, 16]}>
        {stats.map((s) => (
          <Col xs={24} sm={12} lg={8} key={s.title}>
            <Card loading={loading} style={{ borderColor: '#2e2e2e' }}>
              <Statistic title={s.title} value={s.value ?? 0} precision={s.prefix === '\uffe5' ? 2 : 0} valueStyle={{ color: s.color, fontSize: 28 }}
                prefix={<span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>{s.icon}{s.prefix}</span>} suffix={s.suffix} />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
`)

w('admin/src/pages/Orders.jsx', `import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Tag, Select, Modal, message, Typography, Input } from 'antd'
import { getAdminOrders, assignOrder, deliverOrder, settleOrder, getBuiltinPlayers } from '../api'
import dayjs from 'dayjs'

const STATUS_COLOR = { PENDING_PAY: 'default', PENDING_ASSIGN: 'blue', PENDING_DELIVERY: 'purple', PENDING_REVIEW: 'orange', COMPLETED: 'green', PENDING_SETTLEMENT: 'cyan', SETTLED: 'default' }
const STATUS_LABEL = { PENDING_PAY: '\u5f85\u4ed8\u6b3e', PENDING_ASSIGN: '\u5f85\u5206\u914d', PENDING_DELIVERY: '\u5f85\u4ea4\u5355', PENDING_REVIEW: '\u5f85\u786e\u8ba4', COMPLETED: '\u5df2\u5b8c\u6210', PENDING_SETTLEMENT: '\u5f85\u7ed3\u7b97', SETTLED: '\u5df2\u7ed3\u7b97' }

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [keyword, setKeyword] = useState('')
  const [players, setPlayers] = useState([])
  const [assignModal, setAssignModal] = useState({ open: false, orderId: null })
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  useEffect(() => { getBuiltinPlayers().then((r) => setPlayers(r.data || [])) }, [])

  function fetchOrders(p = page) {
    setLoading(true)
    getAdminOrders({ page: p, pageSize: 20, status: statusFilter, keyword }).then((r) => { setOrders(r.data?.items || []); setTotal(r.data?.total || 0) }).finally(() => setLoading(false))
  }
  useEffect(() => { fetchOrders() }, [page, statusFilter, keyword])

  async function handleAssign() {
    if (!selectedPlayer) return message.warning('\u8bf7\u9009\u62e9\u73a9\u5bb6')
    await assignOrder(assignModal.orderId, selectedPlayer)
    message.success('\u5206\u914d\u6210\u529f'); setAssignModal({ open: false, orderId: null }); setSelectedPlayer(null); fetchOrders()
  }

  const columns = [
    { title: '\u8ba2\u5355\u53f7', dataIndex: 'orderNo', width: 160, ellipsis: true },
    { title: '\u5546\u54c1\u540d\u79f0', dataIndex: 'productName', ellipsis: true },
    { title: '\u73a9\u5bb6\u6635\u79f0', dataIndex: 'user', render: (u) => u?.nickname || '-', width: 100 },
    { title: '\u4ea4\u7531\u8c01\u505a', dataIndex: 'assignee', render: (a) => a?.nickname || '-', width: 100 },
    { title: '\u4ef7\u683c', dataIndex: 'price', width: 90, render: (v) => \`\uffe5\${v}\` },
    { title: '\u72b6\u6001', dataIndex: 'status', width: 100, render: (v) => <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag> },
    { title: '\u6295\u8bc9', dataIndex: 'isComplained', width: 70, render: (v) => v ? <Tag color="red">\u5df2\u6295\u8bc9</Tag> : '-' },
    { title: '\u4e0b\u5355\u65f6\u95f4', dataIndex: 'createdAt', width: 150, render: (v) => dayjs(v).format('MM-DD HH:mm') },
    {
      title: '\u64cd\u4f5c', width: 180,
      render: (_, r) => (
        <Space>
          {r.status === 'PENDING_ASSIGN' && <Button size="small" type="primary" onClick={() => { setAssignModal({ open: true, orderId: r.id }); setSelectedPlayer(null) }}>\u5206\u914d</Button>}
          {r.status === 'PENDING_DELIVERY' && <Button size="small" onClick={async () => { await deliverOrder(r.id); message.success('\u4ea4\u5355\u6210\u529f'); fetchOrders() }}>\u4ea4\u5355</Button>}
          {r.status === 'PENDING_SETTLEMENT' && <Button size="small" type="primary" onClick={async () => { await settleOrder(r.id); message.success('\u7ed3\u7b97\u6210\u529f'); fetchOrders() }}>\u7ed3\u7b97</Button>}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>\u8ba2\u5355\u7ba1\u7406</Typography.Title>
        <Space>
          <Input.Search placeholder="\u641c\u7d22\u5546\u54c1/\u8ba2\u5355\u53f7" onSearch={(v) => { setKeyword(v); setPage(1) }} allowClear style={{ width: 200 }} />
          <Select value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1) }} style={{ width: 140 }}
            options={[{ value: '', label: '\u5168\u90e8\u72b6\u6001' }, ...Object.entries(STATUS_LABEL).map(([k, v]) => ({ value: k, label: v }))]} />
        </Space>
      </div>
      <Table dataSource={orders} columns={columns} rowKey="id" loading={loading} pagination={{ current: page, total, pageSize: 20, onChange: (p) => setPage(p) }} scroll={{ x: 950 }} />
      <Modal title="\u5206\u914d\u73a9\u5bb6" open={assignModal.open} onOk={handleAssign} onCancel={() => setAssignModal({ open: false, orderId: null })} okText="\u786e\u8ba4\u5206\u914d">
        <Select style={{ width: '100%' }} placeholder="\u8bf7\u9009\u62e9\u5185\u7f6e\u73a9\u5bb6" value={selectedPlayer} onChange={setSelectedPlayer}
          options={players.map((p) => ({ value: p.id, label: \`\${p.nickname} (\${p.game || '\u6e38\u620f\u672a\u77e5'})\` }))} />
      </Modal>
    </div>
  )
}
`)

w('admin/src/pages/Products.jsx', `import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Tag, Popconfirm, Modal, Form, Input, InputNumber, Select, message, Typography, Image } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { getAdminProducts, createProduct, updateProduct, setProductStatus, deleteProduct, getZones } from '../api'

const STATUS_COLOR = { ON: 'green', OFF: 'default' }
const STATUS_LABEL = { ON: '\u5df2\u4e0a\u67b6', OFF: '\u5df2\u4e0b\u67b6' }

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [zones, setZones] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => { getZones().then((r) => setZones(r.data || [])) }, [])

  function fetchProducts(p = page, kw = keyword) {
    setLoading(true)
    getAdminProducts({ page: p, pageSize: 20, keyword: kw }).then((r) => { setProducts(r.data?.items || []); setTotal(r.data?.total || 0) }).finally(() => setLoading(false))
  }
  useEffect(() => { fetchProducts() }, [page, keyword])

  async function handleSave() {
    const values = await form.validateFields()
    try {
      if (editingId) { await updateProduct(editingId, values); message.success('\u66f4\u65b0\u6210\u529f') }
      else { await createProduct(values); message.success('\u521b\u5efa\u6210\u529f') }
      setModalOpen(false); fetchProducts()
    } catch {}
  }

  const columns = [
    { title: '\u7f29\u7565\u56fe', dataIndex: 'thumbnail', width: 70, render: (v) => v ? <Image src={v} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 4 }} /> : '-' },
    { title: '\u6e38\u620f', dataIndex: 'gameName', width: 100 },
    { title: '\u5546\u54c1\u540d\u79f0', dataIndex: 'name', ellipsis: true },
    { title: '\u6240\u5c5e\u4e13\u533a', dataIndex: 'zones', render: (zones) => zones?.map((z) => <Tag key={z.id}>{z.name}</Tag>) },
    { title: '\u73b0\u4ef7', dataIndex: 'price', width: 90, render: (v) => \`\uffe5\${v}\` },
    { title: '\u539f\u4ef7', dataIndex: 'originalPrice', width: 90, render: (v) => \`\uffe5\${v}\` },
    { title: '\u9500\u91cf', dataIndex: 'sales', width: 70 },
    { title: '\u6d4f\u89c8\u91cf', dataIndex: 'views', width: 80 },
    { title: '\u72b6\u6001', dataIndex: 'status', width: 90, render: (v) => <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag> },
    {
      title: '\u64cd\u4f5c', width: 200,
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => { setEditingId(r.id); form.setFieldsValue({ ...r, zoneIds: r.zones?.map((z) => z.id) }); setModalOpen(true) }}>\u7f16\u8f91</Button>
          {r.status === 'OFF' ? <Button size="small" type="primary" onClick={async () => { await setProductStatus(r.id, 'ON'); message.success('\u5df2\u4e0a\u67b6'); fetchProducts() }}>\u4e0a\u67b6</Button>
            : <Button size="small" onClick={async () => { await setProductStatus(r.id, 'OFF'); message.success('\u5df2\u4e0b\u67b6'); fetchProducts() }}>\u4e0b\u67b6</Button>}
          {r.status === 'OFF' && <Popconfirm title="\u786e\u8ba4\u5220\u9664\uff1f" onConfirm={async () => { await deleteProduct(r.id); message.success('\u5df2\u5220\u9664'); fetchProducts() }}><Button size="small" danger>\u5220\u9664</Button></Popconfirm>}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>\u5546\u54c1\u7ba1\u7406</Typography.Title>
        <Space>
          <Input.Search placeholder="\u641c\u7d22\u5546\u54c1\u540d\u79f0" onSearch={(v) => { setKeyword(v); setPage(1) }} allowClear style={{ width: 220 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true) }}>\u65b0\u589e\u5546\u54c1</Button>
        </Space>
      </div>
      <Table dataSource={products} columns={columns} rowKey="id" loading={loading} pagination={{ current: page, total, pageSize: 20, onChange: (p) => setPage(p) }} scroll={{ x: 900 }} />
      <Modal title={editingId ? '\u7f16\u8f91\u5546\u54c1' : '\u65b0\u589e\u5546\u54c1'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} width={700} okText="\u4fdd\u5b58">
        <Form form={form} layout="vertical">
          <Form.Item name="gameName" label="\u6e38\u620f\u540d\u79f0"><Input placeholder="\u5982\uff1a\u738b\u8005\u8363\u8000" /></Form.Item>
          <Form.Item name="name" label="\u5546\u54c1\u540d\u79f0" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="\u5546\u54c1\u63cf\u8ff0"><Input.TextArea rows={2} /></Form.Item>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="price" label="\u73b0\u4ef7" rules={[{ required: true }]}><InputNumber min={0} prefix="\uffe5" style={{ width: 140 }} /></Form.Item>
            <Form.Item name="originalPrice" label="\u539f\u4ef7" rules={[{ required: true }]}><InputNumber min={0} prefix="\uffe5" style={{ width: 140 }} /></Form.Item>
          </Space>
          <Form.Item name="thumbnail" label="\u7f29\u7565\u56feURL"><Input placeholder="\u8bf7\u8f93\u5165\u56fe\u7247URL" /></Form.Item>
          <Form.Item name="zoneIds" label="\u6240\u5c5e\u4e13\u533a"><Select mode="multiple" options={zones.map((z) => ({ value: z.id, label: z.name }))} placeholder="\u8bf7\u9009\u62e9\u4e13\u533a" /></Form.Item>
          <Form.Item name="detailContent" label="\u5546\u54c1\u8be6\u60c5"><Input.TextArea rows={4} placeholder="\u652f\u6301 HTML \u683c\u5f0f" /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
`)

w('admin/src/pages/Users.jsx', `import React, { useState, useEffect } from 'react'
import { Table, Button, Popconfirm, Tag, Typography, Input, message, Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { getAdminUsers, setBlacklist } from '../api'
import dayjs from 'dayjs'

const GENDER_LABEL = { 0: '\u672a\u77e5', 1: '\u7537', 2: '\u5973' }

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')

  function fetchUsers(p = page) {
    setLoading(true)
    getAdminUsers({ page: p, pageSize: 20, keyword }).then((r) => { setUsers(r.data?.items || []); setTotal(r.data?.total || 0) }).finally(() => setLoading(false))
  }
  useEffect(() => { fetchUsers() }, [page, keyword])

  const columns = [
    { title: '\u5934\u50cf', dataIndex: 'avatar', width: 60, render: (v) => <Avatar src={v} icon={<UserOutlined />} /> },
    { title: '\u6635\u79f0', dataIndex: 'nickname' },
    { title: '\u624b\u673a\u53f7', dataIndex: 'phone', width: 130 },
    { title: '\u6027\u522b', dataIndex: 'gender', width: 70, render: (v) => GENDER_LABEL[v] || '\u672a\u77e5' },
    { title: '\u5e74\u9f84', dataIndex: 'age', width: 60, render: (v) => v || '-' },
    { title: '\u6e38\u620f', dataIndex: 'game', width: 100, render: (v) => v || '-' },
    { title: '\u5185\u7f6e\u73a9\u5bb6', dataIndex: 'isBuiltin', width: 90, render: (v) => v ? <Tag color="blue">\u662f</Tag> : '-' },
    { title: '\u72b6\u6001', dataIndex: 'isBlacklisted', width: 80, render: (v) => v ? <Tag color="red">\u5df2\u62c9\u9ed1</Tag> : <Tag color="green">\u6b63\u5e38</Tag> },
    { title: '\u6ce8\u518c\u65f6\u95f4', dataIndex: 'createdAt', width: 120, render: (v) => dayjs(v).format('MM-DD HH:mm') },
    {
      title: '\u64cd\u4f5c', width: 100,
      render: (_, r) => (
        <Popconfirm title={r.isBlacklisted ? '\u786e\u8ba4\u89e3\u9664\u62c9\u9ed1\uff1f' : '\u786e\u8ba4\u62c9\u9ed1\u8be5\u7528\u6237\uff1f'}
          onConfirm={async () => { await setBlacklist(r.id, !r.isBlacklisted); message.success(r.isBlacklisted ? '\u5df2\u89e3\u9664' : '\u5df2\u62c9\u9ed1'); fetchUsers() }}>
          <Button size="small" danger={!r.isBlacklisted}>{r.isBlacklisted ? '\u89e3\u9664\u62c9\u9ed1' : '\u62c9\u9ed1'}</Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>\u73a9\u5bb6\u7ba1\u7406</Typography.Title>
        <Input.Search placeholder="\u641c\u7d22\u6635\u79f0/\u624b\u673a\u53f7" onSearch={(v) => { setKeyword(v); setPage(1) }} allowClear style={{ width: 220 }} />
      </div>
      <Table dataSource={users} columns={columns} rowKey="id" loading={loading} pagination={{ current: page, total, pageSize: 20, onChange: (p) => setPage(p) }} scroll={{ x: 800 }} />
    </div>
  )
}
`)

w('admin/src/pages/System.jsx', `import React, { useState, useEffect } from 'react'
import { Tabs, Table, Button, Modal, Form, Input, Popconfirm, Tag, message, Typography, Switch, Space, Card } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { getAdmins, createAdmin, deleteAdmin, getAdminBanners, createBanner, updateBanner, deleteBanner, getAdminPlatformNote, updatePlatformNote } from '../api'
import useAdminStore from '../store/auth'

function AdminManage() {
  const [admins, setAdmins] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const currentAdmin = useAdminStore((s) => s.admin)
  function fetchAdmins() { getAdmins().then((r) => setAdmins(r.data || [])) }
  useEffect(() => { fetchAdmins() }, [])
  if (currentAdmin?.role !== 'SUPER') return <Typography.Text type="secondary">\u4ec5\u8d85\u7ea7\u7ba1\u7406\u5458\u53ef\u7ba1\u7406\u8d26\u53f7</Typography.Text>
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span /><Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>\u65b0\u589e\u7ba1\u7406\u5458</Button>
      </div>
      <Table dataSource={admins} columns={[
        { title: '\u8d26\u53f7', dataIndex: 'username' },
        { title: '\u89d2\u8272', dataIndex: 'role', render: (v) => v === 'SUPER' ? <Tag color="gold">\u8d85\u7ea7\u7ba1\u7406\u5458</Tag> : <Tag>\u7ba1\u7406\u5458</Tag> },
        { title: '\u64cd\u4f5c', render: (_, r) => r.role !== 'SUPER' ? <Popconfirm title="\u786e\u8ba4\u5220\u9664\uff1f" onConfirm={async () => { await deleteAdmin(r.id); message.success('\u5df2\u5220\u9664'); fetchAdmins() }}><Button size="small" danger>\u5220\u9664</Button></Popconfirm> : '-' },
      ]} rowKey="id" pagination={false} />
      <Modal title="\u65b0\u589e\u7ba1\u7406\u5458" open={modalOpen} onOk={async () => { await createAdmin(await form.validateFields()); message.success('\u521b\u5efa\u6210\u529f'); setModalOpen(false); form.resetFields(); fetchAdmins() }} onCancel={() => setModalOpen(false)} okText="\u521b\u5efa">
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="\u8d26\u53f7" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="password" label="\u5bc6\u7801" rules={[{ required: true, min: 6 }]}><Input.Password /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

function BannerManage() {
  const [banners, setBanners] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()
  function fetchBanners() { getAdminBanners().then((r) => setBanners(r.data || [])) }
  useEffect(() => { fetchBanners() }, [])
  async function handleSave() {
    const values = await form.validateFields()
    if (editingId) { await updateBanner(editingId, values); message.success('\u66f4\u65b0\u6210\u529f') }
    else { await createBanner(values); message.success('\u521b\u5efa\u6210\u529f') }
    setModalOpen(false); fetchBanners()
  }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Text type="secondary">\u6700\u591a\u5c55\u793a 5 \u5f20 Banner</Typography.Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true) }}>\u65b0\u589e Banner</Button>
      </div>
      <Table dataSource={banners} columns={[
        { title: '\u56fe\u7247', dataIndex: 'imageUrl', render: (v) => <img src={v} style={{ width: 80, height: 40, objectFit: 'cover', borderRadius: 4 }} /> },
        { title: '\u94fe\u63a5', dataIndex: 'link', ellipsis: true },
        { title: '\u6392\u5e8f', dataIndex: 'sort', width: 70 },
        { title: '\u542f\u7528', dataIndex: 'isActive', width: 80, render: (v, r) => <Switch checked={v} onChange={(checked) => updateBanner(r.id, { isActive: checked }).then(fetchBanners)} /> },
        { title: '\u64cd\u4f5c', width: 140, render: (_, r) => <Space><Button size="small" onClick={() => { setEditingId(r.id); form.setFieldsValue(r); setModalOpen(true) }}>\u7f16\u8f91</Button><Popconfirm title="\u786e\u8ba4\u5220\u9664\uff1f" onConfirm={async () => { await deleteBanner(r.id); message.success('\u5df2\u5220\u9664'); fetchBanners() }}><Button size="small" danger>\u5220\u9664</Button></Popconfirm></Space> },
      ]} rowKey="id" pagination={false} />
      <Modal title={editingId ? '\u7f16\u8f91 Banner' : '\u65b0\u589e Banner'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} okText="\u4fdd\u5b58">
        <Form form={form} layout="vertical">
          <Form.Item name="imageUrl" label="\u56fe\u7247URL" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="link" label="\u8df3\u8f6c\u94fe\u63a5"><Input /></Form.Item>
          <Form.Item name="sort" label="\u6392\u5e8f"><Input type="number" /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

function PlatformNoteManage() {
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => { getAdminPlatformNote().then((r) => setContent(r.data?.content || '')) }, [])
  return (
    <Card>
      <Typography.Paragraph type="secondary">\u6b64\u5185\u5bb9\u4f1a\u5728\u5546\u54c1\u8be6\u60c5\u9875\u5e95\u90e8\u5c55\u793a\uff0c\u652f\u6301HTML</Typography.Paragraph>
      <Input.TextArea value={content} onChange={(e) => setContent(e.target.value)} rows={10} placeholder="\u8bf7\u8f93\u5165\u5e73\u53f0\u901a\u7528\u8bf4\u660e\u5185\u5bb9" />
      <Button type="primary" style={{ marginTop: 12 }} loading={saving}
        onClick={async () => { setSaving(true); try { await updatePlatformNote(content); message.success('\u4fdd\u5b58\u6210\u529f') } finally { setSaving(false) } }}>
        \u4fdd\u5b58
      </Button>
    </Card>
  )
}

export default function SystemPage() {
  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 16 }}>\u7cfb\u7edf\u7ba1\u7406</Typography.Title>
      <Tabs items={[
        { key: 'admins', label: '\u7ba1\u7406\u5458\u7ba1\u7406', children: <AdminManage /> },
        { key: 'banners', label: 'Banner \u7ba1\u7406', children: <BannerManage /> },
        { key: 'platform-note', label: '\u5e73\u53f0\u8bf4\u660e', children: <PlatformNoteManage /> },
      ]} />
    </div>
  )
}
`)

console.log('All files written.')
