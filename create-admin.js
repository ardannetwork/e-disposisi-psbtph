import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdmin() {
  try {
    console.log('Creating admin user in Firebase Auth...');
    const userCredential = await createUserWithEmailAndPassword(auth, 'admin@admin.com', 'abc12341234');
    const user = userCredential.user;
    console.log('Created auth user with UID:', user.uid);

    console.log('Creating admin user document in Firestore...');
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      email: 'admin@admin.com',
      name: 'Administrator',
      role: 'admin',
      approved: true,
      createdAt: new Date().toISOString()
    });
    console.log('Admin user successfully created and configured!');
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Email admin@admin.com is already registered in Firebase Auth.');
      // Since it's already there, maybe we just need to recreate the Firestore doc.
      // But we need the UID. We can't get it without logging in.
      try {
        console.log('Trying to sign in to get UID...');
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const userCredential = await signInWithEmailAndPassword(auth, 'admin@admin.com', 'abc12341234');
        const user = userCredential.user;
        
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          email: 'admin@admin.com',
          name: 'Administrator',
          role: 'admin',
          approved: true,
          createdAt: new Date().toISOString()
        });
        console.log('Firestore doc restored for existing admin!');
        process.exit(0);
      } catch (err) {
        console.error('Failed to sign in:', err);
        process.exit(1);
      }
    } else {
      console.error('Error creating user:', error);
      process.exit(1);
    }
  }
}

createAdmin();
