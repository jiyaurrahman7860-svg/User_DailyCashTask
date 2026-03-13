import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';

/**
 * Firebase Configuration - Simple Production Setup
 * 
 * CRITICAL: All NEXT_PUBLIC_FIREBASE_* env vars must be set in Vercel:
 * Project Settings > Environment Variables
 */

// Debug: Log raw env values (safely)
const rawEnvVars = {
  apiKey: typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'MISSING')
    : 'Server',
  authDomain: typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'MISSING') 
    : 'Server',
  projectId: typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'MISSING')
    : 'Server',
  storageBucket: typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Set' : 'MISSING')
    : 'Server',
  messagingSenderId: typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Set' : 'MISSING')
    : 'Server',
  appId: typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Set' : 'MISSING')
    : 'Server',
};

console.log('[Firebase] Environment check:', rawEnvVars);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate config - CRITICAL check
const missingVars = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('[Firebase] CRITICAL ERROR: Missing environment variables:', missingVars);
  console.error('[Firebase] Firestore will fail with "client is offline" error!');
}

// Only initialize if we have minimum required config
let app: FirebaseApp;
try {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error(`Missing required Firebase config: ${missingVars.join(', ')}`);
  }
  
  app = !getApps().length 
    ? initializeApp(firebaseConfig) 
    : getApps()[0];
    
  console.log('[Firebase] App initialized successfully. App count:', getApps().length);
} catch (error) {
  console.error('[Firebase] FAILED TO INITIALIZE:', error);
  // Create a dummy app to prevent crashes, but log the error
  app = getApps()[0] || ({} as FirebaseApp);
}

// Export Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app);

// Set auth persistence
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
 * Get missing environment variables for UI debugging
 */
export function getMissingEnvVars(): string[] {
  return missingVars;
}

/**
 * Check if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  return missingVars.length === 0;
}

export default app;
