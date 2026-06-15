# FORMAT SOAL ARLEARN — PANDUAN LENGKAP UNTUK AI

> Dokumen ini wajib dibaca sebelum membuat atau mengedit file soal `.js` untuk aplikasi ARLearn.
> Berisi aturan struktur data, format LaTeX, tag pembahasan, validasi kunci jawaban, dan contoh lengkap.

---

## 1. STRUKTUR FILE JS

```js
// Header komentar (wajib ada)
const soalNamaMapel = [
  { ...soal1 },
  { ...soal2 },
  // dst.
];

export default soalNamaMapel;
```

### Nama variabel berdasarkan mapel & kelas:
| Mapel | Kelas | Nama Variabel |
|---|---|---|
| Kimia | XI | `soalKimia` |
| Kimia | XII | `soalKimia12` |
| Fisika | XI | `soalFisika` |
| PK UTBK | UTBK | `soalPKUTBK2025` |
| PM UTBK | UTBK | `soalPMDay1` |
| dst. | UTBK | `soal[SubTes][Paket]` |

---

## 2. STRUKTUR TIAP OBJEK SOAL

```js
{
  mapel: 'kimia',           // string: kode mapel (lihat tabel mapel di bawah)
  kelas: 'XI',              // string: 'X' | 'XI' | 'XII' | 'UTBK'
  bab: 'bab1',              // string: 'bab1' | 'bab2' | dst.
  nama_bab: 'Nama Bab',     // string: nama bab/paket (ditampilkan di UI)
  teks: '...',              // string: teks soal
  pilihan: ['A','B','C','D'], // array TEPAT 4 string
  jawabanBenar: 0,          // integer: INDEX jawaban benar (0=A, 1=B, 2=C, 3=D)
  penjelasan: '...',        // string: penjelasan SINGKAT (1–3 kalimat)
  pembahasan: `...`,        // template literal: pembahasan LENGKAP dengan tag
  gambar: null,             // string | null: base64 image 'data:image/jpeg;base64,...'
}
```

> ⚠️ **WAJIB**: `pilihan` selalu berisi tepat **4 elemen**. `jawabanBenar` adalah **index (0–3)**.
> ⚠️ **WAJIB**: `kelas` harus diisi agar soal tidak bergabung antar paket di Admin Panel.

---

## 3. TABEL KODE MAPEL

### 3a. Mata Pelajaran Sekolah → dropdown "Mata Pelajaran Sekolah"

| Kode `mapel` | Label UI | Kelas yang valid |
|---|---|---|
| `kimia` | Kimia | X, XI, XII |
| `fisika` | Fisika | X, XI, XII |
| `mtkLanjut` | MTK Lanjut | X, XI, XII |
| `mtkWajib` | MTK Wajib | X, XI, XII |
| `pjok` | PJOK | X, XI, XII |

### 3b. Sub Tes UTBK/SNBT → dropdown "Sub Tes UTBK / SNBT"

| Kode `mapel` | Label UI | Kelas WAJIB | Keterangan |
|---|---|---|---|
| `pk` | Penalaran Kuantitatif | `UTBK` | Matematika/logika numerik |
| `pm` | Penalaran Matematika | `UTBK` | Aljabar, geometri, statistika |
| `pu` | Penalaran Umum | `UTBK` | Logika verbal & analitis |
| `ppu` | Pengetahuan & Pemahaman Umum | `UTBK` | IPA, IPS, sains umum |
| `pbm` | Pemahaman Bacaan & Menulis | `UTBK` | Teks bahasa Indonesia |
| `lbi` | Literasi Bahasa Indonesia | `UTBK` | Membaca & menulis Bahasa Indonesia |
| `lbe` | Literasi Bahasa Inggris | `UTBK` | Reading & writing English |

> ⚠️ **WAJIB untuk UTBK**: Semua sub tes SNBT **harus** menggunakan `kelas: 'UTBK'` agar muncul di dropdown Sub Tes dan tombol kelas UTBK aktif.

---

## 4. SISTEM PENOMORAN BAB

### Mapel Sekolah:
```
Kelas XI:  kelas: 'XI'
  bab1 → Topik 1
  bab2 → Topik 2

Kelas XII: kelas: 'XII'
  bab4 → Topik 4  (lanjut dari kelas XI, tidak mulai dari bab1 lagi)
  bab5 → Topik 5
```

### Sub Tes UTBK:
```
kelas: 'UTBK'  (selalu untuk semua sub tes SNBT)
  bab1 → Paket 1 / Day 1 / Sesi 1
  bab2 → Paket 2 / Day 1 Sesi 2
  bab3 → Paket 3 / Day 2
  dst.
```

> nama_bab untuk UTBK sebaiknya deskriptif, contoh:
> `'PK UTBK 2025 — Penalaran Kuantitatif'`
> `'PM Day 2 — Penalaran Matematika'`

---

## 5. ATURAN `jawabanBenar` (INDEX)

```
pilihan: ['$1$', '$2$', '$3$', '$4$']
          idx=0   idx=1   idx=2   idx=3
```

### Langkah wajib sebelum mengisi `jawabanBenar`:
1. **Hitung jawaban secara matematis terlebih dahulu**
2. Cocokkan hasil perhitungan dengan pilihan di array
3. Isi `jawabanBenar` dengan **index** pilihan yang cocok

---

## 6. FORMAT LaTeX

### 6a. Penulisan dalam string biasa (`'...'`)
Gunakan **double backslash** `\\` untuk semua perintah LaTeX:

```js
teks: 'Hitunglah pH larutan $\\text{HCl}$ $0{,}01$ M!',
penjelasan: '$[\\text{H}^+] = 10^{-2}$ M, maka $\\text{pH} = 2$.',
```

### 6b. Penulisan dalam template literal (`` `...` ``)
Gunakan **double backslash** `\\` juga:

```js
pembahasan: `[RUMUS] $\\text{pH} = -\\log[\\text{H}^+]$
[HASIL] $\\text{pH} = 2$`,
```

### 6c. Aturan desimal — gunakan `{,}` bukan `.`
```js
'$0{,}05$ M'    // ✅ tampil: 0,05 M
'$0.05$ M'      // ❌ tampil: 0.05 M
```

---

## 7. TAG PEMBAHASAN LENGKAP

Field `pembahasan` menggunakan **template literal** dan mendukung 4 tag khusus:

| Tag | Warna | Fungsi |
|---|---|---|
| `[RUMUS] ...` | 🟡 Kuning | Rumus dasar yang digunakan |
| `[LANGKAH] ...` | 🟠 Oranye | Setup/identifikasi masalah |
| `[INSTRUKSI] ...` | 🟣 Ungu | Operasi/kalkulasi |
| `[HASIL] ...` | 🟢 Hijau | Hasil akhir — **wajib ada** |

### Struktur urutan:
```
[RUMUS]     → rumus dasar
[LANGKAH]   → identifikasi data
[INSTRUKSI] → operasi pertama
[INSTRUKSI] → operasi kedua
[HASIL]     → jawaban akhir
```

---

## 8. FIELD `gambar` (OPSIONAL)

Untuk soal yang memiliki gambar/diagram/grafik:

```js
// Soal dengan gambar (base64)
{
  ...
  gambar: 'data:image/jpeg;base64,/9j/4AAQ...', // base64 string
}

// Soal tanpa gambar
{
  ...
  gambar: null,  // atau tidak perlu ditulis sama sekali
}
```

> Gambar biasanya adalah screenshot halaman PDF soal yang di-encode ke base64.
> Tampil otomatis di bawah teks soal saat tryout dan di review hasil.

---

## 9. CONTOH SOAL MAPEL SEKOLAH (KIMIA)

```js
{
  mapel: 'kimia', kelas: 'XI', bab: 'bab1',
  nama_bab: 'Perhitungan pH Larutan Asam Basa',
  teks: 'Hitunglah pH larutan $\\text{NaOH}$ $0{,}001$ M!',
  pilihan: ['$11$', '$12$', '$13$', '$3$'],
  jawabanBenar: 0,
  penjelasan: '$[\\text{OH}^-] = 10^{-3}$ M, $\\text{pOH} = 3$, maka $\\text{pH} = 11$.',
  pembahasan: `[RUMUS] $\\text{pH} = 14 - \\text{pOH}$
[LANGKAH] NaOH basa kuat, ionisasi sempurna
$\\text{NaOH} \\rightarrow \\text{Na}^+ + \\text{OH}^-$
[INSTRUKSI] Hitung $[\\text{OH}^-]$
$[\\text{OH}^-] = 10^{-3}$ M
[INSTRUKSI] Hitung pOH
$\\text{pOH} = 3$
[HASIL] $\\text{pH} = 14 - 3 = 11$`,
  gambar: null,
},
```

---

## 10. CONTOH SOAL UTBK (SUB TES PK)

```js
{
  mapel: 'pk',        // ← kode sub tes PK
  kelas: 'UTBK',     // ← WAJIB 'UTBK' untuk semua sub tes SNBT
  bab: 'bab1',
  nama_bab: 'PK UTBK 2025 — Penalaran Kuantitatif',
  teks: r'Jika $4 \div \dfrac{1}{2} = \sqrt{t}$, nilai $t$ sama dengan',
  pilihan: ['$16$', '$32$', '$64$', '$128$'],
  jawabanBenar: 2,    // ← index 2 = '$64$'
  penjelasan: '$4 \\div \\frac{1}{2} = 8 = \\sqrt{t}$, maka $t = 64$.',
  pembahasan: `[INSTRUKSI] Hitung $4 \\div \\frac{1}{2} = 4 \\times 2 = 8$
[INSTRUKSI] $\\sqrt{t} = 8 \\Rightarrow t = 8^2$
[HASIL] $t = 64$`,
  gambar: null,
},
```

---

## 11. CONTOH SOAL UTBK DENGAN GAMBAR (PK)

```js
{
  mapel: 'pk', kelas: 'UTBK', bab: 'bab1',
  nama_bab: 'PK UTBK 2025 — Penalaran Kuantitatif',
  teks: 'Banyaknya persegi pada bangun datar di atas adalah ... *(lihat gambar)*',
  pilihan: ['$8$', '$10$', '$12$', '$14$'],
  jawabanBenar: 1,
  penjelasan: 'Dengan menghitung persegi 1×1, 2×2, dst. diperoleh total 10 persegi.',
  pembahasan: `[INSTRUKSI] Hitung persegi 1×1, 2×2, 3×3 secara sistematis
[HASIL] Total persegi $= 10$`,
  gambar: 'data:image/jpeg;base64,/9j/4AAQ...', // base64 halaman PDF
},
```

---

## 12. CONTOH SOAL UTBK TIPE SAJA (PK/PPU)

Soal tipe "pernyataan yang benar/salah" format SAJA:

```js
{
  mapel: 'pk', kelas: 'UTBK', bab: 'bab1',
  nama_bab: 'PK UTBK 2025 — Penalaran Kuantitatif',
  teks: 'Di antara pilihan berikut yang merupakan faktor persekutuan adalah ...\n(1) 10\n(2) 14\n(3) 35\n(4) 50',
  pilihan: [
    '(1), (2), dan (3) SAJA',
    '(1) dan (3) SAJA',
    '(2) dan (4) SAJA',
    'SEMUA PILIHAN',
  ],
  jawabanBenar: 0,
  penjelasan: 'FPB = 70. Faktor 70: 10✓, 14✓, 35✓, 50✗ → (1),(2),(3) SAJA.',
  pembahasan: `[INSTRUKSI] Cari FPB kedua bilangan
$\\text{FPB} = 70$
[INSTRUKSI] Cek tiap pilihan: 10|70✓, 14|70✓, 35|70✓, 50|70✗
[HASIL] (1), (2), dan (3) SAJA`,
  gambar: null,
},
```

---

## 13. CONTOH SOAL UTBK TIPE PERBANDINGAN KUANTITAS (PK/PM)

```js
{
  mapel: 'pk', kelas: 'UTBK', bab: 'bab1',
  nama_bab: 'PK UTBK 2025 — Penalaran Kuantitatif',
  teks: 'Hubungan antara kuantitas P dan Q berikut adalah ...\n\nP = $x^2 - (x^2 + y^2)$\nQ = $17$',
  pilihan: [
    'Kuantitas P lebih dari Q',
    'Kuantitas P kurang dari Q',
    'Kuantitas P sama dengan Q',
    'Tidak dapat ditentukan',
  ],
  jawabanBenar: 1,
  penjelasan: '$P = -y^2 \\leq 0 < 17 = Q$, sehingga P selalu kurang dari Q.',
  pembahasan: `[INSTRUKSI] Sederhanakan P
$P = x^2 - x^2 - y^2 = -y^2$
[INSTRUKSI] $-y^2 \\leq 0$ untuk semua $y$, sedangkan $Q = 17 > 0$
[HASIL] P kurang dari Q`,
  gambar: null,
},
```

---

## 14. CONTOH SOAL UTBK TIPE KECUKUPAN DATA (PK)

```js
{
  mapel: 'pk', kelas: 'UTBK', bab: 'bab1',
  nama_bab: 'PK UTBK 2025 — Penalaran Kuantitatif',
  teks: 'Apakah terdapat bilangan real $r$ sehingga $f(r) = g(r)$?\nPutuskan apakah pernyataan (1) dan (2) cukup.\n(1) $a + c = 5$\n(2) $2a - c = 7$',
  pilihan: [
    'Pernyataan (1) SAJA cukup',
    'Pernyataan (2) SAJA cukup',
    'DUA pernyataan BERSAMA-SAMA cukup',
    'Pernyataan (1) dan (2) tidak cukup',
  ],
  jawabanBenar: 1,
  penjelasan: '(2) $b=5d$ memberikan $\\Delta > 0$ untuk semua $d \\geq 1$, sehingga (2) saja cukup.',
  pembahasan: `[INSTRUKSI] Syarat ada solusi: diskriminan $\\geq 0$
$\\Delta = b^2 - 4c \\geq 0$
[INSTRUKSI] Cek (2): $2a - c = 7 \\Rightarrow c = 2a-7$
$\\Delta = (a-1)^2 - 4(2a-7) = (a-5)^2 + 4 > 0$ selalu ✓
[HASIL] Pernyataan (2) SAJA cukup`,
  gambar: null,
},
```

---

## 15. CONTOH SOAL UTBK LBI/LBE (LITERASI)

```js
{
  mapel: 'lbe', kelas: 'UTBK', bab: 'bab1',
  nama_bab: 'LBE Day 1 — Literasi Bahasa Inggris',
  teks: 'Based on Text 1, what is the main idea of paragraph 2?\n\nA. The benefits of probiotics for gut health\nB. The relationship between diet and mental health\nC. The process of producing fermented foods\nD. The history of probiotic research',
  pilihan: [
    'The benefits of probiotics for gut health',
    'The relationship between diet and mental health',
    'The process of producing fermented foods',
    'The history of probiotic research',
  ],
  jawabanBenar: 1,
  penjelasan: 'Paragraph 2 focuses on how diet, especially fermented foods, affects mental health through the gut-brain connection.',
  pembahasan: `[LANGKAH] Identify the topic of paragraph 2
The paragraph discusses the link between food consumption and brain health
[INSTRUKSI] Find the main idea: gut-brain axis and diet's role in mental health
[HASIL] The relationship between diet and mental health`,
  gambar: null,
},
```

---

## 16. RINGKASAN RULES CEPAT

| Hal | Aturan |
|---|---|
| `mapel` untuk UTBK | `'pk'` / `'pm'` / `'pu'` / `'ppu'` / `'pbm'` / `'lbi'` / `'lbe'` |
| `kelas` untuk UTBK | Selalu `'UTBK'` — wajib agar masuk dropdown Sub Tes |
| `kelas` untuk sekolah | `'X'` / `'XI'` / `'XII'` |
| `jawabanBenar` | Index 0–3, hitung dulu baru isi |
| Desimal | `{,}` bukan `.` dalam LaTeX |
| Backslash LaTeX | Selalu `\\` (double) di dalam string JS |
| Tag wajib | Setiap soal harus ada `[HASIL]` di pembahasan |
| `gambar` | `null` jika tidak ada, atau base64 string jika ada |
| `pilihan` | Selalu tepat 4 elemen |
| `nama_bab` UTBK | Format: `'[SubTes] [Paket] — [Label Lengkap]'` |
| Bab UTBK | `bab1`=paket1, `bab2`=paket2, dst. per sub tes |
