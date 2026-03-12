/**
 * Page Access Guard Component
 * 
 * A higher-order component that guards page access based on:
 * 1. User Panel Control settings (page visibility)
 * 2. Platform Controls (maintenance mode, task/withdraw system status)
 * 3. User authentication and ban status
 * 
 * Features:
 * - Redirects to dashboard if page is disabled
 * - Redirects to maintenance page if maintenance mode is on
 * - Shows disabled message for task/withdraw systems
 * - Shows loading state while checking permissions
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { RefreshCw, AlertTriangle, Construction } from 'lucide-react';
import { auth, db } from '@/lib/firebase/config';
import {
  subscribeToUserPanelControls,
  subscribeToPlatformControls,
  defaultUserPanelControls,
  type UserPanelControls,
  type PlatformControls,
} from '@/lib/firebase/systemSettings';
import { pageRouteToKey } from '@/hooks/usePageVisibility';

interface PageAccessGuardProps {
  children: React.ReactNode;
  requiredAuth?: boolean;
  allowedDuringMaintenance?: boolean;
}

export default function PageAccessGuard({
  children,
  requiredAuth = true,
  allowedDuringMaintenance = false,
}: PageAccessGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [disabledMessage, setDisabledMessage] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeUserPanel: (() => void) | null = null;
    let unsubscribePlatform: (() => void) | null = null;

    const checkAccess = async () => {
      const normalizedRoute = pathname?.replace(/\/+$/, '') || '';
      
      // Define public routes that don't need auth
      const publicRoutes = ['/login', '/signup', '/about', '/blog', '/contact', '/legal', '/maintenance', '/banned'];
      const isPublicRoute = publicRoutes.some(route => normalizedRoute.startsWith(route)) || normalizedRoute === '';

      // Subscribe to user panel controls
      unsubscribeUserPanel = subscribeToUserPanelControls((controls: UserPanelControls) => {
        // Check page visibility (skip for public routes that aren't in the controls)
        const controlKey = pageRouteToKey[normalizedRoute];
        
        if (controlKey && controls[controlKey] === false) {
          // Page is disabled, redirect to dashboard
          router.push('/dashboard');
          return;
        }
      });

      // Subscribe to platform controls
      unsubscribePlatform = subscribeToPlatformControls((platformControls: PlatformControls) => {
        // Check maintenance mode (skip for public routes)
        if (platformControls.maintenanceMode && !allowedDuringMaintenance && !isPublicRoute) {
          router.push('/maintenance');
          return;
        }

        // Check task system for task-related pages
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

        setIsAuthorized(true);
        setIsLoading(false);
      });

      // Check auth if required and not a public route
      if (requiredAuth && !isPublicRoute) {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
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

        return () => unsubscribeAuth();
      } else {
        // For public routes, just mark as authorized
        setIsAuthorized(true);
        setIsLoading(false);
      }
    };

    checkAccess();

    return () => {
      if (unsubscribeUserPanel) unsubscribeUserPanel();
      if (unsubscribePlatform) unsubscribePlatform();
    };
  }, [pathname, router, requiredAuth, allowedDuringMaintenance]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  // Show disabled message if system is disabled
  if (disabledMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-yellow-100 rounded-full">
              <Construction className="h-12 w-12 text-yellow-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Temporarily Unavailable
          </h1>
          <p className="text-gray-600 mb-6">{disabledMessage}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Simple hook to check if maintenance mode is active
 * Useful for components that need to know maintenance status
 */
export function useMaintenanceCheck() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToPlatformControls((controls: PlatformControls) => {
      setIsMaintenanceMode(controls.maintenanceMode === true);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { isMaintenanceMode, isLoading };
}

/**
 * Simple hook to check system status (tasks/withdraw)
 * Useful for showing disabled states in UI
 */
export function useSystemStatus() {
  const [tasksEnabled, setTasksEnabled] = useState(true);
  const [withdrawEnabled, setWithdrawEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToPlatformControls((controls: PlatformControls) => {
      setTasksEnabled(controls.tasksSystemEnabled !== false);
      setWithdrawEnabled(controls.withdrawSystemEnabled !== false);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { tasksEnabled, withdrawEnabled, isLoading };
}
