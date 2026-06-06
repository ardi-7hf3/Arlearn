import React, { useState } from 'react';
import CustomAlert from './CustomAlert';

const USERS = [
  { username: 'Gita',  password: 'akuhitam', displayName: 'Gita' },
  { username: 'Andi',  password: 'akuhitam', displayName: 'Andi' },
  { username: 'Raisha',password: 'akuhitam', displayName: 'Raisha' },
  { username: 'Imam',  password: 'akuhitam', displayName: 'Imam' },
];

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass]  = useState(false);
  const [loading, setLoading]    = useState(false);
  const [alert, setAlert]        = useState({ show: false });

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setAlert({ show: true, tipe: 'warning', judul: 'Form Tidak Lengkap', pesan: 'Harap isi username dan password terlebih dahulu.' });
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const user = USERS.find(u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password);
    if (user) {
      localStorage.setItem('arlearn_user', user.displayName);
      onLogin(user.displayName);
    } else {
      setLoading(false);
      setAlert({ show: true, tipe: 'error', judul: 'Login Gagal', pesan: 'Username atau password yang kamu masukkan salah. Periksa kembali.' });
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleLogin(); };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#050B18' }}>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #00E5FF 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #06B6D4 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(0,229,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="w-full max-w-[440px] animate-fadeIn">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #00E5FF, #0891B2)', boxShadow: '0 0 30px rgba(0,229,255,0.3)' }}>
            <span className="font-display font-black text-2xl" style={{ color: '#050B18' }}>AR</span>
          </div>
          <h1 className="font-display font-black text-3xl logo-gradient mb-1">ARLearn</h1>
          <p className="text-sm" style={{ color: '#475569' }}>Platform Tryout Premium · XI ARTERI</p>
        </div>

        <div className="rounded-2xl p-8"
          style={{ background: '#111827', border: '1px solid rgba(0,229,255,0.15)', boxShadow: '0 0 0 1px rgba(0,229,255,0.05), 0 20px 60px rgba(0,0,0,0.6)' }}>
          <h2 className="font-display font-bold text-xl mb-1" style={{ color: '#F0F6FF' }}>Masuk ke Akun</h2>
          <p className="text-sm mb-6" style={{ color: '#475569' }}>Silakan login untuk mulai tryout</p>

          <div className="mb-4">
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#64748B' }}>Username</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#475569' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <input type="text" className="w-full pl-10 pr-4 py-3 rounded-xl text-sm input-neon"
                placeholder="Gita / Andi / Raisha / Imam"
                value={username} onChange={e => setUsername(e.target.value)} onKeyDown={handleKey}
                style={{ background: '#0B1121', border: '1px solid #1E293B', color: '#F0F6FF', outline: 'none' }} />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#64748B' }}>Password</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#475569' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </div>
              <input type={showPass ? 'text' : 'password'} className="w-full pl-10 pr-11 py-3 rounded-xl text-sm input-neon"
                placeholder="Masukkan password"
                value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKey}
                style={{ background: '#0B1121', border: '1px solid #1E293B', color: '#F0F6FF', outline: 'none' }} />
              <button onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: '#475569' }}
                onMouseEnter={e => e.currentTarget.style.color = '#00E5FF'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                {showPass
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          <button onClick={handleLogin} disabled={loading}
            className="w-full py-3.5 rounded-xl font-display font-bold text-base btn-gradient disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full spin-anim" />Memverifikasi...</>
            ) : (
              <>Masuk <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
            )}
          </button>

          <p className="text-center text-xs mt-5" style={{ color: '#334155' }}>
            Platform tryout eksklusif untuk <span style={{ color: '#00E5FF' }}>XI ARTERI</span>
          </p>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-full" style={{ width: 6, height: 6, background: i === 1 ? '#00E5FF' : '#1E293B' }} />
          ))}
        </div>
      </div>

      <CustomAlert show={alert.show} tipe={alert.tipe} judul={alert.judul} pesan={alert.pesan}
        onOk={() => setAlert({ show: false })} />
    </div>
  );
}
