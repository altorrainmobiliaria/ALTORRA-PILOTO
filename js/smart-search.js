/* =========================================================
   ALTORRA • Smart Search (V6 - Singleton)
   - Dropdown único para todos los inputs (PC/Móvil)
   - Listeners únicos (scroll/resize) → sin “encogimiento”
   - Relevancia estricta por tokens (title/hood/city/id)
   - Fuzzy de apoyo (no cuela irrelevantes)
   - Ancho bloqueado hasta cerrar, navegación ↑/↓/Enter
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Config ---------- */
  const MIN_CHARS = 2;
  const MAX_SUGGESTIONS = 10;
  const DEBOUNCE_MS = 200;
  const MIN_W = 360, MAX_W = 920, VW_LIMIT = 0.96; // clamp del ancho

  /* ---------- Utils ---------- */
  const debounce = (fn, wait) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); }; };
  const escapeHtml = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  const normalize  = s => String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w\s]/g,' ').replace(/\s+/g,' ').trim();
  const splitTokens = s => normalize(s).split(' ').filter(Boolean);
  const clamp = (v, min, max)=>Math.max(min, Math.min(max, v));
  const cacheBuster = ()=> (location.search ? '&' : '?') + 'v=' + Math.floor(Date.now()/(1000*60*30));
  const fuzzyScore = (n, h)=>{ n=n.toLowerCase(); let s=0,i=0,j=0; while(i<n.length && j<h.length){ if(n[i]===h[j]){s++;i++;} j++; } return i===n.length ? s/n.length : 0; };

  async function fetchJSON(u){ const r=await fetch(u+cacheBuster(),{cache:'no-store'}); if(!r.ok) throw new Error(`HTTP ${r.status}@${u}`); return r.json(); }
  async function fetchWithFallback(paths){ let last; for(const p of paths){ try{return await fetchJSON(p);}catch(e){last=e;} } throw last||new Error('No data.json'); }
  async function loadData(){
    const paths = [
      new URL('properties/data.json', location.href).href,
      location.origin + '/ALTORRA-PILOTO/properties/data.json',
      location.origin + '/PRUEBA-PILOTO/properties/data.json',
      location.origin + '/properties/data.json'
    ];
    const key='altorra:ssrc:data', now=Date.now();
    try{ const raw=localStorage.getItem(key); if(raw){ const o=JSON.parse(raw); if(o && o.exp>now) return o.data; } }catch(_){}
    const data=await fetchWithFallback(paths);
    try{ localStorage.setItem(key, JSON.stringify({data, exp: now+1000*60*20})); }catch(_){}
    return data;
  }
  const toArrayData = d => Array.isArray(d) ? d : (d && Array.isArray(d.properties) ? d.properties : Object.values(d||{}).find(Array.isArray) || []);

  /* ---------- Scoring ---------- */
  const fieldText = p => ({
    title: normalize(p.title),
    city : normalize(p.city),
    hood : normalize(p.neighborhood || p.barrio),
    id   : normalize(p.id),
    type : normalize(p.type),
    desc : normalize(p.description),
    feats: normalize(Array.isArray(p.features)?p.features.join(' '):'')
  });

  const tokensHitStrong = (tokens, f) =>
    tokens.every(tok => f.title.includes(tok) || f.hood.includes(tok) || f.city.includes(tok) || f.id.includes(tok));

  const scoreProperty = (tokens, qStr, f) => {
    let s=0;
    tokens.forEach(t=>{
      if(f.title.includes(t)) s+=50;
      if(f.hood .includes(t)) s+=40;
      if(f.city .includes(t)) s+=30;
      if(f.id   .includes(t)) s+=35;
      if(f.type .includes(t)) s+=10;
    });
    const idx=[f.title,f.hood,f.city,f.id,f.type,f.desc,f.feats].join(' ');
    s += fuzzyScore(qStr, idx)*20;
    return s;
  };

  async function searchProps(query){
    if(!query || query.length<MIN_CHARS) return [];
    const arr = toArrayData(await loadData());
    const tokens = splitTokens(query);
    const qStr   = tokens.join(' ');
    let out = [];

    for(const p of arr){
      const f = fieldText(p);
      if(qStr.length>=3 && !tokensHitStrong(tokens, f)) continue;
      const s = scoreProperty(tokens, qStr, f);
      if(s>0) out.push({p,s});
    }

    if(out.length===0 && qStr.length>=3){
      for(const p of arr){
        const f = fieldText(p);
        const hasOne = tokens.some(t => f.title.includes(t)||f.hood.includes(t)||f.city.includes(t)||f.id.includes(t));
        if(!hasOne) continue;
        const s = scoreProperty(tokens, qStr, f);
        if(s>0) out.push({p,s});
      }
    }

    return out.sort((a,b)=>b.s-a.s).slice(0,MAX_SUGGESTIONS).map(r=>r.p);
  }

  /* ---------- Singleton Dropdown Manager ---------- */
  const DD = (() => {
    let dd = null;
    let activeInput = null;
    let lockedWidth = null;
    let boundScroll = false;

    function ensure(){
      if(dd) return dd;
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
      // Mantener abierto al interactuar
      dd.addEventListener('mousedown', e=>e.preventDefault(), { passive:false });
      dd.addEventListener('touchstart', e=>e.preventDefault(), { passive:false });
      document.body.appendChild(dd);
      return dd;
    }

    function setActive(input, {lockWidth=false} = {}){
      activeInput = input;
      if(!dd) ensure();
      position({lockWidth});
      if(!boundScroll){
        boundScroll = true;
        window.addEventListener('resize', ()=>position());
        window.addEventListener('scroll',  ()=>position(), {passive:true});
      }
    }

    function position({lockWidth=false} = {}){
      if(!dd || !activeInput) return;
      const r  = activeInput.getBoundingClientRect();
      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth||0);
      if(lockWidth || lockedWidth==null){
        const desired = r.width;
        lockedWidth = clamp(desired, MIN_W, Math.min(MAX_W, Math.floor(vw*VW_LIMIT)));
      }
      dd.style.top   = (r.top + window.scrollY + r.height + 6) + 'px';
      dd.style.left  = (r.left + window.scrollX) + 'px';
      dd.style.width = lockedWidth + 'px';
    }

    function show(){ if(dd) dd.style.display='block'; }
    function hide(){ if(dd) dd.style.display='none'; lockedWidth=null; }
    function isOpen(){ return dd && dd.style.display!=='none'; }
    function el(){ return dd || ensure(); }

    return { ensure, setActive, position, show, hide, isOpen, el };
  })();

  /* ---------- Render ---------- */
  function renderList(results){
    const dd = DD.el();
    if(!results.length){
      dd.innerHTML = `<div style="padding:16px;text-align:center;color:#6b7280;font-size:.95rem">Sin resultados. Prueba con otra palabra.</div>`;
      DD.show(); return;
    }
    dd.innerHTML='';
    results.forEach(p=>{
      const row=document.createElement('div');
      row.className='ss-item';
      row.setAttribute('role','option');
      row.style.cssText='display:flex;gap:12px;padding:12px 14px;cursor:pointer;align-items:center';
      row.onmouseenter=()=>row.style.background='#f9fafb';
      row.onmouseleave=()=>row.style.background='transparent';
      row.innerHTML=`
        <img src="${p.image || '/assets/placeholder.webp'}" alt="${escapeHtml(p.title||'Propiedad')}"
             style="width:60px;height:60px;object-fit:cover;border-radius:8px;flex-shrink:0">
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            ${escapeHtml(p.title||'Propiedad')}
          </div>
          <div style="color:#6b7280;font-size:.86rem">
            ${escapeHtml(p.city||'')}${p.neighborhood?' · '+escapeHtml(p.neighborhood):''}
          </div>
        </div>
        <div style="font-weight:900;color:#d4af37;white-space:nowrap">
          ${p.price?`$${Number(p.price).toLocaleString('es-CO')} COP`:''}
        </div>`;
      row.addEventListener('click',()=>{ location.href=`detalle-propiedad.html?id=${encodeURIComponent(p.id)}`; });
      dd.appendChild(row);
    });
    DD.show();
  }

  function enableKeyboard(input){
    const dd = DD.el();
    let current=-1;
    function items(){ return dd.querySelectorAll('.ss-item'); }
    function highlight(i){
      items().forEach(el=>el.style.background='transparent');
      if(i>=0 && i<items().length){
        items()[i].style.background='#eef2ff';
        items()[i].scrollIntoView({block:'nearest'});
      }
      current=i;
    }
    input.addEventListener('keydown',e=>{
      if(!DD.isOpen()) return;
      const list=items(); if(!list.length) return;
      if(e.key==='ArrowDown'){ e.preventDefault(); highlight(Math.min(list.length-1,current+1)); }
      else if(e.key==='ArrowUp'){ e.preventDefault(); highlight(Math.max(0,current-1)); }
      else if(e.key==='Enter'){ if(current>=0){ e.preventDefault(); list[current].click(); } }
      else if(e.key==='Escape'){ DD.hide(); }
    });
  }

  /* ---------- Wiring ---------- */
  document.addEventListener('DOMContentLoaded', ()=>{
    const inputs = document.querySelectorAll('#f-search, #f-city');
    inputs.forEach(input=>{
      const run = debounce(async ()=>{
        const q = input.value.trim();
        if(q.length<MIN_CHARS){ DD.hide(); return; }
        DD.setActive(input, {lockWidth:true});
        DD.el().innerHTML = '<div style="padding:16px;text-align:center;color:#6b7280">Buscando…</div>';
        DD.show(); DD.position();
        try{
          const results = await searchProps(q);
          renderList(results);
          DD.position(); // sólo reposiciona (no recalcula ancho)
        }catch(err){
          console.error('[smart-search]',err);
          DD.el().innerHTML = '<div style="padding:16px;text-align:center;color:#ef4444">Error de búsqueda</div>';
          DD.show();
        }
      }, DEBOUNCE_MS);

      input.addEventListener('input', run);
      input.addEventListener('focus', run);

      // Cierre al hacer click fuera
      document.addEventListener('mousedown', e=>{
        const dd=DD.el();
        if(DD.isOpen() && !dd.contains(e.target) && e.target!==input) DD.hide();
      });
      document.addEventListener('touchstart', e=>{
        const dd=DD.el();
        if(DD.isOpen() && !dd.contains(e.target) && e.target!==input) DD.hide();
      }, {passive:true});

      enableKeyboard(input);
    });
  });
})();
