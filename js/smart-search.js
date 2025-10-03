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
    let score = 0;
    let nIndex = 0;
    let hIndex = 0;

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

      const normalizedQuery = normalize(query);
      const results = [];

      data.properties.forEach(prop => {
        const searchIndex = normalize(
          [
            prop.title,
            prop.description,
            prop.city,
            prop.neighborhood,
            prop.type,
            prop.id,
            prop.features ? prop.features.join(' ') : ''
          ].join(' ')
        );

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

    // Evitar que al interactuar con el panel de resultados se cierre la búsqueda
      dropdown.addEventListener('mousedown', e => e.preventDefault());
      dropdown.addEventListener('touchstart', e => e.preventDefault());

    // Reposicionar al hacer scroll o resize
    window.addEventListener('scroll', positionDropdown);
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
      item.innerHTML = `
        <div style="display:flex;gap:12px;padding:12px;cursor:pointer;transition:background 0.15s ease" 
             onmouseenter="this.style.background='#f9fafb'" 
             onmouseleave="this.style.background='transparent'">
          <img src="${prop.image || 'https://i.postimg.cc/0yYb8Y6r/placeholder.png'}" 
               alt="${prop.title || 'Propiedad'}"
               style="width:60px;height:60px;object-fit:cover;border-radius:8px;flex-shrink:0">
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
              ${escapeHtml(prop.title || 'Propiedad')}
            </div>
            <div style="font-size:0.85rem;color:#6b7280;margin-bottom:4px">
              ${prop.city ? escapeHtml(prop.city) : ''}
            </div>
            <div style="font-weight:900;color:#d4af37;font-size:0.95rem">
              ${prop.price ? `$${prop.price.toLocaleString('es-CO')} COP` : 'Precio a consultar'}
            </div>
          </div>
        </div>
      `;
      item.addEventListener('click', () => {
        window.location.href = `detalle-propiedad.html?id=${encodeURIComponent(prop.id)}`;
      });
      dropdown.appendChild(item);
    });

    dropdown.style.display = 'block';
  }

  // ========== MAIN - ADJUNTAR BÚSQUEDA A INPUT ==========
  function attachSearch(inputEl) {
    const dropdown = createSuggestionsDropdown(inputEl);
    
    // Desbounced search
    const performSearch = debounce(async () => {
      const query = inputEl.value.trim();
      if (query.length < MIN_CHARS) {
        dropdown.style.display = 'none';
        return;
      }

      dropdown.innerHTML = `
        <div style="padding:16px;text-align:center;color:#6b7280">
          <div style="display:inline-block;width:24px;height:24px;border:4px solid var(--muted);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite"></div>
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
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdown.style.display = 'none';
        inputEl.blur();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('#f-search, #f-city');
    inputs.forEach(input => attachSearch(input));
  });
})();
