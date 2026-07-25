const CACHE_NAME = 'markup-app-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Always fetch API requests, uploads, and HTML documents directly from network
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('/uploads/') ||
    event.request.mode === 'navigate' ||
    event.request.destination === 'document'
  ) {
    return;
  }

  // Network-first for all assets to prevent stale JS hash 404s
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
