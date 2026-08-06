import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PETUGAS_PBT_LIST, UserRole } from '../types/disposisi';
import { ShieldCheck, UserCheck, RefreshCw, Sparkles, AlertCircle, Key, LogOut, Wallet } from 'lucide-react';

interface NavbarProps {
  onOpenFirebaseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenFirebaseModal }) => {
  const { currentUser, switchDemoRole, logout, usersList, isFirebaseActive } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [selectedPbt, setSelectedPbt] = useState<string>(
    currentUser?.pbt_name || PETUGAS_PBT_LIST[0]
  );

  const pendingUsersCount = usersList.filter((u) => !u.approved).length;

  const handleSwitchRole = (role: UserRole) => {
    switchDemoRole(role, role === 'pbt' ? selectedPbt : undefined);
    setShowRoleDropdown(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* BRANDING LOGO & TITLE */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white text-xl font-bold">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base lg:text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-white bg-clip-text text-transparent">
                E-Disposisi UPT PSBTPH
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                Wilayah Kerja Malang
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Sistem Informasi Pengolahan & Disposisi Surat Permohonan Benih
            </p>
          </div>
        </div>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-3">
          {/* FIREBASE CONNECTION STATUS BADGE */}
          <button
            onClick={onOpenFirebaseModal}
            className={`hidden md:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
              isFirebaseActive
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
            title="Klik untuk konfigurasi Firebase Firestore & Auth"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{isFirebaseActive ? 'Firebase Terhubung' : 'Demo Local (Set Firebase)'}</span>
          </button>

          {/* ROLE BADGE & DEMO SWITCHER BUTTON */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-slate-600 transition-all text-xs shadow-md"
            >
              <div className="flex items-center gap-1.5">
                {currentUser?.role === 'admin' && (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                )}
                {currentUser?.role === 'operator' && (
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                )}
                {currentUser?.role === 'pbt' && (
                  <Sparkles className="w-4 h-4 text-amber-400" />
                )}
                {currentUser?.role === 'bendahara' && (
                  <Wallet className="w-4 h-4 text-emerald-400" />
                )}
                <div className="text-left">
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

          {/* LOGOUT BUTTON */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
            title="Keluar dari Akun (Logout)"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
