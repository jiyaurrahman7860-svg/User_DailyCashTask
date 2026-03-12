/**
 * Global Announcement Banner Component
 * 
 * Displays a global announcement banner at the top of the website
 * when the admin enables it from Platform Controls.
 * 
 * Features:
 * - Shows/hides based on platform controls setting
 * - Displays custom message from admin
 * - Auto-updates when settings change
 * - Can be dismissed by user (optional enhancement)
 */

'use client';

import { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';
import { subscribeToPlatformControls, type PlatformControls } from '@/lib/firebase/systemSettings';

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<{ enabled: boolean; message: string }>({
    enabled: false,
    message: '',
  });
  const [isDismissed, setIsDismissed] = useState(false);

  // Subscribe to platform controls for real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToPlatformControls((controls: PlatformControls) => {
      setAnnouncement({
        enabled: controls.announcementEnabled === true,
        message: controls.announcementMessage || '',
      });
    });

    return () => unsubscribe();
  }, []);

  // Check localStorage for dismissed state (session-based)
  useEffect(() => {
    const dismissed = sessionStorage.getItem('announcementDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('announcementDismissed', 'true');
  };

  // Don't render if not enabled, no message, or dismissed
  if (!announcement.enabled || !announcement.message || isDismissed) {
    return null;
  }

  return (
    <div className="bg-blue-600 text-white py-2 px-4 relative">
      <div className="container mx-auto flex items-center justify-center gap-2">
        <Megaphone className="h-4 w-4 flex-shrink-0" />
        <p className="text-sm font-medium text-center">
          {announcement.message}
        </p>
        <button
          onClick={handleDismiss}
          className="ml-4 p-1 hover:bg-blue-700 rounded transition-colors flex-shrink-0"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
