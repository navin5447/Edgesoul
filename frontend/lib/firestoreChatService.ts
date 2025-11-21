// Firestore Chat Service - Save and retrieve chat messages
import { db } from './firebaseConfig';
import { collection, addDoc, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

export interface ChatMessage {
  id?: string;
  userId: string;
  message: string;
  response: string;
  emotion?: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    responseTime?: number;
  };
}

export class FirestoreChatService {
  /**
   * Save a chat message to Firestore
   */
  static async saveMessage(
    userId: string,
    message: string,
    response: string,
    emotion?: string,
    metadata?: any
  ): Promise<string> {
    try {
      const chatData = {
        userId,
        message,
        response,
        emotion: emotion || 'neutral',
        timestamp: Timestamp.now(),
        metadata: metadata || {},
      };

      const docRef = await addDoc(
        collection(db, 'users', userId, 'chats'),
        chatData
      );

      return docRef.id;
    } catch (error: any) {
      // Handle offline error gracefully
      if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
        console.warn('Firebase is offline - message will be saved when connection is restored');
        return 'offline-pending';
      }
      console.error('Error saving message:', error);
      // Don't throw - allow chat to continue even if save fails
      return 'error';
    }
  }

  /**
   * Get chat history for a user
   */
  static async getChatHistory(
    userId: string,
    limitCount: number = 50
  ): Promise<ChatMessage[]> {
    try {
      const chatsRef = collection(db, 'users', userId, 'chats');
      const q = query(chatsRef, orderBy('timestamp', 'desc'), limit(limitCount));
      const querySnapshot = await getDocs(q);

      const messages: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          userId: data.userId,
          message: data.message,
          response: data.response,
          emotion: data.emotion,
          timestamp: data.timestamp.toDate(),
          metadata: data.metadata,
        });
      });

      return messages.reverse(); // Return oldest first
    } catch (error: any) {
      // Handle offline error gracefully
      if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
        console.warn('Firebase is offline - returning empty chat history');
        return [];
      }
      console.error('Error fetching chat history:', error);
      return []; // Return empty array instead of throwing
    }
  }

  /**
   * Get emotion statistics for a user
   */
  static async getEmotionStats(userId: string): Promise<Record<string, number>> {
    try {
      const chatsRef = collection(db, 'users', userId, 'chats');
      const querySnapshot = await getDocs(chatsRef);

      const emotionCounts: Record<string, number> = {};

      querySnapshot.forEach((doc) => {
        const emotion = doc.data().emotion || 'neutral';
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });

      return emotionCounts;
    } catch (error: any) {
      // Handle offline error gracefully
      if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
        console.warn('Firebase is offline - returning empty emotion stats');
        return {};
      }
      console.error('Error fetching emotion stats:', error);
      return {};
    }
  }

  /**
   * Get total conversation count
   */
  static async getConversationCount(userId: string): Promise<number> {
    try {
      const chatsRef = collection(db, 'users', userId, 'chats');
      const querySnapshot = await getDocs(chatsRef);
      return querySnapshot.size;
    } catch (error: any) {
      // Handle offline error gracefully
      if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
        console.warn('Firebase is offline - returning 0 for conversation count');
      } else {
        console.error('Error getting conversation count:', error);
      }
      return 0;
    }
  }
}
