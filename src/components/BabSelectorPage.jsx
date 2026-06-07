import React, { useState, useMemo } from 'react';
import { getSoal } from '../utils/soalStorage';

const MAPEL_CONFIG = {
  kimia:     { label: 'Kimia',       icon: 'fa-flask',         color: '#F59E0B', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.25)',  glow: 'rgba(245,158,11,0.15)' },
  fisika:    { label: 'Fisika',      icon: 'fa-atom',          color: '#00E5FF', bg: 'rgba(0,229,255,0.10)',   border: 'rgba(0,229,255,0.25)',   glow: 'rgba(0,229,255,0.15)'  },
  mtkLanjut: { label: 'MTK Lanjut', icon: 'fa-infinity',      color: '#A78BFA', bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.25)', glow: 'rgba(167,139,250,0.15)'},
  mtkWajib:  { label: 'MTK Wajib',  icon: 'fa-calculator',    color: '#10B981', bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.25)',  glow: 'rgba(16,185,129,0.15)' },
  default:   { label: 'Lainnya',    icon: 'fa-book',           color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)', glow: 'rgba(148,163,184,0.1)' },
};

function getMapelCfg(mapel) {
  return MAPEL_CONFIG[mapel] || MAPEL_CONFIG.default;
}

export default function BabSelectorPage({ onMulaiTryout, userName }) {
  const soalAll = useMemo(() => getSoal(), []);

  // { kimia: { bab1: { namaBab, count }, ... }, fisika: {...}, ... }
  const bankData = useMemo(() => {
    const data = {};
    soalAll.forEach(s => {
      const mapel = s.mapel || 'default';
      const bab   = s.bab   || 'bab1';
      const nama  = s.namaBab || 'Bab 1';
      if (!data[mapel]) data[mapel] = {};
      if (!data[mapel][bab]) data[mapel][bab] = { namaBab: nama, count: 0 };
      data[mapel][bab].count++;
    });
    return data;
  }, [soalAll]);

  const mapelList = Object.keys(bankData);

  const [selectedMapel, setSelectedMapel] = useState(null);
  const [selectedBab,   setSelectedBab]   = useState(null);
  const [hoveredMapel,  setHoveredMapel]  = useState(null);
  const [hoveredBab,    setHoveredBab]    = useState(null);

  const babList = selectedMapel ? Object.entries(bankData[selectedMapel] || {}) : [];
  const totalSoalMapel = selectedMapel
    ? Object.values(bankData[selectedMapel]).reduce((s, b) => s + b.count, 0)
    : 0;
  const soalDipilih = selectedMapel && selectedBab
    ? (bankData[selectedMapel]?.[selectedBab]?.count || 0)
    : 0;

  const handleMulai = () => {
    if (!selectedMapel || !selectedBab) return;
    onMulaiTryout({ mapel: selectedMapel, bab: selectedBab });
  };

  const handleSelectMapel = (mapel) => {
    setSelectedMapel(mapel);
    setSelectedBab(null);
  };

  const cfg = selectedMapel ? getMapelCfg(selectedMapel) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fadeIn">

      {/* ── Header ── */}
      <div className="mb-7">
        <h1 style={{
          fontFamily: '"Poppins", serif', fontWeight: 800, fontStyle: 'italic',
          fontSize: 'clamp(1.4rem, 5vw, 1.9rem)', color: '#F0F6FF', lineHeight: 1.2
        }}>
          Halo, {userName}!{' '}
          <i className="fa-solid fa-hand" style={{ color: '#F59E0B', fontStyle: 'normal' }} />
        </h1>
        <p className="text-sm mt-1" style={{ color: '#475569' }}>
          Pilih mata pelajaran dan bab yang ingin kamu pelajari
        </p>
      </div>

      {/* ── Step 1: Pilih Mapel ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'linear-gradient(135deg,#F97316,#FB923C)', color: '#fff' }}>1</span>
          <span className="text-sm font-semibold" style={{ color: '#94A3B8' }}>Pilih Mata Pelajaran</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {mapelList.map(mapel => {
            const mc      = getMapelCfg(mapel);
            const isActive = selectedMapel === mapel;
            const isHover  = hoveredMapel === mapel;
            const totalSoal = Object.values(bankData[mapel]).reduce((s, b) => s + b.count, 0);
            const jumlahBab  = Object.keys(bankData[mapel]).length;

            return (
              <button key={mapel}
                onClick={() => handleSelectMapel(mapel)}
                onMouseEnter={() => setHoveredMapel(mapel)}
                onMouseLeave={() => setHoveredMapel(null)}
                className="text-left rounded-2xl p-4 transition-all duration-200"
                style={{
                  background: isActive ? mc.bg : (isHover ? mc.bg : '#111827'),
                  border: `1.5px solid ${isActive ? mc.color : (isHover ? mc.border : '#1E293B')}`,
                  boxShadow: isActive ? `0 0 20px ${mc.glow}` : 'none',
                  transform: isActive || isHover ? 'translateY(-1px)' : 'none',
                }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: isActive ? mc.bg : 'rgba(255,255,255,0.04)', border: `1px solid ${isActive ? mc.border : '#1E293B'}` }}>
                    <i className={`fa-solid ${mc.icon} text-lg`} style={{ color: mc.color }} />
                  </div>
                  {isActive && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: mc.color }}>
                      <i className="fa-solid fa-check text-xs" style={{ color: '#050B18' }} />
                    </div>
                  )}
                </div>
                <div className="font-bold text-sm mb-1" style={{ color: isActive ? mc.color : '#E2E8F0' }}>
                  {mc.label}
                </div>
                <div className="text-xs" style={{ color: '#475569' }}>
                  {jumlahBab} bab · {totalSoal} soal
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Step 2: Pilih Bab ── */}
      <div className={`mb-6 transition-all duration-300 ${selectedMapel ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: selectedMapel ? 'linear-gradient(135deg,#F97316,#FB923C)' : '#1E293B',
              color: selectedMapel ? '#fff' : '#475569'
            }}>2</span>
          <span className="text-sm font-semibold" style={{ color: selectedMapel ? '#94A3B8' : '#334155' }}>
            {selectedMapel ? `Pilih Bab — ${cfg?.label} (${totalSoalMapel} soal)` : 'Pilih Bab'}
          </span>
        </div>

        {selectedMapel && (
          <div className="space-y-2">
            {/* Opsi: Semua Bab */}
            <button
              onClick={() => setSelectedBab('__all__')}
              onMouseEnter={() => setHoveredBab('__all__')}
              onMouseLeave={() => setHoveredBab(null)}
              className="w-full flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-200"
              style={{
                background: selectedBab === '__all__' ? cfg.bg : (hoveredBab === '__all__' ? cfg.bg : '#111827'),
                border: `1.5px solid ${selectedBab === '__all__' ? cfg.color : (hoveredBab === '__all__' ? cfg.border : '#1E293B')}`,
                boxShadow: selectedBab === '__all__' ? `0 0 16px ${cfg.glow}` : 'none',
              }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: selectedBab === '__all__' ? cfg.bg : '#1E293B', border: `1px solid ${selectedBab === '__all__' ? cfg.border : '#2D3748'}` }}>
                <i className="fa-solid fa-layer-group text-sm" style={{ color: selectedBab === '__all__' ? cfg.color : '#64748B' }} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-semibold" style={{ color: selectedBab === '__all__' ? cfg.color : '#E2E8F0' }}>
                  Semua Bab
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#475569' }}>{totalSoalMapel} soal</div>
              </div>
              {selectedBab === '__all__' && (
                <i className="fa-solid fa-circle-check text-lg flex-shrink-0" style={{ color: cfg.color }} />
              )}
            </button>

            {/* Per Bab */}
            {babList.map(([babKey, { namaBab, count }], idx) => {
              const isActive = selectedBab === babKey;
              const isHover  = hoveredBab === babKey;
              return (
                <button key={babKey}
                  onClick={() => setSelectedBab(babKey)}
                  onMouseEnter={() => setHoveredBab(babKey)}
                  onMouseLeave={() => setHoveredBab(null)}
                  className="w-full flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-200"
                  style={{
                    background: isActive ? cfg.bg : (isHover ? cfg.bg : '#111827'),
                    border: `1.5px solid ${isActive ? cfg.color : (isHover ? cfg.border : '#1E293B')}`,
                    boxShadow: isActive ? `0 0 16px ${cfg.glow}` : 'none',
                  }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{
                      background: isActive ? cfg.bg : '#1E293B',
                      border: `1px solid ${isActive ? cfg.border : '#2D3748'}`,
                      color: isActive ? cfg.color : '#64748B'
                    }}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold" style={{ color: isActive ? cfg.color : '#E2E8F0' }}>
                      {namaBab}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#475569' }}>{count} soal</div>
                  </div>
                  {isActive && (
                    <i className="fa-solid fa-circle-check text-lg flex-shrink-0" style={{ color: cfg.color }} />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {!selectedMapel && (
          <div className="rounded-xl p-6 text-center" style={{ background: '#0D1526', border: '1px dashed #1E293B' }}>
            <i className="fa-solid fa-arrow-up text-2xl mb-2 block" style={{ color: '#334155' }} />
            <span className="text-sm" style={{ color: '#334155' }}>Pilih mata pelajaran terlebih dahulu</span>
          </div>
        )}
      </div>

      {/* ── Ringkasan + Tombol Mulai ── */}
      {selectedMapel && selectedBab && (
        <div className="animate-fadeIn">
          {/* Ringkasan */}
          <div className="rounded-2xl p-4 mb-4 flex items-center gap-4"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
            <i className={`fa-solid ${cfg.icon} text-2xl`} style={{ color: cfg.color }} />
            <div className="flex-1">
              <div className="text-sm font-bold" style={{ color: cfg.color }}>{cfg.label}</div>
              <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                {selectedBab === '__all__'
                  ? `Semua Bab · ${totalSoalMapel} soal`
                  : `${bankData[selectedMapel][selectedBab]?.namaBab} · ${soalDipilih} soal`}
              </div>
            </div>
            <i className="fa-solid fa-circle-check text-xl" style={{ color: cfg.color }} />
          </div>

          {/* CTA Mulai */}
          <button onClick={handleMulai}
            className="w-full py-4 rounded-2xl font-display font-bold text-base flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg,#F97316,#FB923C)',
              color: '#fff',
              boxShadow: '0 0 24px rgba(249,115,22,0.4), 0 4px 20px rgba(0,0,0,0.4)'
            }}>
            <i className="fa-solid fa-play text-sm" />
            Mulai Tryout
          </button>
        </div>
      )}

      {/* Placeholder saat belum lengkap pilihan */}
      {(!selectedMapel || !selectedBab) && (
        <div className="rounded-2xl py-4 text-center"
          style={{ background: '#0D1526', border: '1px dashed #1E293B' }}>
          <span className="text-sm" style={{ color: '#334155' }}>
            Selesaikan pilihan di atas untuk mulai tryout
          </span>
        </div>
      )}
    </div>
  );
}
