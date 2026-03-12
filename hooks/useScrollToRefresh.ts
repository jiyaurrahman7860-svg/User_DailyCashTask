/**
 * useScrollToRefresh Hook
 * 
 * A custom React hook that implements "scroll down to reload" functionality.
 * Automatically refreshes page data when user scrolls to the bottom of the page.
 * Excludes the Reward Ads page to avoid interrupting ad sessions.
 * 
 * Features:
 * - Detects when user scrolls to bottom of page
 * - Triggers refresh callback with debounce
 * - Excludes specific routes (e.g., /reward-ads)
 * - Shows visual feedback during refresh
 * - Works across all user panel pages
 * 
 * @example
 * const { isRefreshing, lastRefreshTime } = useScrollToRefresh({
 *   onRefresh: fetchData,
 *   excludeRoutes: ['/reward-ads'],
 *   threshold: 100
 * });
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface UseScrollToRefreshOptions {
  /** Callback function to trigger when refresh is requested */
  onRefresh: () => Promise<void> | void;
  /** Routes to exclude from auto-refresh (e.g., ['/reward-ads']) */
  excludeRoutes?: string[];
  /** Distance from bottom (in pixels) to trigger refresh. Default: 100 */
  threshold?: number;
  /** Minimum time between refreshes (in ms). Default: 5000 */
  cooldownPeriod?: number;
  /** Enable/disable the hook. Default: true */
  enabled?: boolean;
}

interface UseScrollToRefreshReturn {
  /** Whether a refresh is currently in progress */
  isRefreshing: boolean;
  /** Timestamp of the last successful refresh */
  lastRefreshTime: Date | null;
  /** Manually trigger a refresh */
  manualRefresh: () => Promise<void>;
  /** Whether the current route is excluded */
  isExcluded: boolean;
}

export function useScrollToRefresh({
  onRefresh,
  excludeRoutes = ['/reward-ads'],
  threshold = 100,
  cooldownPeriod = 5000,
  enabled = true,
}: UseScrollToRefreshOptions): UseScrollToRefreshReturn {
  const pathname = usePathname();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const lastRefreshRef = useRef<number>(0);
  const isRefreshingRef = useRef(false);

  // Check if current route is excluded
  const isExcluded = excludeRoutes.some(route => 
    pathname?.startsWith(route) || pathname === route
  );

  // Manual refresh function
  const manualRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    
    try {
      await onRefresh();
      const now = Date.now();
      lastRefreshRef.current = now;
      setLastRefreshTime(new Date(now));
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  // Scroll detection effect
  useEffect(() => {
    if (!enabled || isExcluded) return;

    const handleScroll = async () => {
      // Don't trigger if already refreshing
      if (isRefreshingRef.current) return;

      // Check cooldown period
      const now = Date.now();
      if (now - lastRefreshRef.current < cooldownPeriod) return;

      // Calculate scroll position
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight || document.documentElement.clientHeight;
      
      // Check if scrolled to bottom (within threshold)
      const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - threshold;

      if (scrolledToBottom) {
        isRefreshingRef.current = true;
        setIsRefreshing(true);

        try {
          await onRefresh();
          lastRefreshRef.current = Date.now();
          setLastRefreshTime(new Date());
        } catch (error) {
          console.error('Auto-refresh failed:', error);
        } finally {
          isRefreshingRef.current = false;
          setIsRefreshing(false);
        }
      }
    };

    // Use requestAnimationFrame for smooth scroll detection
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener, { passive: true });

    return () => {
      window.removeEventListener('scroll', scrollListener);
    };
  }, [enabled, isExcluded, onRefresh, threshold, cooldownPeriod]);

  return {
    isRefreshing,
    lastRefreshTime,
    manualRefresh,
    isExcluded,
  };
}

export default useScrollToRefresh;
