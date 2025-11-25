// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCKFt0P4NxjM83hh-qCXBA2OcSHoM3zMtY",
  authDomain: "tce-career-page.firebaseapp.com",
  projectId: "tce-career-page",
  storageBucket: "tce-career-page.firebasestorage.app",
  messagingSenderId: "292987795599",
  appId: "1:292987795599:web:873da7eefd6be6abe0d8fa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);