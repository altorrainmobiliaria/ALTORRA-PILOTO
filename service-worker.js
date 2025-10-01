/* Altorra - Service Worker (Fase 2) */
const VERSION = 'v2.0.0-2025-09-30';
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
  './js/favoritos.js',
  './js/listado-propiedades.js'
];

self.addEventListener('install', event => {
  console.log('[SW] Instalando versión:', VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activando versión:', VERSION);
  event.waitUntil(
    caches.keys().then(keys => {
      console.log('[SW] Limpiando cachés antiguos...');
      return Promise.all(
        keys
          .filter(k => k.startsWith('altorra-') && ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
          .map(k => {
            console.log('[SW] Eliminando caché:', k);
            return caches.delete(k);
          })
      );
    }).then(() => self.clients.claim())
  );
});

/* Strategy:
   - HTML: network-first (fallback cache)
   - JSON: network-first (siempre actualizado)
   - CSS/JS: stale-while-revalidate
   - Imágenes: cache-first
*/
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo GET
  if (req.method !== 'GET') return;

  // JSON siempre fresco
  if (url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .then(res => {
          const resClone = res.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // HTML: network-first
  if (req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const resClone = res.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  // Imágenes: cache-first
  if (req.headers.get('accept')?.includes('image') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(networkRes => {
          const resClone = networkRes.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(req, resClone));
          return networkRes;
        });
      })
    );
    return;
  }

  // Otros assets: stale-while-revalidate
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
