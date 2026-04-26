import React, { useState } from 'react';
import { getRiwayat, deleteRiwayat, formatTanggal } from '../utils/riwayatStorage';
import CustomAlert from './CustomAlert';
import LatexRenderer from './LatexRenderer';

function DetailModal({ show, data, onClose }) {
  const [openAcc, setOpenAcc] = useState(null);
  if (!show || !data) return null;
  const labelOpts = ['A', 'B', 'C', 'D'];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,11,24,0.9)', backdropFilter: 'blur(10px)' }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl animate-scaleIn"
        style={{ background: '#111827', border: '1px solid rgba(0,229,255,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>

        <div className="flex items-center justify-between p-5 border-b sticky top-0" style={{ borderColor: '#1E293B', background: '#111827', zIndex: 2 }}>
          <div>
            <h2 className="font-display font-bold text-lg" style={{ color: '#F0F6FF' }}>Detail Riwayat</h2>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{formatTanggal(data.tanggal)}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ color: '#64748B' }}
            onMouseEnter={e => e.currentTarget.style.background = '#1E293B'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 p-5 pb-3">
          {[
            { label: 'Skor', value: data.skor, color: '#00E5FF', icon: 'fa-solid fa-star' },
            { label: 'Benar', value: data.benar, color: '#10B981', icon: 'fa-solid fa-circle-check' },
            { label: 'Salah', value: data.salah, color: '#EF4444', icon: 'fa-solid fa-circle-xmark' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center"
              style={{ background: '#0B1121', border: '1px solid #1E293B' }}>
              <i className={`${s.icon} text-lg mb-1 block`} style={{ color: s.color }} />
              <div className="font-display font-black text-xl" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs" style={{ color: '#64748B' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Questions */}
        {data.soal && (
          <div className="px-5 pb-5 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#475569' }}>Rincian Soal</h3>
            {data.soal.map((s, i) => {
              const isBenar = data.jawabanUser?.[i] === s.jawabanBenar;
              const isOpen = openAcc === i;
              return (
                <div key={i} className="rounded-xl overflow-hidden"
                  style={{ border: `1px solid ${isBenar ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                  <button className="w-full flex items-center gap-3 p-3 text-left"
                    onClick={() => setOpenAcc(isOpen ? null : i)}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: isBenar ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: isBenar ? '#10B981' : '#EF4444' }}>{i + 1}</div>
                    <span className="flex-1 text-sm line-clamp-1" style={{ color: '#94A3B8' }}>
                        {s.teks.replace(/\$[\s\S]*?\$/g,'[LaTeX]').slice(0,70)}
                      </span>
                    <i className={`fa-solid ${isBenar ? 'fa-circle-check' : 'fa-circle-xmark'} text-sm`}
                          style={{ color: isBenar ? '#10B981' : '#EF4444' }} />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ color: '#475569', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                      <polyline points="6,9 12,15 18,9"/>
                    </svg>
                  </button>
                  <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
                    <div className="px-3 pb-3 space-y-1.5">
                      {s.pilihan.map((opt, j) => (
                        <div key={j} className="flex items-center gap-2 p-2 rounded-lg text-xs"
                          style={{
                            background: j === s.jawabanBenar ? 'rgba(16,185,129,0.1)' : (j === data.jawabanUser?.[i] && !isBenar) ? 'rgba(239,68,68,0.08)' : 'transparent',
                            color: j === s.jawabanBenar ? '#10B981' : (j === data.jawabanUser?.[i] && !isBenar) ? '#EF4444' : '#64748B',
                          }}>
                          <span className="font-bold">{labelOpts[j]}.</span> <LatexRenderer text={opt} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RiwayatPage() {
  const [riwayat, setRiwayat] = useState(getRiwayat);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleDelete = (id) => setDeleteTarget(id);
  const konfirmasiDelete = () => {
    const updated = deleteRiwayat(deleteTarget);
    setRiwayat(updated);
    setDeleteTarget(null);
  };

  const handleDetail = (item) => {
    setDetailData(item);
    setShowDetail(true);
  };

  const scoreColor = (skor) => skor >= 80 ? '#10B981' : skor >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-black text-2xl" style={{ color: '#F0F6FF' }}>Riwayat Tryout</h1>
          <p className="text-sm mt-0.5" style={{ color: '#475569' }}>{riwayat.length} percobaan tersimpan</p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
        </div>
      </div>

      {riwayat.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: '#111827', border: '1px solid #1E293B' }}>
            <i className="fa-solid fa-inbox text-3xl" style={{ color: '#334155' }} />
          </div>
          <p className="font-display font-semibold text-lg mb-1" style={{ color: '#64748B' }}>Belum Ada Riwayat</p>
          <p className="text-sm" style={{ color: '#334155' }}>Selesaikan tryout pertamamu untuk melihat riwayat di sini</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-6 bottom-6 w-px hidden sm:block" style={{ background: 'linear-gradient(to bottom, rgba(0,229,255,0.3), transparent)' }} />

          <div className="space-y-3">
            {riwayat.map((item, idx) => (
              <div key={item.id} className="relative pl-0 sm:pl-16">
                {/* Timeline dot */}
                <div className="absolute left-3.5 top-6 w-4 h-4 rounded-full hidden sm:flex items-center justify-center"
                  style={{ background: '#050B18', border: `2px solid ${scoreColor(item.skor)}`, boxShadow: `0 0 8px ${scoreColor(item.skor)}40` }} />

                <div className="rounded-2xl p-4 card-hover" style={{ background: '#111827' }}>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: '#64748B' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {formatTanggal(item.tanggal)}
                    </div>
                    {/* Score big */}
                    <div className="ml-auto flex items-center gap-1">
                      <span className="font-display font-black text-2xl" style={{ color: scoreColor(item.skor) }}>{item.skor}</span>
                      <span className="text-xs" style={{ color: '#475569' }}>/100</span>
                    </div>
                  </div>

                  {/* Mini progress bars */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-14 text-right flex items-center justify-end gap-1" style={{ color: '#10B981' }}>
                        <i className="fa-solid fa-circle-check text-xs" /> {item.benar}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#1E293B' }}>
                        <div className="h-full rounded-full" style={{ width: `${(item.benar / item.totalSoal) * 100}%`, background: '#10B981' }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-14 text-right flex items-center justify-end gap-1" style={{ color: '#EF4444' }}>
                        <i className="fa-solid fa-circle-xmark text-xs" /> {item.salah}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#1E293B' }}>
                        <div className="h-full rounded-full" style={{ width: `${(item.salah / item.totalSoal) * 100}%`, background: '#EF4444' }} />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2" style={{ borderTop: '1px solid #1E293B' }}>
                    <button onClick={() => handleDetail(item)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                      style={{ background: 'rgba(0,229,255,0.08)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.15)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,229,255,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,229,255,0.08)'}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      Lihat Detail
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      className="py-2 px-3 rounded-xl text-xs font-semibold transition-all"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2,0,01-2,2H8a2,2,0,01-2-2L5,6m3,0V4a1,1,0,011-1h4a1,1,0,011,1v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CustomAlert
        show={!!deleteTarget}
        tipe="confirm"
        judul="Hapus Riwayat?"
        pesan="Riwayat ini akan dihapus permanen dan tidak bisa dikembalikan."
        yesLabel="Hapus"
        noLabel="Batal"
        onYes={konfirmasiDelete}
        onNo={() => setDeleteTarget(null)}
      />

      <DetailModal show={showDetail} data={detailData} onClose={() => setShowDetail(false)} />
    </div>
  );
}
