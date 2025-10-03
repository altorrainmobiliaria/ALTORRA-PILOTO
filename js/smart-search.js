/* =========================================================
   ALTORRA • Smart Search (V3 estable)
   - Mantiene abierto el dropdown al hacer scroll/touch
   - Soporta PC y móvil
   - Sin dependencias externas
   - Con caché local (TTL) y rutas de fallback para GH Pages
   ========================================================= */

(function () {
  'use strict';

  /* ------------------ Utilidades ------------------ */

  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalize(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
    return res.json();
  }

  // Intenta varias rutas (según tu propio patrón de fallback)
  async function fetchWithFallback(paths) {
    let lastErr;
    for (const p of paths) {
      try {
        return await fetchJSON(p);
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error('No se pudo cargar JSON');
  }

  // Caché sencilla con TTL usando localStorage
  async function getJSONCached(paths, ttlMs = 1000 * 60 * 30) {
    const key = 'altorra:ssrc:datajson';
    const now = Date.now();

    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && obj.expires > now && obj.data) {
          return obj.data;
        }
      }
    } catch (_) {}

    const data = await fetchWithFallback(paths);
    try {
      localStorage.setItem(
        key,
        JSON.stringify({ data, expires: now + ttlMs })
      );
    } catch (_) {}
    return data;
  }

  /* ------------------ Búsqueda ------------------ */

  const MIN_CHARS = 2;
  const MAX_SUGGESTIONS = 8;
  const DEBOUNCE_MS = 220;

  function fuzzyMatch(needle, haystack) {
    needle = needle.toLowerCase();
    let score = 0, ni = 0, hi = 0;
    while (ni < needle.length && hi < haystack.length) {
      if (needle[ni] === haystack[hi]) {
        score++; ni++;
      }
      hi++;
    }
    return ni === needle.length ? score / needle.length : 0;
  }

  async function searchProperties(query) {
    if (!query || query.length < MIN_CHARS) return [];

    // Fallbacks según tu estructura (repositorio piloto / raíz)
    const data = await getJSONCached(
      [
        'properties/data.json',
        '/ALTORRA-PILOTO/properties/data.json',
        '/PRUEBA-PILOTO/properties/data.json',
        '/properties/data.json'
      ],
      1000 * 60 * 20 // 20 min
    );

    const normalizedQuery = normalize(query);
    const results = [];

    (data.properties || []).forEach((prop) => {
      const idx = normalize(
        [
          prop.title,
          prop.description,
          prop.city,
          prop.neighborhood,
          prop.type,
          prop.id,
          Array.isArray(prop.features) ? prop.features.join(' ') : ''
        ].join(' ')
      );

      let score = 0;

      if (idx.includes(normalizedQuery)) score += 100;
      score += fuzzyMatch(normalizedQuery, idx) * 50;
      if (normalize(prop.title).includes(normalizedQuery)) score += 30;
      if (normalize(prop.city).includes(normalizedQuery)) score += 20;

      if (score > 0) results.push({ prop, score });
    });

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SUGGESTIONS)
      .map((r) => r.prop);
  }

  /* ------------------ UI: dropdown ------------------ */

  function ensureDropdown(inputEl) {
    let dd = document.getElementById('smart-search-dropdown');
    if (!dd) {
      dd = document.createElement('div');
      dd.id = 'smart-search-dropdown';
      dd.setAttribute('role', 'listbox');
      dd.setAttribute('aria-label', 'Sugerencias de búsqueda');
      dd.style.cssText = [
        'position:fixed',
        'top:0',
        'left:0',
        'width:0',
        'background:#fff',
        'border:1px solid rgba(0,0,0,.12)',
        'border-radius:0 0 12px 12px',
        'box-shadow:0 12px 32px rgba(0,0,0,.18)',
        'max-height:420px',
        'overflow-y:auto',
        'z-index:999999',
        'display:none'
      ].join(';');
      document.body.appendChild(dd);

      // No cerrar por interacciones dentro del panel
      dd.addEventListener('mousedown', (e) => e.preventDefault(), { passive: false });
      dd.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    }

    function position() {
      const r = inputEl.getBoundingClientRect();
      dd.style.top = r.bottom + 4 + 'px';
      dd.style.left = r.left + 'px';
      dd.style.width = r.width + 'px';
    }
    position();

    window.addEventListener('resize', position);
    window.addEventListener('scroll', position);

    return dd;
  }

  function render(results, dd) {
    if (!results.length) {
      dd.innerHTML = `
        <div style="padding:14px;text-align:center;color:#6b7280">
          Sin resultados. Prueba con otra palabra.
        </div>`;
      dd.style.display = 'block';
      return;
    }

    dd.innerHTML = '';
    results.forEach((p) => {
      const el = document.createElement('div');
      el.className = 'ss-item';
      el.setAttribute('role', 'option');
      el.style.cssText =
        'display:flex;gap:12px;padding:10px 12px;cursor:pointer;align-items:center';
      el.onmouseenter = () => (el.style.background = '#f9fafb');
      el.onmouseleave = () => (el.style.background = 'transparent');
      el.innerHTML = `
        <img src="${p.image || '/assets/placeholder.webp'}"
             alt="${escapeHtml(p.title || 'Propiedad')}"
             style="width:56px;height:56px;object-fit:cover;border-radius:8px;flex-shrink:0">
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            ${escapeHtml(p.title || 'Propiedad')}
          </div>
          <div style="color:#6b7280;font-size:.86rem">${escapeHtml(p.city || '')}</div>
        </div>
        <div style="font-weight:900;color:#d4af37;white-space:nowrap">
          ${p.price ? `$${Number(p.price).toLocaleString('es-CO')} COP` : ''}
        </div>
      `;
      el.addEventListener('click', () => {
        location.href = `detalle-propiedad.html?id=${encodeURIComponent(p.id)}`;
      });
      dd.appendChild(el);
    });

    dd.style.display = 'block';
  }

  function wireInput(inputEl) {
    const dd = ensureDropdown(inputEl);

    const doSearch = debounce(async () => {
      const q = inputEl.value.trim();
      if (q.length < MIN_CHARS) {
        dd.style.display = 'none';
        return;
      }

      dd.innerHTML =
        '<div style="padding:14px;text-align:center;color:#6b7280">Buscando…</div>';
      dd.style.display = 'block';

      try {
        const results = await searchProperties(q);
        render(results, dd);
      } catch (e) {
        console.error('[smart-search] error:', e);
        dd.innerHTML =
          '<div style="padding:14px;text-align:center;color:#ef4444">Error de búsqueda</div>';
        dd.style.display = 'block';
      }
    }, DEBOUNCE_MS);

    inputEl.addEventListener('input', doSearch);
    inputEl.addEventListener('focus', doSearch);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') dd.style.display = 'none';
    });

    // Cerrar cuando se hace click/tap fuera del input y del dropdown
    document.addEventListener('mousedown', (e) => {
      if (!dd.contains(e.target) && e.target !== inputEl) {
        dd.style.display = 'none';
      }
    });
    document.addEventListener('touchstart', (e) => {
      if (!dd.contains(e.target) && e.target !== inputEl) {
        dd.style.display = 'none';
      }
    }, { passive: true });
  }

  /* ------------------ Init ------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    // En tu home hay 1 input grande; ids habituales: f-search (y a veces f-city)
    const inputs = document.querySelectorAll('#f-search, #f-city');
    inputs.forEach(wireInput);
  });
})();
