import React from 'react';
import { useAuth } from '../context/AuthContext';
import { HAL_SERTIFIKASI, HAL_WASAR, PETUGAS_PBT_LIST } from '../types/disposisi';
import { FileText, Clock, CheckCircle2, AlertTriangle, Users, Award, TrendingUp, Sparkles } from 'lucide-react';

interface DashboardStatsProps {
  onNavigateToSurat: () => void;
  onNavigateToApproval: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  onNavigateToSurat,
  onNavigateToApproval,
}) => {
  const { currentUser, disposisiList, usersList } = useAuth();

  const isPbt = currentUser?.role === 'pbt';
  const pbtName = currentUser?.pbt_name;

  // Filter list if PBT
  const relevantList = isPbt
    ? disposisiList.filter((d) => d.pic === pbtName)
    : disposisiList;

  const totalSurat = relevantList.length;
  const totalBelum = relevantList.filter((d) => !d.status).length;
  const totalSelesai = relevantList.filter((d) => d.status).length;
  const pendingUsersCount = usersList.filter((u) => !u.approved).length;

  // Sertifikasi vs Wasar breakdown
  const sertifikasiCount = relevantList.filter((d) => d.hal_type === 'Sertifikasi').length;
  const wasarCount = relevantList.filter((d) => d.hal_type === 'Wasar').length;

  // PBT Workload Breakdown
  const pbtWorkload = PETUGAS_PBT_LIST.map((pbt) => {
    const assigned = disposisiList.filter((d) => d.pic === pbt);
    const completed = assigned.filter((d) => d.status).length;
    return {
      name: pbt,
      total: assigned.length,
      completed,
      pending: assigned.length - completed,
    };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-50 via-slate-50 to-teal-50 dark:bg-gradient-to-r dark:from-emerald-900/80 dark:via-slate-900 dark:to-teal-950 p-6 border border-emerald-500/20 dark:border-emerald-500/20 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Sistem E-Disposisi UPT PSBTPH Malang</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white">
              Selamat Datang, {currentUser?.name}!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
              {isPbt
                ? `Menampilkan data disposisi penugasan benih khusus untuk ${pbtName}.`
                : 'Kelola data surat masuk, disposisi instruksi PBT, dan cetak lembar disposisi .docx dengan cepat.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToSurat}
              className="bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg transition-all"
            >
              Lihat Daftar Surat &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: TOTAL SURAT */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Surat Masuk</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalSurat}</span>
            <span className="text-xs text-slate-400">berkas</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {isPbt ? 'Tugas ditujukan kepada Anda' : 'Keseluruhan agenda masuk'}
          </p>
        </div>

        {/* CARD 2: BELUM DISPOSISI / PROSES */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Belum Selesai</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400">{totalBelum}</span>
            <span className="text-xs text-amber-400/80">perlu tindakan</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Pemeriksaan / laporan pending</p>
        </div>

        {/* CARD 3: DISPOSISI SELESAI */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Disposisi Selesai</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">{totalSelesai}</span>
            <span className="text-xs text-emerald-400/80">
              ({totalSurat > 0 ? Math.round((totalSelesai / totalSurat) * 100) : 0}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Sudah dicentang oleh PBT</p>
        </div>

        {/* CARD 4: PENDING USER / TUGAS PBT */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md hover:border-slate-700 transition-all group">
          {currentUser?.role === 'admin' ? (
            <div onClick={onNavigateToApproval} className="cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">User Pending Approval</span>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-rose-400">{pendingUsersCount}</span>
                <span className="text-xs text-slate-400">akun baru</span>
              </div>
              <p className="text-[11px] text-rose-400/90 mt-2 underline">
                Klik untuk persetujuan role &rarr;
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Kategori Permohonan</span>
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-3">
                <div>
                  <span className="text-xl font-bold text-teal-300">{sertifikasiCount}</span>
                  <span className="text-[10px] text-slate-400 block">Sertifikasi</span>
                </div>
                <div className="border-l border-slate-700 pl-3">
                  <span className="text-xl font-bold text-amber-300">{wasarCount}</span>
                  <span className="text-[10px] text-slate-400 block">Wasar</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Distribusi jenis perihal</p>
            </div>
          )}
        </div>
      </div>

      {/* CHARTS & RECAP SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CATEGORY DISTRIBUTION & PROGRESS */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Distribusi Kategori Perihal</span>
            </h3>
            <span className="text-xs text-slate-400">{totalSurat} Total Surat</span>
          </div>

          <div className="space-y-3 pt-2">
            {/* SERTIFIKASI BAR */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">A. Sertifikasi Benih</span>
                <span className="text-teal-400 font-bold">
                  {sertifikasiCount} berkas ({totalSurat > 0 ? Math.round((sertifikasiCount / totalSurat) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalSurat > 0 ? (sertifikasiCount / totalSurat) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* WASAR BAR */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">B. Pengawasan Pemasaran (Wasar)</span>
                <span className="text-amber-400 font-bold">
                  {wasarCount} berkas ({totalSurat > 0 ? Math.round((wasarCount / totalSurat) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-400 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalSurat > 0 ? (wasarCount / totalSurat) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300">Rincian Perihal Paling Sering:</div>
            <div className="flex items-center justify-between text-[11px]">
              <span>Pemeriksaan Fase Vegetatif / Berbunga</span>
              <span className="text-emerald-400 font-mono">Sertifikasi</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span>Penilaian Produsen & Pengedar Baru</span>
              <span className="text-amber-400 font-mono">Wasar</span>
            </div>
          </div>
        </div>

        {/* PBT WORKLOAD DISTRIBUTION */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Beban Penugasan Pengawas Benih Tanaman (PBT)</span>
            </h3>
            <span className="text-xs text-slate-400">9 Petugas Terdaftar</span>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {pbtWorkload.map((pbt) => (
              <div
                key={pbt.name}
                className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between text-xs gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-200 truncate">{pbt.name}</div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-1.5 rounded-full"
                      style={{
                        width: `${pbt.total > 0 ? (pbt.completed / pbt.total) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px]">
                    Total: {pbt.total}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Selesai: {pbt.completed}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                    Pending: {pbt.pending}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
