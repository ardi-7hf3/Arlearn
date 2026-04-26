import React from 'react';

export default function FormatUploadModal({ show, onClose }) {
  if (!show) return null;

  const jsCodePlain = [
    'export const tambahanSoal = [',
    '  {',
    '    id: 11,',
    '    teks: "Apa kepanjangan dari CPU?",',
    '    pilihan: [',
    '      "Central Processing Unit",',
    '      "Core Processing Unit",',
    '      "Central Program Utility",',
    '      "Computer Processing Unit"',
    '    ],',
    '    jawabanBenar: 0,',
    '    penjelasan: "CPU adalah otak dari komputer.",',
    '    pembahasan: "CPU terdiri dari ALU, CU, dan Register."',
    '  }',
    '];',
  ].join('\n');

  const jsCodeLatex = [
    'export const tambahanSoal = [',
    '  {',
    '    id: 12,',
    '    // Backslash LaTeX harus DOUBLE dalam string JS',
    '    teks: "Nilai $\\\\lim_{x \\\\to 0} \\\\frac{\\\\sin x}{x}$ adalah ...",',
    '    pilihan: ["$0$", "$1$", "$\\\\infty$", "Tidak ada"],',
    '    jawabanBenar: 1,',
    '    penjelasan: "Limit fundamental = 1",',
    '    pembahasan: "$$\\\\lim_{x \\\\to 0} \\\\frac{\\\\sin x}{x} = 1$$"',
    '  }',
    '];',
  ].join('\n');

  const latexSyntax = [
    { syntax: '$x^2$',           desc: 'Pangkat: x²' },
    { syntax: '$\\\\frac{a}{b}$', desc: 'Pecahan: a/b' },
    { syntax: '$\\\\sqrt{x}$',    desc: 'Akar kuadrat' },
    { syntax: '$\\\\int_a^b$',    desc: 'Integral' },
    { syntax: '$\\\\lim_{x \\\\to 0}$', desc: 'Limit' },
    { syntax: '$\\\\sin(x)$',     desc: 'Fungsi trigonometri' },
    { syntax: '$$...$$',          desc: 'Rumus blok (baris sendiri)' },
    { syntax: '$...$',            desc: 'Rumus inline (dalam teks)' },
  ];

  const fields = [
    { name: 'teks',         wajib: true,  desc: 'Teks pertanyaan. Bisa plain text atau LaTeX ($...$)' },
    { name: 'pilihan',      wajib: true,  desc: 'Array 2–4 opsi jawaban. Bisa mix plain + LaTeX' },
    { name: 'jawabanBenar', wajib: true,  desc: 'Index jawaban benar: 0=A, 1=B, 2=C, 3=D' },
    { name: 'penjelasan',   wajib: false, desc: 'Ringkasan singkat mengapa jawaban itu benar' },
    { name: 'pembahasan',   wajib: false, desc: 'Penjelasan step-by-step (bisa LaTeX $$...$$)' },
    { name: 'id',           wajib: false, desc: 'ID unik, auto-generate jika tidak diisi' },
  ];

  const docxCols = ['No','Soal','Pil. A','Pil. B','Pil. C','Pil. D','Jawaban','Penjelasan','Pembahasan'];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,11,24,0.88)', backdropFilter: 'blur(10px)' }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl animate-scaleIn"
        style={{ background: '#111827', border: '1px solid rgba(0,229,255,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#1E293B' }}>
          <h2 className="font-display font-bold text-lg flex items-center gap-2" style={{ color: '#F0F6FF' }}>
            <i className="fa-solid fa-clipboard-list text-base" style={{ color: '#00E5FF' }} />
            Format Upload Soal
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-all" style={{ color: '#64748B' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1E293B'; e.currentTarget.style.color = '#94A3B8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-6">

          {/* Field reference */}
          <div className="p-4 rounded-xl" style={{ background: '#0B1121', border: '1px solid rgba(0,229,255,0.12)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: '#00E5FF' }}>
              <i className="fa-solid fa-thumbtack text-xs" /> Field yang Tersedia
            </h3>
            <div className="space-y-1.5">
              {fields.map(f => (
                <div key={f.name} className="flex items-start gap-2 text-xs">
                  <code className="px-1.5 py-0.5 rounded flex-shrink-0 font-mono"
                    style={{ background: '#1E293B', color: '#00E5FF' }}>{f.name}</code>
                  {f.wajib
                    ? <span className="px-1.5 py-0.5 rounded text-xs flex-shrink-0"
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>wajib</span>
                    : <span className="px-1.5 py-0.5 rounded text-xs flex-shrink-0"
                        style={{ background: 'rgba(100,116,139,0.15)', color: '#64748B' }}>opsional</span>
                  }
                  <span style={{ color: '#64748B' }}>{f.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LaTeX syntax */}
          <div className="p-4 rounded-xl" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.15)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: '#A855F7' }}>
              <i className="fa-solid fa-square-root-variable text-xs" /> Sintaks LaTeX
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {latexSyntax.map(item => (
                <div key={item.syntax} className="flex items-center gap-2 text-xs">
                  <code className="px-1.5 py-0.5 rounded font-mono text-xs flex-shrink-0"
                    style={{ background: '#1E293B', color: '#A855F7' }}>{item.syntax}</code>
                  <span style={{ color: '#64748B' }}>{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* JS plain */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <span className="text-xs font-bold" style={{ color: '#F59E0B' }}>JS</span>
              </div>
              <h3 className="font-display font-semibold" style={{ color: '#F0F6FF' }}>Format .js — Soal Biasa</h3>
            </div>
            <pre className="text-xs p-4 rounded-xl overflow-x-auto"
              style={{ background: '#0B1121', color: '#94A3B8', border: '1px solid #1E293B', fontFamily: 'monospace', lineHeight: 1.7 }}>
              {jsCodePlain}
            </pre>
          </div>

          {/* JS LaTeX */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                <span className="text-xs font-bold" style={{ color: '#A855F7' }}>∑</span>
              </div>
              <h3 className="font-display font-semibold" style={{ color: '#F0F6FF' }}>Format .js — Soal Matematika (LaTeX)</h3>
            </div>
            <pre className="text-xs p-4 rounded-xl overflow-x-auto"
              style={{ background: '#0B1121', color: '#94A3B8', border: '1px solid rgba(168,85,247,0.15)', fontFamily: 'monospace', lineHeight: 1.7 }}>
              {jsCodeLatex}
            </pre>
            <div className="mt-2 p-3 rounded-lg text-xs flex gap-2"
              style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}>
              <i className="fa-solid fa-triangle-exclamation flex-shrink-0 mt-0.5" style={{ color: '#A855F7' }} />
              <span style={{ color: '#7C3AED' }}>
                Dalam file .js, backslash LaTeX harus ditulis <strong style={{ color: '#A855F7' }}>double</strong> karena
                string JS mengubah{' '}<code style={{ color: '#A855F7' }}>\\</code>{' '}menjadi{' '}
                <code style={{ color: '#A855F7' }}>\</code>.
                Contoh:{' '}<code style={{ color: '#A855F7' }}>\\\\frac</code>{' '}bukan{' '}
                <code style={{ color: '#A855F7' }}>\\frac</code>.
              </span>
            </div>
          </div>

          {/* DOCX */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
                <span className="text-xs font-bold" style={{ color: '#3B82F6' }}>W</span>
              </div>
              <h3 className="font-display font-semibold" style={{ color: '#F0F6FF' }}>Format .docx — Tabel Word</h3>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1E293B' }}>
              <div className="p-3 text-xs font-semibold uppercase tracking-wider"
                style={{ background: '#0B1121', color: '#64748B' }}>
                Buat tabel dengan 9 kolom:
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: '#0B1121' }}>
                      {docxCols.map(h => (
                        <th key={h} className="px-2 py-2 text-left font-semibold whitespace-nowrap"
                          style={{ color: '#00E5FF', borderBottom: '1px solid #1E293B' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: '#111827' }}>
                      <td className="px-2 py-2" style={{ color: '#64748B' }}>1</td>
                      <td className="px-2 py-2 whitespace-nowrap" style={{ color: '#94A3B8' }}>Nilai $x^2+1$ saat $x=3$</td>
                      <td className="px-2 py-2" style={{ color: '#94A3B8' }}>8</td>
                      <td className="px-2 py-2" style={{ color: '#94A3B8' }}>10</td>
                      <td className="px-2 py-2" style={{ color: '#94A3B8' }}>12</td>
                      <td className="px-2 py-2" style={{ color: '#94A3B8' }}>15</td>
                      <td className="px-2 py-2 font-bold" style={{ color: '#10B981' }}>B</td>
                      <td className="px-2 py-2 whitespace-nowrap" style={{ color: '#94A3B8' }}>$3^2+1=10$</td>
                      <td className="px-2 py-2 whitespace-nowrap" style={{ color: '#94A3B8' }}>Substitusi $x=3$...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-xs mt-2 flex items-start gap-1.5" style={{ color: '#475569' }}>
              <i className="fa-solid fa-lightbulb flex-shrink-0 mt-0.5" style={{ color: '#F59E0B' }} />
              LaTeX di DOCX cukup tulis dengan satu backslash — tidak perlu di-escape seperti file JS.
            </p>
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
