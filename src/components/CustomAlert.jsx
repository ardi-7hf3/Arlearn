import React, { useEffect } from 'react';

// tipe: 'success' | 'error' | 'warning' | 'confirm' | 'info'
export default function CustomAlert({ show, tipe = 'info', judul, pesan, onOk, onYes, onNo, okLabel = 'OK', yesLabel = 'Ya, Lanjutkan', noLabel = 'Batal' }) {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  if (!show) return null;

  const icons = {
    success: (
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.5)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="1.5"/>
          <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    ),
    error: (
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.5)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="1.5"/>
          <path d="M15 9l-6 6M9 9l6 6" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    ),
    warning: (
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(245,158,11,0.15)', border: '2px solid rgba(245,158,11,0.5)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M12 3L2 21h20L12 3z" stroke="#F59E0B" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M12 9v5M12 16.5v.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    ),
    confirm: (
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(0,229,255,0.1)', border: '2px solid rgba(0,229,255,0.4)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#00E5FF" strokeWidth="1.5"/>
          <path d="M12 8v4M12 14.5v1.5" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    ),
    info: (
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(0,229,255,0.1)', border: '2px solid rgba(0,229,255,0.4)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#00E5FF" strokeWidth="1.5"/>
          <path d="M12 11v6M12 8v.5" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    ),
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,11,24,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 animate-slideDown"
        style={{
          background: '#111827',
          border: '1px solid rgba(0,229,255,0.25)',
          boxShadow: '0 0 40px rgba(0,229,255,0.08), 0 20px 60px rgba(0,0,0,0.7)',
        }}
      >
        {icons[tipe]}
        <h3 className="text-center font-display font-bold text-lg mb-2" style={{ color: '#F0F6FF' }}>{judul}</h3>
        {typeof pesan === 'string' ? (
          <p className="text-center text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#94A3B8' }}>{pesan}</p>
        ) : (
          <div className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{pesan}</div>
        )}
        <div className="flex gap-3 mt-6 justify-center">
          {tipe === 'confirm' ? (
            <>
              <button
                onClick={onNo}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: '#1E293B', color: '#94A3B8', border: '1px solid #2D3748' }}
                onMouseEnter={e => e.target.style.borderColor = '#475569'}
                onMouseLeave={e => e.target.style.borderColor = '#2D3748'}
              >
                {noLabel}
              </button>
              <button
                onClick={onYes}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold btn-gradient"
              >
                {yesLabel}
              </button>
            </>
          ) : (
            <button
              onClick={onOk}
              className="px-8 py-2.5 rounded-xl text-sm font-bold btn-gradient"
            >
              {okLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
