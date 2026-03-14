import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function CustomerServicePage() {
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const isDaytime = hour >= 8 && hour < 18
  const qrImage = isDaytime ? '/csr/white.jpg' : '/csr/black.jpg'
  const timeLabel = isDaytime ? '白天客服 (8:00-18:00)' : '夜间客服 (18:00-8:00)'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0f' }}>
      <div
        className="sticky top-0 z-10 px-4 h-12 flex items-center"
        style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button onClick={() => navigate(-1)} className="text-gray-100 p-1 -ml-1">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
        </button>
        <span className="flex-1 text-center text-gray-100 font-semibold">联系客服</span>
        <span className="w-6" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <p className="text-gray-400 text-sm mb-4">{timeLabel}</p>
        <img 
          src={qrImage} 
          alt="客服微信二维码" 
          className="w-auto h-auto max-w-full"
          style={{ maxWidth: 280 }}
        />
        <p className="text-gray-300 text-sm mt-4">长按保存图片，在微信中扫一扫识别</p>
        <p className="text-gray-500 text-xs mt-4 text-center">
          添加客服微信后，请说明您的需求<br />我们会尽快为您处理
        </p>
      </div>
    </div>
  )
}
