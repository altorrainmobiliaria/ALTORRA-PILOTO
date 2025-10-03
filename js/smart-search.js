/* ========================================
   ALTORRA - BÚSQUEDA INTELIGENTE (FIXED V2)
   Dropdown se agrega al body para evitar z-index issues
   ======================================== */

(function() {
  'use strict';

  // ========== CONFIG ==========
  const MIN_CHARS = 2;
  const MAX_SUGGESTIONS = 5;
  const DEBOUNCE_MS = 300;

  // ========== FUZZY SEARCH ==========
  function fuzzyMatch(needle, haystack) {
    needle = needle.toLowerCase();
    haystack = haystack.toLowerCase();
    
    let nIndex = 0;
    let hIndex = 0;
    let score = 0;
    
    while (nIndex < needle.length && hIndex < haystack.length) {
      if (needle[nIndex] === haystack[hIndex]) {
        score++;
        nIndex++;
      }
      hIndex++;
    }
    
    return nIndex === needle.length ? score / needle.length : 0;
  }

  // ========== NORMALIZACIÓN DE TEXTO ==========
  function normalize(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ========== BÚSQUEDA EN PROPIEDADES ==========
  async function searchProperties(query) {
    if (!query || query.length < MIN_CHARS) return [];
    
    try {
      const data = await window.getJSONCached('properties/data.json', {
        ttlMs: 1000 * 60 * 30,
        revalidate: false
      });
      
      if (!Array.isArray(data)) return [];
      
      const normalizedQuery = normalize(query);
      const results = [];
      
      data.forEach(prop => {
        const searchIndex = normalize([
          prop.title,
          prop.description,
          prop.city,
          prop.neighborhood,
          prop.type,
          prop.id,
          prop.features ? prop.features.join(' ') : ''
        ].join(' '));
        
        let score = 0;
        
        if (searchIndex.includes(normalizedQuery)) {
          score += 100;
        }
        
        const fuzzyScore = fuzzyMatch(normalizedQuery, searchIndex);
        score += fuzzyScore * 50;
        
        const titleMatch = normalize(prop.title).includes(normalizedQuery);
        if (titleMatch) score += 30;
        
        const cityMatch = normalize(prop.city).includes(normalizedQuery);
        if (cityMatch) score += 20;
        
        if (score > 0) {
          results.push({ prop, score });
        }
      });
      
      return results
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_SUGGESTIONS)
        .map(r => r.prop);
        
    } catch (err) {
      console.error('[Smart Search] Error:', err);
      return [];
    }
  }

  // ========== UI - CREAR DROPDOWN (AGREGADO AL BODY) ==========
  function createSuggestionsDropdown(inputEl) {
    let dropdown = document.getElementById('smart-search-dropdown');
    
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'smart-search-dropdown';
      dropdown.className = 'smart-search-dropdown';
      dropdown.setAttribute('role', 'listbox');
      dropdown.setAttribute('aria-label', 'Sugerencias de búsqueda');
      
      // 🔧 FIX: Se agrega al body, no al parent del input
      document.body.appendChild(dropdown);
    }
    
    // Posicionar el dropdown relativo al input
    function positionDropdown() {
      const rect = inputEl.getBoundingClientRect();
      Object.assign(dropdown.style, {
        position: 'fixed',
        top: rect.bottom + 4 + 'px',
        left: rect.left + 'px',
        width: rect.width + 'px',
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: '0 0 12px 12px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
        maxHeight: '400px',
        overflowY: 'auto',
        zIndex: '999999',
        display: 'none'
      });
    }
    
    positionDropdown();
    
    // Reposicionar al hacer scroll o resize
    window.addEventListener('scroll', positionDropdown, true);
    window.addEventListener('resize', positionDropdown);
    
    return dropdown;
  }

  // ========== UI - RENDERIZAR SUGERENCIAS ==========
  function renderSuggestions(results, dropdown, inputEl, query) {
    if (results.length === 0) {
      dropdown.innerHTML = `
        <div style="padding:16px;text-align:center;color:#6b7280">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin:0 auto 8px">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <div style="font-weight:600;margin-bottom:4px">No se encontraron resultados</div>
          <div style="font-size:0.9rem">Intenta con otra búsqueda</div>
        </div>
      `;
      dropdown.style.display = 'block';
      return;
    }
    
    dropdown.innerHTML = '';
    
    results.forEach((prop, index) => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.setAttribute('role', 'option');
      item.setAttribute('data-id', prop.id);
      
      const priceLabel = prop.price ? 
        `$${prop.price.toLocaleString('es-CO')} COP` : 
        'Precio a consultar';
      
      const title = escapeHtml(prop.title || 'Propiedad');
      
      item.innerHTML = `
        <div style="display:flex;gap:12px;padding:12px;cursor:pointer;transition:background 0.15s ease" 
             onmouseenter="this.style.background='#f9fafb'" 
             onmouseleave="this.style.background='transparent'">
          <img src="${prop.image || 'https://i.postimg.cc/0yYb8Y6r/placeholder.png'}" 
               alt="${title}"
               style="width:60px;height:60px;object-fit:cover;border-radius:8px;flex-shrink:0">
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
              ${title}
            </div>
            <div style="font-size:0.85rem;color:#6b7280;margin-bottom:4px">
              ${prop.city} • ${capitalize(prop.type)}${prop.beds ? ` • ${prop.beds}H` : ''}${prop.baths ? ` ${prop.baths}B` : ''}
            </div>
            <div style="font-size:0.9rem;color:#d4af37;font-weight:700">
              ${priceLabel}
            </div>
          </div>
        </div>
      `;
      
      item.addEventListener('click', () => {
        window.location.href = `detalle-propiedad.html?id=${encodeURIComponent(prop.id)}`;
      });
      
      item.addEventListener('mouseenter', () => {
        document.querySelectorAll('.suggestion-item').forEach(el => {
          el.style.background = 'transparent';
        });
        item.style.background = '#f9fafb';
      });
      
      dropdown.appendChild(item);
    });
    
    dropdown.style.display = 'block';
  }

  // ========== HELPERS ==========
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function capitalize(str) {
    return String(str || '').charAt(0).toUpperCase() + String(str || '').slice(1);
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

  // ========== INICIALIZACIÓN ==========
  function init() {
    const searchInputs = document.querySelectorAll('#f-search, input[placeholder*="Buscar"]');
    
    searchInputs.forEach(inputEl => {
      if (inputEl.dataset.smartSearchInit) return;
      inputEl.dataset.smartSearchInit = 'true';
      
      const dropdown = createSuggestionsDropdown(inputEl);
      
      const performSearch = debounce(async () => {
        const query = inputEl.value.trim();
        
        if (query.length < MIN_CHARS) {
          dropdown.style.display = 'none';
          return;
        }
        
        dropdown.innerHTML = `
          <div style="padding:16px;text-align:center;color:#6b7280">
            <div style="display:inline-block;width:24px;height:24px;border:3px solid #e5e7eb;border-top-color:#d4af37;border-radius:50%;animation:spin 0.8s linear infinite"></div>
            <div style="margin-top:8px;font-size:0.9rem">Buscando...</div>
          </div>
        `;
        dropdown.style.display = 'block';
        
        const results = await searchProperties(query);
        renderSuggestions(results, dropdown, inputEl, query);
      }, DEBOUNCE_MS);
      
      inputEl.addEventListener('input', performSearch);
      
      inputEl.addEventListener('focus', () => {
        if (inputEl.value.trim().length >= MIN_CHARS) {
          performSearch();
        }
      });
      
      document.addEventListener('click', (e) => {
        if (!inputEl.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.style.display = 'none';
        }
      });
      
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          dropdown.style.display = 'none';
          inputEl.blur();
        }
      });
    });
    
    if (!document.getElementById('smart-search-styles')) {
      const style = document.createElement('style');
      style.id = 'smart-search-styles';
      style.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .smart-search-dropdown::-webkit-scrollbar {
          width: 8px;
        }
        .smart-search-dropdown::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .smart-search-dropdown::-webkit-scrollbar-thumb {
          background: #d4af37;
          border-radius: 4px;
        }
        .smart-search-dropdown::-webkit-scrollbar-thumb:hover {
          background: #b8922f;
        }
      `;
      document.head.appendChild(style);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('altorra:properties-loaded', () => {
    setTimeout(init, 200);
  });

  console.log('[Smart Search] ✅ Sistema de búsqueda inteligente inicializado');

})();
