import { soalKimia }     from '../data/soalKimia';
import { soalFisika }    from '../data/soalFisika';
import { soalMtkLanjut } from '../data/soalMtkLanjut';
import { soalMtkWajib }  from '../data/soalMtkWajib';

const STORAGE_KEY = 'soalARLearn';

const ALL_DEFAULT = [
  ...soalKimia,
  ...soalFisika,
  ...soalMtkLanjut,
  ...soalMtkWajib,
];

export function getSoal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return ALL_DEFAULT;
}

export function setSoal(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// Tambah soal baru ke bank soal (dipakai UploadSoalModal)
export function addSoal(newSoal) {
  const current = getSoal();
  const baseId  = Date.now();
  const withId  = newSoal.map((s, i) => ({
    id: s.id || baseId + i,
    ...s,
  }));
  const merged = [...current, ...withId];
  setSoal(merged);
  return merged;
}

export function resetSoal() {
  localStorage.removeItem(STORAGE_KEY);
  return ALL_DEFAULT;
}

export function getDefaultSoal() {
  return ALL_DEFAULT;
}
