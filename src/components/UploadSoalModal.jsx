import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { parseDocxFile, parseJsFile } from '../utils/parseDocx';
import { addSoal } from '../utils/soalStorage';
import CustomAlert from './CustomAlert';

export default function UploadSoalModal({ show, onClose, onSuccess }) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false });
  const fileRef = useRef();

  useEffect(() => {
    if (show) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [show]);

  if (!show) return null;

  const handleFile = async (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['js', 'docx'].includes(ext)) {
      setAlert({ show: true, tipe: 'error', judul: 'Format Tidak Didukung', pesan: 'Hanya file .js dan .docx yang didukung.' });
      return;
    }
    setFile(f);
    setPreview({ name: f.name, size: (f.size / 1024).toFixed(1) + ' KB', type: ext.toUpperCase() });
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      let soalBaru;
      if (ext === 'docx') {
        soalBaru = await parseDocxFile(file);
      } else {
        soalBaru = await parseJsFile(file);
      }
      addSoal(soalBaru);
      setLoading(false);
      setAlert({
        show: true, tipe: 'success', judul: 'Upload Berhasil! 🎉',
        pesan: `${soalBaru.length} soal berhasil ditambahkan ke bank soal ARLearn.`
      });
    } catch (err) {
      setLoading(false);
      setAlert({ show: true, tipe: 'error', judul: 'Upload Gagal', pesan: err.message });
    }
  };

  const handleAlertOk = () => {
    setAlert({ show: false });
    if (alert.tipe === 'success') {
      setFile(null);
      setPreview(null);
      onSuccess?.();
      onClose();
    }
  };

  const resetFile = () => { setFile(null); setPreview(null); };

  return createPortal(
    <>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4"
        style={{ background: 'rgba(5,11,24,0.92)', backdropFilter: 'blur(12px)', touchAction: 'none', overscrollBehavior: 'none' }}
        onClick={onClose}>
        <div className="w-full max-w-md rounded-2xl animate-scaleIn"
          style={{ background: '#111827', border: '1px solid rgba(0,229,255,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}
          onClick={e => e.stopPropagation()}>

          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#1E293B' }}>
            <h2 className="font-display font-bold text-lg" style={{ color: '#F0F6FF' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" className="inline mr-2 -mt-0.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Upload Soal
            </h2>
            <button onClick={onClose} className="p-2 rounded-lg transition-all"
              style={{ color: '#64748B' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1E293B'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="p-5">
            {!preview ? (
              <div
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
                style={{ borderColor: dragOver ? '#00E5FF' : '#1E293B', background: dragOver ? 'rgba(0,229,255,0.04)' : 'transparent' }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current?.click()}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <p className="font-semibold mb-1" style={{ color: '#94A3B8' }}>Drag & drop file di sini</p>
                <p className="text-sm" style={{ color: '#475569' }}>atau klik untuk pilih file</p>
                <div className="flex gap-2 justify-center mt-4">
                  {['.js', '.docx'].map(ext => (
                    <span key={ext} className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: 'rgba(0,229,255,0.08)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.2)' }}>{ext}</span>
                  ))}
                </div>
                <input ref={fileRef} type="file" accept=".js,.docx" className="hidden"
                  onChange={e => handleFile(e.target.files[0])} />
              </div>
            ) : (
              <div className="rounded-xl p-4" style={{ background: '#0B1121', border: '1px solid rgba(0,229,255,0.2)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: preview.type === 'JS' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)' }}>
                    <span className="text-xs font-bold" style={{ color: preview.type === 'JS' ? '#F59E0B' : '#3B82F6' }}>{preview.type}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: '#F0F6FF' }}>{preview.name}</p>
                    <p className="text-xs" style={{ color: '#64748B' }}>{preview.size}</p>
                  </div>
                  <button onClick={resetFile} className="p-1.5 rounded-lg" style={{ color: '#EF4444' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ background: '#1E293B', color: '#94A3B8' }}>
                Batal
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="flex-1 py-3 rounded-xl text-sm font-bold btn-gradient disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full spin-anim" />Memproses...</>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Upload Soal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <CustomAlert
        show={alert.show}
        tipe={alert.tipe}
        judul={alert.judul}
        pesan={alert.pesan}
        onOk={handleAlertOk}
      />
    </>,
    document.body
  );
}
