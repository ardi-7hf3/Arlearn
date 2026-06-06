import React from 'react';

const NAV_ITEMS = [
  { key: 'dashboard', icon: 'fa-solid fa-house',            label: 'Tryout'  },
  { key: 'riwayat',   icon: 'fa-solid fa-clock-rotate-left', label: 'Riwayat' },
  { key: 'kelola',    icon: 'fa-solid fa-sliders',           label: 'Kelola'  },
];

export default function Navbar({ activePage, setPage, onLogout, userName, onUpload }) {
  return (
    <>
      {/* ── Top bar (desktop + mobile) ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14"
        style={{ background: 'rgba(5,11,24,0.95)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
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
                background: activePage===item.key ? 'rgba(249,115,22,0.15)' : 'transparent',
                color:      activePage===item.key ? '#F97316' : '#64748B',
                border:     activePage===item.key ? '1px solid rgba(249,115,22,0.3)' : '1px solid transparent',
              }}>
              <i className={item.icon} />{item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ background:'rgba(0,229,255,0.06)', border:'1px solid rgba(0,229,255,0.1)' }}>
            <i className="fa-solid fa-circle-user text-sm" style={{ color:'#00E5FF' }} />
            <span className="text-sm font-semibold" style={{ color:'#94A3B8' }}>{userName}</span>
          </div>
          <button onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{ background:'rgba(239,68,68,0.1)', color:'#EF4444', border:'1px solid rgba(239,68,68,0.18)' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}>
            <i className="fa-solid fa-right-from-bracket" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </nav>

      {/* ── Mobile Bottom Nav ── */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50"
        style={{ background:'rgba(5,11,24,0.97)', borderTop:'1px solid rgba(255,255,255,0.06)', backdropFilter:'blur(24px)' }}>
        <div className="flex items-end h-16">

          {/* Tryout */}
          <button onClick={() => setPage('dashboard')}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-all"
            style={{ color: activePage==='dashboard' ? '#F97316' : '#475569' }}>
            <i className={`fa-solid fa-house text-lg`} />
            <span className="text-[10px] font-semibold">Tryout</span>
          </button>

          {/* Riwayat */}
          <button onClick={() => setPage('riwayat')}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-all"
            style={{ color: activePage==='riwayat' ? '#F97316' : '#475569' }}>
            <i className="fa-solid fa-clock-rotate-left text-lg" />
            <span className="text-[10px] font-semibold">Riwayat</span>
          </button>

          {/* FAB Upload — center */}
          <div className="flex-shrink-0 flex flex-col items-center justify-end pb-2 px-4">
            <button onClick={onUpload}
              className="flex items-center justify-center rounded-full shadow-lg transition-all active:scale-95"
              style={{
                width: 52, height: 52,
                background: 'linear-gradient(135deg,#F97316,#FB923C)',
                boxShadow: '0 0 0 4px rgba(5,11,24,0.97), 0 0 20px rgba(249,115,22,0.5)',
                marginBottom: 2,
              }}>
              <i className="fa-solid fa-upload text-white text-lg" />
            </button>
            <span className="text-[10px] font-semibold mt-0.5" style={{ color:'#F97316' }}>Upload</span>
          </div>

          {/* Kelola */}
          <button onClick={() => setPage('kelola')}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-all"
            style={{ color: activePage==='kelola' ? '#F97316' : '#475569' }}>
            <i className="fa-solid fa-sliders text-lg" />
            <span className="text-[10px] font-semibold">Kelola</span>
          </button>

          {/* Profile */}
          <button onClick={onLogout}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-all"
            style={{ color:'#475569' }}>
            <i className="fa-solid fa-circle-user text-lg" />
            <span className="text-[10px] font-semibold">Keluar</span>
          </button>

        </div>
      </div>
    </>
  );
}
