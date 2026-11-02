// NAVE56 Service Worker — cache + OneSignal push notifications
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

var CACHE_VERSION = 'nave56-v202611020006';
var CACHE_NAME = CACHE_VERSION;

// NUNCA cachear index.html — siempre de la red para que los datos sean frescos
var NEVER_CACHE = [
  '/nave56/',
  '/nave56/index.html'
];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  // No precacheamos nada — el SW solo existe para push notifications
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          // Borrar todos los caches viejos (incluye versiones anteriores con index.html cacheado)
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  var url = event.request.url;
  
  // Para index.html: SIEMPRE red, sin cache
  var isIndexHtml = false;
  for (var j = 0; j < NEVER_CACHE.length; j++) {
    if (url.indexOf(NEVER_CACHE[j]) !== -1) {
      isIndexHtml = true;
      break;
    }
  }
  
  if (isIndexHtml) {
    // Network only para index.html — si falla la red, el usuario ve error (mejor que datos viejos)
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Para todo lo demás: pasar sin interferir
  // (OneSignal maneja sus propios requests)
});
