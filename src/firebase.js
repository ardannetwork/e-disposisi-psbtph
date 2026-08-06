import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB1m6e0HMOcukdHJj1ICVUAwev6Z6gKsoE",
    authDomain: "psbtph-malang.firebaseapp.com",
    projectId: "psbtph-malang",
    storageBucket: "psbtph-malang.firebasestorage.app",
    messagingSenderId: "83966021987",
    appId: "1:83966021987:web:01f4afd7a642c793f60356",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);