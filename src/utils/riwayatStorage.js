const KEY = 'riwayatARLearn';

export function getRiwayat() {
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addRiwayat(entry) {
  const current = getRiwayat();
  const newEntry = {
    id: Date.now(),
    tanggal: new Date().toISOString(),
    ...entry
  };
  const updated = [newEntry, ...current];
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function deleteRiwayat(id) {
  const current = getRiwayat();
  const filtered = current.filter(r => r.id !== id);
  localStorage.setItem(KEY, JSON.stringify(filtered));
  return filtered;
}

export function clearRiwayat() {
  localStorage.removeItem(KEY);
}

export function formatTanggal(isoString) {
  const d = new Date(isoString);
  const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${String(d.getHours()).padStart(2,'0')}.${String(d.getMinutes()).padStart(2,'0')}`;
}
