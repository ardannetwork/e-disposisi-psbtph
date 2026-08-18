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
  FileText,
} from 'lucide-react';
import logoImage from '../image/Gemini_Generated_Image_txdza3txdza3txdz.jpg';

export const LoginRegister: React.FC = () => {
  const { login, loginWithGoogle, registerUser, switchDemoRole } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'surat'>('login');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('admin.malang@psbtph.go.id');
  const [loginPassword, setLoginPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

  const handleGoogleLogin = async () => {
    setLoginError('');
    setIsGoogleLoading(true);
    const res = await loginWithGoogle();
    if (!res.success) {
      setLoginError(res.message);
    }
    setIsGoogleLoading(false);
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
          <img
            src={logoImage}
            alt="Logo E-Disposisi"
            className="w-14 h-14 mx-auto mb-3 rounded-2xl object-cover shadow-lg shadow-emerald-500/20"
          />
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
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'login'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('register');
                setLoginError('');
                setRegMessage(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'register'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('surat');
                setLoginError('');
                setRegMessage(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'surat'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Permohonan Surat</span>
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
                <label className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  Email Terdaftar
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="contoh: admin.malang@psbtph.go.id"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi..."
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:shadow-emerald-500/30"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Sistem</span>
              </button>
            </form>

            {/* GOOGLE LOGIN BUTTON */}
            <div className="relative flex items-center pt-2">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink-0 mx-4 text-slate-500 text-[10px] uppercase font-bold tracking-wider">Atau</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-bold text-xs shadow-md flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>{isGoogleLoading ? 'Memproses...' : 'Masuk dengan Akun Google'}</span>
            </button>

            {/* QUICK DEMO LOGIN BUTTONS */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
              <div className="text-[11px] font-semibold text-slate-400 text-center">
                Atau Quick Login Demo (1-Click):
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => switchDemoRole('admin')}
                  className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex flex-col items-center gap-1.5 transition-all hover:border-emerald-400/50"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchDemoRole('operator')}
                  className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold flex flex-col items-center gap-1.5 transition-all hover:border-cyan-400/50"
                >
                  <UserCheck className="w-5 h-5 text-cyan-400" />
                  <span>Operator</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchDemoRole('pbt', PETUGAS_PBT_LIST[0])}
                  className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex flex-col items-center gap-1.5 transition-all hover:border-amber-400/50"
                >
                  <Sparkles className="w-5 h-5 text-amber-400" />
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

        {/* TAB 3: PERMOHONAN SURAT */}
        {activeTab === 'surat' && (
          <div className="p-6 space-y-4">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-600/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                <FileText className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Form Permohonan Surat</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Ajukan permohonan surat tanpa perlu login. Silakan isi formulir di bawah ini.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                window.location.hash = '#/form-publik';
              }}
              className="block w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 text-center transition-all hover:shadow-emerald-500/30"
            >
              <FileText className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              Buka Form Permohonan Surat
            </button>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-400 space-y-1.5">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Informasi
              </div>
              <ul className="space-y-1 list-disc list-inside text-slate-400">
                <li>Tidak perlu membuat akun untuk mengajukan surat</li>
                <li>Data formulir akan diverifikasi oleh petugas</li>
                <li>Status permohonan dapat dicek melalui form ini</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
