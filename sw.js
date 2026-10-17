const CACHE_NAME = 'aea770-v8.3';
const ASSETS = [
  './',
  './index.html',
  './dps.html',
  './reparto_tableros.html',
  './manual.html',
  './documentacion.html',
  './manifest.json',

  // CSS separado
  './css/base.css',
  './css/index.css',
  './css/dps.css',
  './css/reparto.css',
  './css/manual.css',
  './css/documentacion.css',

  // JS separado
  './js/index.js',
  './js/dps.js',
  './js/reparto.js',
  './js/documentacion.js',

  // Librerías
  './libs/jspdf.umd.min.js',
  './libs/jspdf.plugin.autotable.min.js',
  './libs/xlsx.full.min.js',

  // Íconos
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch((err) => {
        console.warn('Algunos assets no se pudieron cachear:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => cached);
    })
  );
});