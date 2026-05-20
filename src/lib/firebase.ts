import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyBQUOw-YxLgJstu50-JctUphHgJ-28Ykok",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "jogjacuy-951d6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "jogjacuy-951d6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "jogjacuy-951d6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "750674782856",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:750674782856:web:24144633f179e8ecc28d3d",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
