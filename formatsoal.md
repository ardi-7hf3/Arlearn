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

### Nama variabel berdasarkan kelas:
| Kelas | Nama Variabel |
|---|---|
| XI | `soalKimia` |
| XII | `soalKimia12` |
| Kelas lain | `soal[MapelKelas]` (contoh: `soalFisika11`) |

---

## 2. STRUKTUR TIAP OBJEK SOAL

```js
{
  mapel: 'kimia',           // string: nama mata pelajaran (huruf kecil)
  kelas: 'XI',              // string: 'X' | 'XI' | 'XII' — WAJIB agar tidak campur antar kelas
  bab: 'bab1',              // string: 'bab1' | 'bab2' | 'bab3' | 'bab4' | 'bab5' | dst.
  nama_bab: 'Nama Bab',     // string: nama bab lengkap (ditampilkan di UI)
  teks: '...',              // string: teks soal (boleh multiline dengan \n)
  pilihan: ['A','B','C','D'], // array TEPAT 4 string
  jawabanBenar: 0,          // integer: INDEX jawaban benar (0=A, 1=B, 2=C, 3=D)
  penjelasan: '...',        // string: penjelasan SINGKAT (1–3 kalimat)
  pembahasan: `...`,        // template literal: pembahasan LENGKAP dengan tag
}
```

> ⚠️ **WAJIB**: `pilihan` selalu berisi tepat **4 elemen**. `jawabanBenar` adalah **index (0–3)**, bukan teks jawaban.
> ⚠️ **WAJIB**: `kelas` harus diisi agar soal kelas XI dan XII tidak bergabung di Admin Panel.

---

## 3. ATURAN `jawabanBenar` (INDEX)

```
pilihan: ['$1$', '$2$', '$3$', '$4$']
          idx=0   idx=1   idx=2   idx=3
```

### Langkah wajib sebelum mengisi `jawabanBenar`:
1. **Hitung jawaban secara matematis terlebih dahulu**
2. Cocokkan hasil perhitungan dengan pilihan di array
3. Isi `jawabanBenar` dengan **index** pilihan yang cocok

### Contoh BENAR:
```js
// HCl 0.01M → pH = -log(10^-2) = 2
pilihan: ['$1$', '$2$', '$3$', '$4$'],
jawabanBenar: 1,  // index 1 = '$2$' ✓
```

### Contoh SALAH:
```js
// SALAH: hasil hitung 0.372 tapi idx=0 yang isinya 0.186
pilihan: ['$0{,}186$', '$0{,}372$', '$0{,}93$', '$1{,}86$'],
jawabanBenar: 0,  // ❌ SALAH — 0.186 ≠ hasil hitung
```

---

## 4. FORMAT LaTeX

### 4a. Penulisan dalam string biasa (`'...'`)
Gunakan **double backslash** `\\` untuk semua perintah LaTeX:

```js
teks: 'Hitunglah pH larutan $\\text{HCl}$ $0{,}01$ M!',
penjelasan: '$[\\text{H}^+] = 10^{-2}$ M, maka $\\text{pH} = 2$.',
```

### 4b. Penulisan dalam template literal (`` `...` ``)
Gunakan **double backslash** `\\` juga (sama seperti string biasa):

```js
pembahasan: `[RUMUS] $\\text{pH} = -\\log[\\text{H}^+]$
[HASIL] $\\text{pH} = 2$`,
```

### 4c. Aturan desimal — gunakan `{,}` bukan `.`
```js
// BENAR (standar Indonesia):
'$0{,}05$ M'    // tampil: 0,05 M
'$1{,}86$'      // tampil: 1,86

// SALAH:
'$0.05$ M'      // tampil: 0.05 M (bukan standar Indonesia)
```

### 4d. Notasi variabel kimia yang benar

| Variabel | Penulisan LaTeX | Tampilan |
|---|---|---|
| Konsentrasi asam lemah | `$M_a$` | $M_a$ |
| Konsentrasi basa lemah | `$M_b$` | $M_b$ |
| Konsentrasi ion H⁺ | `$[\\text{H}^+]$` | $[\text{H}^+]$ |
| Konsentrasi ion OH⁻ | `$[\\text{OH}^-]$` | $[\text{OH}^-]$ |
| Konstanta asam | `$K_a$` | $K_a$ |
| Konstanta basa | `$K_b$` | $K_b$ |
| Konstanta air | `$K_w$` | $K_w$ |
| Konstanta laju | `$k$` (huruf kecil) | $k$ |
| Konstanta kesetimbangan | `$K_c$` atau `$K_p$` | $K_c$, $K_p$ |
| Perubahan entalpi | `$\\Delta H$` | $\Delta H$ |
| Energi aktivasi | `$E_a$` | $E_a$ |
| Derajat ionisasi | `$\\alpha$` | $\alpha$ |
| Faktor Van't Hoff | `$i$` (huruf kecil) | $i$ |
| Penurunan titik beku | `$\\Delta T_f$` | $\Delta T_f$ |
| Kenaikan titik didih | `$\\Delta T_b$` | $\Delta T_b$ |
| Tekanan osmotik | `$\\pi$` | $\pi$ |
| Molalitas | `$m$` (huruf kecil) | $m$ |
| Molaritas | `$M$` (huruf kapital) | $M$ |

> ⚠️ **JANGAN** gunakan variabel `C` atau `c` untuk konsentrasi. Gunakan `M_a` (asam), `M_b` (basa), atau `M` (molaritas umum).

### 4e. Penulisan nama zat kimia
```js
// BENAR — gunakan \text{} untuk nama zat
'$\\text{NaOH}$'          // NaOH
'$\\text{CH}_3\\text{COOH}$'  // CH₃COOH
'$\\text{H}_2\\text{O}$'  // H₂O

// SALAH — tanpa \text{}
'$NaOH$'   // tampil miring: NaOH
```

---

## 5. TAG PEMBAHASAN LENGKAP

Field `pembahasan` menggunakan **template literal** dan mendukung 4 tag khusus yang dirender sebagai blok visual berwarna di aplikasi.

### 5a. Daftar tag

| Tag | Warna | Fungsi |
|---|---|---|
| `[RUMUS] ...` | 🟡 Kuning | Kotak rumus dasar — tulis **satu** rumus utama yang digunakan |
| `[LANGKAH] ...` | 🟠 Oranye | Langkah bernomor otomatis — identifikasi/setup masalah |
| `[INSTRUKSI] ...` | 🟣 Ungu | Badge operasi — substitusikan, kalikan, bagikan, hitung, dll. |
| `[HASIL] ...` | 🟢 Hijau | Kotak hasil akhir — **wajib ada di setiap soal** |

### 5b. Struktur urutan yang benar

```
[RUMUS]     → rumus dasar yang digunakan
[LANGKAH]   → identifikasi data / setup (boleh lebih dari 1)
[INSTRUKSI] → operasi pertama
              formula/kalkulasi
[INSTRUKSI] → operasi kedua
              formula/kalkulasi
[HASIL]     → jawaban akhir
```

### 5c. Aturan penting tag

1. **[RUMUS]** — hanya SATU per soal, letakkan di paling atas
2. **[LANGKAH]** — boleh 1–3, untuk setup/identifikasi data
3. **[INSTRUKSI]** — selalu diikuti baris formula/kalkulasi di bawahnya
4. **[HASIL]** — wajib ada, selalu di paling bawah
5. Baris tanpa tag tapi berisi LaTeX `$...$` → ditampilkan rata tengah sebagai formula
6. Baris tanpa tag, bukan LaTeX → teks keterangan biasa (abu-abu)
7. Baris kosong → spasi vertikal kecil

### 5d. Kata kunci instruksi yang dikenali otomatis (tanpa tag)
Jika baris dimulai dengan salah satu kata berikut, akan otomatis diberi badge `↳`:
`substitusikan`, `kalikan`, `bagikan`, `jumlahkan`, `kurangkan`, `hitung`, `tentukan`, `ubah`, `gunakan`, `masukkan`, `bandingkan`, `sederhanakan`, `bagi`, `kali`, `tambah`, `kurang`, `cari`, `konversikan`, `tulis`, `perhatikan`, `ingat`, `catatan`

---

## 6. ATURAN `penjelasan` (SINGKAT)

- Panjang: **1–3 kalimat**
- Format: string biasa `'...'` (bukan template literal)
- Isi: rangkuman perhitungan langsung ke jawaban
- LaTeX: double backslash `\\`
- Tidak boleh mengandung kontradiksi dengan `pembahasan`

```js
// BENAR:
penjelasan: '$[\\text{H}^+] = \\sqrt{K_a \\times M_a} = \\sqrt{10^{-5} \\times 0{,}1} = 10^{-3}$ M, maka $\\text{pH} = 3$.',

// SALAH — kontradiksi (hitung A tapi simpulkan B):
penjelasan: '$[\\text{H}^+] \\approx 1{,}68 \\times 10^{-2}$ M... untuk soal ini pH $\\approx 3{,}5$.',
// ❌ 1.68×10^-2 → pH=1.77, bukan 3.5!
```

---

## 7. VALIDASI MATEMATIS WAJIB

Sebelum menyimpan soal, verifikasi:

### Checklist per soal:
- [ ] Hitung jawaban secara manual/matematis
- [ ] `jawabanBenar` menunjuk ke index yang nilainya = hasil hitung
- [ ] `penjelasan` konsisten dengan `pembahasan`
- [ ] `[HASIL]` di pembahasan konsisten dengan `jawabanBenar`
- [ ] Tidak ada kontradiksi antara perhitungan di tengah dan hasil akhir
- [ ] Variabel LaTeX benar (`M_a`/`M_b` bukan `C`, `k` kecil untuk laju, `K_c` besar untuk kesetimbangan)

### Rumus yang sering salah:

```
❌ [H+] = sqrt(Ka × C)     → SALAH
✅ [H+] = sqrt(Ka × Ma)    → BENAR

❌ k = 3/(0.01^2 × 0.02) = 750   → SALAH (= 1.5×10^6)
✅ Hitung ulang: k = v/([A]^n[B]^m)

❌ ΔTf = Kf × m = 1.86 × 0.2 = 0.186   → SALAH
✅ ΔTf = 1.86 × 0.2 = 0.372             → BENAR

❌ [HI] = 1.4 M padahal x=7/9=0.778, [HI]=2x=1.556  → SALAH
✅ [HI] = 1.56 M → pilihan idx=2                      → BENAR
```

---

## 8. SISTEM PENOMORAN BAB

```
Kelas XI:  kelas: 'XI'
  bab1 → Topik 1 (misal: pH Larutan Asam Basa)
  bab2 → Topik 2 (misal: Perubahan Entalpi)
  bab3 → Topik 3 (misal: Orde Reaksi & Laju)

Kelas XII: kelas: 'XII'
  bab4 → Topik 4 (misal: Sifat Koligatif Larutan)
  bab5 → Topik 5 (misal: Kesetimbangan Kimia Lanjutan)
  bab6 → Topik 6 (dst.)
```

> Penomoran bab bersifat **global** dan berlanjut antar kelas agar tidak bentrok di database.
> Field `kelas` adalah yang memisahkan tampilan paket di Admin Panel — tanpanya semua soal kimia akan gabung jadi satu kartu.

---

## 9. CONTOH SOAL LENGKAP (BENAR)

```js
{
  mapel: 'kimia', kelas: 'XI', bab: 'bab1',
  nama_bab: 'Perhitungan pH Larutan Asam Basa',
  teks: 'Hitunglah pH larutan $\\text{NaOH}$ $0{,}001$ M!',
  pilihan: ['$11$', '$12$', '$13$', '$3$'],
  jawabanBenar: 0,
  // Verifikasi: [OH-]=10^-3, pOH=3, pH=14-3=11 → index 0 = '$11$' ✓
  penjelasan: '$\\text{NaOH}$ basa kuat, $[\\text{OH}^-] = 10^{-3}$ M, $\\text{pOH} = 3$, maka $\\text{pH} = 14 - 3 = 11$.',
  pembahasan: `[RUMUS] $\\text{pH} = 14 - \\text{pOH}$ dan $\\text{pOH} = -\\log[\\text{OH}^-]$
[LANGKAH] Tuliskan reaksi ionisasi $\\text{NaOH}$ (basa kuat, ionisasi sempurna)
$\\text{NaOH} \\rightarrow \\text{Na}^+ + \\text{OH}^-$
[INSTRUKSI] Tentukan konsentrasi ion $\\text{OH}^-$
$[\\text{OH}^-] = 0{,}001 \\text{ M} = 10^{-3} \\text{ M}$
[INSTRUKSI] Hitung pOH
$\\text{pOH} = -\\log(10^{-3}) = 3$
[INSTRUKSI] Substitusikan ke rumus pH pada suhu $25°\\text{C}$
$\\text{pH} = 14 - 3$
[HASIL] $\\text{pH} = 11$`,
},
```

---

## 10. CONTOH SOAL LENGKAP (SALAH — JANGAN DITIRU)

```js
// ❌ CONTOH SALAH #1 — jawabanBenar tidak sesuai hasil hitung
{
  teks: 'Hitunglah ΔTf glukosa 18g (Mr=180) dalam 500g air, Kf=1.86!',
  pilihan: ['$0{,}186$°C', '$0{,}372$°C', '$0{,}93$°C', '$1{,}86$°C'],
  jawabanBenar: 0,   // ❌ 0 = 0.186°C, tapi perhitungan = 0.372°C
  // n=0.1mol, m=0.1/0.5=0.2 mol/kg, ΔTf=1.86×0.2=0.372 → seharusnya idx=1
}

// ❌ CONTOH SALAH #2 — penjelasan kontradiksi dengan hasil
{
  jawabanBenar: 0,  // pilihan[0] = pH 3.5
  penjelasan: '...pH = -log(1.68×10^-2) ≈ 1.77... untuk soal ini pH ≈ 3.5',
  // ❌ Hitung 1.77 tapi simpulkan 3.5 — KONTRADIKSI
}

// ❌ CONTOH SALAH #3 — variabel C bukan Ma
{
  pembahasan: `[RUMUS] $[\\text{H}^+] = \\sqrt{K_a \\times C}$`,
  // ❌ Gunakan Ma bukan C
}

// ❌ CONTOH SALAH #4 — tidak ada field kelas
{
  mapel: 'kimia', bab: 'bab4',   // kelas XII tapi tidak ada field kelas
  // ❌ Soal ini akan BERGABUNG dengan paket kimia kelas XI di Admin Panel!
}

// ✅ YANG BENAR:
{
  mapel: 'kimia', kelas: 'XII', bab: 'bab4',
  // ✅ Admin Panel akan menampilkan kartu terpisah: "Kimia — Kelas XII"
}
```

---

## 11. TIPS MEMBUAT PILIHAN JAWABAN YANG BAIK

1. **Jawaban benar** harus dihitung matematisnya dulu, baru dibuat pilihan
2. **Pengecoh** (pilihan salah) harus masuk akal:
   - Kesalahan konsep umum (misal: lupa faktor `i` untuk elektrolit)
   - Kesalahan perhitungan umum (misal: lupa pangkat 2, lupa konversi satuan)
   - Jawaban yang hampir benar (beda satu langkah)
3. Urutkan pilihan dari kecil ke besar jika berupa angka
4. Hindari menempatkan jawaban benar selalu di posisi yang sama (variasikan antara A/B/C/D)

---

## 12. RINGKASAN RULES CEPAT

| Hal | Aturan |
|---|---|
| `jawabanBenar` | Index 0–3, hitung dulu baru isi |
| Desimal | `{,}` bukan `.` dalam LaTeX |
| Konsentrasi | `M_a` / `M_b` — **bukan** `C` |
| Backslash LaTeX | Selalu `\\` (double) di dalam string JS |
| Tag wajib | Setiap soal harus ada `[HASIL]` di pembahasan |
| Tag urutan | `[RUMUS]` → `[LANGKAH]` → `[INSTRUKSI]` → `[HASIL]` |
| `penjelasan` | Harus konsisten dengan `pembahasan` dan `jawabanBenar` |
| Pilihan | Selalu tepat 4 elemen |
| Padatan/cairan murni | Tidak dimasukkan dalam ekspresi `Kc`/`Kp` |
| Field `kelas` | Wajib diisi: `'XI'` atau `'XII'` — pisahkan paket antar kelas |
| Bab numbering | Lanjut dari kelas sebelumnya (kelas XII mulai bab4) |
