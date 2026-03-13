import React, { useState, useEffect } from 'react'
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
    if (!/^1[3-9]\d{9}$/.test(phone)) return setError('手机号格式不正确')
    try { await sendCode(phone); setCountdown(60); setError('') }
    catch (e) { setError(e.message) }
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!phone || !code) return setError('请填写手机号和验证码')
    setLoading(true)
    try { const res = await login(phone, code); setAuth(res.data.user, res.data.token); navigate(-1) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #121218 50%, #0d0d12 100%)' }}>
      <div className="absolute -top-8 right-0 w-52 h-52 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-52 h-52 rounded-full bg-pink-500/10 blur-3xl" />
      <div className="w-full max-w-sm rounded-3xl p-6 relative z-[1]" style={{ background: 'rgba(30,30,35,0.9)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 16px 50px rgba(0,0,0,0.5)' }}>
        <h1 className="text-primary text-2xl font-bold mb-2 text-center">登录</h1>
        <p className="text-gray-400 text-sm text-center mb-8">输入手机号快速登录</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="请输入手机号" maxLength={11} className="w-full rounded-2xl px-4 py-3 outline-none text-sm" style={{ background: 'rgba(30,30,35,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
          <div className="flex gap-2">
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="请输入验证码" maxLength={6} className="flex-1 min-w-0 rounded-2xl px-4 py-3 outline-none text-sm" style={{ background: 'rgba(30,30,35,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
            <button type="button" onClick={handleSendCode} disabled={countdown > 0} className="flex-shrink-0 bg-primary text-white rounded-2xl px-3 py-3 text-xs disabled:bg-neutral-600 disabled:cursor-not-allowed">{countdown > 0 ? `${countdown}s` : '获取验证码'}</button>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-primary text-white rounded-2xl py-3 font-bold text-base disabled:opacity-60">{loading ? '登录中...' : '登录'}</button>
        </form>
      </div>
    </div>
  )
}
