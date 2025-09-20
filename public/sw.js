// Service Worker temporaneamente disabilitato per risolvere problemi di cache

self.addEventListener('install', (event) => {
  console.log('Service Worker installing (TEMPORARILY DISABLED - NO CACHE)');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating (CLEARING ALL CACHE)');
  // Cancella tutta la cache esistente
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Non cacheare nulla, lascia passare tutte le richieste
  event.respondWith(fetch(event.request));
});