/**
 * Offline Storage Manager
 * Handles local storage using IndexedDB for offline functionality
 */

const DB_NAME = 'edgesoul-offline';
const DB_VERSION = 1;

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  emotion?: string;
  timestamp: number;
  synced: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  synced: boolean;
}

export interface PendingSync {
  id?: number;
  type: 'message' | 'conversation' | 'preference';
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineStorage {
  private db: IDBDatabase | null = null;

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Conversations store
        if (!db.objectStoreNames.contains('conversations')) {
          const conversationsStore = db.createObjectStore('conversations', {
            keyPath: 'id',
          });
          conversationsStore.createIndex('updatedAt', 'updatedAt', {
            unique: false,
          });
          conversationsStore.createIndex('synced', 'synced', { unique: false });
        }

        // Pending sync queue
        if (!db.objectStoreNames.contains('pending-sync')) {
          const syncStore = db.createObjectStore('pending-sync', {
            keyPath: 'id',
            autoIncrement: true,
          });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('type', 'type', { unique: false });
        }

        // User preferences
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'key' });
        }

        // Cached API responses
        if (!db.objectStoreNames.contains('api-cache')) {
          const cacheStore = db.createObjectStore('api-cache', {
            keyPath: 'url',
          });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        console.log('✅ IndexedDB schema created');
      };
    });
  }

  /**
   * Ensure database is initialized
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // ==================== Conversations ====================

  /**
   * Save a conversation
   */
  async saveConversation(conversation: Conversation): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['conversations'], 'readwrite');
      const store = transaction.objectStore('conversations');

      conversation.updatedAt = Date.now();
      const request = store.put(conversation);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a conversation by ID
   */
  async getConversation(id: string): Promise<Conversation | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['conversations'], 'readonly');
      const store = transaction.objectStore('conversations');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all conversations
   */
  async getAllConversations(): Promise<Conversation[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['conversations'], 'readonly');
      const store = transaction.objectStore('conversations');
      const index = store.index('updatedAt');
      const request = index.openCursor(null, 'prev'); // Newest first

      const conversations: Conversation[] = [];

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          conversations.push(cursor.value);
          cursor.continue();
        } else {
          resolve(conversations);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['conversations'], 'readwrite');
      const store = transaction.objectStore('conversations');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== Pending Sync ====================

  /**
   * Add item to sync queue
   */
  async addToPendingSync(item: Omit<PendingSync, 'id'>): Promise<number> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pending-sync'], 'readwrite');
      const store = transaction.objectStore('pending-sync');
      const request = store.add({
        ...item,
        timestamp: Date.now(),
        retryCount: 0,
      });

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all pending sync items
   */
  async getPendingSync(): Promise<PendingSync[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pending-sync'], 'readonly');
      const store = transaction.objectStore('pending-sync');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove synced item
   */
  async removePendingSync(id: number): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pending-sync'], 'readwrite');
      const store = transaction.objectStore('pending-sync');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update retry count for failed sync
   */
  async updateSyncRetry(id: number, retryCount: number): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pending-sync'], 'readwrite');
      const store = transaction.objectStore('pending-sync');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.retryCount = retryCount;
          const putRequest = store.put(item);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // ==================== Preferences ====================

  /**
   * Save a preference
   */
  async setPreference(key: string, value: any): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['preferences'], 'readwrite');
      const store = transaction.objectStore('preferences');
      const request = store.put({ key, value, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a preference
   */
  async getPreference(key: string): Promise<any | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['preferences'], 'readonly');
      const store = transaction.objectStore('preferences');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== API Cache ====================

  /**
   * Cache API response
   */
  async cacheAPIResponse(url: string, data: any, ttl: number = 3600000): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['api-cache'], 'readwrite');
      const store = transaction.objectStore('api-cache');
      const request = store.put({
        url,
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cached API response
   */
  async getCachedAPIResponse(url: string): Promise<any | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['api-cache'], 'readonly');
      const store = transaction.objectStore('api-cache');
      const request = store.get(url);

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.expiresAt > Date.now()) {
          resolve(result.data);
        } else {
          // Expired, delete it
          if (result) {
            const deleteTransaction = db.transaction(['api-cache'], 'readwrite');
            deleteTransaction.objectStore('api-cache').delete(url);
          }
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== Utility ====================

  /**
   * Clear all data (for logout)
   */
  async clearAll(): Promise<void> {
    const db = await this.ensureDB();
    const storeNames = ['conversations', 'pending-sync', 'preferences', 'api-cache'];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeNames, 'readwrite');

      storeNames.forEach((storeName) => {
        transaction.objectStore(storeName).clear();
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Get storage usage stats
   */
  async getStats(): Promise<{
    conversations: number;
    pendingSync: number;
    cacheSize: number;
  }> {
    const db = await this.ensureDB();
    
    const conversations = await this.getAllConversations();
    const pendingSync = await this.getPendingSync();

    return {
      conversations: conversations.length,
      pendingSync: pendingSync.length,
      cacheSize: 0, // Would need to calculate actual size
    };
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorage();

// Auto-initialize on import
if (typeof window !== 'undefined') {
  offlineStorage.init().catch(console.error);
}
