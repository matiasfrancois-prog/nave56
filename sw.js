// NAVE56 Service Worker — SOLO push notifications, SIN cache
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

var CACHE_VERSION = 'nave56-v202611021200';

// Al instalar: skipWaiting inmediato, sin precachear nada
self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

// Al activar: borrar TODOS los caches y tomar control inmediato
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: NUNCA cachear nada — siempre red
self.addEventListener('fetch', function(event) {
  // Solo interceptar requests de nuestra propia app (no OneSignal)
  var url = event.request.url;
  if (url.indexOf('onesignal') !== -1 || url.indexOf('supabase') !== -1) {
    return; // dejar pasar sin interferir
  }
  // Para todo lo nuestro: network only, sin cache
  if (url.indexOf('matiasfrancois-prog.github.io') !== -1) {
    event.respondWith(
      fetch(event.request).catch(function() {
        // Si la red falla, no tenemos cache (es intencional para datos frescos)
        return new Response('Offline', {status: 503});
      })
    );
  }
});
