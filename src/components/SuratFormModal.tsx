import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  DisposisiSurat,
  HalType,
  HAL_SERTIFIKASI,
  HAL_WASAR,
  PETUGAS_PBT_LIST,
  CATATAN_DEFAULT_OPTIONS,
  SIFAT_OPTIONS,
} from '../types/disposisi';
import { X, Save, FileText, CheckSquare, Calendar, User, Link as LinkIcon } from 'lucide-react';

interface SuratFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: DisposisiSurat | null;
  mode?: 'create' | 'edit' | 'disposisi';
}

export const SuratFormModal: React.FC<SuratFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create',
}) => {
  const { currentUser, addDisposisi, updateDisposisi } = useAuth();

  const isAdmin = currentUser?.role === 'admin';

  const [suratDari, setSuratDari] = useState('');
  const [nomorSurat, setNomorSurat] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState('');
  const [diterimaTanggal, setDiterimaTanggal] = useState('');
  const [nomorAgenda, setNomorAgenda] = useState('');
  const [sifat, setSifat] = useState<string>('Penting');
  const [halType, setHalType] = useState<HalType>('Sertifikasi');
  const [hal, setHal] = useState<string>(HAL_SERTIFIKASI[0]);
  const [petugas, setPetugas] = useState<string>(PETUGAS_PBT_LIST[0]);
  const [catatanSelected, setCatatanSelected] = useState<string[]>([
    'TL sesuai peraturan yang berlaku',
  ]);
  const [catatanLain, setCatatanLain] = useState('');
  const [linkDokumen, setLinkDokumen] = useState('');
  const [tanggalDisposisi, setTanggalDisposisi] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (initialData) {
      setSuratDari(initialData.surat_dari || '');
      setNomorSurat(initialData.nomor_surat || '');
      setTanggalSurat(initialData.tanggal_surat || '');
      setDiterimaTanggal(initialData.diterima_tanggal || '');
      setNomorAgenda(initialData.nomor_agenda || '');
      setSifat(initialData.sifat || 'Penting');
      setHalType(initialData.hal_type || 'Sertifikasi');
      setHal(initialData.hal || HAL_SERTIFIKASI[0]);
      setPetugas(initialData.petugas || PETUGAS_PBT_LIST[0]);
      setCatatanSelected(initialData.catatan || []);
      setCatatanLain(initialData.catatan_lain || '');
      setLinkDokumen(initialData.link_dokumen || '');
      setTanggalDisposisi(
        initialData.tanggal_disposisi || new Date().toISOString().split('T')[0]
      );
    } else {
      // Auto-generate agenda number for new entries
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      setNomorAgenda(`AGD/${todayStr}/${randomSuffix}`);
      setSuratDari('');
      setNomorSurat('');
      setTanggalSurat(new Date().toISOString().split('T')[0]);
      setDiterimaTanggal(new Date().toISOString().split('T')[0]);
      setSifat('Penting');
      setHalType('Sertifikasi');
      setHal(HAL_SERTIFIKASI[0]);
      setPetugas(PETUGAS_PBT_LIST[0]);
      setCatatanSelected(['TL sesuai peraturan yang berlaku']);
      setCatatanLain('');
      setLinkDokumen('');
      setTanggalDisposisi(new Date().toISOString().split('T')[0]);
    }
  }, [initialData, isOpen]);

  // Handle Category type change
  const handleHalTypeChange = (type: HalType) => {
    setHalType(type);
    setHal(type === 'Sertifikasi' ? HAL_SERTIFIKASI[0] : HAL_WASAR[0]);
  };

  // Checkbox toggle handler
  const handleCatatanToggle = (option: string) => {
    if (catatanSelected.includes(option)) {
      setCatatanSelected(catatanSelected.filter((c) => c !== option));
    } else {
      setCatatanSelected([...catatanSelected, option]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!suratDari || !nomorSurat || !tanggalSurat || !nomorAgenda) {
      alert('Mohon lengkapi field mandatory (Surat Dari, Nomor Surat, Tanggal Surat, Nomor Agenda)');
      return;
    }

    const payload = {
      surat_dari: suratDari,
      nomor_surat: nomorSurat,
      tanggal_surat: tanggalSurat,
      diterima_tanggal: diterimaTanggal,
      nomor_agenda: nomorAgenda,
      sifat,
      hal,
      hal_type: halType,
      petugas: isAdmin || mode === 'disposisi' ? petugas : initialData?.petugas || '',
      catatan: catatanSelected,
      catatan_lain: catatanSelected.includes('Lain-lain') ? catatanLain : '',
      link_dokumen: linkDokumen,
      status: initialData ? initialData.status : false,
      tanggal_disposisi: isAdmin || mode === 'disposisi' ? tanggalDisposisi : initialData?.tanggal_disposisi || '',
      disposisi_oleh: isAdmin || mode === 'disposisi' ? currentUser?.name || 'Avianita Agustina, S.TP.' : initialData?.disposisi_oleh || 'Avianita Agustina, S.TP.',
    };

    if (initialData) {
      updateDisposisi(initialData.id, payload);
    } else {
      addDisposisi(payload);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="bg-slate-800/80 border-b border-slate-700 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {mode === 'create'
                  ? 'Input Surat Masuk Baru'
                  : mode === 'disposisi'
                  ? 'Proses Disposisi Admin (Penugasan PBT)'
                  : 'Edit Data Surat & Disposisi'}
              </h3>
              <p className="text-xs text-slate-400">
                Sistem E-Disposisi Surat UPT PSBTPH Wilayah Kerja Malang
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

        {/* MODAL FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* SECTION 1: INFORMASI SURAT MASUK */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              1. Identitas Surat Masuk
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Surat Dari (Asal Instansi/Pemohon) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelompok Tani Makmur - Singosari"
                  value={suratDari}
                  onChange={(e) => setSuratDari(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nomor Surat <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 012/KTMS/VIII/2026"
                  value={nomorSurat}
                  onChange={(e) => setNomorSurat(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tanggal Terbit Surat <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={tanggalSurat}
                  onChange={(e) => setTanggalSurat(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Diterima Tanggal <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={diterimaTanggal}
                  onChange={(e) => setDiterimaTanggal(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nomor Agenda Surat <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nomorAgenda}
                  onChange={(e) => setNomorAgenda(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sifat Surat
                </label>
                <select
                  value={sifat}
                  onChange={(e) => setSifat(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {SIFAT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: PERIHAL / HAL */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              2. Kategori Perihal (Hal)
            </h4>

            {/* TAB SELECTOR SERTIFIKASI VS WASAR */}
            <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => handleHalTypeChange('Sertifikasi')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  halType === 'Sertifikasi'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                A. Sertifikasi Benih
              </button>
              <button
                type="button"
                onClick={() => handleHalTypeChange('Wasar')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  halType === 'Wasar'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                B. Wasar (Pengawasan Pemasaran)
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pilih Detail Perihal ({halType})
              </label>
              <select
                value={hal}
                onChange={(e) => setHal(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {(halType === 'Sertifikasi' ? HAL_SERTIFIKASI : HAL_WASAR).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Link Dokumen PDF (Google Drive / URL)
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/.../view"
                  value={linkDokumen}
                  onChange={(e) => setLinkDokumen(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* SECTION 3: PENUGASAN DISPOSISI (ADMIN ONLY) */}
          {isAdmin && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  3. Instruksi & Penugasan Disposisi (Admin Koordinator)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Petugas PBT Ditugaskan <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={petugas}
                    onChange={(e) => setPetugas(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
                  >
                    {PETUGAS_PBT_LIST.map((pbt) => (
                      <option key={pbt} value={pbt}>
                        {pbt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Disposisi Admin
                  </label>
                  <input
                    type="date"
                    value={tanggalDisposisi}
                    onChange={(e) => setTanggalDisposisi(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* CHECKBOX CATATAN */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Instruksi / Catatan Disposisi (Centang Opsi):
                </label>
                <div className="space-y-2 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
                  {CATATAN_DEFAULT_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={catatanSelected.includes(opt)}
                        onChange={() => handleCatatanToggle(opt)}
                        className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}

                  {/* MANUAL TEXT IF LAIN-LAIN CHECKED */}
                  {catatanSelected.includes('Lain-lain') && (
                    <div className="mt-2 pt-2 border-t border-slate-700/50">
                      <label className="block text-[11px] font-semibold text-amber-300 mb-1">
                        Tuliskan Catatan Manual Tambahan:
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Instruksi tambahan khusus..."
                        value={catatanLain}
                        onChange={(e) => setCatatanLain(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FOOTER BUTTONS */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data Disposisi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
