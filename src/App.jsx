// ============================================================
//  App.jsx — Router utama ARLearn
//  Hanya 2 "halaman": UserApp dan AdminPanel
//  Semua logika ada di masing-masing file
// ============================================================

import React, { useState } from 'react';
import UserApp    from './components/UserApp';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  if (showAdmin) {
    return <AdminPanel onBack={() => setShowAdmin(false)} />;
  }

  return <UserApp onNeedAdmin={() => setShowAdmin(true)} />;
}
