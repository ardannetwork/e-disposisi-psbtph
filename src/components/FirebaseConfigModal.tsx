import React, { useState, useEffect } from 'react';
import {
  FirebaseConfig,
  getSavedFirebaseConfig,
  saveFirebaseConfig,
  clearFirebaseConfig,
} from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { X, Key, Save, Trash2, CheckCircle2, Info, Download, Upload, Database } from 'lucide-react';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { exportDatabase, importDatabase, isFirebaseActive } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const saved = getSavedFirebaseConfig();
    if (saved) {
      setApiKey(saved.apiKey || '');
      setAuthDomain(saved.authDomain || '');
      setProjectId(saved.projectId || '');
      setStorageBucket(saved.storageBucket || '');
      setMessagingSenderId(saved.messagingSenderId || '');
      setAppId(saved.appId || '');
    }
  }, [isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const config: FirebaseConfig = {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
    };
    saveFirebaseConfig(config);
    setSavedSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const handleClear = () => {
    if (confirm('Apakah Anda yakin ingin menghapus konfigurasi Firebase dan kembali ke Demo Local Mode?')) {
      clearFirebaseConfig();
      window.location.reload();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importDatabase(content);
        setImportStatus(res);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="bg-slate-800/80 border-b border-slate-700 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Manajemen Database & Firebase</h3>
              <p className="text-xs text-slate-400">
                Status DB: {isFirebaseActive ? 'Terhubung ke Cloud Firestore' : 'Mode Database Lokal (Storage & IndexedDB)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
          {/* SECTION: BACKUP & RESTORE DATABASE */}
          <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Cadangan & Pemulihan Database (Backup / Restore)</span>
              </div>
            </div>
            <p className="text-slate-400 text-[11px]">
              Ekspor seluruh data lembar disposisi dan pengguna ke file JSON lokal atau impor file cadangan ke dalam sistem.
            </p>

            {importStatus && (
              <div
                className={`p-3 rounded-xl font-bold text-[11px] flex items-center gap-2 ${
                  importStatus.success
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{importStatus.message}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={exportDatabase}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Backup DB (.json)</span>
              </button>

              <label className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold flex items-center gap-2 cursor-pointer transition-colors border border-slate-600">
                <Upload className="w-4 h-4" />
                <span>Impor Backup DB</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* SECTION: FIREBASE CLOUD CONFIG */}
          <form onSubmit={handleSave} className="space-y-4 border-t border-slate-800 pt-4">
            <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Konfigurasi Firebase Cloud Firestore</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 text-slate-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-amber-300">
                <Info className="w-4 h-4" />
                <span>Petunjuk Firebase Credentials:</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Masukkan API Key dan Project ID dari Firebase Console untuk menyinkronkan data secara real-time antar perangkat.
              </p>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Konfigurasi disimpan! Memuat ulang aplikasi...</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">API Key</label>
                <input
                  type="text"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Auth Domain</label>
                  <input
                    type="text"
                    placeholder="project-id.firebaseapp.com"
                    value={authDomain}
                    onChange={(e) => setAuthDomain(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Project ID</label>
                  <input
                    type="text"
                    placeholder="psbtph-malang"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Storage Bucket</label>
                  <input
                    type="text"
                    placeholder="project-id.appspot.com"
                    value={storageBucket}
                    onChange={(e) => setStorageBucket(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Messaging Sender ID</label>
                  <input
                    type="text"
                    placeholder="123456789"
                    value={messagingSenderId}
                    onChange={(e) => setMessagingSenderId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">App ID</label>
                <input
                  type="text"
                  placeholder="1:123456789:web:abc123def"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset ke Local DB</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold shadow-lg flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Konfigurasi</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
