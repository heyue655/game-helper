import React, { useState, useEffect } from 'react'
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
        <span className="flex-1 text-center text-white font-medium">我的收藏</span>
      </div>
      <div className="p-4">
        {loading && <div className="text-center text-gray-400 py-8">加载中...</div>}
        {!loading && items.length === 0 && <div className="text-center text-gray-500 py-16">暂无收藏</div>}
        <div className="grid grid-cols-2 gap-3">
          {items.map((p) => p && <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  )
}
