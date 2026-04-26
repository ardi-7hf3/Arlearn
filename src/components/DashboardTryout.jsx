import React, { useState, useEffect } from 'react';
import { getSoal } from '../utils/soalStorage';
import { addRiwayat } from '../utils/riwayatStorage';
import ModalHasilTryout from './ModalHasilTryout';
import CustomAlert from './CustomAlert';

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
  const [soalList, setSoalList] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [jawabanUser, setJawabanUser] = useState({});
  const [showHasil, setShowHasil] = useState(false);
  const [hasilData, setHasilData] = useState(null);
  const [tryoutCount, setTryoutCount] = useState(getTryoutCount);
  const [rataRata, setRataRata] = useState(getRataRata);
  const [streakDay, setStreakDay] = useState(1);
  const [alertSelesai, setAlertSelesai] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setSoalList(getSoal());
    // Streak count
    const key = getStreakKey();
    const val = localStorage.getItem(key);
    if (!val) {
      const allKeys = Object.keys(localStorage).filter(k => k.startsWith('arlearn_streak_'));
      setStreakDay(allKeys.length + 1);
    } else {
      setStreakDay(parseInt(val));
    }
  }, []);

  const total = soalList.length;
  const terjawab = Object.keys(jawabanUser).length;
  const progress = total > 0 ? (terjawab / total) * 100 : 0;
  const soal = soalList[currentIdx];
  const semuaTerjawab = terjawab === total && total > 0;

  const handlePilih = (idx) => {
    setJawabanUser(prev => ({ ...prev, [currentIdx]: idx }));
  };

  const handleNext = () => {
    if (currentIdx < total - 1) {
      setCurrentIdx(c => c + 1);
      setAnimKey(k => k + 1);
    }
  };
  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(c => c - 1);
      setAnimKey(k => k + 1);
    }
  };

  const handleSelesai = () => {
    if (!semuaTerjawab) return;
    setAlertSelesai(true);
  };

  const konfirmasiSelesai = () => {
    setAlertSelesai(false);
    const benar = soalList.filter((s, i) => jawabanUser[i] === s.jawabanBenar).length;
    const salah = total - benar;
    const skor = Math.round((benar / total) * 100);

    addRiwayat({ skor, benar, salah, totalSoal: total, soal: soalList, jawabanUser });

    const newCount = tryoutCount + 1;
    localStorage.setItem('arlearn_tryout_count', newCount);
    setTryoutCount(newCount);

    const key = getStreakKey();
    localStorage.setItem(key, streakDay);

    setHasilData({ soal: soalList, jawabanUser });
    setShowHasil(true);
    setRataRata(getRataRata());
  };

  const handleTryoutLagi = () => {
    setShowHasil(false);
    setJawabanUser({});
    setCurrentIdx(0);
    setAnimKey(k => k + 1);
    setSoalList(getSoal());
  };

  const handleLihatRiwayat = () => {
    setShowHasil(false);
    onGoRiwayat();
  };

  const labelOpts = ['A', 'B', 'C', 'D'];

  if (!soal) return (
    <div className="flex items-center justify-center h-64" style={{ color: '#64748B' }}>
      <div className="spin-anim w-8 h-8 border-2 border-current border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl" style={{ color: '#F0F6FF' }}>
              Halo, Ardi! <span className="inline-block" style={{ animation: 'wave 1s ease-in-out' }}>👋</span>
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#475569' }}>Siap untuk tryout hari ini?</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <span>🔥</span>
            <span className="text-sm font-semibold" style={{ color: '#F59E0B' }}>Hari ke-{streakDay}</span>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '📚', label: 'Total Soal', value: total, color: '#00E5FF' },
            { icon: '⭐', label: 'Rata-rata', value: rataRata + '%', color: '#F59E0B' },
            { icon: '🏆', label: 'Tryout', value: tryoutCount + 'x', color: '#10B981' },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl p-4 card-hover"
              style={{ background: '#111827' }}>
              <div className="text-xl mb-2">{stat.icon}</div>
              <div className="font-display font-black text-xl" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#475569' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 p-4 rounded-2xl" style={{ background: '#111827', border: '1px solid #1E293B' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: '#94A3B8' }}>Progress Soal</span>
          <span className="text-sm font-bold" style={{ color: '#00E5FF' }}>{terjawab}/{total}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1E293B' }}>
          <div className="h-full rounded-full progress-bar-inner" style={{ width: `${progress}%` }} />
        </div>
        {/* Navigator dots */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {soalList.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentIdx(i); setAnimKey(k => k + 1); }}
              className="w-7 h-7 rounded-lg text-xs font-bold transition-all"
              style={{
                background: i === currentIdx ? 'linear-gradient(135deg, #00E5FF, #06B6D4)' : jawabanUser[i] !== undefined ? 'rgba(16,185,129,0.2)' : '#1E293B',
                color: i === currentIdx ? '#050B18' : jawabanUser[i] !== undefined ? '#10B981' : '#475569',
                border: i === currentIdx ? 'none' : jawabanUser[i] !== undefined ? '1px solid rgba(16,185,129,0.3)' : '1px solid #2D3748',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div key={animKey} className="rounded-2xl p-6 mb-4 animate-fadeSlide"
        style={{ background: '#111827', border: '1px solid #1E293B', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-black text-sm"
              style={{ background: 'linear-gradient(135deg, #00E5FF20, #06B6D420)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.2)' }}>
              {currentIdx + 1}
            </div>
            <span className="text-xs font-medium" style={{ color: '#475569' }}>dari {total} soal</span>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${jawabanUser[currentIdx] !== undefined ? 'badge-answered' : 'badge-unanswered'}`}>
            {jawabanUser[currentIdx] !== undefined ? '✓ Sudah Dijawab' : '○ Belum Dijawab'}
          </span>
        </div>

        {/* Question text */}
        <p className="font-display font-semibold text-base sm:text-lg leading-relaxed mb-5" style={{ color: '#F0F6FF' }}>
          {soal.teks}
        </p>

        {/* Options */}
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
              <span className="font-bold text-sm flex-shrink-0" style={{ color: '#00E5FF', minWidth: '20px' }}>{labelOpts[j]}</span>
              <span className="text-sm" style={{ color: jawabanUser[currentIdx] === j ? '#F0F6FF' : '#94A3B8' }}>{opt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
          style={{ background: '#111827', color: '#94A3B8', border: '1px solid #1E293B' }}
          onMouseEnter={e => { if (currentIdx > 0) { e.currentTarget.style.borderColor = 'rgba(0,229,255,0.3)'; e.currentTarget.style.color = '#00E5FF'; }}}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E293B'; e.currentTarget.style.color = '#94A3B8'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15,18 9,12 15,6"/></svg>
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9,18 15,12 9,6"/></svg>
        </button>
      </div>

      {/* FAB Selesai */}
      <button
        onClick={handleSelesai}
        disabled={!semuaTerjawab}
        className={`fab-btn px-6 py-3.5 rounded-2xl font-display font-bold text-sm flex items-center gap-2 btn-gradient disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
        Selesai Tryout
        {!semuaTerjawab && <span className="text-xs font-normal opacity-75">({total - terjawab} belum)</span>}
      </button>

      {/* Confirm selesai */}
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

      {/* Modal Hasil */}
      <ModalHasilTryout
        show={showHasil}
        soal={hasilData?.soal}
        jawabanUser={hasilData?.jawabanUser}
        onTryoutLagi={handleTryoutLagi}
        onLihatRiwayat={handleLihatRiwayat}
      />
    </div>
  );
}
