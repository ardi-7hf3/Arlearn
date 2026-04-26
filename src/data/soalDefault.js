export const soalDefault = [
  {
    id: 1,
    teks: "Apa kepanjangan dari HTML?",
    pilihan: [
      "HyperText Markup Language",
      "HighText Machine Language",
      "HyperText Machine Learning",
      "Hyperlink and Text Markup Language"
    ],
    jawabanBenar: 0,
    penjelasan: "HTML adalah singkatan dari HyperText Markup Language, bahasa standar untuk membuat halaman web.",
    pembahasan: "HTML (HyperText Markup Language) adalah bahasa markup standar yang digunakan untuk membuat struktur halaman web. HTML menggunakan tag-tag seperti <html>, <head>, <body>, <p>, dll untuk mendefinisikan elemen-elemen halaman. HTML pertama kali dikembangkan oleh Tim Berners-Lee pada tahun 1991 dan sejak saat itu menjadi fondasi utama dari setiap halaman web di internet."
  },
  {
    id: 2,
    teks: "Siapa penemu World Wide Web (WWW)?",
    pilihan: [
      "Bill Gates",
      "Tim Berners-Lee",
      "Linus Torvalds",
      "Steve Jobs"
    ],
    jawabanBenar: 1,
    penjelasan: "Tim Berners-Lee menciptakan World Wide Web pada tahun 1989 saat bekerja di CERN, Swiss.",
    pembahasan: "Tim Berners-Lee adalah ilmuwan komputer asal Inggris yang menciptakan World Wide Web pada 1989 ketika bekerja di CERN di Jenewa, Swiss. Ia menulis proposal pertama untuk sistem manajemen informasi berbasis hypertext dan mengimplementasikan komunikasi antara HTTP client dan server pertama kali pada Desember 1990. Ia juga mendirikan W3C (World Wide Web Consortium) untuk mengembangkan standar web."
  },
  {
    id: 3,
    teks: "Dalam JavaScript, apa output dari `typeof null`?",
    pilihan: ['"null"', '"undefined"', '"object"', '"boolean"'],
    jawabanBenar: 2,
    penjelasan: "Ini adalah bug terkenal di JavaScript. `typeof null` mengembalikan 'object', padahal null bukan objek.",
    pembahasan: "Ini merupakan salah satu bug paling terkenal dalam sejarah JavaScript yang ada sejak versi pertama (1995). Dalam implementasi awal JavaScript, nilai-nilai disimpan dengan tipe tag 3-bit. Objek memiliki tipe tag 000. null direpresentasikan sebagai NULL pointer (0x00), yang juga memiliki tipe tag 000 — sehingga typeof null secara keliru mengembalikan 'object'. Bug ini tidak diperbaiki karena akan merusak banyak kode yang sudah ada (backward compatibility)."
  },
  {
    id: 4,
    teks: "Apa nama ibu kota negara Australia?",
    pilihan: ["Sydney", "Melbourne", "Brisbane", "Canberra"],
    jawabanBenar: 3,
    penjelasan: "Ibu kota Australia adalah Canberra, bukan Sydney seperti yang banyak orang kira.",
    pembahasan: "Canberra menjadi ibu kota Australia sejak 1913. Uniknya, Canberra dipilih sebagai kompromi antara Sydney dan Melbourne yang sama-sama ingin menjadi ibu kota. Nama 'Canberra' berasal dari bahasa Aborigin yang berarti 'tempat pertemuan'. Kota ini dirancang khusus sebagai kota pemerintahan oleh arsitek Amerika Walter Burley Griffin dan Marion Mahony Griffin yang memenangkan kompetisi desain internasional."
  },
  {
    id: 5,
    teks: "Apa perbedaan utama antara `==` dan `===` di JavaScript?",
    pilihan: [
      "Tidak ada perbedaan",
      "`==` membandingkan nilai saja, `===` membandingkan nilai dan tipe data",
      "`===` lebih lambat dari `==`",
      "`==` hanya untuk angka, `===` untuk semua tipe"
    ],
    jawabanBenar: 1,
    penjelasan: "`==` melakukan type coercion otomatis, sedangkan `===` membandingkan nilai DAN tipe data tanpa konversi.",
    pembahasan: "Operator == (loose equality) melakukan type coercion, artinya JavaScript mengkonversi tipe data secara otomatis sebelum membandingkan. Contoh: 0 == false → true, null == undefined → true. Sedangkan === (strict equality) tidak melakukan konversi tipe, sehingga 0 === false → false. Best practice: selalu gunakan === untuk menghindari hasil yang tidak terduga (unexpected behavior) dalam program."
  },
  {
    id: 6,
    teks: "Diketahui $f(x) = 3x^2 - 2x + 1$. Nilai dari $f(2)$ adalah ...",
    pilihan: ["$9$", "$11$", "$13$", "$15$"],
    jawabanBenar: 0,
    penjelasan: "Substitusi $x = 2$: $f(2) = 3(4) - 2(2) + 1 = 12 - 4 + 1 = 9$",
    pembahasan: "Diketahui $f(x) = 3x^2 - 2x + 1$\n\nSubstitusi $x = 2$ ke dalam fungsi:\n$$f(2) = 3(2)^2 - 2(2) + 1$$\n$$= 3 \\times 4 - 4 + 1$$\n$$= 12 - 4 + 1$$\n$$= 9$$\n\nJadi nilai $f(2) = \\boxed{9}$."
  },
  {
    id: 7,
    teks: "Nilai dari $\\lim_{x \\to 2} \\dfrac{x^2 - 4}{x - 2}$ adalah ...",
    pilihan: ["$0$", "$2$", "$4$", "$\\infty$"],
    jawabanBenar: 2,
    penjelasan: "Faktorkan: $\\frac{(x-2)(x+2)}{x-2} = x+2$. Substitusi $x=2$ menghasilkan $4$.",
    pembahasan: "Substitusi langsung $x = 2$ memberikan bentuk tak tentu $\\frac{0}{0}$, sehingga perlu difaktorkan terlebih dahulu.\n\nFaktorkan pembilang:\n$$\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} = \\lim_{x \\to 2} \\frac{(x-2)(x+2)}{x-2}$$\n\nKarena $x \\neq 2$ (proses limit, bukan substitusi langsung), faktor $(x-2)$ dapat dicoret:\n$$= \\lim_{x \\to 2} (x + 2) = 2 + 2 = \\boxed{4}$$"
  },
  {
    id: 8,
    teks: "Himpunan penyelesaian dari $|2x - 3| \\leq 5$ adalah ...",
    pilihan: [
      "$-1 \\leq x \\leq 4$",
      "$x \\leq -1$ atau $x \\geq 4$",
      "$-4 \\leq x \\leq 1$",
      "$1 \\leq x \\leq 4$"
    ],
    jawabanBenar: 0,
    penjelasan: "$|2x-3| \\leq 5 \\Rightarrow -5 \\leq 2x-3 \\leq 5 \\Rightarrow -1 \\leq x \\leq 4$",
    pembahasan: "Gunakan sifat nilai mutlak: $|A| \\leq B \\Leftrightarrow -B \\leq A \\leq B$ (untuk $B > 0$)\n\n$$|2x - 3| \\leq 5$$\n$$-5 \\leq 2x - 3 \\leq 5$$\n\nTambahkan $3$ di semua ruas:\n$$-5 + 3 \\leq 2x \\leq 5 + 3$$\n$$-2 \\leq 2x \\leq 8$$\n\nBagi semua ruas dengan $2$:\n$$-1 \\leq x \\leq 4$$\n\nJadi HP $= \\{x \\mid -1 \\leq x \\leq 4,\\; x \\in \\mathbb{R}\\}$."
  },
  {
    id: 9,
    teks: "Turunan pertama dari $f(x) = \\sin(2x) + \\cos(x)$ adalah ...",
    pilihan: [
      "$2\\cos(2x) - \\sin(x)$",
      "$\\cos(2x) - \\sin(x)$",
      "$2\\cos(2x) + \\sin(x)$",
      "$-2\\cos(2x) - \\sin(x)$"
    ],
    jawabanBenar: 0,
    penjelasan: "$\\frac{d}{dx}[\\sin(2x)] = 2\\cos(2x)$ dan $\\frac{d}{dx}[\\cos(x)] = -\\sin(x)$",
    pembahasan: "Gunakan aturan turunan fungsi trigonometri:\n- $\\dfrac{d}{dx}[\\sin(ax)] = a\\cos(ax)$\n- $\\dfrac{d}{dx}[\\cos(x)] = -\\sin(x)$\n\nMaka:\n$$f'(x) = \\frac{d}{dx}[\\sin(2x)] + \\frac{d}{dx}[\\cos(x)]$$\n$$= 2\\cos(2x) + (-\\sin(x))$$\n$$= \\boxed{2\\cos(2x) - \\sin(x)}$$"
  },
  {
    id: 10,
    teks: "Diketahui deret geometri dengan suku pertama $a = 2$ dan rasio $r = 3$. Suku ke-5 ($U_5$) adalah ...",
    pilihan: ["$54$", "$81$", "$162$", "$243$"],
    jawabanBenar: 2,
    penjelasan: "$U_n = a \\cdot r^{n-1}$, maka $U_5 = 2 \\cdot 3^4 = 2 \\cdot 81 = 162$",
    pembahasan: "Rumus suku ke-$n$ deret geometri:\n$$U_n = a \\cdot r^{n-1}$$\n\nDiketahui: $a = 2$, $r = 3$, $n = 5$\n\nSubstitusi:\n$$U_5 = 2 \\cdot 3^{5-1} = 2 \\cdot 3^4 = 2 \\cdot 81 = \\boxed{162}$$\n\nVerifikasi urutan suku: $2,\\; 6,\\; 18,\\; 54,\\; 162,\\ldots$ ✓"
  }
];
