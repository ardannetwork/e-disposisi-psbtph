import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, PlusCircle, UserCheck, Settings, Shield, Sparkles, Wallet, Menu, X, ClipboardList } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'surat_list' | 'input_surat' | 'user_approval' | 'bendahara' | 'settings' | 'public_submissions';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewSuratModal: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewSuratModal,
  sidebarOpen,
  toggleSidebar,
}) => {
  const { currentUser, usersList, publicSubmissionsList } = useAuth();
  const pendingUsersCount = usersList.filter((u) => !u.approved).length;

  const isPbt = currentUser?.role === 'pbt';
  const isOperator = currentUser?.role === 'operator';
  const isAdmin = currentUser?.role === 'admin';

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    toggleSidebar();
  };

  return (
    <>
      {/* MOBILE BACKDROP */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900/60 backdrop-blur-md border-r border-slate-800 p-3 lg:p-4 flex flex-col lg:justify-between shrink-0 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-64 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* MOBILE HEADER WITH CLOSE BUTTON */}
        <div className="flex items-center justify-between lg:hidden mb-3">
          <span className="font-extrabold text-sm text-slate-100">Menu</span>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 lg:space-y-6">
          {/* PROFILE CARD SUMMARY */}
          <div className="p-3 lg:p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-800/60 border border-slate-200 dark:border-slate-700/80 shadow-md">
            <div className="flex items-center gap-2.5 lg:gap-3">
              <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center font-bold text-lg text-slate-900 shadow-md ${
                isAdmin ? 'bg-gradient-to-br from-emerald-500 to-teal-700 dark:bg-gradient-to-br dark:from-emerald-500 dark:to-teal-700' :
                isOperator ? 'bg-gradient-to-br from-cyan-500 to-blue-700 dark:bg-gradient-to-br dark:from-cyan-500 dark:to-blue-700' :
                'bg-gradient-to-br from-amber-500 to-orange-700 dark:bg-gradient-to-br dark:from-amber-500 dark:to-orange-700'
              }`}>
                {currentUser?.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{currentUser?.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser?.email}</p>
              </div>
            </div>
            <div className="mt-2 lg:mt-2.5 pt-1.5 lg:pt-2 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Hak Akses:</span>
              <span className={`px-2 py-0.5 rounded-md font-semibold uppercase ${
                isAdmin ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30' :
                isOperator ? 'bg-cyan-500/20 text-cyan-700 border border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30' :
                'bg-amber-500/20 text-amber-700 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
              }`}>
                {currentUser?.role}
              </span>
            </div>
          </div>

          {/* INPUT SURAT BARU ACTION BUTTON */}
          {(isAdmin || isOperator) && (
            <button
              onClick={() => { onOpenNewSuratModal(); toggleSidebar(); }}
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all transform active:scale-98"
            >
              <PlusCircle className="w-5 h-5" />
              <span>+ Input Surat Masuk</span>
            </button>
          )}

          {/* NAVIGATION LINKS */}
          <nav className="space-y-1">
            <div className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Menu Utama
            </div>

            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center gap-3 px-3 lg:px-3.5 py-2 lg:py-2.5 rounded-xl font-medium text-xs transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Statistik</span>
            </button>

            <button
              onClick={() => handleNavClick('surat_list')}
              className={`w-full flex items-center justify-between px-3 lg:px-3.5 py-2 lg:py-2.5 rounded-xl font-medium text-xs transition-all ${
                activeTab === 'surat_list'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>{isPbt ? 'Surat Tugas Saya' : 'Data Disposisi Surat'}</span>
              </div>
              {isPbt && (
                <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
                  PBT
                </span>
              )}
            </button>

            {/* OPERATOR & ADMIN: PUBLIC SUBMISSIONS REVIEW */}
            {(isOperator || isAdmin) && (
              <button
                onClick={() => handleNavClick('public_submissions')}
                className={`w-full flex items-center justify-between px-3 lg:px-3.5 py-2 lg:py-2.5 rounded-xl font-medium text-xs transition-all ${
                  activeTab === 'public_submissions'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-4 h-4" />
                  <span>Permohonan Publik</span>
                </div>
                {publicSubmissionsList.filter((s) => s.status === 'pending').length > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {publicSubmissionsList.filter((s) => s.status === 'pending').length}
                  </span>
                )}
              </button>
            )}

            {/* ADMIN ONLY: USER APPROVAL MANAGEMENT */}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('user_approval')}
                className={`w-full flex items-center justify-between px-3 lg:px-3.5 py-2 lg:py-2.5 rounded-xl font-medium text-xs transition-all ${
                  activeTab === 'user_approval'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="w-4 h-4" />
                  <span>Persetujuan User</span>
                </div>
                {pendingUsersCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {pendingUsersCount}
                  </span>
                )}
              </button>
            )}

            {/* BENDAHARA: PEMBAYARAN PAGE */}
            {currentUser?.role === 'bendahara' && (
              <button
                onClick={() => handleNavClick('bendahara')}
                className={`w-full flex items-center gap-3 px-3 lg:px-3.5 py-2 lg:py-2.5 rounded-xl font-medium text-xs transition-all ${
                  activeTab === 'bendahara'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Pembayaran</span>
              </button>
            )}

            {/* SETTINGS LINK */}
            <button
              onClick={() => handleNavClick('settings')}
              className={`w-full flex items-center gap-3 px-3 lg:px-3.5 py-2 lg:py-2.5 rounded-xl font-medium text-xs transition-all ${
                activeTab === 'settings'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan Firebase</span>
            </button>
          </nav>
        </div>

        {/* FOOTER INFO */}
        <div className="pt-3 lg:pt-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center gap-1 font-semibold text-slate-400">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>UPT PSBTPH IV Jatim</span>
          </div>
          <p>Wilayah Kerja Malang &copy; 2026</p>
        </div>
      </aside>
    </>
  );
};
