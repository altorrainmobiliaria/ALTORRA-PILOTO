/* Altorra - Service Worker (Fase 6: Offline + 404) */
const VERSION = 'v1.1.0';
const STATIC_CACHE  = 'altorra-static-' + VERSION;
const RUNTIME_CACHE = 'altorra-runtime-' + VERSION;
const OFFLINE_URL = './offline.html';
const NOTFOUND_URL = './404.html';

const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './scripts.js',
  './header-footer.js',
  './header.html',
  './footer.html',
  './manifest.json',
  OFFLINE_URL,
  NOTFOUND_URL
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
          .map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

function isHtmlRequest(req){
  return req.headers.get('accept')?.includes('text/html');
}
function placeholderSVGResponse(){
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
    <rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-size="18" font-family="Arial, sans-serif">Imagen no disponible</text>
  </svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;

  // HTML: network-first, fallback to cache, then offline/404
  if(isHtmlRequest(req)){
    event.respondWith(
      fetch(req).then(res => {
        if(res.status === 404){
          return caches.match(NOTFOUND_URL);
        }
        const clone = res.clone();
        caches.open(RUNTIME_CACHE).then(c => c.put(req, clone));
        return res;
      }).catch(async () => {
        const cached = await caches.match(req);
        if(cached) return cached;
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // Non-HTML (CSS/JS/JSON/images): stale-while-revalidate
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(networkRes => {
        caches.open(RUNTIME_CACHE).then(c => c.put(req, networkRes.clone()));
        return networkRes;
      }).catch(() => {
        if(req.destination === 'image' && !cached){
          return placeholderSVGResponse();
        }
        return cached;
      });
      return cached || fetchPromise;
    })
  );
});
