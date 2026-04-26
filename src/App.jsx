import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import LoginPage from './components/LoginPage';
import DashboardTryout from './components/DashboardTryout';
import RiwayatPage from './components/RiwayatPage';
import KelolaSoalPage from './components/KelolaSoalPage';
import Navbar from './components/Navbar';
import CustomAlert from './components/CustomAlert';

const SESSION_KEY = 'arlearn_session';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try { return localStorage.getItem(SESSION_KEY) === 'true'; } catch { return false; }
  });
  const [page, setPage] = useState('dashboard');
  const [logoutAlert, setLogoutAlert] = useState(false);

  const handleLogin = () => {
    localStorage.setItem(SESSION_KEY, 'true');
    setIsLoggedIn(true);
    setPage('dashboard');
  };

  const handleLogout = () => setLogoutAlert(true);
  const konfirmasiLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setIsLoggedIn(false);
    setLogoutAlert(false);
    setPage('dashboard');
  };

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen" style={{ background: '#050B18' }}>
      <Navbar activePage={page} setPage={setPage} onLogout={handleLogout} />
      <main className="pt-16">
        {page === 'dashboard' && <DashboardTryout onGoRiwayat={() => setPage('riwayat')} />}
        {page === 'riwayat' && <RiwayatPage />}
        {page === 'kelola' && <KelolaSoalPage />}
      </main>

      <CustomAlert
        show={logoutAlert}
        tipe="confirm"
        judul="Keluar dari ARLearn?"
        pesan="Sesimu akan diakhiri. Kamu perlu login kembali untuk mengakses ARLearn."
        yesLabel="Ya, Keluar"
        noLabel="Batal"
        onYes={konfirmasiLogout}
        onNo={() => setLogoutAlert(false)}
      />
    </div>
  );
}
