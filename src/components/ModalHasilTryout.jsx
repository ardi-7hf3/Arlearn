import React, { useState, useEffect } from 'react';
import ProgressChart from './ProgressChart';
import LatexRenderer from './LatexRenderer';
import { useConfetti } from '../hooks/useConfetti';

const LABEL = ['A', 'B', 'C', 'D'];

// ── Pembahasan per soal ───────────────────────────────────────────────────────
function PembahasanBlock({ soal, indexSoal, jawabanUser }) {
  const isBenar = jawabanUser[indexSoal] === soal.jawabanBenar;

  return (
    <div className="rounded-2xl overflow-hidden mb-4"
      style={{ border: `1px solid ${isBenar ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>

      {/* Header */}
      <div className="p-4" style={{ background: isBenar ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)' }}>
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
            style={{ background: isBenar ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: isBenar ? '#10B981' : '#EF4444' }}>
            {indexSoal + 1}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold leading-relaxed mb-3" style={{ color: '#F0F6FF' }}>
              <LatexRenderer text={soal.teks} />
            </div>
            {/* Pilihan */}
            <div className="space-y-1.5">
              {soal.pilihan.map((opt, j) => {
                const isJawabBenar = j === soal.jawabanBenar;
                const isPilihUser  = j === jawabanUser[indexSoal];
                const isWrongPick  = isPilihUser && !isBenar;
                return (
                  <div key={j} className="flex items-start gap-2 px-3 py-2 rounded-xl text-xs"
                    style={{
                      background: isJawabBenar ? 'rgba(16,185,129,0.12)' : isWrongPick ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.02)',
                      border: isJawabBenar ? '1px solid rgba(16,185,129,0.35)' : isWrongPick ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.04)',
                    }}>
                    <span className="font-bold flex-shrink-0 w-4" style={{ color: isJawabBenar ? '#10B981' : isWrongPick ? '#EF4444' : '#475569' }}>
                      {LABEL[j]}.
                    </span>
                    <span className="flex-1" style={{ color: isJawabBenar ? '#10B981' : isWrongPick ? '#EF4444' : '#64748B' }}>
                      <LatexRenderer text={opt} />
                    </span>
                    <span className="flex-shrink-0 ml-1 flex items-center gap-1">
                      {isJawabBenar && (
                        <span className="flex items-center gap-1" style={{ color: '#10B981' }}>
                          <i className="fa-solid fa-circle-check text-xs" /> Kunci
                        </span>
                      )}
                      {isWrongPick && (
                        <span className="flex items-center gap-1" style={{ color: '#EF4444' }}>
                          <i className="fa-solid fa-circle-xmark text-xs" /> Pilihanmu
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pembahasan */}
      {soal.pembahasan && (
        <div className="p-4" style={{ background: 'rgba(0,229,255,0.03)', borderTop: '1px solid rgba(0,229,255,0.1)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ background: 'rgba(0,229,255,0.15)', border: '1px solid rgba(0,229,255,0.3)' }}>
              <i className="fa-solid fa-lightbulb text-xs" style={{ color: '#00E5FF' }} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#00E5FF' }}>Pembahasan</span>
          </div>
          <div className="text-sm leading-relaxed pl-1" style={{ color: '#94A3B8' }}>
            <LatexRenderer text={soal.pembahasan} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Modal utama ───────────────────────────────────────────────────────────────
export default function ModalHasilTryout({ show, soal, jawabanUser, onTryoutLagi, onLihatRiwayat }) {
  const [tab, setTab]                     = useState('ringkasan');
  const [openAccordion, setOpenAccordion] = useState(null);
  const { fireConfetti }                  = useConfetti();

  useEffect(() => {
    if (show) {
      setTab('ringkasan');
      setOpenAccordion(null);
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
  const skor  = Math.round((benar / total) * 100);

  const stats = [
    { icon: 'fa-solid fa-circle-check',  label: 'Benar', value: benar, color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
    { icon: 'fa-solid fa-circle-xmark',  label: 'Salah', value: salah, color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)'  },
    { icon: 'fa-solid fa-star',          label: 'Skor',  value: skor,  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,11,24,0.92)', backdropFilter: 'blur(14px)' }}>
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl animate-scaleIn"
        style={{ background: '#111827', border: '1px solid rgba(0,229,255,0.2)', boxShadow: '0 0 60px rgba(0,0,0,0.8), 0 0 30px rgba(0,229,255,0.06)' }}>

        {/* ── Header ── */}
        <div className="p-6 pb-0 text-center flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(6,182,212,0.1))', border: '1px solid rgba(0,229,255,0.2)' }}>
            <i className="fa-solid fa-trophy text-2xl" style={{ color: '#F59E0B' }} />
          </div>
          <h2 className="font-display font-black text-2xl" style={{ color: '#F0F6FF' }}>Tryout Selesai!</h2>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>Berikut hasil &amp; pembahasan lengkap tryoutmu</p>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex gap-2 px-6 pt-4 pb-0 flex-shrink-0">
          {[
            { key: 'ringkasan',  label: 'Ringkasan',  icon: 'fa-solid fa-chart-pie' },
            { key: 'pembahasan', label: 'Pembahasan', icon: 'fa-solid fa-book-open' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              style={{
                background: tab === t.key ? 'rgba(0,229,255,0.12)' : '#0B1121',
                color: tab === t.key ? '#00E5FF' : '#64748B',
                border: tab === t.key ? '1px solid rgba(0,229,255,0.3)' : '1px solid #1E293B',
              }}>
              <i className={`${t.icon} text-xs`} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* ═══ TAB RINGKASAN ═══ */}
          {tab === 'ringkasan' && (
            <div>
              <div className="flex justify-center py-2 mb-4">
                <ProgressChart persentase={skor} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {stats.map(stat => (
                  <div key={stat.label} className="rounded-xl p-4 text-center"
                    style={{ background: stat.bg, border: `1px solid ${stat.border}` }}>
                    <i className={`${stat.icon} text-2xl mb-2 block`} style={{ color: stat.color }} />
                    <div className="font-display font-black text-2xl" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="text-xs font-medium mt-0.5" style={{ color: '#64748B' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Accordion review singkat */}
              <h3 className="font-display font-bold text-xs mb-3 uppercase tracking-wider" style={{ color: '#64748B' }}>
                Review Jawaban
              </h3>
              <div className="space-y-2">
                {soal.map((s, i) => {
                  const isBenar = jawabanUser[i] === s.jawabanBenar;
                  const isOpen  = openAccordion === i;
                  return (
                    <div key={s.id} className="rounded-xl overflow-hidden"
                      style={{ border: `1px solid ${isBenar ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, background: isBenar ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)' }}>
                      <button className="w-full flex items-center gap-3 p-3 text-left"
                        onClick={() => setOpenAccordion(isOpen ? null : i)}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                          style={{ background: isBenar ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: isBenar ? '#10B981' : '#EF4444' }}>
                          {i + 1}
                        </div>
                        <span className="flex-1 text-xs line-clamp-1" style={{ color: '#94A3B8' }}>
                          {s.teks.replace(/\$[\s\S]*?\$/g, '[math]').slice(0, 80)}
                        </span>
                        <i className={`fa-solid ${isBenar ? 'fa-circle-check' : 'fa-circle-xmark'} text-sm`}
                          style={{ color: isBenar ? '#10B981' : '#EF4444' }} />
                        <i className="fa-solid fa-chevron-down text-xs"
                          style={{ color: '#475569', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                      </button>

                      <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
                        <div className="px-3 pb-3 space-y-1.5">
                          {s.pilihan.map((opt, j) => (
                            <div key={j} className="flex items-start gap-2 p-2 rounded-lg"
                              style={{
                                background: j === s.jawabanBenar ? 'rgba(16,185,129,0.12)' : (j === jawabanUser[i] && !isBenar) ? 'rgba(239,68,68,0.1)' : 'transparent',
                                border: j === s.jawabanBenar ? '1px solid rgba(16,185,129,0.3)' : (j === jawabanUser[i] && !isBenar) ? '1px solid rgba(239,68,68,0.3)' : '1px solid transparent',
                              }}>
                              <span className="text-xs font-bold flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                                style={{ background: '#1E293B', color: '#64748B' }}>{LABEL[j]}</span>
                              <span className="text-xs flex-1" style={{ color: j === s.jawabanBenar ? '#10B981' : (j === jawabanUser[i] && !isBenar) ? '#EF4444' : '#64748B' }}>
                                <LatexRenderer text={opt} />
                              </span>
                              {j === s.jawabanBenar && (
                                <span className="ml-auto text-xs flex items-center gap-1" style={{ color: '#10B981' }}>
                                  <i className="fa-solid fa-check text-xs" /> Benar
                                </span>
                              )}
                              {j === jawabanUser[i] && !isBenar && (
                                <span className="ml-auto text-xs flex items-center gap-1" style={{ color: '#EF4444' }}>
                                  <i className="fa-solid fa-xmark text-xs" /> Pilihanmu
                                </span>
                              )}
                            </div>
                          ))}
                          {s.penjelasan && (
                            <div className="mt-2 p-3 rounded-lg text-xs flex gap-2"
                              style={{ background: 'rgba(0,229,255,0.06)', borderLeft: '2px solid rgba(0,229,255,0.3)' }}>
                              <i className="fa-solid fa-lightbulb flex-shrink-0 mt-0.5" style={{ color: '#00E5FF' }} />
                              <span style={{ color: '#64748B' }}><LatexRenderer text={s.penjelasan} /></span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA ke pembahasan */}
              <button onClick={() => setTab('pembahasan')}
                className="w-full mt-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                style={{ background: 'rgba(0,229,255,0.08)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.2)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,229,255,0.13)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,229,255,0.08)'}>
                <i className="fa-solid fa-book-open text-xs" />
                Lihat Pembahasan Lengkap
                <i className="fa-solid fa-chevron-right text-xs" />
              </button>
            </div>
          )}

          {/* ═══ TAB PEMBAHASAN ═══ */}
          {tab === 'pembahasan' && (
            <div>
              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl" style={{ background: '#0B1121' }}>
                <span className="text-xs font-medium" style={{ color: '#64748B' }}>Tampilkan:</span>
                <span className="text-xs px-2 py-1 rounded-lg flex items-center gap-1"
                  style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
                  <i className="fa-solid fa-circle-check text-xs" /> {benar} benar
                </span>
                <span className="text-xs px-2 py-1 rounded-lg flex items-center gap-1"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                  <i className="fa-solid fa-circle-xmark text-xs" /> {salah} salah
                </span>
              </div>
              {soal.map((s, i) => (
                <PembahasanBlock key={s.id} soal={s} indexSoal={i} jawabanUser={jawabanUser} />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer actions ── */}
        <div className="flex-shrink-0 p-4 flex gap-3" style={{ borderTop: '1px solid #1E293B', background: '#111827' }}>
          <button onClick={onLihatRiwayat}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            style={{ background: '#1E293B', color: '#94A3B8', border: '1px solid #2D3748' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,229,255,0.3)'; e.currentTarget.style.color = '#00E5FF'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2D3748'; e.currentTarget.style.color = '#94A3B8'; }}>
            <i className="fa-solid fa-clock-rotate-left text-xs" />
            Riwayat
          </button>
          <button onClick={onTryoutLagi}
            className="flex-1 py-3 rounded-xl text-sm font-bold btn-gradient flex items-center justify-center gap-2">
            <i className="fa-solid fa-rotate-right text-xs" />
            Tryout Lagi
          </button>
        </div>
      </div>
    </div>
  );
}
