import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import { getProduct, getPlatformNote, toggleFavorite, checkFavorite, createOrder } from '../api'
import useAuthStore from '../store/auth'
import { sanitizeHtml } from '../utils/sanitize'

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
      navigate(`/pay/${orderId}`, { state: { payUrl } })
    } catch (e) { alert(e.message) }
    finally { setBuying(false) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400" style={{ background: '#0a0a0f' }}>加载中...</div>
  if (!product) return <div className="min-h-screen flex items-center justify-center text-gray-400" style={{ background: '#0a0a0f' }}>商品不存在</div>

  const images = product.images?.length > 0 ? product.images : product.thumbnail ? [product.thumbnail] : []
  const specs = product.specs || []

  return (
    <div className="min-h-screen pb-20" style={{ background: '#0a0a0f' }}>
      <div className="sticky top-0 z-10 flex items-center px-4 h-12" style={{ background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate(-1)} className="text-white p-1 -ml-1">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
        </button>
        <span className="flex-1 text-center text-white font-medium">商品详情</span>
      </div>
      {images.length > 0 && (
        <Swiper modules={[Pagination]} pagination={{ clickable: true }} className="w-full aspect-square">
          {images.map((img, i) => <SwiperSlide key={i}><img src={img} alt="" className="w-full h-full object-cover" /></SwiperSlide>)}
        </Swiper>
      )}
      <div className="space-y-3 px-4 mt-3">
        <div className="rounded-xl p-4" style={{ background: 'rgba(30,30,35,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h1 className="text-white font-bold text-lg leading-tight">{product.name}</h1>
              {product.description && <p className="text-gray-400 text-sm mt-1">{product.description}</p>}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-primary text-2xl font-bold">￥{Number(product.price).toFixed(2)}</span>
                <span className="text-gray-500 text-sm line-through">￥{Number(product.originalPrice).toFixed(2)}</span>
              </div>
            </div>
            <button onClick={handleFavorite} className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <svg viewBox="0 0 24 24" fill={favorited ? '#e83030' : 'none'} stroke={favorited ? '#e83030' : '#888'} strokeWidth="2" className="w-6 h-6">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className={`text-xs ${favorited ? 'text-primary' : 'text-gray-500'}`}>{favorited ? '已收藏' : '收藏'}</span>
            </button>
          </div>
        </div>
        {specs.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(30,30,35,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-white font-medium mb-3">规格</h3>
            <div className="flex flex-wrap gap-2">
              {specs.map((spec, i) => {
                const val = typeof spec === 'string' ? spec : spec.value || spec.name
                return <button key={i} onClick={() => setSelectedSpec(val)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${selectedSpec === val ? 'border-primary text-primary' : 'border-dark-border text-gray-400'}`}>{val}</button>
              })}
            </div>
          </div>
        )}
        {product.detailContent && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(30,30,35,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-white font-medium mb-3">商品详情</h3>
            <div className="text-gray-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.detailContent) }} />
          </div>
        )}
        {platformNote && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(30,30,35,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-white font-medium mb-3">平台说明</h3>
            <div className="text-gray-400 text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(platformNote) }} />
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3 flex gap-3 safe-area-bottom" style={{ background: '#0a0a0f', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate('/customer-service')} className="flex-shrink-0 rounded-xl px-5 py-3 text-sm flex items-center gap-2 text-white" style={{ background: 'rgba(45,45,55,0.9)' }}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" /></svg>
          联系客服
        </button>
        <button onClick={handleBuy} disabled={buying} className="flex-1 bg-primary text-white rounded-xl py-3 font-bold text-base disabled:opacity-60">
          {buying ? '处理中...' : '立即购买'}
        </button>
      </div>
    </div>
  )
}
