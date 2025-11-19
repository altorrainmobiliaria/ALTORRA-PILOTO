/* ========================================
   ALTORRA - UTILIDADES COMPARTIDAS
   Versión: 1.0.0
   ======================================== */

(function() {
  'use strict';

  // ========== FORMATEO ==========
  function formatCOP(n) {
    if (!n && n !== 0) return '';
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function capitalize(s) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }

  // ========== WHATSAPP ==========
  function buildWhatsAppLink(property, options = {}) {
    const phone = '573235016747';
    const company = 'Altorra Inmobiliaria';
    
    let priceText = '';
    if (property.price) {
      const formatted = '$' + formatCOP(property.price) + ' COP';
      if (property.operation === 'arrendar') priceText = formatted + ' / mes';
      else if (property.operation === 'dias') priceText = formatted + ' / noche';
      else priceText = formatted;
    }

    const defaultText = `Hola ${company}, me interesa la propiedad "${property.title}" (ID: ${property.id}) en ${property.city}${priceText ? ' por ' + priceText : ''}. ¿Podemos agendar una visita?`;
    
    const text = options.customText || defaultText;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }

  // ========== CACHE ==========
  const CACHE_VERSION = '2025-01-20.1';
  const CACHE_PREFIX = 'altorra:';

  function cacheKey(url) {
    return `${CACHE_PREFIX}${url}::${CACHE_VERSION}`;
  }

  async function getJSONCached(url, options = {}) {
    const { ttlMs = 1000 * 60 * 60 * 6, revalidate = true } = options;
    
    let cached = null;
    try {
      const raw = localStorage.getItem(cacheKey(url));
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && obj.t && (Date.now() - obj.t) < ttlMs && obj.data) {
          cached = obj.data;
        }
      }
    } catch (_) {}

    if (cached) {
      if (revalidate) {
        fetch(url, { cache: 'no-store' })
          .then(r => r.ok ? r.json() : Promise.reject())
          .then(data => {
            try {
              localStorage.setItem(cacheKey(url), JSON.stringify({ 
                t: Date.now(), 
                data 
              }));
              document.dispatchEvent(new CustomEvent('altorra:data-updated', { 
                detail: { url } 
              }));
            } catch (_) {}
          })
          .catch(() => {});
      }
      return cached;
    }

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    
    try {
      localStorage.setItem(cacheKey(url), JSON.stringify({ 
        t: Date.now(), 
        data 
      }));
    } catch (_) {}
    
    return data;
  }

  // ========== TOAST NOTIFICATIONS ==========
  function showToast(message, type = 'info') {
    const existing = document.getElementById('altorra-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'altorra-toast';
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    const styles = {
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: type === 'error' ? '#dc2626' : type === 'success' ? '#16a34a' : '#111',
      color: '#fff',
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: '600',
      zIndex: '9999',
      opacity: '0',
      transition: 'opacity 0.3s ease',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      maxWidth: '90vw',
      textAlign: 'center'
    };

    Object.assign(toast.style, styles);
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ========== LOADING INDICATOR ==========
  function showLoading(targetElement) {
    const loader = document.createElement('div');
    loader.className = 'altorra-loader';
    loader.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;color:var(--muted)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke-width="3" stroke-dasharray="31.4 31.4" opacity="0.25"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-width="3" stroke-linecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
          </path>
        </svg>
        <span>Cargando...</span>
      </div>
    `;
    if (targetElement) {
      targetElement.innerHTML = '';
      targetElement.appendChild(loader);
    }
    return loader;
  }

  function hideLoading(targetElement) {
    if (targetElement) {
      const loader = targetElement.querySelector('.altorra-loader');
      if (loader) loader.remove();
    }
  }

  // ========== ANALYTICS BÁSICO (Privacy-friendly) ==========
  function trackEvent(eventName, data = {}) {
    try {
      const events = JSON.parse(localStorage.getItem('altorra:analytics') || '[]');
      events.push({
        event: eventName,
        data: data,
        timestamp: Date.now(),
        page: window.location.pathname
      });
      
      // Mantener solo últimos 100 eventos
      if (events.length > 100) events.shift();
      
      localStorage.setItem('altorra:analytics', JSON.stringify(events));
      
      // Evento para que puedas leer analytics
      document.dispatchEvent(new CustomEvent('altorra:event-tracked', { 
        detail: { eventName, data } 
      }));
    } catch (_) {}
  }

  // ========== DEBOUNCE ==========
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ========== EXPONER API GLOBAL ==========
  window.AltorraUtils = {
    formatCOP,
    capitalize,
    escapeHtml,
    buildWhatsAppLink,
    getJSONCached,
    showToast,
    showLoading,
    hideLoading,
    trackEvent,
    debounce,
    version: '1.0.0'
  };

  console.log('✅ Altorra Utils cargado v1.0.0');
})();
