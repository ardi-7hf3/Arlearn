// ============================================================
//  UserApp.jsx — Semua halaman & komponen user ARLearn
// ============================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import { logLoginActivity } from '../lib/loginLogger';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const MAPEL_CFG = {
  kimia:     { label:'Kimia',      labelUp:'KIMIA',      icon:'science',      color:'#F59E0B', bg:'rgba(245,158,11,0.10)',  border:'rgba(245,158,11,0.25)',  glow:'rgba(245,158,11,0.15)'  },
  fisika:    { label:'Fisika',     labelUp:'FISIKA',     icon:'bolt',         color:'#00E5FF', bg:'rgba(0,229,255,0.10)',   border:'rgba(0,229,255,0.25)',   glow:'rgba(0,229,255,0.15)'   },
  mtkLanjut: { label:'MTK Lanjut',labelUp:'MTK LANJUT', icon:'functions',    color:'#A78BFA', bg:'rgba(167,139,250,0.10)', border:'rgba(167,139,250,0.25)', glow:'rgba(167,139,250,0.15)' },
  mtkWajib:  { label:'MTK Wajib', labelUp:'MTK WAJIB',  icon:'calculate',    color:'#10B981', bg:'rgba(16,185,129,0.10)',  border:'rgba(16,185,129,0.25)',  glow:'rgba(16,185,129,0.15)'  },
  pjok:      { label:'PJOK',      labelUp:'PJOK',       icon:'fitness_center',color:'#F43F5E', bg:'rgba(244,63,94,0.10)',   border:'rgba(244,63,94,0.25)',   glow:'rgba(244,63,94,0.15)'   },
  default:   { label:'Lainnya',   labelUp:'UMUM',       icon:'menu_book',    color:'#94A3B8', bg:'rgba(148,163,184,0.08)', border:'rgba(148,163,184,0.20)', glow:'rgba(148,163,184,0.10)' },
};
const getCfg = (mapel) => MAPEL_CFG[mapel] || MAPEL_CFG.default;
const OPTS = ['A','B','C','D'];

// Material Icon helper
const MI = ({ name, style, className }) => (
  <span className={`material-icons${className?' '+className:''}`} style={style}>{name}</span>
);

async function fetchSoal(mapel = null, kelas = null, bab = null) {
  let q = supabase.from('soal')
    .select('id,mapel,kelas,bab,nama_bab,teks,pilihan,jawaban_benar,penjelasan,pembahasan,gambar')
    .eq('aktif', true);
  if (mapel) q = q.eq('mapel', mapel);
  if (kelas) q = q.eq('kelas', kelas);
  if (bab && bab !== '__all__') q = q.eq('bab', bab);
  const { data } = await q.order('id');
  return (data || []).map(s => ({
    id: s.id, mapel: s.mapel, kelas: s.kelas || 'XI', bab: s.bab, namaBab: s.nama_bab,
    teks: s.teks, pilihan: Array.isArray(s.pilihan) ? s.pilihan : JSON.parse(s.pilihan || '[]'), gambar: s.gambar || null,
    jawabanBenar: s.jawaban_benar, penjelasan: s.penjelasan, pembahasan: s.pembahasan,
  }));
}

async function fetchMapelBab() {
  const { data } = await supabase.from('soal').select('mapel,kelas,bab,nama_bab').eq('aktif', true).order('mapel').order('kelas').order('bab');
  const map = {};
  for (const s of data || []) {
    const kls = s.kelas || 'XI';
    const key = `${s.mapel}__${kls}__${s.bab}`;
    if (!map[key]) map[key] = { mapel: s.mapel, kelas: kls, bab: s.bab, namaBab: s.nama_bab, jumlah: 0 };
    map[key].jumlah++;
  }
  return Object.values(map);
}

async function fetchRiwayat(userId) {
  const { data } = await supabase.from('riwayat').select('*').eq('user_id', userId).order('tanggal', { ascending: false });
  return data || [];
}

async function saveRiwayat(userId, entry) {
  // soal_list: snapshot soal (teks, pilihan, jawaban, penjelasan, pembahasan)
  const soalSnapshot = (entry.soalList||[]).map(s=>({
    id: s.id, mapel: s.mapel, bab: s.bab,
    teks: s.teks, pilihan: s.pilihan,
    jawabanBenar: s.jawabanBenar,
    penjelasan: s.penjelasan,
    pembahasan: s.pembahasan,
  }));
  await supabase.from('riwayat').insert({
    user_id: userId,
    mapel: entry.mapel || null,
    kelas: entry.kelas || null,
    bab: entry.bab || null,
    nama_bab: entry.namaBab || null,
    total_soal: entry.totalSoal,
    benar: entry.benar, salah: entry.salah, skor: entry.skor,
    durasi_detik: entry.durasiDetik || null,
    detail: entry.detail || null,
    soal_list: soalSnapshot.length > 0 ? soalSnapshot : null,
  });
}

async function hapusRiwayat(id) {
  await supabase.from('riwayat').delete().eq('id', id);
}

function formatTgl(iso) {
  const d = new Date(iso);
  const hari   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const bulan  = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
  return `${hari[d.getDay()]}, ${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()} · ${String(d.getHours()).padStart(2,'0')}.${String(d.getMinutes()).padStart(2,'0')}`;
}

// ─── MARKDOWN TABLE PARSER ───
function isTableLine(line) {
  return line.trim().startsWith('|') && line.trim().endsWith('|');
}
function isSeparatorLine(line) {
  return /^\|[\s\-:|]+\|/.test(line.trim());
}
function parseTableCells(line) {
  return line.trim().slice(1, -1).split('|').map(c => c.trim());
}
function MarkdownTable({ raw }) {
  const lines = raw.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return <span>{raw}</span>;
  const headerCells = parseTableCells(lines[0]);
  const bodyLines = lines.slice(2).filter(l => !isSeparatorLine(l));
  return (
    <div style={{ overflowX:'auto', margin:'8px 0' }}>
      <table style={{ borderCollapse:'collapse', width:'100%', fontSize:'0.8rem' }}>
        <thead>
          <tr>
            {headerCells.map((cell, i) => (
              <th key={i} style={{ padding:'6px 12px', background:'rgba(0,229,255,0.12)', color:'#00E5FF', border:'1px solid rgba(0,229,255,0.2)', fontWeight:700, textAlign:'center', whiteSpace:'nowrap' }}>
                <LatexInline text={cell}/>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyLines.map((line, ri) => (
            <tr key={ri} style={{ background: ri%2===0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
              {parseTableCells(line).map((cell, ci) => (
                <td key={ci} style={{ padding:'6px 12px', border:'1px solid rgba(255,255,255,0.07)', color:'#CBD5E1', textAlign:'center', whiteSpace:'nowrap' }}>
                  <LatexInline text={cell}/>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── INLINE LATEX (tanpa table parsing) ───
function LatexInline({ text }) {
  if (!text) return null;
  const parts = []; let rem = text; let k = 0;
  while (rem.length > 0) {
    const bs = rem.indexOf('$$');
    if (bs !== -1) {
      if (bs > 0) parts.push(<span key={k++}>{rem.slice(0, bs)}</span>);
      const be = rem.indexOf('$$', bs + 2);
      if (be !== -1) {
        parts.push(<BlockMath key={k++} math={rem.slice(bs+2,be)} renderError={() => <code>{rem.slice(bs+2,be)}</code>} />);
        rem = rem.slice(be + 2); continue;
      }
    }
    const is = rem.indexOf('$');
    if (is !== -1) {
      if (is > 0) parts.push(<span key={k++}>{rem.slice(0, is)}</span>);
      const ie = rem.indexOf('$', is + 1);
      if (ie !== -1) {
        parts.push(<InlineMath key={k++} math={rem.slice(is+1,ie)} renderError={() => <code>{rem.slice(is+1,ie)}</code>} />);
        rem = rem.slice(ie + 1); continue;
      }
    }
    parts.push(<span key={k++}>{rem}</span>); break;
  }
  return <span>{parts}</span>;
}

// ─── LATEX RENDERER (with table + newline support) ───
function Latex({ text }) {
  if (!text) return null;

  // Split teks per baris, detect blok tabel markdown
  const lines = text.split('\n');
  const blocks = [];
  let tableAccum = [];
  let k = 0;

  const flushTable = () => {
    if (tableAccum.length >= 2) {
      blocks.push({ type: 'table', raw: tableAccum.join('\n'), key: k++ });
    } else if (tableAccum.length > 0) {
      tableAccum.forEach(l => blocks.push({ type: 'text', raw: l + '\n', key: k++ }));
    }
    tableAccum = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isTableLine(line)) {
      tableAccum.push(line);
    } else {
      if (tableAccum.length > 0) flushTable();
      blocks.push({ type: 'text', raw: line + (i < lines.length - 1 ? '\n' : ''), key: k++ });
    }
  }
  if (tableAccum.length > 0) flushTable();

  return (
    <span className="latex-text">
      {blocks.map(block => {
        if (block.type === 'table') return <MarkdownTable key={block.key} raw={block.raw} />;
        // render teks biasa dengan newline & inline latex
        const seg = block.raw;
        if (!seg.trim()) return <br key={block.key} />;
        return <span key={block.key} style={{ display:'inline' }}><LatexInline text={seg.replace(/\n$/, '')} />{seg.endsWith('\n') && <br />}</span>;
      })}
    </span>
  );
}

// ─── PENJELASAN BOX (toggle singkat/lengkap) ───
// ─── PEMBAHASAN STEP PARSER ───
// Format khusus di field pembahasan:
//   [RUMUS] ...     → kotak rumus dasar berwarna kuning
//   [LANGKAH] ...   → label step bernomor
//   [INSTRUKSI] ... → badge instruksi (misal: substitusikan, kalikan, dll)
//   [HASIL] ...     → baris hasil akhir highlight hijau
//   baris $...      → formula LaTeX, rata tengah
//   baris lainnya   → teks penjelasan biasa
function ParsedPembahasan({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  let stepCounter = 0;
  const INSTRUKSI_KATA = [
    'substitusikan','kalikan','bagikan','jumlahkan','kurangkan','hitung','tentukan',
    'ubah','gunakan','masukkan','bandingkan','sederhanakan','bagi','kali','tambah',
    'kurang','cari','konversikan','tulis','perhatikan','ingat','catatan'
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {lines.map((raw, i) => {
        const line = raw.trim();
        if (!line) return <div key={i} style={{ height:4 }}/>;

        // [RUMUS] tag → kotak rumus dasar
        if (line.startsWith('[RUMUS]')) {
          const content = line.replace('[RUMUS]','').trim();
          return (
            <div key={i} style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:10, padding:'8px 12px', margin:'4px 0' }}>
              <div style={{ fontSize:'0.65rem', fontWeight:800, color:'#F59E0B', letterSpacing:'0.08em', marginBottom:4, display:'flex', alignItems:'center', gap:4 }}>
                <span className="material-icons" style={{ fontSize:12 }}>functions</span>RUMUS DASAR
              </div>
              <div style={{ textAlign:'center', color:'#FDE68A' }}><Latex text={content}/></div>
            </div>
          );
        }

        // [LANGKAH] tag → step bernomor
        if (line.startsWith('[LANGKAH]')) {
          stepCounter++;
          const content = line.replace('[LANGKAH]','').trim();
          return (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, margin:'2px 0' }}>
              <div style={{ minWidth:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#F97316,#FB923C)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', fontWeight:800, color:'#fff', flexShrink:0, marginTop:1 }}>{stepCounter}</div>
              <div style={{ fontSize:'0.8rem', color:'#CBD5E1', lineHeight:1.6, flex:1 }}><Latex text={content}/></div>
            </div>
          );
        }

        // [INSTRUKSI] tag → badge instruksi
        if (line.startsWith('[INSTRUKSI]')) {
          const content = line.replace('[INSTRUKSI]','').trim();
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:6, margin:'2px 0' }}>
              <span style={{ background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', color:'#A78BFA', borderRadius:6, padding:'1px 8px', fontSize:'0.65rem', fontWeight:700, whiteSpace:'nowrap', flexShrink:0 }}>
                ▶ {content.split(' ')[0].toUpperCase()}
              </span>
              <div style={{ fontSize:'0.8rem', color:'#94A3B8', flex:1 }}><Latex text={content}/></div>
            </div>
          );
        }

        // [HASIL] tag → highlight hijau hasil akhir
        if (line.startsWith('[HASIL]')) {
          const content = line.replace('[HASIL]','').trim();
          return (
            <div key={i} style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:10, padding:'8px 14px', margin:'4px 0', textAlign:'center' }}>
              <div style={{ fontSize:'0.65rem', fontWeight:800, color:'#10B981', letterSpacing:'0.08em', marginBottom:3, display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                <span className="material-icons" style={{ fontSize:12 }}>check_circle</span>HASIL AKHIR
              </div>
              <div style={{ color:'#6EE7B7', fontWeight:700 }}><Latex text={content}/></div>
            </div>
          );
        }

        // Deteksi instruksi otomatis dari kata kunci (tanpa tag)
        const lowerLine = line.toLowerCase();
        const isAutoInstruksi = INSTRUKSI_KATA.some(k => lowerLine.startsWith(k));
        if (isAutoInstruksi && !line.startsWith('$')) {
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:6, margin:'1px 0' }}>
              <span style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', color:'#818CF8', borderRadius:6, padding:'1px 7px', fontSize:'0.6rem', fontWeight:700, whiteSpace:'nowrap', flexShrink:0 }}>
                ↳
              </span>
              <div style={{ fontSize:'0.8rem', color:'#94A3B8' }}><Latex text={line}/></div>
            </div>
          );
        }

        // Formula LaTeX (diawali $) → rata tengah, warna terang
        const isFormula = line.startsWith('$') || /^[=→≈≠±∴∵]/.test(line);
        if (isFormula) {
          return (
            <div key={i} style={{ textAlign:'center', color:'#CBD5E1', padding:'1px 0' }}>
              <Latex text={line}/>
            </div>
          );
        }

        // Teks biasa
        return (
          <div key={i} style={{ fontSize:'0.8rem', color:'#94A3B8', lineHeight:1.6 }}>
            <Latex text={line}/>
          </div>
        );
      })}
    </div>
  );
}

function PenjelasanBox({ penjelasan, pembahasan }) {
  const [mode, setMode] = useState('singkat'); // 'singkat' | 'lengkap'
  const hasPembahasan = pembahasan && pembahasan.trim();
  return (
    <div className="mx-4 mb-4 rounded-2xl overflow-hidden animate-fadeIn" style={{ border:'1px solid rgba(0,229,255,0.18)', background:'rgba(0,229,255,0.03)' }}>
      {/* Header + Toggle */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color:'#00E5FF' }}>
          <MI name="lightbulb" style={{ fontSize:14 }}/>PENJELASAN
        </span>
        {hasPembahasan && (
          <div className="flex items-center gap-1 rounded-xl overflow-hidden" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
            {['singkat','lengkap'].map(m => (
              <button key={m} onClick={()=>setMode(m)}
                className="px-3 py-1 text-xs font-semibold transition-all"
                style={{
                  background: mode===m ? 'rgba(0,229,255,0.18)' : 'transparent',
                  color: mode===m ? '#00E5FF' : '#475569',
                  borderRadius: 10,
                }}>
                {m==='singkat' ? 'Singkat' : 'Lengkap'}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Divider */}
      <div style={{ height:1, background:'rgba(0,229,255,0.08)', marginBottom:10 }}/>
      {/* Konten */}
      <div className="px-4 pb-4">
        {mode === 'singkat' ? (
          <div className="text-sm leading-relaxed" style={{ color:'#94A3B8' }}>
            <Latex text={penjelasan}/>
          </div>
        ) : (
          <ParsedPembahasan text={pembahasan}/>
        )}
      </div>
    </div>
  );
}

// ─── CUSTOM ALERT ───
function Alert({ show, tipe='info', judul, pesan, onOk, onYes, onNo, okLabel='OK', yesLabel='Ya', noLabel='Batal' }) {
  useEffect(() => {
    if (!show) return;
    const y = window.scrollY;
    document.body.style.cssText = `overflow:hidden;position:fixed;top:-${y}px;width:100%`;
    return () => { document.body.style.cssText = ''; window.scrollTo(0, y); };
  }, [show]);
  if (!show) return null;
  const IC = {
    success:{ icon:'check_circle',  c:'#10B981', bg:'rgba(16,185,129,0.12)',  bd:'rgba(16,185,129,0.35)'  },
    error:  { icon:'cancel',        c:'#EF4444', bg:'rgba(239,68,68,0.12)',   bd:'rgba(239,68,68,0.35)'   },
    warning:{ icon:'warning',       c:'#F59E0B', bg:'rgba(245,158,11,0.12)',  bd:'rgba(245,158,11,0.35)'  },
    confirm:{ icon:'help',          c:'#00E5FF', bg:'rgba(0,229,255,0.08)',   bd:'rgba(0,229,255,0.3)'    },
    info:   { icon:'info',          c:'#00E5FF', bg:'rgba(0,229,255,0.08)',   bd:'rgba(0,229,255,0.3)'    },
  };
  const ic = IC[tipe] || IC.info;
  const S = { btn: { padding:'0.625rem 1rem', borderRadius:12, fontSize:'0.875rem', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, flex:1 } };
  const portal = createPortal(
    <div style={{ position:'fixed',inset:0,zIndex:99999,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',background:'rgba(5,11,24,0.92)',backdropFilter:'blur(12px)',animation:'alertFadeIn 0.18s ease both' }}>
      <div style={{ width:'100%',maxWidth:420,borderRadius:20,padding:'1.75rem',background:'#111827',border:'1px solid rgba(0,229,255,0.2)',boxShadow:'0 24px 64px rgba(0,0,0,0.75)',animation:'alertSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <div style={{ width:56,height:56,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem',background:ic.bg,border:`2px solid ${ic.bd}` }}>
          <MI name={ic.icon} style={{ color:ic.c, fontSize:28 }} />
        </div>
        <h3 style={{ textAlign:'center',fontWeight:800,fontSize:'1.1rem',color:'#F0F6FF',marginBottom:'0.5rem' }}>{judul}</h3>
        <p style={{ textAlign:'center',fontSize:'0.875rem',lineHeight:1.6,color:'#94A3B8',whiteSpace:'pre-wrap' }}>{pesan}</p>
        <div style={{ display:'flex',gap:'0.75rem',marginTop:'1.5rem' }}>
          {tipe === 'confirm' ? (<>
            <button onClick={onNo} style={{ ...S.btn,background:'#1E293B',color:'#94A3B8',border:'1px solid #2D3748' }}><MI name="close" style={{fontSize:14}}/>{noLabel}</button>
            <button onClick={onYes} style={{ ...S.btn,background:'linear-gradient(135deg,#F97316,#FB923C)',color:'#fff',border:'none',boxShadow:'0 0 20px rgba(249,115,22,0.35)' }}><MI name="check" style={{fontSize:14}}/>{yesLabel}</button>
          </>) : (
            <button onClick={onOk} style={{ ...S.btn,background:'linear-gradient(135deg,#F97316,#FB923C)',color:'#fff',border:'none',boxShadow:'0 0 20px rgba(249,115,22,0.35)',margin:'0 auto' }}><MI name="check" style={{fontSize:14}}/>{okLabel}</button>
          )}
        </div>
      </div>
    </div>, document.body
  );
  return portal;
}

// ─── NAVBAR ───
function Navbar({ page, setPage, userName, isAdmin, onLogout }) {
  const NAV = [
    { key:'tryout',  icon:'home',         label:'Tryout'  },
    { key:'riwayat', icon:'history',      label:'Riwayat' },
  ];
  if (isAdmin) NAV.push({ key:'admin', icon:'tune', label:'Admin' });

  return (<>
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14"
      style={{ background:'rgba(5,11,24,0.95)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-2.5">
        <img src="/favicon.png" alt="AR" style={{ width:28, height:28, objectFit:'contain' }}/>
        <span className="font-black text-base logo-gradient">ARLearn</span>
      </div>
      <div className="hidden sm:flex items-center gap-1">
        {NAV.map(n => (
          <button key={n.key} onClick={() => setPage(n.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
            style={{ background:page===n.key?'rgba(249,115,22,0.15)':'transparent', color:page===n.key?'#F97316':'#64748B', border:page===n.key?'1px solid rgba(249,115,22,0.3)':'1px solid transparent' }}>
            <MI name={n.icon} style={{fontSize:16}}/>{n.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background:'rgba(0,229,255,0.06)',border:'1px solid rgba(0,229,255,0.1)' }}>
          <MI name="account_circle" style={{ color:'#00E5FF', fontSize:16 }}/>
          <span className="text-sm font-semibold" style={{ color:'#94A3B8' }}>{userName}</span>
        </div>
        <button onClick={onLogout} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{ background:'rgba(239,68,68,0.1)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.18)' }}>
          <MI name="logout" style={{fontSize:14}}/>Keluar
        </button>
      </div>
    </nav>

    {/* Mobile bottom nav */}
    <div className="fixed bottom-0 left-0 right-0 sm:hidden z-40"
      style={{ background:'rgba(5,11,24,0.97)',borderTop:'1px solid rgba(255,255,255,0.06)',backdropFilter:'blur(24px)' }}>
      <div className="flex items-end h-16">
        {NAV.map(n => (
          <button key={n.key} onClick={() => setPage(n.key)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-all"
            style={{ color:page===n.key?'#F97316':'#475569' }}>
            <MI name={n.icon} style={{fontSize:22}}/>
            <span className="text-[10px] font-semibold">{n.label}</span>
          </button>
        ))}
        <button onClick={onLogout}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full"
          style={{ color:'#475569' }}>
          <MI name="logout" style={{fontSize:22}}/>
          <span className="text-[10px] font-semibold">Keluar</span>
        </button>
      </div>
    </div>
  </>);
}

// ─── LOGIN PAGE ───
function LoginPage({ onLogin }) {
  const [email, setEmail]         = useState('');
  const [pass, setPass]           = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPass, setFocusPass]   = useState(false);
  const [alert, setAlert]         = useState({ show:false });

  const handleLogin = async () => {
    if (!email.trim() || !pass.trim()) { setAlert({ show:true, tipe:'warning', judul:'Form Kosong', pesan:'Isi email dan password terlebih dahulu.' }); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
    if (error) { setLoading(false); setAlert({ show:true, tipe:'error', judul:'Login Gagal', pesan:error.message }); return; }
    const { data: profile } = await supabase.from('profiles').select('display_name,role').eq('id', data.user.id).single();
    setLoading(false);
    // Catat aktivitas login (IP, user agent) — non-blocking
    logLoginActivity(data.user.email);
    onLogin(data.user.id, profile?.display_name || email.split('@')[0], profile?.role || 'user');
  };

  return (
    <div style={{ minHeight:'100vh', background:'#05080F', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 20px', position:'relative', overflow:'hidden' }}>

      {/* ── BG: satu glow besar di tengah atas, bukan banyak dekorasi ── */}
      <div style={{ position:'absolute', top:'-20%', left:'50%', transform:'translateX(-50%)', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,180,220,0.07) 0%, transparent 70%)', pointerEvents:'none' }}/>
      {/* garis tipis horizontal aksen bawah logo */}
      <div style={{ position:'absolute', top:'38%', left:0, right:0, height:1, background:'linear-gradient(90deg, transparent, rgba(0,229,255,0.06), transparent)', pointerEvents:'none' }}/>

      {/* ── LOGO AREA ── */}
      <div className="animate-fadeIn" style={{ width:'100%', maxWidth:380, marginBottom:40, position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:8 }}>
          <img src="/favicon.png" alt="ARLearn" style={{ width:64, height:64, objectFit:'contain', filter:'drop-shadow(0 0 16px rgba(0,229,255,0.3))', flexShrink:0 }}/>
          <div style={{ fontSize:'1.9rem', fontWeight:900, letterSpacing:'-0.04em', color:'#F0F8FF', lineHeight:1 }}>
            AR<span style={{ color:'#00C8E8' }}>Learn</span>
          </div>
        </div>
        <div style={{ fontSize:'0.65rem', fontWeight:600, letterSpacing:'0.16em', color:'#2A4A6B', textTransform:'uppercase' }}>
          Platform Tryout · XI ARTERI
        </div>
      </div>

      {/* ── FORM ── */}
      <div className="animate-fadeIn" style={{ width:'100%', maxWidth:380, position:'relative', zIndex:1 }}>

        {/* Email */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.12em', color: focusEmail ? '#00C8E8' : '#2A4A6B', marginBottom:8, transition:'color 0.2s', textTransform:'uppercase' }}>Email</div>
          <div style={{ position:'relative' }}>
            <input
              type="email" value={email}
              onChange={e=>setEmail(e.target.value)}
              onFocus={()=>setFocusEmail(true)}
              onBlur={()=>setFocusEmail(false)}
              onKeyDown={e=>e.key==='Enter'&&handleLogin()}
              placeholder="email@arlearn.id"
              style={{
                width:'100%', boxSizing:'border-box',
                padding:'14px 16px 14px 46px',
                background: focusEmail ? 'rgba(0,200,232,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${focusEmail ? 'rgba(0,200,232,0.4)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius:14, fontSize:'0.9rem', color:'#E2EBF0',
                outline:'none', transition:'all 0.2s',
              }}
            />
            <MI name="alternate_email" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:17, color: focusEmail ? '#00C8E8' : '#2A4A6B', transition:'color 0.2s', pointerEvents:'none' }}/>
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.12em', color: focusPass ? '#00C8E8' : '#2A4A6B', marginBottom:8, transition:'color 0.2s', textTransform:'uppercase' }}>Password</div>
          <div style={{ position:'relative' }}>
            <input
              type={showPass?'text':'password'} value={pass}
              onChange={e=>setPass(e.target.value)}
              onFocus={()=>setFocusPass(true)}
              onBlur={()=>setFocusPass(false)}
              onKeyDown={e=>e.key==='Enter'&&handleLogin()}
              placeholder="••••••••"
              style={{
                width:'100%', boxSizing:'border-box',
                padding:'14px 50px 14px 46px',
                background: focusPass ? 'rgba(0,200,232,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${focusPass ? 'rgba(0,200,232,0.4)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius:14, fontSize:'0.9rem', color:'#E2EBF0',
                outline:'none', transition:'all 0.2s',
              }}
            />
            <MI name="lock" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:17, color: focusPass ? '#00C8E8' : '#2A4A6B', transition:'color 0.2s', pointerEvents:'none' }}/>
            <button onClick={()=>setShowPass(s=>!s)}
              style={{ position:'absolute', right:0, top:0, bottom:0, width:46, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', color: showPass ? '#00C8E8' : '#2A4A6B', transition:'color 0.2s' }}>
              <MI name={showPass?'visibility':'visibility_off'} style={{ fontSize:19 }}/>
            </button>
          </div>
        </div>

        {/* Tombol masuk */}
        <button
          onClick={handleLogin} disabled={loading}
          style={{
            width:'100%', padding:'15px', borderRadius:14,
            background: loading ? 'rgba(0,200,232,0.08)' : '#00C8E8',
            border: loading ? '1px solid rgba(0,200,232,0.2)' : 'none',
            color: loading ? '#00C8E8' : '#05080F',
            fontSize:'0.95rem', fontWeight:800, letterSpacing:'0.02em',
            cursor: loading ? 'not-allowed' : 'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            transition:'all 0.2s', opacity: loading ? 0.7 : 1,
          }}
        >
          {loading
            ? <><div style={{ width:16, height:16, border:'2px solid rgba(0,200,232,0.3)', borderTopColor:'#00C8E8', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/><span>Masuk...</span></>
            : <span>Masuk</span>
          }
        </button>

        {/* Footer */}
        <div style={{ textAlign:'center', marginTop:32, fontSize:'0.65rem', fontWeight:600, letterSpacing:'0.14em', color:'#151E2B', textTransform:'uppercase' }}>
          XI ARTERI · 2026 / 2027
        </div>
      </div>

      <Alert {...alert} onOk={()=>setAlert({show:false})}/>
    </div>
  );
}

// ─── KELAS YANG TERSEDIA ───
const KELAS_ALL = ['X', 'XI', 'XII'];

// ─── BAB SELECTOR PAGE ───
function BabSelectorPage({ userName, onMulai }) {
  // bankData: { kimia: { XI: { bab1:{namaBab,jumlah}, ... }, XII: {...} }, ... }
  const [bankData, setBankData] = useState({});
  const [selMapel, setSelMapel] = useState(null);  // mapel yang dipilih (string)
  const [selKelas, setSelKelas] = useState(null);  // kelas yang dipilih ('XI','XII',dst)
  const [selBab,   setSelBab]   = useState(null);
  const [dropOpen, setDropOpen] = useState(false); // dropdown mapel
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetchMapelBab().then(list => {
      // Susun: bankData[mapel][kelas][bab] = {namaBab, jumlah}
      const map = {};
      list.forEach(({ mapel, kelas, bab, namaBab, jumlah }) => {
        if (!map[mapel]) map[mapel] = {};
        if (!map[mapel][kelas]) map[mapel][kelas] = {};
        map[mapel][kelas][bab] = { namaBab, jumlah };
      });
      setBankData(map);
      setLoading(false);
    });
  }, []);

  const mapelList = Object.keys(bankData); // ['kimia','fisika',...]

  // Kelas yang ada untuk mapel terpilih
  const kelasAda  = selMapel ? Object.keys(bankData[selMapel] || {}).sort() : [];

  // Bab list untuk mapel+kelas terpilih
  const babList   = (selMapel && selKelas) ? Object.entries(bankData[selMapel]?.[selKelas] || {}) : [];
  const totalKelas = (selMapel && selKelas)
    ? Object.values(bankData[selMapel]?.[selKelas] || {}).reduce((a,b)=>a+b.jumlah,0) : 0;
  const totalMapel = selMapel
    ? Object.values(bankData[selMapel]||{}).flatMap(k=>Object.values(k)).reduce((a,b)=>a+b.jumlah,0) : 0;

  const cfg = selMapel ? getCfg(selMapel) : null;

  const handleSelMapel = (mapel) => {
    setSelMapel(mapel); setSelKelas(null); setSelBab(null); setDropOpen(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor:'#00E5FF',borderTopColor:'transparent' }}/>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fadeIn">
      {/* Header */}
      <div className="mb-7">
        <h1 style={{ fontFamily:'"Poppins",serif',fontWeight:800,fontStyle:'italic',fontSize:'clamp(1.4rem,5vw,1.9rem)',color:'#F0F6FF',lineHeight:1.2 }}>
          Halo, {userName}! <MI name="waving_hand" style={{ color:'#F59E0B',fontSize:'1em',verticalAlign:'middle' }}/>
        </h1>
        <p className="text-sm mt-1" style={{ color:'#475569' }}>Pilih mata pelajaran, kelas, dan bab untuk tryout</p>
      </div>

      {/* ── STEP 1: DROPDOWN MATA PELAJARAN ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background:'linear-gradient(135deg,#F97316,#FB923C)',color:'#fff' }}>1</span>
          <span className="text-sm font-semibold" style={{ color:'#94A3B8' }}>Pilih Mata Pelajaran</span>
        </div>

        {/* Dropdown trigger */}
        <div className="relative">
          <button onClick={()=>setDropOpen(o=>!o)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all"
            style={{ background: selMapel ? getCfg(selMapel).bg : '#111827', border:`1.5px solid ${selMapel ? getCfg(selMapel).color : '#1E293B'}`, boxShadow: selMapel ? `0 0 20px ${getCfg(selMapel).glow}` : 'none' }}>
            {selMapel ? (
              <>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: getCfg(selMapel).bg, border:`1px solid ${getCfg(selMapel).border}` }}>
                  <MI name={getCfg(selMapel).icon} style={{ color:getCfg(selMapel).color, fontSize:20 }}/>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-sm" style={{ color: getCfg(selMapel).color }}>{getCfg(selMapel).label}</div>
                  <div className="text-xs" style={{ color:'#475569' }}>{totalMapel} soal tersedia</div>
                </div>
              </>
            ) : (
              <>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'#1E293B' }}>
                  <MI name="menu_book" style={{ color:'#475569', fontSize:20 }}/>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm" style={{ color:'#64748B' }}>Pilih mata pelajaran...</div>
                </div>
              </>
            )}
            <MI name={dropOpen?'expand_less':'expand_more'} style={{ color:'#64748B', fontSize:22, flexShrink:0 }}/>
          </button>

          {/* Dropdown menu */}
          {dropOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-20"
              style={{ background:'#0D1929', border:'1px solid #1E3A5F', boxShadow:'0 16px 48px rgba(0,0,0,0.7)' }}>
              {mapelList.map(mapel => {
                const mc = getCfg(mapel);
                const tot = Object.values(bankData[mapel]||{}).flatMap(k=>Object.values(k)).reduce((a,b)=>a+b.jumlah,0);
                const klsAda = Object.keys(bankData[mapel]||{}).sort().join(', ');
                return (
                  <button key={mapel} onClick={()=>handleSelMapel(mapel)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 transition-all"
                    style={{ background: selMapel===mapel ? mc.bg : 'transparent', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background:mc.bg, border:`1px solid ${mc.border}` }}>
                      <MI name={mc.icon} style={{ color:mc.color, fontSize:20 }}/>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold text-sm" style={{ color:mc.color }}>{mc.label}</div>
                      <div className="text-xs" style={{ color:'#475569' }}>Kelas {klsAda} · {tot} soal</div>
                    </div>
                    {selMapel===mapel && <MI name="check_circle" style={{ color:mc.color, fontSize:18, flexShrink:0 }}/>}
                  </button>
                );
              })}
              {/* Siluet mapel yang belum ada soal */}
              {Object.keys(MAPEL_CFG).filter(m=>m!=='default'&&!mapelList.includes(m)).map(mapel => {
                const mc = getCfg(mapel);
                return (
                  <div key={mapel} className="flex items-center gap-3 px-4 py-3.5 opacity-30"
                    style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', cursor:'not-allowed' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background:'#1E293B', border:'1px solid #2D3748' }}>
                      <MI name={mc.icon} style={{ color:'#334155', fontSize:20 }}/>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold text-sm" style={{ color:'#334155' }}>{mc.label}</div>
                      <div className="text-xs" style={{ color:'#1E293B' }}>Belum ada soal</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── STEP 2: PILIH KELAS ── */}
      <div className={`mb-6 transition-all duration-300 ${selMapel?'opacity-100':'opacity-40 pointer-events-none'}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background:selMapel?'linear-gradient(135deg,#F97316,#FB923C)':'#1E293B', color:selMapel?'#fff':'#475569' }}>2</span>
          <span className="text-sm font-semibold" style={{ color:selMapel?'#94A3B8':'#334155' }}>Pilih Kelas</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {KELAS_ALL.map(kls => {
            const ada    = kelasAda.includes(kls);
            const isActive = selKelas === kls;
            const jumlah = ada
              ? Object.values(bankData[selMapel]?.[kls]||{}).reduce((a,b)=>a+b.jumlah,0)
              : 0;
            return (
              <button key={kls}
                onClick={()=>{ if(ada){ setSelKelas(kls); setSelBab(null); } }}
                disabled={!ada}
                className="flex flex-col items-center py-4 rounded-2xl transition-all duration-200"
                style={{
                  background: isActive ? cfg?.bg : ada ? '#111827' : '#0A1222',
                  border:`1.5px solid ${isActive ? cfg?.color : ada ? '#1E293B' : '#111827'}`,
                  boxShadow: isActive ? `0 0 20px ${cfg?.glow}` : 'none',
                  opacity: ada ? 1 : 0.35,
                  cursor: ada ? 'pointer' : 'not-allowed',
                }}>
                {/* Ikon kelas */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                  style={{ background: isActive ? cfg?.bg : ada ? '#1E293B' : '#111827', border:`1px solid ${isActive ? cfg?.border : ada ? '#2D3748' : '#1A1A2E'}` }}>
                  {ada
                    ? <MI name="school" style={{ color: isActive ? cfg?.color : '#64748B', fontSize:20 }}/>
                    : <MI name="lock" style={{ color:'#1E293B', fontSize:18 }}/>
                  }
                </div>
                <div className="font-black text-sm" style={{ color: isActive ? cfg?.color : ada ? '#E2E8F0' : '#2D3748' }}>
                  Kelas {kls}
                </div>
                <div className="text-xs mt-0.5" style={{ color: ada ? '#475569' : '#1E293B' }}>
                  {ada ? `${jumlah} soal` : 'Belum ada'}
                </div>
                {isActive && (
                  <div className="mt-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: cfg?.color }}>
                    <MI name="check" style={{ color:'#050B18', fontSize:14 }}/>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── STEP 3: PILIH BAB ── */}
      <div className={`mb-6 transition-all duration-300 ${selKelas?'opacity-100':'opacity-40 pointer-events-none'}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background:selKelas?'linear-gradient(135deg,#F97316,#FB923C)':'#1E293B', color:selKelas?'#fff':'#475569' }}>3</span>
          <span className="text-sm font-semibold" style={{ color:selKelas?'#94A3B8':'#334155' }}>
            {selKelas ? `Pilih Bab — ${cfg?.label} Kelas ${selKelas} (${totalKelas} soal)` : 'Pilih Bab'}
          </span>
        </div>

        {selKelas ? (
          <div className="space-y-2">
            {[['__all__',{ namaBab:'Semua Bab', jumlah:totalKelas }], ...babList].map(([babKey,{namaBab,jumlah}], idx) => {
              const isActive = selBab === babKey;
              return (
                <button key={babKey} onClick={()=>setSelBab(babKey)}
                  className="w-full flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-200"
                  style={{ background:isActive?cfg.bg:'#111827', border:`1.5px solid ${isActive?cfg.color:'#1E293B'}`, boxShadow:isActive?`0 0 16px ${cfg.glow}`:'none' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background:isActive?cfg.bg:'#1E293B', border:`1px solid ${isActive?cfg.border:'#2D3748'}`, color:isActive?cfg.color:'#64748B' }}>
                    {babKey==='__all__' ? <MI name="layers" style={{fontSize:16}}/> : idx}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold" style={{ color:isActive?cfg.color:'#E2E8F0' }}>{namaBab}</div>
                    <div className="text-xs mt-0.5" style={{ color:'#475569' }}>{jumlah} soal</div>
                  </div>
                  {isActive && <MI name="check_circle" style={{ color:cfg.color, fontSize:20 }}/>}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl p-6 text-center" style={{ background:'#0D1526', border:'1px dashed #1E293B' }}>
            <MI name="arrow_upward" style={{ color:'#334155', fontSize:28, display:'block', margin:'0 auto 8px' }}/>
            <span className="text-sm" style={{ color:'#334155' }}>Pilih kelas terlebih dahulu</span>
          </div>
        )}
      </div>

      {/* ── CTA MULAI ── */}
      {selMapel && selKelas && selBab ? (
        <button onClick={()=>onMulai({ mapel:selMapel, kelas:selKelas, bab:selBab })}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
          style={{ background:'linear-gradient(135deg,#F97316,#FB923C)',color:'#fff',boxShadow:'0 0 24px rgba(249,115,22,0.4)' }}>
          <MI name="play_arrow" style={{fontSize:20}}/>Mulai Tryout
        </button>
      ) : (
        <div className="rounded-2xl py-4 text-center" style={{ background:'#0D1526', border:'1px dashed #1E293B' }}>
          <span className="text-sm" style={{ color:'#334155' }}>Selesaikan pilihan di atas untuk mulai tryout</span>
        </div>
      )}
    </div>
  );
}

// ─── MODAL HASIL TRYOUT ───
function ModalHasil({ show, soal, jawabanUser, onLagi, onRiwayat }) {
  const [tab, setTab] = useState('ringkasan');
  const [filterSalah, setFilterSalah] = useState(false);
  useEffect(()=>{ if(show){ setTab('ringkasan'); setFilterSalah(false); } },[show]);
  if (!show || !soal) return null;

  const benar = soal.filter((s,i)=>jawabanUser[i]===s.jawabanBenar).length;
  const salah  = soal.length - benar;
  const skor   = Math.round((benar/soal.length)*100);
  const sc = skor>=80?'#10B981':skor>=60?'#F59E0B':'#EF4444';
  const si = skor>=80?'emoji_events':skor>=60?'thumb_up':'fitness_center';
  const sl = skor>=80?'Luar Biasa!':skor>=60?'Cukup Baik':'Terus Berlatih';
  const displaySoal = filterSalah ? soal.map((s,i)=>({...s,idx:i})).filter(s=>jawabanUser[s.idx]!==s.jawabanBenar) : soal.map((s,i)=>({...s,idx:i}));

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto py-4 px-4" style={{ background:'rgba(0,0,0,0.88)',backdropFilter:'blur(12px)' }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden animate-fadeIn" style={{ background:'#111827',border:'1px solid rgba(0,229,255,0.15)',boxShadow:'0 24px 80px rgba(0,0,0,0.7)' }}>
        <div className="p-6 text-center" style={{ borderBottom:'1px solid #1E293B' }}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-3" style={{ background:`${sc}15`,border:`2px solid ${sc}35` }}>
            <span className="font-black text-3xl" style={{ color:sc }}>{skor}</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <MI name={si} style={{ color:sc, fontSize:16 }}/><span className="text-sm font-bold" style={{ color:sc }}>{sl}</span>
          </div>
          <h2 className="font-black text-2xl" style={{ color:'#F0F6FF' }}>Hasil Tryout</h2>
          <div className="flex justify-center gap-8 mt-5">
            {[{l:'Benar',v:benar,c:'#10B981',i:'check_circle'},{l:'Salah',v:salah,c:'#EF4444',i:'cancel'},{l:'Skor',v:skor+'%',c:sc,i:'star'}].map(s=>(
              <div key={s.l} className="text-center"><MI name={s.i} style={{ color:s.c, fontSize:14, display:'block', marginBottom:4 }}/><div className="font-black text-2xl" style={{ color:s.c }}>{s.v}</div><div className="text-xs" style={{ color:'#64748B' }}>{s.l}</div></div>
            ))}
          </div>
        </div>
        <div className="flex" style={{ borderBottom:'1px solid #1E293B' }}>
          {[{k:'ringkasan',i:'pie_chart',l:'Ringkasan'},{k:'pembahasan',i:'menu_book',l:'Pembahasan'}].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} className="flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{ color:tab===t.k?'#F97316':'#475569',borderBottom:tab===t.k?'2px solid #F97316':'2px solid transparent' }}>
              <MI name={t.i} style={{fontSize:14}}/>{t.l}
            </button>
          ))}
        </div>
        <div className="p-4 max-h-[55vh] overflow-y-auto">
          {tab==='ringkasan' && (
            <div className="space-y-2">
              {Object.entries(soal.reduce((acc,s,i)=>{ const m=s.mapel||'default'; if(!acc[m])acc[m]={benar:0,total:0}; acc[m].total++; if(jawabanUser[i]===s.jawabanBenar)acc[m].benar++; return acc; },{})).map(([mapel,stat])=>{
                const c=getCfg(mapel); const pct=Math.round((stat.benar/stat.total)*100);
                return (<div key={mapel} className="rounded-xl p-4" style={{ background:'#0B1121',border:'1px solid #1E293B' }}>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold flex items-center gap-1.5" style={{ color:c.color }}><MI name={c.icon} style={{fontSize:14}}/>{c.labelUp}</span>
                    <span className="text-xs font-bold" style={{ color:c.color }}>{stat.benar}/{stat.total} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'#1E293B' }}><div className="h-full rounded-full" style={{ width:`${pct}%`,background:c.color }}/></div>
                </div>);
              })}
            </div>
          )}
          {tab==='pembahasan' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                {[{f:false,l:`Semua (${soal.length})`,c:'#00E5FF'},{f:true,l:`Salah (${salah})`,c:'#EF4444'}].map(({f,l,c})=>(
                  <button key={String(f)} onClick={()=>setFilterSalah(f)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background:filterSalah===f?`${c}22`:'#1E293B',color:filterSalah===f?c:'#64748B',border:filterSalah===f?`1px solid ${c}44`:'1px solid #2D3748' }}>{l}</button>
                ))}
              </div>
              <div className="space-y-3">
                {displaySoal.map(s=>{
                  const i=s.idx; const isB=jawabanUser[i]===s.jawabanBenar; const c=getCfg(s.mapel);
                  return (<div key={i} className="rounded-xl p-4" style={{ background:'#0B1121',border:`1px solid ${isB?'rgba(16,185,129,0.2)':'rgba(239,68,68,0.2)'}` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold" style={{ color:c.color }}>{c.labelUp}</span>
                      <span className="text-xs" style={{ color:'#475569' }}>Soal {i+1}</span>
                      <span className="ml-auto"><MI name={isB?'check_circle':'cancel'} style={{ color:isB?'#10B981':'#EF4444', fontSize:18 }}/></span>
                    </div>
                    <div className="text-sm mb-2" style={{ color:'#D1D5DB' }}><Latex text={s.teks}/></div>
                    {s.gambar && (
                      <div className="mt-2 mb-2 rounded-xl overflow-hidden" style={{ border:'1px solid #1E3A5F' }}>
                        <img src={s.gambar} alt="Gambar soal" style={{ width:'100%', display:'block', borderRadius:10 }}/>
                      </div>
                    )}
                    {s.pilihan.map((opt,j)=>{ const isK=j===s.jawabanBenar; const isP=j===jawabanUser[i]; let col=isK?'#10B981':isP&&!isK?'#EF4444':'#475569';
                      return (<div key={j} className="flex items-start gap-2 mt-1 text-xs py-0.5" style={{ color:col }}><span className="font-bold w-5 flex-shrink-0">{OPTS[j]}.</span><span className="flex-1"><Latex text={opt}/></span>{isK&&<MI name="check" style={{fontSize:14}}/>}{isP&&!isK&&<MI name="close" style={{fontSize:14}}/>}</div>);
                    })}
                    {s.penjelasan&&<div className="mt-2 pt-2 text-xs" style={{ color:'#64748B',borderTop:'1px solid #1E293B' }}>
                      <span className="font-bold flex items-center gap-1 mb-0.5" style={{ color:'#00E5FF' }}><MI name="lightbulb" style={{fontSize:13}}/>Penjelasan</span>
                      <Latex text={s.penjelasan}/>
                    </div>}
                  </div>);
                })}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 p-4" style={{ borderTop:'1px solid #1E293B' }}>
          <button onClick={onRiwayat} className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{ background:'#1E293B',color:'#94A3B8',border:'1px solid #2D3748' }}><MI name="history" style={{fontSize:16}}/>Riwayat</button>
          <button onClick={onLagi} className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{ background:'linear-gradient(135deg,#F97316,#FB923C)',color:'#fff' }}><MI name="replay" style={{fontSize:16}}/>Tryout Lagi</button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD TRYOUT ───
function DashboardTryout({ userId, userName, filter, onBack, onGoRiwayat }) {
  const [soalList, setSoalList]     = useState([]);
  const [currIdx, setCurrIdx]       = useState(0);
  const [jawaban, setJawaban]       = useState({});
  const [showHasil, setShowHasil]   = useState(false);
  const [alertSelesai, setAlert]    = useState(false);
  const [animKey, setAnimKey]       = useState(0);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    setLoading(true); setJawaban({}); setCurrIdx(0);
    fetchSoal(filter?.mapel, filter?.kelas, filter?.bab).then(list=>{ setSoalList(list); setLoading(false); });
  }, [filter]);

  const total        = soalList.length;
  const terjawab     = Object.keys(jawaban).length;
  const soal         = soalList[currIdx];
  const sudahDijawab = jawaban[currIdx] !== undefined;
  const pilihanUser  = jawaban[currIdx];
  const jawabBenar   = soal?.jawabanBenar;
  const mapelCfg     = getCfg(soal?.mapel || filter?.mapel);

  const goTo  = (i) => { setCurrIdx(i); setAnimKey(k=>k+1); };
  const pilih = (j) => { if(sudahDijawab) return; setJawaban(p=>({...p,[currIdx]:j})); };

  const selesai = async () => {
    setAlert(false);
    const benar = soalList.filter((s,i)=>jawaban[i]===s.jawabanBenar).length;
    const salah  = total - benar;
    const skor   = Math.round((benar/total)*100);
    await saveRiwayat(userId, { mapel:filter?.mapel, kelas:filter?.kelas, bab:filter?.bab, namaBab:soalList[0]?.namaBab, totalSoal:total, benar, salah, skor, detail:jawaban, soalList });
    setShowHasil(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor:'#00E5FF',borderTopColor:'transparent' }}/></div>;

  if (!soal) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4" style={{ color:'#64748B' }}>
      <MI name="inventory_2" style={{fontSize:40}}/>
      <p className="text-sm">Tidak ada soal untuk bab ini.</p>
      <button onClick={onBack} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ background:'linear-gradient(135deg,#F97316,#FB923C)',color:'#fff' }}>
        <MI name="arrow_back" style={{fontSize:14}}/>Kembali
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fadeIn">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold"
          style={{ background:'#111827',color:'#94A3B8',border:'1px solid #1E293B' }}>
          <MI name="arrow_back" style={{fontSize:14}}/>Ganti Bab
        </button>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background:mapelCfg.bg,color:mapelCfg.color,border:`1px solid ${mapelCfg.border}` }}>
          {soalList[0]?.namaBab || mapelCfg.label}{filter?.kelas ? ` · Kelas ${filter.kelas}` : ''}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {[{i:'menu_book',l:'Total Soal',v:total,c:'#00E5FF'},{i:'check_circle',l:'Terjawab',v:terjawab,c:'#10B981'},{i:'local_fire_department',l:'Mapel',v:mapelCfg.label,c:'#F59E0B'}].map(s=>(
          <div key={s.l} className="rounded-xl p-4" style={{ background:'#111827' }}>
            <MI name={s.i} style={{ color:s.c, fontSize:22, display:'block', marginBottom:8 }}/><div className="font-black text-xl" style={{ color:s.c }}>{s.v}</div><div className="text-xs mt-0.5" style={{ color:'#475569' }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 p-4 rounded-2xl" style={{ background:'#111827',border:'1px solid #1E293B' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color:'#94A3B8' }}>Progress</span>
          <span className="text-sm font-bold" style={{ color:'#F97316' }}>{terjawab}/{total}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'#1E293B' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width:`${total>0?(terjawab/total)*100:0}%`,background:'linear-gradient(90deg,#F97316,#FB923C)' }}/>
        </div>
        <div className="flex gap-1.5 mt-3 flex-wrap" style={{ maxHeight:120,overflowY:'auto' }}>
          {soalList.map((_,i)=>{
            const isDone=jawaban[i]!==undefined; const isB=isDone&&jawaban[i]===soalList[i]?.jawabanBenar; const isCur=i===currIdx;
            return (<button key={i} onClick={()=>goTo(i)} className="w-7 h-7 rounded-lg text-xs font-bold transition-all"
              style={{ background:isCur?'linear-gradient(135deg,#F97316,#FB923C)':isDone?isB?'rgba(16,185,129,0.2)':'rgba(239,68,68,0.2)':'#1E293B', color:isCur?'#050B18':isDone?isB?'#10B981':'#EF4444':'#475569', border:isCur?'none':isDone?isB?'1px solid rgba(16,185,129,0.3)':'1px solid rgba(239,68,68,0.3)':'1px solid #2D3748' }}>{i+1}</button>);
          })}
        </div>
      </div>

      <div key={animKey} className="rounded-2xl mb-4 overflow-hidden animate-fadeSlide" style={{ background:'#111827',border:'1px solid #1E293B',boxShadow:'0 4px 24px rgba(0,0,0,0.4)' }}>
        <div className="flex items-center justify-between px-5 pt-4 pb-0">
          <span className="text-sm font-medium" style={{ color:'#64748B' }}>Soal {currIdx+1}/{total}</span>
          <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background:mapelCfg.bg,color:mapelCfg.color,border:`1px solid ${mapelCfg.border}` }}>{mapelCfg.labelUp}</span>
        </div>
        <div className="mx-5 mt-2 h-[3px] rounded-full overflow-hidden" style={{ background:'#1E293B' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width:`${((currIdx+1)/total)*100}%`,background:'#F97316' }}/>
        </div>
        <div className="px-5 pt-5 pb-4">
          <div className="font-semibold text-base sm:text-lg leading-relaxed text-center" style={{ color:'#F0F6FF',minHeight:80 }}><Latex text={soal.teks}/></div>
          {soal.gambar && (
            <div className="mt-3 rounded-xl overflow-hidden" style={{ border:'1px solid #1E3A5F' }}>
              <img src={soal.gambar} alt="Gambar soal" style={{ width:'100%', display:'block', borderRadius:12 }}/>
            </div>
          )}
        </div>
        <div className="px-4 pb-4 space-y-2.5">
          {soal.pilihan.map((opt,j)=>{
            const isK=j===jawabBenar; const isP=j===pilihanUser; const isW=sudahDijawab&&isP&&!isK; const isC=sudahDijawab&&isK;
            let bg='#0B1121',border='#1E293B',txt='#94A3B8',lbg='#1E293B',lcol='#64748B';
            if(sudahDijawab){ if(isC){bg='rgba(16,185,129,0.08)';border='#10B981';txt='#10B981';lbg='rgba(16,185,129,0.2)';lcol='#10B981';} else if(isW){bg='rgba(239,68,68,0.08)';border='#EF4444';txt='#EF4444';lbg='rgba(239,68,68,0.2)';lcol='#EF4444';} }
            else if(isP){bg='rgba(0,229,255,0.08)';border='#00E5FF';txt='#F0F6FF';lbg='rgba(0,229,255,0.2)';lcol='#00E5FF';}
            return (<div key={j} onClick={()=>pilih(j)} className="flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all" style={{ background:bg,border:`1.5px solid ${border}`,cursor:sudahDijawab?'default':'pointer' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm" style={{ background:lbg,color:lcol }}>{OPTS[j]}</div>
              <span className="flex-1 text-sm leading-relaxed" style={{ color:txt }}><Latex text={opt}/></span>
              {sudahDijawab&&isC&&<MI name="check_circle" style={{ color:'#10B981', fontSize:20 }}/>}
              {sudahDijawab&&isW&&<MI name="cancel" style={{ color:'#EF4444', fontSize:20 }}/>}
            </div>);
          })}
        </div>
        {sudahDijawab&&soal.penjelasan&&(
          <PenjelasanBox penjelasan={soal.penjelasan} pembahasan={soal.pembahasan}/>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <button onClick={()=>goTo(currIdx-1)} disabled={currIdx===0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-30"
          style={{ minWidth:120,background:'#111827',color:'#94A3B8',border:'1px solid #1E293B' }}>
          <MI name="chevron_left" style={{fontSize:16}}/>Sebelumnya
        </button>
        <span className="text-xs" style={{ color:'#334155' }}>{currIdx+1}/{total}</span>
        <button onClick={()=>goTo(currIdx+1)} disabled={currIdx===total-1}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-30"
          style={{ minWidth:120,background:'#111827',color:'#94A3B8',border:'1px solid #1E293B' }}>
          Selanjutnya<MI name="chevron_right" style={{fontSize:16}}/>
        </button>
      </div>

      <div className="mt-2 mb-24">
        {terjawab===total&&total>0 ? (
          <button onClick={()=>setAlert(true)} className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
            style={{ background:'linear-gradient(135deg,#F97316,#FB923C)',color:'#fff',boxShadow:'0 0 24px rgba(249,115,22,0.4)' }}>
            <MI name="check_circle" style={{fontSize:22}}/>Selesai Tryout
          </button>
        ) : (
          <p className="text-center text-xs py-2" style={{ color:'#334155' }}>Jawab semua soal · <span style={{ color:'#475569' }}>{terjawab}/{total} terjawab</span></p>
        )}
      </div>

      <Alert show={alertSelesai} tipe="confirm" judul="Selesaikan Tryout?" pesan={`Kamu telah menjawab ${total} soal. Yakin selesaikan?`}
        yesLabel="Ya, Selesaikan" noLabel="Cek Lagi" onYes={selesai} onNo={()=>setAlert(false)}/>
      <ModalHasil show={showHasil} soal={soalList} jawabanUser={jawaban} onLagi={onBack} onRiwayat={()=>{ setShowHasil(false); onGoRiwayat(); }}/>
    </div>
  );
}

// ─── RIWAYAT PAGE ───

// ── Detail Soal Modal (slide dari bawah) ──
function SoalDetailPanel({ soal, onClose }) {
  if (!soal) return null;
  const idx         = soal._idx;
  // _jawabanUser disisipkan langsung di object soal saat setSelSoal
  const jawabanIdx  = soal._jawabanUser;
  const isBenar     = jawabanIdx === soal.jawabanBenar;
  const mapelCfg  = getCfg(soal.mapel);
  return createPortal(
    <div style={{ position:'fixed',inset:0,zIndex:10000,display:'flex',flexDirection:'column',justifyContent:'flex-end',background:'rgba(0,0,0,0.75)',backdropFilter:'blur(8px)',animation:'alertFadeIn 0.18s ease both' }}
      onClick={onClose}>
      <div style={{ background:'#111827',borderRadius:'20px 20px 0 0',border:'1px solid rgba(0,229,255,0.18)',maxHeight:'88vh',overflowY:'auto',boxShadow:'0 -16px 60px rgba(0,0,0,0.7)' }}
        onClick={e=>e.stopPropagation()}>

        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width:40,height:4,borderRadius:4,background:'#2D3748' }}/>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom:'1px solid #1E293B' }}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background:mapelCfg.bg,color:mapelCfg.color,border:`1px solid ${mapelCfg.border}` }}>
              {mapelCfg.labelUp}
            </span>
            <span className="text-xs font-semibold" style={{ color:'#475569' }}>Soal {idx+1}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background:isBenar?'rgba(16,185,129,0.12)':'rgba(239,68,68,0.12)', color:isBenar?'#10B981':'#EF4444', border:`1px solid ${isBenar?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}` }}>
              <MI name={isBenar?'check_circle':'cancel'} style={{fontSize:13}}/>
              {isBenar?'Benar':'Salah'}
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:'#1E293B',color:'#64748B' }}>
              <MI name="close" style={{fontSize:18}}/>
            </button>
          </div>
        </div>

        {/* Teks Soal */}
        <div className="px-5 py-4">
          <div className="font-semibold text-base leading-relaxed" style={{ color:'#F0F6FF' }}>
            <Latex text={soal.teks}/>
            {soal.gambar && (
              <div className="mt-3 rounded-xl overflow-hidden" style={{ border:'1px solid #1E3A5F' }}>
                <img src={soal.gambar} alt="Gambar soal" style={{ width:'100%', display:'block', borderRadius:10 }}/>
              </div>
            )}
          </div>
        </div>

        {/* Pilihan */}
        <div className="px-4 pb-4 space-y-2">
          {soal.pilihan.map((opt, j) => {
            const isK = j === soal.jawabanBenar;
            const isP = j === jawabanIdx;
            const isW = isP && !isK;
            let bg='#0B1121', border='#1E293B', txt='#94A3B8', lbg='#1E293B', lcol='#64748B';
            if (isK)      { bg='rgba(16,185,129,0.08)';  border='#10B981'; txt='#10B981'; lbg='rgba(16,185,129,0.2)';  lcol='#10B981'; }
            else if (isW) { bg='rgba(239,68,68,0.08)';   border='#EF4444'; txt='#EF4444'; lbg='rgba(239,68,68,0.2)';   lcol='#EF4444'; }
            return (
              <div key={j} className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
                style={{ background:bg, border:`1.5px solid ${border}` }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm"
                  style={{ background:lbg, color:lcol }}>{OPTS[j]}</div>
                <span className="flex-1 text-sm leading-relaxed" style={{ color:txt }}><Latex text={opt}/></span>
                {isK && <MI name="check_circle" style={{ color:'#10B981', fontSize:20 }}/>}
                {isW && <MI name="cancel" style={{ color:'#EF4444', fontSize:20 }}/>}
              </div>
            );
          })}
        </div>

        {/* Penjelasan lengkap */}
        {soal.penjelasan && (
          <div className="mx-4 mb-6">
            <PenjelasanBox penjelasan={soal.penjelasan} pembahasan={soal.pembahasan}/>
          </div>
        )}
      </div>
    </div>, document.body
  );
}

function DetailModal({ show, data, onClose }) {
  const [selSoal, setSelSoal] = useState(null); // soal yang diklik untuk lihat penjelasan
  const [filterSalah, setFilterSalah] = useState(false);
  useEffect(() => { if (!show) { setSelSoal(null); setFilterSalah(false); } }, [show]);

  if (!show || !data) return null;
  const sc = (s) => s>=80?'#10B981':s>=60?'#F59E0B':'#EF4444';

  // Rekonstruksi daftar soal dari data.detail (simpan jawaban user per index)
  // data.detail = { 0: jawabanIdx, 1: jawabanIdx, ... }
  const detailArr = Object.entries(data.detail||{}).map(([i, jawaban]) => ({
    _idx: parseInt(i), jawaban,
  }));

  // Soal yang tersimpan di data (jika ada field soal_snapshot) atau dari detail saja
  // Kita gunakan data.soal_list jika ada, fallback ke null (hanya tampil nomor)
  // soal_list dari Supabase JSONB — sudah auto-parse, tapi safety check
  const soalList = Array.isArray(data.soal_list)
    ? data.soal_list
    : (typeof data.soal_list === 'string'
        ? (() => { try { return JSON.parse(data.soal_list); } catch(e) { return null; } })()
        : null);
  const jumlahSoal = data.total_soal || detailArr.length;

  // Build display list
  // data.detail key bisa berupa string ("0","1",...) karena JSON parse dari Supabase
  const detailNorm = {};
  Object.entries(data.detail||{}).forEach(([k,v]) => { detailNorm[parseInt(k)] = v; });

  const displayItems = Array.from({ length: jumlahSoal }, (_, i) => {
    const snap = soalList ? soalList[i] : null;
    const jawabanUser = detailNorm[i];
    const isBenar = snap != null && jawabanUser !== undefined ? jawabanUser === snap.jawabanBenar : null;
    return { _idx: i, jawabanUser, isBenar, ...(snap||{}) };
  });

  const filtered = filterSalah ? displayItems.filter(s => s.isBenar === false) : displayItems;

  const portal = createPortal(
    <div style={{ position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'1rem',overflowY:'auto',background:'rgba(5,11,24,0.92)',backdropFilter:'blur(12px)',animation:'alertFadeIn 0.18s ease both' }}
      onClick={onClose}>
      <div style={{ width:'100%',maxWidth:640,borderRadius:20,overflow:'hidden',background:'#111827',border:'1px solid rgba(0,229,255,0.18)',boxShadow:'0 24px 80px rgba(0,0,0,0.75)',marginTop:8 }}
        onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 sticky top-0" style={{ background:'#111827',borderBottom:'1px solid #1E293B',zIndex:2 }}>
          <div>
            <h2 className="font-bold text-base flex items-center gap-2" style={{ color:'#F0F6FF' }}>
              <MI name="bar_chart" style={{ color:'#00E5FF', fontSize:18 }}/>Detail Riwayat
            </h2>
            <p className="text-xs mt-0.5" style={{ color:'#64748B' }}>{formatTgl(data.tanggal)}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color:'#64748B' }}>
            <MI name="close" style={{fontSize:18}}/>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 p-4 pb-3">
          {[{l:'Skor',v:data.skor,c:'#00E5FF',i:'star'},{l:'Benar',v:data.benar,c:'#10B981',i:'check_circle'},{l:'Salah',v:data.salah,c:'#EF4444',i:'cancel'}].map(s=>(
            <div key={s.l} className="rounded-xl p-3 text-center" style={{ background:'#0B1121',border:'1px solid #1E293B' }}>
              <MI name={s.i} style={{ color:s.c, fontSize:22, display:'block', margin:'0 auto 4px' }}/>
              <div className="font-black text-xl" style={{ color:s.c }}>{s.v}</div>
              <div className="text-xs" style={{ color:'#64748B' }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Daftar soal */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color:'#475569' }}>
              <MI name="checklist" style={{fontSize:14}}/>Daftar Soal
              {soalList && <span style={{ color:'#334155' }}>· Klik soal untuk lihat penjelasan</span>}
            </p>
            {soalList && (
              <div className="flex items-center gap-1">
                {[{f:false,l:'Semua',c:'#00E5FF'},{f:true,l:'Salah',c:'#EF4444'}].map(({f,l,c})=>(
                  <button key={String(f)} onClick={()=>setFilterSalah(f)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                    style={{ background:filterSalah===f?`${c}22`:'#1E293B', color:filterSalah===f?c:'#64748B', border:filterSalah===f?`1px solid ${c}44`:'1px solid #2D3748' }}>
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          {soalList ? (
            // ── Ada soal_list: tampil kartu soal yang bisa diklik ──
            <div className="space-y-2">
              {filtered.map((s) => {
                const mc = getCfg(s.mapel);
                const hasSnap = !!s.teks;
                return (
                  <button key={s._idx}
                    onClick={() => hasSnap ? setSelSoal({...s, _jawabanUser: detailNorm[s._idx]}) : null}
                    disabled={!hasSnap}
                    className="w-full text-left rounded-xl px-4 py-3 transition-all group"
                    style={{
                      background: s.isBenar===true ? 'rgba(16,185,129,0.05)' : s.isBenar===false ? 'rgba(239,68,68,0.05)' : '#0B1121',
                      border: `1px solid ${s.isBenar===true?'rgba(16,185,129,0.2)':s.isBenar===false?'rgba(239,68,68,0.2)':'#1E293B'}`,
                      cursor: hasSnap ? 'pointer' : 'default',
                    }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ background:'#1E293B', color:'#64748B' }}>{s._idx+1}</span>
                      <span className="text-xs font-bold" style={{ color:mc.color }}>{mc.labelUp}</span>
                      <span className="ml-auto flex items-center gap-1 text-xs font-bold"
                        style={{ color:s.isBenar===true?'#10B981':s.isBenar===false?'#EF4444':'#475569' }}>
                        <MI name={s.isBenar===true?'check_circle':s.isBenar===false?'cancel':'help'} style={{fontSize:14}}/>
                        {s.isBenar===true?'Benar':s.isBenar===false?'Salah':'—'}
                      </span>
                      {hasSnap && (
                        <MI name="chevron_right" style={{ color:'#334155', fontSize:18, transition:'transform 0.2s' }}
                          className="group-hover:translate-x-0.5"/>
                      )}
                    </div>
                    {hasSnap && (
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color:'#64748B' }}>
                        <Latex text={s.teks}/>
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            // ── Tidak ada soal_list: tampil ringkasan angka saja ──
            <div className="rounded-xl p-4" style={{ background:'#0B1121',border:'1px solid #1E293B' }}>
              <p className="text-xs" style={{ color:'#475569' }}>
                Skor: <strong style={{ color:sc(data.skor) }}>{data.skor}</strong> · {data.benar} benar · {data.salah} salah dari {jumlahSoal} soal
              </p>
              <p className="text-xs mt-2" style={{ color:'#334155' }}>
                Detail soal tidak tersedia untuk tryout ini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>, document.body
  );
  return (
    <>
      {portal}
      {selSoal && (
        <SoalDetailPanel
          soal={selSoal}
          onClose={()=>setSelSoal(null)}
        />
      )}
    </>
  );
}

function RiwayatPage({ userId }) {
  const [riwayat, setRiwayat]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [deleteTarget, setDelTarget]= useState(null);
  const [detailData, setDetail]     = useState(null);
  const sc = (s)=>s>=80?'#10B981':s>=60?'#F59E0B':'#EF4444';
  const si = (s)=>s>=80?'emoji_events':s>=60?'thumb_up':'fitness_center';

  useEffect(()=>{ fetchRiwayat(userId).then(d=>{ setRiwayat(d); setLoading(false); }); },[userId]);

  const konfirmasiDelete = async () => {
    await hapusRiwayat(deleteTarget); setRiwayat(r=>r.filter(x=>x.id!==deleteTarget)); setDelTarget(null);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor:'#00E5FF',borderTopColor:'transparent' }}/></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 animate-fadeIn">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-black text-xl flex items-center gap-2" style={{ color:'#F0F6FF' }}><MI name="history" style={{ color:'#00E5FF', fontSize:22 }}/>Riwayat Tryout</h1>
          <p className="text-xs mt-0.5 pl-7" style={{ color:'#475569' }}>{riwayat.length} percobaan tersimpan</p>
        </div>
      </div>
      {riwayat.length===0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ background:'#111827',border:'1px solid #1E293B' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background:'#1E293B' }}><MI name="inbox" style={{ color:'#334155', fontSize:32 }}/></div>
          <p className="font-bold text-base mb-1" style={{ color:'#475569' }}>Belum Ada Riwayat</p>
          <p className="text-sm" style={{ color:'#334155' }}>Selesaikan tryout pertamamu!</p>
        </div>
      ) : (
        <div className="space-y-3 pb-4">
          {riwayat.map(item=>(
            <div key={item.id} className="rounded-2xl overflow-hidden" style={{ background:'#111827',border:'1px solid #1A2235' }}>
              <div className="h-1" style={{ background:sc(item.skor) }}/>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs" style={{ color:'#64748B' }}><MI name="calendar_today" style={{fontSize:12}}/><span>{formatTgl(item.tanggal)}</span></div>
                  <div className="flex items-center gap-1.5"><MI name={si(item.skor)} style={{ color:sc(item.skor), fontSize:14 }}/><span className="font-black text-2xl" style={{ color:sc(item.skor) }}>{item.skor}</span><span className="text-xs" style={{ color:'#334155' }}>/100</span></div>
                </div>
                <div className="flex gap-2 mb-3">
                  {[{l:'Benar',v:item.benar,c:'#10B981',i:'check_circle'},{l:'Salah',v:item.salah,c:'#EF4444',i:'cancel'},{l:'Soal',v:item.total_soal,c:'#64748B',i:'layers'}].map(s=>(
                    <div key={s.l} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl" style={{ background:`${s.c}0D`,border:`1px solid ${s.c}25` }}>
                      <MI name={s.i} style={{ color:s.c, fontSize:13 }}/><span className="font-bold text-sm" style={{ color:s.c }}>{s.v}</span><span className="text-xs" style={{ color:'#475569' }}>{s.l}</span>
                    </div>
                  ))}
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background:'#1E293B' }}><div className="h-full rounded-full" style={{ width:`${item.skor}%`,background:sc(item.skor) }}/></div>
                <div className="flex gap-2">
                  <button onClick={()=>setDetail(item)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                    style={{ background:'rgba(0,229,255,0.08)',color:'#00E5FF',border:'1px solid rgba(0,229,255,0.15)' }}><MI name="search" style={{fontSize:14}}/>Lihat Detail</button>
                  <button onClick={()=>setDelTarget(item.id)} className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background:'rgba(239,68,68,0.08)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.15)' }}><MI name="delete" style={{fontSize:15}}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Alert show={!!deleteTarget} tipe="confirm" judul="Hapus Riwayat?" pesan="Riwayat ini akan dihapus permanen."
        yesLabel="Hapus" noLabel="Batal" onYes={konfirmasiDelete} onNo={()=>setDelTarget(null)}/>
      <DetailModal show={!!detailData} data={detailData} onClose={()=>setDetail(null)}/>
    </div>
  );
}

// ─── USER APP ROOT ───
export default function UserApp({ onNeedAdmin }) {
  const [userId, setUserId]   = useState(null);
  const [userName, setName]   = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [page, setPage]       = useState('tryout');
  const [filter, setFilter]   = useState(null);
  const [logoutAlert, setLogout] = useState(false);
  const [authCheck, setAuthCheck] = useState(true);

  useEffect(()=>{
    supabase.auth.getSession().then(async ({ data })=>{
      if(data.session){
        const { data:p } = await supabase.from('profiles').select('display_name,role').eq('id',data.session.user.id).single();
        setUserId(data.session.user.id); setName(p?.display_name||''); setIsAdmin(p?.role==='admin');
      }
      setAuthCheck(false);
    });
    const { data:l } = supabase.auth.onAuthStateChange(async(_,s)=>{
      if(!s){ setUserId(null); setName(''); setIsAdmin(false); }
    });
    return ()=>l.subscription.unsubscribe();
  },[]);

  const handleLogin = (uid, name, role) => { setUserId(uid); setName(name); setIsAdmin(role==='admin'); };
  const handleLogout = async () => { setLogout(false); await supabase.auth.signOut(); setUserId(null); setPage('tryout'); setFilter(null); };

  if (authCheck) return <div className="min-h-screen flex items-center justify-center" style={{ background:'#050B18' }}><div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor:'#00E5FF',borderTopColor:'transparent' }}/></div>;
  if (!userId) return <LoginPage onLogin={handleLogin}/>;

  return (
    <div className="min-h-screen" style={{ background:'#050B18' }}>
      <Navbar page={page} setPage={(p)=>{ if(p==='admin'&&isAdmin){ onNeedAdmin(); return; } if(p==='tryout')setFilter(null); setPage(p); }} userName={userName} isAdmin={isAdmin} onLogout={()=>setLogout(true)}/>
      <main className="pt-14 pb-24 sm:pb-0">
        {page==='tryout' && !filter && <BabSelectorPage userName={userName} onMulai={(f)=>{ setFilter(f); setPage('dashboard'); }}/>}
        {page==='dashboard' && filter && <DashboardTryout userId={userId} userName={userName} filter={filter} onBack={()=>{ setFilter(null); setPage('tryout'); }} onGoRiwayat={()=>setPage('riwayat')}/>}
        {page==='riwayat' && <RiwayatPage userId={userId}/>}
      </main>
      <Alert show={logoutAlert} tipe="confirm" judul="Keluar dari ARLearn?" pesan="Sesimu akan diakhiri." yesLabel="Ya, Keluar" noLabel="Batal" onYes={handleLogout} onNo={()=>setLogout(false)}/>
    </div>
  );
}
