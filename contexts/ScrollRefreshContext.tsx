/**
 * ScrollRefreshContext
 * 
 * A context that provides scroll-to-refresh functionality across the User Panel.
 * Pages can register their refresh callback, and the context handles the scroll detection
 * and visual feedback. Automatically excludes /reward-ads route.
 * 
 * Usage:
 * 1. Wrap your app with ScrollRefreshProvider in layout.tsx
 * 2. In each page, call useRegisterScrollRefresh(refreshCallback) to register the refresh function
 */

'use client';

import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Context type definition
interface ScrollRefreshContextType {
  /** Register a refresh callback for the current page */
  registerRefresh: (callback: () => Promise<void> | void) => void;
  /** Unregister the refresh callback */
  unregisterRefresh: () => void;
  /** Whether refresh is currently in progress */
  isRefreshing: boolean;
  /** Timestamp of last refresh */
  lastRefreshTime: Date | null;
  /** Manually trigger a refresh */
  manualRefresh: () => Promise<void>;
}

// Create context with default values
const ScrollRefreshContext = createContext<ScrollRefreshContextType | undefined>(undefined);

// Hook options interface
interface UseScrollRefreshProviderOptions {
  /** Routes to exclude from auto-refresh. Default: ['/reward-ads'] */
  excludeRoutes?: string[];
  /** Distance from bottom (in pixels) to trigger refresh. Default: 100 */
  threshold?: number;
  /** Minimum time between refreshes (in ms). Default: 5000 */
  cooldownPeriod?: number;
  /** Enable/disable the feature. Default: true */
  enabled?: boolean;
}

/**
 * Provider component that wraps the app and provides scroll-to-refresh functionality
 */
export function ScrollRefreshProvider({
  children,
  options = {},
}: {
  children: React.ReactNode;
  options?: UseScrollRefreshProviderOptions;
}) {
  const pathname = usePathname();
  const refreshCallbackRef = useRef<(() => Promise<void> | void) | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const lastRefreshTimestampRef = useRef<number>(0);

  const {
    excludeRoutes = ['/reward-ads'],
    threshold = 100,
    cooldownPeriod = 5000,
    enabled = true,
  } = options;

  // Check if current route is excluded
  const isExcluded = excludeRoutes.some(route => 
    pathname?.startsWith(route) || pathname === route
  );

  // Register refresh callback
  const registerRefresh = useCallback((callback: () => Promise<void> | void) => {
    refreshCallbackRef.current = callback;
  }, []);

  // Unregister refresh callback
  const unregisterRefresh = useCallback(() => {
    refreshCallbackRef.current = null;
  }, []);

  // Manual refresh function
  const manualRefresh = useCallback(async () => {
    if (!refreshCallbackRef.current || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await refreshCallbackRef.current();
      const now = Date.now();
      lastRefreshTimestampRef.current = now;
      setLastRefreshTime(new Date(now));
    } catch (error) {
      console.error('Manual refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // Scroll detection effect
  useEffect(() => {
    if (!enabled || isExcluded) return;

    const handleScroll = async () => {
      // Don't trigger if already refreshing or no callback registered
      if (isRefreshing || !refreshCallbackRef.current) return;

      // Check cooldown period
      const now = Date.now();
      if (now - lastRefreshTimestampRef.current < cooldownPeriod) return;

      // Calculate scroll position
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight || document.documentElement.clientHeight;
      
      // Check if scrolled to bottom (within threshold)
      const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - threshold;

      if (scrolledToBottom) {
        setIsRefreshing(true);

        try {
          await refreshCallbackRef.current();
          lastRefreshTimestampRef.current = Date.now();
          setLastRefreshTime(new Date());
        } catch (error) {
          console.error('Auto-refresh failed:', error);
        } finally {
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
  }, [enabled, isExcluded, isRefreshing, threshold, cooldownPeriod]);

  const contextValue: ScrollRefreshContextType = {
    registerRefresh,
    unregisterRefresh,
    isRefreshing,
    lastRefreshTime,
    manualRefresh,
  };

  return (
    <ScrollRefreshContext.Provider value={contextValue}>
      {children}
      
      {/* Refresh indicator overlay */}
      {isRefreshing && !isExcluded && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-[#1745FF] text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
            <svg 
              className="animate-spin h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm font-medium">Refreshing...</span>
          </div>
        </div>
      )}

      {/* Last refresh timestamp indicator */}
      {lastRefreshTime && !isRefreshing && !isExcluded && (
        <div className="fixed bottom-4 right-4 z-40 opacity-50 hover:opacity-100 transition-opacity">
          <button 
            onClick={manualRefresh}
            className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Click to refresh data"
          >
            Last updated: {lastRefreshTime.toLocaleTimeString()}
          </button>
        </div>
      )}
    </ScrollRefreshContext.Provider>
  );
}

/**
 * Hook to access scroll refresh context
 */
export function useScrollRefreshContext(): ScrollRefreshContextType {
  const context = useContext(ScrollRefreshContext);
  if (context === undefined) {
    throw new Error('useScrollRefreshContext must be used within a ScrollRefreshProvider');
  }
  return context;
}

/**
 * Hook to register a refresh callback for the current page
 * Call this in your page component to enable scroll-to-refresh
 * 
 * @example
 * function MyPage() {
 *   const fetchData = useCallback(async () => {
 *     // Fetch your data here
 *   }, []);
 *   
 *   useRegisterScrollRefresh(fetchData);
 *   
 *   return <div>Page content</div>;
 * }
 */
export function useRegisterScrollRefresh(
  refreshCallback: () => Promise<void> | void,
  deps: React.DependencyList = []
) {
  const { registerRefresh, unregisterRefresh } = useScrollRefreshContext();

  useEffect(() => {
    registerRefresh(refreshCallback);
    return () => {
      unregisterRefresh();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default ScrollRefreshProvider;
