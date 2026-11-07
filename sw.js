// NAVE56 Service Worker — push (OneSignal) + red directa, SIN cache.
// Lo registra únicamente OneSignal (index.html no lo registra a mano).
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

var SW_VERSION = 'nave56-v20261107';

self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

// Solo navegación de la propia app: siempre a la red (datos frescos).
self.addEventListener('fetch', function(event) {
  var req = event.request;
  if (req.mode !== 'navigate') return;
  if (new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(fetch(req).catch(function() {
    return new Response('<h2 style="font-family:sans-serif;text-align:center;margin-top:40vh">Sin conexión · NAVE56</h2>',
      {status: 503, headers: {'Content-Type': 'text/html; charset=utf-8'}});
  }));
});
