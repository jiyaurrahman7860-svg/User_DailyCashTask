/**
 * System Settings Service - User Panel
 * 
 * This module provides functions to read system_settings collection
 * in Firestore for the User Panel. It handles:
 * - User Panel Control settings (page visibility)
 * - Platform Controls settings (maintenance mode, announcements, etc.)
 * 
 * Users can only read settings, not modify them.
 */

import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from './config';

// Collection and document references
const SYSTEM_SETTINGS_COLLECTION = 'system_settings';
const USER_PANEL_CONTROLS_DOC = 'user_panel_controls';
const PLATFORM_CONTROLS_DOC = 'platform_controls';

/**
 * Type definitions for User Panel Controls
 */
export interface UserPanelControls {
  dashboard: boolean;
  tasks: boolean;
  myTasks: boolean;
  wallet: boolean;
  withdraw: boolean;
  referral: boolean;
  friendLeaderboard: boolean;
  rewards: boolean;
  rewardAds: boolean;
  leaderboard: boolean;
  contest: boolean;
  downloadApp: boolean;
  support: boolean;
  profile: boolean;
  quickLinks: boolean;
  login: boolean;
  signUp: boolean;
  blog: boolean;
  howItWorks: boolean;
  contact: boolean;
  legal: boolean;
  privacyPolicy: boolean;
  termsOfService: boolean;
  aboutUs: boolean;
  [key: string]: boolean;
}

/**
 * Type definitions for Platform Controls
 */
export interface PlatformControls {
  maintenanceMode: boolean;
  announcementEnabled: boolean;
  announcementMessage: string;
  tasksSystemEnabled: boolean;
  withdrawSystemEnabled: boolean;
  [key: string]: boolean | string;
}

/**
 * Default User Panel Control settings
 * All pages are enabled by default
 */
export const defaultUserPanelControls: UserPanelControls = {
  dashboard: true,
  tasks: true,
  myTasks: true,
  wallet: true,
  withdraw: true,
  referral: true,
  friendLeaderboard: true,
  rewards: true,
  rewardAds: true,
  leaderboard: true,
  contest: true,
  downloadApp: true,
  support: true,
  profile: true,
  quickLinks: true,
  login: true,
  signUp: true,
  blog: true,
  howItWorks: true,
  contact: true,
  legal: true,
  privacyPolicy: true,
  termsOfService: true,
  aboutUs: true,
};

/**
 * Default Platform Control settings
 */
export const defaultPlatformControls: PlatformControls = {
  maintenanceMode: false,
  announcementEnabled: false,
  announcementMessage: '',
  tasksSystemEnabled: true,
  withdrawSystemEnabled: true,
};

/**
 * Get User Panel Control settings
 * Returns the settings document or defaults if not found
 */
export async function getUserPanelControls() {
  try {
    const docRef = doc(db, SYSTEM_SETTINGS_COLLECTION, USER_PANEL_CONTROLS_DOC);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Merge with defaults to ensure all fields exist
      return { ...defaultUserPanelControls, ...docSnap.data() };
    }
    
    // Return defaults if document doesn't exist
    return defaultUserPanelControls;
  } catch (error) {
    console.error('Error getting user panel controls:', error);
    return defaultUserPanelControls;
  }
}

/**
 * Get Platform Control settings
 * Returns the settings document or defaults if not found
 */
export async function getPlatformControls() {
  try {
    const docRef = doc(db, SYSTEM_SETTINGS_COLLECTION, PLATFORM_CONTROLS_DOC);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Merge with defaults to ensure all fields exist
      return { ...defaultPlatformControls, ...docSnap.data() };
    }
    
    // Return defaults if document doesn't exist
    return defaultPlatformControls;
  } catch (error) {
    console.error('Error getting platform controls:', error);
    return defaultPlatformControls;
  }
}

/**
 * Subscribe to User Panel Control changes in real-time
 * Returns an unsubscribe function
 */
export function subscribeToUserPanelControls(callback: (controls: UserPanelControls) => void) {
  const docRef = doc(db, SYSTEM_SETTINGS_COLLECTION, USER_PANEL_CONTROLS_DOC);
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ ...defaultUserPanelControls, ...docSnap.data() });
    } else {
      callback(defaultUserPanelControls);
    }
  }, (error) => {
    console.error('Error subscribing to user panel controls:', error);
    callback(defaultUserPanelControls);
  });
}

/**
 * Subscribe to Platform Control changes in real-time
 * Returns an unsubscribe function
 */
export function subscribeToPlatformControls(callback: (controls: PlatformControls) => void) {
  const docRef = doc(db, SYSTEM_SETTINGS_COLLECTION, PLATFORM_CONTROLS_DOC);
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ ...defaultPlatformControls, ...docSnap.data() });
    } else {
      callback(defaultPlatformControls);
    }
  }, (error) => {
    console.error('Error subscribing to platform controls:', error);
    callback(defaultPlatformControls);
  });
}

/**
 * Check if a specific page is enabled
 * Helper function for components
 */
export function isPageEnabled(controls: UserPanelControls, pageKey: string): boolean {
  if (!controls || typeof controls[pageKey] === 'undefined') {
    return true; // Default to enabled if not specified
  }
  return controls[pageKey] === true;
}

/**
 * Check if maintenance mode is active
 * Returns true if maintenance mode is enabled
 */
export async function isMaintenanceMode() {
  const controls = await getPlatformControls();
  return controls.maintenanceMode === true;
}

/**
 * Get announcement settings
 * Returns { enabled: boolean, message: string }
 */
export async function getAnnouncementSettings() {
  const controls = await getPlatformControls();
  return {
    enabled: controls.announcementEnabled === true,
    message: controls.announcementMessage || '',
  };
}

/**
 * Check if tasks system is enabled
 */
export async function isTasksSystemEnabled() {
  const controls = await getPlatformControls();
  return controls.tasksSystemEnabled !== false;
}

/**
 * Check if withdraw system is enabled
 */
export async function isWithdrawSystemEnabled() {
  const controls = await getPlatformControls();
  return controls.withdrawSystemEnabled !== false;
}

/**
 * Get all system settings in one call
 * Useful for initial app load
 */
export async function getAllSystemSettings() {
  const [userPanelControls, platformControls] = await Promise.all([
    getUserPanelControls(),
    getPlatformControls(),
  ]);
  
  return {
    userPanelControls,
    platformControls,
  };
}
