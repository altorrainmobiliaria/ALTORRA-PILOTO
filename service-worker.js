/* ===========================================
   ALTORRA - Service Worker v2.0
   Mejoras: precaching, offline page, límites, timeouts
   =========================================== */

// Versión con timestamp para forzar actualización
const VERSION = '2.0.0';
const TIMESTAMP = '2025-11-20'; // Actualizar en cada deploy
const CACHE_NAME = `altorra-pwa-v${VERSION}-${TIMESTAMP}`;
const ORIGIN = self.location.origin;

// Archivos críticos para precache (shell de la app)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/scripts.js',
  '/header-footer.js',
  '/js/config.js',
  '/js/utils.js',
  '/js/favoritos.js',
  '/offline.html'  // Página offline custom
];

// Configuración de cache
const CACHE_CONFIG = {
  maxAge: 7 * 24 * 60 * 60 * 1000,      // 7 días máximo
  maxEntries: 100,                       // Máximo 100 items por cache
  networkTimeout: 3000                   // 3s timeout para network-first
};

// ===== INSTALL =====
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing version ${VERSION}`);

  event.waitUntil((async () => {
    try {
      // Pre-cache archivos críticos
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_URLS);
      console.log('[SW] Precache completed');
    } catch (error) {
      console.error('[SW] Precache failed:', error);
    }

    // Skip waiting para activar inmediatamente
    await self.skipWaiting();
  })());
});

// ===== ACTIVATE =====
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating version ${VERSION}`);

  event.waitUntil((async () => {
    // Limpiar cachés antiguos
    const keys = await caches.keys();
    await Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[SW] Deleting old cache:', key);
          return caches.delete(key);
        }
      })
    );

    // Tomar control de todas las páginas
    await self.clients.claim();
    console.log('[SW] Claimed all clients');

    // Notificar a las páginas que hay nueva versión
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_UPDATED',
        version: VERSION,
        timestamp: TIMESTAMP
      });
    });
  })());
});

// ===== FETCH =====
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo manejar same-origin requests
  if (url.origin !== ORIGIN) return;

  // Determinar tipo de recurso
  const resourceType = getResourceType(url.pathname, req.mode);

  // Estrategias por tipo
  switch (resourceType) {
    case 'html':
    case 'js':
      event.respondWith(networkFirstStrategy(req));
      break;
    case 'css':
    case 'font':
      event.respondWith(staleWhileRevalidateStrategy(req));
      break;
    case 'image':
      event.respondWith(cacheFirstStrategy(req));
      break;
    case 'data':
      event.respondWith(networkFirstWithTimeout(req, 2000));
      break;
    default:
      // Default: network-first
      event.respondWith(networkFirstStrategy(req));
  }
});

// ===== HELPER: Detect Resource Type =====
function getResourceType(pathname, mode) {
  if (mode === 'navigate' || pathname.endsWith('.html')) return 'html';
  if (pathname.endsWith('.js')) return 'js';
  if (pathname.endsWith('.css')) return 'css';
  if (pathname.match(/\.(woff2?|ttf|otf|eot)$/i)) return 'font';
  if (pathname.match(/\.(png|jpg|jpeg|webp|gif|svg|ico)$/i)) return 'image';
  if (pathname.match(/\.(json|xml)$/i)) return 'data';
  return 'other';
}

// ===== STRATEGY: Network First =====
async function networkFirstStrategy(request) {
  try {
    // Try network with cache:reload to bypass browser cache
    const freshReq = new Request(request, { cache: 'reload' });
    const response = await fetch(freshReq);

    // Clone and cache successful responses
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);

    // Fallback to cache
    const cached = await caches.match(request);
    if (cached) return cached;

    // If HTML, show offline page
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) return offlinePage;
    }

    throw error;
  }
}

// ===== STRATEGY: Network First with Timeout =====
async function networkFirstWithTimeout(request, timeout) {
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout')), timeout)
      )
    ]);

    // Cache successful response
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network timeout/failed, trying cache:', request.url);

    const cached = await caches.match(request);
    if (cached) return cached;

    throw error;
  }
}

// ===== STRATEGY: Stale While Revalidate =====
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // Fetch in background
  const fetchPromise = fetch(request).then(response => {
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  // Return cached immediately if available, otherwise wait for network
  return cached || fetchPromise;
}

// ===== STRATEGY: Cache First =====
async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    // Check age and revalidate if old
    const cacheDate = cached.headers.get('date');
    if (cacheDate) {
      const age = Date.now() - new Date(cacheDate).getTime();
      if (age > CACHE_CONFIG.maxAge) {
        // Revalidate in background
        fetch(request).then(response => {
          if (response && response.ok) {
            cache.put(request, response.clone());
          }
        }).catch(() => {});
      }
    }

    return cached;
  }

  // Not in cache, fetch and cache
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Cache-first fetch failed:', request.url);
    throw error;
  }
}

// ===== MESSAGE HANDLER =====
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      // Client requests immediate activation
      self.skipWaiting();
      break;

    case 'CLEAR_CACHE':
      // Clear all caches
      event.waitUntil(
        caches.keys().then(keys =>
          Promise.all(keys.map(key => caches.delete(key)))
        )
      );
      break;

    case 'GET_VERSION':
      // Return current version
      event.ports[0].postMessage({
        version: VERSION,
        timestamp: TIMESTAMP,
        cacheName: CACHE_NAME
      });
      break;
  }
});

// ===== BACKGROUND SYNC (si está disponible) =====
if ('sync' in self.registration) {
  self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);

    // Ejemplo: sincronizar formularios pendientes
    if (event.tag === 'sync-forms') {
      event.waitUntil(syncPendingForms());
    }
  });
}

async function syncPendingForms() {
  // Placeholder para futura implementación
  console.log('[SW] Syncing pending forms...');
  // TODO: Implementar cola de formularios offline
}

// ===== PUSH NOTIFICATIONS (placeholder) =====
if ('push' in self.registration) {
  self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};

    event.waitUntil(
      self.registration.showNotification(data.title || 'Altorra', {
        body: data.body || 'Nueva actualización disponible',
        icon: '/multimedia/logo.png',
        badge: '/multimedia/logo.png',
        data: data
      })
    );
  });

  self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  });
}

console.log(`[SW] Service Worker v${VERSION} loaded`);
