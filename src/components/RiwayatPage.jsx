import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { getRiwayat, deleteRiwayat, formatTanggal } from '../utils/riwayatStorage';
import CustomAlert from './CustomAlert';
import LatexRenderer from './LatexRenderer';

const LABEL_OPTS = ['A', 'B', 'C', 'D'];

function DetailModal({ show, data, onClose }) {
  const [openAcc, setOpenAcc] = useState(null);

  if (!show || !data) return null;

  return createPortal(
    <div
      style={{
        position:'fixed', inset:0, zIndex:9999,
        display:'flex', alignItems:'flex-start', justifyContent:'center',
        padding:'1rem', overflowY:'auto',
        background:'rgba(5,11,24,0.92)', backdropFilter:'blur(12px)',
        WebkitBackdropFilter:'blur(12px)',
        animation:'alertFadeIn 0.18s ease both',
      }}
      onClick={onClose}>
      <div
        style={{
          width:'100%', maxWidth:640, borderRadius:20, overflow:'hidden',
          background:'#111827', border:'1px solid rgba(0,229,255,0.18)',
          boxShadow:'0 24px 80px rgba(0,0,0,0.75)',
          animation:'alertSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
          marginTop: 8,
        }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 sticky top-0"
          style={{ background:'#111827', borderBottom:'1px solid #1E293B', zIndex:2 }}>
          <div>
            <h2 className="font-bold text-base" style={{ color:'#F0F6FF' }}>
              <i className="fa-solid fa-chart-bar mr-2" style={{ color:'#00E5FF' }} />
              Detail Riwayat
            </h2>
            <p className="text-xs mt-0.5" style={{ color:'#64748B' }}>
              <i className="fa-solid fa-calendar-days mr-1" />{formatTanggal(data.tanggal)}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ color:'#64748B', background:'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background='#1E293B'; e.currentTarget.style.color='#F0F6FF'; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#64748B'; }}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 p-4 pb-3">
          {[
            { label:'Skor',  value:data.skor,  color:'#00E5FF', icon:'fa-solid fa-star'         },
            { label:'Benar', value:data.benar, color:'#10B981', icon:'fa-solid fa-circle-check' },
            { label:'Salah', value:data.salah, color:'#EF4444', icon:'fa-solid fa-circle-xmark' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center"
              style={{ background:'#0B1121', border:'1px solid #1E293B' }}>
              <i className={`${s.icon} text-lg mb-1 block`} style={{ color:s.color }} />
              <div className="font-black text-xl" style={{ color:s.color }}>{s.value}</div>
              <div className="text-xs" style={{ color:'#64748B' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Questions */}
        {data.soal && (
          <div className="px-4 pb-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color:'#475569' }}>
              <i className="fa-solid fa-list-check" />Rincian Soal
            </p>
            {data.soal.map((s, i) => {
              const isBenar = data.jawabanUser?.[i] === s.jawabanBenar;
              const isOpen  = openAcc === i;
              return (
                <div key={i} className="rounded-xl overflow-hidden"
                  style={{ border:`1px solid ${isBenar ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                  <button className="w-full flex items-center gap-3 p-3 text-left"
                    onClick={() => setOpenAcc(isOpen ? null : i)}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: isBenar ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: isBenar ? '#10B981' : '#EF4444' }}>
                      {i + 1}
                    </div>
                    <span className="flex-1 text-sm line-clamp-1" style={{ color:'#94A3B8' }}>
                      {s.teks.replace(/\$[\s\S]*?\$/g,'[LaTeX]').slice(0,70)}
                    </span>
                    <i className={`fa-solid ${isBenar ? 'fa-circle-check' : 'fa-circle-xmark'} text-sm`}
                      style={{ color: isBenar ? '#10B981' : '#EF4444' }} />
                    <i className={`fa-solid fa-chevron-down text-xs transition-transform`}
                      style={{ color:'#475569', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition:'transform 0.2s' }} />
                  </button>
                  <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
                    <div className="px-3 pb-3 space-y-1.5">
                      {s.pilihan.map((opt, j) => (
                        <div key={j} className="flex items-center gap-2 p-2 rounded-lg text-xs"
                          style={{
                            background: j === s.jawabanBenar ? 'rgba(16,185,129,0.1)' : (j === data.jawabanUser?.[i] && !isBenar) ? 'rgba(239,68,68,0.08)' : 'transparent',
                            color:      j === s.jawabanBenar ? '#10B981' : (j === data.jawabanUser?.[i] && !isBenar) ? '#EF4444' : '#64748B',
                          }}>
                          <span className="font-bold">{LABEL_OPTS[j]}.</span>
                          <LatexRenderer text={opt} />
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
    </div>,
    document.body
  );
}

export default function RiwayatPage() {
  const [riwayat, setRiwayat]       = useState(getRiwayat);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const konfirmasiDelete = () => {
    setRiwayat(deleteRiwayat(deleteTarget));
    setDeleteTarget(null);
  };

  const scoreColor = (s) => s >= 80 ? '#10B981' : s >= 60 ? '#F59E0B' : '#EF4444';
  const scoreIcon  = (s) => s >= 80 ? 'fa-solid fa-trophy' : s >= 60 ? 'fa-solid fa-thumbs-up' : 'fa-solid fa-dumbbell';

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 animate-fadeIn">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-black text-xl flex items-center gap-2" style={{ color:'#F0F6FF' }}>
            <i className="fa-solid fa-clock-rotate-left" style={{ color:'#00E5FF' }} />
            Riwayat Tryout
          </h1>
          <p className="text-xs mt-0.5 pl-7" style={{ color:'#475569' }}>
            <i className="fa-solid fa-database mr-1" style={{ color:'#334155' }} />
            {riwayat.length} percobaan tersimpan
          </p>
        </div>
      </div>

      {/* Empty state */}
      {riwayat.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ background:'#111827', border:'1px solid #1E293B' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background:'#1E293B' }}>
            <i className="fa-solid fa-inbox text-3xl" style={{ color:'#334155' }} />
          </div>
          <p className="font-bold text-base mb-1" style={{ color:'#475569' }}>Belum Ada Riwayat</p>
          <p className="text-sm" style={{ color:'#334155' }}>Selesaikan tryout pertamamu untuk melihat riwayat di sini</p>
        </div>
      ) : (
        <div className="space-y-3 pb-4">
          {riwayat.map((item) => (
            <div key={item.id} className="rounded-2xl overflow-hidden"
              style={{ background:'#111827', border:'1px solid #1A2235' }}>

              {/* Top strip warna skor */}
              <div className="h-1" style={{ background: scoreColor(item.skor) }} />

              <div className="p-4">
                {/* Row 1: tanggal + skor */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs" style={{ color:'#64748B' }}>
                    <i className="fa-solid fa-calendar-days" />
                    <span>{formatTanggal(item.tanggal)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <i className={`${scoreIcon(item.skor)} text-xs`} style={{ color: scoreColor(item.skor) }} />
                    <span className="font-black text-2xl" style={{ color: scoreColor(item.skor) }}>{item.skor}</span>
                    <span className="text-xs" style={{ color:'#334155' }}>/100</span>
                  </div>
                </div>

                {/* Row 2: stat chips */}
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl"
                    style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.15)' }}>
                    <i className="fa-solid fa-circle-check text-xs" style={{ color:'#10B981' }} />
                    <span className="font-bold text-sm" style={{ color:'#10B981' }}>{item.benar}</span>
                    <span className="text-xs" style={{ color:'#475569' }}>Benar</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl"
                    style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)' }}>
                    <i className="fa-solid fa-circle-xmark text-xs" style={{ color:'#EF4444' }} />
                    <span className="font-bold text-sm" style={{ color:'#EF4444' }}>{item.salah}</span>
                    <span className="text-xs" style={{ color:'#475569' }}>Salah</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl"
                    style={{ background:'rgba(100,116,139,0.08)', border:'1px solid rgba(100,116,139,0.15)' }}>
                    <i className="fa-solid fa-layer-group text-xs" style={{ color:'#64748B' }} />
                    <span className="font-bold text-sm" style={{ color:'#94A3B8' }}>{item.totalSoal}</span>
                    <span className="text-xs" style={{ color:'#475569' }}>Soal</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background:'#1E293B' }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width:`${item.skor}%`, background: scoreColor(item.skor) }} />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={() => { setDetailData(item); setShowDetail(true); }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    style={{ background:'rgba(0,229,255,0.08)', color:'#00E5FF', border:'1px solid rgba(0,229,255,0.15)' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(0,229,255,0.14)'}
                    onMouseLeave={e => e.currentTarget.style.background='rgba(0,229,255,0.08)'}>
                    <i className="fa-solid fa-magnifying-glass" />Lihat Detail
                  </button>
                  <button onClick={() => setDeleteTarget(item.id)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                    style={{ background:'rgba(239,68,68,0.08)', color:'#EF4444', border:'1px solid rgba(239,68,68,0.15)' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,0.08)'}>
                    <i className="fa-solid fa-trash text-xs" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CustomAlert
        show={!!deleteTarget} tipe="confirm"
        judul="Hapus Riwayat?"
        pesan="Riwayat ini akan dihapus permanen dan tidak bisa dikembalikan."
        yesLabel="Hapus" noLabel="Batal"
        onYes={konfirmasiDelete}
        onNo={() => setDeleteTarget(null)}
      />

      <DetailModal show={showDetail} data={detailData} onClose={() => setShowDetail(false)} />
    </div>
  );
}
