/* ========================================
   ALTORRA - CACHE MANAGER AUTOMÁTICO
   Sistema inteligente que detecta cambios
   sin necesidad de modificar código
   ======================================== */

(function() {
  'use strict';

  const CACHE_PREFIX = 'altorra:';
  const DATA_URL = 'properties/data.json';
  const VERSION_KEY = CACHE_PREFIX + 'data:version';
  const CACHE_KEY = CACHE_PREFIX + 'data:cached';
  const LAST_CHECK_KEY = CACHE_PREFIX + 'data:lastcheck';
  
  // ⏱️ Verificar cambios cada 5 minutos en vez de usar TTL fijo
  const CHECK_INTERVAL = 1000 * 60 * 5; // 5 minutos

  /**
   * Calcula un hash simple pero efectivo del contenido
   * Esto nos permite detectar si el JSON cambió
   */
  function hashContent(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Obtiene datos con caché inteligente y detección automática de cambios
   */
  async function getSmartCache(url) {
    const now = Date.now();
    
    try {
      // 1. Intentar leer caché existente
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedVersion = localStorage.getItem(VERSION_KEY);
      const lastCheck = parseInt(localStorage.getItem(LAST_CHECK_KEY) || '0', 10);
      
      // 2. Si tenemos caché y no ha pasado el intervalo, usarla
      if (cachedData && cachedVersion && (now - lastCheck) < CHECK_INTERVAL) {
        console.log('[Cache] ✅ Usando caché válida (próxima verificación en', 
                    Math.round((CHECK_INTERVAL - (now - lastCheck)) / 1000), 'segundos)');
        return JSON.parse(cachedData);
      }

      // 3. Hacer fetch para verificar si hay cambios
      console.log('[Cache] 🔄 Verificando actualizaciones del servidor...');
      const response = await fetch(url + '?_t=' + Date.now(), { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (!response.ok) {
        // Si falla el fetch pero tenemos caché, usar caché
        if (cachedData) {
          console.warn('[Cache] ⚠️ Error en servidor, usando caché existente');
          return JSON.parse(cachedData);
        }
        throw new Error('HTTP ' + response.status);
      }

      const freshData = await response.json();
      const freshHash = hashContent(freshData);

      // 4. Actualizar timestamp de última verificación
      localStorage.setItem(LAST_CHECK_KEY, now.toString());

      // 5. Comparar versiones
      if (cachedVersion && freshHash === cachedVersion) {
        console.log('[Cache] ✨ Contenido sin cambios, caché actualizada');
        // Actualizar solo el timestamp, no los datos
        return JSON.parse(cachedData);
      }

      // 6. Hay cambios o es la primera carga
      console.log('[Cache] 🆕 Contenido nuevo detectado, actualizando caché');
      localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
      localStorage.setItem(VERSION_KEY, freshHash);

      // 7. Disparar evento para que otras partes de la app se actualicen
      document.dispatchEvent(new CustomEvent('altorra:data-updated', {
        detail: { 
          url, 
          isFirstLoad: !cachedVersion,
          hash: freshHash 
        }
      }));

      return freshData;

    } catch (error) {
      console.error('[Cache] ❌ Error:', error);
      
      // Fallback: intentar usar caché aunque esté vencida
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        console.warn('[Cache] 🔄 Usando caché de emergencia');
        return JSON.parse(cachedData);
      }
      
      throw error;
    }
  }

  /**
   * Fuerza una recarga completa
   */
  function forceRefresh() {
    console.log('[Cache] 🔥 Limpieza forzada');
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(VERSION_KEY);
    localStorage.removeItem(LAST_CHECK_KEY);
    window.location.reload();
  }

  /**
   * Obtiene información del caché actual
   */
  function getCacheInfo() {
    const cachedVersion = localStorage.getItem(VERSION_KEY);
    const lastCheck = parseInt(localStorage.getItem(LAST_CHECK_KEY) || '0', 10);
    const cachedData = localStorage.getItem(CACHE_KEY);
    
    if (!cachedData || !cachedVersion) {
      return null;
    }

    const data = JSON.parse(cachedData);
    const size = new Blob([cachedData]).size;
    const age = Date.now() - lastCheck;
    const nextCheck = Math.max(0, CHECK_INTERVAL - age);

    return {
      version: cachedVersion,
      itemCount: Array.isArray(data) ? data.length : 0,
      size: size,
      lastCheck: new Date(lastCheck).toLocaleString('es-CO'),
      nextCheck: Math.round(nextCheck / 1000),
      age: Math.round(age / 1000)
    };
  }

  // Exponer API global
  window.AltorraCache = {
    get: getSmartCache,
    forceRefresh: forceRefresh,
    info: getCacheInfo,
    clear: function() {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
      keys.forEach(k => localStorage.removeItem(k));
      console.log('[Cache] 🧹 Limpieza completa:', keys.length, 'elementos eliminados');
    }
  };

  console.log('[Cache Manager] ✅ Sistema inicializado');
  console.log('[Cache Manager] 📊 Info:', getCacheInfo());

})();
