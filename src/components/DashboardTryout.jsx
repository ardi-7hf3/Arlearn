import React, { useState, useEffect } from 'react';
import { getSoal } from '../utils/soalStorage';
import { addRiwayat } from '../utils/riwayatStorage';
import ModalHasilTryout from './ModalHasilTryout';
import CustomAlert from './CustomAlert';
import LatexRenderer from './LatexRenderer';

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
function getStreakDay() {
  const allKeys = Object.keys(localStorage).filter(k => k.startsWith('arlearn_streak_'));
  return Math.max(1, allKeys.length);
}

const MAPEL_CONFIG = {
  kimia:      { label: 'KIMIA',        color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)' },
  fisika:     { label: 'FISIKA',       color: '#00E5FF', bg: 'rgba(0,229,255,0.12)',   border: 'rgba(0,229,255,0.3)'  },
  mtkLanjut:  { label: 'MTK LANJUT',  color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)'},
  mtkWajib:   { label: 'MTK WAJIB',   color: '#10B981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)' },
  default:    { label: 'UMUM',         color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)'},
};

function getMapelConfig(soal) {
  if (!soal?.mapel) return MAPEL_CONFIG.default;
  return MAPEL_CONFIG[soal.mapel] || MAPEL_CONFIG.default;
}

const LABEL_OPTS = ['A', 'B', 'C', 'D'];

export default function DashboardTryout({ onGoRiwayat, userName, filterMapel, filterBab, onBack }) {
  const [soalList, setSoalList]       = useState([]);
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [jawabanUser, setJawabanUser] = useState({});
  const [showHasil, setShowHasil]     = useState(false);
  const [hasilData, setHasilData]     = useState(null);
  const [tryoutCount, setTryoutCount] = useState(getTryoutCount);
  const [rataRata, setRataRata]       = useState(getRataRata);
  const [streakDay, setStreakDay]     = useState(getStreakDay);
  const [alertSelesai, setAlertSelesai] = useState(false);
  const [animKey, setAnimKey]         = useState(0);

  useEffect(() => {
    let list = getSoal();
    if (filterMapel) {
      list = list.filter(s => s.mapel === filterMapel);
    }
    if (filterBab && filterBab !== '__all__') {
      list = list.filter(s => s.bab === filterBab);
    }
    setSoalList(list);
  }, [filterMapel, filterBab]);

  const total         = soalList.length;
  const terjawab      = Object.keys(jawabanUser).length;
  const progress      = total > 0 ? (terjawab / total) * 100 : 0;
  const soal          = soalList[currentIdx];
  const semuaTerjawab = terjawab === total && total > 0;

  // Setelah dijawab: tampilkan status langsung (seperti referensi pelajarin.ai)
  const sudahDijawab   = jawabanUser[currentIdx] !== undefined;
  const pilihanUser    = jawabanUser[currentIdx];
  const jawabBenar     = soal?.jawabanBenar;
  const isBenarSekarang = sudahDijawab && pilihanUser === jawabBenar;

  const handlePilih = (idx) => {
    if (sudahDijawab) return; // tidak bisa ubah jawaban
    setJawabanUser(prev => ({ ...prev, [currentIdx]: idx }));
  };

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
    localStorage.setItem('arlearn_streak_' + new Date().toDateString(), streakDay);
    setHasilData({ soal: soalList, jawabanUser });
    setShowHasil(true);
    setRataRata(getRataRata());
  };

  const handleTryoutLagi = () => {
    if (onBack) {
      onBack();
    } else {
      setShowHasil(false);
      setJawabanUser({});
      goTo(0);
      let list = getSoal();
      if (filterMapel) list = list.filter(s => s.mapel === filterMapel);
      if (filterBab && filterBab !== '__all__') list = list.filter(s => s.bab === filterBab);
      setSoalList(list);
    }
  };

  const mapelCfg = getMapelConfig(soal || soalList[0]);

  if (!soal) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4" style={{ color: '#64748B' }}>
      <i className="fa-solid fa-box-open text-3xl" />
      <p className="text-sm">Tidak ada soal untuk bab ini.</p>
      {onBack && (
        <button onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg,#F97316,#FB923C)', color: '#fff' }}>
          <i className="fa-solid fa-arrow-left text-xs" /> Kembali
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fadeIn">

      {/* ── Hero ── */}
      <div className="mb-6">
        {/* Back button + info bab */}
        {onBack && (
          <div className="flex items-center gap-3 mb-4">
            <button onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: '#111827', color: '#94A3B8', border: '1px solid #1E293B' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(249,115,22,0.4)'; e.currentTarget.style.color='#F97316'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#1E293B'; e.currentTarget.style.color='#94A3B8'; }}>
              <i className="fa-solid fa-arrow-left text-xs" /> Ganti Bab
            </button>
            {mapelCfg && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ background: mapelCfg.bg, color: mapelCfg.color, border: `1px solid ${mapelCfg.border}` }}>
                <i className="fa-solid fa-book-open mr-1.5" />
                {soalList[0]?.namaBab || mapelCfg.label}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div>
            <h1 style={{ fontFamily: '"Poppins", serif', fontWeight: 800, fontStyle: 'italic',
              fontSize: 'clamp(1.5rem, 5vw, 2rem)', color: '#F0F6FF', lineHeight: 1.2 }}>
              Halo, {userName}!{' '}
              <i className="fa-solid fa-hand" style={{ color: '#F59E0B', fontStyle: 'normal', display:'inline-block' }} />
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#475569' }}>Siap untuk tryout hari ini?</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <i className="fa-solid fa-fire" style={{ color: '#F59E0B' }} />
            <span className="text-sm font-semibold" style={{ color: '#F59E0B' }}>Hari ke-{streakDay}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { icon: 'fa-solid fa-book-open', label: 'Total Soal', value: total,             color: '#00E5FF' },
            { icon: 'fa-solid fa-star',       label: 'Rata-rata',  value: rataRata + '%',    color: '#F59E0B' },
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
      <div className="mb-4 p-4 rounded-2xl" style={{ background: '#111827', border: '1px solid #1E293B' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: '#94A3B8' }}>Progress</span>
          <span className="text-sm font-bold" style={{ color: '#F97316' }}>{terjawab}/{total}</span>
        </div>
        {/* Progress bar oranye seperti referensi */}
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1E293B' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #F97316, #FB923C)' }} />
        </div>
        {/* Nomor soal */}
        <div className="flex gap-1.5 mt-3 flex-wrap overflow-y-auto" style={{ maxHeight: 120 }}>
          {soalList.map((_, i) => {
            const isDone  = jawabanUser[i] !== undefined;
            const isBenar = isDone && jawabanUser[i] === soalList[i]?.jawabanBenar;
            const isCurrent = i === currentIdx;
            return (
              <button key={i} onClick={() => goTo(i)}
                className="w-7 h-7 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: isCurrent
                    ? 'linear-gradient(135deg, #F97316, #FB923C)'
                    : isDone
                      ? isBenar ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'
                      : '#1E293B',
                  color: isCurrent ? '#050B18'
                    : isDone ? (isBenar ? '#10B981' : '#EF4444') : '#475569',
                  border: isCurrent ? 'none'
                    : isDone ? (isBenar ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)') : '1px solid #2D3748',
                }}>
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Question Card ── */}
      <div key={animKey} className="rounded-2xl mb-4 overflow-hidden animate-fadeSlide"
        style={{ background: '#111827', border: '1px solid #1E293B', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>

        {/* Header soal — nomor + badge mapel (persis referensi) */}
        <div className="flex items-center justify-between px-5 pt-4 pb-0">
          <span className="text-sm font-medium" style={{ color: '#64748B' }}>Soal {currentIdx + 1}/{total}</span>
          <span className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: mapelCfg.bg, color: mapelCfg.color, border: `1px solid ${mapelCfg.border}`, letterSpacing: '0.05em' }}>
            {mapelCfg.label}
          </span>
        </div>

        {/* Progress bar tipis oranye di bawah header (persis referensi) */}
        <div className="mx-5 mt-2 h-[3px] rounded-full overflow-hidden" style={{ background: '#1E293B' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${((currentIdx + 1) / total) * 100}%`, background: '#F97316' }} />
        </div>

        {/* Teks soal */}
        <div className="px-5 pt-5 pb-4">
          <div className="font-semibold text-base sm:text-lg leading-relaxed text-center"
            style={{ color: '#F0F6FF', minHeight: 80 }}>
            <LatexRenderer text={soal.teks} />
          </div>
        </div>

        {/* Pilihan jawaban — style seperti referensi */}
        <div className="px-4 pb-4 space-y-2.5">
          {soal.pilihan.map((opt, j) => {
            const isKunci    = j === jawabBenar;
            const isPilihan  = j === pilihanUser;
            const isWrong    = sudahDijawab && isPilihan && !isKunci;
            const isCorrect  = sudahDijawab && isKunci;

            let bg     = '#0B1121';
            let border = '#1E293B';
            let txtCol = '#94A3B8';
            let labelBg = '#1E293B';
            let labelCol = '#64748B';
            let icon   = null;

            if (sudahDijawab) {
              if (isCorrect) {
                bg = 'rgba(16,185,129,0.08)'; border = '#10B981'; txtCol = '#10B981';
                labelBg = 'rgba(16,185,129,0.2)'; labelCol = '#10B981';
                icon = <i className="fa-solid fa-circle-check" style={{ color: '#10B981' }} />;
              } else if (isWrong) {
                bg = 'rgba(239,68,68,0.08)'; border = '#EF4444'; txtCol = '#EF4444';
                labelBg = 'rgba(239,68,68,0.2)'; labelCol = '#EF4444';
                icon = <i className="fa-solid fa-circle-xmark" style={{ color: '#EF4444' }} />;
              }
            } else if (isPilihan) {
              bg = 'rgba(0,229,255,0.08)'; border = '#00E5FF'; txtCol = '#F0F6FF';
              labelBg = 'rgba(0,229,255,0.2)'; labelCol = '#00E5FF';
            }

            return (
              <div key={j}
                onClick={() => handlePilih(j)}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all"
                style={{
                  background: bg,
                  border: `1.5px solid ${border}`,
                  cursor: sudahDijawab ? 'default' : 'pointer',
                }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm transition-all"
                  style={{ background: labelBg, color: labelCol }}>
                  {LABEL_OPTS[j]}
                </div>
                <span className="flex-1 text-sm leading-relaxed" style={{ color: txtCol }}>
                  <LatexRenderer text={opt} />
                </span>
                {icon && <span className="flex-shrink-0 text-lg">{icon}</span>}
              </div>
            );
          })}
        </div>

        {/* Penjelasan singkat — muncul setelah dijawab (persis referensi) */}
        {sudahDijawab && soal.penjelasan && (
          <div className="mx-4 mb-4 rounded-xl p-3.5 animate-fadeIn"
            style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.15)' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#00E5FF' }}>PENJELASAN</span>
            </div>
            <div className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
              <LatexRenderer text={soal.penjelasan} />
            </div>
          </div>
        )}
      </div>

      {/* ── Navigasi ── */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={handlePrev} disabled={currentIdx === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
          style={{ minWidth: 120, background: '#111827', color: '#94A3B8', border: '1px solid #1E293B' }}
          onMouseEnter={e => { if(currentIdx>0){e.currentTarget.style.borderColor='rgba(249,115,22,0.4)';e.currentTarget.style.color='#F97316';}}}
          onMouseLeave={e => {e.currentTarget.style.borderColor='#1E293B';e.currentTarget.style.color='#94A3B8';}}>
          <i className="fa-solid fa-chevron-left text-xs" /> Sebelumnya
        </button>
        <span className="text-xs" style={{ color: '#334155' }}>{currentIdx + 1} / {total}</span>
        <button onClick={handleNext} disabled={currentIdx === total - 1}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
          style={{ minWidth: 120, background: '#111827', color: '#94A3B8', border: '1px solid #1E293B' }}
          onMouseEnter={e => { if(currentIdx<total-1){e.currentTarget.style.borderColor='rgba(249,115,22,0.4)';e.currentTarget.style.color='#F97316';}}}
          onMouseLeave={e => {e.currentTarget.style.borderColor='#1E293B';e.currentTarget.style.color='#94A3B8';}}>
          Selanjutnya <i className="fa-solid fa-chevron-right text-xs" />
        </button>
      </div>

      {/* ── Selesai ── */}
      <div className="mt-2 mb-8">
        {semuaTerjawab ? (
          <button onClick={handleSelesai}
            className="w-full py-4 rounded-2xl font-display font-bold text-base flex items-center justify-center gap-2 animate-fadeIn"
            style={{ background: 'linear-gradient(135deg,#F97316,#FB923C)', color: '#fff', boxShadow: '0 0 24px rgba(249,115,22,0.4), 0 4px 20px rgba(0,0,0,0.4)' }}>
            <i className="fa-solid fa-circle-check text-lg" /> Selesai Tryout
          </button>
        ) : (
          <p className="text-center text-xs py-2" style={{ color: '#334155' }}>
            Jawab semua soal untuk mengaktifkan tombol selesai &nbsp;·&nbsp;
            <span style={{ color: '#475569' }}>{terjawab}/{total} terjawab</span>
          </p>
        )}
      </div>

      <CustomAlert show={alertSelesai} tipe="confirm"
        judul="Selesaikan Tryout?"
        pesan={`Kamu telah menjawab semua ${total} soal. Yakin ingin menyelesaikan tryout ini?`}
        yesLabel="Ya, Selesaikan" noLabel="Cek Lagi"
        onYes={konfirmasiSelesai} onNo={() => setAlertSelesai(false)} />

      <ModalHasilTryout show={showHasil} soal={hasilData?.soal} jawabanUser={hasilData?.jawabanUser}
        onTryoutLagi={handleTryoutLagi}
        onLihatRiwayat={() => { setShowHasil(false); onGoRiwayat(); }} />
    </div>
  );
}
