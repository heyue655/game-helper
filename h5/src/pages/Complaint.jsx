import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { complainOrder } from '../api'

export default function ComplaintPage() {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const [reason, setReason] = useState('')
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        if (!reason.trim()) return alert('请填写投诉原因')
        setSubmitting(true)
        try {
            await complainOrder(orderId, reason.trim())
            alert('投诉已提交')
            navigate(-1)
        } catch (e) { alert(e.message) }
        finally { setSubmitting(false) }
    }

    return (
        <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
            <div className="sticky top-0 border-b px-4 h-12 flex items-center" style={{ background: 'rgba(10,10,15,0.85)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <button onClick={() => navigate(-1)} className="text-gray-100 p-1 -ml-1">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </button>
                <span className="flex-1 text-center text-gray-100 font-medium">投诉</span>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="rounded-xl p-4" style={{ background: 'rgba(30,30,35,0.8)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                    <p className="text-gray-400 text-sm mb-3">请详细描述投诉原因，工作人员会尽快处理</p>
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="请输入投诉原因..." rows={6} maxLength={500}
                        className="w-full text-gray-100 text-sm rounded-lg p-3 outline-none resize-none placeholder-gray-500"
                        style={{ background: 'rgba(45,45,55,0.8)', border: '1px solid rgba(255,255,255,0.06)' }} />
                    <p className="text-gray-500 text-xs text-right mt-1">{reason.length}/500</p>
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-primary text-white rounded-xl py-3 font-bold disabled:opacity-60">
                    {submitting ? '提交中...' : '提交投诉'}
                </button>
            </form>
        </div>
    )
}
