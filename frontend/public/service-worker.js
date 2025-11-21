/**
 * EdgeSoul Service Worker
 * Provides offline functionality and caching strategies
 */

const CACHE_NAME = 'edgesoul-v3.0.0';
const RUNTIME_CACHE = 'edgesoul-runtime';
const API_CACHE = 'edgesoul-api';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/chat',
  '/manifest.json',
  '/offline.html',
  // Add your static assets
];

// API endpoints that should be cached
const CACHEABLE_API_ROUTES = [
  '/api/v1/chat',
  '/api/v1/emotion',
  '/api/v1/knowledge',
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Service worker installed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Delete old caches
            return name !== CACHE_NAME && 
                   name !== RUNTIME_CACHE && 
                   name !== API_CACHE;
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

/**
 * Fetch event - handle requests with caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine caching strategy based on request type
  if (isAPIRequest(url)) {
    // Network first, fallback to cache for API requests
    event.respondWith(networkFirstStrategy(request, API_CACHE));
  } else if (isStaticAsset(url)) {
    // Cache first for static assets
    event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
  } else {
    // Stale while revalidate for pages
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
  }
});

/**
 * Network First Strategy
 * Try network, fallback to cache if offline
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for API requests
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'You are currently offline. This request will be retried when connection is restored.'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Cache First Strategy
 * Serve from cache, fallback to network
 */
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache and network both failed:', error);
    return new Response('Resource not available offline', { status: 503 });
  }
}

/**
 * Stale While Revalidate Strategy
 * Serve from cache immediately, update cache in background
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, return cached version
    return cachedResponse;
  });
  
  // Return cached version immediately, or wait for network
  return cachedResponse || fetchPromise;
}

/**
 * Check if request is for API
 */
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') || 
         url.hostname.includes('localhost:8000') ||
         CACHEABLE_API_ROUTES.some(route => url.pathname.startsWith(route));
}

/**
 * Check if request is for static asset
 */
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2', '.ttf', '.ico'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

/**
 * Handle background sync for failed API requests
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncPendingMessages());
  }
});

/**
 * Sync pending messages when back online
 */
async function syncPendingMessages() {
  try {
    // Get pending messages from IndexedDB
    const db = await openDatabase();
    const pendingMessages = await db.getAll('pending-messages');
    
    for (const message of pendingMessages) {
      try {
        await fetch('/api/v1/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message.data)
        });
        
        // Remove from pending queue
        await db.delete('pending-messages', message.id);
      } catch (error) {
        console.error('[SW] Failed to sync message:', error);
      }
    }
    
    console.log('[SW] Message sync complete');
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

/**
 * Handle push notifications
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body || 'New message from EdgeSoul',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'EdgeSoul', options)
  );
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

/**
 * Open IndexedDB
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('edgesoul-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pending-messages')) {
        db.createObjectStore('pending-messages', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('conversations')) {
        db.createObjectStore('conversations', { keyPath: 'id' });
      }
    };
  });
}

console.log('[SW] Service worker script loaded');
