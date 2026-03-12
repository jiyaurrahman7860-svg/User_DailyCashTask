/**
 * ScrollRefreshProvider Component
 * 
 * A provider component that adds visual feedback for the scroll-to-refresh functionality.
 * Shows a refresh indicator and last updated timestamp when auto-refresh is triggered.
 * 
 * This component should be placed in the app layout to provide global scroll-to-refresh UI.
 * 
 * @example
 * // In layout.tsx
 * <ScrollRefreshProvider>
 *   {children}
 * </ScrollRefreshProvider>
 */

'use client';

import React from 'react';

interface ScrollRefreshProviderProps {
  children: React.ReactNode;
  /** Whether refresh is in progress */
  isRefreshing: boolean;
  /** Timestamp of last refresh */
  lastRefreshTime: Date | null;
  /** Callback to trigger manual refresh */
  onManualRefresh: () => void;
  /** Whether current route is excluded from auto-refresh */
  isExcluded: boolean;
}

export function ScrollRefreshProvider({
  children,
  isRefreshing,
  lastRefreshTime,
  onManualRefresh,
  isExcluded,
}: ScrollRefreshProviderProps) {
  return (
    <>
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
            onClick={onManualRefresh}
            className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Click to refresh data"
          >
            Last updated: {lastRefreshTime.toLocaleTimeString()}
          </button>
        </div>
      )}
    </>
  );
}

export default ScrollRefreshProvider;
