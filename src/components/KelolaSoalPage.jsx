import React, { useState } from 'react';
import { getSoal, deleteSoal, resetToDefault, isDefaultSoal } from '../utils/soalStorage';
import { saveAs } from 'file-saver';
import CustomAlert from './CustomAlert';
import UploadSoalModal from './UploadSoalModal';
import FormatUploadModal from './FormatUploadModal';

const CONTOH_JS = `export const tambahanSoal = [
  {
    id: 11,
    teks: "Apa kepanjangan dari ARLearn?",
    pilihan: [
      "Augmented Reality Learn",
      "Advanced Remote Learn",
      "Active Reading Learn",
      "Auto Response Learn"
    ],
    jawabanBenar: 0,
    penjelasan: "ARLearn singkatan dari Augmented Reality Learning"
  },
  {
    id: 12,
    teks: "Framework mana yang digunakan ARLearn?",
    pilihan: ["Vue.js", "Angular", "React", "Svelte"],
    jawabanBenar: 2,
    penjelasan: "ARLearn dibangun dengan React + Vite untuk performa optimal."
  }
];`;

export default function KelolaSoalPage() {
  const [soalList, setSoalList] = useState(getSoal);
  const [showUpload, setShowUpload] = useState(false);
  const [showFormat, setShowFormat] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [alert, setAlert] = useState({ show: false });
  const [search, setSearch] = useState('');

  const filtered = soalList.filter(s => s.teks.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id) => {
    if (isDefaultSoal(id)) {
      setAlert({ show: true, tipe: 'error', judul: 'Tidak Dapat Dihapus', pesan: 'Soal default (ID 1-10) tidak bisa dihapus. Hanya soal custom yang bisa dihapus.' });
      return;
    }
    setDeleteTarget(id);
  };

  const konfirmasiDelete = () => {
    const updated = deleteSoal(deleteTarget);
    setSoalList(updated);
    setDeleteTarget(null);
    setAlert({ show: true, tipe: 'success', judul: 'Soal Dihapus', pesan: 'Soal berhasil dihapus dari bank soal.' });
  };

  const handleReset = () => setShowResetConfirm(true);
  const konfirmasiReset = () => {
    const updated = resetToDefault();
    setSoalList(updated);
    setShowResetConfirm(false);
    setAlert({ show: true, tipe: 'success', judul: 'Reset Berhasil', pesan: 'Bank soal telah dikembalikan ke 10 soal default.' });
  };

  const handleDownloadJs = () => {
    const blob = new Blob([CONTOH_JS], { type: 'application/javascript' });
    saveAs(blob, 'contoh-soal-arlearn.js');
  };

  const handleDownloadDocx = () => {
    // Create a simple text file as DOCX placeholder
    const content = `No\tSoal\tPilihan A\tPilihan B\tPilihan C\tPilihan D\tJawaban\tPenjelasan
1\tApa kepanjangan dari HTML?\tHyperText Markup Language\tHighText Machine Language\tHyperText Machine Learning\tHyperlink Text Markup\tA\tHTML adalah HyperText Markup Language
2\tSiapa penemu WWW?\tBill Gates\tTim Berners-Lee\tLinus Torvalds\tSteve Jobs\tB\tTim Berners-Lee menciptakan WWW pada 1989`;
    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    saveAs(blob, 'contoh-soal-arlearn.docx');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-black text-2xl" style={{ color: '#F0F6FF' }}>Kelola Soal</h1>
          <p className="text-sm mt-0.5" style={{ color: '#475569' }}>{soalList.length} soal tersedia · {soalList.filter(s => !isDefaultSoal(s.id)).length} soal custom</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowFormat(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Format Upload
          </button>
          <button onClick={handleDownloadJs}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: 'rgba(245,158,11,0.08)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.15)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.13)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.08)'}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Contoh .js
          </button>
          <button onClick={handleDownloadDocx}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: 'rgba(59,130,246,0.08)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.15)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.13)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.08)'}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Contoh .docx
          </button>
          <button onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.13)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
            Reset Default
          </button>
          <button onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold btn-gradient">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload Soal
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#475569' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <input
          type="text"
          placeholder="Cari soal..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm input-neon"
          style={{ background: '#111827', border: '1px solid #1E293B', color: '#F0F6FF', outline: 'none' }}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1E293B' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#0B1121' }}>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569', width: '50px' }}>#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>Soal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: '#475569', width: '100px' }}>Pilihan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: '#475569', width: '90px' }}>Tipe</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569', width: '80px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className="table-row transition-colors" style={{ borderTop: '1px solid #111827' }}>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold" style={{ color: '#475569' }}>{i + 1}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium line-clamp-2" style={{ color: '#94A3B8' }}>{s.teks}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs" style={{ color: '#475569' }}>{s.pilihan?.length || 0} opsi</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {isDefaultSoal(s.id) ? (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: 'rgba(0,229,255,0.1)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.2)' }}>Default</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: 'rgba(168,85,247,0.1)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.2)' }}>Custom</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={isDefaultSoal(s.id)}
                      className="p-1.5 rounded-lg transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                      style={{ color: '#EF4444' }}
                      onMouseEnter={e => { if (!isDefaultSoal(s.id)) e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2,0,01-2,2H8a2,2,0,01-2-2L5,6m3,0V4a1,1,0,011-1h4a1,1,0,011,1v2"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-sm" style={{ color: '#334155' }}>
                    {search ? 'Tidak ada soal yang cocok dengan pencarian.' : 'Belum ada soal.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals & Alerts */}
      <UploadSoalModal
        show={showUpload}
        onClose={() => setShowUpload(false)}
        onSuccess={() => setSoalList(getSoal())}
      />
      <FormatUploadModal show={showFormat} onClose={() => setShowFormat(false)} />

      <CustomAlert
        show={!!deleteTarget}
        tipe="confirm"
        judul="Hapus Soal?"
        pesan="Soal ini akan dihapus permanen dari bank soal ARLearn."
        yesLabel="Hapus"
        noLabel="Batal"
        onYes={konfirmasiDelete}
        onNo={() => setDeleteTarget(null)}
      />
      <CustomAlert
        show={showResetConfirm}
        tipe="confirm"
        judul="Reset ke Default?"
        pesan="Semua soal custom akan dihapus dan bank soal dikembalikan ke 10 soal bawaan. Aksi ini tidak bisa dibatalkan."
        yesLabel="Ya, Reset"
        noLabel="Batal"
        onYes={konfirmasiReset}
        onNo={() => setShowResetConfirm(false)}
      />
      <CustomAlert
        show={alert.show}
        tipe={alert.tipe}
        judul={alert.judul}
        pesan={alert.pesan}
        onOk={() => setAlert({ show: false })}
      />
    </div>
  );
}
