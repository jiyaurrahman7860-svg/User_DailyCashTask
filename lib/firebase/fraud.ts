import { auth, db } from './config';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { doc, setDoc } from 'firebase/firestore';

// Generate a simple device fingerprint
export function generateDeviceFingerprint(): string {
  const userAgent = navigator.userAgent;
  const screenResolution = `${screen.width}x${screen.height}`;
  const colorDepth = screen.colorDepth;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  
  // Create a simple hash from these values
  const fingerprintData = `${userAgent}-${screenResolution}-${colorDepth}-${timezone}-${language}`;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprintData.length; i++) {
    const char = fingerprintData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(16).substring(0, 16);
}

// Get IP address (using a simple service)
export async function getIPAddress(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP:', error);
    return 'unknown';
  }
}

// Store user security info after signup
export async function storeUserSecurity(userId: string): Promise<void> {
  try {
    const deviceFingerprint = generateDeviceFingerprint();
    const ipAddress = await getIPAddress();
    const userAgent = navigator.userAgent;
    
    await setDoc(doc(db, 'userSecurity', userId), {
      userId,
      ipAddress,
      deviceFingerprint,
      userAgent,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error storing user security:', error);
  }
}

// Check for fraud on signup (this would be called from a Cloud Function in production)
export async function checkFraudOnSignup(userId: string): Promise<{ allowed: boolean; message?: string }> {
  // In a real implementation, this would call a Cloud Function
  // For now, we'll just store the security info
  try {
    await storeUserSecurity(userId);
    return { allowed: true };
  } catch (error) {
    console.error('Error checking fraud:', error);
    return { allowed: true }; // Allow signup even if check fails
  }
}

// Fraud check result interface
export interface FraudCheckResult {
  allowed: boolean;
  reason?: string;
  deviceFingerprint?: string;
  message?: string;
}
