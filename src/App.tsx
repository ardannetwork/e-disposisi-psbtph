import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardStats } from './components/DashboardStats';
import { SuratList } from './components/SuratList';
import { SuratFormModal } from './components/SuratFormModal';
import { UserApprovalModal } from './components/UserApprovalModal';
import { BendaharaPage } from './components/BendaharaPage';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { LoginRegister } from './components/LoginRegister';
import { DisposisiSurat } from './types/disposisi';
import { AlertTriangle, LogOut, Clock, ShieldAlert } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals state
  const [isSuratModalOpen, setIsSuratModalOpen] = useState(false);
  const [suratModalMode, setSuratModalMode] = useState<'create' | 'edit' | 'disposisi'>('create');
  const [editingSurat, setEditingSurat] = useState<DisposisiSurat | null>(null);

  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  // 1. IF NOT LOGGED IN: SHOW LOGIN / REGISTER SCREEN
  if (!currentUser) {
    return <LoginRegister />;
  }

  // 2. IF LOGGED IN BUT NOT APPROVED: SHOW PENDING APPROVAL SCREEN
  if (!currentUser.approved) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">Akun Menunggu Persetujuan</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Halo <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.email}), pendaftaran akun Anda telah berhasil dicatat dan sedang dalam proses persetujuan (Approval) oleh <strong>Admin UPT PSBTPH Malang</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs text-left text-slate-300 space-y-1">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>Detail Akun Pendaftaran:</span>
            </div>
            <div>&bull; Permohonan Role: <span className="font-bold uppercase text-white">{currentUser.role}</span></div>
            {currentUser.pbt_name && (
              <div>&bull; Petugas PBT: <span className="font-bold text-amber-300">{currentUser.pbt_name}</span></div>
            )}
          </div>

          <button
            onClick={logout}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar ke Halaman Login</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. IF LOGGED IN & APPROVED: SHOW MAIN DASHBOARD APPLICATION
  const handleOpenNewSuratModal = () => {
    setEditingSurat(null);
    setSuratModalMode('create');
    setIsSuratModalOpen(true);
  };

  const handleOpenEditModal = (disposisi: DisposisiSurat) => {
    setEditingSurat(disposisi);
    setSuratModalMode('edit');
    setIsSuratModalOpen(true);
  };

  const handleOpenDisposisiModal = (disposisi: DisposisiSurat) => {
    setEditingSurat(disposisi);
    setSuratModalMode('disposisi');
    setIsSuratModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* NAVBAR */}
      <Navbar onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)} />

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 lg:p-6 gap-6">
        {/* SIDEBAR */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenNewSuratModal={handleOpenNewSuratModal}
        />

        {/* PAGE CONTENT */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardStats
              onNavigateToSurat={() => setActiveTab('surat_list')}
              onNavigateToApproval={() => setActiveTab('user_approval')}
            />
          )}

          {activeTab === 'surat_list' && (
            <SuratList
              onOpenEditModal={handleOpenEditModal}
              onOpenDisposisiModal={handleOpenDisposisiModal}
            />
          )}

          {activeTab === 'user_approval' && <UserApprovalModal />}

          {activeTab === 'bendahara' && <BendaharaPage />}

          {activeTab === 'settings' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h2 className="font-bold text-lg text-white">Pengaturan Sistem & Firebase</h2>
              <p className="text-xs text-slate-400">
                Aplikasi ini mendukung ekosistem Firebase (Authentication & Cloud Firestore) serta fallback LocalStorage untuk pengujian lokal.
              </p>
              <button
                onClick={() => setIsFirebaseModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow"
              >
                Buka Panel Konfigurasi Firebase
              </button>
            </div>
          )}
        </main>
      </div>

      {/* GLOBAL MODALS */}
      <SuratFormModal
        isOpen={isSuratModalOpen}
        onClose={() => setIsSuratModalOpen(false)}
        initialData={editingSurat}
        mode={suratModalMode}
      />

      <FirebaseConfigModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};
