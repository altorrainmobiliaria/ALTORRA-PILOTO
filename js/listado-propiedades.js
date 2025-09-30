/* ========================================
   ALTORRA - LISTADO DE PROPIEDADES (UNIFICADO)
   Archivo: js/listado-propiedades.js
   Versión: 2.1 - CORREGIDO
   ======================================== */

(function() {
  'use strict';

  // ===== CONFIGURACIÓN =====
  const PAGE_SIZE = 9;
  const WHATSAPP = { phone: '573235016747', company: 'Altorra Inmobiliaria' };
  
  // Determinar modo de página por URL
  const path = window.location.pathname.toLowerCase();
  const PAGE_MODE = path.includes('arrendar') ? 'arrendar' :
                    path.includes('alojamientos') ? 'alojamientos' : 'comprar';

  // ===== MAPEO DE OPERACIONES =====
  const OPERATION_MAP = {
    'comprar': ['comprar', 'venta', 'ventas', 'sell', 'sale'],
    'arrendar': ['arrendar', 'arriendo', 'alquiler', 'alquilar', 'renta', 'rent'],
    'alojamientos': ['dias', 'por_dias', 'alojar', 'alojamientos', 'por día', 'por_dias', 'temporada', 'vacacional', 'noche']
  };

  // ===== ESTADO =====
  let allProperties = [];
  let renderedCount = 0;

  // ===== UTILIDADES =====
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

  // ===== CREAR TARJETA =====
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

    // Click en tarjeta (excepto CTAs y favoritos)
    card.addEventListener('click', (e) => {
      if (e.target.closest('.cta') || e.target.closest('.fav-btn')) return;
      window.location.href = 'detalle-propiedad.html?id=' + encodeURIComponent(p.id);
    });

    return card;
  }

  // ===== RENDERIZAR LISTA =====
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

    // Disparar evento para que favoritos.js inicialice botones
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('altorra:properties-loaded'));
    }, 100);
  }

  // ===== FILTROS =====
  function applyFilters({ city, type, min, max, sort, search }) {
    let arr = allProperties.slice();

    // Búsqueda por texto
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
    if (min) {
      const v = Number(min);
      arr = arr.filter(p => p.price >= (isNaN(v) ? 0 : v));
    }
    if (max) {
      const v = Number(max);
      arr = arr.filter(p => p.price <= (isNaN(v) ? Infinity : v));
    }

    // Ordenamiento
    if (sort === 'price-asc') arr.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') arr.sort((a, b) => b.price - a.price);
    else if (sort === 'newest') arr.sort((a, b) => new Date(b.added || '2000-01-01') - new Date(a.added || '2000-01-01'));
    else {
      // Por defecto: featured primero, luego highlightScore
      arr.sort((a, b) => {
        const featDiff = (b.featured || 0) - (a.featured || 0);
        if (featDiff !== 0) return featDiff;
        return (b.highlightScore || 0) - (a.highlightScore || 0);
      });
    }

    return arr;
  }

  // ===== ACTUALIZAR BOTÓN "CARGAR MÁS" =====
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

  // ===== CACHÉ JSON =====
  async function getJSONCached(url) {
    const __ALT_NS = 'altorra:json:';
    const __ALT_VER = '2025-09-30.1';
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
      // Revalidar en background
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

  // ===== INICIALIZACIÓN =====
  async function init() {
    console.log('[Altorra] Inicializando listado de propiedades. Modo:', PAGE_MODE);
    
    try {
      // Cargar propiedades
      const data = await getJSONCached('properties/data.json');
      console.log('[Altorra] Propiedades cargadas:', data ? data.length : 0);

      // Filtrar por operación
      const validOperations = OPERATION_MAP[PAGE_MODE] || [];
      allProperties = Array.isArray(data) ? 
        data.filter(p => {
          const op = String(p.operation || '').toLowerCase().trim();
          return validOperations.includes(op);
        }) : 
        [];

      console.log('[Altorra] Propiedades filtradas por operación:', allProperties.length);

      // Leer parámetros de URL
      const qs = new URLSearchParams(location.search);
      const filters = {
        city: qs.get('city') || '',
        type: qs.get('type') || '',
        min: qs.get('min') || '',
        max: qs.get('max') || '',
        sort: qs.get('sort') || 'relevance',
        search: qs.get('search') || ''
      };

      // Pre-llenar filtros en el DOM
      if (document.getElementById('f-city')) document.getElementById('f-city').value = filters.city;
      if (document.getElementById('f-type') && filters.type) document.getElementById('f-type').value = filters.type;
      if (document.getElementById('f-min') && filters.min) document.getElementById('f-min').value = filters.min;
      if (document.getElementById('f-max') && filters.max) document.getElementById('f-max').value = filters.max;
      if (document.getElementById('f-sort') && filters.sort) document.getElementById('f-sort').value = filters.sort;
      if (document.getElementById('f-search')) document.getElementById('f-search').value = filters.search;

      // Aplicar filtros y renderizar
      const filtered = applyFilters(filters);
      const list = document.getElementById('list');
      if (list) list.dataset.filtered = JSON.stringify(filtered);
      
      renderList(filtered.slice(0, PAGE_SIZE), true);
      updateLoadMoreButton(filtered.length);

      // Mensaje si no hay resultados
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
    }
  }

  // ===== EVENTOS =====
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[Altorra] DOM listo, iniciando...');
    init();

    // Botón aplicar filtros
    const btnApply = document.getElementById('btnApply');
    if (btnApply) {
      btnApply.addEventListener('click', () => {
        const filters = {
          city: document.getElementById('f-city')?.value.trim() || '',
          type: document.getElementById('f-type')?.value || '',
          min: document.getElementById('f-min')?.value || '',
          max: document.getElementById('f-max')?.value || '',
          sort: document.getElementById('f-sort')?.value || 'relevance',
          search: document.getElementById('f-search')?.value.trim() || ''
        };
        
        const filtered = applyFilters(filters);
        const list = document.getElementById('list');
        if (list) list.dataset.filtered = JSON.stringify(filtered);
        
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

    // Botón limpiar filtros
    const btnClear = document.getElementById('btnClear');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (document.getElementById('f-city')) document.getElementById('f-city').value = '';
        if (document.getElementById('f-type')) document.getElementById('f-type').value = '';
        if (document.getElementById('f-min')) document.getElementById('f-min').value = '';
        if (document.getElementById('f-max')) document.getElementById('f-max').value = '';
        if (document.getElementById('f-sort')) document.getElementById('f-sort').value = 'relevance';
        if (document.getElementById('f-search')) document.getElementById('f-search').value = '';
        
        const list = document.getElementById('list');
        if (list) list.dataset.filtered = JSON.stringify(allProperties);
        
        renderList(allProperties.slice(0, PAGE_SIZE), true);
        updateLoadMoreButton(allProperties.length);
      });
    }

    // Botón cargar más
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
  });

})();
