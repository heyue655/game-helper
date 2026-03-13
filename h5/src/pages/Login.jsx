import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendCode, login, bindPhone, checkDevice } from '../api'
import useAuthStore from '../store/auth'
import { getDeviceId } from '../utils/deviceId'

export default function LoginPage() {
  const navigate = useNavigate()
  const { token, user, setAuth, setUser } = useAuthStore()
  const [mode, setMode] = useState(null)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [existingUser, setExistingUser] = useState(null)

  const isLoggedIn = !!token

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  useEffect(() => {
    if (isLoggedIn) return
    const checkDeviceUser = async () => {
      const deviceId = getDeviceId()
      try {
        const res = await checkDevice(deviceId)
        if (res.data?.exists && res.data?.user?.phone) {
          setExistingUser(res.data.user)
        }
      } catch {
        // 忽略错误
      }
    }
    checkDeviceUser()
  }, [isLoggedIn])

  async function handleSendCode() {
    if (!/^1[3-9]\d{9}$/.test(phone)) return setError('手机号格式不正确')
    try { await sendCode(phone); setCountdown(60); setError('') }
    catch (e) { setError(e.message) }
  }

  async function handleExistingLogin() {
    setLoading(true)
    setError('')
    try {
      const deviceId = getDeviceId()
      const res = await useAuthStore.getState().silentLogin(deviceId)
      if (res.success) {
        navigate(-1)
      } else {
        setError(res.error || '登录失败')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGuestLogin() {
    setLoading(true)
    setError('')
    try {
      const deviceId = getDeviceId()
      const res = await useAuthStore.getState().silentLogin(deviceId)
      if (res.success) {
        navigate(-1)
      } else {
        setError(res.error || '登录失败')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handlePhoneLogin(e) {
    e.preventDefault()
    if (!phone || !code) return setError('请填写手机号和验证码')
    setLoading(true)
    setError('')
    try {
      const deviceId = getDeviceId()
      const res = await login(phone, code, deviceId)
      setAuth(res.data.user, res.data.token)
      navigate(-1)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleBindPhone(e) {
    e.preventDefault()
    if (!phone || !code) return setError('请填写手机号和验证码')
    setLoading(true)
    setError('')
    try {
      const res = await bindPhone(phone, code)
      setUser(res.data)
      navigate(-1)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (isLoggedIn && mode !== 'phone') {
    const isBound = !!user?.phone
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #121218 50%, #0d0d12 100%)' }}>
        <div className="absolute -top-8 right-0 w-52 h-52 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-52 h-52 rounded-full bg-pink-500/10 blur-3xl" />
        <div className="w-full max-w-sm rounded-3xl p-6 relative z-[1]" style={{ background: 'rgba(30,30,35,0.9)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 16px 50px rgba(0,0,0,0.5)' }}>
          <h1 className="text-primary text-2xl font-bold mb-2 text-center">{isBound ? '更换手机号' : '绑定手机号'}</h1>
          <p className="text-gray-400 text-sm text-center mb-8">
            {isBound ? `当前绑定: ${user.phone}` : '绑定手机号后可跨设备恢复身份'}
          </p>
          <form onSubmit={handleBindPhone} className="space-y-4">
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="请输入手机号" maxLength={11} className="w-full rounded-2xl px-4 py-3 outline-none text-sm" style={{ background: 'rgba(30,30,35,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
            <div className="flex gap-2">
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="请输入验证码" maxLength={6} className="flex-1 min-w-0 rounded-2xl px-4 py-3 outline-none text-sm" style={{ background: 'rgba(30,30,35,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              <button type="button" onClick={handleSendCode} disabled={countdown > 0} className="flex-shrink-0 bg-primary text-white rounded-2xl px-3 py-3 text-xs disabled:bg-neutral-600 disabled:cursor-not-allowed">{countdown > 0 ? `${countdown}s` : '获取验证码'}</button>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-primary text-white rounded-2xl py-3 font-bold text-base disabled:opacity-60">{loading ? '提交中...' : '确认绑定'}</button>
          </form>
          <button onClick={() => navigate(-1)} className="w-full mt-3 text-gray-400 text-sm">跳过</button>
        </div>
      </div>
    )
  }

  if (mode === 'phone') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #121218 50%, #0d0d12 100%)' }}>
        <div className="absolute -top-8 right-0 w-52 h-52 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-52 h-52 rounded-full bg-pink-500/10 blur-3xl" />
        <div className="w-full max-w-sm rounded-3xl p-6 relative z-[1]" style={{ background: 'rgba(30,30,35,0.9)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 16px 50px rgba(0,0,0,0.5)' }}>
          <h1 className="text-primary text-2xl font-bold mb-2 text-center">手机号登录</h1>
          <p className="text-gray-400 text-sm text-center mb-8">使用手机号验证码登录</p>
          <form onSubmit={handlePhoneLogin} className="space-y-4">
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="请输入手机号" maxLength={11} className="w-full rounded-2xl px-4 py-3 outline-none text-sm" style={{ background: 'rgba(30,30,35,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
            <div className="flex gap-2">
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="请输入验证码" maxLength={6} className="flex-1 min-w-0 rounded-2xl px-4 py-3 outline-none text-sm" style={{ background: 'rgba(30,30,35,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              <button type="button" onClick={handleSendCode} disabled={countdown > 0} className="flex-shrink-0 bg-primary text-white rounded-2xl px-3 py-3 text-xs disabled:bg-neutral-600 disabled:cursor-not-allowed">{countdown > 0 ? `${countdown}s` : '获取验证码'}</button>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-primary text-white rounded-2xl py-3 font-bold text-base disabled:opacity-60">{loading ? '登录中...' : '登录'}</button>
          </form>
          <button onClick={() => setMode(null)} className="w-full mt-3 text-gray-400 text-sm">返回</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #121218 50%, #0d0d12 100%)' }}>
      <div className="absolute -top-8 right-0 w-52 h-52 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-52 h-52 rounded-full bg-pink-500/10 blur-3xl" />
      <div className="w-full max-w-sm rounded-3xl p-6 relative z-[1]" style={{ background: 'rgba(30,30,35,0.9)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 16px 50px rgba(0,0,0,0.5)' }}>
        <h1 className="text-primary text-2xl font-bold mb-2 text-center">选择登录方式</h1>
        <p className="text-gray-400 text-sm text-center mb-8">请选择适合您的登录方式</p>
        <div className="space-y-3">
          {existingUser ? (
            <>
              <button
                onClick={handleExistingLogin}
                disabled={loading}
                className="w-full rounded-2xl py-4 text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #e83030 0%, #f87171 100%)', boxShadow: '0 4px 15px rgba(232,48,48,0.3)' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <span>{existingUser.nickname || existingUser.phone}</span>
                <span className="text-xs opacity-70 ml-1">({existingUser.phone})</span>
              </button>
              <button
                onClick={() => setMode('phone')}
                className="w-full rounded-2xl py-4 text-white font-bold text-base flex items-center justify-center gap-2"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                </svg>
                切换手机号
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleGuestLogin}
                disabled={loading}
                className="w-full rounded-2xl py-4 text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #e83030 0%, #f87171 100%)', boxShadow: '0 4px 15px rgba(232,48,48,0.3)' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                {loading ? '登录中...' : '游客登录'}
              </button>
              <button
                onClick={() => setMode('phone')}
                className="w-full rounded-2xl py-4 text-white font-bold text-base flex items-center justify-center gap-2"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                </svg>
                手机号登录
              </button>
            </>
          )}
        </div>
        {error && <p className="text-red-500 text-xs mt-4 text-center">{error}</p>}
        <button onClick={() => navigate(-1)} className="w-full mt-4 text-gray-400 text-sm">返回</button>
      </div>
    </div>
  )
}
