import mammoth from 'mammoth';

export async function parseDocxFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;
        const soal = parseTextToSoal(text);
        if (soal.length === 0) {
          reject(new Error('Tidak ada soal valid ditemukan dalam file DOCX. Pastikan format tabel sesuai (lihat Format Upload).'));
        } else {
          resolve(soal);
        }
      } catch (err) {
        reject(new Error('Gagal memproses file DOCX: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsArrayBuffer(file);
  });
}

function parseTextToSoal(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const soal = [];

  // Format tabel: No | Soal | A | B | C | D | Jawaban | Penjelasan | Pembahasan
  let i = 0;
  while (i < lines.length) {
    const parts = lines[i].split('\t');
    if (parts.length >= 7) {
      const noOrSoal = parts[0].trim();
      if (/^\d+/.test(noOrSoal)) {
        const teks       = parts[1]?.trim() || '';
        const pilA       = parts[2]?.trim() || '';
        const pilB       = parts[3]?.trim() || '';
        const pilC       = parts[4]?.trim() || '';
        const pilD       = parts[5]?.trim() || '';
        const jawabanStr = parts[6]?.trim().toUpperCase() || 'A';
        const penjelasan = parts[7]?.trim() || '';
        const pembahasan = parts[8]?.trim() || '';

        const jawabanMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
        const jawabanBenar = jawabanMap[jawabanStr] ?? 0;

        if (teks && pilA && pilB) {
          soal.push({
            teks,
            pilihan: [pilA, pilB, pilC, pilD].filter(Boolean),
            jawabanBenar,
            penjelasan: penjelasan || 'Tidak ada penjelasan.',
            pembahasan: pembahasan || penjelasan || 'Tidak ada pembahasan.'
          });
        }
      }
    }
    i++;
  }

  return soal;
}

export async function parseJsFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;

        // Cari array [...] pertama yang ditemukan
        const match = text.match(/\[[\s\S]*\]/);
        if (!match) {
          reject(new Error('Format file JS tidak valid. Tidak ditemukan array soal.'));
          return;
        }

        const arrStr = match[0];
        // Bersihkan komentar dan trailing comma agar bisa di-JSON.parse
        const cleaned = arrStr
          .replace(/\/\/[^\n]*/g, '')           // single-line comments
          .replace(/\/\*[\s\S]*?\*\//g, '')      // multi-line comments
          .replace(/,(\s*[}\]])/g, '$1');        // trailing commas

        const parsed = JSON.parse(cleaned);
        if (!Array.isArray(parsed)) {
          reject(new Error('File JS harus berisi array soal.'));
          return;
        }

        const valid = validateSoalArray(parsed);
        if (valid.errors.length > 0) {
          reject(new Error('Soal tidak valid:\n' + valid.errors.join('\n')));
          return;
        }
        resolve(valid.soal);
      } catch (err) {
        reject(new Error('Gagal parse file JS: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsText(file);
  });
}

function validateSoalArray(arr) {
  const errors = [];
  const soal = [];

  arr.forEach((item, idx) => {
    const no = idx + 1;
    if (!item.teks || typeof item.teks !== 'string') {
      errors.push(`Soal #${no}: field 'teks' wajib diisi (string).`);
      return;
    }
    if (!Array.isArray(item.pilihan) || item.pilihan.length < 2) {
      errors.push(`Soal #${no}: 'pilihan' harus array minimal 2 item.`);
      return;
    }
    if (typeof item.jawabanBenar !== 'number' || item.jawabanBenar < 0 || item.jawabanBenar >= item.pilihan.length) {
      errors.push(`Soal #${no}: 'jawabanBenar' harus index valid (0–${item.pilihan.length - 1}).`);
      return;
    }
    soal.push({
      teks:        item.teks,
      pilihan:     item.pilihan.map(String),
      jawabanBenar: item.jawabanBenar,
      penjelasan:  item.penjelasan  || 'Tidak ada penjelasan.',
      pembahasan:  item.pembahasan  || item.penjelasan || 'Tidak ada pembahasan.'
    });
  });

  return { soal, errors };
}
