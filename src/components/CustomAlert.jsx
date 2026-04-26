import React, { useEffect } from 'react';

export default function CustomAlert({
  show, tipe = 'info', judul, pesan,
  onOk, onYes, onNo,
  okLabel = 'OK', yesLabel = 'Ya, Lanjutkan', noLabel = 'Batal'
}) {
  useEffect(() => {
    document.body.style.overflow = show ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  if (!show) return null;

  const iconMap = {
    success: {
      fa: 'fa-solid fa-circle-check',
      color: '#10B981',
      bg: 'rgba(16,185,129,0.12)',
      border: 'rgba(16,185,129,0.35)',
    },
    error: {
      fa: 'fa-solid fa-circle-xmark',
      color: '#EF4444',
      bg: 'rgba(239,68,68,0.12)',
      border: 'rgba(239,68,68,0.35)',
    },
    warning: {
      fa: 'fa-solid fa-triangle-exclamation',
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.12)',
      border: 'rgba(245,158,11,0.35)',
    },
    confirm: {
      fa: 'fa-solid fa-circle-question',
      color: '#00E5FF',
      bg: 'rgba(0,229,255,0.08)',
      border: 'rgba(0,229,255,0.3)',
    },
    info: {
      fa: 'fa-solid fa-circle-info',
      color: '#00E5FF',
      bg: 'rgba(0,229,255,0.08)',
      border: 'rgba(0,229,255,0.3)',
    },
  };

  const ic = iconMap[tipe] || iconMap.info;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,11,24,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 animate-slideDown"
        style={{
          background: '#111827',
          border: '1px solid rgba(0,229,255,0.2)',
          boxShadow: '0 0 40px rgba(0,229,255,0.06), 0 20px 60px rgba(0,0,0,0.7)',
        }}
      >
        {/* Icon */}
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: ic.bg, border: `2px solid ${ic.border}` }}>
          <i className={`${ic.fa} text-2xl`} style={{ color: ic.color }} />
        </div>

        {/* Title */}
        <h3 className="text-center font-display font-bold text-lg mb-2" style={{ color: '#F0F6FF' }}>
          {judul}
        </h3>

        {/* Message */}
        {typeof pesan === 'string' ? (
          <p className="text-center text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#94A3B8' }}>
            {pesan}
          </p>
        ) : (
          <div className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{pesan}</div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-6 justify-center">
          {tipe === 'confirm' ? (
            <>
              <button
                onClick={onNo}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                style={{ background: '#1E293B', color: '#94A3B8', border: '1px solid #2D3748' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#475569'; e.currentTarget.style.color = '#F0F6FF'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2D3748'; e.currentTarget.style.color = '#94A3B8'; }}
              >
                <i className="fa-solid fa-xmark text-xs" />
                {noLabel}
              </button>
              <button
                onClick={onYes}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold btn-gradient flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-check text-xs" />
                {yesLabel}
              </button>
            </>
          ) : (
            <button
              onClick={onOk}
              className="px-8 py-2.5 rounded-xl text-sm font-bold btn-gradient flex items-center gap-2"
            >
              <i className="fa-solid fa-check text-xs" />
              {okLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
