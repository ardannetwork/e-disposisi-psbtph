import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, PETUGAS_PBT_LIST } from '../types/disposisi';
import {
  LogIn,
  UserPlus,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Building,
} from 'lucide-react';

export const LoginRegister: React.FC = () => {
  const { login, registerUser, switchDemoRole } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('admin.malang@psbtph.go.id');
  const [loginPassword, setLoginPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('pbt');
  const [regPbtName, setRegPbtName] = useState<string>(PETUGAS_PBT_LIST[0]);

  const [regMessage, setRegMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const res = login(loginEmail, loginPassword);
    if (!res.success) {
      setLoginError(res.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegMessage(null);

    if (regPassword !== regConfirmPass) {
      setRegMessage({ type: 'error', text: 'Konfirmasi kata sandi tidak cocok!' });
      return;
    }

    if (regPassword.length < 4) {
      setRegMessage({ type: 'error', text: 'Kata sandi minimal 4 karakter!' });
      return;
    }

    const res = registerUser(
      regEmail,
      regName,
      regPassword,
      regRole,
      regRole === 'pbt' ? regPbtName : undefined
    );

    if (res.success) {
      setRegMessage({ type: 'success', text: res.message });
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPass('');
    } else {
      setRegMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* BACKGROUND DECORATIVE GLOWS */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* BRANDING HEADER */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-center border-b border-slate-800 relative">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-3xl">
            🌱
          </div>
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-300 to-white bg-clip-text text-transparent">
            E-Disposisi Surat UPT PSBTPH
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Wilayah Kerja Malang &bull; Dinas Pertanian Jawa Timur
          </p>

          {/* TAB SWITCHER */}
          <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800 mt-5">
            <button
              onClick={() => {
                setActiveTab('login');
                setLoginError('');
                setRegMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'login'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk (Login)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('register');
                setLoginError('');
                setRegMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'register'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>
        </div>

        {/* TAB 1: LOGIN FORM */}
        {activeTab === 'login' && (
          <div className="p-6 space-y-5">
            {loginError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Gagal Masuk</div>
                  <div>{loginError}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Terdaftar</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="contoh: admin.malang@psbtph.go.id"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kata Sandi (Password)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi..."
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Sistem</span>
              </button>
            </form>

            {/* QUICK DEMO LOGIN BUTTONS */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 text-center">
                Atau Gunakan Quick Login Demo (1-Click):
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => switchDemoRole('admin')}
                  className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex flex-col items-center gap-1 transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchDemoRole('operator')}
                  className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold flex flex-col items-center gap-1 transition-all"
                >
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  <span>Operator</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchDemoRole('pbt', PETUGAS_PBT_LIST[0])}
                  className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex flex-col items-center gap-1 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>PBT</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER FORM */}
        {activeTab === 'register' && (
          <div className="p-6 space-y-4">
            {regMessage && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in ${
                  regMessage.type === 'success'
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}
              >
                {regMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">
                    {regMessage.type === 'success' ? 'Pendaftaran Dikirim' : 'Gagal Daftar'}
                  </div>
                  <div>{regMessage.text}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Lengkap</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Pengguna"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Instansi</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="nama@psbtph.go.id"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kata Sandi</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 4 kar..."
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Konfirmasi</label>
                  <input
                    type="password"
                    required
                    placeholder="Ulangi sandi..."
                    value={regConfirmPass}
                    onChange={(e) => setRegConfirmPass(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Permohonan Role (Hak Akses)</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="pbt">PBT (Pengawas Benih Tanaman)</option>
                  <option value="operator">Operator Surat</option>
                  <option value="admin">Admin Koordinator</option>
                </select>
              </div>

              {regRole === 'pbt' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pemetaan Nama Petugas PBT</label>
                  <select
                    value={regPbtName}
                    onChange={(e) => setRegPbtName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
                  >
                    {PETUGAS_PBT_LIST.map((pbt) => (
                      <option key={pbt} value={pbt}>
                        {pbt}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Akun (Proses Approval)</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
