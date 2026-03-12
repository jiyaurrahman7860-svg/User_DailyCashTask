/**
 * Google Authentication Utility Module
 * 
 * This module provides a production-ready Google Sign-In system that:
 * 1. Authenticates users with Firebase Google Auth
 * 2. Validates and creates Firestore user documents
 * 3. Handles referral codes from URL params and localStorage
 * 4. Prevents race conditions with atomic operations
 * 5. Ensures dashboard always loads user data correctly
 * 
 * @module lib/firebase/googleAuth
 */

import { 
  signInWithPopup, 
  signInWithRedirect,
  GoogleAuthProvider, 
  User as FirebaseUser,
  getRedirectResult 
} from 'firebase/auth'
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp, 
  query, 
  collection, 
  where, 
  getDocs,
  runTransaction
} from 'firebase/firestore'
import { auth, db } from './config'
import { processSignupReferral, giveSignupBonus } from './functions'
import { storeUserSecurity, generateDeviceFingerprint, getIPAddress } from './fraud'

/**
 * Constants for referral code storage
 */
const REFERRAL_STORAGE_KEY = 'dtp_pending_referral'
const REFERRAL_EXPIRY_HOURS = 24

/**
 * Generate a unique user ID in format DTP + 6 random digits
 * @returns {string} Unique user ID like "DTP482951"
 */
function generateUserId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000)
  return `DTP${randomNum}`
}

/**
 * Generate a unique referral code from user name
 * Format: First 6 chars of name (uppercase) + 3 random digits
 * @param {string} name - User's display name
 * @returns {string} Referral code like "JIYA123"
 */
function generateReferralCode(name: string): string {
  const cleanName = name.replace(/\s+/g, '').toUpperCase().substring(0, 6)
  const randomNum = Math.floor(100 + Math.random() * 900)
  return `${cleanName}${randomNum}`
}

/**
 * Store referral code in localStorage with timestamp
 * This allows referral codes to persist across pages and sessions
 * @param {string} code - Referral code to store
 */
export function storeReferralCode(code: string): void {
  if (typeof window === 'undefined') return
  
  const data = {
    code: code.toUpperCase().trim(),
    timestamp: Date.now(),
    expiry: Date.now() + (REFERRAL_EXPIRY_HOURS * 60 * 60 * 1000)
  }
  
  try {
    localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(data))
    console.log('[GoogleAuth] Referral code stored:', code)
  } catch (error) {
    console.error('[GoogleAuth] Failed to store referral code:', error)
  }
}

/**
 * Retrieve and validate stored referral code from localStorage
 * Returns null if code is expired or doesn't exist
 * @returns {string | null} Valid referral code or null
 */
export function getStoredReferralCode(): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(REFERRAL_STORAGE_KEY)
    if (!stored) return null
    
    const data = JSON.parse(stored)
    const now = Date.now()
    
    // Check if code has expired
    if (now > data.expiry) {
      console.log('[GoogleAuth] Referral code expired, clearing...')
      localStorage.removeItem(REFERRAL_STORAGE_KEY)
      return null
    }
    
    return data.code
  } catch (error) {
    console.error('[GoogleAuth] Error reading stored referral code:', error)
    return null
  }
}

/**
 * Clear stored referral code from localStorage
 * Called after successful signup to prevent reuse
 */
export function clearStoredReferralCode(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(REFERRAL_STORAGE_KEY)
    console.log('[GoogleAuth] Referral code cleared from storage')
  } catch (error) {
    console.error('[GoogleAuth] Failed to clear referral code:', error)
  }
}

/**
 * Validate a referral code by checking if it exists in the database
 * @param {string} code - Referral code to validate
 * @returns {Promise<{valid: boolean; referrerId: string | null}>} Validation result
 */
async function validateReferralCode(code: string): Promise<{ valid: boolean; referrerId: string | null }> {
  if (!code || code.trim() === '') {
    return { valid: false, referrerId: null }
  }
  
  try {
    const q = query(
      collection(db, 'users'), 
      where('referralCode', '==', code.toUpperCase().trim())
    )
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      return { 
        valid: true, 
        referrerId: querySnapshot.docs[0].id 
      }
    }
    
    return { valid: false, referrerId: null }
  } catch (error) {
    console.error('[GoogleAuth] Error validating referral code:', error)
    return { valid: false, referrerId: null }
  }
}

/**
 * Interface for the result of Google sign-in
 */
export interface GoogleAuthResult {
  success: boolean
  user?: FirebaseUser
  isNewUser?: boolean
  error?: string
  errorCode?: string
}

/**
 * Interface for user data structure in Firestore
 */
interface UserData {
  uid: string
  userId: string
  name: string
  email: string
  photoURL: string | null
  provider: 'google' | 'email'
  walletBalance: number
  totalEarned: number
  referralCode: string
  referredBy: string | null
  level: number
  tasksCompleted: number
  createdAt: any
  lastLogin: any
  isBanned?: boolean
}

/**
 * Check if user document exists in Firestore
 * @param {string} uid - User's Firebase Auth UID
 * @returns {Promise<{exists: boolean; data: UserData | null}>}
 */
async function checkUserDocument(uid: string): Promise<{ exists: boolean; data: UserData | null }> {
  try {
    const userDocRef = doc(db, 'users', uid)
    const userDoc = await getDoc(userDocRef)
    
    if (userDoc.exists()) {
      return { exists: true, data: userDoc.data() as UserData }
    }
    
    return { exists: false, data: null }
  } catch (error) {
    console.error('[GoogleAuth] Error checking user document:', error)
    throw error
  }
}

/**
 * Create a new user document in Firestore using atomic transaction
 * This prevents race conditions and duplicate document creation
 * 
 * @param {FirebaseUser} user - Firebase Auth user object
 * @param {string | null} referralCode - Optional referral code
 * @returns {Promise<UserData>} Created user data
 */
async function createUserDocument(
  user: FirebaseUser, 
  referralCode: string | null
): Promise<UserData> {
  const userDocRef = doc(db, 'users', user.uid)
  
  // Use transaction to ensure atomic operation and prevent duplicates
  return await runTransaction(db, async (transaction) => {
    // Check again inside transaction to prevent race conditions
    const userDoc = await transaction.get(userDocRef)
    
    if (userDoc.exists()) {
      console.log('[GoogleAuth] User document already exists (race condition prevented)')
      return userDoc.data() as UserData
    }
    
    // Generate unique IDs
    const userId = generateUserId()
    const name = user.displayName || 'User'
    const newReferralCode = generateReferralCode(name)
    const email = user.email || ''
    const photoURL = user.photoURL || null
    
    // Validate and process referral code
    let referredBy: string | null = null
    if (referralCode) {
      const validation = await validateReferralCode(referralCode)
      if (validation.valid && validation.referrerId !== user.uid) {
        referredBy = validation.referrerId
        console.log('[GoogleAuth] Valid referral code applied:', referralCode)
      } else {
        console.log('[GoogleAuth] Invalid or self-referral code ignored:', referralCode)
      }
    }
    
    // Create user data object
    const userData: UserData = {
      uid: user.uid,
      userId,
      name,
      email,
      photoURL,
      provider: 'google',
      walletBalance: 0,
      totalEarned: 0,
      referralCode: newReferralCode,
      referredBy,
      level: 1,
      tasksCompleted: 0,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      isBanned: false
    }
    
    // Create the document atomically
    transaction.set(userDocRef, userData)
    
    console.log('[GoogleAuth] New user document created:', { uid: user.uid, userId, referredBy })
    
    return userData
  })
}

/**
 * Update last login timestamp for existing users
 * @param {string} uid - User's Firebase Auth UID
 */
async function updateLastLogin(uid: string): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid)
    await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true })
    console.log('[GoogleAuth] Last login updated for existing user:', uid)
  } catch (error) {
    console.error('[GoogleAuth] Failed to update last login:', error)
    // Non-critical error, don't throw
  }
}

/**
 * Process signup bonus and referral rewards for new users
 * @param {string} uid - User's Firebase Auth UID
 * @param {UserData} userData - User data object
 * @param {string | null} referralCode - Applied referral code
 */
async function processNewUserRewards(
  uid: string, 
  userData: UserData, 
  referralCode: string | null
): Promise<void> {
  // Process referral reward if applicable
  if (referralCode && userData.referredBy) {
    try {
      await processSignupReferral({
        referralCode: referralCode.toUpperCase().trim(),
        userId: uid,
        userName: userData.name,
        userEmail: userData.email
      })
      console.log('[GoogleAuth] Referral processed successfully via Cloud Function')
    } catch (error: any) {
      console.error('[GoogleAuth] Error processing referral:', error)
      // Continue even if referral processing fails
      // The user account is already created
    }
  }
  
  // Store user security info for anti-fraud
  try {
    await storeUserSecurity(uid)
    console.log('[GoogleAuth] User security info stored')
  } catch (error) {
    console.error('[GoogleAuth] Error storing user security:', error)
    // Non-critical, continue
  }
  
  // Give signup bonus
  try {
    const deviceFingerprint = generateDeviceFingerprint()
    const ipAddress = await getIPAddress()
    const bonusResult = await giveSignupBonus({ ipAddress, deviceFingerprint }) as { 
      data: { success: boolean; message: string; amount?: number } 
    }
    
    if (bonusResult.data.success) {
      console.log('[GoogleAuth] Signup bonus granted:', bonusResult.data.message)
    } else {
      console.log('[GoogleAuth] Signup bonus not granted:', bonusResult.data.message)
    }
  } catch (error) {
    console.error('[GoogleAuth] Error giving signup bonus:', error)
    // Non-critical, continue
  }
}

/**
 * Main Google Sign-In Function
 * 
 * This function implements the complete Google authentication flow:
 * 1. Sign in with Firebase Google Auth (popup or redirect)
 * 2. Check if user document exists in Firestore
 * 3. If new user: Create document with referral handling
 * 4. If existing user: Update last login and load existing data
 * 5. Handle errors with retry logic
 * 
 * @param {boolean} useRedirect - Use redirect instead of popup (recommended for mobile)
 * @param {string | null} urlReferralCode - Referral code from URL params
 * @returns {Promise<GoogleAuthResult>} Authentication result
 */
export async function signInWithGoogle(
  useRedirect: boolean = false,
  urlReferralCode: string | null = null
): Promise<GoogleAuthResult> {
  console.log('[GoogleAuth] Starting Google sign-in process...')
  
  try {
    const provider = new GoogleAuthProvider()
    
    // Add scopes for better user data
    provider.addScope('profile')
    provider.addScope('email')
    
    // Set custom parameters
    provider.setCustomParameters({
      prompt: 'select_account' // Force account selection
    })
    
    let user: FirebaseUser
    
    if (useRedirect) {
      // Use redirect flow (better for mobile)
      console.log('[GoogleAuth] Using redirect flow...')
      await signInWithRedirect(auth, provider)
      // Note: Page will reload, result handled by getRedirectResult
      return { success: true }
    } else {
      // Use popup flow (better UX on desktop)
      console.log('[GoogleAuth] Using popup flow...')
      const result = await signInWithPopup(auth, provider)
      user = result.user
    }
    
    console.log('[GoogleAuth] Firebase authentication successful:', user.uid)
    
    // Step 1: Check if user document exists
    console.log('[GoogleAuth] Checking Firestore user document...')
    const { exists, data: existingData } = await checkUserDocument(user.uid)
    
    let isNewUser = false
    
    if (exists && existingData) {
      // EXISTING USER: Update last login and preserve all existing data
      console.log('[GoogleAuth] Existing user detected, loading data...')
      await updateLastLogin(user.uid)
      
      // Do NOT overwrite any existing fields
      // The existingData contains all the user's wallet, tasks, referral info
      console.log('[GoogleAuth] Existing user data loaded successfully')
      
    } else {
      // NEW USER: Create document with all required fields
      console.log('[GoogleAuth] New user detected, creating document...')
      isNewUser = true
      
      // Check for referral code: URL param takes priority over localStorage
      const storedReferralCode = getStoredReferralCode()
      const effectiveReferralCode = urlReferralCode || storedReferralCode
      
      if (effectiveReferralCode) {
        console.log('[GoogleAuth] Referral code detected:', effectiveReferralCode)
      }
      
      // Create user document atomically (prevents race conditions)
      const newUserData = await createUserDocument(user, effectiveReferralCode)
      
      // Process rewards (referral bonus, signup bonus, etc.)
      await processNewUserRewards(user.uid, newUserData, effectiveReferralCode)
      
      // Clear stored referral code after successful use
      clearStoredReferralCode()
      
      console.log('[GoogleAuth] New user setup completed successfully')
    }
    
    return { 
      success: true, 
      user, 
      isNewUser 
    }
    
  } catch (error: any) {
    console.error('[GoogleAuth] Google sign-in error:', error)
    
    // Handle specific Firebase Auth errors
    let errorMessage = 'Failed to sign in with Google'
    let errorCode = error.code || 'unknown'
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Sign-in popup was closed. Please try again.'
        break
      case 'auth/popup-blocked':
        errorMessage = 'Sign-in popup was blocked. Please allow popups and try again.'
        break
      case 'auth/cancelled-popup-request':
        errorMessage = 'Another sign-in is in progress. Please wait.'
        break
      case 'auth/account-exists-with-different-credential':
        errorMessage = 'An account already exists with the same email but different sign-in method.'
        break
      case 'auth/invalid-credential':
        errorMessage = 'Invalid credentials. Please try again.'
        break
      case 'auth/operation-not-allowed':
        errorMessage = 'Google sign-in is not enabled. Please contact support.'
        break
      case 'auth/user-disabled':
        errorMessage = 'Your account has been disabled. Please contact support.'
        break
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your internet connection and try again.'
        break
      case 'auth/timeout':
        errorMessage = 'Request timed out. Please try again.'
        break
      default:
        errorMessage = error.message || 'Failed to sign in with Google. Please try again.'
    }
    
    return { 
      success: false, 
      error: errorMessage,
      errorCode
    }
  }
}

/**
 * Handle redirect result after Google sign-in with redirect flow
 * This should be called on the login/signup page load to handle the redirect result
 * 
 * @param {string | null} urlReferralCode - Referral code from URL params
 * @returns {Promise<GoogleAuthResult>} Authentication result
 */
export async function handleGoogleRedirectResult(
  urlReferralCode: string | null = null
): Promise<GoogleAuthResult> {
  console.log('[GoogleAuth] Checking for Google redirect result...')
  
  try {
    const result = await getRedirectResult(auth)
    
    if (!result) {
      // No redirect result available
      return { success: false, error: 'No redirect result' }
    }
    
    const user = result.user
    console.log('[GoogleAuth] Redirect authentication successful:', user.uid)
    
    // Rest of the logic is identical to signInWithGoogle
    const { exists, data: existingData } = await checkUserDocument(user.uid)
    
    let isNewUser = false
    
    if (exists && existingData) {
      console.log('[GoogleAuth] Existing user detected from redirect, loading data...')
      await updateLastLogin(user.uid)
    } else {
      console.log('[GoogleAuth] New user detected from redirect, creating document...')
      isNewUser = true
      
      const storedReferralCode = getStoredReferralCode()
      const effectiveReferralCode = urlReferralCode || storedReferralCode
      
      const newUserData = await createUserDocument(user, effectiveReferralCode)
      await processNewUserRewards(user.uid, newUserData, effectiveReferralCode)
      clearStoredReferralCode()
      
      console.log('[GoogleAuth] New user setup from redirect completed successfully')
    }
    
    return { 
      success: true, 
      user, 
      isNewUser 
    }
    
  } catch (error: any) {
    console.error('[GoogleAuth] Google redirect result error:', error)
    
    return { 
      success: false, 
      error: error.message || 'Failed to complete Google sign-in',
      errorCode: error.code || 'unknown'
    }
  }
}

/**
 * Check if a user document exists and fetch user data
 * This is used by the dashboard to ensure data is loaded correctly
 * 
 * @param {string} uid - User's Firebase Auth UID
 * @returns {Promise<{exists: boolean; data: UserData | null; error?: string}>}
 */
export async function fetchUserData(uid: string): Promise<{ 
  exists: boolean
  data: UserData | null
  error?: string 
}> {
  if (!uid) {
    return { exists: false, data: null, error: 'No user ID provided' }
  }
  
  try {
    console.log('[GoogleAuth] Fetching user data for:', uid)
    const { exists, data } = await checkUserDocument(uid)
    
    if (exists && data) {
      console.log('[GoogleAuth] User data fetched successfully')
      return { exists: true, data }
    }
    
    console.log('[GoogleAuth] User document not found')
    return { exists: false, data: null, error: 'User document not found' }
    
  } catch (error: any) {
    console.error('[GoogleAuth] Error fetching user data:', error)
    return { 
      exists: false, 
      data: null, 
      error: error.message || 'Failed to fetch user data' 
    }
  }
}

/**
 * Retry wrapper for fetchUserData with automatic retries
 * @param {string} uid - User's Firebase Auth UID
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<{exists: boolean; data: UserData | null; error?: string}>}
 */
export async function fetchUserDataWithRetry(
  uid: string, 
  maxRetries: number = 3
): Promise<{ 
  exists: boolean
  data: UserData | null
  error?: string 
}> {
  let lastError: string | undefined
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[GoogleAuth] Fetch user data attempt ${attempt}/${maxRetries}`)
    
    const result = await fetchUserData(uid)
    
    if (result.exists && result.data) {
      return result
    }
    
    lastError = result.error
    
    // Wait before retry (exponential backoff)
    if (attempt < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
      console.log(`[GoogleAuth] Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  return { 
    exists: false, 
    data: null, 
    error: lastError || 'Failed to fetch user data after retries' 
  }
}

// Re-export UserData interface for use in other modules
export type { UserData }
