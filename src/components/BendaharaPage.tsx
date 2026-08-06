import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DisposisiSurat } from '../types/disposisi';
import { Wallet, Save, Search, ArrowUpDown } from 'lucide-react';

const PEMBAYARAN_OPTIONS = ['Belum Dibayar', 'DP 50%', 'Lunas', 'Dicicil', 'Dibatalkan'];

export const BendaharaPage: React.FC = () => {
  const { disposisiList, updateDisposisi } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPembayaran, setEditingPembayaran] = useState('');

  const filteredDisposisi = disposisiList.filter(
    (item) =>
      item.nomor_agenda.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.surat_dari.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.petugas.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (item: DisposisiSurat) => {
    setEditingId(item.id);
    setEditingPembayaran(item.pembayaran || '');
  };

  const handleSave = (id: string) => {
    updateDisposisi(id, { pembayaran: editingPembayaran });
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">Kelola Pembayaran</h2>
            <p className="text-xs text-slate-400">Edit status pembayaran untuk setiap surat disposisi</p>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nomor agenda, surat dari, atau petugas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/60">
                <th className="text-left py-2.5 px-3 text-slate-400 font-semibold uppercase tracking-wider">
                  No. Agenda
                </th>
                <th className="text-left py-2.5 px-3 text-slate-400 font-semibold uppercase tracking-wider">
                  Surat Dari
                </th>
                <th className="text-left py-2.5 px-3 text-slate-400 font-semibold uppercase tracking-wider">
                  Petugas
                </th>
                <th className="text-left py-2.5 px-3 text-slate-400 font-semibold uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-2.5 px-3 text-slate-400 font-semibold uppercase tracking-wider">
                  Pembayaran
                </th>
                <th className="text-right py-2.5 px-3 text-slate-400 font-semibold uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDisposisi.map((item) => (
                <tr key={item.id} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-emerald-400">{item.nomor_agenda}</td>
                  <td className="py-2.5 px-3 text-slate-200 max-w-[200px] truncate">{item.surat_dari}</td>
                  <td className="py-2.5 px-3 text-slate-300 max-w-[180px] truncate">{item.petugas}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      item.status
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {item.status ? 'Selesai' : 'Belum'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {editingId === item.id ? (
                      <select
                        value={editingPembayaran}
                        onChange={(e) => setEditingPembayaran(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">-- Pilih Status --</option>
                        {PEMBAYARAN_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        item.pembayaran === 'Lunas'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : item.pembayaran === 'Belum Dibayar'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : item.pembayaran === 'Dibatalkan'
                          ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {item.pembayaran || '-- Belum Diatur --'}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {editingId === item.id ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleSave(item.id)}
                          className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-colors"
                        >
                          <Save className="w-3 h-3 inline" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] font-bold transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditClick(item)}
                        className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] font-semibold transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredDisposisi.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 px-3 text-center text-slate-500 text-xs">
                    Tidak ada data surat ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};