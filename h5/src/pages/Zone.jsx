import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { getZones, getProducts } from '../api'

function ZoneProductItem({ product }) {
    const navigate = useNavigate()
    return (
        <div className="flex gap-3 rounded-2xl p-3 cursor-pointer active:opacity-80" onClick={() => navigate(`/product/${product.id}`)}
        style={{ background: 'rgba(30,30,35, 0.8)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden" style={{ background: 'rgba(45,45,55,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {product.thumbnail ? <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-800" />}
            </div>
            <div className="flex-1 flex flex-col justify-between py-0.5">
                <p className="text-gray-100 text-sm font-medium line-clamp-2">{product.name}</p>
                <div className="flex items-center gap-2">
                    <span className="text-primary font-bold text-base">￥{Number(product.price).toFixed(2)}</span>
                    <span className="text-gray-600 text-xs line-through">￥{Number(product.originalPrice).toFixed(2)}</span>
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

    useEffect(() => {
        getZones().then((r) => {
            const list = r.data || []
            setZones(list)
            if (!activeZoneId && list.length > 0) setActiveZoneId(list[0].id)
        })
    }, [])

    const fetchProducts = useCallback(async (nextPage = 1, replace = false) => {
        if (!activeZoneId || loading) return
        setLoading(true)
        try {
            const res = await getProducts({ zoneId: activeZoneId, page: nextPage, pageSize: 6 })
            const items = res.data?.items || []
            setProducts((prev) => (replace ? items : [...prev, ...items]))
            setHasMore(items.length === 6)
            setPage(nextPage)
        } finally {
            setLoading(false)
        }
    }, [activeZoneId, loading])

    useEffect(() => {
        if (!activeZoneId) return
        setProducts([])
        setPage(1)
        setHasMore(true)
        fetchProducts(1, true)
    }, [activeZoneId])

    useEffect(() => {
        if (!loaderRef.current) return
        const ob = new IntersectionObserver((entries) => { if (entries[0].isIntersecting && hasMore && !loading) fetchProducts(page + 1) }, { threshold: 0.1 })
        ob.observe(loaderRef.current)
        return () => ob.disconnect()
    }, [hasMore, loading, page, fetchProducts])

    return (
        <PageLayout>
            <div className="flex min-h-screen">
                {/* 左侧专区列表 */}
                <div className="w-20 flex-shrink-0 overflow-y-auto scrollbar-hide" style={{ background: 'rgba(30,30,35, 0.8)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                    {zones.map((z) => (
                        <div
                            key={z.id}
                            onClick={() => setActiveZoneId(z.id)}
                            className="px-1 py-4 text-xs text-center cursor-pointer transition-colors"
                            style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <span className={`text-sm font-medium ${activeZoneId === z.id ? 'text-primary' : 'text-gray-400'}`}>
                                {z.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* 右侧商品列表 */}
                <div className="flex-1 overflow-y-auto pb-16">
                    <div className="p-3 space-y-3">
                        {products.map((p) => <ZoneProductItem key={p.id} product={p} />)}
                        <div ref={loaderRef} className="py-3 text-center text-gray-500 text-xs">
                            {loading ? '加载中...' : !hasMore && products.length > 0 ? '没有更多了' : ''}
                        </div>
                        {!loading && products.length === 0 && (
                            <div className="text-center text-gray-500 py-12">暂无商品</div>
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    )
}
