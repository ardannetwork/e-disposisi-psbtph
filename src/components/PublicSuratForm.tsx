import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import imageCompression from 'browser-image-compression';
import { X, Save, FileText, Link as LinkIcon, Upload } from 'lucide-react';
import { HAL_SERTIFIKASI, HAL_WASAR, HalType } from '../types/disposisi';
import { addPublicSubmission } from '../services/db';

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MIN_FORM_TIME_MS = 3000;
const RATE_LIMIT_KEY = 'public_form_last_submit';
const RATE_LIMIT_MS = 5 * 60 * 1000;

const generateCaptcha = () => {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { question: `${a} + ${b} = ?`, answer: a + b };
};

export const PublicSuratForm: React.FC = () => {
  const [suratDari, setSuratDari] = useState('');
  const [halType, setHalType] = useState<HalType>('Sertifikasi');
  const [hal, setHal] = useState<string>(HAL_SERTIFIKASI[0]);
  const [linkDokumen, setLinkDokumen] = useState('');
  const [docInputMode, setDocInputMode] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [isFileTooLarge, setIsFileTooLarge] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [formStartTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(Math.ceil(MIN_FORM_TIME_MS / 1000));
  const [isHoneypotFilled, setIsHoneypotFilled] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - formStartTime;
      const remaining = Math.max(0, Math.ceil((MIN_FORM_TIME_MS - elapsed) / 1000));
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [formStartTime]);

  const canSubmit = () => {
    const now = Date.now();
    const lastSubmit = localStorage.getItem(RATE_LIMIT_KEY);
    if (lastSubmit && now - parseInt(lastSubmit) < RATE_LIMIT_MS) {
      return false;
    }
    return timeLeft <= 0 && !isSubmitting && !isCompressing;
  };

  const compressPdf = async (file: File): Promise<{ base64: string; size: number }> => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isHoneypotFilled) {
      return;
    }

    if (!suratDari || !hal) {
      alert('Mohon lengkapi field yang wajib diisi.');
      return;
    }

    if (parseInt(captchaAnswer) !== captcha.answer) {
      alert('Jawaban captcha salah. Silakan coba lagi.');
      setCaptcha(generateCaptcha());
      setCaptchaAnswer('');
      return;
    }

    if (isFileTooLarge) {
      alert('File yang diupload melebihi batas maksimal 2MB. Silakan pilih file yang lebih kecil atau gunakan link URL.');
      return;
    }

    if (!canSubmit()) {
      alert('Form sedang dalam proses validasi keamanan. Silakan tunggu sebentar.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await addPublicSubmission({
        surat_dari: suratDari,
        hal_type: halType,
        hal: hal,
        link_dokumen: linkDokumen,
        status: 'pending',
      });

      localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError('Gagal mengirim permohonan. Silakan coba lagi atau hubungi admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuratDari('');
    setHalType('Sertifikasi');
    setHal(HAL_SERTIFIKASI[0]);
    setLinkDokumen('');
    setDocInputMode('url');
    setSelectedFile(null);
    setFilePreview('');
    setOriginalSize(0);
    setCompressedSize(0);
    setIsFileTooLarge(false);
    setCaptcha(generateCaptcha());
    setCaptchaAnswer('');
    setSubmitSuccess(false);
    setSubmitError('');
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Permohonan Berhasil Dikirim</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Terima kasih, permohonan Anda telah berhasil dikirim dan sedang menunggu persetujuan Admin UPT PSBTPH IV Jatim.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <span>Kirim Permohonan Lagi</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="bg-slate-800/80 border-b border-slate-700 p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Form Permohonan Surat Publik</h3>
            <p className="text-xs text-slate-400">UPT PSBTPH IV Jatim - Wilayah Kerja Malang</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {submitError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {submitError}
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              Informasi Permohonan
            </h4>

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
                Kategori Perihal <span className="text-rose-400">*</span>
              </label>
              <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700 mb-3">
                <button
                  type="button"
                  onClick={() => { setHalType('Sertifikasi'); setHal(HAL_SERTIFIKASI[0]); }}
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
                  onClick={() => { setHalType('Wasar'); setHal(HAL_WASAR[0]); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    halType === 'Wasar'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  B. Wasar (Pengawasan Pemasaran)
                </button>
              </div>
              <select
                value={hal}
                onChange={(e) => setHal(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {(halType === 'Sertifikasi' ? HAL_SERTIFIKASI : HAL_WASAR).map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Link Dokumen PDF (Google Drive / URL)
              </label>
              <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700 mb-3">
                <button
                  type="button"
                  onClick={() => setDocInputMode('url')}
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
                  onClick={() => setDocInputMode('file')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    docInputMode === 'file'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 inline mr-1" />
                  Upload File
                </button>
              </div>

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

              {docInputMode === 'file' && (
                <div>
                  <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors relative overflow-hidden ${
                    isFileTooLarge ? 'border-rose-500 bg-rose-500/10' : 'border-slate-700 hover:border-slate-500'
                  }`}>
                    {isCompressing ? (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-2"></div>
                        <p className="text-xs text-slate-400 font-medium">Mengompresi file...</p>
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
                          <p className="text-xs font-semibold text-slate-200 truncate">{selectedFile?.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {compressedSize > 0 && originalSize > 0
                              ? `${(compressedSize / 1024).toFixed(0)} KB (dari ${(originalSize / 1024).toFixed(0)} KB)`
                              : `${(selectedFile?.size || 0) / 1024 > 1024
                                  ? `${((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB`
                                  : `${((selectedFile?.size || 0) / 1024).toFixed(0)} KB`
                                }`
                            }
                            {isFileTooLarge && (
                              <span className="text-rose-400 ml-1 font-semibold">(Melebihi batas 2MB)</span>
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
                        <p className="text-xs text-slate-400 font-medium">Klik untuk upload PDF atau Gambar</p>
                        <p className="text-[10px] text-slate-500 mt-1">PDF, JPG, PNG (Maks 2MB, akan dikompres otomatis)</p>
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
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              Verifikasi Keamanan
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Berapakah {captcha.question.replace('= ?', '')}? <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                inputMode="numeric"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                placeholder="Jawaban"
              />
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <div className={`w-2 h-2 rounded-full ${timeLeft <= 0 ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></div>
              <span>
                {timeLeft > 0
                  ? `Form dapat dikirim dalam ${timeLeft} detik...`
                  : 'Form siap dikirim'}
              </span>
            </div>
          </div>

          <div className="hidden">
            <label>Jangan isi kolom ini</label>
            <input
              ref={honeypotRef}
              type="text"
              value={isHoneypotFilled ? 'bot-value' : ''}
              onChange={(e) => setIsHoneypotFilled(e.target.value.length > 0)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit()}
            className={`w-full py-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              canSubmit()
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Mengirim...' : 'Kirim Permohonan'}</span>
          </button>

          <p className="text-[10px] text-slate-500 text-center">
            Dengan mengirim form ini, Anda menyetujui bahwa data yang diberikan adalah benar dan dapat diaudit oleh Admin UPT PSBTPH IV Jatim.
          </p>
        </form>
      </div>
    </div>
  );
};
