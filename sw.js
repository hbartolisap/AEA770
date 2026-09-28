const CACHE_NAME = 'aea770-v8-local';
const URLS = [
    './',
    './index.html',
    './manifest.json',
    './libs/jspdf.umd.min.js',
    './libs/jspdf.plugin.autotable.min.js',
    './libs/xlsx.full.min.js'
];

self.addEventListener('install', event => {
    console.log('🔧 Service Worker: instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(URLS).catch(err => {
                console.warn('⚠️ Algunos recursos no se cachearon:', err);
            });
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('✅ Service Worker: activado');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => {
                return caches.match('./index.html');
            });
        })
    );
});