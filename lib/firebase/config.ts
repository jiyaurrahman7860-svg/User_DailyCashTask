import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, Firestore, enableNetwork, disableNetwork } from 'firebase/firestore';
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

// Initialize Firebase only if not already initialized
// This prevents "Firebase already initialized" errors in production
let app: FirebaseApp;
try {
  app = getApps().length === 0 
    ? initializeApp(firebaseConfig) 
    : getApps()[0];
  console.log('[Firebase] App initialized successfully. App count:', getApps().length);
} catch (error) {
  console.error('[Firebase] Failed to initialize app:', error);
  throw error;
}

// Export Firebase services from the single instance
export const auth: Auth = getAuth(app);

// Set auth persistence to LOCAL (survives browser restarts)
// This prevents auth state loss during reloads
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

export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app);

/**
 * Test Firebase connection by enabling network
 * Call this function early in your app to ensure Firestore is connected
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    console.log('[Firebase] Testing Firestore connection...');
    await enableNetwork(db);
    console.log('[Firebase] Firestore network enabled successfully');
    return true;
  } catch (error) {
    console.error('[Firebase] Firestore connection test failed:', error);
    return false;
  }
}

/**
 * Get missing environment variables for debugging
 */
export function getMissingEnvVars(): string[] {
  return missingVars;
}

export default app;
