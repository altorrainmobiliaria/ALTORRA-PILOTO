/* ========================================
   ALTORRA - URGENCY & SCARCITY INDICATORS
   Elementos de urgencia y escasez para propiedades
   ======================================== */

(function() {
  'use strict';

  // Configuración
  const CONFIG = {
    newPropertyDays: 7,        // Días para considerar "nuevo"
    hotPropertyDays: 14,       // Días para considerar "popular"
    minViewsPerDay: 15,        // Vistas mínimas por día
    maxViewsPerDay: 120,       // Vistas máximas por día
    viewDecayFactor: 0.85,     // Factor de decaimiento de vistas con el tiempo
    lowInventoryThreshold: 3   // Umbral para "pocas disponibles"
  };

  /**
   * Calcula días desde que se agregó la propiedad
   * @param {String} addedDate - Fecha en formato 'YYYY-MM-DD'
   * @returns {Number} Días desde agregación
   */
  function getDaysSinceAdded(addedDate) {
    if (!addedDate) return 999; // Si no hay fecha, asumir antigua

    try {
      const added = new Date(addedDate);
      const now = new Date();
      const diffTime = Math.abs(now - added);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (e) {
      return 999;
    }
  }

  /**
   * Determina si una propiedad es "nueva"
   * @param {Object} property - Objeto de propiedad
   * @returns {Boolean}
   */
  function isNew(property) {
    const days = getDaysSinceAdded(property.added);
    return days <= CONFIG.newPropertyDays;
  }

  /**
   * Determina si una propiedad es "popular" (hot)
   * @param {Object} property - Objeto de propiedad
   * @returns {Boolean}
   */
  function isHot(property) {
    const days = getDaysSinceAdded(property.added);
    const score = property.highlightScore || 0;

    // Es hot si tiene alto score Y fue agregada recientemente
    return days <= CONFIG.hotPropertyDays && score >= 85;
  }

  /**
   * Genera número de vistas simuladas (basado en días y score)
   * @param {Object} property - Objeto de propiedad
   * @returns {Number} Número de vistas en las últimas 24 horas
   */
  function getViewCount(property) {
    const days = getDaysSinceAdded(property.added);
    const score = property.highlightScore || 50;
    const featured = property.featured ? 1.5 : 1;

    // Las propiedades nuevas tienen más vistas
    const recencyBoost = days <= 7 ? 1.8 : days <= 14 ? 1.4 : 1;

    // Base de vistas según score (0-100)
    const baseViews = CONFIG.minViewsPerDay +
      ((CONFIG.maxViewsPerDay - CONFIG.minViewsPerDay) * (score / 100));

    // Aplicar modificadores
    let views = baseViews * featured * recencyBoost;

    // Decaimiento con el tiempo (propiedades viejas tienen menos vistas)
    if (days > 30) {
      views *= Math.pow(CONFIG.viewDecayFactor, Math.floor((days - 30) / 7));
    }

    // Agregar variación aleatoria ±15%
    const variance = 0.85 + (Math.random() * 0.3);
    views *= variance;

    return Math.max(CONFIG.minViewsPerDay, Math.round(views));
  }

  /**
   * Cuenta propiedades similares disponibles
   * @param {Object} property - Propiedad actual
   * @param {Array} allProperties - Todas las propiedades
   * @returns {Number} Cantidad de propiedades similares
   */
  function countSimilarProperties(property, allProperties) {
    if (!allProperties || allProperties.length === 0) {
      return 0;
    }

    return allProperties.filter(p => {
      return p.id !== property.id &&
             p.type === property.type &&
             p.neighborhood === property.neighborhood &&
             p.operation === property.operation &&
             p.available !== 0;
    }).length;
  }

  /**
   * Determina si hay baja disponibilidad
   * @param {Number} count - Cantidad de similares
   * @returns {Boolean}
   */
  function hasLowInventory(count) {
    return count > 0 && count <= CONFIG.lowInventoryThreshold;
  }

  /**
   * Genera badges de urgencia para una propiedad
   * @param {Object} property - Objeto de propiedad
   * @param {Array} allProperties - Todas las propiedades (opcional)
   * @returns {Object} { isNew, isHot, viewCount, similarCount, hasLowInventory }
   */
  function getUrgencyData(property, allProperties = []) {
    const similarCount = countSimilarProperties(property, allProperties);

    return {
      isNew: isNew(property),
      isHot: isHot(property),
      viewCount: getViewCount(property),
      similarCount: similarCount,
      hasLowInventory: hasLowInventory(similarCount),
      daysSinceAdded: getDaysSinceAdded(property.added)
    };
  }

  /**
   * Genera HTML para badge de "NUEVO"
   * @returns {String} HTML del badge
   */
  function renderNewBadge() {
    return '<span class="urgency-badge urgency-badge--new">✨ NUEVO</span>';
  }

  /**
   * Genera HTML para badge de "POPULAR"
   * @returns {String} HTML del badge
   */
  function renderHotBadge() {
    return '<span class="urgency-badge urgency-badge--hot">🔥 POPULAR</span>';
  }

  /**
   * Genera HTML para contador de vistas
   * @param {Number} count - Número de vistas
   * @returns {String} HTML del indicador
   */
  function renderViewCount(count) {
    return `<div class="urgency-indicator urgency-indicator--views">
      <span class="urgency-icon">👁️</span>
      <span class="urgency-text">Visto por <strong>${count}</strong> personas hoy</span>
    </div>`;
  }

  /**
   * Genera HTML para indicador de baja disponibilidad
   * @param {Number} count - Cantidad de similares
   * @param {String} neighborhood - Barrio
   * @returns {String} HTML del indicador
   */
  function renderLowInventory(count, neighborhood) {
    if (count === 0) {
      return `<div class="urgency-indicator urgency-indicator--exclusive">
        <span class="urgency-icon">⭐</span>
        <span class="urgency-text">Propiedad exclusiva en ${neighborhood}</span>
      </div>`;
    }

    return `<div class="urgency-indicator urgency-indicator--low">
      <span class="urgency-icon">⚡</span>
      <span class="urgency-text">Solo <strong>${count + 1}</strong> ${count === 0 ? 'disponible' : 'disponibles'} en ${neighborhood}</span>
    </div>`;
  }

  /**
   * Genera todos los indicadores de urgencia para una propiedad
   * @param {Object} property - Objeto de propiedad
   * @param {Array} allProperties - Todas las propiedades
   * @param {Object} options - Opciones { showBadges, showViews, showInventory }
   * @returns {Object} { badges: String, indicators: String }
   */
  function renderUrgencyElements(property, allProperties = [], options = {}) {
    const defaults = {
      showBadges: true,
      showViews: false,      // ⚠️ DESACTIVADO: Vistas simuladas (no reales)
      showInventory: true
    };
    const opts = { ...defaults, ...options };

    const data = getUrgencyData(property, allProperties);
    let badges = '';
    let indicators = '';

    // Badges (para la zona de imagen)
    if (opts.showBadges) {
      if (data.isNew) {
        badges += renderNewBadge();
      }
      if (data.isHot) {
        badges += renderHotBadge();
      }
    }

    // Indicadores (para la zona de meta)
    if (opts.showViews && data.viewCount > 0) {
      indicators += renderViewCount(data.viewCount);
    }

    if (opts.showInventory && data.hasLowInventory) {
      indicators += renderLowInventory(data.similarCount, property.neighborhood || property.city);
    }

    return { badges, indicators };
  }

  // Exponer API pública
  window.AltorraUrgency = {
    getUrgencyData,
    renderUrgencyElements,
    renderNewBadge,
    renderHotBadge,
    renderViewCount,
    renderLowInventory,
    isNew,
    isHot,
    getViewCount,
    countSimilarProperties,
    CONFIG
  };

  console.log('✅ Altorra Urgency module inicializado');

})();
