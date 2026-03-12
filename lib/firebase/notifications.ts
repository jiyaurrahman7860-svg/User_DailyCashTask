import { db } from './config';
import { collection, addDoc, query, where, orderBy, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth } from './config';

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'reward' | 'wallet' | 'contest' | 'system' | 'general';
  read: boolean;
  createdAt: Timestamp;
}

// Create a new notification
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: Notification['type'] = 'general'
): Promise<{ success: boolean; notificationId?: string; error?: string }> => {
  try {
    const notificationData: Omit<Notification, 'id'> = {
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'notifications'), notificationData);

    return { success: true, notificationId: docRef.id };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: 'Failed to create notification' };
  }
};

// Get user's notifications
export const getUserNotifications = async (): Promise<Notification[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notification));
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (
  notificationId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: 'Failed to mark notification as read' };
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return 0;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};
