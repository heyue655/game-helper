import React, { useState } from 'react'
import ReactDOM from 'react-dom'

export default function BottomSheetPicker({ value, onChange, options = [], title = '请选择', className = '', style = {} }) {
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.value === value)

  const sheet = open ? ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        background: 'rgba(0,0,0,0.6)',
      }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{ background: '#1a1a1f', borderRadius: '16px 16px 0 0', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: 14, color: '#6b7280' }}>{title}</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{ fontSize: 14, fontWeight: 500, color: '#e83030', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
          >
            完成
          </button>
        </div>

        {options.map((opt) => (
          <div
            key={opt.value}
            onClick={() => { onChange(opt.value); setOpen(false) }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
            }}
          >
            <span style={{ color: '#e5e5e5', fontSize: 16 }}>{opt.label}</span>
            {value === opt.value && (
              <svg viewBox="0 0 24 24" fill="#e83030" style={{ width: 20, height: 20, flexShrink: 0 }}>
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
          </div>
        ))}

        <div style={{ height: 24 }} />
      </div>
    </div>,
    document.body,
  ) : null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1 outline-none bg-transparent cursor-pointer ${className}`}
        style={style}
      >
        <span>{current?.label ?? options[0]?.label ?? '请选择'}</span>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0 opacity-50">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      {sheet}
    </>
  )
}
