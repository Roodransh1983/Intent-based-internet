const CACHE_NAME = 'intent-net-v2';
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json', '/offline.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(network => {
        if (network && network.status === 200) {
          caches.open(CACHE_NAME).then(c => c.put(e.request, network.clone()));
        }
        return network;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-data') {
    e.waitUntil(self.clients.matchAll().then(clients => {
      clients.forEach(c => c.postMessage({ type: 'SYNC_TRIGGER' }));
    }));
  }
});
