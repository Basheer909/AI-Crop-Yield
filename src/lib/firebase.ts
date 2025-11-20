import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyDemoKey-ReplaceWithYourActualKey",
  authDomain: "crop-optimizer-demo.firebaseapp.com",
  projectId: "crop-optimizer-demo",
  storageBucket: "crop-optimizer-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// App ID for Firestore paths
export const APP_ID = "crop_yield_optimizer_v1";
