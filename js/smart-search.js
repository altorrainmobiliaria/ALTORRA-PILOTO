/* =========================================================
   ALTORRA • Smart Search (V5)
   - Relevancia estricta por tokens (título/barrio/ciudad/ID)
   - Fuzzy de apoyo (no cuela irrelevantes)
   - Panel estable: ancho bloqueado (clamp) hasta cerrar
   - PC/Móvil, teclado ↑/↓/Enter, mantiene abierto en scroll
   ========================================================= */

(function () {
  'use strict';

  /* ------------------ Utilidades ------------------ */

  const MIN_CHARS = 2;
  const MAX_SUGGESTIONS = 10;
  const DEBOUNCE_MS = 200;

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

  function splitTokens(str) {
    return normalize(str).split(' ').filter(Boolean);
  }

  // Fuzzy sencillo (subsecuencia)
  function fuzzyScore(needle, haystack) {
    needle = needle.toLowerCase();
    let s = 0, i=0, j=0;
    while (i<needle.length && j<haystack.length) {
      if (needle[i]===haystack[j]) { s++; i++; }
      j++;
    }
    return i===needle.length ? s/needle.length : 0;
  }

  function cacheBuster() {
    const slot = Math.floor(Date.now() / (1000*60*30)); // 30 min
    return (location.search ? '&' : '?') + 'v=' + slot;
  }

  async function fetchJSON(url) {
    const res = await fetch(url + cacheBuster(), { cache:'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url}`);
    return res.json();
  }

  async function fetchWithFallback(paths) {
    let last;
    for (const p of paths) { try { return await fetchJSON(p); } catch(e){ last=e; } }
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
    try { localStorage.setItem(key, JSON.stringify({ data, exp: now + 1000*60*20 })); } catch(_){}
    return data;
  }

  function toArrayData(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.properties)) return data.properties;
    for (const k in data) if (Array.isArray(data[k])) return data[k];
    return [];
  }

  /* ------------------ Búsqueda inteligente ------------------ */

  function fieldText(p) {
    const title = normalize(p.title);
    const city  = normalize(p.city);
    const hood  = normalize(p.neighborhood || p.barrio);
    const id    = normalize(p.id);
    const type  = normalize(p.type);
    const desc  = normalize(p.description);
    const feats = normalize(Array.isArray(p.features) ? p.features.join(' ') : '');
    return { title, city, hood, id, type, desc, feats };
  }

  // Relevancia por tokens: todos los tokens deben aparecer al menos en algún campo fuerte (title/hood/city/id)
  function tokensHitStrong(tokens, fields) {
    // Un token cuenta si aparece en title o hood o city o id
    return tokens.every(tok =>
      fields.title.includes(tok) ||
      fields.hood.includes(tok)  ||
      fields.city.includes(tok)  ||
      fields.id.includes(tok)
    );
  }

  function scoreProperty(tokens, qStr, fields) {
    let score = 0;

    // Pesos fuertes por coincidencias exactas en campos clave
    tokens.forEach(tok => {
      if (fields.title.includes(tok)) score += 50;
      if (fields.hood.includes(tok))  score += 40;
      if (fields.city.includes(tok))  score += 30;
      if (fields.id.includes(tok))    score += 35;
      if (fields.type.includes(tok))  score += 10;
    });

    // Apoyo con fuzzy sobre un índice global (sin permitir irrelevantes)
    const idx = [fields.title, fields.hood, fields.city, fields.id, fields.type, fields.desc, fields.feats].join(' ');
    score += fuzzyScore(qStr, idx) * 20;

    return score;
  }

  async function searchProps(query) {
    if (!query || query.length < MIN_CHARS) return [];
    const data = await loadData();
    const arr  = toArrayData(data);

    const tokens = splitTokens(query);
    const qStr   = tokens.join(' ');

    const results = [];
    for (const p of arr) {
      const f = fieldText(p);

      // Regla estricta: si el usuario escribió >=3 chars,
      // todos los tokens deben aparecer al menos en un campo fuerte.
      if (qStr.length >= 3 && !tokensHitStrong(tokens, f)) continue;

      const s = scoreProperty(tokens, qStr, f);
      if (s > 0) results.push({ p, s });
    }

    // Si no pasó nadie por la regla estricta (caso muy raro), relajar a "al menos 1 token en campos fuertes"
    if (results.length === 0 && qStr.length >= 3) {
      for (const p of arr) {
        const f = fieldText(p);
        const hasOne = tokens.some(tok =>
          f.title.includes(tok) || f.hood.includes(tok) || f.city.includes(tok) || f.id.includes(tok)
        );
        if (!hasOne) continue;
        const s = scoreProperty(tokens, qStr, f);
        if (s > 0) results.push({ p, s });
      }
    }

    return results.sort((a,b)=>b.s-a.s).slice(0, MAX_SUGGESTIONS).map(r=>r.p);
  }

  /* ------------------ UI: dropdown con ancho bloqueado ------------------ */

  function ensureDropdown(input) {
    let dd = document.getElementById('smart-search-dropdown');
    if (!dd) {
      dd = document.createElement('div');
      dd.id = 'smart-search-dropdown';
      dd.setAttribute('role','listbox');
      dd.setAttribute('aria-label','Sugerencias');
      dd.style.cssText = [
        'position:absolute','top:0','left:0',
        'background:#fff',
        'border:1px solid rgba(0,0,0,.12)',
        'border-radius:12px',
        'box-shadow:0 12px 32px rgba(0,0,0,.18)',
        'max-height:420px','overflow-y:auto',
        'z-index:2147483647','display:none'
      ].join(';');
      document.body.appendChild(dd);

      // Mantener abierto al interactuar
      dd.addEventListener('mousedown', e=>e.preventDefault(), { passive:false });
      dd.addEventListener('touchstart', e=>e.preventDefault(), { passive:false });
    }

    let lockedWidth = null;

    function clamp(val, min, max){ return Math.max(min, Math.min(max, val)); }

    function position({ lockWidth = false } = {}) {
      const r = input.getBoundingClientRect();
      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const desired = r.width;
      if (lockedWidth == null || lockWidth) {
        // min 360px, máx 920px, y nunca más que 96vw
        lockedWidth = clamp(desired, 360, Math.min(920, Math.floor(vw * 0.96)));
      }
      dd.style.top  = (r.top + window.scrollY + r.height + 6) + 'px';
      dd.style.left = (r.left + window.scrollX) + 'px';
      dd.style.width = lockedWidth + 'px';
    }

    // Al primer render bloqueamos el ancho
    position({ lockWidth: true });

    window.addEventListener('resize', () => position());
    window.addEventListener('scroll',  () => position(), { passive:true });

    return { dd, position, lockWidth: ()=>position({ lockWidth:true }) };
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
      row.style.cssText = 'display:flex;gap:12px;padding:12px 14px;cursor:pointer;align-items:center';
      row.onmouseenter = ()=> row.style.background = '#f9fafb';
      row.onmouseleave = ()=> row.style.background = 'transparent';

      row.innerHTML = `
        <img src="${p.image || '/assets/placeholder.webp'}"
             alt="${escapeHtml(p.title || 'Propiedad')}"
             style="width:60px;height:60px;object-fit:cover;border-radius:8px;flex-shrink:0">
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
      else if (e.key === 'Enter') { if (current>=0) { e.preventDefault(); items[current].click(); } }
      else if (e.key === 'Escape') { dd.style.display='none'; }
    });
  }

  /* ------------------ Init y wiring ------------------ */

  document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('#f-search, #f-city');
    inputs.forEach((input) => {
      const { dd, position, lockWidth } = ensureDropdown(input);

      const run = debounce(async () => {
        const q = input.value.trim();
        if (q.length < MIN_CHARS) { dd.style.display='none'; return; }
        dd.innerHTML = '<div style="padding:16px;text-align:center;color:#6b7280">Buscando…</div>';
        dd.style.display = 'block';
        lockWidth(); // bloquea ancho al primer render
        position();
        try {
          const results = await searchProps(q);
          renderList(results, dd);
          position();
        } catch (e) {
          console.error('[smart-search]', e);
          dd.innerHTML = '<div style="padding:16px;text-align:center;color:#ef4444">Error de búsqueda</div>';
        }
      }, DEBOUNCE_MS);

      input.addEventListener('input', run);
      input.addEventListener('focus', run);

      document.addEventListener('mousedown', (e)=>{
        if (!dd.contains(e.target) && e.target !== input) dd.style.display='none';
      });
      document.addEventListener('touchstart', (e)=>{
        if (!dd.contains(e.target) && e.target !== input) dd.style.display='none';
      }, { passive:true });

      enableKeyboard(input, dd);
    });
  });
})();
