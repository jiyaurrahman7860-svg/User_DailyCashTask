import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';

/**
 * Firebase Configuration
 * 
 * IMPORTANT: Firebase should be initialized ONLY ONCE globally.
 * Multiple initializeApp() calls cause production errors and break Firestore data loading.
 * We use getApps() to check if Firebase is already initialized to prevent duplicates.
 * 
 * All config values must be set in Vercel Environment Variables:
 * - NEXT_PUBLIC_FIREBASE_API_KEY
 * - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 * - NEXT_PUBLIC_FIREBASE_PROJECT_ID
 * - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 * - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 * - NEXT_PUBLIC_FIREBASE_APP_ID
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if not already initialized
// This prevents "Firebase already initialized" errors in production
const app: FirebaseApp = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApps()[0];

// Export Firebase services from the single instance
export const auth: Auth = getAuth(app);

// Set auth persistence to LOCAL (survives browser restarts)
// This prevents auth state loss during reloads
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log('[Firebase] Auth persistence set to LOCAL'))
  .catch((err) => console.error('[Firebase] Failed to set auth persistence:', err));

export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app);

export default app;
