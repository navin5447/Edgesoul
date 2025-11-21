// Chat Storage - IndexedDB for offline chat history
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ChatMessage {
  id?: number;
  userId: string;
  userMessage: string;
  aiResponse: string;
  emotion: string;
  timestamp: number;
}

interface ChatDB extends DBSchema {
  chats: {
    key: number;
    value: ChatMessage;
    indexes: { 'by-user': string; 'by-timestamp': number };
  };
}

let dbPromise: Promise<IDBPDatabase<ChatDB>> | null = null;

// Initialize IndexedDB
function getDB(): Promise<IDBPDatabase<ChatDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ChatDB>('edgesoul-chats', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('chats')) {
          const chatStore = db.createObjectStore('chats', {
            keyPath: 'id',
            autoIncrement: true,
          });
          chatStore.createIndex('by-user', 'userId');
          chatStore.createIndex('by-timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
}

// Save a chat message
export async function saveChatMessage(
  userId: string,
  userMessage: string,
  aiResponse: string,
  emotion: string = 'neutral'
): Promise<number> {
  const db = await getDB();
  const chat: ChatMessage = {
    userId,
    userMessage,
    aiResponse,
    emotion,
    timestamp: Date.now(),
  };
  return await db.add('chats', chat);
}

// Get all chat history for a user
export async function getAllChatHistory(userId: string): Promise<ChatMessage[]> {
  const db = await getDB();
  const tx = db.transaction('chats', 'readonly');
  const index = tx.store.index('by-user');
  const chats = await index.getAll(userId);
  
  // Sort by timestamp descending (newest first)
  return chats.sort((a, b) => b.timestamp - a.timestamp);
}

// Get recent chat history (last N messages)
export async function getRecentChatHistory(
  userId: string,
  limit: number = 50
): Promise<ChatMessage[]> {
  const allChats = await getAllChatHistory(userId);
  return allChats.slice(0, limit);
}

// Get chat history by date range
export async function getChatHistoryByDateRange(
  userId: string,
  startDate: number,
  endDate: number
): Promise<ChatMessage[]> {
  const allChats = await getAllChatHistory(userId);
  return allChats.filter(
    (chat) => chat.timestamp >= startDate && chat.timestamp <= endDate
  );
}

// Delete a specific chat message
export async function deleteChatMessage(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('chats', id);
}

// Delete all chat history for a user
export async function deleteAllChatHistory(userId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('chats', 'readwrite');
  const index = tx.store.index('by-user');
  const chats = await index.getAllKeys(userId);
  
  for (const key of chats) {
    await tx.store.delete(key);
  }
  
  await tx.done;
}

// Get chat count for a user
export async function getChatCount(userId: string): Promise<number> {
  const db = await getDB();
  const tx = db.transaction('chats', 'readonly');
  const index = tx.store.index('by-user');
  const count = await index.count(userId);
  return count;
}

// Search chat messages by keyword
export async function searchChatHistory(
  userId: string,
  keyword: string
): Promise<ChatMessage[]> {
  const allChats = await getAllChatHistory(userId);
  const lowerKeyword = keyword.toLowerCase();
  
  return allChats.filter(
    (chat) =>
      chat.userMessage.toLowerCase().includes(lowerKeyword) ||
      chat.aiResponse.toLowerCase().includes(lowerKeyword)
  );
}

// Export chat history as JSON
export async function exportChatHistory(userId: string): Promise<string> {
  const chats = await getAllChatHistory(userId);
  return JSON.stringify(chats, null, 2);
}

// Import chat history from JSON
export async function importChatHistory(
  userId: string,
  jsonData: string
): Promise<number> {
  const db = await getDB();
  const chats: ChatMessage[] = JSON.parse(jsonData);
  
  let imported = 0;
  for (const chat of chats) {
    // Ensure it's for the correct user
    if (chat.userId === userId) {
      await db.add('chats', chat);
      imported++;
    }
  }
  
  return imported;
}
