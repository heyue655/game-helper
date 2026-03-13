import React from 'react'
import NavBar from './NavBar'

export default function PageLayout({ children, noNav = false }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#0a0a0f' }}>
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: 'linear-gradient(180deg, #0a0a0f 0%, #121218 50%, #0d0d12 100%)' }}>
        <div
          className="absolute rounded-full"
          style={{ top: '-10%', right: '-10%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(232,48,48,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <div
          className="absolute rounded-full"
          style={{ top: '35%', left: '-15%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <div
          className="absolute rounded-full"
          style={{ bottom: '5%', right: '-5%', width: 280, height: 280, background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
      </div>
      <main className={`relative z-[1] flex-1 ${noNav ? '' : 'pb-20'}`}>{children}</main>
      {!noNav && <NavBar />}
    </div>
  )
}
