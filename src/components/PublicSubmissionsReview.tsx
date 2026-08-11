import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PublicSuratSubmission } from '../types/disposisi';
import { CheckCircle2, XCircle, FileText, ExternalLink, Clock, Filter, Trash2, AlertTriangle } from 'lucide-react';
import { firebaseDb } from '../services/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

type ReviewStatus = 'all' | 'pending' | 'processed' | 'rejected';

const LOCAL_OVERRIDES_KEY = 'e_disposisi_pub_status_overrides';

const loadPersistedOverrides = (): Record<string, 'processed' | 'rejected'> => {
  try {
    const saved = localStorage.getItem(LOCAL_OVERRIDES_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const savePersistedOverrides = (overrides: Record<string, 'processed' | 'rejected'>) => {
  try {
    localStorage.setItem(LOCAL_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    // ignore
  }
};

export const PublicSubmissionsReview: React.FC = () => {
  const { publicSubmissionsList, updatePublicSubmissionStatus, processPublicSubmission, deletePublicSubmission, currentUser } = useAuth();
  const [filter, setFilter] = useState<ReviewStatus>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [firestoreItems, setFirestoreItems] = useState<PublicSuratSubmission[]>([]);
  const [listenerError, setListenerError] = useState<string | null>(null);

  // Bug Fix 1: Persist localStatusOverrides to localStorage so it survives component remount
  const [localStatusOverrides, setLocalStatusOverrides] = useState<Record<string, 'processed' | 'rejected'>>(
    () => loadPersistedOverrides()
  );

  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});

  // Bug Fix 2: Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<PublicSuratSubmission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOperator = currentUser?.role === 'operator';
  const isAdmin = currentUser?.role === 'admin';
  const canReview = isOperator || isAdmin;

  // Sync localStatusOverrides to localStorage whenever they change
  useEffect(() => {
    savePersistedOverrides(localStatusOverrides);
  }, [localStatusOverrides]);

  // Clean up overrides for items that are deleted from Firestore/context
  useEffect(() => {
    const allIds = new Set([
      ...firestoreItems.map((i) => i.id),
      ...publicSubmissionsList.map((i) => i.id),
    ]);
    setLocalStatusOverrides((prev) => {
      const pruned = { ...prev };
      let changed = false;
      Object.keys(pruned).forEach((id) => {
        if (!allIds.has(id)) {
          delete pruned[id];
          changed = true;
        }
      });
      return changed ? pruned : prev;
    });
  }, [firestoreItems, publicSubmissionsList]);

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
  const mergedWithOverrides: PublicSuratSubmission[] = merged.map((s) => ({
    ...s,
    status: localStatusOverrides[s.id] || s.status,
  }));

  const filtered = filter === 'all'
    ? mergedWithOverrides
    : mergedWithOverrides.filter((s) => s.status === filter);

  const sorted = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Handle Processed button
  const handleProcessed = async (submission: PublicSuratSubmission) => {
    const id = submission.id;
    setProcessingId(id);
    setLocalStatusOverrides((prev) => ({ ...prev, [id]: 'processed' }));
    setActionErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    try {
      await processPublicSubmission(id, submission);
    } catch (err) {
      // Don't revert the status - keep the optimistic update even if Firestore fails
      console.error('Failed to process submission:', err);
      setActionErrors((prev) => ({
        ...prev,
        [id]: err instanceof Error ? err.message : 'Gagal memproses permohonan',
      }));
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Rejected button — shows confirmation modal
  const handleRejectClick = (submission: PublicSuratSubmission) => {
    setDeleteTarget(submission);
  };

  // Confirm rejection + delete
  const handleConfirmReject = async () => {
    if (!deleteTarget) return;
    const { id, link_dokumen } = deleteTarget;
    setIsDeleting(true);
    setLocalStatusOverrides((prev) => ({ ...prev, [id]: 'rejected' }));
    try {
      await deletePublicSubmission(id, link_dokumen);
      // Clean override after successful deletion
      setLocalStatusOverrides((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      console.error('Failed to delete submission:', err);
      setActionErrors((prev) => ({
        ...prev,
        [id]: err instanceof Error ? err.message : 'Gagal menghapus permohonan',
      }));
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleCancelReject = () => {
    setDeleteTarget(null);
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

        {/* LISTENER ERROR */}
        {listenerError && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <strong>Info:</strong> Koneksi Firestore terbatas — menampilkan data lokal. ({listenerError})
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold text-white">
              {mergedWithOverrides.length}
            </div>
            <div className="text-[11px] text-slate-400 font-semibold mt-1">Total</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold text-amber-400">
              {mergedWithOverrides.filter((s) => s.status === 'pending').length}
            </div>
            <div className="text-[11px] text-slate-400 font-semibold mt-1">Pending</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold text-emerald-400">
              {mergedWithOverrides.filter((s) => s.status === 'processed').length}
            </div>
            <div className="text-[11px] text-slate-400 font-semibold mt-1">Processed</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold text-rose-400">
              {mergedWithOverrides.filter((s) => s.status === 'rejected').length}
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
            {sorted.map((submission) => {
              const effectiveStatus = localStatusOverrides[submission.id] || submission.status;
              const isPending = effectiveStatus === 'pending';

              return (
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
                        {getStatusBadge(effectiveStatus)}
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

                      {submission.link_dokumen && !submission.link_dokumen.startsWith('data:') && (
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
                      {submission.link_dokumen && submission.link_dokumen.startsWith('data:') && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                          <FileText className="w-3 h-3" />
                          File terupload (lokal)
                        </span>
                      )}

                      {actionErrors[submission.id] && (
                        <div className="text-[11px] text-rose-400 font-semibold">
                          ⚠ {actionErrors[submission.id]}
                        </div>
                      )}
                    </div>

                    {/* ACTION BUTTONS — hanya tampil jika status pending */}
                    {isPending && canReview && (
                      <div className="flex items-center gap-2 shrink-0">
                        {/* PROCESSED BUTTON */}
                        <button
                          onClick={() => handleProcessed(submission)}
                          disabled={processingId === submission.id}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {processingId === submission.id ? 'Memproses...' : 'Processed'}
                        </button>

                        {/* REJECTED BUTTON — menghapus data setelah konfirmasi */}
                        <button
                          onClick={() => handleRejectClick(submission)}
                          disabled={processingId === submission.id}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                          Rejected
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REJECT CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={handleCancelReject}
          />
          <div className="relative w-full max-w-sm bg-slate-900 border border-rose-500/30 rounded-2xl shadow-2xl shadow-rose-500/10 p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">Tolak Permohonan</h3>
              <p className="text-sm text-slate-400 mb-3">
                Permohonan dari{' '}
                <span className="text-rose-300 font-semibold">{deleteTarget.surat_dari}</span>{' '}
                akan ditolak dan <strong className="text-white">dihapus permanen</strong>.
              </p>
              <div className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 mb-4 text-left space-y-1">
                <p className="text-xs text-slate-300">
                  <span className="font-semibold text-slate-400">Perihal:</span> {deleteTarget.hal}
                </p>
                <p className="text-xs text-slate-300">
                  <span className="font-semibold text-slate-400">Kategori:</span> {deleteTarget.hal_type}
                </p>
                {deleteTarget.link_dokumen && (
                  <p className="text-xs text-amber-300 font-semibold mt-1">
                    ⚠ File dokumen yang terupload juga akan dihapus.
                  </p>
                )}
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleCancelReject}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm font-semibold hover:bg-rose-500/30 transition-all shadow-lg shadow-rose-500/10 disabled:opacity-50"
                >
                  {isDeleting ? 'Menghapus...' : 'Ya, Tolak & Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
