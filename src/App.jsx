import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import LoginPage from './components/LoginPage';
import DashboardTryout from './components/DashboardTryout';
import BabSelectorPage from './components/BabSelectorPage';
import RiwayatPage from './components/RiwayatPage';
import KelolaSoalPage from './components/KelolaSoalPage';
import Navbar from './components/Navbar';
import CustomAlert from './components/CustomAlert';
import UploadSoalModal from './components/UploadSoalModal';

const SESSION_KEY = 'arlearn_session';
const USER_KEY    = 'arlearn_user';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try { return localStorage.getItem(SESSION_KEY) === 'true'; } catch { return false; }
  });
  const [userName, setUserName] = useState(() => {
    try { return localStorage.getItem(USER_KEY) || 'Pengguna'; } catch { return 'Pengguna'; }
  });
  const [page, setPage]             = useState('babSelector');
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [logoutAlert, setLogoutAlert] = useState(false);
  const [showUpload, setShowUpload]   = useState(false);

  const handleLogin = (name) => {
    localStorage.setItem(SESSION_KEY, 'true');
    localStorage.setItem(USER_KEY, name);
    setUserName(name);
    setIsLoggedIn(true);
    setPage('babSelector');
  };

  const handleLogout  = () => setLogoutAlert(true);
  const konfirmasiLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setIsLoggedIn(false);
    setLogoutAlert(false);
    setPage('babSelector');
  };

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen" style={{ background: '#050B18' }}>
      <Navbar
        activePage={page === 'babSelector' ? 'dashboard' : page}
        setPage={(p) => { if(p==='dashboard') setPage('babSelector'); else setPage(p); }}
        onLogout={handleLogout}
        userName={userName}
        onUpload={() => setShowUpload(true)}
      />
      <main className="pt-14">
        {page === 'babSelector' && (
          <BabSelectorPage
            userName={userName}
            onMulaiTryout={(filter) => { setSelectedFilter(filter); setPage('dashboard'); }}
          />
        )}
        {page === 'dashboard' && (
          <DashboardTryout
            onGoRiwayat={() => setPage('riwayat')}
            userName={userName}
            filterMapel={selectedFilter?.mapel}
            filterBab={selectedFilter?.bab}
            onBack={() => setPage('babSelector')}
          />
        )}
        {page === 'riwayat'   && <RiwayatPage />}
        {page === 'kelola'    && <KelolaSoalPage />}
      </main>

      <UploadSoalModal
        show={showUpload}
        onClose={() => setShowUpload(false)}
        onSuccess={() => setShowUpload(false)}
      />

      <CustomAlert show={logoutAlert} tipe="confirm"
        judul="Keluar dari ARLearn?"
        pesan="Sesimu akan diakhiri. Kamu perlu login kembali untuk mengakses ARLearn."
        yesLabel="Ya, Keluar" noLabel="Batal"
        onYes={konfirmasiLogout} onNo={() => setLogoutAlert(false)} />
    </div>
  );
}
