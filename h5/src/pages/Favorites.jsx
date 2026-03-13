import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFavorites } from '../api'

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
        <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
            <div className="sticky top-0 border-b px-4 h-12 flex items-center" style={{ background: 'rgba(10,10,15, 0.85)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <button onClick={() => navigate(-1)} className="text-gray-100 p-1 -ml-1">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </button>
                <span className="flex-1 text-center text-gray-100 font-medium">我的收藏</span>
            </div>
            <div className="p-4">
                {loading && <div className="text-center text-gray-400 py-8">加载中...</div>}
                {!loading && items.length === 0 && <div className="text-center text-gray-500 py-16">暂无收藏</div>}
                <div className="grid grid-cols-2 gap-3">
                    {items.map((p) => p && (
                        <div key={p.id}
                            className="rounded-2xl overflow-hidden cursor-pointer active:opacity-80"
                            style={{ background: 'rgba(30,30,35, 0.8)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                            onClick={() => navigate(`/product/${p.id}`)}
                        >
                            <div className="aspect-square bg-neutral-800 overflow-hidden">
                                {p.thumbnail ? <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-600"><svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12"><path d="M21 19V5c0-1.1-.9-2-2-2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h10v2zm0-8h-2V7h2v2z" /></svg></div>}
                            </div>
                            <div className="p-2.5">
                                <p className="text-gray-100 text-sm font-medium line-clamp-2">{p.name}</p>
                                <p className="text-gray-500 text-xs mb-1">销量 {p.sales}  浏览 {p.views}</p>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-primary font-bold text-sm">￥{Number(p.price).toFixed(2)}</span>
                                    <span className="text-gray-600 text-xs line-through">￥{Number(p.originalPrice).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
