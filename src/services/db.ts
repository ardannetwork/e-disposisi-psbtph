import { DisposisiSurat, UserAccount, PublicSuratSubmission } from '../types/disposisi';
import { firebaseDb, firebaseStorage } from './firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const SURAT_COLLECTION = 'disposisi_surat';
const USERS_COLLECTION = 'users';
const PUBLIC_SUBMISSIONS_COLLECTION = 'public_submissions';

const SURAT_LOCAL_KEY = 'e_disposisi_surat_data';
const USERS_LOCAL_KEY = 'e_disposisi_users_data';
const PUBLIC_SUBMISSIONS_LOCAL_KEY = 'e_disposisi_public_submissions_data';

// --- Local Storage Helpers ---
export const getLocalDisposisi = (): DisposisiSurat[] => {
  try {
    const saved = localStorage.getItem(SURAT_LOCAL_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Error loading local disposisi data', e);
    return [];
  }
};

export const saveLocalDisposisi = (data: DisposisiSurat[]) => {
  localStorage.setItem(SURAT_LOCAL_KEY, JSON.stringify(data));
};

export const getLocalUsers = (): UserAccount[] => {
  try {
    const saved = localStorage.getItem(USERS_LOCAL_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Error loading local users data', e);
    return [];
  }
};

export const saveLocalUsers = (data: UserAccount[]) => {
  localStorage.setItem(USERS_LOCAL_KEY, JSON.stringify(data));
};

export const getLocalPublicSubmissions = (): PublicSuratSubmission[] => {
  try {
    const saved = localStorage.getItem(PUBLIC_SUBMISSIONS_LOCAL_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Error loading local public submissions data', e);
    return [];
  }
};

export const saveLocalPublicSubmissions = (data: PublicSuratSubmission[]) => {
  localStorage.setItem(PUBLIC_SUBMISSIONS_LOCAL_KEY, JSON.stringify(data));
};

// --- Firestore CRUD Operations ---
export const syncDisposisiToFirestore = async (item: DisposisiSurat) => {
  if (!firebaseDb) return;
  try {
    await setDoc(doc(firebaseDb, SURAT_COLLECTION, item.id), item);
  } catch (err) {
    console.error('Error syncing disposisi to Firestore:', err);
  }
};

export const updateDisposisiInFirestore = async (id: string, data: Partial<DisposisiSurat>) => {
  if (!firebaseDb) return;
  try {
    await setDoc(doc(firebaseDb, SURAT_COLLECTION, id), data, { merge: true });
  } catch (err) {
    console.error('Error updating disposisi in Firestore:', err);
  }
};

export const deleteDisposisiFromFirestore = async (id: string, linkDokumen?: string) => {
  // 1. Coba hapus file dari Firebase Storage jika ada dan berupa URL Storage
  if (linkDokumen && isFirebaseStorageUrl(linkDokumen)) {
    let storageInstance = firebaseStorage;
    if (!storageInstance) {
      try {
        const { getApps } = await import('firebase/app');
        const { getStorage } = await import('firebase/storage');
        const apps = getApps();
        if (apps.length > 0) {
          storageInstance = getStorage(apps[0]);
        }
      } catch {
        // ignore
      }
    }

    if (storageInstance) {
      try {
        console.log('[deleteDisposisiFromFirestore] Attempting to delete Storage file using full URL:', linkDokumen);
        const fileRef = ref(storageInstance, linkDokumen);
        await deleteObject(fileRef);
        console.log('[deleteDisposisiFromFirestore] Storage file deleted successfully.');
      } catch (err) {
        console.error('[deleteDisposisiFromFirestore] Failed to delete file from Firebase Storage:', err);
      }
    } else {
      console.warn('[deleteDisposisiFromFirestore] Firebase Storage instance not available — skipping file deletion.');
    }
  }

  // 2. Hapus data dokumen dari Firestore
  if (!firebaseDb) return;
  try {
    await deleteDoc(doc(firebaseDb, SURAT_COLLECTION, id));
  } catch (err) {
    console.error('Error deleting disposisi from Firestore:', err);
  }
};

export const syncUserToFirestore = async (user: UserAccount) => {
  if (!firebaseDb) return;
  try {
    await setDoc(doc(firebaseDb, USERS_COLLECTION, user.id), user);
  } catch (err) {
    console.error('Error syncing user to Firestore:', err);
  }
};

export const updateUserInFirestore = async (userId: string, data: Partial<UserAccount>) => {
  if (!firebaseDb) return;
  try {
    // Sanitasi data agar tidak ada nilai `undefined` yang menyebabkan error di Firestore SDK
    const cleanData: Record<string, any> = {};
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined) {
        cleanData[key] = val;
      }
    });
    await setDoc(doc(firebaseDb, USERS_COLLECTION, userId), cleanData, { merge: true });
  } catch (err) {
    console.error('Error updating user in Firestore:', err);
  }
};

export const deleteUserFromFirestore = async (userId: string) => {
  if (!firebaseDb) return;
  try {
    await deleteDoc(doc(firebaseDb, USERS_COLLECTION, userId));
  } catch (err) {
    console.error('Error deleting user from Firestore:', err);
  }
};

export const uploadFileToStorage = async (file: File, path: string): Promise<string> => {
  if (!firebaseStorage) throw new Error('Firebase Storage tidak aktif');
  const storageRef = ref(firebaseStorage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const addPublicSubmission = async (submission: Omit<PublicSuratSubmission, 'id' | 'created_at' | 'updated_at'>) => {
  const id = `PUB-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const now = new Date().toISOString();
  const data: PublicSuratSubmission = {
    ...submission,
    id,
    created_at: now,
    updated_at: now,
  };

  if (firebaseDb) {
    try {
      await setDoc(doc(firebaseDb, PUBLIC_SUBMISSIONS_COLLECTION, id), data);
      return id;
    } catch (err) {
      console.error('Error adding public submission to Firestore:', err);
      const local = getLocalPublicSubmissions();
      saveLocalPublicSubmissions([data, ...local]);
      return id;
    }
  }

  const local = getLocalPublicSubmissions();
  saveLocalPublicSubmissions([data, ...local]);
  return id;
};

export const updatePublicSubmissionInFirestore = async (
  id: string,
  data: Partial<PublicSuratSubmission>
) => {
  if (firebaseDb) {
    try {
      // Use setDoc with merge:true so it can handle documents that don't exist yet
      await setDoc(doc(firebaseDb, PUBLIC_SUBMISSIONS_COLLECTION, id), data, { merge: true });
    } catch (err) {
      // Don't throw - just log the error and continue saving to localStorage
      console.error('Error updating public submission in Firestore:', err);
    }
  }

  const local = getLocalPublicSubmissions();
  saveLocalPublicSubmissions(
    local.map((item) => (item.id === id ? { ...item, ...data } : item))
  );
};

/**
 * Detects if a URL is a Firebase Storage URL (contains firebasestorage.googleapis.com)
 */
const isFirebaseStorageUrl = (url: string): boolean => {
  return url.includes('firebasestorage.googleapis.com');
};

/**
 * Deletes a public submission from Firestore, optionally deletes the attached file
 * from Firebase Storage if it was uploaded there, and removes from localStorage.
 */
export const deletePublicSubmission = async (id: string, linkDokumen?: string): Promise<void> => {
  // 1. Delete file from Firebase Storage if it's a Storage URL
  if (linkDokumen && isFirebaseStorageUrl(linkDokumen)) {
    // Get Storage instance dynamically at call time (avoids stale null reference)
    let storageInstance = firebaseStorage;
    if (!storageInstance) {
      try {
        const { getApps } = await import('firebase/app');
        const { getStorage } = await import('firebase/storage');
        const apps = getApps();
        if (apps.length > 0) {
          storageInstance = getStorage(apps[0]);
        }
      } catch {
        // ignore — will be caught below
      }
    }

    if (storageInstance) {
      try {
        console.log('[deletePublicSubmission] Attempting to delete Storage file using full URL:', linkDokumen);
        // Firebase Storage ref() can automatically parse full download URLs or gs:// URLs!
        const fileRef = ref(storageInstance, linkDokumen);
        await deleteObject(fileRef);
        console.log('[deletePublicSubmission] Storage file deleted successfully.');
      } catch (err) {
        // Log but don't block Firestore deletion
        console.error('[deletePublicSubmission] Failed to delete file from Firebase Storage:', err);
      }
    } else {
      console.warn('[deletePublicSubmission] Firebase Storage instance not available — skipping file deletion.');
    }
  }

  // 2. Delete document from Firestore
  if (firebaseDb) {
    try {
      await deleteDoc(doc(firebaseDb, PUBLIC_SUBMISSIONS_COLLECTION, id));
    } catch (err) {
      console.error('Error deleting public submission from Firestore:', err);
    }
  }

  // 3. Always remove from localStorage
  const local = getLocalPublicSubmissions();
  saveLocalPublicSubmissions(local.filter((item) => item.id !== id));
};

// --- Database Export / Backup & Restore ---
export const exportDatabaseToJson = (disposisi: DisposisiSurat[], users: UserAccount[]) => {
  const backupData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    disposisi,
    users,
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(backupData, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute(
    'download',
    `e_disposisi_backup_${new Date().toISOString().slice(0, 10)}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const importDatabaseFromJson = (
  jsonContent: string
): { success: boolean; disposisiCount: number; usersCount: number; message: string } => {
  try {
    const parsed = JSON.parse(jsonContent);
    if (!parsed.disposisi || !Array.isArray(parsed.disposisi)) {
      return { success: false, disposisiCount: 0, usersCount: 0, message: 'Format file JSON tidak valid!' };
    }

    saveLocalDisposisi(parsed.disposisi);
    if (parsed.users && Array.isArray(parsed.users)) {
      saveLocalUsers(parsed.users);
    }

    // Sync to Firestore if active
    if (firebaseDb) {
      parsed.disposisi.forEach((item: DisposisiSurat) => syncDisposisiToFirestore(item));
      if (parsed.users) {
        parsed.users.forEach((user: UserAccount) => syncUserToFirestore(user));
      }
    }

    return {
      success: true,
      disposisiCount: parsed.disposisi.length,
      usersCount: parsed.users ? parsed.users.length : 0,
      message: 'Database berhasil dipulihkan dari cadangan (backup)!',
    };
  } catch (err) {
    return {
      success: false,
      disposisiCount: 0,
      usersCount: 0,
      message: 'Gagal mengimpor file: ' + (err as Error).message,
    };
  }
};
