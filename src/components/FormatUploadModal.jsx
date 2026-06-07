import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function FormatUploadModal({ show, onClose }) {
  // ── lock scroll background ──
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

  const fields = [
    { name: 'id',           wajib: false, desc: 'ID unik — auto-generate jika tidak diisi' },
    { name: 'mapel',        wajib: false, desc: "Mata pelajaran: 'kimia' | 'fisika' | 'mtkLanjut' | 'mtkWajib'" },
    { name: 'bab',          wajib: false, desc: "Kode bab paket: 'bab1', 'bab2', 'bab3', dst." },
    { name: 'namaBab',      wajib: false, desc: "Nama bab, contoh: 'Termokimia & Laju Reaksi'" },
    { name: 'teks',         wajib: true,  desc: 'Teks soal. Bisa plain text atau LaTeX ($...$)' },
    { name: 'pilihan',      wajib: true,  desc: 'Array 2–4 opsi jawaban (A, B, C, D)' },
    { name: 'jawabanBenar', wajib: true,  desc: 'Index jawaban benar: 0=A, 1=B, 2=C, 3=D' },
    { name: 'penjelasan',   wajib: false, desc: 'Ringkasan singkat mengapa jawaban itu benar' },
    { name: 'pembahasan',   wajib: false, desc: 'Penjelasan step-by-step (bisa LaTeX $$...$$)' },
  ];

  const latexSyntax = [
    { syntax: '$x^2$',              desc: 'Pangkat: x²' },
    { syntax: '$\\\\frac{a}{b}$',   desc: 'Pecahan' },
    { syntax: '$\\\\sqrt{x}$',      desc: 'Akar kuadrat' },
    { syntax: '$\\\\int_a^b$',      desc: 'Integral' },
    { syntax: '$\\\\lim_{x\\\\to 0}$', desc: 'Limit' },
    { syntax: '$\\\\sin(x)$',       desc: 'Trigonometri' },
    { syntax: '$...$',              desc: 'Inline (dalam teks)' },
    { syntax: '$$...$$',            desc: 'Blok (baris sendiri)' },
  ];

  const docxCols = ['No','Soal','Pil. A','Pil. B','Pil. C','Pil. D','Jawaban','Penjelasan','Pembahasan'];

  const jsCodePlain = `// ── FORMAT PAKET BAB ──
// Satu file bisa berisi soal dari berbagai bab dalam satu mapel
export const tambahanSoal = [
  // BAB 1 — Termokimia
  {
    id: 101,
    mapel: 'kimia',
    bab: 'bab1',
    namaBab: 'Termokimia',
    teks: "Reaksi yang melepaskan kalor ke lingkungan disebut reaksi...",
    pilihan: ["Endoterm", "Eksoterm", "Redoks", "Netralisasi"],
    jawabanBenar: 1,
    penjelasan: "Eksoterm: kalor mengalir dari sistem ke lingkungan.",
    pembahasan: "ΔH < 0 → reaksi eksoterm."
  },
  // BAB 2 — Laju Reaksi
  {
    id: 102,
    mapel: 'kimia',
    bab: 'bab2',
    namaBab: 'Laju Reaksi',
    teks: "Faktor yang TIDAK mempengaruhi laju reaksi adalah...",
    pilihan: ["Suhu", "Katalis", "Warna larutan", "Konsentrasi"],
    jawabanBenar: 2,
    penjelasan: "Warna larutan bukan faktor laju reaksi.",
    pembahasan: "Faktor laju: suhu, katalis, konsentrasi, luas permukaan."
  },
  // Tambahkan soal bab lainnya di sini...
];`;

  const jsCodeLatex = `export const tambahanSoal = [
  {
    id: 12,
    mapel: 'mtkLanjut',
    // Backslash LaTeX harus DOUBLE dalam string JS
    teks: "Nilai $\\\\lim_{x \\\\to 0} \\\\frac{\\\\sin x}{x}$ adalah ...",
    pilihan: ["$0$", "$1$", "$\\\\infty$", "Tidak ada"],
    jawabanBenar: 1,
    penjelasan: "Limit fundamental = 1",
    pembahasan: "$$\\\\lim_{x \\\\to 0} \\\\frac{\\\\sin x}{x} = 1$$"
  }
];`;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 110,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(5,11,24,0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        touchAction: 'none',
        overscrollBehavior: 'none',
      }}
    >
      {/* Modal panel — stop click propagation */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 640,
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 20,
          background: '#111827',
          border: '1px solid rgba(0,229,255,0.2)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          animation: 'alertSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.25rem 1rem',
          borderBottom: '1px solid #1E293B',
          position: 'sticky', top: 0, zIndex: 10,
          background: '#111827',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="fa-solid fa-clipboard-list" style={{ color: '#00E5FF', fontSize: 14 }} />
            </div>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#F0F6FF', margin: 0 }}>
                Format Upload Soal
              </h2>
              <p style={{ fontSize: '0.7rem', color: '#475569', margin: 0 }}>Panduan format file .js dan .docx</p>
            </div>
          </div>
          <button onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none',
              background: '#1E293B', color: '#64748B', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#2D3748'; e.currentTarget.style.color = '#F0F6FF'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1E293B'; e.currentTarget.style.color = '#64748B'; }}>
            <i className="fa-solid fa-xmark" style={{ fontSize: 13 }} />
          </button>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* ── Field Reference ── */}
          <Section color="#00E5FF" icon="fa-solid fa-table-columns" title="Field yang Tersedia">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fields.map(f => (
                <div key={f.name} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <code style={{
                    padding: '2px 8px', borderRadius: 6, flexShrink: 0,
                    fontFamily: 'monospace', fontSize: '0.75rem',
                    background: '#1E293B', color: '#00E5FF',
                  }}>{f.name}</code>
                  <span style={{
                    padding: '2px 8px', borderRadius: 6, flexShrink: 0,
                    fontSize: '0.65rem', fontWeight: 600,
                    background: f.wajib ? 'rgba(239,68,68,0.12)' : 'rgba(100,116,139,0.12)',
                    color: f.wajib ? '#EF4444' : '#64748B',
                  }}>{f.wajib ? 'wajib' : 'opsional'}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.5 }}>{f.desc}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* ── LaTeX Syntax ── */}
          <Section color="#A855F7" icon="fa-solid fa-square-root-variable" title="Sintaks LaTeX">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {latexSyntax.map(item => (
                <div key={item.syntax} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <code style={{
                    padding: '2px 6px', borderRadius: 5, fontFamily: 'monospace', fontSize: '0.7rem', flexShrink: 0,
                    background: '#1E293B', color: '#A855F7',
                  }}>{item.syntax}</code>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{item.desc}</span>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 10, padding: '10px 12px', borderRadius: 10,
              background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)',
              display: 'flex', gap: 8, alignItems: 'flex-start',
            }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#A855F7', fontSize: 12, marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontSize: '0.72rem', color: '#7C3AED', margin: 0, lineHeight: 1.6 }}>
                Dalam file <strong style={{ color: '#A855F7' }}>.js</strong>, backslash LaTeX harus{' '}
                <strong style={{ color: '#A855F7' }}>double</strong> karena string JS mengubah{' '}
                <code style={{ color: '#A855F7', background: '#1E293B', padding: '0 4px', borderRadius: 4 }}>\\</code>{' '}
                menjadi{' '}
                <code style={{ color: '#A855F7', background: '#1E293B', padding: '0 4px', borderRadius: 4 }}>\</code>.{' '}
                Di file <strong style={{ color: '#A855F7' }}>.docx</strong> cukup 1 backslash.
              </p>
            </div>
          </Section>

          {/* ── JS Plain ── */}
          <Section
            badge={<Badge label="JS" color="#F59E0B" />}
            title="Format .js — Soal Biasa"
          >
            <CodeBlock code={jsCodePlain} />
          </Section>

          {/* ── JS LaTeX ── */}
          <Section
            badge={<Badge label="∑" color="#A855F7" />}
            title="Format .js — Soal Matematika (LaTeX)"
          >
            <CodeBlock code={jsCodeLatex} accent="#A855F7" />
          </Section>

          {/* ── DOCX ── */}
          <Section
            badge={<Badge label="W" color="#3B82F6" />}
            title="Format .docx — Tabel Word"
          >
            <p style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: 8 }}>
              Buat tabel dengan 9 kolom berikut:
            </p>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #1E293B' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
                  <thead>
                    <tr style={{ background: '#0B1121' }}>
                      {docxCols.map(h => (
                        <th key={h} style={{
                          padding: '8px 10px', textAlign: 'left', fontWeight: 600,
                          color: '#00E5FF', borderBottom: '1px solid #1E293B', whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: '#111827' }}>
                      <td style={{ padding: '8px 10px', color: '#64748B' }}>1</td>
                      <td style={{ padding: '8px 10px', color: '#94A3B8', whiteSpace: 'nowrap' }}>Nilai $x^2+1$ saat $x=3$</td>
                      <td style={{ padding: '8px 10px', color: '#94A3B8' }}>8</td>
                      <td style={{ padding: '8px 10px', color: '#94A3B8' }}>10</td>
                      <td style={{ padding: '8px 10px', color: '#94A3B8' }}>12</td>
                      <td style={{ padding: '8px 10px', color: '#94A3B8' }}>15</td>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#10B981' }}>B</td>
                      <td style={{ padding: '8px 10px', color: '#94A3B8', whiteSpace: 'nowrap' }}>$3^2+1=10$</td>
                      <td style={{ padding: '8px 10px', color: '#94A3B8', whiteSpace: 'nowrap' }}>Substitusi $x=3$...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Section>

        </div>

        {/* ── Footer ── */}
        <div style={{ padding: '0 1.25rem 1.25rem' }}>
          <button onClick={onClose}
            style={{
              width: '100%', padding: '0.75rem', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #F97316, #FB923C)',
              color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 0 20px rgba(249,115,22,0.3)',
            }}>
            <i className="fa-solid fa-check" style={{ fontSize: 13 }} />
            Mengerti, Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Sub-components ──
function Section({ color, icon, badge, title, children }) {
  return (
    <div style={{
      borderRadius: 14,
      background: color ? `${color}06` : '#0B1121',
      border: `1px solid ${color ? color + '18' : '#1E293B'}`,
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px',
        borderBottom: `1px solid ${color ? color + '18' : '#1E293B'}`,
        background: color ? `${color}08` : '#0B1121',
      }}>
        {icon && <i className={icon} style={{ color: color, fontSize: 12 }} />}
        {badge}
        <span style={{ fontWeight: 700, fontSize: '0.78rem', color: color || '#F0F6FF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
      </div>
      <div style={{ padding: '12px 14px' }}>{children}</div>
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <div style={{
      width: 24, height: 24, borderRadius: 6, flexShrink: 0,
      background: `${color}18`, border: `1px solid ${color}35`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.65rem', fontWeight: 800, color,
    }}>{label}</div>
  );
}

function CodeBlock({ code, accent = '#00E5FF' }) {
  return (
    <pre style={{
      fontSize: '0.72rem', padding: '12px 14px', borderRadius: 10,
      background: '#0B1121', color: '#94A3B8',
      border: `1px solid ${accent}18`,
      fontFamily: '"Fira Code", monospace',
      lineHeight: 1.7, overflowX: 'auto', margin: 0,
      whiteSpace: 'pre',
    }}>
      {code}
    </pre>
  );
}
