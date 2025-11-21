/**
 * EdgeSoul Desktop - Preload Script
 * Exposes safe APIs to the renderer process via contextBridge
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  getBackendUrl: () => ipcRenderer.invoke('get-backend-url'),

  // Storage
  getStoreValue: (key) => ipcRenderer.invoke('get-store-value', key),
  setStoreValue: (key, value) => ipcRenderer.invoke('set-store-value', key, value),

  // File dialogs
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),

  // Notifications
  showNotification: (options) => ipcRenderer.invoke('show-notification', options),

  // Window controls
  minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),

  // Updates
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),

  // Event listeners
  onNewConversation: (callback) => {
    ipcRenderer.on('new-conversation', callback);
  },
  onOpenSettings: (callback) => {
    ipcRenderer.on('open-settings', callback);
  },
  onShowNotification: (callback) => {
    ipcRenderer.on('show-notification', (event, options) => callback(options));
  },

  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Platform detection
contextBridge.exposeInMainWorld('platform', {
  isElectron: true,
  isWindows: process.platform === 'win32',
  isMac: process.platform === 'darwin',
  isLinux: process.platform === 'linux',
  platform: process.platform
});

console.log('✅ Preload script loaded successfully');
