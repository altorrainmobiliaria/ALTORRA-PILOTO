/* service-worker.js – cache-first para imágenes y estáticos */
const CACHE = 'altorra-v1';
const IMG_EXT = ['.webp','.jpg','.jpeg','.png','.gif'];
const STATIC = [
  '/', '/index.html', '/style.css', '/scripts.js',
  '/header.html', '/footer.html', '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(STATIC)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const isImg = IMG_EXT.some(ext => url.pathname.endsWith(ext))
    || url.pathname.includes('/properties/')
    || url.pathname.includes('/allure/')
    || url.pathname.includes('/fmia/')
    || url.pathname.includes('/serena/')
    || url.pathname.includes('/fotoprop/')
    || url.pathname.includes('/Milan/');

  if (isImg) {
    e.respondWith(
      caches.match(e.request).then(cached =>
        cached || fetch(e.request).then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, copy));
          return res;
        }).catch(() => cached)
      )
    );
  }
});
