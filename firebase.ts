import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Hardcoded target database configuration to protect against sandbox project overrides
const firebaseConfigLocal = {
  projectId: "pradumankart-4349d",
  appId: "1:375406573264:web:2d04c6c02c14e4787b50d5",
  apiKey: "AIzaSyDTV00rW7Un1tAPvs2flcz4vwrGmwWWs7w",
  authDomain: "pradumankart-4349d.firebaseapp.com",
  storageBucket: "pradumankart-4349d.firebasestorage.app",
  messagingSenderId: "375406573264",
  measurementId: "G-XK5FJD3CLM",
  firestoreDatabaseId: "(default)"
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigLocal.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigLocal.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigLocal.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigLocal.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigLocal.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigLocal.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigLocal.measurementId || ""
};

export const activeFirebaseConfig = { ...firebaseConfig };
export const isUsingLocalConfig = !import.meta.env.VITE_FIREBASE_API_KEY;

const firestoreDatabaseId = isUsingLocalConfig
  ? (firebaseConfigLocal.firestoreDatabaseId || "(default)")
  : (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || "(default)");

const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export const db = firestoreDatabaseId && firestoreDatabaseId !== "(default)"
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);


