/**
 * formatTime Utility
 * 
 * Provides functions for formatting timestamps in a user-friendly way.
 * Used for displaying activity timestamps like "2 minutes ago", "Today 14:32", etc.
 * 
 * Features:
 * - Relative time formatting (e.g., "2 minutes ago")
 * - Absolute time formatting (e.g., "Today 14:32", "12 Mar 2026 10:15 AM")
 * - Firestore Timestamp handling
 */

/**
 * Format a date to relative time (e.g., "2 minutes ago", "Just now", "Yesterday")
 * @param date - Date to format (Date object, Firestore Timestamp, or string)
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: Date | string | { toDate?: () => Date } | null | undefined): string {
  if (!date) return 'Unknown';

  // Handle Firestore Timestamp
  let parsedDate: Date;
  if (typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
    parsedDate = date.toDate();
  } else if (date instanceof Date) {
    parsedDate = date;
  } else {
    parsedDate = new Date(date as string);
  }

  if (isNaN(parsedDate.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - parsedDate.getTime()) / 1000);

  // Less than a minute
  if (diffInSeconds < 60) {
    return 'Just now';
  }

  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  // Less than 7 days
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    if (days === 1) {
      return 'Yesterday';
    }
    return `${days} days ago`;
  }

  // Less than 30 days - show day and month
  if (diffInSeconds < 2592000) {
    return formatAbsoluteDate(parsedDate, 'short');
  }

  // More than 30 days - show full date
  return formatAbsoluteDate(parsedDate, 'full');
}

/**
 * Format a date to absolute time format
 * @param date - Date to format
 * @param format - Format style: 'short' (12 Mar), 'medium' (12 Mar 2026), 'full' (12 Mar 2026 10:15 AM)
 * @returns Formatted date string
 */
export function formatAbsoluteDate(
  date: Date | string | { toDate?: () => Date } | null | undefined,
  format: 'short' | 'medium' | 'full' = 'medium'
): string {
  if (!date) return 'Unknown';

  // Handle Firestore Timestamp
  let parsedDate: Date;
  if (typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
    parsedDate = date.toDate();
  } else if (date instanceof Date) {
    parsedDate = date;
  } else {
    parsedDate = new Date(date as string);
  }

  if (isNaN(parsedDate.getTime())) {
    return 'Invalid date';
  }

  const today = new Date();
  const isToday = parsedDate.toDateString() === today.toDateString();
  
  // Check if yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = parsedDate.toDateString() === yesterday.toDateString();

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = parsedDate.getDate();
  const month = months[parsedDate.getMonth()];
  const year = parsedDate.getFullYear();
  
  const hours = parsedDate.getHours();
  const minutes = parsedDate.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  // Today - show time only
  if (isToday && format !== 'full') {
    return `Today ${displayHours}:${minutes} ${ampm}`;
  }

  // Yesterday - show Yesterday + time
  if (isYesterday && format !== 'full') {
    return `Yesterday ${displayHours}:${minutes} ${ampm}`;
  }

  switch (format) {
    case 'short':
      return `${day} ${month}`;
    case 'medium':
      return `${day} ${month} ${year}`;
    case 'full':
      return `${day} ${month} ${year} ${displayHours}:${minutes} ${ampm}`;
    default:
      return `${day} ${month} ${year}`;
  }
}

/**
 * Format a timestamp for display in activity lists
 * Shows relative time for recent events, absolute time for older events
 * @param date - Date to format
 * @returns Formatted timestamp string suitable for activity display
 */
export function formatActivityTimestamp(date: Date | string | { toDate?: () => Date } | null | undefined): string {
  if (!date) return 'Unknown';

  // Handle Firestore Timestamp
  let parsedDate: Date;
  if (typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
    parsedDate = date.toDate();
  } else if (date instanceof Date) {
    parsedDate = date;
  } else {
    parsedDate = new Date(date as string);
  }

  if (isNaN(parsedDate.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - parsedDate.getTime()) / 1000);

  // For recent events (less than 24 hours), show relative time
  if (diffInSeconds < 86400) {
    return formatRelativeTime(parsedDate);
  }

  // For older events, show absolute date with time
  return formatAbsoluteDate(parsedDate, 'full');
}

/**
 * Convert Firestore timestamp to Date object
 * @param timestamp - Firestore timestamp or any date value
 * @returns Date object or null if invalid
 */
export function toDate(timestamp: unknown): Date | null {
  if (!timestamp) return null;

  if (timestamp instanceof Date) {
    return timestamp;
  }

  if (typeof timestamp === 'object' && timestamp !== null) {
    // Firestore Timestamp
    if ('toDate' in timestamp && typeof (timestamp as { toDate: () => Date }).toDate === 'function') {
      return (timestamp as { toDate: () => Date }).toDate();
    }
    // Seconds and nanoseconds format
    if ('seconds' in timestamp && typeof (timestamp as { seconds: number }).seconds === 'number') {
      return new Date((timestamp as { seconds: number }).seconds * 1000);
    }
  }

  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export default {
  formatRelativeTime,
  formatAbsoluteDate,
  formatActivityTimestamp,
  toDate,
};
