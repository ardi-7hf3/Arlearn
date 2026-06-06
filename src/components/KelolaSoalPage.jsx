import React, { useState } from 'react';
import { getSoal, setSoal, resetSoal, getDefaultSoal } from '../utils/soalStorage';
import CustomAlert from './CustomAlert';

const MAPEL_OPTS = [
  { value:'kimia',     label:'Kimia',        color:'#F59E0B' },
  { value:'fisika',    label:'Fisika',        color:'#00E5FF' },
  { value:'mtkLanjut', label:'MTK Lanjut',   color:'#A78BFA' },
  { value:'mtkWajib',  label:'MTK Wajib',    color:'#10B981' },
];

const BLANK = { teks:'', pilihan:['','','',''], jawabanBenar:0, penjelasan:'', mapel:'kimia' };

export default function KelolaSoalPage() {
  const [soalList, setSoalList]   = useState(getSoal);
  const [filter, setFilter]       = useState('all');
  const [form, setForm]           = useState(BLANK);
  const [editId, setEditId]       = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [alert, setAlert]         = useState({ show: false });
  const [search, setSearch]       = useState('');

  const filtered = soalList.filter(s => {
    const matchMapel = filter === 'all' || s.mapel === filter;
    const matchSearch = !search || s.teks.toLowerCase().includes(search.toLowerCase());
    return matchMapel && matchSearch;
  });

  const save = () => {
    if (!form.teks.trim()) return setAlert({ show:true, tipe:'warning', judul:'Soal Kosong', pesan:'Teks soal tidak boleh kosong.' });
    if (form.pilihan.some(p => !p.trim())) return setAlert({ show:true, tipe:'warning', judul:'Pilihan Kosong', pesan:'Semua pilihan harus diisi.' });
    if (!form.penjelasan.trim()) return setAlert({ show:true, tipe:'warning', judul:'Penjelasan Kosong', pesan:'Penjelasan tidak boleh kosong.' });

    let newList;
    if (editId !== null) {
      newList = soalList.map(s => s.id === editId ? { ...s, ...form } : s);
    } else {
      const newId = Date.now();
      newList = [...soalList, { id: newId, ...form }];
    }
    setSoal(newList);
    setSoalList(newList);
    setShowForm(false);
    setForm(BLANK);
    setEditId(null);
    setAlert({ show:true, tipe:'success', judul:'Berhasil!', pesan: editId ? 'Soal berhasil diperbarui.' : 'Soal baru berhasil ditambahkan.' });
  };

  const hapus = (id) => {
    setAlert({
      show:true, tipe:'confirm', judul:'Hapus Soal?', pesan:'Soal ini akan dihapus permanen.',
      yesLabel:'Ya, Hapus', noLabel:'Batal',
      onYes: () => {
        const newList = soalList.filter(s => s.id !== id);
        setSoal(newList);
        setSoalList(newList);
        setAlert({ show:false });
      },
      onNo: () => setAlert({ show:false }),
    });
  };

  const edit = (s) => {
    setForm({ teks:s.teks, pilihan:[...s.pilihan], jawabanBenar:s.jawabanBenar, penjelasan:s.penjelasan||'', mapel:s.mapel||'kimia' });
    setEditId(s.id);
    setShowForm(true);
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  const handleReset = () => {
    setAlert({
      show:true, tipe:'confirm', judul:'Reset Soal?', pesan:'Semua soal kustom akan dihapus dan kembali ke soal default (800 soal).',
      yesLabel:'Ya, Reset', noLabel:'Batal',
      onYes: () => {
        const def = resetSoal();
        setSoalList(def);
        setAlert({ show:false });
      },
      onNo: () => setAlert({ show:false }),
    });
  };

  const mapelColor = (m) => MAPEL_OPTS.find(o => o.value===m)?.color || '#94A3B8';
  const mapelLabel = (m) => MAPEL_OPTS.find(o => o.value===m)?.label || m;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-black text-xl" style={{ color:'#F0F6FF' }}>Kelola Soal</h2>
          <p className="text-xs mt-0.5" style={{ color:'#475569' }}>{soalList.length} soal tersimpan</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset}
            className="px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background:'rgba(239,68,68,0.1)', color:'#EF4444', border:'1px solid rgba(239,68,68,0.2)' }}>
            <i className="fa-solid fa-rotate-right mr-1" />Reset
          </button>
          <button onClick={() => { setForm(BLANK); setEditId(null); setShowForm(s => !s); }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold btn-gradient">
            <i className={`fa-solid fa-${showForm?'minus':'plus'} mr-1`} />
            {showForm ? 'Tutup' : 'Tambah'}
          </button>
        </div>
      </div>

      {/* Form tambah/edit */}
      {showForm && (
        <div className="rounded-2xl p-5 mb-5 animate-fadeIn"
          style={{ background:'#111827', border:'1px solid rgba(0,229,255,0.15)' }}>
          <h3 className="font-bold text-base mb-4" style={{ color:'#F0F6FF' }}>
            {editId ? '✏️ Edit Soal' : '➕ Tambah Soal Baru'}
          </h3>

          {/* Mapel */}
          <div className="mb-3">
            <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color:'#64748B' }}>Mata Pelajaran</label>
            <div className="flex flex-wrap gap-2">
              {MAPEL_OPTS.map(m => (
                <button key={m.value} onClick={() => setForm(f => ({ ...f, mapel: m.value }))}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: form.mapel===m.value ? `${m.color}20` : '#1E293B',
                    color: form.mapel===m.value ? m.color : '#64748B',
                    border: form.mapel===m.value ? `1px solid ${m.color}50` : '1px solid #2D3748',
                  }}>{m.label}</button>
              ))}
            </div>
          </div>

          {/* Teks soal */}
          <div className="mb-3">
            <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color:'#64748B' }}>Teks Soal (LaTeX: $...$ atau $$...$$)</label>
            <textarea rows={3} value={form.teks} onChange={e => setForm(f => ({ ...f, teks: e.target.value }))}
              className="w-full rounded-xl px-3 py-2 text-sm input-neon resize-none"
              placeholder="Contoh: Nilai dari $x^2+2x+1$ jika $x=3$ adalah..."
              style={{ background:'#0B1121', border:'1px solid #1E293B', color:'#F0F6FF', outline:'none' }} />
          </div>

          {/* Pilihan */}
          {['A','B','C','D'].map((label, j) => (
            <div key={j} className="mb-2 flex items-center gap-2">
              <button onClick={() => setForm(f => ({ ...f, jawabanBenar: j }))}
                className="w-7 h-7 rounded-lg flex-shrink-0 font-bold text-xs flex items-center justify-center transition-all"
                style={{
                  background: form.jawabanBenar===j ? 'rgba(16,185,129,0.2)' : '#1E293B',
                  color: form.jawabanBenar===j ? '#10B981' : '#64748B',
                  border: form.jawabanBenar===j ? '1px solid rgba(16,185,129,0.4)' : '1px solid #2D3748',
                }}>{label}</button>
              <input value={form.pilihan[j]} onChange={e => {
                  const p = [...form.pilihan]; p[j] = e.target.value;
                  setForm(f => ({ ...f, pilihan: p }));
                }}
                className="flex-1 rounded-xl px-3 py-2 text-sm input-neon"
                placeholder={`Pilihan ${label}...`}
                style={{ background:'#0B1121', border:'1px solid #1E293B', color:'#F0F6FF', outline:'none' }} />
            </div>
          ))}

          {/* Penjelasan */}
          <div className="mt-3">
            <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color:'#64748B' }}>Penjelasan Singkat</label>
            <textarea rows={2} value={form.penjelasan} onChange={e => setForm(f => ({ ...f, penjelasan: e.target.value }))}
              className="w-full rounded-xl px-3 py-2 text-sm input-neon resize-none"
              placeholder="Jelaskan jawaban yang benar..."
              style={{ background:'#0B1121', border:'1px solid #1E293B', color:'#F0F6FF', outline:'none' }} />
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background:'#1E293B', color:'#94A3B8', border:'1px solid #2D3748' }}>Batal</button>
            <button onClick={save} className="flex-1 py-2.5 rounded-xl text-sm font-bold btn-gradient">
              <i className="fa-solid fa-floppy-disk mr-1" />{editId ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search */}
      <div className="mb-4 space-y-2">
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color:'#475569' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm input-neon"
            placeholder="Cari soal..."
            style={{ background:'#111827', border:'1px solid #1E293B', color:'#F0F6FF', outline:'none' }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('all')}
            className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
            style={{ background: filter==='all' ? 'rgba(249,115,22,0.15)' : '#1E293B', color: filter==='all' ? '#F97316':'#64748B', border: filter==='all'?'1px solid rgba(249,115,22,0.3)':'1px solid #2D3748' }}>
            Semua ({soalList.length})
          </button>
          {MAPEL_OPTS.map(m => {
            const count = soalList.filter(s => s.mapel === m.value).length;
            return (
              <button key={m.value} onClick={() => setFilter(m.value)}
                className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                style={{ background: filter===m.value ? `${m.color}20` : '#1E293B', color: filter===m.value?m.color:'#64748B', border: filter===m.value?`1px solid ${m.color}40`:'1px solid #2D3748' }}>
                {m.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2 pb-4">
        {filtered.length === 0 && (
          <div className="text-center py-12" style={{ color:'#334155' }}>
            <i className="fa-solid fa-box-open text-3xl mb-2 block" />
            <p className="text-sm">Tidak ada soal ditemukan</p>
          </div>
        )}
        {filtered.map((s, idx) => (
          <div key={s.id} className="rounded-xl p-4 card-hover"
            style={{ background:'#111827' }}>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background:`${mapelColor(s.mapel)}15`, color:mapelColor(s.mapel), border:`1px solid ${mapelColor(s.mapel)}30` }}>
                    {mapelLabel(s.mapel)}
                  </span>
                  <span className="text-xs" style={{ color:'#334155' }}>#{idx+1}</span>
                </div>
                <p className="text-sm leading-relaxed line-clamp-2" style={{ color:'#94A3B8' }}>{s.teks.replace(/\$+/g,'').replace(/\\/g,'')}</p>
                <p className="text-xs mt-1" style={{ color:'#10B981' }}>
                  ✓ {s.pilihan[s.jawabanBenar]?.replace(/\$+/g,'').replace(/\\/g,'').slice(0,50)}
                </p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => edit(s)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background:'rgba(0,229,255,0.08)', color:'#00E5FF', border:'1px solid rgba(0,229,255,0.15)' }}>
                  <i className="fa-solid fa-pen text-xs" />
                </button>
                <button onClick={() => hapus(s.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background:'rgba(239,68,68,0.08)', color:'#EF4444', border:'1px solid rgba(239,68,68,0.15)' }}>
                  <i className="fa-solid fa-trash text-xs" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CustomAlert show={alert.show} tipe={alert.tipe} judul={alert.judul} pesan={alert.pesan}
        yesLabel={alert.yesLabel} noLabel={alert.noLabel}
        onOk={() => setAlert({ show:false })}
        onYes={alert.onYes} onNo={alert.onNo} />
    </div>
  );
}
