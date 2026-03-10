import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css/pagination'
import PageLayout from '../components/PageLayout'
import BottomSheetPicker from '../components/BottomSheetPicker'
import { getBanners, getZones, getProducts, getGames } from '../api'

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-0.5 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, #6366f1, #a855f7)' }} />
      <span className="text-slate-800 text-sm font-semibold tracking-wide">{children}</span>
    </div>
  )
}

function GlassProductCard({ product, onClick }) {
  return (
    <div
      onClick={onClick}
      className="rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform duration-150"
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.8)',
        boxShadow: '0 4px 20px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
      }}
    >
      <div className="aspect-square overflow-hidden" style={{ background: 'rgba(241,245,249,0.8)' }}>
        {product.thumbnail ? (
          <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-slate-300">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-slate-800 text-sm font-medium line-clamp-2 leading-tight mb-1.5">{product.name}</p>
        <p className="text-slate-400 text-xs mb-1.5">售 {product.sales}  浏览 {product.views}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-primary font-bold text-sm">&yen;{Number(product.price).toFixed(2)}</span>
          <span className="text-slate-300 text-xs line-through">&yen;{Number(product.originalPrice).toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [gameFilter, setGameFilter] = useState('')
  const [gameOptions, setGameOptions] = useState([{ value: '', label: '全部商品' }])
  const [banners, setBanners] = useState([])
  const [zones, setZones] = useState([])
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const loaderRef = useRef(null)

  useEffect(() => {
    getBanners().then((r) => setBanners(r.data || []))
    getZones().then((r) => setZones(r.data || []))
    getGames().then((r) => {
      const dynamicOptions = (r.data || []).map((g) => ({ value: g.name, label: g.name }))
      setGameOptions([{ value: '', label: '全部商品' }, ...dynamicOptions])
    })
  }, [])

  const fetchProducts = useCallback(
    async (nextPage = 1, replace = false) => {
      if (loading) return
      setLoading(true)
      try {
        const res = await getProducts({ keyword, gameName: gameFilter, page: nextPage, pageSize: 6 })
        const items = res.data?.items || []
        setProducts((prev) => (replace ? items : [...prev, ...items]))
        setHasMore(items.length === 6)
        setPage(nextPage)
      } finally {
        setLoading(false)
      }
    },
    [keyword, gameFilter, loading],
  )

  useEffect(() => {
    setProducts([])
    setPage(1)
    setHasMore(true)
    fetchProducts(1, true)
  }, [keyword, gameFilter])

  useEffect(() => {
    if (!loaderRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchProducts(page + 1)
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, page, fetchProducts])

  return (
    <PageLayout>
      {/* 背景渐变光晕 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0, background: 'linear-gradient(145deg, #f0f4ff 0%, #fdf4ff 55%, #f0f9fe 100%)' }}>
        <div
          className="absolute rounded-full"
          style={{ top: '-5%', right: '-5%', width: 320, height: 320, background: 'radial-gradient(circle, rgba(167,139,250,0.35) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
        <div
          className="absolute rounded-full"
          style={{ top: '45%', left: '-8%', width: 280, height: 280, background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
        <div
          className="absolute rounded-full"
          style={{ bottom: '8%', right: '5%', width: 240, height: 240, background: 'radial-gradient(circle, rgba(244,114,182,0.2) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
      </div>

      {/* 搜索栏 */}
      <div
        className="sticky top-0 z-20 px-4 pt-3 pb-2.5"
        style={{
          background: 'rgba(248,250,252,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(148,163,184,0.2)',
        }}
      >
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索游戏、段位、降星..."
              className="w-full text-sm text-slate-700 placeholder-slate-400 rounded-full py-2 pl-9 pr-3 outline-none transition-colors duration-200"
              style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(148,163,184,0.3)' }}
            />
          </div>
          <BottomSheetPicker
            value={gameFilter}
            onChange={setGameFilter}
            options={gameOptions}
            title="选择游戏"
            className="text-sm text-slate-600 rounded-full px-3 py-2 flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(148,163,184,0.3)' }}
          />
        </div>
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Banner 轮播 */}
        {banners.length > 0 && (
          <div className="mx-3 mt-3">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 8px 32px rgba(99,102,241,0.15)', border: '1px solid rgba(255,255,255,0.8)' }}
            >
              <Swiper
                modules={[Autoplay, Pagination]}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                loop={banners.length > 1}
                className="h-36"
              >
                {banners.map((b) => (
                  <SwiperSlide key={b.id}>
                    <img src={b.imageUrl} alt="banner" className="w-full h-full object-cover" />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        )}

        {/* 专区快速入口 */}
        {zones.length > 0 && (
          <div className="mt-4 px-3">
            <SectionTitle>热门专区</SectionTitle>
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
              {zones.map((z) => (
                <div
                  key={z.id}
                  onClick={() => navigate(`/zone?zoneId=${z.id}`)}
                  className="flex-shrink-0 rounded-xl overflow-hidden cursor-pointer active:scale-95 transition-transform duration-150"
                  style={{
                    width: 80, height: 56,
                    background: 'rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 2px 12px rgba(99,102,241,0.1)',
                  }}
                >
                  {z.icon ? (
                    <img src={z.icon} alt={z.name} className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(167,139,250,0.1) 100%)' }}
                    >
                      <span className="text-slate-700 text-xs font-bold text-center px-1 leading-tight">{z.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 商品列表 */}
        <div className="px-3 mt-4">
          <SectionTitle>热门商品</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => (
              <GlassProductCard key={p.id} product={p} onClick={() => navigate(`/product/${p.id}`)} />
            ))}
          </div>

          <div ref={loaderRef} className="py-5 text-center text-slate-400 text-sm">
            {loading ? (
              <span className="inline-flex items-center gap-1.5">
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                加载中...
              </span>
            ) : !hasMore && products.length > 0 ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-10 h-px bg-slate-300" />
                没有更多了
                <span className="w-10 h-px bg-slate-300" />
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
