/* =====================================================================
   ALTORRA • Smart Search (V8 - Semantic Features & Mobile Ready)
   - Semántica de amenities: piscina, balcón, vista al mar, ascensor, etc.
   - Sinónimos ES/EN y tolerancia a acentos/plurales
   - Reconoce 3h/2b/1g (habitaciones/baños/garajes) como mínimos
   - Relevancia estricta por tokens + boost fuerte en features
   - Singleton dropdown estable (PC/móvil), sin zoom iOS, con scroll fluido
   ===================================================================== */

(function () {
  'use strict';

  /* ---------- Config ---------- */
  const MIN_CHARS = 2;
  const MAX_SUGGESTIONS = 12;
  const DEBOUNCE_MS = 200;
  const MIN_W = 360, MAX_W = 920, VW_LIMIT = 0.96;

  /* ---------- Utils ---------- */
  const debounce = (fn, wait) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); }; };
  const escapeHtml = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  const normalize  = s => String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w\s]/g,' ').replace(/\s+/g,' ').trim();
  const clamp = (v, min, max)=>Math.max(min, Math.min(max, v));
  const fuzzyScore = (n, h)=>{ n=n.toLowerCase(); let s=0,i=0,j=0; while(i<n.length && j<h.length){ if(n[i]===h[j]){s++;i++;} j++; } return i===n.length ? s/n.length : 0; };

  const cacheBuster = ()=> (location.search ? '&' : '?') + 'v=' + Math.floor(Date.now()/(1000*60*30));
  async function fetchJSON(u){ const r=await fetch(u+cacheBuster(),{cache:'no-store'}); if(!r.ok) throw new Error(`HTTP ${r.status}@${u}`); return r.json(); }
  async function fetchWithFallback(paths){ let last; for(const p of paths){ try { return await fetchJSON(p); } catch(e){ last=e; } } throw last||new Error('No data.json'); }
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

  /* ---------- Vocabulario / Sinónimos ---------- */
  // clave = canónico; valores = sinónimos/variantes
  const FEATURE_SYNONYMS = {
    'vista al mar': ['vista al mar','frente al mar','vista mar','ocean view','sea view','vista al oceano','vista oceano','mar'],
    'piscina':      ['piscina','alberca','pileta','swimming pool','pool'],
    'balcon':       ['balcon','balcón','balco n','balcony','terraza pequeña'],
    'terraza':      ['terraza','roof top','rooftop','azotea','solarium'],
    'ascensor':     ['ascensor','elevador','elevator'],
    'gimnasio':     ['gimnasio','gym','fitness center'],
    'parqueadero':  ['parqueadero','garaje','garage','estacionamiento','parking'],
    'porteria':     ['portería','porteria','vigilancia','seguridad 24/7','seguridad','guardia'],
    'bbq':          ['bbq','asador','zona bbq','barbecue'],
    'jacuzzi':      ['jacuzzi','hot tub'],
    'sauna':        ['sauna'],
    'mascotas':     ['pet friendly','admite mascotas','mascotas','petfriendly'],
    'amoblado':     ['amoblado','amoblada','amueblado','amueblada','furnished'],
    'aire':         ['aire acondicionado','aire','a/a','air conditioning'],
    'vista':        ['vista','panoramica','panorámica','city view']
  };

  // tipos de propiedad
  const TYPE_SYNONYMS = {
    'apartamento': ['apartamento','apartaestudio','apto','apartment','flat','aparta estudio'],
    'casa':        ['casa','casaquinta','house','townhouse'],
    'lote':        ['lote','terreno','parcel','lot'],
    'oficina':     ['oficina','office'],
  };

  // transforma mapa de sinónimos en índice inverso -> canónico
  function buildSynIndex(map) {
    const idx = new Map();
    Object.keys(map).forEach(canon => {
      map[canon].forEach(v => idx.set(normalize(v), canon));
      idx.set(normalize(canon), canon);
    });
    return idx;
  }
  const FEATURE_INDEX = buildSynIndex(FEATURE_SYNONYMS);
  const TYPE_INDEX    = buildSynIndex(TYPE_SYNONYMS);

  // Extrae tokens, preservando frases multi-palabra del vocabulario
  function parseQuery(raw) {
    const qNorm = normalize(raw);
    const phrases = [];

    // 1) detectar frases (características de varias palabras)
    for (const canon of Object.keys(FEATURE_SYNONYMS)) {
      const all = [canon, ...FEATURE_SYNONYMS[canon]];
      for (const variant of all) {
        const v = normalize(variant);
        if (v.includes(' ')) {
          if (qNorm.includes(v)) phrases.push({ type: 'feature', canon, match: v });
        }
      }
    }
    for (const canon of Object.keys(TYPE_SYNONYMS)) {
      const all = [canon, ...TYPE_SYNONYMS[canon]];
      for (const variant of all) {
        const v = normalize(variant);
        if (v.includes(' ') && qNorm.includes(v)) phrases.push({ type: 'type', canon, match: v });
      }
    }

    // 2) eliminar frases del texto para tokenizar el resto
    let rest = qNorm;
    phrases.forEach(p => { rest = rest.replace(p.match, ' ').replace(/\s+/g,' ').trim(); });

    // 3) tokens restantes
    let tokens = rest.split(' ').filter(Boolean);

    // 4) interpretar atajos numéricos: 3h / 2b / 1g / 3 hab / 2 baños / 1 garage
    const constraints = { bedsMin:null, bathsMin:null, parkingMin:null, type:null, features: new Set() };

    tokens = tokens.filter(tok => {
      // num + letra
      const m = tok.match(/^(\d+)(h|hab|habitación|habitaciones|b|ba|ban|baño|banos|g|gar|garage|park|parq|parqueadero)$/);
      if (m) {
        const n = parseInt(m[1],10);
        const k = m[2][0]; // h/b/g
        if (k === 'h') constraints.bedsMin = Math.max(constraints.bedsMin||0, n);
        else if (k === 'b') constraints.bathsMin = Math.max(constraints.bathsMin||0, n);
        else if (k === 'g') constraints.parkingMin = Math.max(constraints.parkingMin||0, n);
        return false;
      }
      return true;
    });

    // mapear tokens a canónicos de feature/type cuando aplique
    const mappedTokens = [];
    tokens.forEach(tok => {
      const canonF = FEATURE_INDEX.get(tok);
      if (canonF) { constraints.features.add(canonF); phrases.push({type:'feature', canon:canonF, match:tok}); return; }
      const canonT = TYPE_INDEX.get(tok);
      if (canonT) { constraints.type = canonT; phrases.push({type:'type', canon:canonT, match:tok}); return; }
      mappedTokens.push(tok);
    });

    return { phrases, tokens: mappedTokens, constraints };
  }

  /* ---------- Scoring ---------- */
  const fieldText = p => ({
    title: normalize(p.title),
    city : normalize(p.city),
    hood : normalize(p.neighborhood || p.barrio),
    id   : normalize(p.id),
    type : normalize(p.type),
    desc : normalize(p.description),
    feats: buildFeaturesIndex(p) // string con features + sinónimos
  });

  function buildFeaturesIndex(p) {
    let parts = [];
    // 1) array features declarado
    if (Array.isArray(p.features)) parts = parts.concat(p.features.map(normalize));
    // 2) booleans comunes → etiquetas si son true
    const bools = {
      'piscina': p.pool || p.hasPool || p.piscina,
      'balcon': p.balcon || p.balcony || p.hasBalcony,
      'ascensor': p.ascensor || p.elevator || p.hasElevator,
      'gimnasio': p.gym || p.gimnasio || p.hasGym,
      'parqueadero': p.parqueadero || p.garage || p.estacionamiento || p.parking || p.hasParking,
      'terraza': p.terraza || p.rooftop || p.roof || p.hasTerrace,
      'vista al mar': p.oceanView || p.seaView || p.vistaMar,
      'amoblado': p.furnished || p.amoblado,
      'mascotas': p.petFriendly || p.mascotas
    };
    Object.keys(bools).forEach(k => { if (bools[k]) parts.push(k); });

    // 3) expandir a sinónimos para búsquedas por alias
    const expanded = [];
    parts.forEach(tag => {
      const canon = FEATURE_INDEX.get(normalize(tag)) || normalize(tag);
      expanded.push(canon);
      const syns = FEATURE_SYNONYMS[canon];
      if (syns) syns.forEach(s => expanded.push(normalize(s)));
    });

    return expanded.join(' ');
  }

  function tokensHitStrong(tokens, f) {
    // tokens “libres” deben pegar al menos en title/hood/city/id/type/features
    return tokens.every(tok =>
      f.title.includes(tok) || f.hood.includes(tok) || f.city.includes(tok) ||
      f.id.includes(tok)    || f.type.includes(tok) || f.feats.includes(tok)
    );
  }

  function scoreProperty(tokens, qStr, f, constraints, p) {
    let s=0;

    // 1) boosts por coincidencias exactas
    tokens.forEach(t=>{
      if(f.title.includes(t)) s+=55;
      if(f.hood .includes(t)) s+=45;
      if(f.city .includes(t)) s+=35;
      if(f.id   .includes(t)) s+=40;
      if(f.type .includes(t)) s+=15;
      if(f.feats.includes(t)) s+=65; // FEATURES MUY RELEVANTES
    });

    // 2) boosts por frases (features/types del vocabulario)
    constraints.features.forEach(canon => { if (f.feats.includes(canon)) s += 80; });
    if (constraints.type && f.type.includes(constraints.type)) s += 50;

    // 3) fuzzy sobre índice global
    const idx=[f.title,f.hood,f.city,f.id,f.type,f.desc,f.feats].join(' ');
    s += fuzzyScore(qStr, idx)*20;

    // 4) ajustes por datos numéricos si hay constraints (mínimos)
    const beds  = p.bedrooms ?? p.habitaciones ?? p.rooms ?? null;
    const baths = p.bathrooms ?? p.banos ?? p.baños ?? null;
    const park  = p.parking ?? p.parqueadero ?? p.garaje ?? p.garages ?? null;

    if (constraints.bedsMin && beds != null) {
      if (beds >= constraints.bedsMin) s += 25; else return -1; // descarta
    }
    if (constraints.bathsMin && baths != null) {
      if (baths >= constraints.bathsMin) s += 20; else return -1;
    }
    if (constraints.parkingMin && park != null) {
      if (park >= constraints.parkingMin) s += 15; else return -1;
    }

    return s;
  }

  async function searchProps(query){
    if(!query || query.length<MIN_CHARS) return [];
    const arr = toArrayData(await loadData());
    const { phrases, tokens, constraints } = parseQuery(query);
    const qStr = normalize(query);

    let out = [];
    for (const p of arr) {
      const f = fieldText(p);

      // Regla estricta relajada (incluye feats)
      if (qStr.length>=3 && !tokensHitStrong(tokens, f)) continue;

      const s = scoreProperty(tokens, qStr, f, constraints, p);
      if (s > 0) out.push({ p, s });
    }

    // Si nada pasó, relajamos a “al menos 1 pegada”
    if (out.length === 0 && qStr.length >= 3) {
      for (const p of arr) {
        const f = fieldText(p);
        const hasOne = tokens.some(tok =>
          f.title.includes(tok) || f.hood.includes(tok) || f.city.includes(tok) ||
          f.id.includes(tok)    || f.type.includes(tok) || f.feats.includes(tok)
        );
        if (!hasOne) continue;
        const s = scoreProperty(tokens, qStr, f, constraints, p);
        if (s > 0) out.push({ p, s });
      }
    }

    return out.sort((a,b)=>b.s-a.s).slice(0,MAX_SUGGESTIONS).map(r=>r.p);
  }

  /* ---------- Singleton Dropdown (estable PC/móvil) ---------- */
  const DD = (() => {
    let dd=null, activeInput=null, lockedWidth=null, bound=false;
    function ensure(){
      if(dd) return dd;
      dd = document.createElement('div');
      dd.id='smart-search-dropdown';
      dd.setAttribute('role','listbox');
      dd.setAttribute('aria-label','Sugerencias');
      dd.style.cssText = [
        'position:absolute','top:0','left:0',
        'background:#fff',
        'border:1px solid rgba(0,0,0,.12)',
        'border-radius:12px',
        'box-shadow:0 12px 32px rgba(0,0,0,.18)',
        'max-height:60vh',
        'overflow-y:auto',
        'overscroll-behavior:contain',
        'touch-action:pan-y',
        '-webkit-overflow-scrolling:touch',
        'z-index:2147483647','display:none'
      ].join(';');
      // mouse: evitar blur; móvil: no bloqueamos touchstart (para scroll)
      dd.addEventListener('mousedown', e=>e.preventDefault());
      document.body.appendChild(dd);
      return dd;
    }
    function setActive(input, {lockWidth=false} = {}){
      activeInput = input; ensure(); position({lockWidth});
      if(!bound){
        bound=true;
        window.addEventListener('resize', ()=>position());
        window.addEventListener('scroll',  ()=>position(), {passive:true});
        window.addEventListener('orientationchange', ()=>setTimeout(()=>position({lockWidth:true}), 250));
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
    const show = ()=> dd.style.display='block';
    const hide = ()=> { dd.style.display='none'; lockedWidth=null; };
    const isOpen = ()=> dd && dd.style.display!=='none';
    const el = ()=> dd || ensure();
    return { setActive, position, show, hide, isOpen, el };
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

  /* ---------- Tap-to-close inteligente (no por scroll) ---------- */
  function installTapToClose(input){
    let startY=null, startX=null, moved=false;
    const onStart = (e)=>{ const t=e.touches?e.touches[0]:e; startX=t.clientX; startY=t.clientY; moved=false; };
    const onMove  = (e)=>{ if(startY==null) return; const t=e.touches?e.touches[0]:e; if(Math.abs(t.clientY-startY)>10||Math.abs(t.clientX-startX)>10) moved=true; };
    const onEnd   = (e)=>{ if(!DD.isOpen()) return; const dd=DD.el(); const target=e.target; if(moved) return; if(!dd.contains(target) && target!==input) DD.hide(); };
    document.addEventListener('touchstart', onStart, {passive:true});
    document.addEventListener('touchmove',  onMove,  {passive:true});
    document.addEventListener('touchend',   onEnd,   {passive:true});
    document.addEventListener('mousedown', (e)=>{ const dd=DD.el(); if(DD.isOpen() && !dd.contains(e.target) && e.target!==input) DD.hide(); });
  }

  /* ---------- Prevención de ZOOM (iOS) ---------- */
  function enforceMobileInputStyles(input){
    input.style.fontSize = '16px';
    input.style.lineHeight = '1.4';
    input.setAttribute('inputmode','search');
    input.setAttribute('enterkeyhint','search');
    input.setAttribute('autocomplete','off');
  }

  /* ---------- Wiring ---------- */
  document.addEventListener('DOMContentLoaded', ()=>{
    const inputs = document.querySelectorAll('#f-search, #f-city');
    inputs.forEach(input=>{
      enforceMobileInputStyles(input);

      const run = debounce(async ()=>{
        const q = input.value.trim();
        if(q.length<MIN_CHARS){ DD.hide(); return; }
        DD.setActive(input, {lockWidth:true});
        DD.el().innerHTML = '<div style="padding:16px;text-align:center;color:#6b7280">Buscando…</div>';
        DD.show(); DD.position();
        try{
          const results = await searchProps(q);
          renderList(results);
          DD.position();
        }catch(err){
          console.error('[smart-search]',err);
          DD.el().innerHTML = '<div style="padding:16px;text-align:center;color:#ef4444">Error de búsqueda</div>';
          DD.show();
        }
      }, DEBOUNCE_MS);

      input.addEventListener('input', run);
      input.addEventListener('focus', run);
      installTapToClose(input);

      // Teclado (desktop)
      let current=-1;
      const dd = DD.el();
      const items=()=>dd.querySelectorAll('.ss-item');
      const highlight=i=>{
        items().forEach(el=>el.style.background='transparent');
        if(i>=0 && i<items().length){ items()[i].style.background='#eef2ff'; items()[i].scrollIntoView({block:'nearest'}); }
        current=i;
      };
      input.addEventListener('keydown',e=>{
        if(!DD.isOpen()) return; const list=items(); if(!list.length) return;
        if(e.key==='ArrowDown'){ e.preventDefault(); highlight(Math.min(list.length-1,current+1)); }
        else if(e.key==='ArrowUp'){ e.preventDefault(); highlight(Math.max(0,current-1)); }
        else if(e.key==='Enter'){ if(current>=0){ e.preventDefault(); list[current].click(); } }
        else if(e.key==='Escape'){ DD.hide(); }
      });
    });
  });
})();
