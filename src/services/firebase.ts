/// <reference types="vite/client" />
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const LOCAL_STORAGE_FIREBASE_KEY = 'e_disposisi_firebase_config';

export const getSavedFirebaseConfig = (): FirebaseConfig | null => {
  try {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
    const envApiKey = metaEnv.VITE_FIREBASE_API_KEY;
    const envProjectId = metaEnv.VITE_FIREBASE_PROJECT_ID;
    if (envApiKey && envProjectId) {
      return {
        apiKey: envApiKey,
        authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || '',
        projectId: envProjectId,
        storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: metaEnv.VITE_FIREBASE_APP_ID || '',
      };
    }

    const saved = localStorage.getItem(LOCAL_STORAGE_FIREBASE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to parse saved firebase config', err);
  }
  return null;
};

export const saveFirebaseConfig = (config: FirebaseConfig) => {
  localStorage.setItem(LOCAL_STORAGE_FIREBASE_KEY, JSON.stringify(config));
};

export const clearFirebaseConfig = () => {
  localStorage.removeItem(LOCAL_STORAGE_FIREBASE_KEY);
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export const initFirebase = (config?: FirebaseConfig | null): { app: FirebaseApp | null; auth: Auth | null; db: Firestore | null; storage: FirebaseStorage | null } => {
  const cfg = config || getSavedFirebaseConfig();
  if (!cfg || !cfg.apiKey || !cfg.projectId) {
    return { app: null, auth: null, db: null, storage: null };
  }

  try {
    if (!getApps().length) {
      app = initializeApp(cfg);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    return { app, auth, db, storage };
  } catch (err) {
    console.error('Error initializing Firebase', err);
    return { app: null, auth: null, db: null, storage: null };
  }
};

const instances = initFirebase();
export const firebaseApp = instances.app;
export const firebaseAuth = instances.auth;
export const firebaseDb = instances.db;
export const firebaseStorage = instances.storage;
