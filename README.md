# 🎓 ARLearn — Platform Tryout XI ARTERI

Platform tryout XI-ARTERI.

## ✨ Fitur Unggulan

### Untuk User
- 🔐 **Login & Autentikasi** — via Supabase Auth
- 📚 **Dropdown Mata Pelajaran** — pilih mapel → pilih kelas (X/XI/XII) → pilih bab
- 🧪 **Siluet Paket Belum Tersedia** — mapel/kelas yang belum punya soal ditampilkan terkunci (disabled) agar user tetap tahu mapel apa saja yang direncanakan
- 🎯 **Tryout Interaktif** — navigasi soal satu per satu, progress bar, indikator nomor soal (benar/salah/belum)
- 💡 **Penjelasan Lengkap Bertahap** — toggle **Singkat** vs **Lengkap** dengan tag terstruktur:
  - `[RUMUS]` — kotak rumus dasar (kuning)
  - `[LANGKAH]` — langkah bernomor (oranye)
  - `[INSTRUKSI]` — badge instruksi seperti *substitusikan*, *kalikan*, *bagikan* (ungu)
  - `[HASIL]` — kotak hasil akhir (hijau)
  - Render formula matematika dengan **LaTeX/KaTeX**
- 🎉 **Modal Hasil Tryout** — skor, statistik benar/salah, filter "tampilkan yang salah saja", efek confetti
- 📊 **Riwayat Tryout** — daftar percobaan dengan skor & tanggal
- 🔍 **Detail Riwayat per Soal** — klik salah satu riwayat → lihat daftar semua soal yang dikerjakan → klik satu soal → muncul panel slide-up berisi teks soal, pilihan (ditandai benar/salah), dan **penjelasan lengkap** persis seperti saat tryout
- 📱 **Responsive** — bottom navigation di mobile, navbar di desktop

### Untuk Admin
- 🗂️ **Kelola Paket Soal** — dikelompokkan per **Mata Pelajaran + Kelas** (misal "Kimia · Kelas XI" dan "Kimia · Kelas XII" tampil sebagai kartu terpisah)
- 📥 **Import Paket (.js)** — upload file soal dalam format JS array, langsung masuk ke database
- 📤 **Export Paket (.js)** — download seluruh soal dalam satu paket (mapel+kelas) sebagai file `.js` siap diedit/diimpor ulang
- 👁️ **Lihat & Hapus Soal** — detail per soal dalam satu paket, hapus satuan atau hapus seluruh paket
- ✏️ **Form Tambah/Edit Soal** — termasuk **panduan tag pembahasan** dengan tombol cepat sisip tag + preview live
- 📊 **Statistik & Leaderboard** — ringkasan tryout seluruh user
- 👥 **Manajemen User** — ubah nama tampilan & role (admin/user)

## 🚀 Cara Menjalankan

```bash
# 1. Clone / extract project
cd arlearn

# 2. Install dependencies
npm install

# 3. Konfigurasi environment variables (lihat bagian Konfigurasi)
cp .env.example .env

# 4. Jalankan development server
npm run dev

# 5. Build untuk produksi
npm run build
```

## ⚙️ Konfigurasi (.env)

Buat file `.env` di root project:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🗄️ Struktur Database (Supabase)

### Tabel `profiles`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid | FK ke `auth.users` |
| `display_name` | text | Nama tampilan user |
| `role` | text | `'admin'` atau `'user'` |
| `created_at` | timestamp | |

### Tabel `soal`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint | Primary key, auto increment |
| `mapel` | text | `'kimia'`, `'fisika'`, `'mtkLanjut'`, `'mtkWajib'`, `'pjok'`, `'default'` |
| `kelas` | text | `'X'`, `'XI'`, atau `'XII'` — **wajib**, memisahkan paket soal antar jenjang |
| `bab` | text | `'bab1'`, `'bab2'`, dst — penomoran lanjut antar kelas |
| `nama_bab` | text | Nama bab lengkap (ditampilkan di UI) |
| `teks` | text | Teks soal (mendukung LaTeX `$...$`) |
| `pilihan` | jsonb | Array 4 string opsi jawaban |
| `jawaban_benar` | integer | Index 0–3 |
| `penjelasan` | text | Penjelasan singkat (1–3 kalimat) |
| `pembahasan` | text | Pembahasan lengkap dengan tag `[RUMUS]/[LANGKAH]/[INSTRUKSI]/[HASIL]` |
| `aktif` | boolean | Soal aktif/nonaktif |

### Tabel `riwayat`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint | Primary key |
| `user_id` | uuid | FK ke `profiles` |
| `mapel` | text | |
| `kelas` | text | |
| `bab` | text | |
| `nama_bab` | text | |
| `total_soal` | integer | |
| `benar` | integer | |
| `salah` | integer | |
| `skor` | integer | 0–100 |
| `detail` | jsonb | `{ "0": jawabanIdx, "1": jawabanIdx, ... }` |
| `soal_list` | jsonb | Snapshot soal (teks, pilihan, jawaban benar, penjelasan, pembahasan) untuk ditampilkan ulang di Riwayat |
| `durasi_detik` | integer | Opsional |
| `tanggal` | timestamp | |

### Setup SQL cepat
```sql
alter table soal    add column if not exists kelas text default 'XI';
alter table riwayat add column if not exists kelas text;
alter table riwayat add column if not exists soal_list jsonb;
```

## 📁 Struktur Proyek

```
arlearn/
├── src/
│   ├── components/
│   │   ├── UserApp.jsx      # Seluruh halaman user: login, pilih mapel/kelas/bab,
│   │   │                     #   tryout, hasil, riwayat, detail penjelasan
│   │   └── AdminPanel.jsx   # Panel admin: kelola paket, import/export, statistik, user
│   ├── data/
│   │   └── soal_kimia_kelas11.js  # Contoh file bank soal siap import
│   ├── hooks/
│   │   ├── useLocalStorage.js
│   │   └── useConfetti.js
│   ├── lib/
│   │   └── supabase.js      # Inisialisasi Supabase client
│   ├── App.jsx               # Router 2 halaman: UserApp <-> AdminPanel
│   ├── main.jsx
│   └── index.css
├── public/
│   └── favicon.svg
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
└── README.md
```

## 📤 Format File Import Soal (.js)

Setiap file bank soal adalah array objek JS dengan struktur berikut:

```js
const soalKimia = [
  {
    mapel: 'kimia',
    kelas: 'XI',                 // 'X' | 'XI' | 'XII' — wajib
    bab: 'bab1',
    nama_bab: 'Perhitungan pH Larutan Asam Basa',
    teks: 'Hitunglah pH larutan $\\text{HCl}$ $0{,}01$ M!',
    pilihan: ['$1$', '$2$', '$3$', '$4$'],
    jawabanBenar: 1,              // index 0-3
    penjelasan: '$[\\text{H}^+] = 0{,}01 = 10^{-2}$ M, maka $\\text{pH} = 2$.',
    pembahasan: `[RUMUS] $\\text{pH} = -\\log[\\text{H}^+]$
[LANGKAH] Tuliskan reaksi ionisasi HCl sebagai asam kuat
$\\text{HCl} \\rightarrow \\text{H}^+ + \\text{Cl}^-$
[INSTRUKSI] Substitusikan ke dalam rumus pH
$\\text{pH} = -\\log(10^{-2})$
[HASIL] $\\text{pH} = 2$`,
  },
];

export default soalKimia;
```

**Aturan penting:**
- `pilihan` selalu **4 elemen**
- `jawabanBenar` adalah **index** (0–3), bukan teks jawaban — hitung dulu jawaban secara matematis sebelum mengisi
- LaTeX menggunakan **double backslash** dan desimal `{,}` (bukan titik)
- Variabel konsentrasi: gunakan `M_a` (asam) / `M_b` (basa), **bukan** `C`
- Tag pembahasan urutan: `[RUMUS]` → `[LANGKAH]` → `[INSTRUKSI]` → `[HASIL]` (wajib ada)
- `kelas` wajib diisi agar Admin Panel tidak menggabungkan paket kelas XI dan XII

> 📄 Panduan lengkap dengan contoh benar/salah ada di file `formatsoal.md`.

Cara import: **Admin Panel → Kelola Paket → Import Paket (.js)** → pilih file.

## 🎨 Teknologi

- **React 18** + **Vite 5**
- **Tailwind CSS**
- **Supabase** — Auth, Database (Postgres), penyimpanan riwayat & bank soal
- **KaTeX / react-katex** — render formula matematika
- **canvas-confetti** — efek konfeti saat hasil tryout
- **mammoth.js** — parsing dokumen (opsional)
- **Material Icons (CDN)** — seluruh ikon UI

## 🌐 Deploy ke Vercel

```bash
npm run build
vercel --prod
```

Pastikan environment variables `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` sudah diset di dashboard Vercel.

---

Made by Ardi 7HF3
