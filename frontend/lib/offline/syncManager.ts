/**
 * Sync Manager
 * Handles synchronization between offline storage and backend
 */

import { offlineStorage, type PendingSync } from './offlineStorage';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5000; // 5 seconds
const SYNC_INTERVAL = 30000; // 30 seconds

class SyncManager {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupEventListeners();
    }
  }

  /**
   * Setup online/offline event listeners
   */
  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored');
      this.isOnline = true;
      this.syncNow();
    });

    window.addEventListener('offline', () => {
      console.log('📡 Connection lost - working offline');
      this.isOnline = false;
    });

    // Initial check
    this.isOnline = navigator.onLine;
  }

  /**
   * Start automatic sync
   */
  startAutoSync(): void {
    if (this.syncInterval) {
      return; // Already running
    }

    console.log('🔄 Starting auto-sync');
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncNow();
      }
    }, SYNC_INTERVAL);

    // Initial sync
    if (this.isOnline) {
      this.syncNow();
    }
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏸️  Auto-sync stopped');
    }
  }

  /**
   * Manually trigger sync
   */
  async syncNow(): Promise<{ success: number; failed: number }> {
    if (this.isSyncing) {
      console.log('⏳ Sync already in progress');
      return { success: 0, failed: 0 };
    }

    if (!this.isOnline) {
      console.log('📡 Cannot sync - offline');
      return { success: 0, failed: 0 };
    }

    this.isSyncing = true;
    console.log('🔄 Starting sync...');

    let successCount = 0;
    let failedCount = 0;

    try {
      const pendingItems = await offlineStorage.getPendingSync();
      console.log(`Found ${pendingItems.length} items to sync`);

      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          await offlineStorage.removePendingSync(item.id!);
          successCount++;
          console.log(`✅ Synced ${item.type} item`);
        } catch (error) {
          console.error(`❌ Failed to sync ${item.type}:`, error);

          // Update retry count
          const newRetryCount = (item.retryCount || 0) + 1;

          if (newRetryCount >= MAX_RETRY_ATTEMPTS) {
            console.log(`🗑️  Removing item after ${MAX_RETRY_ATTEMPTS} failed attempts`);
            await offlineStorage.removePendingSync(item.id!);
          } else {
            await offlineStorage.updateSyncRetry(item.id!, newRetryCount);
          }

          failedCount++;
        }
      }

      console.log(`✅ Sync complete: ${successCount} succeeded, ${failedCount} failed`);
    } catch (error) {
      console.error('❌ Sync error:', error);
    } finally {
      this.isSyncing = false;
    }

    return { success: successCount, failed: failedCount };
  }

  /**
   * Sync a single item
   */
  private async syncItem(item: PendingSync): Promise<void> {
    const backendUrl = this.getBackendUrl();

    switch (item.type) {
      case 'message':
        await this.syncMessage(backendUrl, item.data);
        break;

      case 'conversation':
        await this.syncConversation(backendUrl, item.data);
        break;

      case 'preference':
        await this.syncPreference(backendUrl, item.data);
        break;

      default:
        console.warn(`Unknown sync type: ${item.type}`);
    }
  }

  /**
   * Sync a message
   */
  private async syncMessage(backendUrl: string, data: any): Promise<void> {
    const response = await fetch(`${backendUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Sync a conversation
   */
  private async syncConversation(backendUrl: string, data: any): Promise<void> {
    const response = await fetch(`${backendUrl}/api/v1/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Sync a preference
   */
  private async syncPreference(backendUrl: string, data: any): Promise<void> {
    const response = await fetch(`${backendUrl}/api/v1/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Get backend URL
   */
  private getBackendUrl(): string {
    // Check if running in Electron
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      return 'http://localhost:8000';
    }

    // Use environment variable or default
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  /**
   * Queue a message for sync
   */
  async queueMessage(message: any): Promise<void> {
    await offlineStorage.addToPendingSync({
      type: 'message',
      data: message,
      timestamp: Date.now(),
      retryCount: 0,
    });

    // Try immediate sync if online
    if (this.isOnline && !this.isSyncing) {
      this.syncNow();
    }
  }

  /**
   * Queue a conversation for sync
   */
  async queueConversation(conversation: any): Promise<void> {
    await offlineStorage.addToPendingSync({
      type: 'conversation',
      data: conversation,
      timestamp: Date.now(),
      retryCount: 0,
    });

    if (this.isOnline && !this.isSyncing) {
      this.syncNow();
    }
  }

  /**
   * Queue a preference for sync
   */
  async queuePreference(preference: any): Promise<void> {
    await offlineStorage.addToPendingSync({
      type: 'preference',
      data: preference,
      timestamp: Date.now(),
      retryCount: 0,
    });

    if (this.isOnline && !this.isSyncing) {
      this.syncNow();
    }
  }

  /**
   * Get sync status
   */
  async getStatus(): Promise<{
    isOnline: boolean;
    isSyncing: boolean;
    pendingCount: number;
  }> {
    const pendingItems = await offlineStorage.getPendingSync();

    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: pendingItems.length,
    };
  }

  /**
   * Check if device is online
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }
}

// Export singleton instance
export const syncManager = new SyncManager();

// Auto-start sync in browser
if (typeof window !== 'undefined') {
  syncManager.startAutoSync();
}
