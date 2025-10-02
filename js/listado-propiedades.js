/* ========================================
   ALTORRA - LISTADO DE PROPIEDADES
   Versión: 6.0 - CON BOTONES DE FAVORITO
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
  let filteredProperties = [];
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
        <button class="fav-btn" type="button" aria-label="Guardar favorito" aria-pressed="false" data-prop-id="${escapeHtml(p.id)}">
          <span class="heart">♡</span>
        </button>
      </div>
      <div class="meta">
        <h3>${escapeHtml(p.title)}</h3>
        <div class="price">${getPriceLabel(p)}</div>
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
    if (!root) {
      console.warn('[Listado] Elemento #list no encontrado');
      return;
    }
    
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

  function applyFilters() {
    const city = (document.getElementById('f-city')?.value || '').trim();
    const type = document.getElementById('f-type')?.value || '';
    const min = document.getElementById('f-min')?.value || '';
    const max = document.getElementById('f-max')?.value || '';
    const sort = document.getElementById('f-sort')?.value || 'relevance';
    const search = (document.getElementById('f-search')?.value || '').trim();
    
    const bedsMin = document.getElementById('f-beds-min')?.value || '';
    const bathsMin = document.getElementById('f-baths-min')?.value || '';
    const sqmMin = document.getElementById('f-sqm-min')?.value || '';
    const sqmMax = document.getElementById('f-sqm-max')?.value || '';

    let arr = allProperties.slice();

    if (search) {
      const terms = search.toLowerCase().split(/\s+/);
      arr = arr.filter(p => {
        const searchable = [
          p.title, p.description, p.city, p.type, 
          p.neighborhood, p.id, (p.features || []).join(' ')
        ].join(' ').toLowerCase();
        return terms.every(term => searchable.includes(term));
      });
    }

    if (city) {
      arr = arr.filter(p => p.city.toLowerCase().includes(city.toLowerCase()));
    }

    if (type) {
      arr = arr.filter(p => p.type === type);
    }
    
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
      if (!isNaN(v)) {
        arr = arr.filter(p => (p.price || 0) >= v);
      }
    }

    if (max) {
      const v = Number(max);
      if (!isNaN(v)) {
        arr = arr.filter(p => (p.price || 0) <= v);
      }
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
    const CACHE_KEY = 'altorra:properties:v6';
    const CACHE_TTL = 1000 * 60 * 30;
    
    let cached = null;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && obj.t && (Date.now() - obj.t) < CACHE_TTL && obj.data) {
          cached = obj.data;
        }
      }
    } catch (_) {}

    if (cached) {
      fetch(url, { cache: 'no-store' })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(fresh => {
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: fresh }));
          } catch (_) {}
        })
        .catch(() => {});
      return cached;
    }

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data }));
    } catch (_) {}
    return data;
  }

  async function init() {
    const counter = document.getElementById('resultsCount');
    const list = document.getElementById('list');
    
    if (counter) {
      counter.innerHTML = '<span style="color:var(--muted)">⏳ Cargando propiedades...</span>';
    }
    if (list) {
      list.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)"><p>⏳ Cargando propiedades...</p></div>';
    }
    
    try {
      const data = await getJSONCached('properties/data.json');
      
      const validOperations = OPERATION_MAP[PAGE_MODE] || [];
      allProperties = Array.isArray(data) ? 
        data.filter(p => {
          const op = String(p.operation || '').toLowerCase().trim();
          return validOperations.includes(op);
        }) : 
        [];

      const qs = new URLSearchParams(location.search);
      if (qs.has('city')) {
        const cityInput = document.getElementById('f-city');
        if (cityInput) cityInput.value = qs.get('city');
      }
      if (qs.has('type')) {
        const typeSelect = document.getElementById('f-type');
        if (typeSelect) typeSelect.value = qs.get('type');
      }
      if (qs.has('min')) {
        const minInput = document.getElementById('f-min');
        if (minInput) minInput.value = qs.get('min');
      }
      if (qs.has('max')) {
        const maxInput = document.getElementById('f-max');
        if (maxInput) maxInput.value = qs.get('max');
      }
      if (qs.has('search')) {
        const searchInput = document.getElementById('f-search');
        if (searchInput) searchInput.value = qs.get('search');
      }

      filteredProperties = applyFilters();
      
      updateResultsCount(allProperties.length, filteredProperties.length);
      
      renderList(filteredProperties.slice(0, PAGE_SIZE), true);
      updateLoadMoreButton(filteredProperties.length);

      if (filteredProperties.length === 0) {
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

  function attachEvents() {
    const btnApply = document.getElementById('btnApply');
    if (btnApply && !btnApply.dataset.attached) {
      btnApply.dataset.attached = 'true';
      btnApply.addEventListener('click', () => {
        filteredProperties = applyFilters();
        updateResultsCount(allProperties.length, filteredProperties.length);
        renderList(filteredProperties.slice(0, PAGE_SIZE), true);
        updateLoadMoreButton(filteredProperties.length);

        if (filteredProperties.length === 0) {
          const list = document.getElementById('list');
          if (list) {
            list.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)"><h3>No se encontraron propiedades</h3><p>Intenta ajustar los filtros de búsqueda.</p></div>';
          }
        }
      });
    }

    const btnClear = document.getElementById('btnClear');
    if (btnClear && !btnClear.dataset.attached) {
      btnClear.dataset.attached = 'true';
      btnClear.addEventListener('click', () => {
        ['f-city', 'f-type', 'f-min', 'f-max', 'f-sort', 'f-search', 'f-beds-min', 'f-baths-min', 'f-sqm-min', 'f-sqm-max'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = '';
        });
        
        if (document.getElementById('f-sort')) document.getElementById('f-sort').value = 'relevance';
        
        filteredProperties = allProperties.slice();
        updateResultsCount(allProperties.length, allProperties.length);
        renderList(allProperties.slice(0, PAGE_SIZE), true);
        updateLoadMoreButton(allProperties.length);
      });
    }

    const btnLoadMore = document.getElementById('btnLoadMore');
    if (btnLoadMore && !btnLoadMore.dataset.attached) {
      btnLoadMore.dataset.attached = 'true';
      btnLoadMore.addEventListener('click', () => {
        const next = filteredProperties.slice(renderedCount, renderedCount + PAGE_SIZE);
        renderList(next, false);
        updateLoadMoreButton(filteredProperties.length);
      });
    }
  }

  function startApp() {
    if (window.__ALTORRA_LISTADO_INIT__) return;
    window.__ALTORRA_LISTADO_INIT__ = true;
    
    init();
    attachEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
  } else {
    startApp();
  }

  console.log('[Listado] Sistema inicializado ✅');
})();
