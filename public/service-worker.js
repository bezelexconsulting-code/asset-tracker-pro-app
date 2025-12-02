const CACHE_NAME = 'asset-tracker-v16';
const urlsToCache = [
  './client.html',
  './admin.html',
  './technician.html',
  './reset-password.html',
  './assets/app.js',
  './assets/admin.js',
  './assets/technician.js',
  './assets/style.css',
  './manifest.json',
  './manifest-admin.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => {
        if (cacheName !== CACHE_NAME) {
          return caches.delete(cacheName);
        }
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const isHTML = req.mode === 'navigate' || url.pathname.endsWith('.html');

  if (isHTML) {
    event.respondWith(
      fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return resp;
      }).catch(async () => {
        const cached = await caches.match(req);
        return cached || (await caches.match('./client.html')) || new Response('<h1>Offline</h1>', { status: 503, headers: { 'Content-Type': 'text/html' } });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cacheResp => {
      const fetchPromise = fetch(req).then(networkResp => {
        const respCopy = networkResp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, respCopy));
        return networkResp;
      }).catch(() => cacheResp || new Response('', { status: 504 }));
      return cacheResp || fetchPromise;
    })
  );
});
