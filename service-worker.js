/* ===========================================
   service-worker.js — ALTORRA-PILOTO
   Objetivo:
   - Evitar que necesites editar ?v=... en <script>
   - HTML y JS siempre "frescos" (network-first + cache:'reload')
   - Recarga automática 1 sola vez cuando hay SW nuevo
   - Mantener CSS/IMG rápidos con caché
   =========================================== */

const CACHE_NAME = 'altorra-pwa-v1'; // Sube el nombre si alguna vez cambias la estrategia
const ORIGIN = self.location.origin;

// Toma control inmediatamente al instalar
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(Promise.resolve());
});

// Activa, limpia cachés viejos y toma control de todas las pestañas
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)));
    await self.clients.claim();

    // Recarga 1 vez todas las pestañas controladas para que vean la versión nueva
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clientsList.forEach((client) => {
      // Forzamos una navegación a la misma URL (recarga suave)
      client.navigate(client.url).catch(() => {});
    });
  })());
});

// Helper: ¿solicitud dentro del mismo origen?
function isSameOrigin(url) {
  return url.origin === ORIGIN;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo manejamos recursos del mismo origen (GitHub Pages del sitio)
  if (!isSameOrigin(url)) return;

  const isHTML = req.mode === 'navigate' || url.pathname.endsWith('.html');
  const isJS   = url.pathname.endsWith('.js');
  const isCSS  = url.pathname.endsWith('.css') || url.pathname.endsWith('.woff2') || url.pathname.endsWith('.woff');
  const isImg  = /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(url.pathname);

  // === HTML y JS: siempre pedir en red primero y revalidar (evita versiones viejas) ===
  if (isHTML || isJS) {
    event.respondWith((async () => {
      try {
        // Fuerza a ir a la red (evita caché intermedio)
        const freshReq = new Request(req, { cache: 'reload' });
        const net = await fetch(freshReq);
        const copy = net.clone();
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, copy);
        return net;
      } catch (e) {
        // Si no hay red, cae a caché (modo offline)
        const cached = await caches.match(req);
        if (cached) return cached;
        throw e;
      }
    })());
    return;
  }

  // === CSS/Fonts: stale-while-revalidate (rápido y actualiza en segundo plano) ===
  if (isCSS) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      const fetchPromise = fetch(req).then((net) => {
        cache.put(req, net.clone());
        return net;
      }).catch(() => null);
      return cached || (await fetchPromise);
    })());
    return;
  }

  // === Imágenes: cache-first (rápidas, y si no hay, va a red y guarda) ===
  if (isImg) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;
      const net = await fetch(req);
      cache.put(req, net.clone());
      return net;
    })());
    return;
  }

  // Otros: dejar pasar por defecto
});
