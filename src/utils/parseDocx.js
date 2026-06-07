import mammoth from 'mammoth';

// ── DOCX ─────────────────────────────────────────────────────────────────────
export async function parseDocxFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const result = await mammoth.extractRawText({ arrayBuffer });
        const soal = parseTextToSoal(result.value);
        if (soal.length === 0) {
          reject(new Error('Tidak ada soal valid ditemukan. Pastikan format tabel sesuai (lihat Format Upload).'));
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
  const jawabanMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };

  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length >= 7 && /^\d+/.test(parts[0].trim())) {
      const teks        = parts[1]?.trim() || '';
      const pilA        = parts[2]?.trim() || '';
      const pilB        = parts[3]?.trim() || '';
      const pilC        = parts[4]?.trim() || '';
      const pilD        = parts[5]?.trim() || '';
      const jawabanStr  = parts[6]?.trim().toUpperCase() || 'A';
      const penjelasan  = parts[7]?.trim() || 'Tidak ada penjelasan.';
      const pembahasan  = parts[8]?.trim() || penjelasan;
      const jawabanBenar = jawabanMap[jawabanStr] ?? 0;

      if (teks && pilA && pilB) {
        soal.push({
          teks,
          pilihan: [pilA, pilB, pilC, pilD].filter(Boolean),
          jawabanBenar,
          penjelasan,
          pembahasan,
        });
      }
    }
  }
  return soal;
}

// ── JS ────────────────────────────────────────────────────────────────────────
export async function parseJsFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const parsed = evalJsArray(text);

        if (!Array.isArray(parsed)) {
          reject(new Error('File JS harus mengekspor array soal.'));
          return;
        }

        const { soal, errors } = validateSoalArray(parsed);
        if (errors.length > 0) {
          reject(new Error('Soal tidak valid:\n' + errors.join('\n')));
          return;
        }
        resolve(soal);
      } catch (err) {
        reject(new Error('Gagal parse file JS: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsText(file);
  });
}

/**
 * Mengeksekusi file JS dan mengekstrak array soal.
 *
 * Strategi (urutan):
 * 1. Coba eksekusi via Function() — mendukung JS penuh (single quote, komentar, dll)
 * 2. Fallback: cari blok [...] dan JSON.parse setelah dibersihkan
 */
function evalJsArray(text) {
  // ── Strategi 1: Function() eval ──────────────────────────────────
  // Ganti "export const/let/var xxx =" → "return" agar bisa di-return
  try {
    const normalized = text
      .replace(/export\s+default\s+/, 'return ')
      .replace(/export\s+(?:const|let|var)\s+\w+\s*=\s*/, 'return ');

    // Bungkus dalam function dan jalankan
    // eslint-disable-next-line no-new-func
    const fn = new Function(normalized);
    const result = fn();
    if (Array.isArray(result)) return result;
  } catch (_) {
    // lanjut ke strategi 2
  }

  // ── Strategi 2: JSON.parse dengan pembersihan agresif ─────────────
  // Cari blok array terluar [...]
  const startIdx = text.indexOf('[');
  const endIdx   = text.lastIndexOf(']');
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    throw new Error('Tidak ditemukan array soal di dalam file.');
  }

  let arrStr = text.slice(startIdx, endIdx + 1);

  arrStr = arrStr
    // hapus komentar single-line
    .replace(/\/\/[^\n]*/g, '')
    // hapus komentar multi-line
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // trailing comma sebelum } atau ]
    .replace(/,(\s*[}\]])/g, '$1')
    // single quote → double quote (hati-hati: hanya yang di luar string)
    .replace(/([{,\[])\s*'([^'\\]*(\\.[^'\\]*)*)'\s*:/g, '$1"$2":')
    // value single quote → double quote
    .replace(/:\s*'([^'\\]*(\\.[^'\\]*)*)'/g, ': "$1"')
    // property tanpa quote: { key: → { "key":
    .replace(/([{,]\s*)([a-zA-Z_]\w*)\s*:/g, '$1"$2":');

  return JSON.parse(arrStr);
}

// ── Validasi ──────────────────────────────────────────────────────────────────
function validateSoalArray(arr) {
  const errors = [];
  const soal   = [];

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
      teks:         item.teks,
      pilihan:      item.pilihan.map(String),
      jawabanBenar: item.jawabanBenar,
      penjelasan:   item.penjelasan  || 'Tidak ada penjelasan.',
      pembahasan:   item.pembahasan  || item.penjelasan || 'Tidak ada pembahasan.',
      ...(item.mapel    ? { mapel:    item.mapel    } : {}),
      ...(item.bab      ? { bab:      item.bab      } : {}),
      ...(item.namaBab  ? { namaBab:  item.namaBab  } : {}),
    });
  });

  return { soal, errors };
}
