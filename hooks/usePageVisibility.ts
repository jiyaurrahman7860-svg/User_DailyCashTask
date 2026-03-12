/**
 * usePageVisibility Hook
 * 
 * A custom React hook for checking page visibility based on User Panel Control settings.
 * Provides real-time updates when admin changes page visibility settings.
 * 
 * Features:
 * - Check if a specific page is enabled
 * - Get all enabled pages
 * - Real-time subscription to settings changes
 * - Filter navigation items based on visibility
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  subscribeToUserPanelControls,
  defaultUserPanelControls,
  type UserPanelControls,
} from '@/lib/firebase/systemSettings';

// Page route mapping to control keys
export const pageRouteToKey: { [key: string]: string } = {
  '/dashboard': 'dashboard',
  '/tasks': 'tasks',
  '/my-tasks': 'myTasks',
  '/wallet': 'wallet',
  '/withdraw': 'withdraw',
  '/referral': 'referral',
  '/friend-leaderboard': 'friendLeaderboard',
  '/rewards': 'rewards',
  '/reward-ads': 'rewardAds',
  '/leaderboard': 'leaderboard',
  '/contest': 'contest',
  '/download-app': 'downloadApp',
  '/support': 'support',
  '/profile': 'profile',
  '/login': 'login',
  '/signup': 'signUp',
  '/blog': 'blog',
  '/about': 'aboutUs',
  '/contact': 'contact',
  '/legal': 'legal',
  '/legal/privacy-policy': 'privacyPolicy',
  '/legal/terms-of-service': 'termsOfService',
  '/legal/how-it-works': 'howItWorks',
};

interface UsePageVisibilityReturn {
  controls: UserPanelControls;
  isLoading: boolean;
  isPageVisible: (route: string) => boolean;
  getVisiblePages: () => string[];
}

export function usePageVisibility(): UsePageVisibilityReturn {
  const [controls, setControls] = useState<UserPanelControls>(defaultUserPanelControls);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToUserPanelControls((newControls: UserPanelControls) => {
      setControls(newControls);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check if a specific page/route is visible
  const isPageVisible = useCallback(
    (route: string): boolean => {
      // Normalize the route
      const normalizedRoute = route.replace(/\/$/, ''); // Remove trailing slash
      
      // Get the control key for this route
      const controlKey = pageRouteToKey[normalizedRoute];
      
      // If no control key mapped, default to visible
      if (!controlKey) {
        return true;
      }
      
      // Check the control value
      return controls[controlKey] !== false;
    },
    [controls]
  );

  // Get list of all visible page keys
  const getVisiblePages = useCallback((): string[] => {
    return Object.keys(controls).filter((key) => controls[key] === true);
  }, [controls]);

  return {
    controls,
    isLoading,
    isPageVisible,
    getVisiblePages,
  };
}

/**
 * Filter navigation items based on page visibility
 * 
 * @param navigationItems - Array of navigation items with href property
 * @param controls - User panel controls object
 * @returns Filtered array of visible navigation items
 */
export function filterNavigation<T extends { href: string }>(
  navigationItems: T[],
  controls: UserPanelControls
): T[] {
  return navigationItems.filter((item) => {
    const normalizedRoute = item.href.replace(/\/$/, '');
    const controlKey = pageRouteToKey[normalizedRoute];
    
    // If no control key, item is visible by default
    if (!controlKey) {
      return true;
    }
    
    return controls[controlKey] !== false;
  });
}

/**
 * Check if a page is enabled (synchronous version)
 * Use this when you already have the controls object
 */
export function isPageEnabledSync(
  controls: UserPanelControls,
  route: string
): boolean {
  const normalizedRoute = route.replace(/\/$/, '');
  const controlKey = pageRouteToKey[normalizedRoute];
  
  if (!controlKey) {
    return true;
  }
  
  return controls[controlKey] !== false;
}
