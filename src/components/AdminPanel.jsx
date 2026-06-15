// ============================================================
//  AdminPanel.jsx — Semua fitur admin ARLearn
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const MAPEL_LIST = [
  // ── Mapel Sekolah ──────────────────────────────
  { value:'kimia',     label:'Kimia',                       icon:'science',        color:'#F59E0B' },
  { value:'fisika',    label:'Fisika',                      icon:'bolt',           color:'#00E5FF' },
  { value:'mtkLanjut', label:'MTK Lanjut',                 icon:'functions',      color:'#A78BFA' },
  { value:'mtkWajib',  label:'MTK Wajib',                  icon:'calculate',      color:'#10B981' },
  { value:'pjok',      label:'PJOK',                       icon:'fitness_center', color:'#F43F5E' },
  // ── SNBT / UTBK ────────────────────────────────
  { value:'pk',        label:'Penalaran Kuantitatif',       icon:'data_usage',     color:'#06B6D4' },
  { value:'pm',        label:'Penalaran Matematika',        icon:'equalizer',      color:'#8B5CF6' },
  { value:'pu',        label:'Penalaran Umum',              icon:'psychology',     color:'#F59E0B' },
  { value:'ppu',       label:'Pengetahuan & Pemahaman Umum',icon:'public',         color:'#10B981' },
  { value:'pbm',       label:'Pemahaman Bacaan & Menulis',  icon:'menu_book',      color:'#EC4899' },
  { value:'lbi',       label:'Literasi Bahasa Indonesia',   icon:'translate',      color:'#EF4444' },
  { value:'lbe',       label:'Literasi Bahasa Inggris',     icon:'language',       color:'#3B82F6' },
  { value:'default',   label:'Umum/Default', icon:'menu_book',     color:'#94A3B8' },
];
const BLANK = { mapel:'kimia', kelas:'XI', bab:'bab1', nama_bab:'', teks:'', pilihan:['','','',''], jawaban_benar:0, penjelasan:'', pembahasan:'', gambar:null, aktif:true };
const getCfg = (v) => MAPEL_LIST.find(x=>x.value===v) || MAPEL_LIST[5];
const PER_PAGE = 20;

// Material Icon helper
const MI = ({ name, style, className }) => (
  <span className={`material-icons${className?' '+className:''}`} style={style}>{name}</span>
);

function Toast({ toast }) {
  if (!toast) return null;
  const bg = toast.type==='error'?'#F43F5E':toast.type==='warning'?'#F59E0B':'#00E5FF';
  return <div className="fixed top-4 right-4 z-[999] px-5 py-3 rounded-xl text-sm font-bold shadow-xl" style={{ background:bg, color:'#050B18' }}>{toast.msg}</div>;
}

function Confirm({ open, title, msg, onYes, onNo, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:'rgba(5,11,24,0.92)' }}>
      <div className="rounded-2xl p-6 text-center max-w-sm w-full" style={{ background:'#0D1929', border:'1px solid #F43F5E44' }}>
        <MI name="warning" style={{ color:'#F59E0B', fontSize:40, display:'block', margin:'0 auto 12px' }}/>
        <h3 className="font-bold text-lg mb-2" style={{ color:'#E2E8F0' }}>{title}</h3>
        <p className="text-sm mb-6" style={{ color:'#475569' }}>{msg}</p>
        <div className="flex gap-3">
          <button onClick={onNo} className="flex-1 py-2 rounded-xl text-sm" style={{ background:'#1E3A5F33', color:'#64748B' }}>Batal</button>
          <button onClick={onYes} disabled={loading} className="flex-1 py-2 rounded-xl text-sm font-bold" style={{ background:'#F43F5E', color:'#fff' }}>{loading?'Memproses...':'Ya, Lanjutkan'}</button>
        </div>
      </div>
    </div>
  );
}

function MapelBadge({ mapel }) {
  const m = getCfg(mapel);
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background:m.color+'22', color:m.color, border:`1px solid ${m.color}44` }}><MI name={m.icon} style={{fontSize:12}}/>{m.label}</span>;
}

function FInput({ label, value, onChange, placeholder, type='text' }) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1" style={{ color:'#64748B' }}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background:'#0A1628', border:'1px solid #1E3A5F', color:'#CBD5E1' }}/>
    </div>
  );
}

function FTextarea({ label, value, onChange, placeholder, rows=3 }) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1" style={{ color:'#64748B' }}>{label}</label>
      <textarea rows={rows} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={{ background:'#0A1628', border:'1px solid #1E3A5F', color:'#CBD5E1' }}/>
    </div>
  );
}

// ─── MODAL FORM SOAL ───
function SoalModal({ open, onClose, initial, onSave, saving }) {
  const [form, setForm] = useState(initial || BLANK);
  useEffect(()=>{ setForm(initial || BLANK); },[initial, open]);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const setPilihan = (i,v) => { const p=[...form.pilihan]; p[i]=v; set('pilihan',p); };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:'rgba(5,11,24,0.92)', backdropFilter:'blur(8px)' }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden" style={{ background:'#0D1929', border:'1px solid #1E3A5F', maxHeight:'90vh', overflowY:'auto' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ background:'linear-gradient(135deg,#00E5FF08,#0D1929)', borderBottom:'1px solid #1E3A5F' }}>
          <h2 className="font-bold text-lg flex items-center gap-2" style={{ color:'#00E5FF' }}>
            <MI name={initial?.id?'edit':'add_circle'} style={{fontSize:20}}/>{initial?.id?'Edit Soal':'Tambah Soal Baru'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color:'#475569', background:'#1E3A5F33' }}><MI name="close" style={{fontSize:16}}/></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color:'#64748B' }}>MATA PELAJARAN</label>
              <select value={form.mapel} onChange={e=>set('mapel',e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background:'#0A1628', border:'1px solid #1E3A5F', color:'#CBD5E1' }}>
                {MAPEL_LIST.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color:'#64748B' }}>KELAS</label>
              <select value={form.kelas||'XI'} onChange={e=>set('kelas',e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background:'#0A1628', border:'1px solid #1E3A5F', color:'#CBD5E1' }}>
                {['X','XI','XII'].map(k=><option key={k} value={k}>Kelas {k}</option>)}
              </select>
            </div>
            <FInput label="BAB (contoh: bab1)" value={form.bab} onChange={v=>set('bab',v)} placeholder="bab1"/>
          </div>
          <FInput label="NAMA BAB" value={form.nama_bab} onChange={v=>set('nama_bab',v)} placeholder="Contoh: Struktur Atom & Sistem Periodik"/>
          <FTextarea label="TEKS SOAL (LaTeX: $...$)" value={form.teks} onChange={v=>set('teks',v)} placeholder="Tulis soal di sini..." rows={3}/>
          <div>
            <label className="block text-xs font-bold mb-2" style={{ color:'#64748B' }}>PILIHAN JAWABAN <span style={{ color:'#334155' }}>(klik huruf = jawaban benar)</span></label>
            <div className="space-y-2">
              {['A','B','C','D'].map((lbl,i)=>(
                <div key={i} className="flex items-center gap-2">
                  <button onClick={()=>set('jawaban_benar',i)} className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold transition-all"
                    style={{ background:form.jawaban_benar===i?'#00E5FF':'#1E3A5F', color:form.jawaban_benar===i?'#050B18':'#64748B', border:form.jawaban_benar===i?'none':'1px solid #1E3A5F' }}>{lbl}</button>
                  <input value={form.pilihan[i]} onChange={e=>setPilihan(i,e.target.value)} placeholder={`Pilihan ${lbl}`}
                    className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
                    style={{ background:form.jawaban_benar===i?'rgba(0,229,255,0.06)':'#0A1628', border:`1px solid ${form.jawaban_benar===i?'#00E5FF44':'#1E3A5F'}`, color:'#CBD5E1' }}/>
                </div>
              ))}
            </div>
          </div>
          <FInput label="PENJELASAN SINGKAT" value={form.penjelasan} onChange={v=>set('penjelasan',v)} placeholder="Penjelasan singkat jawaban benar..."/>
          {/* ─ PEMBAHASAN LENGKAP dengan panduan tag ─ */}
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color:'#64748B' }}>PEMBAHASAN LENGKAP (opsional)</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {[
                { tag:'[RUMUS]', color:'#F59E0B', desc:'Rumus dasar' },
                { tag:'[LANGKAH]', color:'#F97316', desc:'Langkah bernomor' },
                { tag:'[INSTRUKSI]', color:'#A78BFA', desc:'Instruksi' },
                { tag:'[HASIL]', color:'#10B981', desc:'Hasil akhir' },
              ].map(t => (
                <button key={t.tag} type="button" title={t.desc}
                  onClick={() => set('pembahasan', (form.pembahasan||'')+'\n'+t.tag+' ')}
                  className="text-xs px-2 py-1 rounded-lg font-mono"
                  style={{ background:t.color+'22', color:t.color, border:`1px solid ${t.color}44` }}>
                  {t.tag}
                </button>
              ))}
              <span className="text-xs self-center ml-1" style={{ color:'#334155' }}>← klik sisipkan tag</span>
            </div>
            <textarea rows={7} value={form.pembahasan} onChange={e=>set('pembahasan',e.target.value)}
              placeholder={"[RUMUS] $\\text{pH} = -\\log[\\text{H}^+]$\n[LANGKAH] Tuliskan reaksi ionisasi...\n[INSTRUKSI] Substitusikan nilai\n$[\\text{H}^+] = 10^{-2}$ M\n[HASIL] $\\text{pH} = 2$"}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-y font-mono"
              style={{ background:'#0A1628', border:'1px solid #1E3A5F', color:'#CBD5E1', lineHeight:1.7 }}/>
            {form.pembahasan?.trim() && (
              <div className="mt-2 rounded-lg p-3" style={{ background:'rgba(0,229,255,0.03)', border:'1px solid rgba(0,229,255,0.1)' }}>
                <p className="text-xs font-bold mb-1.5 flex items-center gap-1" style={{ color:'#00E5FF' }}><MI name="preview" style={{fontSize:12}}/>Preview</p>
                {form.pembahasan.split('\n').map((line, i) => {
                  const t = line.trim();
                  if (!t) return <div key={i} style={{ height:3 }}/>;
                  if (t.startsWith('[RUMUS]'))     return <div key={i} className="text-xs mb-1 px-2 py-1 rounded" style={{ background:'rgba(245,158,11,0.1)', color:'#F59E0B', borderLeft:'2px solid #F59E0B' }}><b>RUMUS</b> {t.replace('[RUMUS]','').trim()}</div>;
                  if (t.startsWith('[LANGKAH]'))   return <div key={i} className="text-xs mb-1 px-2 py-1 rounded" style={{ background:'rgba(249,115,22,0.08)', color:'#FB923C', borderLeft:'2px solid #F97316' }}><b>LANGKAH</b> {t.replace('[LANGKAH]','').trim()}</div>;
                  if (t.startsWith('[INSTRUKSI]')) return <div key={i} className="text-xs mb-1 px-2 py-1 rounded" style={{ background:'rgba(167,139,250,0.08)', color:'#A78BFA', borderLeft:'2px solid #A78BFA' }}><b>↳</b> {t.replace('[INSTRUKSI]','').trim()}</div>;
                  if (t.startsWith('[HASIL]'))     return <div key={i} className="text-xs mb-1 px-2 py-1 rounded font-bold" style={{ background:'rgba(16,185,129,0.1)', color:'#10B981', borderLeft:'2px solid #10B981' }}><b>✓ HASIL</b> {t.replace('[HASIL]','').trim()}</div>;
                  return <div key={i} className="text-xs mb-0.5" style={{ color:'#64748B' }}>{line}</div>;
                })}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={()=>set('aktif',!form.aktif)} className="relative w-11 h-6 rounded-full transition-all flex-shrink-0" style={{ background:form.aktif?'#00E5FF':'#1E3A5F' }}>
              <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white" style={{ left:form.aktif?'22px':'2px', transition:'left .2s' }}/>
            </button>
            <span className="text-sm" style={{ color:form.aktif?'#00E5FF':'#475569' }}>{form.aktif?'Soal Aktif (tampil di tryout)':'Soal Nonaktif (tersembunyi)'}</span>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop:'1px solid #1E3A5F' }}>
          <button onClick={onClose} className="px-5 py-2 rounded-xl text-sm font-medium" style={{ background:'#1E3A5F33', color:'#64748B' }}>Batal</button>
          <button onClick={()=>onSave(form)} disabled={saving} className="px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2" style={{ background:'linear-gradient(135deg,#00E5FF,#0891B2)', color:'#050B18', opacity:saving?.6:1 }}>
            <MI name="save" style={{fontSize:16}}/>{saving?'Menyimpan...':'Simpan Soal'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL IMPORT ───
function ImportModal({ open, onClose, onImport, saving }) {
  const [files, setFiles]   = useState([]);
  const [isDrag, setIsDrag] = useState(false);
  const inputRef            = useRef(null);
  useEffect(()=>{ if(open) setFiles([]); },[open]);

  const parseText = (text) => {
    try {
      const match = text.match(/(?:const|let|var)\s+\w+\s*=\s*(\[[\s\S]*\])\s*;/);
      if (!match) return { err:'Array soal tidak ditemukan.' };
      // eslint-disable-next-line no-eval
      const arr = eval(match[1]);
      if (!Array.isArray(arr)||arr.length===0) return { err:'Array kosong.' };
      return { preview:arr };
    } catch(e) { return { err:'Gagal parse: '+e.message }; }
  };

  const readFile = (file) => new Promise(resolve=>{
    if (!file.name.endsWith('.js')) { resolve({ name:file.name, err:'Hanya file .js' }); return; }
    const r = new FileReader(); r.onload = e => resolve({ name:file.name, ...parseText(e.target.result) }); r.onerror = ()=>resolve({ name:file.name, err:'Gagal membaca.' }); r.readAsText(file);
  });

  const handleFiles = async(list) => {
    const arr = Array.from(list).filter(f=>f.name.endsWith('.js'));
    if(!arr.length) return;
    const results = await Promise.all(arr.map(readFile));
    setFiles(prev=>{ const ex=new Set(prev.map(f=>f.name)); return [...prev,...results.filter(r=>!ex.has(r.name))]; });
  };

  const totalSoal = files.reduce((a,f)=>a+(f.preview?.length||0),0);
  const doImport = () => {
    const all = files.flatMap(f=>f.preview||[]);
    onImport(all.map(s=>({ mapel:s.mapel||'default', kelas:s.kelas||'XI', bab:s.bab||'bab1', nama_bab:s.namaBab||s.nama_bab||'', teks:s.teks||'', pilihan:Array.isArray(s.pilihan)?s.pilihan:[], jawaban_benar:s.jawabanBenar??s.jawaban_benar??0, penjelasan:s.penjelasan||'', pembahasan:s.pembahasan||'', gambar:s.gambar||null, aktif:true })));
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:'rgba(5,11,24,0.94)', backdropFilter:'blur(8px)' }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden" style={{ background:'#0D1929', border:'1px solid #1E3A5F', maxHeight:'90vh', overflowY:'auto' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:'1px solid #1E3A5F' }}>
          <h2 className="font-bold text-lg flex items-center gap-2" style={{ color:'#00E5FF' }}><MI name="upload_file" style={{fontSize:20}}/>Import Soal — Upload File .js</h2>
          <button onClick={onClose} style={{ color:'#475569' }}><MI name="close" style={{fontSize:18}}/></button>
        </div>
        <div className="p-6 space-y-4">
          <div onDragOver={e=>{e.preventDefault();setIsDrag(true);}} onDragLeave={()=>setIsDrag(false)} onDrop={e=>{e.preventDefault();setIsDrag(false);handleFiles(e.dataTransfer.files);}} onClick={()=>inputRef.current?.click()}
            className="rounded-2xl flex flex-col items-center justify-center gap-3 py-10 cursor-pointer transition-all"
            style={{ border:`2px dashed ${isDrag?'#00E5FF':'#1E3A5F'}`, background:isDrag?'rgba(0,229,255,0.05)':'#0A1628' }}>
            <MI name={isDrag?'folder_open':'folder'} style={{ color:isDrag?'#00E5FF':'#334155', fontSize:44 }}/>
            <div className="text-center">
              <p className="text-sm font-bold" style={{ color:isDrag?'#00E5FF':'#CBD5E1' }}>{isDrag?'Lepas file di sini':'Drag & drop file .js di sini'}</p>
              <p className="text-xs mt-1" style={{ color:'#475569' }}>atau klik untuk pilih — bisa beberapa file sekaligus</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full font-mono" style={{ background:'#1E3A5F', color:'#64748B' }}>soalKimia.js · soalFisika.js · dll</span>
          </div>
          <input ref={inputRef} type="file" accept=".js" multiple className="hidden" onChange={e=>{handleFiles(e.target.files);e.target.value='';}}/>
          {files.length>0 && (
            <div className="space-y-2">
              {files.map(f=>(
                <div key={f.name} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background:f.err?'#F43F5E0A':'#00E5FF0A', border:`1px solid ${f.err?'#F43F5E33':'#00E5FF22'}` }}>
                  <MI name={f.err?'cancel':'check_circle'} style={{ color:f.err?'#F43F5E':'#10B981', fontSize:22 }}/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color:'#CBD5E1' }}>{f.name}</p>
                    {f.err?<p className="text-xs" style={{ color:'#F43F5E' }}>{f.err}</p>:<p className="text-xs" style={{ color:'#475569' }}>{f.preview.length} soal ditemukan</p>}
                  </div>
                  <button onClick={()=>setFiles(p=>p.filter(x=>x.name!==f.name))} className="text-xs px-2 py-1 rounded-lg" style={{ color:'#475569', background:'#1E3A5F33' }}><MI name="close" style={{fontSize:14}}/></button>
                </div>
              ))}
            </div>
          )}
          {totalSoal>0 && <div className="px-4 py-3 rounded-xl flex items-center gap-2" style={{ background:'rgba(0,229,255,0.06)', border:'1px solid #00E5FF22' }}>
            <MI name="task_alt" style={{ color:'#00E5FF', fontSize:18 }}/>
            <p className="text-sm font-bold" style={{ color:'#00E5FF' }}>Total: <strong>{totalSoal} soal</strong> dari {files.filter(f=>f.preview).length} file siap diimport</p>
          </div>}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop:'1px solid #1E3A5F' }}>
          <button onClick={onClose} className="px-5 py-2 rounded-xl text-sm" style={{ color:'#64748B' }}>Batal</button>
          <button onClick={doImport} disabled={saving||totalSoal===0} className="px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
            style={{ background:totalSoal>0?'linear-gradient(135deg,#00E5FF,#0891B2)':'#1E3A5F', color:totalSoal>0?'#050B18':'#334155', opacity:saving?.6:1 }}>
            <MI name="download" style={{fontSize:16}}/>{saving?'Mengimport...':totalSoal>0?`Import ${totalSoal} Soal`:'Pilih file dulu'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL DETAIL BAB (soal per bab dalam 1 mapel) ───
function DetailPaketModal({ open, onClose, mapel, kelas, onDeleteSoal, showToast }) {
  const [soalList, setSoalList] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [delId, setDelId]       = useState(null);
  const [saving, setSaving]     = useState(false);
  const [page, setPage]         = useState(1);
  const LIMIT = 15;

  const fetchSoal = useCallback(async()=>{
    if(!mapel) return;
    setLoading(true);
    let q = supabase.from('soal')
      .select('id,bab,nama_bab,teks,jawaban_benar,aktif')
      .eq('mapel', mapel)
      .order('bab', {ascending:true})
      .order('id',  {ascending:true});
    if(kelas) q = q.eq('kelas', kelas);
    const { data, error } = await q;
    if(error) showToast(error.message,'error');
    else setSoalList(data||[]);
    setLoading(false);
  },[mapel, kelas]);

  useEffect(()=>{ if(open) { setPage(1); fetchSoal(); } },[open, fetchSoal]);

  const handleDel = async(id)=>{
    setSaving(true);
    const { error } = await supabase.from('soal').delete().eq('id',id);
    setSaving(false); setDelId(null);
    if(error) showToast(error.message,'error');
    else { showToast('Soal dihapus.'); setSoalList(p=>p.filter(s=>s.id!==id)); onDeleteSoal(); }
  };

  const toggleAktif = async(s)=>{
    await supabase.from('soal').update({aktif:!s.aktif}).eq('id',s.id);
    setSoalList(p=>p.map(x=>x.id===s.id?{...x,aktif:!x.aktif}:x));
  };

  // group by bab
  const grouped = soalList.reduce((acc,s)=>{
    const key = s.bab||'bab?';
    if(!acc[key]) acc[key]={ bab:key, nama_bab:s.nama_bab||key, soal:[] };
    acc[key].soal.push(s);
    return acc;
  },{});
  const groups  = Object.values(grouped);
  const paged   = soalList.slice((page-1)*LIMIT, page*LIMIT);
  const pages   = Math.ceil(soalList.length/LIMIT);
  const cfg     = getCfg(mapel);

  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:'rgba(5,11,24,0.95)', backdropFilter:'blur(8px)' }}>
      <div className="w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col" style={{ background:'#0D1929', border:`1px solid ${cfg.color}33`, maxHeight:'90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom:'1px solid #1E3A5F', background:`linear-gradient(135deg,${cfg.color}0A,#0D1929)` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:cfg.color+'22' }}>
              <MI name={cfg.icon} style={{ color:cfg.color, fontSize:22 }}/>
            </div>
            <div>
              <h2 className="font-bold text-base" style={{ color:cfg.color }}>{cfg.label}</h2>
              <p className="text-xs" style={{ color:'#475569' }}>{soalList.length} soal · {groups.length} bab {kelas?`· Kelas ${kelas}`:''}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color:'#475569', background:'#1E3A5F33' }}><MI name="close" style={{fontSize:16}}/></button>
        </div>

        {/* Ringkasan Bab */}
        {groups.length > 0 && (
          <div className="px-6 pt-4 pb-2 flex-shrink-0">
            <p className="text-xs font-bold mb-2" style={{ color:'#475569' }}>RINGKASAN BAB</p>
            <div className="flex flex-wrap gap-2">
              {groups.map(g=>(
                <div key={g.bab} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium" style={{ background:cfg.color+'11', border:`1px solid ${cfg.color}33`, color:cfg.color }}>
                  <MI name="folder" style={{fontSize:12}}/>{g.nama_bab||g.bab}
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-black" style={{ background:cfg.color+'33', color:cfg.color }}>{g.soal.length}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List soal */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="py-12 text-center"><div className="w-8 h-8 rounded-full border-2 mx-auto animate-spin" style={{ borderColor:cfg.color, borderTopColor:'transparent' }}/></div>
          ) : soalList.length===0 ? (
            <div className="py-12 text-center"><MI name="inbox" style={{ color:'#334155', fontSize:44, display:'block', margin:'0 auto 8px' }}/><p style={{ color:'#475569' }}>Belum ada soal.</p></div>
          ) : (
            <div className="space-y-2">
              {paged.map((s,i)=>(
                <div key={s.id} className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background:'#0A1628', border:'1px solid #1E3A5F' }}>
                  <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black" style={{ background:'#1E3A5F', color:'#475569' }}>{(page-1)*LIMIT+i+1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:cfg.color+'22', color:cfg.color }}>{s.bab}</span>
                      <span className="text-xs truncate" style={{ color:'#475569' }}>{s.nama_bab}</span>
                    </div>
                    <p className="text-sm truncate" style={{ color:'#CBD5E1' }}>{s.teks?.replace(/\$/g,'')?.slice(0,90)}...</p>
                    <p className="text-xs mt-0.5" style={{ color:'#334155' }}>Jwb: {['A','B','C','D'][s.jawaban_benar]}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={()=>toggleAktif(s)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background:s.aktif?'#10B98122':'#F43F5E22', color:s.aktif?'#10B981':'#F43F5E' }} title={s.aktif?'Nonaktifkan':'Aktifkan'}>
                      <MI name={s.aktif?'check':'close'} style={{fontSize:12}}/>
                    </button>
                    <button onClick={()=>setDelId(s.id)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background:'#F43F5E11', color:'#F43F5E' }}>
                      <MI name="delete" style={{fontSize:12}}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 px-6 py-3 flex-shrink-0" style={{ borderTop:'1px solid #1E3A5F' }}>
            <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1" style={{ background:'#0A1628', color:page<=1?'#1E3A5F':'#CBD5E1', border:'1px solid #1E3A5F' }}><MI name="arrow_back" style={{fontSize:12}}/>Prev</button>
            <span className="text-xs" style={{ color:'#475569' }}>{page}/{pages}</span>
            <button disabled={page>=pages} onClick={()=>setPage(p=>p+1)} className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1" style={{ background:'#0A1628', color:page>=pages?'#1E3A5F':'#CBD5E1', border:'1px solid #1E3A5F' }}>Next<MI name="arrow_forward" style={{fontSize:12}}/></button>
          </div>
        )}
      </div>
      <Confirm open={!!delId} title="Hapus Soal?" msg="Soal ini akan dihapus permanen." onYes={()=>handleDel(delId)} onNo={()=>setDelId(null)} loading={saving}/>
    </div>
  );
}

// ─── TAB PAKET ───
function TabSoal({ adminId, showToast }) {
  const [paketList, setPaketList]     = useState([]); // [{mapel, total, aktif, bab_count}]
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [importOpen, setImport]       = useState(false);
  const [delMapel, setDelMapel]       = useState(null); // mapel yang akan dihapus semua soalnya
  const [detailPaket, setDetailPaket] = useState(null); // {mapel, kelas} yang dibuka detailnya

  const fetchPaket = useCallback(async()=>{
    setLoading(true);
    // Ambil semua soal, group by mapel di client (supabase free tidak punya group by RPC built-in)
    const { data, error } = await supabase.from('soal').select('id,mapel,kelas,bab,aktif');
    if(error){ showToast(error.message,'error'); setLoading(false); return; }

    // Group by mapel + kelas (agar kelas 11 dan 12 tidak campur)
    const map = {};
    (data||[]).forEach(s=>{
      const kls = s.kelas||'XI';
      const key = s.mapel+'__'+kls;
      if(!map[key]) map[key]={ mapel:s.mapel, kelas:kls, total:0, aktif:0, babs:new Set() };
      map[key].total++;
      if(s.aktif) map[key].aktif++;
      map[key].babs.add(s.bab);
    });
    const list = Object.values(map).map(p=>({ ...p, bab_count:p.babs.size }));
    // Urutkan: mapel dulu, lalu kelas
    list.sort((a,b)=>{
      const ia = MAPEL_LIST.findIndex(m=>m.value===a.mapel);
      const ib = MAPEL_LIST.findIndex(m=>m.value===b.mapel);
      if(ia !== ib) return (ia===-1?99:ia) - (ib===-1?99:ib);
      return (a.kelas||'').localeCompare(b.kelas||'');
    });
    setPaketList(list);
    setLoading(false);
  },[]);

  useEffect(()=>{ fetchPaket(); },[fetchPaket]);

  const handleImport = async(list)=>{
    setSaving(true);
    for(let i=0;i<list.length;i+=50){
      const chunk=list.slice(i,i+50).map(s=>({...s,created_by:adminId}));
      await supabase.from('soal').insert(chunk);
    }
    setSaving(false); setImport(false);
    showToast(`${list.length} soal berhasil diimport!`);
    fetchPaket();
  };

  const handleExportPaket = async(mapel, kelas) => {
    showToast('Mengambil data soal...', 'info');
    const { data, error } = await supabase
      .from('soal')
      .select('mapel,kelas,bab,nama_bab,teks,pilihan,jawaban_benar,penjelasan,pembahasan,gambar,aktif')
      .eq('mapel', mapel)
      .eq('kelas', kelas || 'XI')
      .order('bab')
      .order('id');
    if (error) { showToast(error.message, 'error'); return; }
    if (!data || data.length === 0) { showToast('Tidak ada soal untuk diekspor.', 'error'); return; }

    const cfg = getCfg(mapel);
    const varName = `soal${cfg.label.replace(/\s+/g,'')}${(kelas||'XI').replace(/[^a-zA-Z0-9]/g,'')}`;

    // Bangun konten JS
    const lines = [];
    lines.push(`// ARLearn — Export Paket Soal`);
    lines.push(`// Mata Pelajaran : ${cfg.label}`);
    lines.push(`// Kelas          : ${kelas||'XI'}`);
    lines.push(`// Total Soal     : ${data.length}`);
    lines.push(`// Diekspor pada  : ${new Date().toLocaleString('id-ID')}`);
    lines.push('');
    lines.push(`const ${varName} = [`);

    data.forEach((s, i) => {
      const pilihan = Array.isArray(s.pilihan) ? s.pilihan : JSON.parse(s.pilihan || '[]');
      const pilihanStr = pilihan.map(p => `'${p.replace(/'/g, "\'")}'`).join(', ');
      const teks = (s.teks || '').replace(/`/g, '\`').replace(/\\${/g, '\${');
      const penj = (s.penjelasan || '').replace(/'/g, "\'");
      const pemb = (s.pembahasan || '').replace(/`/g, '\`').replace(/\\${/g, '\${');
      lines.push(`  {`);
      lines.push(`    mapel: '${s.mapel}', kelas: '${kelas||'XI'}', bab: '${s.bab}',`);
      lines.push(`    nama_bab: '${(s.nama_bab||'').replace(/'/g,"\'")}',`);
      lines.push(`    teks: '${teks}',`);
      lines.push(`    pilihan: [${pilihanStr}],`);
      lines.push(`    jawabanBenar: ${s.jawaban_benar},`);
      lines.push(`    penjelasan: '${penj}',`);
      lines.push(`    pembahasan: \`${pemb}\`,`);
      lines.push(`    aktif: ${s.aktif !== false},`);
      if (s.gambar) lines.push(`    gambar: '${s.gambar}',`);
      lines.push(`  }${i < data.length - 1 ? ',' : ''}`);
    });

    lines.push(`];`);
    lines.push('');
    lines.push(`export default ${varName};`);

    const blob = new Blob([lines.join('\n')], { type: 'text/javascript' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `soal_${mapel}_kelas${(kelas||'XI').toLowerCase()}.js`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${data.length} soal berhasil diekspor!`);
  };

  const handleDeletePaket = async()=>{
    if(!delMapel) return;
    setSaving(true);
    const { error } = await supabase.from('soal').delete().eq('mapel', delMapel.mapel).eq('kelas', delMapel.kelas||'XI');
    setSaving(false); setDelMapel(null);
    if(error) showToast(error.message,'error');
    else { showToast(`Paket ${getCfg(delMapel.mapel).label} Kelas ${delMapel.kelas} dihapus.`); fetchPaket(); }
  };

  const totalSoal = paketList.reduce((a,p)=>a+p.total,0);

  // Mapel yang belum punya paket (untuk info)
  const existing  = new Set(paketList.map(p=>p.mapel));
  const kosong    = MAPEL_LIST.filter(m=>!existing.has(m.value) && m.value!=='default');

  return (
    <div className="space-y-6">
      {/* Header toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold" style={{ color:'#E2E8F0' }}>Kelola Paket Soal</h2>
          <p className="text-sm" style={{ color:'#475569' }}>
            {paketList.length} paket · {totalSoal} soal total
          </p>
        </div>
        <button onClick={()=>setImport(true)} className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2" style={{ background:'linear-gradient(135deg,#A78BFA,#7C3AED)', color:'#fff' }}>
          <MI name="upload_file" style={{fontSize:17}}/>Import Paket (.js)
        </button>
      </div>

      {/* Grid paket */}
      {loading ? (
        <div className="py-20 text-center"><div className="w-10 h-10 rounded-full border-2 mx-auto animate-spin" style={{ borderColor:'#00E5FF', borderTopColor:'transparent' }}/></div>
      ) : paketList.length===0 ? (
        <div className="py-20 text-center rounded-2xl" style={{ background:'#0D1929', border:'2px dashed #1E3A5F' }}>
          <MI name="inventory_2" style={{ color:'#1E3A5F', fontSize:56, display:'block', margin:'0 auto 12px' }}/>
          <p className="font-bold" style={{ color:'#334155' }}>Belum ada paket soal</p>
          <p className="text-sm mt-1" style={{ color:'#1E3A5F' }}>Klik "Import Paket (.js)" untuk menambahkan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paketList.map(p=>{
            const cfg = getCfg(p.mapel);
            const pctAktif = p.total>0 ? Math.round((p.aktif/p.total)*100) : 0;
            const paketKey = p.mapel+'__'+(p.kelas||'XI');
            return (
              <div key={paketKey} className="rounded-2xl overflow-hidden transition-all hover:scale-[1.01]"
                style={{ background:'#0D1929', border:`1px solid ${cfg.color}33`, boxShadow:`0 0 20px ${cfg.color}08` }}>
                {/* Card header */}
                <div className="px-5 pt-5 pb-4" style={{ background:`linear-gradient(135deg,${cfg.color}0D,#0D1929)` }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background:cfg.color+'22', border:`1px solid ${cfg.color}44` }}>
                        <MI name={cfg.icon} style={{ color:cfg.color, fontSize:24 }}/>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-base" style={{ color:cfg.color }}>{cfg.label}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background:'rgba(255,255,255,0.06)', color:'#94A3B8', border:'1px solid rgba(255,255,255,0.1)' }}>Kelas {p.kelas||'XI'}</span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color:'#475569' }}>{p.bab_count} bab</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black" style={{ color:'#E2E8F0' }}>{p.total}</div>
                      <div className="text-xs" style={{ color:'#475569' }}>soal</div>
                    </div>
                  </div>

                  {/* Progress bar aktif */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1" style={{ color:'#475569' }}>
                      <span>{p.aktif} aktif</span>
                      <span>{p.total-p.aktif} nonaktif</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background:'#1E3A5F' }}>
                      <div className="h-full rounded-full transition-all" style={{ width:`${pctAktif}%`, background:`linear-gradient(90deg,${cfg.color},${cfg.color}99)` }}/>
                    </div>
                    <div className="text-xs mt-1 text-right" style={{ color:cfg.color }}>{pctAktif}% aktif</div>
                  </div>
                </div>

                {/* Card actions */}
                <div className="flex items-center gap-2 px-5 py-3" style={{ borderTop:`1px solid ${cfg.color}22` }}>
                  <button onClick={()=>setDetailPaket({mapel:p.mapel,kelas:p.kelas||'XI'})}
                    className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    style={{ background:cfg.color+'22', color:cfg.color, border:`1px solid ${cfg.color}44` }}>
                    <MI name="list_alt" style={{fontSize:14}}/>Lihat Soal
                  </button>
                  <button onClick={()=>handleExportPaket(p.mapel, p.kelas||'XI')}
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
                    style={{ background:'rgba(34,197,94,0.1)', color:'#22C55E', border:'1px solid rgba(34,197,94,0.3)' }}
                    title={`Export soal ${cfg.label} Kelas ${p.kelas||'XI'} ke .js`}>
                    <MI name="download" style={{fontSize:16}}/>
                  </button>
                  <button onClick={()=>setDelMapel({mapel:p.mapel,kelas:p.kelas||'XI'})}
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ background:'#F43F5E11', color:'#F43F5E', border:'1px solid #F43F5E33' }}
                    title={`Hapus semua soal ${cfg.label}`}>
                    <MI name="delete_sweep" style={{fontSize:16}}/>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Slot mapel kosong (placeholder) */}
          {kosong.map(m=>(
            <div key={m.value} className="rounded-2xl p-5 flex flex-col items-center justify-center gap-2 min-h-[160px]"
              style={{ background:'#0A1628', border:'2px dashed #1E3A5F' }}>
              <MI name={m.icon} style={{ color:'#1E3A5F', fontSize:32 }}/>
              <p className="text-sm font-bold" style={{ color:'#334155' }}>{m.label}</p>
              <p className="text-xs" style={{ color:'#1E3A5F' }}>Belum ada soal</p>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ImportModal open={importOpen} onClose={()=>setImport(false)} onImport={handleImport} saving={saving}/>

      <DetailPaketModal
        open={!!detailPaket}
        onClose={()=>setDetailPaket(null)}
        mapel={detailPaket?.mapel}
        kelas={detailPaket?.kelas}
        onDeleteSoal={fetchPaket}
        showToast={showToast}
      />

      <Confirm
        open={!!delMapel}
        title={`Hapus Paket ${getCfg(delMapel?.mapel||'').label} Kelas ${delMapel?.kelas||''}?`}
        msg={`Semua soal ${getCfg(delMapel?.mapel||'').label} Kelas ${delMapel?.kelas||''} akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        onYes={handleDeletePaket}
        onNo={()=>setDelMapel(null)}
        loading={saving}
      />
    </div>
  );
}

// ─── TAB STATS ───
function TabStats() {
  const [stats, setStats]       = useState([]);
  const [topUsers, setTopUsers] = useState([]);

  useEffect(()=>{
    supabase.rpc('get_soal_stats').then(({data})=>setStats(data||[]));
    supabase.rpc('get_leaderboard').then(({data})=>setTopUsers(data||[]));
  },[]);

  const totalSoal = stats.reduce((a,s)=>a+Number(s.total),0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6" style={{ background:'linear-gradient(135deg,#00E5FF11,#0D1929)', border:'1px solid #00E5FF22' }}>
        <div className="text-5xl font-black mb-1" style={{ color:'#00E5FF' }}>{totalSoal}</div>
        <div className="text-sm" style={{ color:'#475569' }}>Total soal di database</div>
      </div>
      <div>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color:'#64748B' }}><MI name="bar_chart" style={{fontSize:16}}/>SOAL PER MATA PELAJARAN</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {stats.map(s=>{ const m=getCfg(s.mapel); const pct=totalSoal>0?Math.round((Number(s.aktif)/totalSoal)*100):0; return (
            <div key={s.mapel} className="rounded-2xl p-4" style={{ background:'#0D1929', border:`1px solid ${m.color}33` }}>
              <div className="flex items-center gap-2 mb-3"><MI name={m.icon} style={{ color:m.color, fontSize:20 }}/><span className="font-bold text-sm" style={{ color:m.color }}>{m.label}</span></div>
              <div className="text-3xl font-black mb-1" style={{ color:'#E2E8F0' }}>{s.total}</div>
              <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background:'#1E3A5F' }}><div className="h-full rounded-full" style={{ width:`${pct}%`, background:m.color }}/></div>
              <div className="text-xs" style={{ color:'#475569' }}><span style={{ color:'#10B981' }}>{s.aktif} aktif</span>{Number(s.nonaktif)>0&&<span style={{ color:'#F43F5E' }}> · {s.nonaktif} nonaktif</span>}</div>
            </div>
          );})}
        </div>
      </div>
      {topUsers.length>0 && (
        <div>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color:'#64748B' }}><MI name="emoji_events" style={{ color:'#F59E0B', fontSize:16 }}/>LEADERBOARD TRYOUT</h3>
          <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid #1E3A5F' }}>
            {topUsers.map((u,i)=>(
              <div key={i} className="flex items-center gap-4 px-5 py-3" style={{ background:i%2===0?'#0D1929':'#0A1628', borderBottom:'1px solid #1E3A5F11' }}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black" style={{ background:i===0?'#F59E0B':i===1?'#94A3B8':i===2?'#F97316':'#1E3A5F', color:i<3?'#050B18':'#64748B' }}>{i+1}</span>
                <span className="flex-1 text-sm font-medium" style={{ color:'#CBD5E1' }}>{u.display_name}</span>
                <span className="text-xs" style={{ color:'#475569' }}>{u.total_tryout}x</span>
                <span className="font-bold text-sm" style={{ color:'#00E5FF' }}>{u.skor_avg}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TAB USERS ───
function TabUsers({ showToast }) {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [newName, setNewName]   = useState('');
  const [newRole, setNewRole]   = useState('user');
  const [search, setSearch]     = useState('');

  const fetchUsers = async()=>{ setLoading(true); const {data,error}=await supabase.from('profiles').select('id,username,display_name,role,created_at').order('created_at',{ascending:false}); if(error) showToast(error.message,'error'); else setUsers(data||[]); setLoading(false); };
  useEffect(()=>{ fetchUsers(); },[]);

  const openEdit = (u)=>{ setEditUser(u); setNewName(u.display_name); setNewRole(u.role); };
  const handleSave = async()=>{ setSaving(true); const {error}=await supabase.from('profiles').update({display_name:newName,role:newRole}).eq('id',editUser.id); setSaving(false); if(error) showToast(error.message,'error'); else { showToast('User diperbarui!'); setEditUser(null); fetchUsers(); } };

  const filtered = users.filter(u=>u.display_name?.toLowerCase().includes(search.toLowerCase())||u.username?.toLowerCase().includes(search.toLowerCase()));
  const RC = { admin:'#00E5FF', user:'#10B981' };

  return (
    <div className="space-y-4">
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:'rgba(5,11,24,0.92)', backdropFilter:'blur(8px)' }}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background:'#0D1929', border:'1px solid #1E3A5F' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:'1px solid #1E3A5F' }}>
              <h2 className="font-bold flex items-center gap-2" style={{ color:'#00E5FF' }}><MI name="edit" style={{fontSize:18}}/>Edit User</h2>
              <button onClick={()=>setEditUser(null)} style={{ color:'#475569' }}><MI name="close" style={{fontSize:18}}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-xs font-bold mb-1" style={{ color:'#64748B' }}>USERNAME</label><p className="text-sm px-3 py-2 rounded-lg" style={{ background:'#0A1628', color:'#475569' }}>@{editUser.username}</p></div>
              <FInput label="DISPLAY NAME" value={newName} onChange={setNewName} placeholder="Nama tampilan"/>
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color:'#64748B' }}>ROLE</label>
                <div className="flex gap-2">
                  {['user','admin'].map(r=>(
                    <button key={r} onClick={()=>setNewRole(r)} className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5"
                      style={{ background:newRole===r?RC[r]+'22':'#0A1628', color:newRole===r?RC[r]:'#475569', border:`1px solid ${newRole===r?RC[r]+'44':'#1E3A5F'}` }}>
                      <MI name={r==='admin'?'admin_panel_settings':'person'} style={{fontSize:16}}/>{r==='admin'?'Admin':'User'}
                    </button>
                  ))}
                </div>
                {newRole==='admin'&&<p className="text-xs mt-2 flex items-center gap-1" style={{ color:'#F59E0B' }}><MI name="warning" style={{fontSize:12}}/>Admin dapat mengelola semua soal dan user.</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop:'1px solid #1E3A5F' }}>
              <button onClick={()=>setEditUser(null)} className="px-5 py-2 rounded-xl text-sm" style={{ color:'#64748B' }}>Batal</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2" style={{ background:'linear-gradient(135deg,#00E5FF,#0891B2)', color:'#050B18', opacity:saving?.6:1 }}><MI name="save" style={{fontSize:16}}/>{saving?'Menyimpan...':'Simpan'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="relative">
          <MI name="search" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#475569', fontSize:16 }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari user..." className="pl-8 pr-3 py-2 rounded-xl text-sm outline-none min-w-[220px]" style={{ background:'#0D1929', border:'1px solid #1E3A5F', color:'#CBD5E1' }}/>
        </div>
        <p className="text-sm" style={{ color:'#475569' }}>{filtered.length} user terdaftar</p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid #1E3A5F' }}>
        {loading ? (
          <div className="p-8 text-center" style={{ background:'#0D1929' }}><div className="w-8 h-8 rounded-full border-2 mx-auto animate-spin mb-2" style={{ borderColor:'#00E5FF', borderTopColor:'transparent' }}/></div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr style={{ background:'#0A1628', borderBottom:'1px solid #1E3A5F' }}>{['USERNAME','NAMA','ROLE','BERGABUNG','AKSI'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-bold" style={{ color:'#475569' }}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((u,i)=>(
                <tr key={u.id} style={{ background:i%2===0?'#0D1929':'#0A1628', borderBottom:'1px solid #1E3A5F11' }}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color:'#64748B' }}>@{u.username}</td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color:'#CBD5E1' }}>{u.display_name}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit" style={{ background:RC[u.role]+'22', color:RC[u.role], border:`1px solid ${RC[u.role]}44` }}><MI name={u.role==='admin'?'admin_panel_settings':'person'} style={{fontSize:11}}/>{u.role==='admin'?'Admin':'User'}</span></td>
                  <td className="px-4 py-3 text-xs" style={{ color:'#475569' }}>{new Date(u.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}</td>
                  <td className="px-4 py-3"><button onClick={()=>openEdit(u)} className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1" style={{ background:'#00E5FF22', color:'#00E5FF' }}><MI name="edit" style={{fontSize:13}}/>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── MAIN ADMIN PANEL ───
// ─── TAB LOGIN LOGS ───
function TabLoginLogs() {
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [filterEmail, setFilter]= useState('');
  const [inputEmail, setInput]  = useState('');

  const fetchLogs = useCallback(async (email = '') => {
    setLoading(true);

    // Ambil email semua admin untuk di-exclude dari log
    const { data: adminProfiles } = await supabase
      .from('profiles')
      .select('email')
      .eq('role', 'admin');
    const adminEmailList = (adminProfiles || []).map(p => p.email).filter(Boolean);

    // Tambahkan email admin yang sedang login (fallback jika kolom email tidak ada di profiles)
    const { data: sessionData } = await supabase.auth.getSession();
    const currentAdminEmail = sessionData?.session?.user?.email;
    if (currentAdminEmail && !adminEmailList.includes(currentAdminEmail)) {
      adminEmailList.push(currentAdminEmail);
    }

    let q = supabase
      .from('login_logs')
      .select('*')
      .order('logged_in_at', { ascending: false })
      .limit(200);
    if (email.trim()) q = q.ilike('user_email', `%${email.trim()}%`);
    const { data } = await q;

    // Filter: jangan tampilkan log milik admin
    const filtered = (data || []).filter(log => !adminEmailList.includes(log.user_email));
    setLogs(filtered);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleSearch = () => { setFilter(inputEmail); fetchLogs(inputEmail); };
  const handleReset  = () => { setInput(''); setFilter(''); fetchLogs(''); };

  // Hitung unique IP per email
  const uniqueIPs = filterEmail
    ? [...new Set(logs.map(l => l.ip_address).filter(Boolean))]
    : [];

  const getUAInfo = (ua = '') => {
    if (!ua) return { icon: 'devices', label: '—' };

    const browser =
      (ua.match(/Edg\/([\d.]+)/)     && 'Edge/'     + ua.match(/Edg\/([\d.]+)/)[1])     ||
      (ua.match(/OPR\/([\d.]+)/)     && 'Opera/'    + ua.match(/OPR\/([\d.]+)/)[1])     ||
      (ua.match(/Firefox\/([\d.]+)/) && 'Firefox/'  + ua.match(/Firefox\/([\d.]+)/)[1]) ||
      (ua.match(/Chrome\/([\d.]+)/)  && 'Chrome/'   + ua.match(/Chrome\/([\d.]+)/)[1])  ||
      (ua.match(/Safari\/([\d.]+)/)  && 'Safari/'   + ua.match(/Safari\/([\d.]+)/)[1])  ||
      'Browser';

    // Android: ambil nama device dari user agent
    if (/Android/.test(ua)) {
      const deviceMatch = ua.match(/\(Linux; Android [\d.]+;\s*([^)]+?)\s*(Build|\))/);
      const device = deviceMatch ? deviceMatch[1].trim() : '';
      const label = device ? `Android · ${device} · ${browser}` : `Android · ${browser}`;
      return { icon: 'phone_android', label };
    }

    // iPhone / iPad
    if (/iPhone/.test(ua)) return { icon: 'phone_iphone', label: `iPhone · ${browser}` };
    if (/iPad/.test(ua))   return { icon: 'phone_iphone', label: `iPad · ${browser}` };

    // Windows
    if (/Windows/.test(ua)) return { icon: 'computer', label: `Windows · ${browser}` };

    // Mac
    if (/Macintosh|Mac OS/.test(ua)) return { icon: 'laptop_mac', label: `Mac · ${browser}` };

    // Linux desktop
    if (/Linux/.test(ua)) return { icon: 'computer', label: `Linux · ${browser}` };

    return { icon: 'devices', label: ua.slice(0, 55) + '…' };
  };

  return (
    <div>
      {/* Search bar */}
      <div className="flex gap-2 mb-5">
        <div className="flex-1 relative">
          <MI name="search" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#475569', fontSize:18, pointerEvents:'none' }}/>
          <input
            value={inputEmail}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Filter email user (contoh: user@arlearn.id)"
            className="w-full py-2.5 rounded-xl text-sm outline-none"
            style={{ paddingLeft:40, paddingRight:16, background:'#0A1628', border:'1px solid #1E3A5F', color:'#CBD5E1' }}
          />
        </div>
        <button onClick={handleSearch}
          className="px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5"
          style={{ background:'#00E5FF', color:'#050B18' }}>
          <MI name="search" style={{fontSize:15}}/>Cari
        </button>
        <button onClick={handleReset}
          className="px-4 py-2 rounded-xl text-sm flex items-center gap-1.5"
          style={{ background:'#1E3A5F33', color:'#64748B', border:'1px solid #1E3A5F44' }}>
          <MI name="refresh" style={{fontSize:15}}/>Reset
        </button>
      </div>

      {/* Summary saat filter aktif */}
      {filterEmail && uniqueIPs.length > 0 && (
        <div className="rounded-xl p-4 mb-4 flex flex-wrap gap-4 items-center"
          style={{ background:'rgba(0,229,255,0.05)', border:'1px solid rgba(0,229,255,0.15)' }}>
          <div>
            <div className="text-xs font-bold mb-0.5" style={{ color:'#475569' }}>EMAIL</div>
            <div className="text-sm font-bold" style={{ color:'#00E5FF' }}>{filterEmail}</div>
          </div>
          <div>
            <div className="text-xs font-bold mb-0.5" style={{ color:'#475569' }}>TOTAL LOGIN</div>
            <div className="text-sm font-bold" style={{ color:'#F0F6FF' }}>{logs.length}x</div>
          </div>
          <div>
            <div className="text-xs font-bold mb-1" style={{ color:'#475569' }}>IP UNIK ({uniqueIPs.length})</div>
            <div className="flex flex-wrap gap-1.5">
              {uniqueIPs.map(ip => (
                <span key={ip} className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold"
                  style={{ background:'rgba(0,229,255,0.12)', color:'#00E5FF', border:'1px solid rgba(0,229,255,0.2)' }}>
                  {ip}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabel log */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor:'#00E5FF', borderTopColor:'transparent' }}/>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ background:'#0D1929', border:'1px dashed #1E3A5F' }}>
          <MI name="manage_search" style={{ color:'#1E3A5F', fontSize:40, display:'block', margin:'0 auto 10px' }}/>
          <p className="text-sm" style={{ color:'#334155' }}>Belum ada data login</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border:'1px solid #1E3A5F' }}>
          <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
          <table style={{ width:'100%', minWidth:600, fontSize:'0.875rem', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#0D1929' }}>
                {['#','Email','IP Address','Waktu Login','Device / Browser'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color:'#475569', borderBottom:'1px solid #1E3A5F' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={log.id} style={{ borderBottom:'1px solid rgba(30,58,95,0.4)', background: i%2===0 ? 'rgba(13,25,41,0.4)' : 'transparent' }}>
                  <td className="px-4 py-3 text-xs" style={{ color:'#334155' }}>{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold" style={{ color:'#CBD5E1' }}>{log.user_email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-lg text-xs font-mono font-bold"
                      style={{ background:'rgba(0,229,255,0.08)', color:'#00E5FF', border:'1px solid rgba(0,229,255,0.15)' }}>
                      {log.ip_address || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color:'#64748B' }}>
                    {new Date(log.logged_in_at).toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'short' })}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color:'#475569', maxWidth:220 }}>
                    {(() => { const ua = getUAInfo(log.user_agent); return (
                      <span className="flex items-center gap-1.5 truncate">
                        <MI name={ua.icon} style={{ fontSize:15, color:'#64748B', flexShrink:0 }}/>
                        <span className="truncate">{ua.label}</span>
                      </span>
                    ); })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="px-4 py-2.5 flex items-center justify-between" style={{ background:'#0D1929', borderTop:'1px solid #1E3A5F' }}>
            <span className="text-xs" style={{ color:'#334155' }}>Menampilkan {logs.length} entri terbaru</span>
            <button onClick={() => fetchLogs(filterEmail)} className="text-xs flex items-center gap-1" style={{ color:'#475569' }}>
              <MI name="refresh" style={{fontSize:13}}/>Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPanel({ onBack }) {
  const [profile, setProfile]   = useState(null);
  const [authLoad, setAuthLoad] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [tab, setTab]           = useState('soal');
  const [toast, setToast]       = useState(null);
  const [email, setEmail]       = useState('');
  const [pass, setPass]         = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [loginLoad, setLoginLoad] = useState(false);

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{
      if(data.session){ setSessionId(data.session.user.id); fetchProfile(data.session.user.id); } else setAuthLoad(false);
    });
    const {data:l}=supabase.auth.onAuthStateChange((_,s)=>{ if(s){ setSessionId(s.user.id); fetchProfile(s.user.id); } else { setProfile(null); setSessionId(null); setAuthLoad(false); } });
    return ()=>l.subscription.unsubscribe();
  },[]);

  const fetchProfile = async(uid)=>{ const {data}=await supabase.from('profiles').select('*').eq('id',uid).single(); setProfile(data); setAuthLoad(false); };

  const handleLogin = async()=>{
    setLoginErr(''); setLoginLoad(true);
    const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password:pass});
    setLoginLoad(false); if(error) setLoginErr(error.message);
  };

  const TABS = [
    { key:'soal',       label:'Kelola Paket', icon:'inventory_2' },
    { key:'stats',      label:'Statistik',    icon:'bar_chart'   },
    { key:'users',      label:'User',         icon:'group'       },
    { key:'login_logs', label:'Login Logs',   icon:'wifi_tethering' },
  ];

  if (authLoad) return <div className="min-h-screen flex items-center justify-center" style={{ background:'#050B18' }}><div className="w-12 h-12 rounded-full border-2 animate-spin" style={{ borderColor:'#00E5FF', borderTopColor:'transparent' }}/></div>;

  if (!profile || profile.role !== 'admin') return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background:'#050B18' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/favicon.png" alt="AR" style={{ width:64, height:64, objectFit:'contain', marginBottom:16 }}/>
          <h1 className="text-2xl font-black" style={{ color:'#E2E8F0' }}>Admin Panel</h1>
          <p className="text-sm mt-1" style={{ color:'#475569' }}>ARLearn · Kelola Soal & User</p>
        </div>
        <div className="rounded-2xl p-6 space-y-4" style={{ background:'#0D1929', border:'1px solid #1E3A5F' }}>
          <FInput label="EMAIL ADMIN" value={email} onChange={setEmail} placeholder="admin@arlearn.id" type="email"/>
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color:'#64748B' }}>PASSWORD</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()} placeholder="••••••••" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background:'#0A1628', border:'1px solid #1E3A5F', color:'#CBD5E1' }}/>
          </div>
          {loginErr&&<p className="text-xs p-2 rounded-lg" style={{ background:'#F43F5E11', color:'#F43F5E' }}>{loginErr}</p>}
          {profile&&profile.role!=='admin'&&<p className="text-xs text-center" style={{ color:'#F43F5E' }}>Akun ini bukan admin.</p>}
          <button onClick={handleLogin} disabled={loginLoad} className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2" style={{ background:'linear-gradient(135deg,#00E5FF,#0891B2)', color:'#050B18', opacity:loginLoad?.7:1 }}>
            <MI name="lock" style={{fontSize:16}}/>{loginLoad?'Masuk...':'Masuk sebagai Admin'}
          </button>
        </div>
        {onBack&&<button onClick={onBack} className="w-full mt-4 py-2 text-sm flex items-center justify-center gap-1" style={{ color:'#334155' }}><MI name="arrow_back" style={{fontSize:14}}/>Kembali ke ARLearn</button>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background:'#050B18', color:'#CBD5E1' }}>
      <Toast toast={toast}/>
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-3" style={{ background:'rgba(5,11,24,0.95)', backdropFilter:'blur(16px)', borderBottom:'1px solid #1E3A5F' }}>
        <div className="flex items-center gap-3">
          {onBack&&<button onClick={onBack} className="text-sm px-3 py-1.5 rounded-lg flex items-center gap-1" style={{ background:'#1E3A5F33', color:'#64748B' }}><MI name="arrow_back" style={{fontSize:14}}/>App</button>}
          <img src="/favicon.png" alt="AR" style={{ width:32, height:32, objectFit:'contain' }}/>
          <span className="font-bold text-sm" style={{ color:'#E2E8F0' }}>ARLearn <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background:'#00E5FF22', color:'#00E5FF' }}>ADMIN</span></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs hidden sm:block" style={{ color:'#475569' }}>{profile.display_name}</span>
          <button onClick={()=>supabase.auth.signOut()} className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1" style={{ background:'#F43F5E22', color:'#F43F5E', border:'1px solid #F43F5E33' }}><MI name="logout" style={{fontSize:14}}/>Keluar</button>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background:'#0D1929', border:'1px solid #1E3A5F' }}>
          {TABS.map(t=><button key={t.key} onClick={()=>setTab(t.key)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5" style={{ background:tab===t.key?'#00E5FF':'transparent', color:tab===t.key?'#050B18':'#475569' }}><MI name={t.icon} style={{fontSize:15}}/>{t.label}</button>)}
        </div>
        {tab==='soal'       && <TabSoal adminId={sessionId} showToast={showToast}/>}
        {tab==='stats'      && <TabStats/>}
        {tab==='users'      && <TabUsers showToast={showToast}/>}
        {tab==='login_logs' && <TabLoginLogs/>}
      </div>
    </div>
  );
}
