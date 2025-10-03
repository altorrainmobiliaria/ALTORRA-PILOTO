/* =========================================================
   ALTORRA • Smart Search (V4)
   - Preciso en GitHub Pages (scrollX/scrollY)
   - Soporta JSON como array o como { properties: [...] }
   - Fuzzy + parcial + sin acentos
   - Teclado: ↑/↓/Enter
   - Mantiene abierto en scroll/touch dentro del panel
   ========================================================= */

(function () {
  'use strict';

  /* ------------------ Utilidades ------------------ */

  function debounce(fn, wait) {
    let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn.apply(this,args), wait); };
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }

  function normalize(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^\w\s]/g,' ').replace(/\s+/g,' ').trim();
  }

  // Coincidencia parcial / fuzzy simple
  function fuzzyScore(needle, haystack) {
    needle = needle.toLowerCase();
    let score = 0, i=0, j=0;
    while (i<needle.length && j<haystack.length) {
      if (needle[i]===haystack[j]) { score++; i++; }
      j++;
    }
    return i===needle.length ? score/needle.length : 0;
  }

  async function fetchJSON(url) {
    const res = await fetch(url + cacheBuster(), { cache:'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url}`);
    return res.json();
  }

  function cacheBuster() {
    // cambia cada 30 min (evita que el navegador sirva JS/JSON viejos)
    const slot = Math.floor(Date.now() / (1000*60*30));
    return (urlHasQuery(window.location.href) ? '&' : '?') + 'v=' + slot;
  }
  function urlHasQuery(href){ try{ return new URL(href).search!==''; }catch{ return false; } }

  async function fetchWithFallback(paths) {
    let last;
    for (const p of paths) {
      try { return await fetchJSON(p); } catch(e) { last=e; }
    }
    throw last || new Error('No se pudo cargar data.json');
  }

  async function loadData() {
    const paths = [
      new URL('properties/data.json', location.href).href,
      location.origin + '/ALTORRA-PILOTO/properties/data.json',
      location.origin + '/PRUEBA-PILOTO/properties/data.json',
      location.origin + '/properties/data.json'
    ];
    const key = 'altorra:ssrc:data';
    const now = Date.now();
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && obj.exp > now) return obj.data;
      }
    } catch(_){}
    const data = await fetchWithFallback(paths);
    try {
      localStorage.setItem(key, JSON.stringify({ data, exp: now + 1000*60*20 })); // 20 min
    } catch(_){}
    return data;
  }

  function toArrayData(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.properties)) return data.properties;
    // otros envoltorios posibles
    for (const k in data) if (Array.isArray(data[k])) return data[k];
    return [];
  }

  /* ------------------ Búsqueda ------------------ */

  const MIN_CHARS = 2;
  const MAX_SUGGESTIONS = 10;
  const DEBOUNCE_MS = 200;

  async function searchProps(query) {
    if (!query || query.length < MIN_CHARS) return [];
    const data = await loadData();
    const arr = toArrayData(data);

    const q = normalize(query);
    const out = [];

    for (const prop of arr) {
      const idx = normalize([
        prop.title, prop.description, prop.city, prop.neighborhood,
        prop.type, prop.id, Array.isArray(prop.features)?prop.features.join(' '):''
      ].join(' '));

      let score = 0;
      // preferencia por coincidencia directa
      if (idx.includes(q)) score += 100;

      // fuzzy
      score += fuzzyScore(q, idx) * 50;

      // boosts
      if (normalize(prop.title).includes(q)) score += 30;
      if (normalize(prop.city).includes(q)) score += 20;
      if (normalize(prop.neighborhood).includes(q)) score += 15;

      if (score > 0) out.push({ prop, score });
    }

    return out.sort((a,b)=>b.score-a.score).slice(0, MAX_SUGGESTIONS).map(r=>r.prop);
  }

  /* ------------------ UI: dropdown absoluto ------------------ */

  function ensureDropdown(input) {
    let dd = document.getElementById('smart-search-dropdown');
    if (!dd) {
      dd = document.createElement('div');
      dd.id = 'smart-search-dropdown';
      dd.setAttribute('role','listbox');
      dd.setAttribute('aria-label','Sugerencias');
      dd.style.cssText = [
        'position:absolute',
        'top:0','left:0','width:0',
        'background:#fff',
        'border:1px solid rgba(0,0,0,.12)',
        'border-radius:12px',
        'box-shadow:0 12px 32px rgba(0,0,0,.18)',
        'max-height:420px','overflow-y:auto',
        'z-index:2147483647',
        'display:none'
      ].join(';');
      document.body.appendChild(dd);

      // No cerrar por interacciones dentro del panel
      dd.addEventListener('mousedown', e=>e.preventDefault(), { passive:false });
      dd.addEventListener('touchstart', e=>e.preventDefault(), { passive:false });
    }

    function position() {
      const r = input.getBoundingClientRect();
      dd.style.top  = (r.top + window.scrollY + r.height + 6) + 'px';
      dd.style.left = (r.left + window.scrollX) + 'px';
      dd.style.width = r.width + 'px';
    }
    position();

    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, { passive:true });

    return { dd, reposition: position };
  }

  function renderList(results, dd) {
    if (!results.length) {
      dd.innerHTML = `
        <div style="padding:16px;text-align:center;color:#6b7280;font-size:0.95rem">
          Sin resultados. Prueba con otra palabra.
        </div>`;
      dd.style.display = 'block';
      return;
    }
    dd.innerHTML = '';
    results.forEach((p, i) => {
      const row = document.createElement('div');
      row.className = 'ss-item';
      row.setAttribute('role','option');
      row.setAttribute('data-id', p.id);
      row.setAttribute('data-idx', i);
      row.style.cssText = 'display:flex;gap:12px;padding:10px 12px;cursor:pointer;align-items:center';
      row.onmouseenter = ()=> row.style.background = '#f9fafb';
      row.onmouseleave = ()=> row.style.background = 'transparent';

      row.innerHTML = `
        <img src="${p.image || '/assets/placeholder.webp'}"
             alt="${escapeHtml(p.title || 'Propiedad')}"
             style="width:56px;height:56px;object-fit:cover;border-radius:8px;flex-shrink:0">
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            ${escapeHtml(p.title || 'Propiedad')}
          </div>
          <div style="color:#6b7280;font-size:.86rem">
            ${escapeHtml(p.city || '')}${p.neighborhood ? ' · ' + escapeHtml(p.neighborhood) : ''}
          </div>
        </div>
        <div style="font-weight:900;color:#d4af37;white-space:nowrap">
          ${p.price ? `$${Number(p.price).toLocaleString('es-CO')} COP` : ''}
        </div>
      `;
      row.addEventListener('click', () => {
        location.href = `detalle-propiedad.html?id=${encodeURIComponent(p.id)}`;
      });
      dd.appendChild(row);
    });
    dd.style.display = 'block';
  }

  function enableKeyboard(input, dd) {
    let current = -1;
    function highlight(idx) {
      const items = dd.querySelectorAll('.ss-item');
      items.forEach(el => el.style.background = 'transparent');
      if (idx>=0 && idx<items.length){
        items[idx].style.background = '#eef2ff';
        items[idx].scrollIntoView({ block:'nearest' });
      }
      current = idx;
    }
    input.addEventListener('keydown', (e)=>{
      if (dd.style.display === 'none') return;
      const items = dd.querySelectorAll('.ss-item');
      if (!items.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); highlight(Math.min(items.length-1, current+1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); highlight(Math.max(0, current-1)); }
      else if (e.key === 'Enter') {
        if (current>=0) { e.preventDefault(); items[current].click(); }
      } else if (e.key === 'Escape') {
        dd.style.display='none';
      }
    });
  }

  /* ------------------ Init y wiring ------------------ */

  document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('#f-search, #f-city');
    inputs.forEach((input) => {
      const { dd, reposition } = ensureDropdown(input);

      const run = debounce(async () => {
        const q = input.value.trim();
        if (q.length < MIN_CHARS) { dd.style.display='none'; return; }
        dd.innerHTML = '<div style="padding:16px;text-align:center;color:#6b7280">Buscando…</div>';
        dd.style.display = 'block';
        reposition();
        try {
          const results = await searchProps(q);
          renderList(results, dd);
          reposition();
        } catch (e) {
          console.error('[smart-search]', e);
          dd.innerHTML = '<div style="padding:16px;text-align:center;color:#ef4444">Error de búsqueda</div>';
        }
      }, DEBOUNCE_MS);

      input.addEventListener('input', run);
      input.addEventListener('focus', run);

      // Cerrar si se hace click fuera
      document.addEventListener('mousedown', (e)=>{
        if (!dd.contains(e.target) && e.target !== input) dd.style.display='none';
      });
      document.addEventListener('touchstart', (e)=>{
        if (!dd.contains(e.target) && e.target !== input) dd.style.display='none';
      }, { passive:true });

      // Teclado
      enableKeyboard(input, dd);
    });
  });
})();
