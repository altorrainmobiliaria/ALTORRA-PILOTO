/* ========================================
   ALTORRA - LISTADO DE PROPIEDADES
   Versión: 3.3 - CARGA GARANTIZADA
   Fecha: 01-Oct-2025
   ======================================== */

(function() {
  'use strict';

  const PAGE_SIZE = 9;
  const WHATSAPP = { phone: '573235016747', company: 'Altorra Inmobiliaria' };
  
  const path = window.location.pathname.toLowerCase();
  const PAGE_MODE = path.includes('arrendar') ? 'arrendar' :
                    path.includes('alojamientos') ? 'alojamientos' : 'comprar';

  const OPERATION_MAP = {
    'comprar': ['comprar', 'venta', 'ventas', 'sell', 'sale'],
    'arrendar': ['arrendar', 'arriendo', 'alquiler', 'alquilar', 'renta', 'rent'],
    'alojamientos': ['dias', 'por_dias', 'alojar', 'alojamientos', 'por día', 'por_dias', 'temporada', 'vacacional', 'noche']
  };

  let allProperties = [];
  let renderedCount = 0;

  function formatCOP(n) {
    if (!n && n !== 0) return '';
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function capitalize(s) {
    s = String(s || '');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"]/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
    }[c]));
  }

  function getPriceLabel(p) {
    if (!p.price) return '';
    const formatted = '$' + formatCOP(p.price) + ' COP';
    if (PAGE_MODE === 'arrendar') return formatted + ' / mes';
    if (PAGE_MODE === 'alojamientos') return formatted + ' / noche';
    return formatted;
  }

  function buildWhatsAppLink(p) {
    const detailsUrl = new URL('detalle-propiedad.html?id=' + encodeURIComponent(p.id), location.href).href;
    const price = getPriceLabel(p);
    const text = `Hola ${WHATSAPP.company}, me interesa la propiedad "${p.title}" (ID: ${p.id}) en ${p.city} por ${price}. ¿Podemos agendar una visita? Detalles: ${detailsUrl}`;
    return `https://wa.me/${WHATSAPP.phone}?text=${encodeURIComponent(text)}`;
  }

  function createCard(p) {
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('role', 'listitem');
    
    const imgSrc = p.image ? 
      (p.image.startsWith('http') || p.image.startsWith('/') ? p.image : '/' + p.image) :
      'https://i.postimg.cc/0yYb8Y6r/placeholder.png';

    card.innerHTML = `
      <div class="media">
        <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.title || 'Propiedad')}" loading="lazy" decoding="async"/>
        <div class="badges">
          <span class="badge"><small>Ciudad</small>&nbsp;${escapeHtml(p.city)}</span>
          <span class="badge badge--dark">${capitalize(p.type)}</span>
          ${p.sqm ? `<span class="badge">${p.sqm} m²</span>` : ''}
          ${(p.beds || 0) > 0 ? `<span class="badge">${p.beds}H · ${p.baths || 0}B</span>` : ''}
        </div>
        <button class="fav-btn" type="button" aria-label="Guardar favorito" aria-pressed="false">
          <span class="heart">♡</span>
        </button>
      </div>
      <div class="meta">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
          <h3>${escapeHtml(p.title)}</h3>
          <div class="price">${getPriceLabel(p)}</div>
        </div>
        <div class="specs">${p.beds ? p.beds + 'H · ' : ''}${p.baths ? p.baths + 'B · ' : ''}${p.sqm ? p.sqm + ' m² · ' : ''}${escapeHtml(p.city)} · ${capitalize(p.type)}</div>
        <div class="cta">
          <a class="btn btn-primary" href="detalle-propiedad.html?id=${encodeURIComponent(p.id)}">Ver detalles</a>
          <a class="btn btn-ghost" href="${buildWhatsAppLink(p)}" target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.cta') || e.target.closest('.fav-btn')) return;
      window.location.href = 'detalle-propiedad.html?id=' + encodeURIComponent(p.id);
    });

    return card;
  }

  function renderList(items, replace) {
    const root = document.getElementById('list');
    if (!root) return;
    
    if (replace) {
      root.innerHTML = '';
      renderedCount = 0;
    }

    const fragment = document.createDocumentFragment();
    items.forEach(p => fragment.appendChild(createCard(p)));
    root.appendChild(fragment);
    
    renderedCount += items.length;

    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('altorra:properties-loaded'));
    }, 100);
  }

  function applyFilters({ city, type, min, max, sort, search, bedsMin, bathsMin, sqmMin, sqmMax }) {
    let arr = allProperties.slice();

    if (search) {
      const terms = search.toLowerCase().trim().split(/\s+/);
      arr = arr.filter(p => {
        const searchable = [
          p.title, p.description, p.city, p.type, 
          p.neighborhood, p.id, (p.features || []).join(' ')
        ].join(' ').toLowerCase();
        return terms.every(term => searchable.includes(term));
      });
    }

    if (city) arr = arr.filter(p => p.city.toLowerCase().includes(city.toLowerCase()));
    if (type) arr = arr.filter(p => p.type === type);
    
    if (bedsMin && bedsMin !== '') {
      const minBeds = parseInt(bedsMin, 10);
      if (!isNaN(minBeds)) {
        arr = arr.filter(p => (p.beds || 0) >= minBeds);
      }
    }
    
    if (bathsMin && bathsMin !== '') {
      const minBaths = parseInt(bathsMin, 10);
      if (!isNaN(minBaths)) {
        arr = arr.filter(p => (p.baths || 0) >= minBaths);
      }
    }
    
    if (sqmMin && sqmMin !== '') {
      const minSqm = parseFloat(sqmMin);
      if (!isNaN(minSqm)) {
        arr = arr.filter(p => (p.sqm || 0) >= minSqm);
      }
    }
    
    if (sqmMax && sqmMax !== '') {
      const maxSqm = parseFloat(sqmMax);
      if (!isNaN(maxSqm)) {
        arr = arr.filter(p => (p.sqm || 0) <= maxSqm);
      }
    }
    
    if (min) {
      const v = Number(min);
      arr = arr.filter(p => p.price >= (isNaN(v) ? 0 : v));
    }
    if (max) {
      const v = Number(max);
      arr = arr.filter(p => p.price <= (isNaN(v) ? Infinity : v));
    }

    if (sort === 'price-asc') {
      arr.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === 'price-desc') {
      arr.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sort === 'newest') {
      arr.sort((a, b) => new Date(b.added || '2000-01-01') - new Date(a.added || '2000-01-01'));
    } else if (sort === 'sqm-desc') {
      arr.sort((a, b) => (b.sqm || 0) - (a.sqm || 0));
    } else {
      arr.sort((a, b) => {
        const featDiff = (b.featured || 0) - (a.featured || 0);
        if (featDiff !== 0) return featDiff;
        return (b.highlightScore || 0) - (a.highlightScore || 0);
      });
    }

    return arr;
  }

  function updateResultsCount(total, filtered) {
    const el = document.getElementById('resultsCount');
    if (!el) return;
    
    if (filtered === total) {
      el.innerHTML = `Mostrando <strong>${total}</strong> ${total === 1 ? 'propiedad' : 'propiedades'}`;
    } else {
      el.innerHTML = `<strong>${filtered}</strong> de <strong>${total}</strong> propiedades encontradas`;
    }
  }

  function updateLoadMoreButton(filteredCount) {
    const btn = document.getElementById('btnLoadMore');
    if (!btn) return;
    
    if (filteredCount > renderedCount) {
      btn.style.display = 'inline-block';
      btn.textContent = `Cargar más (${filteredCount - renderedCount} restantes)`;
    } else {
      btn.style.display = 'none';
    }
  }

  async function getJSONCached(url) {
    const __ALT_NS = 'altorra:json:';
    const __ALT_VER = '2025-10-01.3';
    const jsonKey = __ALT_NS + url + '::' + __ALT_VER;
    
    let cached = null;
    try {
      const raw = localStorage.getItem(jsonKey);
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && obj.t && (Date.now() - obj.t) < 1000 * 60 * 60 * 6 && obj.data) {
          cached = obj.data;
        }
      }
    } catch (_) {}

    if (cached) {
      fetch(url, { cache: 'no-store' })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(fresh => {
          try {
            localStorage.setItem(jsonKey, JSON.stringify({ t: Date.now(), data: fresh }));
          } catch (_) {}
        })
        .catch(() => {});
      return cached;
    }

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    try {
      localStorage.setItem(jsonKey, JSON.stringify({ t: Date.now(), data }));
    } catch (_) {}
    return data;
  }

  async function init() {
    console.log('[Altorra] Inicializando listado. Modo:', PAGE_MODE);
    
    const counter = document.getElementById('resultsCount');
    const list = document.getElementById('list');
    
    // ✅ FORZAR mensaje de carga
    if (counter) {
      counter.innerHTML = '<span style="color:var(--muted)">⏳ Cargando propiedades...</span>';
    }
    if (list && list.children.length === 0) {
      list.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)"><p>⏳ Cargando propiedades...</p></div>';
    }
    
    try {
      const data = await getJSONCached('properties/data.json');
      console.log('[Altorra] Propiedades cargadas:', data ? data.length : 0);

      const validOperations = OPERATION_MAP[PAGE_MODE] || [];
      allProperties = Array.isArray(data) ? 
        data.filter(p => {
          const op = String(p.operation || '').toLowerCase().trim();
          return validOperations.includes(op);
        }) : 
        [];

      console.log('[Altorra] Propiedades filtradas por operación:', allProperties.length);

      const qs = new URLSearchParams(location.search);
      const filters = {
        city: qs.get('city') || '',
        type: qs.get('type') || '',
        min: qs.get('min') || '',
        max: qs.get('max') || '',
        sort: qs.get('sort') || 'relevance',
        search: qs.get('search') || '',
        bedsMin: qs.get('beds') || '',
        bathsMin: qs.get('baths') || '',
        sqmMin: qs.get('sqm_min') || '',
        sqmMax: qs.get('sqm_max') || ''
      };

      if (document.getElementById('f-city')) document.getElementById('f-city').value = filters.city;
      if (document.getElementById('f-type') && filters.type) document.getElementById('f-type').value = filters.type;
      if (document.getElementById('f-min') && filters.min) document.getElementById('f-min').value = filters.min;
      if (document.getElementById('f-max') && filters.max) document.getElementById('f-max').value = filters.max;
      if (document.getElementById('f-sort') && filters.sort) document.getElementById('f-sort').value = filters.sort;
      if (document.getElementById('f-search')) document.getElementById('f-search').value = filters.search;
      if (document.getElementById('f-beds-min') && filters.bedsMin) document.getElementById('f-beds-min').value = filters.bedsMin;
      if (document.getElementById('f-baths-min') && filters.bathsMin) document.getElementById('f-baths-min').value = filters.bathsMin;
      if (document.getElementById('f-sqm-min') && filters.sqmMin) document.getElementById('f-sqm-min').value = filters.sqmMin;
      if (document.getElementById('f-sqm-max') && filters.sqmMax) document.getElementById('f-sqm-max').value = filters.sqmMax;

      const filtered = applyFilters(filters);
      const list = document.getElementById('list');
      if (list) list.dataset.filtered = JSON.stringify(filtered);
      
      updateResultsCount(allProperties.length, filtered.length);
      
      renderList(filtered.slice(0, PAGE_SIZE), true);
      updateLoadMoreButton(filtered.length);

      if (filtered.length === 0) {
        const list = document.getElementById('list');
        if (list) {
          list.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)"><h3>No se encontraron propiedades</h3><p>Intenta ajustar los filtros de búsqueda.</p></div>';
        }
      }

    } catch (err) {
      console.error('[Altorra] Error al cargar propiedades:', err);
      const list = document.getElementById('list');
      if (list) {
        list.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)"><p>Error al cargar propiedades. Por favor, recarga la página.</p></div>';
      }
      const counter = document.getElementById('resultsCount');
      if (counter) counter.textContent = 'Error al cargar';
    }
  }

  function startApp() {
    if (window.__ALTORRA_LISTADO_INIT__) return;
    window.__ALTORRA_LISTADO_INIT__ = true;
    init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
  } else {
    startApp();
  }

  
  // Parche: actualización en tiempo real de contador y filtros mínimos/máximo área
  function __applyAndRenderFromUI() {
    const filters = {
      city: document.getElementById('f-city')?.value.trim() || '',
      type: document.getElementById('f-type')?.value || '',
      min: document.getElementById('f-min')?.value || '',
      max: document.getElementById('f-max')?.value || '',
      sort: document.getElementById('f-sort')?.value || 'relevance',
      search: document.getElementById('f-search')?.value.trim() || '',
      bedsMin: document.getElementById('f-beds-min')?.value || '',
      bathsMin: document.getElementById('f-baths-min')?.value || '',
      sqmMin: document.getElementById('f-sqm-min')?.value || '',
      sqmMax: document.getElementById('f-sqm-max')?.value || ''
    };
    const filtered = applyFilters(filters);
    const list = document.getElementById('list');
    if (list) list.dataset.filtered = JSON.stringify(filtered);
    updateResultsCount(allProperties.length, filtered.length);
    renderList(filtered.slice(0, PAGE_SIZE), true);
    updateLoadMoreButton(filtered.length);
  }

  function attachEvents() {
    
    if (document.getElementById('f-beds-min')) {
      document.getElementById('f-beds-min').addEventListener('input', () => {
        __applyAndRenderFromUI();
      });
    }
    
    if (document.getElementById('f-beds-min')) {
      document.getElementById('f-beds-min').addEventListener('change', () => {
        __applyAndRenderFromUI();
      });
    }
    
    if (document.getElementById('f-baths-min')) {
      document.getElementById('f-baths-min').addEventListener('input', () => {
        __applyAndRenderFromUI();
      });
    }
    
    if (document.getElementById('f-baths-min')) {
      document.getElementById('f-baths-min').addEventListener('change', () => {
        __applyAndRenderFromUI();
      });
    }
    
    if (document.getElementById('f-sqm-min')) {
      document.getElementById('f-sqm-min').addEventListener('input', () => {
        __applyAndRenderFromUI();
      });
    }
    
    if (document.getElementById('f-sqm-min')) {
      document.getElementById('f-sqm-min').addEventListener('change', () => {
        __applyAndRenderFromUI();
      });
    }
    
    if (document.getElementById('f-sqm-max')) {
      document.getElementById('f-sqm-max').addEventListener('input', () => {
        __applyAndRenderFromUI();
      });
    }
    
    if (document.getElementById('f-sqm-max')) {
      document.getElementById('f-sqm-max').addEventListener('change', () => {
        __applyAndRenderFromUI();
      });
    }
    
    if (document.getElementById('f-sort')) {
      document.getElementById('f-sort').addEventListener('change', () => {
        __applyAndRenderFromUI();
      });
    }
    const btnApply = document.getElementById('btnApply');
    if (btnApply) {
      btnApply.addEventListener('click', () => {
        const filters = {
          city: document.getElementById('f-city')?.value.trim() || '',
          type: document.getElementById('f-type')?.value || '',
          min: document.getElementById('f-min')?.value || '',
          max: document.getElementById('f-max')?.value || '',
          sort: document.getElementById('f-sort')?.value || 'relevance',
          search: document.getElementById('f-search')?.value.trim() || '',
          bedsMin: document.getElementById('f-beds-min')?.value || '',
          bathsMin: document.getElementById('f-baths-min')?.value || '',
          sqmMin: document.getElementById('f-sqm-min')?.value || '',
          sqmMax: document.getElementById('f-sqm-max')?.value || ''
        };
        
        console.log('[Altorra] Aplicando filtros:', filters);
        
        const filtered = applyFilters(filters);
        const list = document.getElementById('list');
        if (list) list.dataset.filtered = JSON.stringify(filtered);
        
        updateResultsCount(allProperties.length, filtered.length);
        renderList(filtered.slice(0, PAGE_SIZE), true);
        updateLoadMoreButton(filtered.length);

        if (filtered.length === 0) {
          const list = document.getElementById('list');
          if (list) {
            list.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)"><h3>No se encontraron propiedades</h3><p>Intenta ajustar los filtros de búsqueda.</p></div>';
          }
        }
      });
    }

    const btnClear = document.getElementById('btnClear');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (document.getElementById('f-city')) document.getElementById('f-city').value = '';
        if (document.getElementById('f-type')) document.getElementById('f-type').value = '';
        if (document.getElementById('f-min')) document.getElementById('f-min').value = '';
        if (document.getElementById('f-max')) document.getElementById('f-max').value = '';
        if (document.getElementById('f-sort')) document.getElementById('f-sort').value = 'relevance';
        if (document.getElementById('f-search')) document.getElementById('f-search').value = '';
        if (document.getElementById('f-beds-min')) document.getElementById('f-beds-min').value = '';
        if (document.getElementById('f-baths-min')) document.getElementById('f-baths-min').value = '';
        if (document.getElementById('f-sqm-min')) document.getElementById('f-sqm-min').value = '';
        if (document.getElementById('f-sqm-max')) document.getElementById('f-sqm-max').value = '';
        
        const list = document.getElementById('list');
        if (list) list.dataset.filtered = JSON.stringify(allProperties);
        
        updateResultsCount(allProperties.length, allProperties.length);
        renderList(allProperties.slice(0, PAGE_SIZE), true);
        updateLoadMoreButton(allProperties.length);
      });
    }

    const btnLoadMore = document.getElementById('btnLoadMore');
    if (btnLoadMore) {
      btnLoadMore.addEventListener('click', () => {
        let filtered = [];
        try {
          const list = document.getElementById('list');
          filtered = JSON.parse(list?.dataset.filtered || 'null') || allProperties;
        } catch (e) {
          filtered = allProperties;
        }
        
        const next = filtered.slice(renderedCount, renderedCount + PAGE_SIZE);
        renderList(next, false);
        updateLoadMoreButton(filtered.length);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachEvents);
  } else {
    attachEvents();
  }

})();
