import React from 'react';

export default function FormatUploadModal({ show, onClose }) {
  if (!show) return null;

  const jsCode = `export const tambahanSoal = [
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
  }
];`;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,11,24,0.88)', backdropFilter: 'blur(10px)' }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl animate-scaleIn"
        style={{ background: '#111827', border: '1px solid rgba(0,229,255,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>
        
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#1E293B' }}>
          <h2 className="font-display font-bold text-lg" style={{ color: '#F0F6FF' }}>📋 Format Upload Soal</h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-all"
            style={{ color: '#64748B' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1E293B'; e.currentTarget.style.color = '#94A3B8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* JS Format */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <span className="text-xs font-bold" style={{ color: '#F59E0B' }}>JS</span>
              </div>
              <h3 className="font-display font-semibold" style={{ color: '#F0F6FF' }}>Format File .js</h3>
            </div>
            <pre className="text-xs p-4 rounded-xl overflow-x-auto" style={{ background: '#0B1121', color: '#94A3B8', border: '1px solid #1E293B', fontFamily: 'monospace', lineHeight: 1.6 }}>{jsCode}</pre>
            <div className="mt-2 p-3 rounded-lg text-xs" style={{ background: 'rgba(245,158,11,0.06)', color: '#78350F', border: '1px solid rgba(245,158,11,0.15)' }}>
              <span className="font-semibold" style={{ color: '#F59E0B' }}>⚠️ Catatan: </span>
              <span style={{ color: '#92400E' }}>Field wajib: <code style={{ color: '#F59E0B' }}>teks</code>, <code style={{ color: '#F59E0B' }}>pilihan</code> (array min. 2), <code style={{ color: '#F59E0B' }}>jawabanBenar</code> (index 0-3). Field <code style={{ color: '#F59E0B' }}>id</code> dan <code style={{ color: '#F59E0B' }}>penjelasan</code> opsional.</span>
            </div>
          </div>

          {/* DOCX Format */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
                <span className="text-xs font-bold" style={{ color: '#3B82F6' }}>W</span>
              </div>
              <h3 className="font-display font-semibold" style={{ color: '#F0F6FF' }}>Format File .docx (Word)</h3>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1E293B' }}>
              <div className="p-3 text-xs font-semibold uppercase tracking-wider" style={{ background: '#0B1121', color: '#64748B' }}>
                Buat tabel dengan 8 kolom:
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: '#0B1121' }}>
                      {['No', 'Soal', 'Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D', 'Jawaban (A/B/C/D)', 'Penjelasan'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap" style={{ color: '#00E5FF', borderBottom: '1px solid #1E293B' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: '#111827' }}>
                      <td className="px-3 py-2" style={{ color: '#64748B' }}>1</td>
                      <td className="px-3 py-2 whitespace-nowrap" style={{ color: '#94A3B8' }}>Apa itu HTML?</td>
                      <td className="px-3 py-2 whitespace-nowrap" style={{ color: '#94A3B8' }}>HyperText...</td>
                      <td className="px-3 py-2 whitespace-nowrap" style={{ color: '#94A3B8' }}>HighText...</td>
                      <td className="px-3 py-2 whitespace-nowrap" style={{ color: '#94A3B8' }}>HyperLink...</td>
                      <td className="px-3 py-2 whitespace-nowrap" style={{ color: '#94A3B8' }}>HyperCode...</td>
                      <td className="px-3 py-2 font-bold" style={{ color: '#10B981' }}>A</td>
                      <td className="px-3 py-2 whitespace-nowrap" style={{ color: '#94A3B8' }}>HTML adalah...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 pt-0">
          <button onClick={onClose} className="w-full py-3 rounded-xl text-sm font-bold btn-gradient">
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
