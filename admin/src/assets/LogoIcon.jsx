import React from 'react'

export default function LogoIcon({ size = 52, style = {} }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      width={size}
      height={size}
      style={style}
    >
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="logo-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#logo-bg)" />
      <rect width="64" height="32" rx="16" fill="url(#logo-shine)" />
      {/* 游戏手柄外壳 */}
      <rect x="12" y="22" width="40" height="22" rx="11" fill="white" fillOpacity="0.95" />
      {/* 十字方向键 */}
      <rect x="19" y="29" width="3" height="8" rx="1.5" fill="#6366f1" />
      <rect x="16" y="32" width="9" height="3" rx="1.5" fill="#6366f1" />
      {/* ABXY 按键 */}
      <circle cx="45" cy="30" r="2.2" fill="#ec4899" />
      <circle cx="41" cy="33" r="2.2" fill="#f59e0b" />
      <circle cx="49" cy="33" r="2.2" fill="#22c55e" />
      <circle cx="45" cy="36" r="2.2" fill="#3b82f6" />
      {/* 中间按键 */}
      <rect x="29" y="32" width="5" height="2" rx="1" fill="#6366f1" fillOpacity="0.5" />
    </svg>
  )
}
