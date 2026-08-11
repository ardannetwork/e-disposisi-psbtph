import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PETUGAS_PBT_LIST, UserRole } from '../types/disposisi';
import { ShieldCheck, UserCheck, RefreshCw, Sparkles, AlertCircle, Key, LogOut, Wallet, Sun, Moon, Menu, User } from 'lucide-react';

interface NavbarProps {
  onOpenFirebaseModal: () => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenFirebaseModal, onToggleSidebar }) => {
  const { currentUser, switchDemoRole, logout, usersList, isFirebaseActive, theme, toggleTheme, updateCurrentUser } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [selectedPbt, setSelectedPbt] = useState<string>(
    currentUser?.pbt_name || PETUGAS_PBT_LIST[0]
  );
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const pendingUsersCount = usersList.filter((u) => !u.approved).length;

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleOpenProfile = () => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditEmail(currentUser.email);
      setEditPassword(currentUser.password || '');
    }
    setShowProfileModal(true);
  };

  const handleCloseProfile = () => {
    setShowProfileModal(false);
  };

  const handleOpenConfirm = () => {
    setShowProfileModal(false);
    setShowConfirmModal(true);
  };

  const handleCloseConfirm = () => {
    setShowConfirmModal(false);
  };

  const handleConfirmUpdate = () => {
    updateCurrentUser({
      name: editName,
      email: editEmail,
      password: editPassword,
    });
    setShowConfirmModal(false);
  };

  const handleSwitchRole = (role: UserRole) => {
    switchDemoRole(role, role === 'pbt' ? selectedPbt : undefined);
    setShowRoleDropdown(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-slate-100 px-3 sm:px-4 lg:px-8 py-2 sm:py-3 transition-all overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4 flex-nowrap">
        {/* LEFT: HAMBURGER MENU & BRANDING LOGO & TITLE */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* MOBILE MENU BUTTON */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden flex items-center justify-center bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-300 p-1.5 sm:p-2 rounded-xl transition-colors flex-shrink-0"
            title="Buka Menu"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white text-base sm:text-xl font-bold flex-shrink-0">
            🌱
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-extrabold text-sm sm:text-base lg:text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-white bg-clip-text text-transparent truncate">
                E-Disposisi UPT PSBTPH
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex-shrink-0">
                Wilayah Kerja Malang
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block truncate">
              Sistem Informasi Pengolahan & Disposisi Surat Permohonan Benih
            </p>
          </div>
        </div>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
          {/* FIREBASE CONNECTION STATUS BADGE */}
          <button
            onClick={onOpenFirebaseModal}
            className={`hidden md:flex items-center gap-1.5 text-xs px-2 sm:px-3 py-1.5 rounded-lg border transition-all flex-shrink-0 ${
              isFirebaseActive
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
            title="Klik untuk konfigurasi Firebase Firestore & Auth"
          >
            <Key className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{isFirebaseActive ? 'Firebase Terhubung' : 'Demo Local (Set Firebase)'}</span>
          </button>

          {/* ROLE BADGE & DEMO SWITCHER BUTTON */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 md:px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-slate-600 transition-all text-xs shadow-md flex-shrink-0"
            >
              <div className="flex items-center gap-1 sm:gap-1.5">
                {currentUser?.role === 'admin' && (
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                )}
                {currentUser?.role === 'operator' && (
                  <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                )}
                {currentUser?.role === 'pbt' && (
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                )}
                {currentUser?.role === 'bendahara' && (
                  <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                )}
                <div className="text-left hidden sm:block">
                  <div className="font-semibold capitalize text-slate-200 flex items-center gap-1">
                    <span>Role: {currentUser?.role}</span>
                    <RefreshCw className="w-3 h-3 text-slate-400" />
                  </div>
                  {currentUser?.role === 'pbt' && (
                    <div className="text-[10px] text-slate-400 max-w-[120px] truncate">
                      {currentUser?.pbt_name}
                    </div>
                  )}
                </div>
              </div>
            </button>

            {/* DEMO ROLE SWITCHER DROPDOWN */}
            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-xs font-semibold text-slate-400 mb-2 px-2 flex items-center justify-between">
                  <span>Simulasi Switch Role (Demo)</span>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                    Instant Switch
                  </span>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => handleSwitchRole('admin')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      currentUser?.role === 'admin'
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                        : 'hover:bg-slate-700/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-bold">Admin (Koordinator)</div>
                        <div className="text-[10px] text-slate-400">Full Access & Disposisi</div>
                      </div>
                    </div>
                    {currentUser?.role === 'admin' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    )}
                  </button>

                  <button
                    onClick={() => handleSwitchRole('operator')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      currentUser?.role === 'operator'
                        ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30'
                        : 'hover:bg-slate-700/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div className="font-bold">Operator Surat</div>
                        <div className="text-[10px] text-slate-400">Input & Rekap Surat</div>
                      </div>
                    </div>
                    {currentUser?.role === 'operator' && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    )}
                  </button>

                  <div className="pt-2 border-t border-slate-700/60">
                    <div className="text-[11px] font-semibold text-slate-300 mb-1 px-2">
                      Role PBT (Pengawas Benih)
                    </div>
                    <select
                      value={selectedPbt}
                      onChange={(e) => setSelectedPbt(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 mb-2 focus:outline-none focus:border-amber-500"
                    >
                      {PETUGAS_PBT_LIST.map((pbt) => (
                        <option key={pbt} value={pbt}>
                          {pbt}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleSwitchRole('pbt')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        currentUser?.role === 'pbt'
                          ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                          : 'hover:bg-slate-700/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <div>
                          <div className="font-bold">PBT Terpilih</div>
                          <div className="text-[10px] text-slate-400">Centang Status Tugas</div>
                        </div>
                      </div>
                      {currentUser?.role === 'pbt' && (
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      )}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60">
                    <button
                      onClick={() => handleSwitchRole('bendahara')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        currentUser?.role === 'bendahara'
                          ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                          : 'hover:bg-slate-700/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="font-bold">Bendahara</div>
                          <div className="text-[10px] text-slate-400">Kelola Pembayaran</div>
                        </div>
                      </div>
                      {currentUser?.role === 'bendahara' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* USER PENDING NOTIFICATION FOR ADMIN */}
          {currentUser?.role === 'admin' && pendingUsersCount > 0 && (
            <div className="relative hidden lg:block">
              <span className="flex h-3 w-3 absolute -top-1 -right-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <div className="bg-rose-500/20 border border-rose-500/30 text-rose-300 px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{pendingUsersCount} User Pending</span>
              </div>
            </div>
          )}

          {/* THEME TOGGLE BUTTON */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-300 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex-shrink-0"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* PROFILE EDIT BUTTON */}
          <button
            onClick={handleOpenProfile}
            className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-300 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex-shrink-0"
            title="Edit Profil"
          >
            <User className="w-4 h-4" />
          </button>

          {/* LOGOUT BUTTON */}
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex-shrink-0"
            title="Keluar dari Akun (Logout)"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>

    {/* PROFILE EDIT MODAL */}
    {showProfileModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          onClick={handleCloseProfile}
        />
        <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
          <h3 className="text-lg font-bold text-slate-100 mb-4">Edit Profil</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nama</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email Instansi</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
              <input
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Role / Hak Akses</label>
              <input
                type="text"
                value={currentUser?.role || ''}
                disabled
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCloseProfile}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-700 hover:border-slate-600 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleOpenConfirm}
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/30 hover:border-emerald-500/50 transition-all shadow-lg shadow-emerald-500/10"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    )}

    {/* CHANGE CONFIRMATION MODAL */}
    {showConfirmModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          onClick={handleCloseConfirm}
        />
        <div className="relative w-full max-w-sm bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-500/10 p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
              <UserCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-1">Konfirmasi Perubahan</h3>
            <p className="text-sm text-slate-400 mb-6">
              Apakah Anda yakin ingin menyimpan perubahan data profil?
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={handleCloseConfirm}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-700 hover:border-slate-600 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmUpdate}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/30 hover:border-emerald-500/50 transition-all shadow-lg shadow-emerald-500/10"
              >
                Ya, Simpan
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* LOGOUT CONFIRMATION MODAL */}
    {showLogoutConfirm && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          onClick={handleLogoutCancel}
        />
        <div className="relative w-full max-w-sm bg-slate-900 border border-rose-500/30 rounded-2xl shadow-2xl shadow-rose-500/10 p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mb-4">
              <LogOut className="w-7 h-7 text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-1">Konfirmasi Keluar</h3>
            <p className="text-sm text-slate-400 mb-6">
              Apakah Anda yakin ingin keluar dari akun <span className="text-rose-300 font-semibold">{currentUser?.name}</span>?
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={handleLogoutCancel}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-700 hover:border-slate-600 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm font-semibold hover:bg-rose-500/30 hover:border-rose-500/50 transition-all shadow-lg shadow-rose-500/10"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>);
};
