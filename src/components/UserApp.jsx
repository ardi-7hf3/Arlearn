// ============================================================
//  UserApp.jsx — Semua halaman & komponen user ARLearn
//  Berisi: LatexRenderer, CustomAlert, Navbar, LoginPage,
//          BabSelectorPage, DashboardTryout (+ ModalHasil),
//          RiwayatPage (+ DetailModal)
// ============================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// ─────────────────────────────────────────────────────────────
//  KONSTANTA MAPEL
// ─────────────────────────────────────────────────────────────
const MAPEL_CFG = {
  kimia:     { label:'Kimia',      labelUp:'KIMIA',      icon:'fa-flask',      color:'#F59E0B', bg:'rgba(245,158,11,0.10)',  border:'rgba(245,158,11,0.25)',  glow:'rgba(245,158,11,0.15)'  },
  fisika:    { label:'Fisika',     labelUp:'FISIKA',     icon:'fa-atom',       color:'#00E5FF', bg:'rgba(0,229,255,0.10)',   border:'rgba(0,229,255,0.25)',   glow:'rgba(0,229,255,0.15)'   },
  mtkLanjut: { label:'MTK Lanjut',labelUp:'MTK LANJUT', icon:'fa-infinity',   color:'#A78BFA', bg:'rgba(167,139,250,0.10)', border:'rgba(167,139,250,0.25)', glow:'rgba(167,139,250,0.15)' },
  mtkWajib:  { label:'MTK Wajib', labelUp:'MTK WAJIB',  icon:'fa-calculator', color:'#10B981', bg:'rgba(16,185,129,0.10)',  border:'rgba(16,185,129,0.25)',  glow:'rgba(16,185,129,0.15)'  },
  pjok:      { label:'PJOK',      labelUp:'PJOK',       icon:'fa-dumbbell',   color:'#F43F5E', bg:'rgba(244,63,94,0.10)',   border:'rgba(244,63,94,0.25)',   glow:'rgba(244,63,94,0.15)'   },
  default:   { label:'Lainnya',   labelUp:'UMUM',       icon:'fa-book',       color:'#94A3B8', bg:'rgba(148,163,184,0.08)', border:'rgba(148,163,184,0.20)', glow:'rgba(148,163,184,0.10)' },
};
const getCfg = (mapel) => MAPEL_CFG[mapel] || MAPEL_CFG.default;
const OPTS = ['A','B','C','D'];

// ─────────────────────────────────────────────────────────────
//  SUPABASE HELPERS
// ─────────────────────────────────────────────────────────────
async function fetchSoal(mapel = null, bab = null) {
  let q = supabase.from('soal')
    .select('id,mapel,bab,nama_bab,teks,pilihan,jawaban_benar,penjelasan,pembahasan')
    .eq('aktif', true);
  if (mapel) q = q.eq('mapel', mapel);
  if (bab && bab !== '__all__') q = q.eq('bab', bab);
  const { data } = await q.order('id');
  return (data || []).map(s => ({
    id: s.id, mapel: s.mapel, bab: s.bab, namaBab: s.nama_bab,
    teks: s.teks, pilihan: Array.isArray(s.pilihan) ? s.pilihan : JSON.parse(s.pilihan || '[]'),
    jawabanBenar: s.jawaban_benar, penjelasan: s.penjelasan, pembahasan: s.pembahasan,
  }));
}

async function fetchMapelBab() {
  const { data } = await supabase.from('soal').select('mapel,bab,nama_bab').eq('aktif', true).order('mapel').order('bab');
  const map = {};
  for (const s of data || []) {
    const key = `${s.mapel}__${s.bab}`;
    if (!map[key]) map[key] = { mapel: s.mapel, bab: s.bab, namaBab: s.nama_bab, jumlah: 0 };
    map[key].jumlah++;
  }
  return Object.values(map);
}

async function fetchRiwayat(userId) {
  const { data } = await supabase.from('riwayat').select('*').eq('user_id', userId).order('tanggal', { ascending: false });
  return data || [];
}

async function saveRiwayat(userId, entry) {
  await supabase.from('riwayat').insert({
    user_id: userId, mapel: entry.mapel || null, bab: entry.bab || null,
    nama_bab: entry.namaBab || null, total_soal: entry.totalSoal,
    benar: entry.benar, salah: entry.salah, skor: entry.skor,
    durasi_detik: entry.durasiDetik || null, detail: entry.detail || null,
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

// ─────────────────────────────────────────────────────────────
//  1. LATEX RENDERER
// ─────────────────────────────────────────────────────────────
function Latex({ text }) {
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
  return <span className="latex-text">{parts}</span>;
}

// ─────────────────────────────────────────────────────────────
//  2. CUSTOM ALERT
// ─────────────────────────────────────────────────────────────
function Alert({ show, tipe='info', judul, pesan, onOk, onYes, onNo, okLabel='OK', yesLabel='Ya', noLabel='Batal' }) {
  useEffect(() => {
    if (!show) return;
    const y = window.scrollY;
    document.body.style.cssText = `overflow:hidden;position:fixed;top:-${y}px;width:100%`;
    return () => { document.body.style.cssText = ''; window.scrollTo(0, y); };
  }, [show]);
  if (!show) return null;
  const IC = {
    success:{ fa:'fa-solid fa-circle-check',        c:'#10B981', bg:'rgba(16,185,129,0.12)',  bd:'rgba(16,185,129,0.35)'  },
    error:  { fa:'fa-solid fa-circle-xmark',        c:'#EF4444', bg:'rgba(239,68,68,0.12)',   bd:'rgba(239,68,68,0.35)'   },
    warning:{ fa:'fa-solid fa-triangle-exclamation',c:'#F59E0B', bg:'rgba(245,158,11,0.12)',  bd:'rgba(245,158,11,0.35)'  },
    confirm:{ fa:'fa-solid fa-circle-question',     c:'#00E5FF', bg:'rgba(0,229,255,0.08)',   bd:'rgba(0,229,255,0.3)'    },
    info:   { fa:'fa-solid fa-circle-info',          c:'#00E5FF', bg:'rgba(0,229,255,0.08)',   bd:'rgba(0,229,255,0.3)'    },
  };
  const ic = IC[tipe] || IC.info;
  const S = { btn: { padding:'0.625rem 1rem', borderRadius:12, fontSize:'0.875rem', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, flex:1 } };
  return createPortal(
    <div style={{ position:'fixed',inset:0,zIndex:99999,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',background:'rgba(5,11,24,0.92)',backdropFilter:'blur(12px)',animation:'alertFadeIn 0.18s ease both' }}>
      <div style={{ width:'100%',maxWidth:420,borderRadius:20,padding:'1.75rem',background:'#111827',border:'1px solid rgba(0,229,255,0.2)',boxShadow:'0 24px 64px rgba(0,0,0,0.75)',animation:'alertSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <div style={{ width:56,height:56,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem',background:ic.bg,border:`2px solid ${ic.bd}` }}>
          <i className={`${ic.fa} text-2xl`} style={{ color:ic.c }} />
        </div>
        <h3 style={{ textAlign:'center',fontWeight:800,fontSize:'1.1rem',color:'#F0F6FF',marginBottom:'0.5rem' }}>{judul}</h3>
        <p style={{ textAlign:'center',fontSize:'0.875rem',lineHeight:1.6,color:'#94A3B8',whiteSpace:'pre-wrap' }}>{pesan}</p>
        <div style={{ display:'flex',gap:'0.75rem',marginTop:'1.5rem' }}>
          {tipe === 'confirm' ? (<>
            <button onClick={onNo} style={{ ...S.btn,background:'#1E293B',color:'#94A3B8',border:'1px solid #2D3748' }}><i className="fa-solid fa-xmark text-xs"/>{noLabel}</button>
            <button onClick={onYes} style={{ ...S.btn,background:'linear-gradient(135deg,#F97316,#FB923C)',color:'#fff',border:'none',boxShadow:'0 0 20px rgba(249,115,22,0.35)' }}><i className="fa-solid fa-check text-xs"/>{yesLabel}</button>
          </>) : (
            <button onClick={onOk} style={{ ...S.btn,background:'linear-gradient(135deg,#F97316,#FB923C)',color:'#fff',border:'none',boxShadow:'0 0 20px rgba(249,115,22,0.35)',margin:'0 auto' }}><i className="fa-solid fa-check text-xs"/>{okLabel}</button>
          )}
        </div>
      </div>
    </div>, document.body
  );
}

// ─────────────────────────────────────────────────────────────
//  3. NAVBAR
// ─────────────────────────────────────────────────────────────
function Navbar({ page, setPage, userName, isAdmin, onLogout }) {
  const NAV = [
    { key:'tryout',  icon:'fa-solid fa-house',             label:'Tryout'  },
    { key:'riwayat', icon:'fa-solid fa-clock-rotate-left', label:'Riwayat' },
  ];
  if (isAdmin) NAV.push({ key:'admin', icon:'fa-solid fa-sliders', label:'Admin' });

  return (<>
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14"
      style={{ background:'rgba(5,11,24,0.95)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:'linear-gradient(135deg,#00E5FF,#0891B2)' }}>
          <span className="font-black text-xs" style={{ color:'#050B18' }}>AR</span>
        </div>
        <span className="font-black text-base logo-gradient">ARLearn</span>
      </div>
      <div className="hidden sm:flex items-center gap-1">
        {NAV.map(n => (
          <button key={n.key} onClick={() => setPage(n.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
            style={{ background:page===n.key?'rgba(249,115,22,0.15)':'transparent', color:page===n.key?'#F97316':'#64748B', border:page===n.key?'1px solid rgba(249,115,22,0.3)':'1px solid transparent' }}>
            <i className={n.icon}/>{n.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background:'rgba(0,229,255,0.06)',border:'1px solid rgba(0,229,255,0.1)' }}>
          <i className="fa-solid fa-circle-user text-sm" style={{ color:'#00E5FF' }}/>
          <span className="text-sm font-semibold" style={{ color:'#94A3B8' }}>{userName}</span>
        </div>
        <button onClick={onLogout} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{ background:'rgba(239,68,68,0.1)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.18)' }}>
          <i className="fa-solid fa-right-from-bracket"/>Keluar
        </button>
      </div>
    </nav>

    {/* Mobile bottom nav */}
    <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50"
      style={{ background:'rgba(5,11,24,0.97)',borderTop:'1px solid rgba(255,255,255,0.06)',backdropFilter:'blur(24px)' }}>
      <div className="flex items-end h-16">
        {NAV.map(n => (
          <button key={n.key} onClick={() => setPage(n.key)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-all"
            style={{ color:page===n.key?'#F97316':'#475569' }}>
            <i className={`${n.icon} text-lg`}/>
            <span className="text-[10px] font-semibold">{n.label}</span>
          </button>
        ))}
        <button onClick={onLogout}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full"
          style={{ color:'#475569' }}>
          <i className="fa-solid fa-door-open text-lg"/>
          <span className="text-[10px] font-semibold">Keluar</span>
        </button>
      </div>
    </div>
  </>);
}

// ─────────────────────────────────────────────────────────────
//  4. LOGIN PAGE
// ─────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [pass, setPass]         = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [alert, setAlert]       = useState({ show:false });

  const handleLogin = async () => {
    if (!email.trim() || !pass.trim()) { setAlert({ show:true, tipe:'warning', judul:'Form Kosong', pesan:'Isi email dan password terlebih dahulu.' }); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
    if (error) { setLoading(false); setAlert({ show:true, tipe:'error', judul:'Login Gagal', pesan:error.message }); return; }
    const { data: profile } = await supabase.from('profiles').select('display_name,role').eq('id', data.user.id).single();
    setLoading(false);
    onLogin(data.user.id, profile?.display_name || email.split('@')[0], profile?.role || 'user');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background:'#050B18' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.06]" style={{ background:'radial-gradient(circle,#00E5FF,transparent 70%)' }}/>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ background:'radial-gradient(circle,#06B6D4,transparent 70%)' }}/>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage:'linear-gradient(rgba(0,229,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,1) 1px,transparent 1px)',backgroundSize:'60px 60px' }}/>
      </div>
      <div className="w-full max-w-[440px] animate-fadeIn">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background:'linear-gradient(135deg,#00E5FF,#0891B2)',boxShadow:'0 0 30px rgba(0,229,255,0.3)' }}>
            <span className="font-black text-2xl" style={{ color:'#050B18' }}>AR</span>
          </div>
          <h1 className="font-black text-3xl logo-gradient mb-1">ARLearn</h1>
          <p className="text-sm" style={{ color:'#475569' }}>Platform Tryout Premium · XI ARTERI</p>
        </div>
        <div className="rounded-2xl p-6 space-y-4" style={{ background:'#0D1929',border:'1px solid #1E3A5F' }}>
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color:'#475569' }}>EMAIL</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}
              placeholder="email@arlearn.id" className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background:'#0A1628',border:'1px solid #1E3A5F',color:'#CBD5E1' }}/>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color:'#475569' }}>PASSWORD</label>
            <div className="relative">
              <input type={showPass?'text':'password'} value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                placeholder="••••••••" className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-12"
                style={{ background:'#0A1628',border:'1px solid #1E3A5F',color:'#CBD5E1' }}/>
              <button onClick={()=>setShowPass(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-lg" style={{ color:'#334155' }}>
                {showPass?'🙈':'👁️'}
              </button>
            </div>
          </div>
          <button onClick={handleLogin} disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm"
            style={{ background:'linear-gradient(135deg,#00E5FF,#0891B2)',color:'#050B18',opacity:loading?.7:1 }}>
            {loading?'Masuk...':'🚀 Masuk ke ARLearn'}
          </button>
        </div>
      </div>
      <Alert {...alert} onOk={()=>setAlert({show:false})}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  5. BAB SELECTOR PAGE
// ─────────────────────────────────────────────────────────────
function BabSelectorPage({ userName, onMulai }) {
  const [bankData, setBankData] = useState({});   // { mapel: { bab: { namaBab, jumlah } } }
  const [selMapel, setSelMapel] = useState(null);
  const [selBab, setSelBab]     = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetchMapelBab().then(list => {
      const map = {};
      list.forEach(({ mapel, bab, namaBab, jumlah }) => {
        if (!map[mapel]) map[mapel] = {};
        map[mapel][bab] = { namaBab, jumlah };
      });
      setBankData(map);
      setLoading(false);
    });
  }, []);

  const mapelList = Object.keys(bankData);
  const babList   = selMapel ? Object.entries(bankData[selMapel] || {}) : [];
  const totalMapel = selMapel ? Object.values(bankData[selMapel]||{}).reduce((a,b)=>a+b.jumlah,0) : 0;
  const cfg = selMapel ? getCfg(selMapel) : null;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor:'#00E5FF',borderTopColor:'transparent' }}/>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fadeIn">
      <div className="mb-7">
        <h1 style={{ fontFamily:'"Poppins",serif',fontWeight:800,fontStyle:'italic',fontSize:'clamp(1.4rem,5vw,1.9rem)',color:'#F0F6FF',lineHeight:1.2 }}>
          Halo, {userName}! <i className="fa-solid fa-hand" style={{ color:'#F59E0B',fontStyle:'normal' }}/>
        </h1>
        <p className="text-sm mt-1" style={{ color:'#475569' }}>Pilih mata pelajaran dan bab untuk tryout</p>
      </div>

      {/* Step 1: Mapel */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background:'linear-gradient(135deg,#F97316,#FB923C)',color:'#fff' }}>1</span>
          <span className="text-sm font-semibold" style={{ color:'#94A3B8' }}>Pilih Mata Pelajaran</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {mapelList.map(mapel => {
            const mc = getCfg(mapel);
            const isActive = selMapel === mapel;
            const total = Object.values(bankData[mapel]).reduce((a,b)=>a+b.jumlah,0);
            const jumlahBab = Object.keys(bankData[mapel]).length;
            return (
              <button key={mapel} onClick={()=>{ setSelMapel(mapel); setSelBab(null); }}
                className="text-left rounded-2xl p-4 transition-all duration-200"
                style={{ background:isActive?mc.bg:'#111827', border:`1.5px solid ${isActive?mc.color:'#1E293B'}`, boxShadow:isActive?`0 0 20px ${mc.glow}`:'none', transform:isActive?'translateY(-1px)':'none' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:isActive?mc.bg:'rgba(255,255,255,0.04)',border:`1px solid ${isActive?mc.border:'#1E293B'}` }}>
                    <i className={`fa-solid ${mc.icon} text-lg`} style={{ color:mc.color }}/>
                  </div>
                  {isActive && <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background:mc.color }}><i className="fa-solid fa-check text-xs" style={{ color:'#050B18' }}/></div>}
                </div>
                <div className="font-bold text-sm mb-1" style={{ color:isActive?mc.color:'#E2E8F0' }}>{mc.label}</div>
                <div className="text-xs" style={{ color:'#475569' }}>{jumlahBab} bab · {total} soal</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Bab */}
      <div className={`mb-6 transition-all duration-300 ${selMapel?'opacity-100':'opacity-40 pointer-events-none'}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background:selMapel?'linear-gradient(135deg,#F97316,#FB923C)':'#1E293B', color:selMapel?'#fff':'#475569' }}>2</span>
          <span className="text-sm font-semibold" style={{ color:selMapel?'#94A3B8':'#334155' }}>
            {selMapel?`Pilih Bab — ${cfg?.label} (${totalMapel} soal)`:'Pilih Bab'}
          </span>
        </div>
        {selMapel ? (
          <div className="space-y-2">
            {/* Semua bab */}
            {[['__all__',{ namaBab:'Semua Bab', jumlah:totalMapel }],...babList].map(([babKey,{namaBab,jumlah}], idx) => {
              const isActive = selBab === babKey;
              return (
                <button key={babKey} onClick={()=>setSelBab(babKey)}
                  className="w-full flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-200"
                  style={{ background:isActive?cfg.bg:'#111827', border:`1.5px solid ${isActive?cfg.color:'#1E293B'}`, boxShadow:isActive?`0 0 16px ${cfg.glow}`:'none' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background:isActive?cfg.bg:'#1E293B', border:`1px solid ${isActive?cfg.border:'#2D3748'}`, color:isActive?cfg.color:'#64748B' }}>
                    {babKey==='__all__'?<i className="fa-solid fa-layer-group text-sm"/>:idx}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold" style={{ color:isActive?cfg.color:'#E2E8F0' }}>{namaBab}</div>
                    <div className="text-xs mt-0.5" style={{ color:'#475569' }}>{jumlah} soal</div>
                  </div>
                  {isActive && <i className="fa-solid fa-circle-check text-lg flex-shrink-0" style={{ color:cfg.color }}/>}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl p-6 text-center" style={{ background:'#0D1526',border:'1px dashed #1E293B' }}>
            <i className="fa-solid fa-arrow-up text-2xl mb-2 block" style={{ color:'#334155' }}/>
            <span className="text-sm" style={{ color:'#334155' }}>Pilih mata pelajaran terlebih dahulu</span>
          </div>
        )}
      </div>

      {/* CTA */}
      {selMapel && selBab ? (
        <button onClick={()=>onMulai({ mapel:selMapel, bab:selBab })}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
          style={{ background:'linear-gradient(135deg,#F97316,#FB923C)',color:'#fff',boxShadow:'0 0 24px rgba(249,115,22,0.4)' }}>
          <i className="fa-solid fa-play text-sm"/>Mulai Tryout
        </button>
      ) : (
        <div className="rounded-2xl py-4 text-center" style={{ background:'#0D1526',border:'1px dashed #1E293B' }}>
          <span className="text-sm" style={{ color:'#334155' }}>Selesaikan pilihan di atas untuk mulai tryout</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  6. MODAL HASIL TRYOUT
// ─────────────────────────────────────────────────────────────
function ModalHasil({ show, soal, jawabanUser, onLagi, onRiwayat }) {
  const [tab, setTab] = useState('ringkasan');
  const [filterSalah, setFilterSalah] = useState(false);
  useEffect(()=>{ if(show){ setTab('ringkasan'); setFilterSalah(false); } },[show]);
  if (!show || !soal) return null;

  const benar = soal.filter((s,i)=>jawabanUser[i]===s.jawabanBenar).length;
  const salah  = soal.length - benar;
  const skor   = Math.round((benar/soal.length)*100);
  const sc = skor>=80?'#10B981':skor>=60?'#F59E0B':'#EF4444';
  const si = skor>=80?'fa-solid fa-trophy':skor>=60?'fa-solid fa-thumbs-up':'fa-solid fa-dumbbell';
  const sl = skor>=80?'Luar Biasa!':skor>=60?'Cukup Baik':'Terus Berlatih';
  const displaySoal = filterSalah ? soal.map((s,i)=>({...s,idx:i})).filter(s=>jawabanUser[s.idx]!==s.jawabanBenar) : soal.map((s,i)=>({...s,idx:i}));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-4 px-4" style={{ background:'rgba(0,0,0,0.88)',backdropFilter:'blur(12px)' }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden animate-fadeIn" style={{ background:'#111827',border:'1px solid rgba(0,229,255,0.15)',boxShadow:'0 24px 80px rgba(0,0,0,0.7)' }}>
        <div className="p-6 text-center" style={{ borderBottom:'1px solid #1E293B' }}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-3" style={{ background:`${sc}15`,border:`2px solid ${sc}35` }}>
            <span className="font-black text-3xl" style={{ color:sc }}>{skor}</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <i className={`${si} text-sm`} style={{ color:sc }}/><span className="text-sm font-bold" style={{ color:sc }}>{sl}</span>
          </div>
          <h2 className="font-black text-2xl" style={{ color:'#F0F6FF' }}>Hasil Tryout</h2>
          <div className="flex justify-center gap-8 mt-5">
            {[{l:'Benar',v:benar,c:'#10B981',i:'fa-solid fa-circle-check'},{l:'Salah',v:salah,c:'#EF4444',i:'fa-solid fa-circle-xmark'},{l:'Skor',v:skor+'%',c:sc,i:'fa-solid fa-star'}].map(s=>(
              <div key={s.l} className="text-center"><i className={`${s.i} text-xs mb-1 block`} style={{ color:s.c }}/><div className="font-black text-2xl" style={{ color:s.c }}>{s.v}</div><div className="text-xs" style={{ color:'#64748B' }}>{s.l}</div></div>
            ))}
          </div>
        </div>
        <div className="flex" style={{ borderBottom:'1px solid #1E293B' }}>
          {[{k:'ringkasan',i:'fa-solid fa-chart-pie',l:'Ringkasan'},{k:'pembahasan',i:'fa-solid fa-book-open',l:'Pembahasan'}].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} className="flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{ color:tab===t.k?'#F97316':'#475569',borderBottom:tab===t.k?'2px solid #F97316':'2px solid transparent' }}>
              <i className={`${t.i} text-xs`}/>{t.l}
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
                    <span className="text-xs font-bold flex items-center gap-1.5" style={{ color:c.color }}><i className={`fa-solid ${c.icon} text-xs`}/>{c.labelUp}</span>
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
                      <span className="ml-auto"><i className={`fa-solid ${isB?'fa-circle-check':'fa-circle-xmark'} text-sm`} style={{ color:isB?'#10B981':'#EF4444' }}/></span>
                    </div>
                    <div className="text-sm mb-2" style={{ color:'#D1D5DB' }}><Latex text={s.teks}/></div>
                    {s.pilihan.map((opt,j)=>{ const isK=j===s.jawabanBenar; const isP=j===jawabanUser[i]; let col=isK?'#10B981':isP&&!isK?'#EF4444':'#475569';
                      return (<div key={j} className="flex items-start gap-2 mt-1 text-xs py-0.5" style={{ color:col }}><span className="font-bold w-5 flex-shrink-0">{OPTS[j]}.</span><span className="flex-1"><Latex text={opt}/></span>{isK&&<i className="fa-solid fa-check ml-auto"/>}{isP&&!isK&&<i className="fa-solid fa-xmark ml-auto"/>}</div>);
                    })}
                    {s.penjelasan&&<div className="mt-2 pt-2 text-xs" style={{ color:'#64748B',borderTop:'1px solid #1E293B' }}><span className="font-bold block mb-0.5" style={{ color:'#00E5FF' }}>💡 Penjelasan</span><Latex text={s.penjelasan}/></div>}
                  </div>);
                })}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 p-4" style={{ borderTop:'1px solid #1E293B' }}>
          <button onClick={onRiwayat} className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{ background:'#1E293B',color:'#94A3B8',border:'1px solid #2D3748' }}><i className="fa-solid fa-clock-rotate-left"/>Riwayat</button>
          <button onClick={onLagi} className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{ background:'linear-gradient(135deg,#F97316,#FB923C)',color:'#fff' }}><i className="fa-solid fa-rotate-right"/>Tryout Lagi</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  7. DASHBOARD TRYOUT
// ─────────────────────────────────────────────────────────────
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
    fetchSoal(filter?.mapel, filter?.bab).then(list=>{ setSoalList(list); setLoading(false); });
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
    await saveRiwayat(userId, { mapel:filter?.mapel, bab:filter?.bab, namaBab:soalList[0]?.namaBab, totalSoal:total, benar, salah, skor, detail:jawaban });
    setShowHasil(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor:'#00E5FF',borderTopColor:'transparent' }}/></div>;

  if (!soal) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4" style={{ color:'#64748B' }}>
      <i className="fa-solid fa-box-open text-3xl"/>
      <p className="text-sm">Tidak ada soal untuk bab ini.</p>
      <button onClick={onBack} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ background:'linear-gradient(135deg,#F97316,#FB923C)',color:'#fff' }}>
        <i className="fa-solid fa-arrow-left text-xs"/>Kembali
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fadeIn">
      {/* Back */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold"
          style={{ background:'#111827',color:'#94A3B8',border:'1px solid #1E293B' }}>
          <i className="fa-solid fa-arrow-left text-xs"/>Ganti Bab
        </button>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background:mapelCfg.bg,color:mapelCfg.color,border:`1px solid ${mapelCfg.border}` }}>
          {soalList[0]?.namaBab || mapelCfg.label}
        </span>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[{i:'fa-solid fa-book-open',l:'Total Soal',v:total,c:'#00E5FF'},{i:'fa-solid fa-check-circle',l:'Terjawab',v:terjawab,c:'#10B981'},{i:'fa-solid fa-fire',l:'Mapel',v:mapelCfg.label,c:'#F59E0B'}].map(s=>(
          <div key={s.l} className="rounded-xl p-4" style={{ background:'#111827' }}>
            <i className={`${s.i} text-xl mb-2 block`} style={{ color:s.c }}/><div className="font-black text-xl" style={{ color:s.c }}>{s.v}</div><div className="text-xs mt-0.5" style={{ color:'#475569' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
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

      {/* Question card */}
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
              {sudahDijawab&&isC&&<i className="fa-solid fa-circle-check text-lg flex-shrink-0" style={{ color:'#10B981' }}/>}
              {sudahDijawab&&isW&&<i className="fa-solid fa-circle-xmark text-lg flex-shrink-0" style={{ color:'#EF4444' }}/>}
            </div>);
          })}
        </div>
        {sudahDijawab&&soal.penjelasan&&(
          <div className="mx-4 mb-4 rounded-xl p-3.5 animate-fadeIn" style={{ background:'rgba(0,229,255,0.04)',border:'1px solid rgba(0,229,255,0.15)' }}>
            <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color:'#00E5FF' }}>PENJELASAN</span>
            <div className="text-sm leading-relaxed" style={{ color:'#94A3B8' }}><Latex text={soal.penjelasan}/></div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={()=>goTo(currIdx-1)} disabled={currIdx===0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-30"
          style={{ minWidth:120,background:'#111827',color:'#94A3B8',border:'1px solid #1E293B' }}>
          <i className="fa-solid fa-chevron-left text-xs"/>Sebelumnya
        </button>
        <span className="text-xs" style={{ color:'#334155' }}>{currIdx+1}/{total}</span>
        <button onClick={()=>goTo(currIdx+1)} disabled={currIdx===total-1}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-30"
          style={{ minWidth:120,background:'#111827',color:'#94A3B8',border:'1px solid #1E293B' }}>
          Selanjutnya<i className="fa-solid fa-chevron-right text-xs"/>
        </button>
      </div>

      <div className="mt-2 mb-8">
        {terjawab===total&&total>0 ? (
          <button onClick={()=>setAlert(true)} className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
            style={{ background:'linear-gradient(135deg,#F97316,#FB923C)',color:'#fff',boxShadow:'0 0 24px rgba(249,115,22,0.4)' }}>
            <i className="fa-solid fa-circle-check text-lg"/>Selesai Tryout
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

// ─────────────────────────────────────────────────────────────
//  8. RIWAYAT PAGE
// ─────────────────────────────────────────────────────────────
function DetailModal({ show, data, onClose }) {
  if (!show || !data) return null;
  const sc = (s)=>s>=80?'#10B981':s>=60?'#F59E0B':'#EF4444';
  return createPortal(
    <div style={{ position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'1rem',overflowY:'auto',background:'rgba(5,11,24,0.92)',backdropFilter:'blur(12px)',animation:'alertFadeIn 0.18s ease both' }} onClick={onClose}>
      <div style={{ width:'100%',maxWidth:640,borderRadius:20,overflow:'hidden',background:'#111827',border:'1px solid rgba(0,229,255,0.18)',boxShadow:'0 24px 80px rgba(0,0,0,0.75)',marginTop:8 }} onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 sticky top-0" style={{ background:'#111827',borderBottom:'1px solid #1E293B',zIndex:2 }}>
          <div><h2 className="font-bold text-base" style={{ color:'#F0F6FF' }}><i className="fa-solid fa-chart-bar mr-2" style={{ color:'#00E5FF' }}/>Detail Riwayat</h2>
            <p className="text-xs mt-0.5" style={{ color:'#64748B' }}>{formatTgl(data.tanggal)}</p></div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color:'#64748B' }}><i className="fa-solid fa-xmark"/></button>
        </div>
        <div className="grid grid-cols-3 gap-3 p-4 pb-3">
          {[{l:'Skor',v:data.skor,c:'#00E5FF',i:'fa-solid fa-star'},{l:'Benar',v:data.benar,c:'#10B981',i:'fa-solid fa-circle-check'},{l:'Salah',v:data.salah,c:'#EF4444',i:'fa-solid fa-circle-xmark'}].map(s=>(
            <div key={s.l} className="rounded-xl p-3 text-center" style={{ background:'#0B1121',border:'1px solid #1E293B' }}>
              <i className={`${s.i} text-lg mb-1 block`} style={{ color:s.c }}/><div className="font-black text-xl" style={{ color:s.c }}>{s.v}</div><div className="text-xs" style={{ color:'#64748B' }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div className="px-4 pb-4">
          <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color:'#475569' }}><i className="fa-solid fa-list-check"/>Rincian Jawaban</p>
          <p className="text-xs" style={{ color:'#334155' }}>Skor: <strong style={{ color:sc(data.skor) }}>{data.skor}</strong> · {data.benar} benar · {data.salah} salah dari {data.total_soal} soal</p>
        </div>
      </div>
    </div>, document.body
  );
}

function RiwayatPage({ userId }) {
  const [riwayat, setRiwayat]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [deleteTarget, setDelTarget]= useState(null);
  const [detailData, setDetail]     = useState(null);
  const sc = (s)=>s>=80?'#10B981':s>=60?'#F59E0B':'#EF4444';
  const si = (s)=>s>=80?'fa-solid fa-trophy':s>=60?'fa-solid fa-thumbs-up':'fa-solid fa-dumbbell';

  useEffect(()=>{ fetchRiwayat(userId).then(d=>{ setRiwayat(d); setLoading(false); }); },[userId]);

  const konfirmasiDelete = async () => {
    await hapusRiwayat(deleteTarget); setRiwayat(r=>r.filter(x=>x.id!==deleteTarget)); setDelTarget(null);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor:'#00E5FF',borderTopColor:'transparent' }}/></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 animate-fadeIn">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-black text-xl flex items-center gap-2" style={{ color:'#F0F6FF' }}><i className="fa-solid fa-clock-rotate-left" style={{ color:'#00E5FF' }}/>Riwayat Tryout</h1>
          <p className="text-xs mt-0.5 pl-7" style={{ color:'#475569' }}>{riwayat.length} percobaan tersimpan</p>
        </div>
      </div>
      {riwayat.length===0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ background:'#111827',border:'1px solid #1E293B' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background:'#1E293B' }}><i className="fa-solid fa-inbox text-3xl" style={{ color:'#334155' }}/></div>
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
                  <div className="flex items-center gap-1.5 text-xs" style={{ color:'#64748B' }}><i className="fa-solid fa-calendar-days"/><span>{formatTgl(item.tanggal)}</span></div>
                  <div className="flex items-center gap-1.5"><i className={`${si(item.skor)} text-xs`} style={{ color:sc(item.skor) }}/><span className="font-black text-2xl" style={{ color:sc(item.skor) }}>{item.skor}</span><span className="text-xs" style={{ color:'#334155' }}>/100</span></div>
                </div>
                <div className="flex gap-2 mb-3">
                  {[{l:'Benar',v:item.benar,c:'#10B981',i:'fa-solid fa-circle-check'},{l:'Salah',v:item.salah,c:'#EF4444',i:'fa-solid fa-circle-xmark'},{l:'Soal',v:item.total_soal,c:'#64748B',i:'fa-solid fa-layer-group'}].map(s=>(
                    <div key={s.l} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl" style={{ background:`${s.c}0D`,border:`1px solid ${s.c}25` }}>
                      <i className={`${s.i} text-xs`} style={{ color:s.c }}/><span className="font-bold text-sm" style={{ color:s.c }}>{s.v}</span><span className="text-xs" style={{ color:'#475569' }}>{s.l}</span>
                    </div>
                  ))}
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background:'#1E293B' }}><div className="h-full rounded-full" style={{ width:`${item.skor}%`,background:sc(item.skor) }}/></div>
                <div className="flex gap-2">
                  <button onClick={()=>setDetail(item)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                    style={{ background:'rgba(0,229,255,0.08)',color:'#00E5FF',border:'1px solid rgba(0,229,255,0.15)' }}><i className="fa-solid fa-magnifying-glass"/>Lihat Detail</button>
                  <button onClick={()=>setDelTarget(item.id)} className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background:'rgba(239,68,68,0.08)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.15)' }}><i className="fa-solid fa-trash text-xs"/></button>
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

// ─────────────────────────────────────────────────────────────
//  9. USER APP — ROOT (Login + Router user)
// ─────────────────────────────────────────────────────────────
export default function UserApp({ onNeedAdmin }) {
  const [userId, setUserId]   = useState(null);
  const [userName, setName]   = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [page, setPage]       = useState('tryout');
  const [filter, setFilter]   = useState(null);   // { mapel, bab }
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
      <main className="pt-14 pb-20 sm:pb-0">
        {page==='tryout' && !filter && <BabSelectorPage userName={userName} onMulai={(f)=>{ setFilter(f); setPage('dashboard'); }}/>}
        {page==='dashboard' && filter && <DashboardTryout userId={userId} userName={userName} filter={filter} onBack={()=>{ setFilter(null); setPage('tryout'); }} onGoRiwayat={()=>setPage('riwayat')}/>}
        {page==='riwayat' && <RiwayatPage userId={userId}/>}
      </main>
      <Alert show={logoutAlert} tipe="confirm" judul="Keluar dari ARLearn?" pesan="Sesimu akan diakhiri." yesLabel="Ya, Keluar" noLabel="Batal" onYes={handleLogout} onNo={()=>setLogout(false)}/>
    </div>
  );
}
