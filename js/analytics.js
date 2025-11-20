/* ========================================
   ALTORRA - ANALYTICS (LOCAL + GOOGLE ANALYTICS 4)
   Sin cookies innecesarias, respetando GDPR
   ======================================== */

(function() {
  'use strict';

  // Configuración
  const CONFIG = {
    enabled: true,
    storageKey: 'altorra:analytics',
    maxEvents: 500,
    sessionKey: 'altorra:session',
    // Google Analytics 4
    ga4: {
      enabled: true,
      measurementId: 'G-EHE7316MST', // ✅ ID real de GA4
      debug: false // Cambiar a true para debugging
    }
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

  // ========================================
  // GOOGLE ANALYTICS 4 INTEGRATION
  // ========================================

  /**
   * Verifica si gtag está disponible
   */
  function isGA4Available() {
    return typeof window.gtag === 'function' && CONFIG.ga4.enabled;
  }

  /**
   * Envía evento a Google Analytics 4
   * @param {String} eventName - Nombre del evento
   * @param {Object} params - Parámetros del evento
   */
  function sendToGA4(eventName, params = {}) {
    if (!isGA4Available()) {
      if (CONFIG.ga4.debug) {
        console.log('🔵 GA4 no disponible:', eventName, params);
      }
      return;
    }

    try {
      // Normalizar nombre del evento (GA4 usa snake_case)
      const ga4EventName = eventName.toLowerCase().replace(/-/g, '_');

      // Enviar a GA4
      window.gtag('event', ga4EventName, {
        ...params,
        // Metadata adicional
        page_path: window.location.pathname,
        page_title: document.title,
        timestamp: new Date().toISOString()
      });

      if (CONFIG.ga4.debug) {
        console.log('✅ GA4 Event:', ga4EventName, params);
      }
    } catch (e) {
      console.warn('⚠️ GA4 error:', e);
    }
  }

  /**
   * Configura propiedades personalizadas de GA4
   */
  function configureGA4() {
    if (!isGA4Available()) return;

    try {
      // Configuración de usuario
      window.gtag('config', CONFIG.ga4.measurementId, {
        page_title: document.title,
        page_path: window.location.pathname,
        anonymize_ip: true, // GDPR compliance
        allow_google_signals: false, // No tracking cross-device
        allow_ad_personalization_signals: false // No ads personalization
      });

      console.log('✅ GA4 configurado:', CONFIG.ga4.measurementId);
    } catch (e) {
      console.warn('⚠️ GA4 config error:', e);
    }
  }

  // ========================================
  // TRACKING UNIFICADO (LOCAL + GA4)
  // ========================================

  /**
   * Guardar evento (localStorage + GA4)
   * @param {String} eventName - Nombre del evento
   * @param {Object} properties - Propiedades del evento
   */
  function track(eventName, properties = {}) {
    if (!CONFIG.enabled) return;

    try {
      // 1. Guardar en localStorage (analytics local)
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

      // 2. Enviar a Google Analytics 4
      sendToGA4(eventName, properties);

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

  // Exponer API pública
  window.AltorraAnalytics = {
    track,
    getStats,
    enable: () => { CONFIG.enabled = true; },
    disable: () => { CONFIG.enabled = false; },
    clear: () => { localStorage.removeItem(CONFIG.storageKey); },
    // GA4 específicos
    sendToGA4,
    configureGA4,
    enableGA4: () => { CONFIG.ga4.enabled = true; },
    disableGA4: () => { CONFIG.ga4.enabled = false; },
    setGA4Debug: (debug) => { CONFIG.ga4.debug = debug; }
  };

  // Inicialización
  function init() {
    // 1. Configurar GA4 si está disponible
    if (typeof window.gtag === 'function') {
      configureGA4();
    } else {
      console.log('ℹ️ GA4 gtag no detectado (agregar script en HTML)');
    }

    // 2. Iniciar auto-tracking
    initAutoTracking();

    console.log('📊 Altorra Analytics inicializado');
    if (isGA4Available()) {
      console.log('✅ Google Analytics 4 activo');
    }
  }

  // Iniciar cuando DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
