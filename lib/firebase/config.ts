import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';

/**
 * Firebase Configuration - Simple Production Setup
 * 
 * IMPORTANT: 
 * - No offline persistence (causes "client is offline" errors in production)
 * - Simple getFirestore(app) initialization
 * - Firebase initializes only once globally
 */

// Log environment variable status for debugging
const envVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓ Set' : '✗ Missing',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✓ Set' : '✗ Missing',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✓ Set' : '✗ Missing',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✓ Set' : '✗ Missing',
};

console.log('[Firebase] Environment variables status:', envVars);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate config
const missingVars = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('[Firebase] CRITICAL: Missing environment variables:', missingVars);
}

// Initialize Firebase only once
const app: FirebaseApp = !getApps().length 
  ? initializeApp(firebaseConfig) 
  : getApps()[0];

console.log('[Firebase] App initialized. App count:', getApps().length);

// Export Firebase services - SIMPLE setup, NO persistence
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app);

// Set auth persistence to LOCAL (survives browser restarts)
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log('[Firebase] Auth persistence set to LOCAL'))
  .catch((err) => console.error('[Firebase] Failed to set auth persistence:', err));

// Monitor auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('[Firebase] Auth state: User signed in:', user.uid);
  } else {
    console.log('[Firebase] Auth state: No user signed in');
  }
});

/**
 * Get missing environment variables for debugging
 */
export function getMissingEnvVars(): string[] {
  return missingVars;
}

export default app;
