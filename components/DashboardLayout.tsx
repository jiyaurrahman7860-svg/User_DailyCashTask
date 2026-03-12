/**
 * DashboardLayout Component
 * 
 * A layout wrapper for User Panel dashboard pages that integrates:
 * - PageAccessGuard: Controls access based on system settings
 * - AnnouncementBanner: Shows global announcements from admin
 * - FilteredNavigation: Filters sidebar based on page visibility settings
 * - MaintenanceCheck: Redirects to maintenance page when enabled
 * 
 * This component should wrap all user dashboard pages to enforce
 * the User Panel Control and Platform Control settings.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import {
  subscribeToPlatformControls,
  subscribeToUserPanelControls,
  type PlatformControls,
  type UserPanelControls,
} from '@/lib/firebase/systemSettings';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import { pageRouteToKey } from '@/hooks/usePageVisibility';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// System Disabled Message component
function SystemDisabledMessage({ message, onNavigate }: { message: string; onNavigate: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Temporarily Unavailable
        </h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={onNavigate}
          className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [disabledMessage, setDisabledMessage] = useState<string | null>(null);
  const [userPanelControls, setUserPanelControls] = useState<UserPanelControls | null>(null);

  useEffect(() => {
    let unsubscribePlatform: (() => void) | null = null;
    let unsubscribeUserPanel: (() => void) | null = null;
    let unsubscribeAuth: (() => void) | null = null;

    const initializeLayout = async () => {
      // Subscribe to platform controls
      unsubscribePlatform = subscribeToPlatformControls((platformControls: PlatformControls) => {
        // Check maintenance mode
        if (platformControls.maintenanceMode) {
          router.push('/maintenance');
          return;
        }

        // Check task system for task-related pages
        const normalizedRoute = pathname?.replace(/\/$/, '') || '';
        if (
          !platformControls.tasksSystemEnabled &&
          (normalizedRoute === '/tasks' || 
           normalizedRoute === '/my-tasks' || 
           normalizedRoute === '/rewards')
        ) {
          setDisabledMessage('Tasks are temporarily unavailable. Please check back later.');
        }

        // Check withdraw system for withdraw page
        if (!platformControls.withdrawSystemEnabled && normalizedRoute === '/withdraw') {
          setDisabledMessage('Withdrawals are temporarily disabled.');
        }
      });

      // Subscribe to user panel controls
      unsubscribeUserPanel = subscribeToUserPanelControls((controls: UserPanelControls) => {
        setUserPanelControls(controls);
        
        // Check page visibility
        const normalizedRoute = pathname?.replace(/\/$/, '') || '';
        const controlKey = pageRouteToKey[normalizedRoute];
        
        if (controlKey && controls[controlKey] === false) {
          // Page is disabled, redirect to dashboard
          router.push('/dashboard');
          return;
        }

        setIsAuthorized(true);
        setIsLoading(false);
      });

      // Check authentication
      unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          router.push('/login');
          return;
        }

        // Check if user is banned
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        if (userData?.isBanned) {
          router.push('/banned');
          return;
        }
      });
    };

    initializeLayout();

    return () => {
      if (unsubscribePlatform) unsubscribePlatform();
      if (unsubscribeUserPanel) unsubscribeUserPanel();
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, [pathname, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (disabledMessage) {
    return (
      <SystemDisabledMessage
        message={disabledMessage}
        onNavigate={() => router.push('/dashboard')}
      />
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Announcement Banner */}
      <AnnouncementBanner />
      
      {/* Main Content */}
      {children}
    </div>
  );
}

/**
 * Higher-Order Component version for wrapping pages
 * Usage: export default withDashboardLayout(PageComponent)
 */
export function withDashboardLayout<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function WrappedComponent(props: P) {
    return (
      <DashboardLayout>
        <Component {...props} />
      </DashboardLayout>
    );
  };
}
