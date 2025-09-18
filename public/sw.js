const CACHE_NAME = 'fitness-pwa-v1';
const STATIC_CACHE = 'fitness-static-v1';
const DATA_CACHE = 'fitness-data-v1';

const STATIC_FILES = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DATA_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle API requests ( IndexedDB operations )
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Fallback to cached data or offline response
          return caches.match(event.request);
        })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        // Make network request
        return fetch(fetchRequest).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the response
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        }).catch(() => {
          // If both cache and network fail, return offline page
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Background sync for when app comes back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-workouts') {
    event.waitUntil(syncWorkouts());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Sync function for workouts
async function syncWorkouts() {
  try {
    // Get pending workouts from IndexedDB
    const pendingWorkouts = await getPendingWorkouts();

    // Sync with server
    for (const workout of pendingWorkouts) {
      try {
        await syncWorkoutWithServer(workout);
        await markWorkoutAsSynced(workout.id);
      } catch (error) {
        console.error('Failed to sync workout:', error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Helper functions (these would be implemented in the main app)
function getPendingWorkouts() {
  // This would interact with IndexedDB
  return Promise.resolve([]);
}

function syncWorkoutWithServer(workout) {
  // This would send data to server
  return Promise.resolve();
}

function markWorkoutAsSynced(workoutId) {
  // This would update IndexedDB
  return Promise.resolve();
}