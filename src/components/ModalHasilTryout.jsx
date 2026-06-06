import React, { useState, useEffect } from 'react';
import LatexRenderer from './LatexRenderer';

const MAPEL_CONFIG = {
  kimia:     { label:'KIMIA',       color:'#F59E0B' },
  fisika:    { label:'FISIKA',      color:'#00E5FF' },
  mtkLanjut: { label:'MTK LANJUT', color:'#A78BFA' },
  mtkWajib:  { label:'MTK WAJIB',  color:'#10B981' },
  default:   { label:'UMUM',        color:'#94A3B8' },
};

export default function ModalHasilTryout({ show, soal, jawabanUser, onTryoutLagi, onLihatRiwayat }) {
  const [tab, setTab] = useState('ringkasan');
  const [filterSalah, setFilterSalah] = useState(false);

  useEffect(() => {
    if (show) { setTab('ringkasan'); setFilterSalah(false); }
  }, [show]);

  if (!show || !soal) return null;

  const benar = soal.filter((s, i) => jawabanUser[i] === s.jawabanBenar).length;
  const salah  = soal.length - benar;
  const skor   = Math.round((benar / soal.length) * 100);

  const skorColor = skor >= 80 ? '#10B981' : skor >= 60 ? '#F59E0B' : '#EF4444';
  const skorLabel = skor >= 80 ? 'Luar Biasa! 🎉' : skor >= 60 ? 'Cukup Baik 👍' : 'Terus Berlatih 💪';

  const displaySoal = filterSalah
    ? soal.map((s, i) => ({ ...s, idx: i })).filter((s) => jawabanUser[s.idx] !== s.jawabanBenar)
    : soal.map((s, i) => ({ ...s, idx: i }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-4 px-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden animate-fadeIn"
        style={{ background: '#111827', border: '1px solid rgba(0,229,255,0.15)' }}>

        {/* Header */}
        <div className="p-6 text-center" style={{ borderBottom: '1px solid #1E293B' }}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-3"
            style={{ background: `${skorColor}18`, border: `2px solid ${skorColor}40` }}>
            <span className="font-black text-3xl" style={{ color: skorColor }}>{skor}</span>
          </div>
          <div className="text-sm font-bold mb-0.5" style={{ color: skorColor }}>{skorLabel}</div>
          <h2 className="font-black text-2xl" style={{ color: '#F0F6FF' }}>Hasil Tryout</h2>
          <p className="text-sm mt-1" style={{ color: '#475569' }}>{soal.length} soal telah dikerjakan</p>

          <div className="flex justify-center gap-6 mt-4">
            {[
              { label: 'Benar', val: benar, color: '#10B981' },
              { label: 'Salah', val: salah, color: '#EF4444' },
              { label: 'Skor',  val: skor+'%', color: skorColor },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="font-black text-2xl" style={{ color: s.color }}>{s.val}</div>
                <div className="text-xs" style={{ color: '#64748B' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab */}
        <div className="flex" style={{ borderBottom: '1px solid #1E293B' }}>
          {['ringkasan', 'pembahasan'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-3 text-sm font-semibold capitalize transition-all"
              style={{
                color: tab === t ? '#F97316' : '#475569',
                borderBottom: tab === t ? '2px solid #F97316' : '2px solid transparent',
              }}>
              {t === 'ringkasan' ? '📊 Ringkasan' : '📖 Pembahasan'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 max-h-[55vh] overflow-y-auto">
          {tab === 'ringkasan' && (
            <div className="space-y-2">
              {/* Per mapel */}
              {Object.entries(
                soal.reduce((acc, s, i) => {
                  const m = s.mapel || 'default';
                  if (!acc[m]) acc[m] = { benar: 0, total: 0 };
                  acc[m].total++;
                  if (jawabanUser[i] === s.jawabanBenar) acc[m].benar++;
                  return acc;
                }, {})
              ).map(([mapel, stat]) => {
                const cfg = MAPEL_CONFIG[mapel] || MAPEL_CONFIG.default;
                const pct = Math.round((stat.benar / stat.total) * 100);
                return (
                  <div key={mapel} className="rounded-xl p-4" style={{ background: '#0B1121', border: '1px solid #1E293B' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                      <span className="text-xs font-bold" style={{ color: cfg.color }}>{stat.benar}/{stat.total} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1E293B' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: cfg.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'pembahasan' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => setFilterSalah(false)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: !filterSalah ? 'rgba(0,229,255,0.15)' : '#1E293B',
                    color: !filterSalah ? '#00E5FF' : '#64748B',
                    border: !filterSalah ? '1px solid rgba(0,229,255,0.3)' : '1px solid #2D3748',
                  }}>
                  Semua ({soal.length})
                </button>
                <button onClick={() => setFilterSalah(true)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: filterSalah ? 'rgba(239,68,68,0.15)' : '#1E293B',
                    color: filterSalah ? '#EF4444' : '#64748B',
                    border: filterSalah ? '1px solid rgba(239,68,68,0.3)' : '1px solid #2D3748',
                  }}>
                  Salah ({salah})
                </button>
              </div>

              <div className="space-y-3">
                {displaySoal.map((s) => {
                  const i = s.idx;
                  const userAns = jawabanUser[i];
                  const isBenar = userAns === s.jawabanBenar;
                  const cfg = MAPEL_CONFIG[s.mapel] || MAPEL_CONFIG.default;
                  return (
                    <div key={i} className="rounded-xl p-4"
                      style={{
                        background: '#0B1121',
                        border: `1px solid ${isBenar ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                      }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                        <span className="text-xs" style={{ color: '#475569' }}>Soal {i + 1}</span>
                        <span className="ml-auto text-sm">{isBenar ? '✅' : '❌'}</span>
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#D1D5DB' }}>
                        <LatexRenderer text={s.teks} />
                      </div>
                      {/* Pilihan */}
                      {s.pilihan.map((opt, j) => {
                        const isKunci = j === s.jawabanBenar;
                        const isPilihan = j === userAns;
                        let color = '#475569';
                        if (isKunci) color = '#10B981';
                        else if (isPilihan && !isKunci) color = '#EF4444';
                        return (
                          <div key={j} className="flex items-start gap-2 mt-1 text-xs py-1"
                            style={{ color }}>
                            <span className="font-bold w-5 flex-shrink-0">
                              {['A','B','C','D'][j]}.
                            </span>
                            <LatexRenderer text={opt} />
                            {isKunci && <i className="fa-solid fa-check ml-auto flex-shrink-0" />}
                            {isPilihan && !isKunci && <i className="fa-solid fa-xmark ml-auto flex-shrink-0" />}
                          </div>
                        );
                      })}
                      {/* Penjelasan */}
                      {s.penjelasan && (
                        <div className="mt-2 pt-2 text-xs" style={{ color: '#64748B', borderTop: '1px solid #1E293B' }}>
                          <span className="font-bold" style={{ color: '#00E5FF' }}>Penjelasan: </span>
                          <LatexRenderer text={s.penjelasan} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4" style={{ borderTop: '1px solid #1E293B' }}>
          <button onClick={onLihatRiwayat}
            className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
            style={{ background: '#1E293B', color: '#94A3B8', border: '1px solid #2D3748' }}>
            <i className="fa-solid fa-clock-rotate-left mr-2" />Riwayat
          </button>
          <button onClick={onTryoutLagi}
            className="flex-1 py-3 rounded-xl text-sm font-bold btn-gradient">
            <i className="fa-solid fa-rotate-right mr-2" />Tryout Lagi
          </button>
        </div>
      </div>
    </div>
  );
}
