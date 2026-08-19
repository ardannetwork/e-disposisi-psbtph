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
import { X, Save, FileText, CheckSquare, Calendar, User, Link as LinkIcon, Upload, Camera } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import imageCompression from 'browser-image-compression';
import { getDocument } from 'pdfjs-dist';
import jsPDF from 'jspdf';

interface SuratFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: DisposisiSurat | null;
  mode?: 'create' | 'edit' | 'disposisi';
  onSuccess?: () => void;
}

export const SuratFormModal: React.FC<SuratFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create',
  onSuccess,
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
  const [pic, setPic] = useState<string>(PETUGAS_PBT_LIST[0]);
  const [petugas, setPetugas] = useState<string>(PETUGAS_PBT_LIST[0]);
  const [kabupaten, setKabupaten] = useState<string>('');
  const [catatanSelected, setCatatanSelected] = useState<string[]>([
    'TL sesuai peraturan yang berlaku',
  ]);
  const [catatanLain, setCatatanLain] = useState('');
  const [linkDokumen, setLinkDokumen] = useState('');
  const [tanggalDisposisi, setTanggalDisposisi] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [docInputMode, setDocInputMode] = useState<'url' | 'file' | 'camera'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [isFileTooLarge, setIsFileTooLarge] = useState(false);
  const [compressProgress, setCompressProgress] = useState(0);
  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  useEffect(() => {
    if (isCompressing) {
      setCompressProgress(0);
      const interval = setInterval(() => {
        setCompressProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    } else if (compressProgress > 0 && compressProgress < 100) {
      setCompressProgress(100);
      setTimeout(() => setCompressProgress(0), 500);
    }
  }, [isCompressing]);

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
      setPic(initialData.pic || PETUGAS_PBT_LIST[0]);
      setKabupaten(initialData.kabupaten || '');
      setCatatanSelected(initialData.catatan || []);
      setCatatanLain(initialData.catatan_lain || '');
      setLinkDokumen(initialData.link_dokumen || '');
      setTanggalDisposisi(
        initialData.tanggal_disposisi || new Date().toISOString().split('T')[0]
      );
      setDocInputMode(initialData.link_dokumen ? 'file' : 'url');
      setSelectedFile(null);
      setFilePreview(initialData.link_dokumen || '');
      setOriginalSize(0);
      setCompressedSize(0);
      setIsFileTooLarge(false);
      setCompressProgress(0);
    } else {
      setNomorAgenda('');
      setSuratDari('');
      setNomorSurat('');
      setTanggalSurat(new Date().toISOString().split('T')[0]);
      setDiterimaTanggal(new Date().toISOString().split('T')[0]);
      setSifat('Penting');
      setHalType('Sertifikasi');
      setHal(HAL_SERTIFIKASI[0]);
      setPetugas(PETUGAS_PBT_LIST[0]);
      setPic(PETUGAS_PBT_LIST[0]);
      setKabupaten('');
      setCatatanSelected(['TL sesuai peraturan yang berlaku']);
      setCatatanLain('');
      setLinkDokumen('');
      setTanggalDisposisi(new Date().toISOString().split('T')[0]);
      setDocInputMode('url');
      setSelectedFile(null);
      setFilePreview('');
      setOriginalSize(0);
      setCompressedSize(0);
      setIsFileTooLarge(false);
      setCompressProgress(0);
    }
  }, [initialData, isOpen]);

  // Handle Category type change
  const handleHalTypeChange = (type: HalType) => {
    setHalType(type);
    setHal(type === 'Sertifikasi' ? HAL_SERTIFIKASI[0] : HAL_WASAR[0]);
  };

  const compressPdf = async (file: File): Promise<{ base64: string; size: number }> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      const pageCount = pdf.numPages;

      const pdfOutput = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas context unavailable');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        const imgData = canvas.toDataURL('image/jpeg', 0.7);
        const pdfWidth = 210;
        const pdfHeight = pdfWidth * (viewport.height / viewport.width);

        if (i > 1) {
          pdfOutput.addPage();
        }

        pdfOutput.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        canvas.remove();
      }

      const pdfBytes = pdfOutput.output('arraybuffer');
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      return { base64, size: blob.size };
    } catch (error) {
      console.error('PDF re-render compression failed, falling back to pdf-lib:', error);
      return compressPdfFallback(file);
    }
  };

  const compressPdfFallback = async (file: File): Promise<{ base64: string; size: number }> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const compressedPdfBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });
    const uint8 = new Uint8Array(compressedPdfBytes.length);
    uint8.set(compressedPdfBytes);
    const blob = new Blob([uint8], { type: 'application/pdf' });
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return { base64, size: blob.size };
  };

  const compressImage = async (file: File): Promise<{ base64: string; size: number }> => {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    });
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(compressedFile);
    });
    return { base64, size: compressedFile.size };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Format file tidak didukung. Gunakan PDF, JPG, atau PNG.');
      return;
    }

    setIsCompressing(true);
    setOriginalSize(file.size);

    try {
      let result: { base64: string; size: number };

      if (file.type === 'application/pdf') {
        result = await compressPdf(file);
      } else {
        result = await compressImage(file);
      }

      setCompressedSize(result.size);
      setLinkDokumen(result.base64);
      setFilePreview(result.base64);
      setIsFileTooLarge(result.size > MAX_FILE_SIZE);

      const response = await fetch(result.base64);
      const blob = await response.blob();
      setSelectedFile(new File([blob], file.name, { type: file.type }));
    } catch (error) {
      console.error('Compression error:', error);
      alert('Gagal memproses file. Coba file lain.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleCameraChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setOriginalSize(file.size);

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(compressedFile);
      });

      setCompressedSize(compressedFile.size);
      setLinkDokumen(base64);
      setFilePreview(base64);
      setIsFileTooLarge(compressedFile.size > MAX_FILE_SIZE);

      const response = await fetch(base64);
      const blob = await response.blob();
      setSelectedFile(new File([blob], file.name, { type: file.type }));
    } catch (error) {
      console.error('Camera capture error:', error);
      alert('Gagal memproses foto. Coba lagi.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDocModeToggle = (mode: 'url' | 'file' | 'camera') => {
    setDocInputMode(mode);
    if (mode === 'url') {
      setSelectedFile(null);
      setFilePreview('');
      setIsFileTooLarge(false);
    } else if (mode === 'file') {
      setLinkDokumen('');
      setIsFileTooLarge(false);
    } else {
      setLinkDokumen('');
      setSelectedFile(null);
      setFilePreview('');
      setIsFileTooLarge(false);
    }
  };

  // Checkbox toggle handler
  const handleCatatanToggle = (option: string) => {
    if (catatanSelected.includes(option)) {
      setCatatanSelected(catatanSelected.filter((c) => c !== option));
    } else {
      setCatatanSelected([...catatanSelected, option]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!suratDari || !nomorSurat || !tanggalSurat || !nomorAgenda) {
      alert('Mohon lengkapi field mandatory (Surat Dari, Nomor Surat, Tanggal Surat, Nomor Agenda)');
      return;
    }

    if (isFileTooLarge) {
      alert('File yang diupload melebihi batas maksimal 2MB. Silakan pilih file yang lebih kecil atau gunakan link URL.');
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
      pic: isAdmin || mode === 'disposisi' ? pic : initialData?.pic || '',
      kabupaten: kabupaten,
      catatan: catatanSelected,
      catatan_lain: catatanSelected.includes('Lain-lain') ? catatanLain : '',
      link_dokumen: linkDokumen,
      status: initialData ? initialData.status : false,
      tanggal_disposisi: isAdmin || mode === 'disposisi' ? tanggalDisposisi : initialData?.tanggal_disposisi || '',
      disposisi_oleh: isAdmin || mode === 'disposisi' ? currentUser?.name || 'Avianita Agustina, S.TP.' : initialData?.disposisi_oleh || 'Avianita Agustina, S.TP.',
    };

    try {
      if (initialData) {
        await updateDisposisi(initialData.id, payload);
      } else {
        await addDisposisi(payload);
      }

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err) {
      console.error('Failed to save disposisi', err);
      alert('Gagal menyimpan data ke Firestore. Periksa koneksi dan izin akses, lalu coba lagi.');
    }
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
                  Kabupaten <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Malang"
                  value={kabupaten}
                  onChange={(e) => setKabupaten(e.target.value)}
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
              
              {/* MODE TOGGLE */}
              <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700 mb-3">
                <button
                  type="button"
                  onClick={() => handleDocModeToggle('url')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    docInputMode === 'url'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5 inline mr-1" />
                  Link URL
                </button>
                <button
                  type="button"
                  onClick={() => handleDocModeToggle('file')}
                  disabled={isFileTooLarge}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    isFileTooLarge
                      ? 'bg-rose-600 text-white cursor-not-allowed'
                      : docInputMode === 'file'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 inline mr-1" />
                  {isFileTooLarge ? 'File Terlalu Besar' : 'Upload File'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDocModeToggle('camera')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    docInputMode === 'camera'
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 inline mr-1" />
                  Kamera
                </button>
              </div>

              {/* URL MODE */}
              {docInputMode === 'url' && (
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
              )}

              {/* FILE MODE */}
              {docInputMode === 'file' && (
                <div>
                  <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors relative overflow-hidden ${
                    isFileTooLarge ? 'border-rose-500 bg-rose-500/10' : 'border-slate-700 hover:border-slate-500'
                  }`}>
                     {isCompressing ? (
                       <div className="flex flex-col items-center justify-center w-full p-4">
                         <div className="w-full max-w-xs space-y-3">
                           <div className="flex items-center justify-center gap-3 mb-2">
                             <div className="relative">
                               <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-700 border-t-emerald-500"></div>
                               <div className="absolute inset-0 flex items-center justify-center">
                                 <span className="text-[10px] font-bold text-emerald-400">
                                   {Math.min(Math.round(compressProgress), 100)}%
                                 </span>
                               </div>
                             </div>
                             <div className="text-left">
                               <p className="text-xs font-semibold text-slate-200">
                                 {selectedFile?.type === 'application/pdf' ? 'Mengompresi PDF...' : 'Mengompresi Gambar...'}
                               </p>
                               <p className="text-[10px] text-slate-400">
                                 {compressProgress < 30 ? 'Membaca file...' : compressProgress < 70 ? 'Memproses kompresi...' : 'Menyelesaikan...'}
                               </p>
                             </div>
                           </div>
                           
                           <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                             <div
                               className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 h-2.5 rounded-full transition-all duration-300 ease-out relative"
                               style={{ width: `${Math.min(compressProgress, 100)}%` }}
                             >
                               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                             </div>
                           </div>
                           
                           <p className="text-[10px] text-slate-500 text-center">
                             {(originalSize / 1024 / 1024).toFixed(2)} MB → Memproses...
                           </p>
                         </div>
                       </div>
                     ) : filePreview ? (
                      <div className="flex items-center gap-3 p-2 w-full">
                        {filePreview.startsWith('data:image') ? (
                          <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-700" />
                        ) : (
                          <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-slate-300" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-200 truncate">
                            {selectedFile?.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {compressedSize > 0 && originalSize > 0
                              ? `${(compressedSize / 1024).toFixed(0)} KB (dari ${(originalSize / 1024).toFixed(0)} KB)`
                              : `${(selectedFile?.size || 0) / 1024 > 1024 
                                  ? `${((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB`
                                  : `${((selectedFile?.size || 0) / 1024).toFixed(0)} KB`
                                }`
                            }
                            {compressedSize > 0 && originalSize > 0 && compressedSize < originalSize && (
                              <span className="text-emerald-400 ml-1">
                                (-{((1 - compressedSize / originalSize) * 100).toFixed(0)}%)
                              </span>
                            )}
                            {isFileTooLarge && (
                              <span className="text-rose-400 ml-1 font-semibold">
                                (Melebihi batas {MAX_FILE_SIZE / 1024 / 1024}MB)
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedFile(null);
                            setFilePreview('');
                            setLinkDokumen('');
                            setOriginalSize(0);
                            setCompressedSize(0);
                            setIsFileTooLarge(false);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-slate-500 mb-2" />
                        <p className="text-xs text-slate-400 font-medium">
                          Klik untuk upload PDF atau Gambar
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          PDF, JPG, PNG (Akan dikompres otomatis)
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".pdf,image/jpeg,image/png,image/jpg"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isCompressing}
                    />
                  </label>
                </div>
              )}

              {/* CAMERA MODE */}
              {docInputMode === 'camera' && (
                <div>
                  <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors relative overflow-hidden ${
                    isFileTooLarge ? 'border-rose-500 bg-rose-500/10' : 'border-slate-700 hover:border-sky-500'
                  }`}>
                     {isCompressing ? (
                       <div className="flex flex-col items-center justify-center w-full p-4">
                         <div className="w-full max-w-xs space-y-3">
                           <div className="flex items-center justify-center gap-3 mb-2">
                             <div className="relative">
                               <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-700 border-t-sky-500"></div>
                               <div className="absolute inset-0 flex items-center justify-center">
                                 <span className="text-[10px] font-bold text-sky-400">
                                   {Math.min(Math.round(compressProgress), 100)}%
                                 </span>
                               </div>
                             </div>
                             <div className="text-left">
                               <p className="text-xs font-semibold text-slate-200">
                                 Mengompresi Gambar...
                               </p>
                               <p className="text-[10px] text-slate-400">
                                 {compressProgress < 30 ? 'Membaca foto...' : compressProgress < 70 ? 'Memproses kompresi...' : 'Menyelesaikan...'}
                               </p>
                             </div>
                           </div>
                           
                           <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                             <div
                               className="bg-gradient-to-r from-sky-600 via-sky-500 to-sky-400 h-2.5 rounded-full transition-all duration-300 ease-out relative"
                               style={{ width: `${Math.min(compressProgress, 100)}%` }}
                             >
                               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                             </div>
                           </div>
                           
                           <p className="text-[10px] text-slate-500 text-center">
                             {(originalSize / 1024 / 1024).toFixed(2)} MB → Memproses...
                           </p>
                         </div>
                       </div>
                     ) : filePreview ? (
                      <div className="flex items-center gap-3 p-2 w-full">
                        {filePreview.startsWith('data:image') ? (
                          <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-700" />
                        ) : (
                          <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-slate-300" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-200 truncate">
                            {selectedFile?.name || 'Foto dari Kamera'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {compressedSize > 0 && originalSize > 0
                              ? `${(compressedSize / 1024).toFixed(0)} KB (dari ${(originalSize / 1024).toFixed(0)} KB)`
                              : `${(selectedFile?.size || 0) / 1024 > 1024 
                                  ? `${((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB`
                                  : `${((selectedFile?.size || 0) / 1024).toFixed(0)} KB`
                                }`
                            }
                            {compressedSize > 0 && originalSize > 0 && compressedSize < originalSize && (
                              <span className="text-emerald-400 ml-1">
                                (-{((1 - compressedSize / originalSize) * 100).toFixed(0)}%)
                              </span>
                            )}
                            {isFileTooLarge && (
                              <span className="text-rose-400 ml-1 font-semibold">
                                (Melebihi batas {MAX_FILE_SIZE / 1024 / 1024}MB)
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedFile(null);
                            setFilePreview('');
                            setLinkDokumen('');
                            setOriginalSize(0);
                            setCompressedSize(0);
                            setIsFileTooLarge(false);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Camera className="w-8 h-8 text-slate-500 mb-2" />
                        <p className="text-xs text-slate-400 font-medium">
                          Klik untuk mengambil foto dengan kamera
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          JPG, PNG (Maks 2MB, akan dikompres otomatis)
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      capture="environment"
                      onChange={handleCameraChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isCompressing}
                    />
                  </label>
                </div>
              )}
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
                    PIC <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={pic}
                    onChange={(e) => setPic(e.target.value)}
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
