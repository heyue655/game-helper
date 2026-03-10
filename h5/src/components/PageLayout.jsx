import React from 'react'
import NavBar from './NavBar'

export default function PageLayout({ children, noNav = false }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: 'linear-gradient(145deg, #f0f4ff 0%, #fdf4ff 55%, #f0f9fe 100%)' }}>
        <div className="absolute rounded-full" style={{ top: '-5%', right: '-5%', width: 320, height: 320, background: 'radial-gradient(circle, rgba(167,139,250,0.35) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute rounded-full" style={{ top: '45%', left: '-8%', width: 280, height: 280, background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute rounded-full" style={{ bottom: '8%', right: '5%', width: 240, height: 240, background: 'radial-gradient(circle, rgba(244,114,182,0.2) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>
      <main className={`relative z-[1] flex-1 ${noNav ? '' : 'pb-16'}`}>{children}</main>
      {!noNav && <NavBar />}
    </div>
  )
}
