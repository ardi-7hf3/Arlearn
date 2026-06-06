import React from 'react';

const NAV_ITEMS = [
  { key: 'dashboard', icon: 'fa-solid fa-house',       label: 'Tryout'  },
  { key: 'riwayat',   icon: 'fa-solid fa-clock-rotate-left', label: 'Riwayat' },
  { key: 'kelola',    icon: 'fa-solid fa-sliders',     label: 'Kelola'  },
];

export default function Navbar({ activePage, setPage, onLogout, userName }) {


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-16"
      style={{ background: 'rgba(5,11,24,0.9)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(0,229,255,0.08)' }}>

      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background:'linear-gradient(135deg,#00E5FF,#0891B2)' }}>
          <span className="font-black text-xs" style={{ color:'#050B18' }}>AR</span>
        </div>
        <span className="font-black text-base logo-gradient">ARLearn</span>
      </div>

      {/* Desktop nav */}
      <div className="hidden sm:flex items-center gap-1">
        {NAV_ITEMS.map(item => (
          <button key={item.key} onClick={() => setPage(item.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: activePage === item.key ? 'rgba(249,115,22,0.15)' : 'transparent',
              color: activePage === item.key ? '#F97316' : '#64748B',
              border: activePage === item.key ? '1px solid rgba(249,115,22,0.3)' : '1px solid transparent',
            }}>
            <i className={item.icon} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Right: user + logout */}
      <div className="flex items-center gap-2">
        <span className="hidden sm:block text-sm font-semibold" style={{ color:'#94A3B8' }}>
          <i className="fa-solid fa-user-circle mr-1" style={{ color:'#00E5FF' }} />
          {userName}
        </span>
        <button onClick={onLogout}
          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{ background:'rgba(239,68,68,0.1)', color:'#EF4444', border:'1px solid rgba(239,68,68,0.2)' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}>
          <i className="fa-solid fa-right-from-bracket mr-1" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50 flex"
        style={{ background:'rgba(5,11,24,0.95)', borderTop:'1px solid rgba(0,229,255,0.08)', backdropFilter:'blur(16px)' }}>
        {NAV_ITEMS.map(item => (
          <button key={item.key} onClick={() => setPage(item.key)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-all"
            style={{ color: activePage === item.key ? '#F97316' : '#475569' }}>
            <i className={`${item.icon} text-base`} />
            <span className="text-xs font-semibold">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
