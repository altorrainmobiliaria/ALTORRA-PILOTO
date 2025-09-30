/* Altorra - Service Worker (Fase 1) */
const VERSION = 'v1.0.0-' + (self.registration ? (self.registration.scope || '') : '');
const STATIC_CACHE = 'altorra-static-' + VERSION;
const RUNTIME_CACHE = 'altorra-runtime-' + VERSION;

const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './scripts.js',
  './header-footer.js',
  './header.html',
  './footer.html',
  './manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => ![STATIC_CACHE, RUNTIME_CACHE].includes(k)).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

/* Strategy:
   - HTML: network-first (fallback cache)
   - JSON/images/CSS/JS: stale-while-revalidate
*/
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET
  if (req.method !== 'GET') return;

  // HTML pages: network-first
  if (req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req).then(res => {
        const resClone = res.clone();
        caches.open(RUNTIME_CACHE).then(cache => cache.put(req, resClone));
        return res;
      }).catch(() => caches.match(req).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  // Other assets: stale-while-revalidate
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(networkRes => {
        const resClone = networkRes.clone();
        caches.open(RUNTIME_CACHE).then(cache => cache.put(req, resClone));
        return networkRes;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
