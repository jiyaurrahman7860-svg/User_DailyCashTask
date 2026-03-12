import { db, storage } from './config';
import { collection, addDoc, query, where, orderBy, getDocs, doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from './config';

export interface SupportTicket {
  id?: string;
  userId: string;
  email: string;
  subject: string;
  message: string;
  screenshot?: string | null;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  replies: TicketReply[];
}

export interface TicketReply {
  id: string;
  userId: string;
  isAdmin: boolean;
  message: string;
  timestamp: Timestamp;
}

// Create a new support ticket
export const createTicket = async (
  subject: string,
  message: string,
  screenshotFile?: File
): Promise<{ success: boolean; ticketId?: string; error?: string }> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    let screenshotUrl = '';
    
    // Upload screenshot if provided
    if (screenshotFile) {
      const storageRef = ref(storage, `supportScreenshots/${user.uid}/${Date.now()}_${screenshotFile.name}`);
      await uploadBytes(storageRef, screenshotFile);
      screenshotUrl = await getDownloadURL(storageRef);
    }

    const ticketData: Omit<SupportTicket, 'id'> = {
      userId: user.uid,
      email: user.email || '',
      subject,
      message,
      screenshot: screenshotUrl || null,
      status: 'open',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      replies: []
    };

    const docRef = await addDoc(collection(db, 'supportTickets'), ticketData);

    return { success: true, ticketId: docRef.id };
  } catch (error) {
    console.error('Error creating ticket:', error);
    return { success: false, error: 'Failed to create ticket' };
  }
};

// Get user's tickets
export const getUserTickets = async (status?: string): Promise<SupportTicket[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    let q = query(
      collection(db, 'supportTickets'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    if (status) {
      q = query(q, where('status', '==', status));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SupportTicket));
  } catch (error) {
    console.error('Error getting tickets:', error);
    return [];
  }
};

// Reply to a ticket
export const replyToTicket = async (
  ticketId: string,
  message: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const ticketRef = doc(db, 'supportTickets', ticketId);
    
    const reply: TicketReply = {
      id: Date.now().toString(),
      userId: user.uid,
      isAdmin: false,
      message,
      timestamp: Timestamp.now()
    };

    await updateDoc(ticketRef, {
      replies: arrayUnion(reply),
      updatedAt: Timestamp.now()
    });

    return { success: true };
  } catch (error) {
    console.error('Error replying to ticket:', error);
    return { success: false, error: 'Failed to send reply' };
  }
};
