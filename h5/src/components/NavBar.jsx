import React from 'react'
import { NavLink } from 'react-router-dom'

const tabs = [
  {
    to: '/',
    label: '店铺',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? '#e83030' : '#6b7280'} className="w-6 h-6">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
  },
  {
    to: '/zone',
    label: '专区',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? '#e83030' : '#6b7280'} className="w-6 h-6">
        <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5S14.67 12 15.5 12s1.5.67 1.5 1.5S16.33 15 15.5 15zm3-3c-.83 0-1.5-.67-1.5-1.5S17.67 10 18.5 10s1.5.67 1.5 1.5S19.33 12 18.5 12z" />
      </svg>
    ),
  },
  {
    to: '/my',
    label: '我的',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? '#e83030' : '#6b7280'} className="w-6 h-6">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    ),
  },
]

export default function NavBar() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 px-3 pb-2 safe-area-bottom">
      <div className="bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg">
        <div className="flex">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2.5 text-xs transition-colors ${isActive ? 'text-primary' : 'text-neutral-500'}`
              }
            >
              {({ isActive }) => (
                <>
                  {tab.icon(isActive)}
                  <span className="mt-0.5">{tab.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
