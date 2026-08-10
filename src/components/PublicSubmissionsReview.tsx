import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PublicSuratSubmission } from '../types/disposisi';
import { CheckCircle2, XCircle, FileText, ExternalLink, Clock, Filter } from 'lucide-react';
import { firebaseDb } from '../services/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

type ReviewStatus = 'all' | 'pending' | 'processed' | 'rejected';

export const PublicSubmissionsReview: React.FC = () => {
  const { publicSubmissionsList, updatePublicSubmissionStatus, currentUser } = useAuth();
  const [filter, setFilter] = useState<ReviewStatus>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [firestoreItems, setFirestoreItems] = useState<PublicSuratSubmission[]>([]);
  const [listenerError, setListenerError] = useState<string | null>(null);

  const isOperator = currentUser?.role === 'operator';
  const isAdmin = currentUser?.role === 'admin';
  const canReview = isOperator || isAdmin;

  useEffect(() => {
    if (!firebaseDb || !currentUser) return;

    setListenerError(null);
    const q = query(collection(firebaseDb, 'public_submissions'), orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: PublicSuratSubmission[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as PublicSuratSubmission);
        });
        setFirestoreItems(items);
      },
      (err) => {
        console.warn('PublicSubmissionsReview direct listener error:', err);
        setListenerError(err instanceof Error ? err.message : 'Gagal memuat data dari Firestore');
      }
    );

    return () => unsubscribe();
  }, [firebaseDb, currentUser]);

  const merged = firestoreItems.length > 0 ? firestoreItems : publicSubmissionsList;

  const filtered = filter === 'all'
    ? merged
    : merged.filter((s) => s.status === filter);

  const sorted = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleStatusChange = async (id: string, status: 'processed' | 'rejected') => {
    setProcessingId(id);
    try {
      await updatePublicSubmissionStatus(id, status);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'processed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3" />
            Processed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-bold">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!canReview) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <XCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Akses Ditolak</h2>
            <p className="text-xs text-slate-400 mt-2">
              Halaman ini hanya dapat diakses oleh Operator dan Admin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Permohonan Surat Publik
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Tinjau dan kelola permohonan surat dari publik
            </p>
          </div>

          {/* FILTER */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-2" />
            {(['all', 'pending', 'processed', 'rejected'] as ReviewStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  filter === status
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {status === 'all' ? 'Semua' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* DEBUG INFO */}
        {listenerError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <strong>Debug:</strong> {listenerError}
          </div>
        )}
        <div className="text-[10px] text-slate-500">
          Context: {publicSubmissionsList.length} | Firestore direct: {firestoreItems.length} | Merged: {merged.length}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold text-white">
              {merged.length}
            </div>
            <div className="text-[11px] text-slate-400 font-semibold mt-1">Total</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold text-amber-400">
              {merged.filter((s) => s.status === 'pending').length}
            </div>
            <div className="text-[11px] text-slate-400 font-semibold mt-1">Pending</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold text-emerald-400">
              {merged.filter((s) => s.status === 'processed').length}
            </div>
            <div className="text-[11px] text-slate-400 font-semibold mt-1">Processed</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold text-rose-400">
              {merged.filter((s) => s.status === 'rejected').length}
            </div>
            <div className="text-[11px] text-slate-400 font-semibold mt-1">Rejected</div>
          </div>
        </div>

        {/* SUBMISSIONS LIST */}
        {sorted.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-semibold">Tidak ada permohonan surat publik</p>
            <p className="text-xs text-slate-500 mt-1">
              {filter === 'all'
                ? 'Belum ada permohonan dari publik.'
                : `Tidak ada permohonan dengan status "${filter}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((submission) => (
              <div
                key={submission.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-white truncate">
                        {submission.surat_dari}
                      </h3>
                      {getStatusBadge(submission.status)}
                    </div>

                    <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
                      <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 font-semibold">
                        {submission.hal_type}
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 font-semibold">
                        {submission.hal}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-400">Dibuat:</span> {formatDate(submission.created_at)}
                      {submission.updated_at !== submission.created_at && (
                        <span className="ml-3">
                          <span className="font-semibold text-slate-400">Diperbarui:</span> {formatDate(submission.updated_at)}
                        </span>
                      )}
                    </div>

                    {submission.link_dokumen && (
                      <a
                        href={submission.link_dokumen}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Lihat Dokumen
                      </a>
                    )}
                  </div>

                  {submission.status === 'pending' && canReview && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleStatusChange(submission.id, 'processed')}
                        disabled={processingId === submission.id}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {processingId === submission.id ? 'Menyimpan...' : 'Processed'}
                      </button>
                      <button
                        onClick={() => handleStatusChange(submission.id, 'rejected')}
                        disabled={processingId === submission.id}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejected
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
