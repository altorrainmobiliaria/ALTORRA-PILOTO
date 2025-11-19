/* ========================================
   ALTORRA - ANALYTICS PRIVACY-FRIENDLY
   Sin cookies, respetando GDPR
   ======================================== */

(function() {
  'use strict';

  // Configuración
  const CONFIG = {
    enabled: true,
    storageKey: 'altorra:analytics',
    maxEvents: 500,
    sessionKey: 'altorra:session'
  };

  // Generar ID de sesión anónimo
  function getSessionId() {
    let sessionId = sessionStorage.getItem(CONFIG.sessionKey);
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem(CONFIG.sessionKey, sessionId);
    }
    return sessionId;
  }

  // Guardar evento
  function track(eventName, properties = {}) {
    if (!CONFIG.enabled) return;

    try {
      const events = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]');
      
      const event = {
        name: eventName,
        properties: properties,
        session: getSessionId(),
        path: window.location.pathname,
        timestamp: Date.now(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };

      events.push(event);

      // Limitar almacenamiento
      while (events.length > CONFIG.maxEvents) {
        events.shift();
      }

      localStorage.setItem(CONFIG.storageKey, JSON.stringify(events));
      
      console.log('📊 Analytics:', eventName, properties);
    } catch (e) {
      console.warn('Analytics error:', e);
    }
  }

  // Obtener estadísticas
  function getStats() {
    try {
      const events = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]');
      
      const stats = {
        totalEvents: events.length,
        pageViews: {},
        topProperties: {},
        searchTerms: {},
        favoritesCount: 0
      };

      events.forEach(event => {
        // Páginas más vistas
        if (event.name === 'page_view') {
          stats.pageViews[event.path] = (stats.pageViews[event.path] || 0) + 1;
        }

        // Propiedades más vistas
        if (event.name === 'property_view' && event.properties.id) {
          const id = event.properties.id;
          stats.topProperties[id] = (stats.topProperties[id] || 0) + 1;
        }

        // Términos de búsqueda
        if (event.name === 'search' && event.properties.query) {
          const query = event.properties.query.toLowerCase();
          stats.searchTerms[query] = (stats.searchTerms[query] || 0) + 1;
        }

        // Favoritos
        if (event.name === 'favorite_added') {
          stats.favoritesCount++;
        }
      });

      return stats;
    } catch (e) {
      return { error: e.message };
    }
  }

  // Auto-tracking
  function initAutoTracking() {
    // Page view
    track('page_view', {
      referrer: document.referrer,
      title: document.title
    });

    // Click en enlaces externos
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.href) {
        const isExternal = !link.href.includes(window.location.hostname);
        if (isExternal) {
          track('external_click', {
            url: link.href,
            text: link.textContent.trim()
          });
        }
      }
    });

    // Click en WhatsApp
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href*="wa.me"]');
      if (link) {
        track('whatsapp_click', {
          page: window.location.pathname
        });
      }
    });

    // Tiempo en página
    let startTime = Date.now();
    window.addEventListener('beforeunload', () => {
      const duration = Math.round((Date.now() - startTime) / 1000);
      track('time_on_page', {
        duration: duration,
        page: window.location.pathname
      });
    });
  }

  // Exponer API
  window.AltorraAnalytics = {
    track,
    getStats,
    enable: () => { CONFIG.enabled = true; },
    disable: () => { CONFIG.enabled = false; },
    clear: () => { localStorage.removeItem(CONFIG.storageKey); }
  };

  // Iniciar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoTracking);
  } else {
    initAutoTracking();
  }

  console.log('📊 Altorra Analytics inicializado');
})();
