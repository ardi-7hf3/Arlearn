import React, { useState } from 'react';
import { getSoal, setSoal, resetSoal } from '../utils/soalStorage';
import CustomAlert from './CustomAlert';
import UploadSoalModal from './UploadSoalModal';
import FormatUploadModal from './FormatUploadModal';

const MAPEL_OPTS = [
  { value:'kimia',     label:'Kimia',       color:'#F59E0B', icon:'fa-solid fa-flask',          varExport:'soalKimia'    },
  { value:'fisika',    label:'Fisika',      color:'#00E5FF', icon:'fa-solid fa-atom',           varExport:'soalFisika'   },
  { value:'mtkLanjut', label:'MTK Lanjut', color:'#A78BFA', icon:'fa-solid fa-infinity',       varExport:'soalMtkLanjut'},
  { value:'mtkWajib',  label:'MTK Wajib',  color:'#10B981', icon:'fa-solid fa-calculator',     varExport:'soalMtkWajib' },
];

const BLANK = { teks:'', pilihan:['','','',''], jawabanBenar:0, penjelasan:'', mapel:'kimia' };

function downloadTemplate(mapel) {
  const varName = mapel.varExport;
  const sampleId = mapel.value === 'kimia' ? 9001 : mapel.value === 'fisika' ? 9101 : mapel.value === 'mtkLanjut' ? 9201 : 9301;
  const sampleTeks = mapel.value === 'kimia'
    ? 'Bilangan oksidasi Mn dalam $\\\\text{KMnO}_4$ adalah...'
    : mapel.value === 'fisika'
    ? 'Benda bermassa 5 kg diberi gaya 20 N. Percepatannya adalah $a=...$'
    : mapel.value === 'mtkLanjut'
    ? 'Nilai dari $\\\\lim_{x\\\\to 0}\\\\frac{\\\\sin x}{x}$ adalah...'
    : 'Nilai dari $3^2 + 4^2 = ...$';
  const samplePilihan = mapel.value === 'kimia'
    ? ['$+7$','$+5$','$+4$','$+6$']
    : mapel.value === 'fisika'
    ? ['$2$ m/s²','$4$ m/s²','$0{,}25$ m/s²','$100$ m/s²']
    : mapel.value === 'mtkLanjut'
    ? ['$0$','$1$','$\\\\infty$','Tidak ada']
    : ['$14$','$20$','$25$','$7$'];
  const content = `// ============================================================
// Template Soal ${mapel.label} — ARLearn
// ============================================================
// PETUNJUK PENGISIAN:
//  • id        : angka unik (wajib)
//  • mapel     : '${mapel.value}' (jangan diubah)
//  • teks      : teks soal, LaTeX inline $...$ atau blok $$...$$
//  • pilihan   : array 4 opsi jawaban (A, B, C, D)
//  • jawabanBenar : index jawaban benar (0=A, 1=B, 2=C, 3=D)
//  • penjelasan: ringkasan singkat (wajib)
//  • pembahasan: step-by-step lengkap (opsional)
//
// LaTeX dalam file .js harus pakai DOUBLE backslash:
//   \\\\frac{a}{b}  bukan  \\frac{a}{b}
//   \\\\sin x       bukan  \\sin x
// ============================================================

export const ${varName} = [
  {
    id: ${sampleId},
    mapel: '${mapel.value}',
    teks: "${sampleTeks}",
    pilihan: ${JSON.stringify(samplePilihan)},
    jawabanBenar: 1,
    penjelasan: "Isi penjelasan singkat di sini.",
    pembahasan: "Isi pembahasan lengkap step-by-step di sini."
  },
  // Tambahkan soal berikutnya di sini...
  // {
  //   id: ${sampleId + 1},
  //   mapel: '${mapel.value}',
  //   teks: "...",
  //   pilihan: ["A", "B", "C", "D"],
  //   jawabanBenar: 0,
  //   penjelasan: "...",
  //   pembahasan: "..."
  // },
];
`;
  const blob = new Blob([content], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `template_soal_${mapel.value}.js`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function KelolaSoalPage() {
  const [soalList, setSoalList] = useState(getSoal);
  const [filter, setFilter]     = useState('all');
  const [form, setForm]         = useState(BLANK);
  const [editId, setEditId]     = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [alert, setAlert]       = useState({ show: false });
  const [search, setSearch]     = useState('');
  const [showDownload, setShowDownload] = useState(false);
  const [showUpload, setShowUpload]     = useState(false);
  const [showFormat, setShowFormat]     = useState(false);

  const filtered = soalList.filter(s => {
    const matchMapel  = filter === 'all' || s.mapel === filter;
    const matchSearch = !search || s.teks.toLowerCase().includes(search.toLowerCase());
    return matchMapel && matchSearch;
  });

  const save = () => {
    if (!form.teks.trim())            return setAlert({ show:true, tipe:'warning', judul:'Soal Kosong',      pesan:'Teks soal tidak boleh kosong.' });
    if (form.pilihan.some(p=>!p.trim())) return setAlert({ show:true, tipe:'warning', judul:'Pilihan Kosong',  pesan:'Semua pilihan harus diisi.' });
    if (!form.penjelasan.trim())      return setAlert({ show:true, tipe:'warning', judul:'Penjelasan Kosong', pesan:'Penjelasan tidak boleh kosong.' });
    let newList;
    if (editId !== null) {
      newList = soalList.map(s => s.id === editId ? { ...s, ...form } : s);
    } else {
      newList = [...soalList, { id: Date.now(), ...form }];
    }
    setSoal(newList); setSoalList(newList);
    setShowForm(false); setForm(BLANK); setEditId(null);
    setAlert({ show:true, tipe:'success', judul:'Berhasil!', pesan: editId ? 'Soal berhasil diperbarui.' : 'Soal baru berhasil ditambahkan.' });
  };

  const hapus = (id) => {
    setAlert({
      show:true, tipe:'confirm', judul:'Hapus Soal?', pesan:'Soal ini akan dihapus permanen.',
      yesLabel:'Hapus', noLabel:'Batal',
      onYes: () => {
        const newList = soalList.filter(s => s.id !== id);
        setSoal(newList); setSoalList(newList); setAlert({ show:false });
      },
      onNo: () => setAlert({ show:false }),
    });
  };

  const edit = (s) => {
    setForm({ teks:s.teks, pilihan:[...s.pilihan], jawabanBenar:s.jawabanBenar, penjelasan:s.penjelasan||'', mapel:s.mapel||'kimia' });
    setEditId(s.id); setShowForm(true);
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  const handleReset = () => {
    setAlert({
      show:true, tipe:'confirm', judul:'Reset Soal?', pesan:'Semua soal kustom akan dihapus dan kembali ke 800 soal default.',
      yesLabel:'Ya, Reset', noLabel:'Batal',
      onYes: () => { const def = resetSoal(); setSoalList(def); setAlert({ show:false }); },
      onNo: () => setAlert({ show:false }),
    });
  };

  const mapelColor = (m) => MAPEL_OPTS.find(o => o.value===m)?.color || '#94A3B8';
  const mapelLabel = (m) => MAPEL_OPTS.find(o => o.value===m)?.label || m;
  const mapelIcon  = (m) => MAPEL_OPTS.find(o => o.value===m)?.icon  || 'fa-solid fa-circle';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fadeIn">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-black text-xl flex items-center gap-2" style={{ color:'#F0F6FF' }}>
            <i className="fa-solid fa-sliders" style={{ color:'#00E5FF' }} />
            Kelola Soal
          </h2>
          <p className="text-xs mt-0.5 pl-7" style={{ color:'#475569' }}>
            <i className="fa-solid fa-database mr-1" style={{ color:'#334155' }} />
            {soalList.length} soal tersimpan
          </p>
        </div>
        <div className="flex gap-2">
          {/* Format panduan */}
          <button
            onClick={() => setShowFormat(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
            style={{ background:'rgba(168,85,247,0.1)', color:'#A855F7', border:'1px solid rgba(168,85,247,0.25)' }}
            title="Lihat format upload soal">
            <i className="fa-solid fa-circle-question" />
            <span className="hidden sm:inline">Format</span>
          </button>

          {/* Upload soal */}
          <button
            onClick={() => setShowUpload(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
            style={{ background:'rgba(0,229,255,0.1)', color:'#00E5FF', border:'1px solid rgba(0,229,255,0.25)' }}
            title="Upload file soal .js / .docx">
            <i className="fa-solid fa-upload" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* Download Template */}
          <div className="relative">
            <button
              onClick={() => setShowDownload(v => !v)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
              style={{ background:'rgba(16,185,129,0.1)', color:'#10B981', border:'1px solid rgba(16,185,129,0.25)' }}
              title="Download Template Soal">
              <i className="fa-solid fa-download" />
              <span className="hidden sm:inline">Template</span>
            </button>
            {showDownload && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden z-50 animate-fadeIn"
                style={{ background:'#111827', border:'1px solid rgba(0,229,255,0.2)', boxShadow:'0 12px 40px rgba(0,0,0,0.6)' }}>
                <div className="px-3 py-2 border-b" style={{ borderColor:'#1E293B' }}>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color:'#475569' }}>
                    <i className="fa-solid fa-file-code mr-1.5" />Download Template .js
                  </p>
                </div>
                {MAPEL_OPTS.map(m => (
                  <button key={m.value}
                    onClick={() => { downloadTemplate(m); setShowDownload(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all text-left"
                    style={{ color:'#94A3B8' }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color=m.color; }}
                    onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#94A3B8'; }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background:`${m.color}15`, border:`1px solid ${m.color}30` }}>
                      <i className={`${m.icon} text-xs`} style={{ color:m.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-xs">{m.label}</p>
                      <p className="text-xs" style={{ color:'#475569' }}>template_soal_{m.value}.js</p>
                    </div>
                    <i className="fa-solid fa-arrow-down-to-line ml-auto text-xs" />
                  </button>
                ))}
                <div className="px-3 py-2 border-t" style={{ borderColor:'#1E293B' }}>
                  <p className="text-xs" style={{ color:'#334155' }}>
                    <i className="fa-solid fa-circle-info mr-1" />Edit & upload via tombol Upload
                  </p>
                </div>              </div>
            )}
          </div>

          {/* Reset */}
          <button onClick={handleReset}
            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
            style={{ background:'rgba(239,68,68,0.1)', color:'#EF4444', border:'1px solid rgba(239,68,68,0.2)' }}>
            <i className="fa-solid fa-rotate-right" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Tambah */}
          <button onClick={() => { setForm(BLANK); setEditId(null); setShowForm(s => !s); }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 btn-gradient">
            <i className={`fa-solid fa-${showForm ? 'xmark' : 'plus'}`} />
            <span className="hidden sm:inline">{showForm ? 'Tutup' : 'Tambah'}</span>
          </button>
        </div>
      </div>

      {/* ── Form Tambah/Edit ── */}
      {showForm && (
        <div className="rounded-2xl p-5 mb-5 animate-fadeIn"
          style={{ background:'#111827', border:'1px solid rgba(0,229,255,0.15)', boxShadow:'0 4px 24px rgba(0,0,0,0.3)' }}>
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color:'#F0F6FF' }}>
            <i className={`fa-solid fa-${editId ? 'pen-to-square' : 'circle-plus'}`}
               style={{ color: editId ? '#00E5FF' : '#10B981' }} />
            {editId ? 'Edit Soal' : 'Tambah Soal Baru'}
          </h3>

          {/* Mapel selector */}
          <div className="mb-4">
            <label className="block text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-1.5" style={{ color:'#64748B' }}>
              <i className="fa-solid fa-tag text-xs" />Mata Pelajaran
            </label>
            <div className="flex flex-wrap gap-2">
              {MAPEL_OPTS.map(m => (
                <button key={m.value} onClick={() => setForm(f => ({ ...f, mapel: m.value }))}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                  style={{
                    background: form.mapel===m.value ? `${m.color}18` : '#1E293B',
                    color:      form.mapel===m.value ? m.color : '#64748B',
                    border:     form.mapel===m.value ? `1px solid ${m.color}50` : '1px solid #2D3748',
                  }}>
                  <i className={`${m.icon} text-xs`} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Teks soal */}
          <div className="mb-3">
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider flex items-center gap-1.5" style={{ color:'#64748B' }}>
              <i className="fa-solid fa-align-left text-xs" />Teks Soal
              <span className="normal-case font-normal" style={{ color:'#334155' }}>— LaTeX: $...$ atau $$...$$</span>
            </label>
            <textarea rows={3} value={form.teks} onChange={e => setForm(f => ({ ...f, teks: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 text-sm input-neon resize-none"
              placeholder="Contoh: Nilai dari $x^2+2x+1$ jika $x=3$ adalah..."
              style={{ background:'#0B1121', border:'1px solid #1E293B', color:'#F0F6FF', outline:'none' }} />
          </div>

          {/* Pilihan */}
          <div className="mb-3">
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider flex items-center gap-1.5" style={{ color:'#64748B' }}>
              <i className="fa-solid fa-list-check text-xs" />Pilihan Jawaban
              <span className="normal-case font-normal" style={{ color:'#334155' }}>— klik huruf untuk set jawaban benar</span>
            </label>
            <div className="space-y-2">
              {['A','B','C','D'].map((label, j) => (
                <div key={j} className="flex items-center gap-2">
                  <button onClick={() => setForm(f => ({ ...f, jawabanBenar: j }))}
                    className="w-8 h-8 rounded-lg flex-shrink-0 font-bold text-xs flex items-center justify-center transition-all"
                    style={{
                      background: form.jawabanBenar===j ? 'rgba(16,185,129,0.2)' : '#1E293B',
                      color:      form.jawabanBenar===j ? '#10B981' : '#64748B',
                      border:     form.jawabanBenar===j ? '1px solid rgba(16,185,129,0.5)' : '1px solid #2D3748',
                    }}>
                    {form.jawabanBenar===j ? <i className="fa-solid fa-check text-xs" /> : label}
                  </button>
                  <input value={form.pilihan[j]} onChange={e => {
                      const p = [...form.pilihan]; p[j] = e.target.value;
                      setForm(f => ({ ...f, pilihan: p }));
                    }}
                    className="flex-1 rounded-xl px-3 py-2 text-sm input-neon"
                    placeholder={`Pilihan ${label}...`}
                    style={{ background:'#0B1121', border:'1px solid #1E293B', color:'#F0F6FF', outline:'none' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Penjelasan */}
          <div className="mb-4">
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider flex items-center gap-1.5" style={{ color:'#64748B' }}>
              <i className="fa-solid fa-lightbulb text-xs" />Penjelasan Singkat
            </label>
            <textarea rows={2} value={form.penjelasan} onChange={e => setForm(f => ({ ...f, penjelasan: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 text-sm input-neon resize-none"
              placeholder="Jelaskan mengapa jawaban tersebut benar..."
              style={{ background:'#0B1121', border:'1px solid #1E293B', color:'#F0F6FF', outline:'none' }} />
          </div>

          <div className="flex gap-2">
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background:'#1E293B', color:'#94A3B8', border:'1px solid #2D3748' }}>
              <i className="fa-solid fa-xmark" />Batal
            </button>
            <button onClick={save} className="flex-1 py-2.5 rounded-xl text-sm font-bold btn-gradient flex items-center justify-center gap-2">
              <i className={`fa-solid fa-${editId ? 'pen-to-square' : 'floppy-disk'}`} />
              {editId ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      {/* ── Filter & Search ── */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs" style={{ color:'#475569' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm input-neon"
            placeholder="Cari soal..."
            style={{ background:'#111827', border:'1px solid #1E293B', color:'#F0F6FF', outline:'none' }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('all')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
            style={{
              background: filter==='all' ? 'rgba(249,115,22,0.15)' : '#1E293B',
              color:      filter==='all' ? '#F97316' : '#64748B',
              border:     filter==='all' ? '1px solid rgba(249,115,22,0.3)' : '1px solid #2D3748',
            }}>
            <i className="fa-solid fa-layer-group text-xs" />
            Semua <span className="opacity-60">({soalList.length})</span>
          </button>
          {MAPEL_OPTS.map(m => {
            const count = soalList.filter(s => s.mapel === m.value).length;
            return (
              <button key={m.value} onClick={() => setFilter(m.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                style={{
                  background: filter===m.value ? `${m.color}18` : '#1E293B',
                  color:      filter===m.value ? m.color : '#64748B',
                  border:     filter===m.value ? `1px solid ${m.color}40` : '1px solid #2D3748',
                }}>
                <i className={`${m.icon} text-xs`} />
                {m.label} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Soal List ── */}
      <div className="space-y-2 pb-24">
        {filtered.length === 0 && (
          <div className="text-center py-14 rounded-2xl" style={{ background:'#111827', border:'1px solid #1E293B' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background:'#1E293B' }}>
              <i className="fa-solid fa-box-open text-xl" style={{ color:'#334155' }} />
            </div>
            <p className="text-sm font-semibold" style={{ color:'#475569' }}>Tidak ada soal ditemukan</p>
            <p className="text-xs mt-1" style={{ color:'#334155' }}>Coba ubah filter atau kata kunci</p>
          </div>
        )}
        {filtered.map((s, idx) => (
          <div key={s.id} className="rounded-xl p-4 card-hover group"
            style={{ background:'#111827', border:'1px solid #1A2235' }}>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{ background:`${mapelColor(s.mapel)}12`, color:mapelColor(s.mapel), border:`1px solid ${mapelColor(s.mapel)}28` }}>
                    <i className={`${mapelIcon(s.mapel)} text-xs`} />
                    {mapelLabel(s.mapel)}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background:'#1E293B', color:'#334155' }}>
                    #{idx + 1}
                  </span>
                </div>
                <p className="text-sm leading-relaxed line-clamp-2" style={{ color:'#94A3B8' }}>
                  {s.teks.replace(/\$+/g,'').replace(/\\/g,'')}
                </p>
                <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color:'#10B981' }}>
                  <i className="fa-solid fa-circle-check text-xs" />
                  {s.pilihan[s.jawabanBenar]?.replace(/\$+/g,'').replace(/\\/g,'').slice(0,60)}
                </p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => edit(s)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background:'rgba(0,229,255,0.07)', color:'#00E5FF', border:'1px solid rgba(0,229,255,0.15)' }}
                  title="Edit soal"
                  onMouseEnter={e => e.currentTarget.style.background='rgba(0,229,255,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(0,229,255,0.07)'}>
                  <i className="fa-solid fa-pen text-xs" />
                </button>
                <button onClick={() => hapus(s.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background:'rgba(239,68,68,0.07)', color:'#EF4444', border:'1px solid rgba(239,68,68,0.15)' }}
                  title="Hapus soal"
                  onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,0.07)'}>
                  <i className="fa-solid fa-trash text-xs" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overlay tutup dropdown */}
      {showDownload && (
        <div className="fixed inset-0 z-40" onClick={() => setShowDownload(false)} />
      )}

      <CustomAlert show={alert.show} tipe={alert.tipe} judul={alert.judul} pesan={alert.pesan}
        yesLabel={alert.yesLabel} noLabel={alert.noLabel}
        onOk={() => setAlert({ show:false })}
        onYes={alert.onYes} onNo={alert.onNo} />

      {/* Modal Upload Soal */}
      <UploadSoalModal
        show={showUpload}
        onClose={() => setShowUpload(false)}
        onSuccess={() => { setSoalList(getSoal()); setShowUpload(false); }}
      />

      {/* Modal Panduan Format */}
      <FormatUploadModal
        show={showFormat}
        onClose={() => setShowFormat(false)}
      />
    </div>
  );
}
