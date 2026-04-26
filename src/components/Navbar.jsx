import React from 'react';

export default function Navbar({ activePage, setPage, onLogout }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
    },
    {
      id: 'riwayat',
      label: 'Riwayat',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
    },
    {
      id: 'kelola',
      label: 'Kelola Soal',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
    },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 glass"
      style={{ borderBottom: '1px solid rgba(0,229,255,0.1)' }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('dashboard')}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00E5FF, #0891B2)' }}>
            <span className="font-display font-black text-sm" style={{ color: '#050B18' }}>AR</span>
          </div>
          <span className="font-display font-bold text-lg logo-gradient">ARLearn</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium hidden sm:block" style={{ background: 'rgba(0,229,255,0.1)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.2)' }}>BETA</span>
        </div>

        {/* Nav Items */}
        <div className="flex items-center gap-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                color: activePage === item.id ? '#00E5FF' : '#64748B',
                background: activePage === item.id ? 'rgba(0,229,255,0.1)' : 'transparent',
                border: activePage === item.id ? '1px solid rgba(0,229,255,0.2)' : '1px solid transparent',
              }}
              onMouseEnter={e => { if (activePage !== item.id) e.currentTarget.style.color = '#94A3B8'; }}
              onMouseLeave={e => { if (activePage !== item.id) e.currentTarget.style.color = '#64748B'; }}
            >
              {item.icon}
              <span className="hidden sm:block">{item.label}</span>
            </button>
          ))}

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ml-1"
            style={{ color: '#64748B', border: '1px solid transparent' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span className="hidden sm:block">Keluar</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
