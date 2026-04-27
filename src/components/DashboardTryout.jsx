import React, { useState, useEffect } from 'react';
import { getSoal } from '../utils/soalStorage';
import { addRiwayat } from '../utils/riwayatStorage';
import ModalHasilTryout from './ModalHasilTryout';
import CustomAlert from './CustomAlert';
import LatexRenderer from './LatexRenderer';

function getStreakKey() {
  return 'arlearn_streak_' + new Date().toDateString();
}
function getTryoutCount() {
  try { return parseInt(localStorage.getItem('arlearn_tryout_count') || '0'); } catch { return 0; }
}
function getRataRata() {
  try {
    const riwayat = JSON.parse(localStorage.getItem('riwayatARLearn') || '[]');
    if (!riwayat.length) return 0;
    return Math.round(riwayat.reduce((s, r) => s + r.skor, 0) / riwayat.length);
  } catch { return 0; }
}

export default function DashboardTryout({ onGoRiwayat }) {
  const [soalList, setSoalList]         = useState([]);
  const [currentIdx, setCurrentIdx]     = useState(0);
  const [jawabanUser, setJawabanUser]   = useState({});
  const [showHasil, setShowHasil]       = useState(false);
  const [hasilData, setHasilData]       = useState(null);
  const [tryoutCount, setTryoutCount]   = useState(getTryoutCount);
  const [rataRata, setRataRata]         = useState(getRataRata);
  const [streakDay, setStreakDay]       = useState(1);
  const [alertSelesai, setAlertSelesai] = useState(false);
  const [animKey, setAnimKey]           = useState(0);

  useEffect(() => {
    setSoalList(getSoal());
    const key = getStreakKey();
    const val = localStorage.getItem(key);
    if (!val) {
      const allKeys = Object.keys(localStorage).filter(k => k.startsWith('arlearn_streak_'));
      setStreakDay(allKeys.length + 1);
    } else {
      setStreakDay(parseInt(val));
    }
  }, []);

  const total         = soalList.length;
  const terjawab      = Object.keys(jawabanUser).length;
  const progress      = total > 0 ? (terjawab / total) * 100 : 0;
  const soal          = soalList[currentIdx];
  const semuaTerjawab = terjawab === total && total > 0;

  const handlePilih = (idx) => setJawabanUser(prev => ({ ...prev, [currentIdx]: idx }));

  const goTo = (idx) => { setCurrentIdx(idx); setAnimKey(k => k + 1); };
  const handleNext = () => { if (currentIdx < total - 1) goTo(currentIdx + 1); };
  const handlePrev = () => { if (currentIdx > 0) goTo(currentIdx - 1); };

  const handleSelesai = () => { if (semuaTerjawab) setAlertSelesai(true); };

  const konfirmasiSelesai = () => {
    setAlertSelesai(false);
    const benar = soalList.filter((s, i) => jawabanUser[i] === s.jawabanBenar).length;
    const salah = total - benar;
    const skor  = Math.round((benar / total) * 100);

    addRiwayat({ skor, benar, salah, totalSoal: total, soal: soalList, jawabanUser });

    const newCount = tryoutCount + 1;
    localStorage.setItem('arlearn_tryout_count', newCount);
    setTryoutCount(newCount);
    localStorage.setItem(getStreakKey(), streakDay);

    setHasilData({ soal: soalList, jawabanUser });
    setShowHasil(true);
    setRataRata(getRataRata());
  };

  const handleTryoutLagi = () => {
    setShowHasil(false);
    setJawabanUser({});
    goTo(0);
    setSoalList(getSoal());
  };

  const labelOpts = ['A', 'B', 'C', 'D'];

  if (!soal) return (
    <div className="flex items-center justify-center h-64" style={{ color: '#64748B' }}>
      <i className="fa-solid fa-spinner fa-spin text-2xl" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeIn">

      {/* ── Hero ── */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div>
            <h1 style={{
              fontFamily: '"Poppins", serif',
              fontWeight: 800,
              fontStyle: 'italic',
              fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
              color: '#F0F6FF',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}>
              Halo, Ardi!{' '}
              <i className="fa-solid fa-hand-wave"
                style={{ color: '#F59E0B', display: 'inline-block', animation: 'wave 1s ease-in-out', fontStyle: 'normal' }} />
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#475569' }}>Siap untuk tryout hari ini?</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <i className="fa-solid fa-fire" style={{ color: '#F59E0B' }} />
            <span className="text-sm font-semibold" style={{ color: '#F59E0B' }}>Hari ke-{streakDay}</span>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: 'fa-solid fa-book-open', label: 'Total Soal', value: total,          color: '#00E5FF' },
            { icon: 'fa-solid fa-star',       label: 'Rata-rata',  value: rataRata + '%', color: '#F59E0B' },
            { icon: 'fa-solid fa-trophy',     label: 'Tryout',     value: tryoutCount + 'x', color: '#10B981' },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl p-4 card-hover" style={{ background: '#111827' }}>
              <i className={`${stat.icon} text-xl mb-2 block`} style={{ color: stat.color }} />
              <div className="font-display font-black text-xl" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#475569' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Progress ── */}
      <div className="mb-6 p-4 rounded-2xl" style={{ background: '#111827', border: '1px solid #1E293B' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: '#94A3B8' }}>Progress Soal</span>
          <span className="text-sm font-bold" style={{ color: '#00E5FF' }}>{terjawab}/{total}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1E293B' }}>
          <div className="h-full rounded-full progress-bar-inner" style={{ width: `${progress}%` }} />
        </div>
        {/* Nomor soal */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {soalList.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="w-7 h-7 rounded-lg text-xs font-bold transition-all"
              style={{
                background: i === currentIdx
                  ? 'linear-gradient(135deg, #00E5FF, #06B6D4)'
                  : jawabanUser[i] !== undefined ? 'rgba(16,185,129,0.2)' : '#1E293B',
                color: i === currentIdx ? '#050B18'
                  : jawabanUser[i] !== undefined ? '#10B981' : '#475569',
                border: i === currentIdx ? 'none'
                  : jawabanUser[i] !== undefined ? '1px solid rgba(16,185,129,0.3)' : '1px solid #2D3748',
              }}
            >{i + 1}</button>
          ))}
        </div>
      </div>

      {/* ── Question Card ── */}
      <div key={animKey} className="rounded-2xl p-6 mb-4 animate-fadeSlide"
        style={{ background: '#111827', border: '1px solid #1E293B', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>

        {/* Header soal */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-black text-sm"
              style={{ background: 'linear-gradient(135deg,#00E5FF20,#06B6D420)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.2)' }}>
              {currentIdx + 1}
            </div>
            <span className="text-xs font-medium" style={{ color: '#475569' }}>dari {total} soal</span>
          </div>
          {jawabanUser[currentIdx] !== undefined ? (
            <span className="badge-answered text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <i className="fa-solid fa-circle-check text-xs" />
              Sudah Dijawab
            </span>
          ) : (
            <span className="badge-unanswered text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <i className="fa-regular fa-circle text-xs" />
              Belum Dijawab
            </span>
          )}
        </div>

        {/* Teks soal */}
        <div className="font-display font-semibold text-base sm:text-lg leading-relaxed mb-5" style={{ color: '#F0F6FF' }}>
          <LatexRenderer text={soal.teks} />
        </div>

        {/* Pilihan jawaban */}
        <div className="space-y-2.5">
          {soal.pilihan.map((opt, j) => (
            <div
              key={j}
              className={`answer-card rounded-xl p-3.5 flex items-center gap-3 ${jawabanUser[currentIdx] === j ? 'selected' : ''}`}
              onClick={() => handlePilih(j)}
              style={{ background: '#0B1121' }}
            >
              {/* Custom radio */}
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  border: jawabanUser[currentIdx] === j ? '2px solid #00E5FF' : '2px solid #2D3748',
                  background: jawabanUser[currentIdx] === j ? 'rgba(0,229,255,0.15)' : 'transparent',
                }}>
                {jawabanUser[currentIdx] === j && (
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#00E5FF' }} />
                )}
              </div>
              <span className="font-bold text-sm flex-shrink-0" style={{ color: '#00E5FF', minWidth: '20px' }}>
                {labelOpts[j]}
              </span>
              <span className="text-sm" style={{ color: jawabanUser[currentIdx] === j ? '#F0F6FF' : '#94A3B8' }}>
                <LatexRenderer text={opt} />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Navigasi Prev/Next ── */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
          style={{ background: '#111827', color: '#94A3B8', border: '1px solid #1E293B' }}
          onMouseEnter={e => { if (currentIdx > 0) { e.currentTarget.style.borderColor = 'rgba(0,229,255,0.3)'; e.currentTarget.style.color = '#00E5FF'; }}}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E293B'; e.currentTarget.style.color = '#94A3B8'; }}
        >
          <i className="fa-solid fa-chevron-left text-xs" />
          Sebelumnya
        </button>

        <span className="text-xs" style={{ color: '#334155' }}>{currentIdx + 1} / {total}</span>

        <button
          onClick={handleNext}
          disabled={currentIdx === total - 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
          style={{ background: '#111827', color: '#94A3B8', border: '1px solid #1E293B' }}
          onMouseEnter={e => { if (currentIdx < total - 1) { e.currentTarget.style.borderColor = 'rgba(0,229,255,0.3)'; e.currentTarget.style.color = '#00E5FF'; }}}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E293B'; e.currentTarget.style.color = '#94A3B8'; }}
        >
          Selanjutnya
          <i className="fa-solid fa-chevron-right text-xs" />
        </button>
      </div>

      {/* ── Tombol Selesai Tryout ── */}
      <div className="mt-2 mb-8">
        {semuaTerjawab ? (
          /* Muncul HANYA saat semua soal terjawab */
          <button
            onClick={handleSelesai}
            className="w-full py-4 rounded-2xl font-display font-bold text-base btn-gradient flex items-center justify-center gap-2 animate-fadeIn"
            style={{ boxShadow: '0 0 24px rgba(0,229,255,0.35), 0 4px 20px rgba(0,0,0,0.4)' }}
          >
            <i className="fa-solid fa-circle-check text-lg" />
            Selesai Tryout
          </button>
        ) : (
          /* Info sisa soal — tanpa tombol, tanpa background */
          <p className="text-center text-xs py-2" style={{ color: '#334155' }}>
            <i className="fa-solid fa-circle-info mr-1.5" style={{ color: '#1E293B' }} />
            Jawab semua soal untuk mengaktifkan tombol selesai
            &nbsp;·&nbsp;
            <span style={{ color: '#475569' }}>{terjawab}/{total} terjawab</span>
          </p>
        )}
      </div>

      <CustomAlert
        show={alertSelesai}
        tipe="confirm"
        judul="Selesaikan Tryout?"
        pesan={`Kamu telah menjawab semua ${total} soal. Yakin ingin menyelesaikan tryout ini?`}
        yesLabel="Ya, Selesaikan"
        noLabel="Cek Lagi"
        onYes={konfirmasiSelesai}
        onNo={() => setAlertSelesai(false)}
      />

      <ModalHasilTryout
        show={showHasil}
        soal={hasilData?.soal}
        jawabanUser={hasilData?.jawabanUser}
        onTryoutLagi={handleTryoutLagi}
        onLihatRiwayat={() => { setShowHasil(false); onGoRiwayat(); }}
      />
    </div>
  );
}
