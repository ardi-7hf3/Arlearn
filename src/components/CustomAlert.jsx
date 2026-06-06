import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

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
    success: { fa: 'fa-solid fa-circle-check',        color: '#10B981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.35)'  },
    error:   { fa: 'fa-solid fa-circle-xmark',        color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.35)'   },
    warning: { fa: 'fa-solid fa-triangle-exclamation',color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.35)'  },
    confirm: { fa: 'fa-solid fa-circle-question',     color: '#00E5FF', bg: 'rgba(0,229,255,0.08)',   border: 'rgba(0,229,255,0.3)'    },
    info:    { fa: 'fa-solid fa-circle-info',          color: '#00E5FF', bg: 'rgba(0,229,255,0.08)',   border: 'rgba(0,229,255,0.3)'    },
  };

  const ic = iconMap[tipe] || iconMap.info;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(5,11,24,0.88)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'alertFadeIn 0.18s ease both',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 20,
          padding: '1.75rem',
          background: '#111827',
          border: '1px solid rgba(0,229,255,0.2)',
          boxShadow: '0 0 40px rgba(0,229,255,0.06), 0 24px 64px rgba(0,0,0,0.75)',
          animation: 'alertSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
          background: ic.bg, border: `2px solid ${ic.border}`,
        }}>
          <i className={`${ic.fa} text-2xl`} style={{ color: ic.color }} />
        </div>

        {/* Title */}
        <h3 style={{ textAlign:'center', fontWeight:800, fontSize:'1.1rem', color:'#F0F6FF', marginBottom:'0.5rem' }}>
          {judul}
        </h3>

        {/* Message */}
        {typeof pesan === 'string' ? (
          <p style={{ textAlign:'center', fontSize:'0.875rem', lineHeight:1.6, color:'#94A3B8', whiteSpace:'pre-wrap' }}>
            {pesan}
          </p>
        ) : (
          <div style={{ fontSize:'0.875rem', lineHeight:1.6, color:'#94A3B8' }}>{pesan}</div>
        )}

        {/* Buttons */}
        <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem', justifyContent:'center' }}>
          {tipe === 'confirm' ? (
            <>
              <button onClick={onNo}
                style={{
                  flex:1, padding:'0.625rem 1rem', borderRadius:12, fontSize:'0.875rem',
                  fontWeight:600, background:'#1E293B', color:'#94A3B8',
                  border:'1px solid #2D3748', cursor:'pointer', display:'flex',
                  alignItems:'center', justifyContent:'center', gap:8,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#475569'; e.currentTarget.style.color='#F0F6FF'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#2D3748'; e.currentTarget.style.color='#94A3B8'; }}>
                <i className="fa-solid fa-xmark" style={{ fontSize:'0.75rem' }} />
                {noLabel}
              </button>
              <button onClick={onYes}
                style={{
                  flex:1, padding:'0.625rem 1rem', borderRadius:12, fontSize:'0.875rem',
                  fontWeight:700, background:'linear-gradient(135deg,#F97316,#FB923C)',
                  color:'#fff', border:'none', cursor:'pointer', display:'flex',
                  alignItems:'center', justifyContent:'center', gap:8,
                  boxShadow:'0 0 20px rgba(249,115,22,0.35)',
                }}>
                <i className="fa-solid fa-check" style={{ fontSize:'0.75rem' }} />
                {yesLabel}
              </button>
            </>
          ) : (
            <button onClick={onOk}
              style={{
                padding:'0.625rem 2rem', borderRadius:12, fontSize:'0.875rem',
                fontWeight:700, background:'linear-gradient(135deg,#F97316,#FB923C)',
                color:'#fff', border:'none', cursor:'pointer', display:'flex',
                alignItems:'center', gap:8,
                boxShadow:'0 0 20px rgba(249,115,22,0.35)',
              }}>
              <i className="fa-solid fa-check" style={{ fontSize:'0.75rem' }} />
              {okLabel}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
