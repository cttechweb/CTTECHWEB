import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  onIdTokenChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  getAdditionalUserInfo,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  onSnapshot,
  serverTimestamp 
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC6E6EDNFipeLVvAjEt6i221QUgahm6QgA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cool-technologies-b2b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cool-technologies-b2b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cool-technologies-b2b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "913438973126",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:913438973126:web:e879ec5f4fa795319d0bc7",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WD62EQ1091"
};

// Initialize Firebase App instance
const app = initializeApp(firebaseConfig);

// Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  onIdTokenChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  getAdditionalUserInfo,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  serverTimestamp,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
};
export type { FirebaseUser };

