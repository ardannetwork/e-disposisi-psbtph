import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixRoles() {
  console.log('Fetching users from Firestore...');
  const querySnapshot = await getDocs(collection(db, 'users'));
  
  querySnapshot.forEach(async (docSnap) => {
    const data = docSnap.data();
    const email = (data.email || '').toLowerCase();
    
    if (email.includes('ardannetwork') || email.includes('admin')) {
      console.log(`Updating ${email} (${docSnap.id}) to role: admin, approved: true`);
      await updateDoc(doc(db, 'users', docSnap.id), {
        role: 'admin',
        approved: true
      });
    }
  });

  console.log('Done updating roles in Firestore!');
  setTimeout(() => process.exit(0), 2000);
}

fixRoles();
