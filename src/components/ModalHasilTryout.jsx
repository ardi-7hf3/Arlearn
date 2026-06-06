import React, { useState, useEffect } from 'react';
import LatexRenderer from './LatexRenderer';

const MAPEL_CONFIG = {
  kimia:     { label:'KIMIA',       color:'#F59E0B', icon:'fa-solid fa-flask'      },
  fisika:    { label:'FISIKA',      color:'#00E5FF', icon:'fa-solid fa-atom'       },
  mtkLanjut: { label:'MTK LANJUT', color:'#A78BFA', icon:'fa-solid fa-infinity'   },
  mtkWajib:  { label:'MTK WAJIB',  color:'#10B981', icon:'fa-solid fa-calculator' },
  default:   { label:'UMUM',        color:'#94A3B8', icon:'fa-solid fa-circle'    },
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
  const skorIcon  = skor >= 80 ? 'fa-solid fa-trophy'     : skor >= 60 ? 'fa-solid fa-thumbs-up' : 'fa-solid fa-dumbbell';
  const skorLabel = skor >= 80 ? 'Luar Biasa!'            : skor >= 60 ? 'Cukup Baik'            : 'Terus Berlatih';

  const displaySoal = filterSalah
    ? soal.map((s, i) => ({ ...s, idx: i })).filter((s) => jawabanUser[s.idx] !== s.jawabanBenar)
    : soal.map((s, i) => ({ ...s, idx: i }));

  const TABS = [
    { key:'ringkasan',  icon:'fa-solid fa-chart-pie',   label:'Ringkasan'  },
    { key:'pembahasan', icon:'fa-solid fa-book-open',   label:'Pembahasan' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-4 px-4"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden animate-fadeIn"
        style={{ background: '#111827', border: '1px solid rgba(0,229,255,0.15)', boxShadow:'0 24px 80px rgba(0,0,0,0.7)' }}>

        {/* Header */}
        <div className="p-6 text-center" style={{ borderBottom: '1px solid #1E293B' }}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-3"
            style={{ background: `${skorColor}15`, border: `2px solid ${skorColor}35` }}>
            <span className="font-black text-3xl" style={{ color: skorColor }}>{skor}</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <i className={`${skorIcon} text-sm`} style={{ color: skorColor }} />
            <span className="text-sm font-bold" style={{ color: skorColor }}>{skorLabel}</span>
          </div>
          <h2 className="font-black text-2xl" style={{ color: '#F0F6FF' }}>Hasil Tryout</h2>
          <p className="text-sm mt-1" style={{ color: '#475569' }}>
            <i className="fa-solid fa-layer-group mr-1.5" />{soal.length} soal telah dikerjakan
          </p>

          <div className="flex justify-center gap-8 mt-5">
            {[
              { label: 'Benar', val: benar,    color: '#10B981', icon:'fa-solid fa-circle-check' },
              { label: 'Salah', val: salah,    color: '#EF4444', icon:'fa-solid fa-circle-xmark' },
              { label: 'Skor',  val: skor+'%', color: skorColor, icon:'fa-solid fa-star'         },
            ].map(s => (
              <div key={s.label} className="text-center">
                <i className={`${s.icon} text-xs mb-1 block`} style={{ color: s.color }} />
                <div className="font-black text-2xl" style={{ color: s.color }}>{s.val}</div>
                <div className="text-xs" style={{ color: '#64748B' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab */}
        <div className="flex" style={{ borderBottom: '1px solid #1E293B' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{
                color:        tab===t.key ? '#F97316' : '#475569',
                borderBottom: tab===t.key ? '2px solid #F97316' : '2px solid transparent',
              }}>
              <i className={`${t.icon} text-xs`} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 max-h-[55vh] overflow-y-auto">
          {tab === 'ringkasan' && (
            <div className="space-y-2">
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
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: cfg.color }}>
                        <i className={`${cfg.icon} text-xs`} />
                        {cfg.label}
                      </span>
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
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                  style={{
                    background: !filterSalah ? 'rgba(0,229,255,0.15)' : '#1E293B',
                    color:      !filterSalah ? '#00E5FF' : '#64748B',
                    border:     !filterSalah ? '1px solid rgba(0,229,255,0.3)' : '1px solid #2D3748',
                  }}>
                  <i className="fa-solid fa-list text-xs" />
                  Semua ({soal.length})
                </button>
                <button onClick={() => setFilterSalah(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                  style={{
                    background: filterSalah ? 'rgba(239,68,68,0.15)' : '#1E293B',
                    color:      filterSalah ? '#EF4444' : '#64748B',
                    border:     filterSalah ? '1px solid rgba(239,68,68,0.3)' : '1px solid #2D3748',
                  }}>
                  <i className="fa-solid fa-circle-xmark text-xs" />
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
                        <span className="text-xs font-bold flex items-center gap-1" style={{ color: cfg.color }}>
                          <i className={`${cfg.icon} text-xs`} />{cfg.label}
                        </span>
                        <span className="text-xs" style={{ color: '#475569' }}>Soal {i + 1}</span>
                        <span className="ml-auto">
                          {isBenar
                            ? <i className="fa-solid fa-circle-check text-sm" style={{ color:'#10B981' }} />
                            : <i className="fa-solid fa-circle-xmark text-sm" style={{ color:'#EF4444' }} />
                          }
                        </span>
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#D1D5DB' }}>
                        <LatexRenderer text={s.teks} />
                      </div>
                      {s.pilihan.map((opt, j) => {
                        const isKunci   = j === s.jawabanBenar;
                        const isPilihan = j === userAns;
                        let color = '#475569';
                        if (isKunci) color = '#10B981';
                        else if (isPilihan && !isKunci) color = '#EF4444';
                        return (
                          <div key={j} className="flex items-start gap-2 mt-1 text-xs py-0.5" style={{ color }}>
                            <span className="font-bold w-5 flex-shrink-0">{['A','B','C','D'][j]}.</span>
                            <span className="flex-1"><LatexRenderer text={opt} /></span>
                            {isKunci       && <i className="fa-solid fa-check ml-auto flex-shrink-0 mt-0.5" />}
                            {isPilihan && !isKunci && <i className="fa-solid fa-xmark ml-auto flex-shrink-0 mt-0.5" />}
                          </div>
                        );
                      })}
                      {s.penjelasan && (
                        <div className="mt-2 pt-2 text-xs" style={{ color: '#64748B', borderTop: '1px solid #1E293B' }}>
                          <span className="font-bold flex items-center gap-1 mb-0.5" style={{ color: '#00E5FF' }}>
                            <i className="fa-solid fa-lightbulb text-xs" />Penjelasan
                          </span>
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
            className="flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
            style={{ background: '#1E293B', color: '#94A3B8', border: '1px solid #2D3748' }}>
            <i className="fa-solid fa-clock-rotate-left" />Riwayat
          </button>
          <button onClick={onTryoutLagi}
            className="flex-1 py-3 rounded-xl text-sm font-bold btn-gradient flex items-center justify-center gap-2">
            <i className="fa-solid fa-rotate-right" />Tryout Lagi
          </button>
        </div>
      </div>
    </div>
  );
}
