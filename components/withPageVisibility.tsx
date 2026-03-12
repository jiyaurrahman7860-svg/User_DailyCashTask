/**
 * withPageVisibility HOC
 * 
 * Higher Order Component that checks if a page is enabled before rendering.
 * If the page is disabled by admin, redirects user to dashboard.
 * 
 * Usage:
 *   export default withPageVisibility(WalletPage, 'wallet');
 * 
 * @param WrappedComponent - The page component to wrap
 * @param pageKey - The key identifying this page in UserPanelControls
 * @returns Wrapped component with visibility check
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { usePageVisibility } from '@/hooks/usePageVisibility';

interface WithPageVisibilityOptions {
  redirectTo?: string;
  showLoading?: boolean;
}

export function withPageVisibility<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  pageKey: string,
  options: WithPageVisibilityOptions = {}
) {
  const { redirectTo = '/dashboard', showLoading = true } = options;

  return function PageVisibilityWrapper(props: P) {
    const router = useRouter();
    const { controls, isLoading } = usePageVisibility();
    const [isVisible, setIsVisible] = useState<boolean | null>(null);

    useEffect(() => {
      if (!isLoading) {
        const pageEnabled = controls[pageKey] !== false;
        setIsVisible(pageEnabled);

        if (!pageEnabled) {
          // Page is disabled, redirect to dashboard
          router.replace(redirectTo);
        }
      }
    }, [controls, isLoading, router, redirectTo, pageKey]);

    // Show loading state while checking visibility
    if (isLoading || isVisible === null) {
      if (showLoading) {
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        );
      }
      return null;
    }

    // Page is disabled, don't render (will redirect)
    if (!isVisible) {
      return null;
    }

    // Page is enabled, render the wrapped component
    return <WrappedComponent {...props} />;
  };
}

/**
 * Simpler hook-based approach for functional components
 * Usage:
 *   const isVisible = usePageCheck('wallet');
 *   if (!isVisible) return null;
 */
export function usePageCheck(pageKey: string): boolean | null {
  const { controls, isLoading } = usePageVisibility();
  
  if (isLoading) return null;
  return controls[pageKey] !== false;
}
