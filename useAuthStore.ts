import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfigLocal from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigLocal.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigLocal.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigLocal.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigLocal.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigLocal.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigLocal.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigLocal.measurementId || ""
};

const isUsingLocalConfig = !import.meta.env.VITE_FIREBASE_API_KEY;

const firestoreDatabaseId = isUsingLocalConfig
  ? (firebaseConfigLocal.firestoreDatabaseId || "(default)")
  : (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || "(default)");

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = firestoreDatabaseId && firestoreDatabaseId !== "(default)"
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);

