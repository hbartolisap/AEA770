const CACHE_NAME = 'aea770-v8';
const ASSETS = [
  './',
  './index.html',
  './dps.html',
  './reparto_tableros.html',
  './manifest.json',
  './libs/jspdf.umd.min.js',
  './libs/jspdf.plugin.autotable.min.js',
  './libs/xlsx.full.min.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cachear UNO POR UNO para que un fallo no rompa todo
      return Promise.all(
        ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('⚠ No se pudo cachear:', url, err.message);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // No cachear peticiones cross-origin ni chrome-extension
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            return response;
          })
          .catch(() => cached)
      );
    })
  );
});
