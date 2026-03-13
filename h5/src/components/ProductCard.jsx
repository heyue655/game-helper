import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProductCard({ product }) {
  const navigate = useNavigate()

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer active:opacity-80"
      style={{
        background: 'rgba(30,30,35,0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="aspect-square bg-neutral-800 overflow-hidden">
        {product.thumbnail ? (
          <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-600">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-gray-100 text-sm font-medium line-clamp-2 leading-tight mb-1.5">{product.name}</p>
        <p className="text-neutral-500 text-xs mb-1.5">销量 {product.sales}  浏览 {product.views}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-primary font-bold text-sm">￥{Number(product.price).toFixed(2)}</span>
          <span className="text-neutral-600 text-xs line-through">￥{Number(product.originalPrice).toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
