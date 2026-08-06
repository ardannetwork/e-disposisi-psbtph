import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole, DisposisiSurat } from '../types/disposisi';
import { INITIAL_USERS, INITIAL_DISPOSISI_SURAT } from '../data/mockData';
import { firebaseDb, firebaseAuth } from '../services/firebase';
import {
  getLocalDisposisi,
  saveLocalDisposisi,
  getLocalUsers,
  saveLocalUsers,
  syncDisposisiToFirestore,
  updateDisposisiInFirestore,
  deleteDisposisiFromFirestore,
  syncUserToFirestore,
  updateUserInFirestore,
  deleteUserFromFirestore,
  exportDatabaseToJson,
  importDatabaseFromJson,
} from '../services/db';
import { collection, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

interface AuthContextType {
  currentUser: UserAccount | null;
  usersList: UserAccount[];
  disposisiList: DisposisiSurat[];
  login: (email: string, pass: string) => { success: boolean; message: string; user?: UserAccount };
  logout: () => void;
  switchDemoRole: (role: UserRole, pbtName?: string) => void;
  registerUser: (
    email: string,
    name: string,
    pass: string,
    role: UserRole,
    pbtName?: string
  ) => { success: boolean; message: string };
  approveUser: (userId: string, role: UserRole, pbtName?: string) => void;
  rejectUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  addDisposisi: (data: Omit<DisposisiSurat, 'id' | 'created_at' | 'updated_at'>) => void;
  updateDisposisi: (id: string, data: Partial<DisposisiSurat>) => void;
  deleteDisposisi: (id: string) => void;
  togglePbtStatus: (id: string, newStatus: boolean) => void;
  exportDatabase: () => void;
  importDatabase: (jsonContent: string) => { success: boolean; message: string };
  isFirebaseActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_STORAGE_KEY = 'e_disposisi_logged_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usersList, setUsersList] = useState<UserAccount[]>(() => {
    const saved = getLocalUsers();
    return saved.length > 0 ? saved : INITIAL_USERS;
  });

  const [disposisiList, setDisposisiList] = useState<DisposisiSurat[]>(() => {
    const saved = getLocalDisposisi();
    return saved.length > 0 ? saved : INITIAL_DISPOSISI_SURAT;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse saved user state', err);
      }
    }
    return usersList.find((u) => u.role === 'admin') || usersList[0] || null;
  });

  const isFirebaseActive = !!firebaseDb;

  useEffect(() => {
    saveLocalUsers(usersList);
  }, [usersList]);

  useEffect(() => {
    saveLocalDisposisi(disposisiList);
  }, [disposisiList]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  }, [currentUser]);

  // Sync with Firestore Realtime listeners
  useEffect(() => {
    if (!firebaseDb) return;
    try {
      const unsubSurat = onSnapshot(collection(firebaseDb, 'disposisi_surat'), (snapshot) => {
        const items: DisposisiSurat[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as DisposisiSurat);
        });
        if (items.length > 0) {
          setDisposisiList(items);
        }
      });

      const unsubUsers = onSnapshot(collection(firebaseDb, 'users'), (snapshot) => {
        const users: UserAccount[] = [];
        snapshot.forEach((docSnap) => {
          users.push({ id: docSnap.id, ...docSnap.data() } as UserAccount);
        });
        if (users.length > 0) {
          setUsersList(users);
        }
      });

      return () => {
        unsubSurat();
        unsubUsers();
      };
    } catch (err) {
      console.warn('Firestore sync error fallback to local database', err);
    }
  }, [isFirebaseActive]);

  // LOGIN FUNCTION
  const login = (email: string, pass: string) => {
    const foundUser = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
      return { success: false, message: 'Email tidak terdaftar dalam sistem!' };
    }

    if (foundUser.password && foundUser.password !== pass) {
      return { success: false, message: 'Kata sandi (password) salah!' };
    }

    if (!foundUser.approved) {
      return {
        success: false,
        message: 'Akun Anda sedang menunggu persetujuan (Approval) dari Admin UPT PSBTPH Malang.',
      };
    }

    if (firebaseAuth) {
      signInWithEmailAndPassword(firebaseAuth, email, pass).catch((err) =>
        console.warn('Firebase Auth login fallback', err)
      );
    }

    setCurrentUser(foundUser);
    return { success: true, message: 'Login berhasil! Selamat datang.', user: foundUser };
  };

  // LOGOUT FUNCTION
  const logout = () => {
    if (firebaseAuth) {
      signOut(firebaseAuth).catch((err) => console.warn(err));
    }
    setCurrentUser(null);
  };

  // DEMO ROLE SWITCHER
  const switchDemoRole = (role: UserRole, pbtName?: string) => {
    let target = usersList.find((u) => u.role === role && u.approved);
    if (!target) {
      target = {
        id: `demo-${role}-${Date.now()}`,
        email: `demo.${role}@psbtph.go.id`,
        name:
          role === 'admin'
            ? 'Koordinator Admin UPT'
            : role === 'operator'
            ? 'Operator Surat'
            : role === 'bendahara'
            ? 'Bendahara UPT PSBTPH'
            : pbtName || 'Avianita Agustina, S.TP.',
        role,
        approved: true,
        pbt_name: role === 'pbt' ? pbtName || 'Avianita Agustina, S.TP.' : undefined,
        createdAt: new Date().toISOString(),
      };
    } else if (role === 'pbt' && pbtName) {
      target = { ...target, pbt_name: pbtName, name: pbtName };
    }
    setCurrentUser(target);
  };

  // REGISTER USER FUNCTION
  const registerUser = (
    email: string,
    name: string,
    pass: string,
    role: UserRole,
    pbtName?: string
  ) => {
    const existing = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, message: 'Email sudah terdaftar!' };
    }

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      email,
      name,
      password: pass,
      role,
      approved: false, // Pending Admin Approval
      pbt_name: role === 'pbt' ? pbtName : undefined,
      createdAt: new Date().toISOString(),
    };

    setUsersList((prev) => [...prev, newUser]);

    if (firebaseAuth) {
      createUserWithEmailAndPassword(firebaseAuth, email, pass).catch((err) =>
        console.warn('Firebase Auth create error', err)
      );
    }

    syncUserToFirestore(newUser);

    return {
      success: true,
      message:
        'Pendaftaran akun berhasil! Silakan hubungi Admin UPT PSBTPH Malang untuk persetujuan akun Anda.',
    };
  };

  const approveUser = (userId: string, role: UserRole, pbtName?: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = {
            ...u,
            approved: true,
            role,
            pbt_name: role === 'pbt' ? pbtName || u.pbt_name : undefined,
          };
          if (currentUser?.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    updateUserInFirestore(userId, {
      approved: true,
      role,
      pbt_name: role === 'pbt' ? pbtName : undefined,
    });
  };

  const rejectUser = (userId: string) => {
    setUsersList((prev) => prev.filter((u) => u.id !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
    deleteUserFromFirestore(userId);
  };

  const addDisposisi = (data: Omit<DisposisiSurat, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const id = `disp-${Date.now()}`;
    const newDoc: DisposisiSurat = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
    };

    setDisposisiList((prev) => [newDoc, ...prev]);
    syncDisposisiToFirestore(newDoc);
  };

  const updateDisposisi = (id: string, data: Partial<DisposisiSurat>) => {
    const now = new Date().toISOString();
    setDisposisiList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data, updated_at: now } : item))
    );
    updateDisposisiInFirestore(id, { ...data, updated_at: now });
  };

  const deleteDisposisi = (id: string) => {
    setDisposisiList((prev) => prev.filter((item) => item.id !== id));
    deleteDisposisiFromFirestore(id);
  };

  const togglePbtStatus = (id: string, newStatus: boolean) => {
    updateDisposisi(id, { status: newStatus });
  };

  const exportDatabase = () => {
    exportDatabaseToJson(disposisiList, usersList);
  };

  const importDatabase = (jsonContent: string) => {
    const res = importDatabaseFromJson(jsonContent);
    if (res.success) {
      setDisposisiList(getLocalDisposisi());
      setUsersList(getLocalUsers());
    }
    return { success: res.success, message: res.message };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        usersList,
        disposisiList,
        login,
        logout,
        switchDemoRole,
        registerUser,
        approveUser,
        rejectUser,
        deleteUser: rejectUser,
        addDisposisi,
        updateDisposisi,
        deleteDisposisi,
        togglePbtStatus,
        exportDatabase,
        importDatabase,
        isFirebaseActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
