import React, { useState } from 'react'
import ReactDOM from 'react-dom'

/**
 * 通用底部弹出选择器（替代原生 select，避免移动端下拉超出屏幕）
 * 使用 ReactDOM.createPortal 挂载到 document.body，彻底避免 z-index 层级问题。
 *
 * Props:
 *   value      - 当前选中的 value
 *   onChange   - (value) => void
 *   options    - [{ value, label }]
 *   title      - 弹出层顶部标题，默认"请选择"
 *   className  - 触发按钮的额外 className
 *   style      - 触发按钮的额外 style
 */
export default function BottomSheetPicker({ value, onChange, options = [], title = '请选择', className = '', style = {} }) {
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.value === value)

  const sheet = open ? ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        background: 'rgba(0,0,0,0.35)',
      }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{ background: '#fff', borderRadius: '16px 16px 0 0', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: 14, color: '#94a3b8' }}>{title}</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{ fontSize: 14, fontWeight: 500, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
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
              padding: '14px 24px', borderBottom: '1px solid #f8fafc', cursor: 'pointer',
            }}
          >
            <span style={{ color: '#1e293b', fontSize: 16 }}>{opt.label}</span>
            {value === opt.value && (
              <svg viewBox="0 0 24 24" fill="#6366f1" style={{ width: 20, height: 20, flexShrink: 0 }}>
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
