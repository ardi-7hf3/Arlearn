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
    penjelasan: "HTML adalah singkatan dari HyperText Markup Language, yaitu bahasa standar untuk membuat halaman web."
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
    penjelasan: "Tim Berners-Lee menciptakan World Wide Web pada tahun 1989 saat bekerja di CERN, Swiss."
  },
  {
    id: 3,
    teks: "Dalam JavaScript, apa output dari `typeof null`?",
    pilihan: [
      '"null"',
      '"undefined"',
      '"object"',
      '"boolean"'
    ],
    jawabanBenar: 2,
    penjelasan: "Ini adalah bug terkenal di JavaScript. `typeof null` mengembalikan 'object', padahal null bukan objek. Ini adalah warisan dari implementasi JavaScript awal."
  },
  {
    id: 4,
    teks: "Apa nama ibu kota negara Australia?",
    pilihan: [
      "Sydney",
      "Melbourne",
      "Brisbane",
      "Canberra"
    ],
    jawabanBenar: 3,
    penjelasan: "Ibu kota Australia adalah Canberra, bukan Sydney seperti yang banyak orang kira. Canberra menjadi ibu kota sejak 1913."
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
    penjelasan: "`==` melakukan type coercion (konversi tipe otomatis), sedangkan `===` (strict equality) membandingkan nilai DAN tipe data tanpa konversi."
  },
  {
    id: 6,
    teks: "Planet manakah yang dikenal sebagai 'Planet Merah'?",
    pilihan: [
      "Venus",
      "Jupiter",
      "Mars",
      "Saturnus"
    ],
    jawabanBenar: 2,
    penjelasan: "Mars dijuluki Planet Merah karena permukaannya yang kaya akan oksida besi (karat) yang memberikan warna kemerahan khas."
  },
  {
    id: 7,
    teks: "Apa yang dimaksud dengan CSS Flexbox?",
    pilihan: [
      "Framework JavaScript untuk animasi",
      "Model tata letak satu dimensi untuk mengatur elemen dalam baris atau kolom",
      "Library untuk membuat tabel responsif",
      "Bahasa preprocessor CSS"
    ],
    jawabanBenar: 1,
    penjelasan: "CSS Flexbox (Flexible Box) adalah model tata letak satu dimensi yang memungkinkan pengaturan elemen secara fleksibel dalam baris atau kolom."
  },
  {
    id: 8,
    teks: "Berapa jumlah provinsi di Indonesia saat ini (2024)?",
    pilihan: [
      "33 provinsi",
      "34 provinsi",
      "37 provinsi",
      "38 provinsi"
    ],
    jawabanBenar: 3,
    penjelasan: "Per 2022, Indonesia memiliki 38 provinsi setelah terbentuknya 4 DOB (Daerah Otonomi Baru) di Papua, yaitu Papua Selatan, Papua Tengah, Papua Pegunungan, dan Papua Barat Daya."
  },
  {
    id: 9,
    teks: "Dalam React, apa fungsi dari `useEffect` hook?",
    pilihan: [
      "Untuk membuat state baru",
      "Untuk mengoptimasi performa rendering",
      "Untuk menjalankan side effects setelah render",
      "Untuk membuat custom hook"
    ],
    jawabanBenar: 2,
    penjelasan: "`useEffect` digunakan untuk menjalankan side effects (efek samping) seperti fetch data, manipulasi DOM, atau subscription setelah komponen render atau re-render."
  },
  {
    id: 10,
    teks: "Apa kepanjangan dari SQL?",
    pilihan: [
      "Structured Query Language",
      "Simple Query Logic",
      "Standard Question Language",
      "Sequential Query List"
    ],
    jawabanBenar: 0,
    penjelasan: "SQL adalah singkatan dari Structured Query Language, yaitu bahasa standar untuk mengelola dan memanipulasi database relasional."
  }
];
