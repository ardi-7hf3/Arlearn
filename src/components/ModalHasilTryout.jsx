import React, { useState, useEffect } from 'react';
import ProgressChart from './ProgressChart';
import { useConfetti } from '../hooks/useConfetti';

export default function ModalHasilTryout({ show, soal, jawabanUser, onTryoutLagi, onLihatRiwayat }) {
  const [openAccordion, setOpenAccordion] = useState(null);
  const { fireConfetti } = useConfetti();

  useEffect(() => {
    if (show) {
      setTimeout(fireConfetti, 300);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  if (!show || !soal) return null;

  const total = soal.length;
  const benar = soal.filter((s, i) => jawabanUser[i] === s.jawabanBenar).length;
  const salah = total - benar;
  const skor = Math.round((benar / total) * 100);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,11,24,0.9)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl animate-scaleIn"
        style={{ background: '#111827', border: '1px solid rgba(0,229,255,0.2)', boxShadow: '0 0 60px rgba(0,0,0,0.8), 0 0 30px rgba(0,229,255,0.08)' }}
      >
        {/* Header */}
        <div className="p-6 pb-0 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="font-display font-black text-2xl" style={{ color: '#F0F6FF' }}>Tryout Selesai!</h2>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>Berikut hasil tryoutmu hari ini</p>
        </div>

        {/* Score circle */}
        <div className="flex justify-center py-6">
          <ProgressChart persentase={skor} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 px-6 mb-6">
          {[
            { icon: '✅', label: 'Benar', value: benar, color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
            { icon: '❌', label: 'Salah', value: salah, color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' },
            { icon: '⭐', label: 'Skor', value: skor, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl p-4 text-center"
              style={{ background: stat.bg, border: `1px solid ${stat.border}` }}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="font-display font-black text-2xl" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs font-medium mt-0.5" style={{ color: '#64748B' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Review Soal */}
        <div className="px-6 mb-4">
          <h3 className="font-display font-bold text-sm mb-3 uppercase tracking-wider" style={{ color: '#64748B' }}>Review Jawaban</h3>
          <div className="space-y-2">
            {soal.map((s, i) => {
              const isBenar = jawabanUser[i] === s.jawabanBenar;
              const isOpen = openAccordion === i;
              const labelOpts = ['A', 'B', 'C', 'D'];

              return (
                <div key={s.id} className="rounded-xl overflow-hidden"
                  style={{ border: `1px solid ${isBenar ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, background: isBenar ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)' }}>
                  <button
                    className="w-full flex items-center gap-3 p-3 text-left"
                    onClick={() => setOpenAccordion(isOpen ? null : i)}
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: isBenar ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: isBenar ? '#10B981' : '#EF4444' }}>
                      {i + 1}
                    </div>
                    <span className="flex-1 text-sm line-clamp-1" style={{ color: '#94A3B8' }}>{s.teks}</span>
                    <span className="text-lg">{isBenar ? '✅' : '❌'}</span>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ color: '#475569', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
                    >
                      <polyline points="6,9 12,15 18,9"/>
                    </svg>
                  </button>

                  <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
                    <div className="px-3 pb-3 space-y-2">
                      {s.pilihan.map((opt, j) => (
                        <div key={j} className="flex items-start gap-2 p-2 rounded-lg"
                          style={{
                            background: j === s.jawabanBenar ? 'rgba(16,185,129,0.12)' : (j === jawabanUser[i] && !isBenar) ? 'rgba(239,68,68,0.1)' : 'transparent',
                            border: j === s.jawabanBenar ? '1px solid rgba(16,185,129,0.3)' : (j === jawabanUser[i] && !isBenar) ? '1px solid rgba(239,68,68,0.3)' : '1px solid transparent',
                          }}>
                          <span className="text-xs font-bold flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: '#1E293B', color: '#64748B' }}>{labelOpts[j]}</span>
                          <span className="text-xs" style={{ color: j === s.jawabanBenar ? '#10B981' : (j === jawabanUser[i] && !isBenar) ? '#EF4444' : '#64748B' }}>{opt}</span>
                          {j === s.jawabanBenar && <span className="ml-auto text-xs text-green-400">✓ Benar</span>}
                          {j === jawabanUser[i] && !isBenar && <span className="ml-auto text-xs text-red-400">✗ Pilihan kamu</span>}
                        </div>
                      ))}
                      {s.penjelasan && (
                        <div className="mt-2 p-3 rounded-lg text-xs" style={{ background: 'rgba(0,229,255,0.06)', color: '#64748B', borderLeft: '2px solid rgba(0,229,255,0.3)' }}>
                          <span className="font-semibold" style={{ color: '#00E5FF' }}>💡 Penjelasan: </span>
                          {s.penjelasan}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 p-6 pt-4 flex gap-3" style={{ background: '#111827', borderTop: '1px solid #1E293B' }}>
          <button
            onClick={onLihatRiwayat}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            style={{ background: '#1E293B', color: '#94A3B8', border: '1px solid #2D3748' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,229,255,0.3)'; e.currentTarget.style.color = '#00E5FF'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2D3748'; e.currentTarget.style.color = '#94A3B8'; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
            Lihat Riwayat
          </button>
          <button
            onClick={onTryoutLagi}
            className="flex-1 py-3 rounded-xl text-sm font-bold btn-gradient flex items-center justify-center gap-2"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
            Tryout Lagi
          </button>
        </div>
      </div>
    </div>
  );
}
