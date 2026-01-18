// Service Worker für Cache-Busting und Update-Benachrichtigungen
const CACHE_NAME = 'fittrack-v' + new Date().getTime();
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Installation: Cache-Dateien speichern
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache).catch(() => {
        // Fehler ignorieren, nicht alle URLs müssen verfügbar sein
      });
    })
  );
  self.skipWaiting();
});

// Aktivierung: Alte Caches löschen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Netzwerk zuerst, dann Cache
self.addEventListener('fetch', event => {
  // Nur GET-Anfragen cachen
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Nur erfolgreiche Responses cachen
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Response klonen und cachen
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Bei Fehler aus Cache laden
        return caches.match(event.request);
      })
  );
});

// Auf Updates prüfen
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
