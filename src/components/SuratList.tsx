import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DisposisiSurat, PETUGAS_PBT_LIST } from '../types/disposisi';
import {
  exportDisposisiToDocx,
  exportDisposisiToPdf,
} from '../services/docxtemplater';
import {
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle,
  Clock,
  UserCheck,
  FileCheck,
  Eye,
} from 'lucide-react';

interface SuratListProps {
  onOpenEditModal: (disposisi: DisposisiSurat) => void;
  onOpenDisposisiModal: (disposisi: DisposisiSurat) => void;
}

export const SuratList: React.FC<SuratListProps> = ({
  onOpenEditModal,
  onOpenDisposisiModal,
}) => {
  const { currentUser, disposisiList, togglePbtStatus, deleteDisposisi } = useAuth();

  const isPbt = currentUser?.role === 'pbt';
  const isOperator = currentUser?.role === 'operator';
  const isAdmin = currentUser?.role === 'admin';

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHalType, setFilterHalType] = useState<'all' | 'Sertifikasi' | 'Wasar'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'selesai' | 'belum'>('all');
  const [filterPbt, setFilterPbt] = useState<string>('all');

  // Preview Modal state
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<DisposisiSurat | null>(null);

  // Filtered List
  const filteredDisposisi = disposisiList.filter((item) => {
    // Role filter for PBT
    if (isPbt && currentUser?.pbt_name && item.petugas !== currentUser.pbt_name) {
      return false;
    }

    // Search query
    const matchSearch =
      item.surat_dari.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nomor_surat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nomor_agenda.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.petugas.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    // Filter Hal Type
    if (filterHalType !== 'all' && item.hal_type !== filterHalType) return false;

    // Filter Status
    if (filterStatus === 'selesai' && !item.status) return false;
    if (filterStatus === 'belum' && item.status) return false;

    // Filter PBT
    if (filterPbt !== 'all' && item.petugas !== filterPbt) return false;

    return true;
  });

  const handleDelete = (id: string, noAgenda: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data agenda ${noAgenda}?`)) {
      deleteDisposisi(id);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* HEADER CONTROLS & FILTER BAR */}
      <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              <span>{isPbt ? 'Daftar Surat Tugas PBT' : 'Rekapitulasi E-Disposisi Surat'}</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {filteredDisposisi.length} Total Data
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {isPbt
                ? `Ditugaskan khusus kepada: ${currentUser?.pbt_name}`
                : 'Kelola data surat masuk permohonan sertifikasi & wasar benih'}
            </p>
          </div>
        </div>

        {/* FILTER & SEARCH CONTROLS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* SEARCH INPUT */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari no. agenda, surat, asal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* FILTER HAL TYPE */}
          <div>
            <select
              value={filterHalType}
              onChange={(e) => setFilterHalType(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Semua Kategori (Sertifikasi & Wasar)</option>
              <option value="Sertifikasi">A. Sertifikasi Benih</option>
              <option value="Wasar">B. Wasar (Pengawasan Pemasaran)</option>
            </select>
          </div>

          {/* FILTER STATUS */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Semua Status Penyelesaian</option>
              <option value="belum">Belum Selesai (Pending PBT)</option>
              <option value="selesai">Selesai (Sudah Dicentang)</option>
            </select>
          </div>

          {/* FILTER PBT */}
          {!isPbt && (
            <div>
              <select
                value={filterPbt}
                onChange={(e) => setFilterPbt(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Semua Petugas PBT</option>
                {PETUGAS_PBT_LIST.map((pbt) => (
                  <option key={pbt} value={pbt}>
                    {pbt}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* TABLE DATA CONTAINER */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center">Status PBT</th>
                <th className="py-3.5 px-4">Agenda & Sifat</th>
                <th className="py-3.5 px-4">Surat Dari / No. Surat</th>
                <th className="py-3.5 px-4">Tanggal Surat</th>
                <th className="py-3.5 px-4">Perihal (Hal)</th>
                <th className="py-3.5 px-4">Petugas PBT</th>
                <th className="py-3.5 px-4">Instruksi Disposisi</th>
                <th className="py-3.5 px-4 text-center">Dokumen PDF</th>
                <th className="py-3.5 px-4 text-center">Aksi / Mail Merge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs text-slate-200">
              {filteredDisposisi.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    Tidak ada data disposisi surat yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredDisposisi.map((item) => {
                  const isAssignedToCurrentPbt = isPbt && item.petugas === currentUser?.pbt_name;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* STATUS CHECKBOX (INTERACTIVE FOR PBT OR ADMIN) */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            disabled={isPbt && !isAssignedToCurrentPbt}
                            onClick={() => togglePbtStatus(item.id, !item.status)}
                            className={`p-1.5 rounded-xl border transition-all ${
                              item.status
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                            } ${isPbt && !isAssignedToCurrentPbt ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            title={
                              item.status
                                ? 'Status Selesai (Klik untuk ubah)'
                                : 'Belum Selesai (Klik jika sudah dilaksanakan PBT)'
                            }
                          >
                            {item.status ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <Clock className="w-5 h-5" />
                            )}
                          </button>
                          <span
                            className={`text-[10px] font-bold uppercase ${
                              item.status ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {item.status ? 'Selesai' : 'Belum'}
                          </span>
                        </div>
                      </td>

                      {/* AGENDA & SIFAT */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-emerald-400 text-xs">
                          {item.nomor_agenda}
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                              item.sifat === 'Rahasia'
                                ? 'bg-purple-500/20 text-purple-300'
                                : item.sifat === 'Segera'
                                ? 'bg-rose-500/20 text-rose-300'
                                : item.sifat === 'Penting'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {item.sifat}
                          </span>
                        </div>
                      </td>

                      {/* SURAT DARI & NO. SURAT */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="font-semibold text-slate-100 truncate" title={item.surat_dari}>
                          {item.surat_dari}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate" title={item.nomor_surat}>
                          No: {item.nomor_surat}
                        </div>
                      </td>

                      {/* TANGGAL SURAT */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                        <div>Surat: {item.tanggal_surat}</div>
                        <div className="text-[11px] text-slate-400">Diterima: {item.diterima_tanggal}</div>
                      </td>

                      {/* HAL / PERIHAL */}
                      <td className="py-3.5 px-4 max-w-[180px]">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mb-1 ${
                            item.hal_type === 'Sertifikasi'
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {item.hal_type}
                        </span>
                        <div className="font-medium text-slate-200 line-clamp-2" title={item.hal}>
                          {item.hal}
                        </div>
                      </td>

                      {/* PETUGAS PBT */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.petugas ? (
                          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700 text-amber-300 font-semibold text-xs">
                            <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate max-w-[140px]">{item.petugas}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] italic text-rose-400">Belum Ditentukan</span>
                        )}
                      </td>

                      {/* INSTRUKSI / CATATAN */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        {item.catatan && item.catatan.length > 0 ? (
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                            {item.catatan.map((c, idx) => (
                              <li key={idx} className="truncate" title={c === 'Lain-lain' ? item.catatan_lain : c}>
                                {c === 'Lain-lain' && item.catatan_lain
                                  ? `Lain-lain: ${item.catatan_lain}`
                                  : c}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">-</span>
                        )}
                      </td>

                      {/* DOKUMEN LINK PDF */}
                      <td className="py-3.5 px-4 text-center">
                        {item.link_dokumen ? (
                          <a
                            href={item.link_dokumen}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </a>
                        ) : (
                          <span className="text-slate-600 text-[11px]">-</span>
                        )}
                      </td>

                      {/* AKSI / MAIL MERGE DOCX DOWNLOAD */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* DOCX DOWNLOAD BUTTON */}
                          <button
                            onClick={() => exportDisposisiToDocx(item)}
                            className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                            title="Unduh Lembar Disposisi .docx (Mail Merge)"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>.docx</span>
                          </button>

                          {/* <button
                          onClick={() => exportDisposisiToPdf(item)}
                          className="bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/40 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                          title="Unduh Lembar Disposisi PDF"
>
                          <Download className="w-3.5 h-3.5" />
                          <span>.pdf</span>
                        </button> */}


                          {/* EDIT / DISPOSISI BUTTON (ADMIN / OPERATOR) */}
                          {(isAdmin || isOperator) && (
                            <button
                              onClick={() =>
                                isAdmin ? onOpenDisposisiModal(item) : onOpenEditModal(item)
                              }
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              title={isAdmin ? 'Proses Disposisi Admin' : 'Edit Data Surat'}
                            >
                              <Edit className="w-3.5 h-3.5 text-cyan-400" />
                            </button>
                          )}

                          {/* DELETE BUTTON (ADMIN ONLY) */}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(item.id, item.nomor_agenda)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                              title="Hapus Data Surat"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
