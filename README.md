# 🎓 ARLearn — Platform Tryout Premium

Platform tryout interaktif eksklusif untuk kelas **XI ARTERI** SMAN 13 Pontianak.

## ✨ Fitur Unggulan

- 🔐 **Login Aman** — autentikasi dengan kredensial hardcoded
- 📝 **10 Soal Default** — pilihan ganda bidang pengetahuan umum & programming
- 🎯 **Tryout Interaktif** — navigasi soal satu per satu dengan progress bar
- 🎉 **Modal Hasil** — skor, statistik, review jawaban + efek confetti
- 📊 **Riwayat Tryout** — timeline dengan detail per percobaan
- 📚 **Kelola Soal** — upload .js/.docx, download contoh, reset default
- 💾 **100% localStorage** — tanpa database, data tersimpan di browser
- 📱 **Responsive** — optimal di mobile & desktop

## 🚀 Cara Menjalankan

```bash
# 1. Clone / extract project
cd arlearn

# 2. Install dependencies
npm install

# 3. Jalankan development server
npm run dev

# 4. Build untuk produksi
npm run build
```

## 🔑 Kredensial Login

```
Username : Ardi7HF3
Password : akuhitam753
```

## 📁 Struktur Proyek

```
arlearn/
├── src/
│   ├── components/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardTryout.jsx
│   │   ├── RiwayatPage.jsx
│   │   ├── KelolaSoalPage.jsx
│   │   ├── CustomAlert.jsx
│   │   ├── ModalHasilTryout.jsx
│   │   ├── Navbar.jsx
│   │   ├── UploadSoalModal.jsx
│   │   ├── FormatUploadModal.jsx
│   │   └── ProgressChart.jsx
│   ├── data/
│   │   └── soalDefault.js
│   ├── utils/
│   │   ├── soalStorage.js
│   │   ├── riwayatStorage.js
│   │   └── parseDocx.js
│   ├── hooks/
│   │   ├── useLocalStorage.js
│   │   └── useConfetti.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
└── README.md
```

## 📤 Format Upload Soal

### File .js
```js
export const tambahanSoal = [
  {
    id: 11,
    teks: "Pertanyaan di sini",
    pilihan: ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
    jawabanBenar: 0, // index jawaban benar (0-3)
    penjelasan: "Penjelasan jawaban"
  }
];
```

### File .docx (Tabel)
| No | Soal | Pilihan A | Pilihan B | Pilihan C | Pilihan D | Jawaban | Penjelasan |
|----|------|-----------|-----------|-----------|-----------|---------|------------|
| 1  | ...  | ...       | ...       | ...       | ...       | A       | ...        |

## 🎨 Teknologi

- **React 18** + **Vite 5**
- **Tailwind CSS** + **Bootstrap 5**
- **canvas-confetti** — efek konfeti
- **mammoth.js** — parsing .docx
- **file-saver** — download file
- **localStorage** — penyimpanan data

## 🌐 Deploy ke Vercel

```bash
npm run build
# Upload folder dist ke Vercel, atau gunakan Vercel CLI
vercel --prod
```

---

Made with ❤️ for XI ARTERI · SMAN 13 Pontianak
