import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/auth'
import { getMe, updateProfile, uploadAvatar } from '../api'
import BottomSheetPicker from '../components/BottomSheetPicker'

const GENDER_OPTIONS = [
    { value: 0, label: '保密' },
    { value: 1, label: '男' },
    { value: 2, label: '女' },
]

export default function ProfileEditPage() {
    const navigate = useNavigate()
    const { setUser } = useAuthStore()
    const fileInputRef = useRef(null)
    const [form, setForm] = useState({ nickname: '', avatar: '', gender: 0, age: '', game: '' })
    const [saving, setSaving] = useState(false)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)

    useEffect(() => {
        getMe().then((r) => {
            const u = r.data
            setUser(u)
            setForm({ nickname: u.nickname || '', avatar: u.avatar || '', gender: u.gender || 0, age: u.age || '', game: u.game || '' })
        })
    }, [])

    async function handleSave(e) {
        e.preventDefault(); setSaving(true)
        try { await updateProfile({ ...form, age: form.age ? parseInt(form.age) : undefined }); const res = await getMe(); setUser(res.data); navigate(-1) }
        catch (e) { alert(e.message) }
        finally { setSaving(false) }
    }

    async function handleAvatarChange(e) {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) { alert('请选择图片文件'); e.target.value = ''; return }
        setUploadingAvatar(true)
        try {
            const res = await uploadAvatar(file)
            setForm((prev) => ({ ...prev, avatar: res.data.url }))
        } catch (err) { alert(err.message) }
        finally { setUploadingAvatar(false); e.target.value = '' }
    }

    return (
        <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
            <div className="sticky top-0 border-b px-4 h-12 flex items-center" style={{ background: 'rgba(10,10,15, 0.85)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <button onClick={() => navigate(-1)} className="text-gray-100 p-1 -ml-1">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
                </button>
                <span className="flex-1 text-center text-gray-100 font-medium">编辑资料</span>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
                <div className="rounded-xl overflow-hidden divide-y" style={{ background: 'rgba(30,30,35, 0.8)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                    <div className="flex items-center px-4 py-3 gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <span className="text-gray-400 text-sm w-16 flex-shrink-0">头像</span>
                        <div className="flex-1 flex items-center justify-end gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden" style={{ background: 'rgba(45,45,55,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                {form.avatar
                                    ? <img src={form.avatar} alt="avatar" className="w-full h-full object-cover" />
                                    : <svg viewBox="0 0 24 24" fill="#6b7280" className="w-full h-full p-2"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
                                }
                            </div>
                            <button type="button" disabled={uploadingAvatar} onClick={() => fileInputRef.current?.click()} className="text-primary text-sm disabled:opacity-60">
                                {uploadingAvatar ? '上传中...' : '更换头像'}
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </div>
                    </div>
                    <label className="flex items-center px-4 py-3 gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <span className="text-gray-400 text-sm w-16 flex-shrink-0">昵称</span>
                        <input type="text" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                            className="flex-1 bg-transparent text-gray-100 text-sm outline-none text-right" placeholder="请输入昵称" />
                    </label>
                    <div className="flex items-center px-4 py-3 gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <span className="text-gray-400 text-sm w-16 flex-shrink-0">性别</span>
                        <div className="flex-1 flex justify-end">
                            <BottomSheetPicker
                                value={form.gender}
                                onChange={(v) => setForm({ ...form, gender: v })}
                                options={GENDER_OPTIONS}
                                title="选择性别"
                                className="text-gray-100 text-sm"
                            />
                        </div>
                    </div>
                    <label className="flex items-center px-4 py-3 gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <span className="text-gray-400 text-sm w-16 flex-shrink-0">年龄</span>
                        <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })}
                            className="flex-1 bg-transparent text-gray-100 text-sm outline-none text-right" placeholder="请输入年龄" min="1" max="100" />
                    </label>
                    <label className="flex items-center px-4 py-3 gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <span className="text-gray-400 text-sm w-16 flex-shrink-0">擅长游戏</span>
                        <input type="text" value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })}
                            className="flex-1 bg-transparent text-gray-100 text-sm outline-none text-right" placeholder="如：王者荣耀" />
                    </label>
                </div>
                <button type="submit" disabled={saving || uploadingAvatar} className="w-full bg-primary text-white rounded-xl py-3 font-bold disabled:opacity-60">
                    {saving ? '保存中...' : '保存'}
                </button>
            </form>
        </div>
    )
}
