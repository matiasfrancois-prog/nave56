// NAVE56 Service Worker — cache-first con update detection
var CACHE_VERSION = 'nave56-v202610292151';
var CACHE_NAME = CACHE_VERSION;
var urlsToCache = [
  '/',
  '/index.html'
];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  // Solo cachear recursos del mismo origen
  if (event.request.url.indexOf(self.location.origin) !== 0) return;

  event.respondWith(
    fetch(event.request).then(function(response) {
      // Clonar y guardar en cache si la respuesta es válida
      if (response && response.status === 200 && response.type === 'basic') {
        var responseToCache = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseToCache);
        });
      }
      return response;
    }).catch(function() {
      // Si falla la red, usar cache
      return caches.match(event.request);
    })
  );
});
