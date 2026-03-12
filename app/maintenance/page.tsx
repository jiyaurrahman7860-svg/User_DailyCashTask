/**
 * Maintenance Mode Page - DailyCashTask
 * 
 * This page is displayed when the admin activates maintenance mode.
 * All user traffic is redirected here when maintenance mode is enabled.
 * 
 * Features:
 * - Displays maintenance message with modern UI
 * - Auto-checks maintenance status and redirects when disabled
 * - Animated progress indicator
 * - Professional fintech-style design matching the platform
 * 
 * Refactored: Branding updated from DailyTaskPay to DailyCashTask
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  RefreshCw, 
  Clock, 
  Zap,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { subscribeToPlatformControls } from '@/lib/firebase/systemSettings';

export default function MaintenancePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Subscribe to platform controls to detect when maintenance mode is turned off
  useEffect(() => {
    const unsubscribe = subscribeToPlatformControls((controls) => {
      setIsChecking(false);
      setLastUpdated(new Date());
      
      // If maintenance mode is disabled, redirect to home
      if (!controls.maintenanceMode) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Auto-refresh countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    setIsChecking(true);
    setCountdown(30);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-lg w-full">
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-primary to-blue-600 p-8 text-center">
            {/* Animated Icon */}
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
              <div className="relative p-4 bg-white/20 rounded-full backdrop-blur-sm">
                <Settings className="h-12 w-12 text-white animate-spin-slow" />
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              System Maintenance
            </h1>
            <p className="text-white/80 text-sm">
              DailyCashTask is being upgraded
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500" />
              </span>
              <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wide">
                Maintenance in Progress
              </span>
            </div>

            {/* Message */}
            <div className="text-center space-y-2">
              <p className="text-gray-300 text-lg">
                We're making DailyCashTask even better for you!
              </p>
              <p className="text-gray-400 text-sm">
                Our team is working on improvements to provide you with a faster, 
                more secure, and feature-rich experience.
              </p>
            </div>

            {/* Features Being Updated */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Zap, label: 'Performance' },
                { icon: CheckCircle2, label: 'Security' },
                { icon: Clock, label: 'Speed' },
                { icon: AlertCircle, label: 'Stability' }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10"
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm text-gray-300">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>System Status</span>
                <span>Updating...</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full animate-pulse"
                  style={{ width: '75%' }}
                />
              </div>
            </div>

            {/* Auto Refresh Info */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <RefreshCw className={`h-5 w-5 text-primary ${isChecking ? 'animate-spin' : ''}`} />
                <div>
                  <p className="text-sm text-gray-300">Auto-refresh in</p>
                  <p className="text-xs text-gray-400">{countdown}s</p>
                </div>
              </div>
              <button
                onClick={handleManualRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Refresh
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Estimated Time */}
            <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-xl border border-primary/20">
              <p className="text-sm text-gray-400 mb-1">Estimated Completion</p>
              <p className="text-lg font-semibold text-white">Soon</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-white/5 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-400">
              <p>
                © {new Date().getFullYear()} DailyCashTask. All rights reserved.
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Last checked: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Support Link */}
        <p className="text-center mt-6 text-sm text-gray-400">
          Need help? Contact us at{' '}
          <a 
            href="mailto:support@dailycashtask.com" 
            className="text-primary hover:underline"
          >
            support@dailycashtask.com
          </a>
        </p>
      </div>
    </div>
  );
}
