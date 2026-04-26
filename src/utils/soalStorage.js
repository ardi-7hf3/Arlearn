import { soalDefault } from '../data/soalDefault.js';

const KEY = 'soalARLearn';

export function getSoal() {
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return [...soalDefault];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...soalDefault];
  } catch {
    return [...soalDefault];
  }
}

export function setSoal(soalArr) {
  localStorage.setItem(KEY, JSON.stringify(soalArr));
}

export function addSoal(soalBaru) {
  const current = getSoal();
  const maxId = current.reduce((max, s) => Math.max(max, s.id), 0);
  const withIds = soalBaru.map((s, i) => ({ ...s, id: maxId + i + 1 }));
  const updated = [...current, ...withIds];
  setSoal(updated);
  return updated;
}

export function deleteSoal(id) {
  const current = getSoal();
  const filtered = current.filter(s => s.id !== id);
  setSoal(filtered);
  return filtered;
}

export function resetToDefault() {
  setSoal([...soalDefault]);
  return [...soalDefault];
}

export function isDefaultSoal(id) {
  return soalDefault.some(s => s.id === id);
}
