/* ======================================================================
   ALTORRA • Smart Search (V9 PRO)
   - Typos (Damerau-Levenshtein <=1) sobre vocab dinàmico
   - Rango de presupuesto: 350m, 0.35b, 250-400m, <=400m, >200m, MM/millones
   - Features semánticos (ES/EN) + auto-aprendizaje desde JSON
   - Re-ranking por popularidad (click feedback)
   - Mobile-first: sin zoom iOS, scroll suave, dropdown estable (singleton)
   ====================================================================== */
(function () {
  'use strict';

  /* ---------- Config ---------- */
  const MIN_CHARS = 2;
  const MAX_SUGGESTIONS = 12;
  const DEBOUNCE_MS = 200;
  const MIN_W = 360, MAX_W = 920, VW_LIMIT = 0.96;

  /* ---------- Utils ---------- */
  const debounce = (fn, wait) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); }; };
  const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  const norm = s => String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w\s]/g,' ').replace(/\s+/g,' ').trim();
  const clamp = (v, a, b)=>Math.max(a, Math.min(b, v));
  const uniq  = arr => Array.from(new Set(arr));
  const fuzzyScore = (n, h)=>{ n=n.toLowerCase(); let s=0,i=0,j=0; while(i<n.length&&j<h.length){ if(n[i]===h[j]){s++;i++;} j++; } return i===n.length? s/n.length : 0; };
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

  /* ---------- Vocab base (amenities/types con sinónimos) ---------- */
  const FEATURE_SYNONYMS = {
    'vista al mar': ['vista al mar','frente al mar','vista mar','ocean view','sea view','vista al oceano','vista oceano'],
    'piscina':      ['piscina','alberca','pileta','swimming pool','pool'],
    'balcon':       ['balcon','balcón','balcony'],
    'terraza':      ['terraza','roof top','rooftop','azotea','solarium'],
    'ascensor':     ['ascensor','elevador','elevator'],
    'gimnasio':     ['gimnasio','gym','fitness center'],
    'parqueadero':  ['parqueadero','garaje','garage','estacionamiento','parking'],
    'porteria':     ['portería','porteria','vigilancia','seguridad 24/7','seguridad'],
    'bbq':          ['bbq','asador','zona bbq','barbecue'],
    'jacuzzi':      ['jacuzzi','hot tub'],
    'sauna':        ['sauna'],
    'mascotas':     ['pet friendly','admite mascotas','mascotas','petfriendly'],
    'amoblado':     ['amoblado','amoblada','amueblado','amueblada','furnished'],
    'aire':         ['aire acondicionado','aire','a/a','air conditioning'],
    'vista':        ['vista','panoramica','panorámica','city view']
  };
  const TYPE_SYNONYMS = {
    'apartamento': ['apartamento','apartaestudio','apto','apartment','flat','aparta estudio'],
    'casa':        ['casa','casaquinta','house','townhouse'],
    'lote':        ['lote','terreno','parcel','lot'],
    'oficina':     ['oficina','office'],
  };
  const buildSynIndex = map => {
    const idx = new Map();
    Object.keys(map).forEach(canon => {
      map[canon].forEach(v => idx.set(norm(v), canon));
      idx.set(norm(canon), canon);
    });
    return idx;
  };
  const FEATURE_INDEX_BASE = buildSynIndex(FEATURE_SYNONYMS);
  const TYPE_INDEX         = buildSynIndex(TYPE_SYNONYMS);

  /* ---------- Corrección de typos (Damerau-Levenshtein) ---------- */
  function dlDist1(a,b){ // true si distancia <=1 (conmutación incluida)
    if (a===b) return true;
    const la=a.length, lb=b.length;
    if (Math.abs(la-lb)>1) return false;
    // sustitución / inserción / borrado
    let i=0,j=0, edits=0;
    while(i<la && j<lb){
      if(a[i]===b[j]){ i++; j++; continue; }
      if(++edits>1) return false;
      if(la>lb) i++; else if(lb>la) j++; else { i++; j++; }
    }
    if (i<la || j<lb) edits++;
    if (edits<=1) return true;
    // transposición (ab <-> ba)
    if (la===lb && la>1){
      for (let k=0;k<la-1;k++){
        if (a[k]!==b[k]){
          const aa=a.slice(0,k)+a[k+1]+a[k]+a.slice(k+2);
          return aa===b;
        }
      }
    }
    return false;
  }

  /* ---------- Parseo de presupuesto ---------- */
  function parseMoneyToken(tok){
    // soporta 350m, 0.35b, 350-500m, <=400m, >=200m, 400MM, 400 millones, 400000000
    const t = tok.replace(/\s/g,'').toLowerCase();
    const mult = t.includes('b') ? 1e9 : (t.includes('mm')||t.includes('mill')||t.includes('millones')||t.includes('m')) ? 1e6 : 1;
    // rango a-b
    const mR = t.match(/^(\d+(?:\.\d+)?)[-–](\d+(?:\.\d+)?)(m|mm|b|)$/);
    if (mR) return { min: Number(mR[1])* (mR[3]==='b'?1e9:(mR[3]?1e6:1)), max: Number(mR[2])*(mR[3]==='b'?1e9:(mR[3]?1e6:1)) };
    // <=N  /  >=N
    const mLE = t.match(/^(<=|<=|≤)(\d+(?:\.\d+)?)(m|mm|b|)$/);
    if (mLE) return { min: null, max: Number(mLE[2])*(mLE[3]==='b'?1e9:(mLE[3]?1e6:1)) };
    const mGE = t.match(/^(>=|>=|≥)(\d+(?:\.\d+)?)(m|mm|b|)$/);
    if (mGE) return { min: Number(mGE[2])*(mGE[3]==='b'?1e9:(mGE[3]?1e6:1)), max: null };
    // simple N (con sufijo opcional)
    const mN = t.match(/^(\d{1,3}(?:[\.\,]?\d{3})+|\d+(?:\.\d+)?)(m|mm|b|)$/) || t.match(/^(\d+)(?:)$/);
    if (mN){
      const raw = Number(String(mN[1]).replace(/[^\d.]/g,''));
      return { min: raw*mult, max: raw*mult };
    }
    return null;
  }

  /* ---------- Construcción de índice semántico dinámico ---------- */
  function dynamicFeatureTerms(allProps){
    const bag = new Set();
    allProps.forEach(p=>{
      if (Array.isArray(p.features)) p.features.forEach(f=>bag.add(norm(f)));
      const bools = [
        p.pool||p.piscina, p.balcon||p.balcony, p.ascensor||p.elevator,
        p.gym||p.gimnasio, p.parqueadero||p.garage||p.estacionamiento||p.parking,
        p.terraza||p.rooftop, p.oceanView||p.seaView||p.vistaMar, p.furnished||p.amoblado,
        p.petFriendly||p.mascotas
      ];
      const names = ['piscina','balcon','ascensor','gimnasio','parqueadero','terraza','vista al mar','amoblado','mascotas'];
      bools.forEach((v,i)=>{ if(v) bag.add(norm(names[i])); });
    });
    return Array.from(bag);
  }

  function buildVocab(allProps){
    const terms = new Set();
    allProps.forEach(p=>{
      [p.city, p.neighborhood, p.barrio, p.type, p.id].forEach(v=>{ if(v) terms.add(norm(v)); });
      // palabras destacadas en títulos
      String(p.title||'').split(/\s+/).forEach(w=>{ if(w.length>=4) terms.add(norm(w)); });
    });
    // features base + dinámicas
    Object.keys(FEATURE_SYNONYMS).forEach(k=>{ terms.add(norm(k)); FEATURE_SYNONYMS[k].forEach(s=>terms.add(norm(s))); });
    dynamicFeatureTerms(allProps).forEach(t=>terms.add(norm(t)));
    // tipos
    Object.keys(TYPE_SYNONYMS).forEach(k=>{ terms.add(norm(k)); TYPE_SYNONYMS[k].forEach(s=>terms.add(norm(s))); });
    return Array.from(terms).filter(Boolean);
  }

  /* ---------- Parseo de consulta ---------- */
  function parseQuery(raw, vocab){
    const qN = norm(raw);
    // frases multi-palabra de features/types
    const phrases = [];
    function addPhrase(type, canon, v){
      phrases.push({ type, canon, match:v });
    }
    // features
    Object.keys(FEATURE_SYNONYMS).forEach(canon=>{
      [canon, ...FEATURE_SYNONYMS[canon]].forEach(v=>{
        const vv=norm(v); if(vv.includes(' ') && qN.includes(vv)) addPhrase('feature', canon, vv);
      });
    });
    // types
    Object.keys(TYPE_SYNONYMS).forEach(canon=>{
      [canon, ...TYPE_SYNONYMS[canon]].forEach(v=>{
        const vv=norm(v); if(vv.includes(' ') && qN.includes(vv)) addPhrase('type', canon, vv);
      });
    });

    // quitar frases del texto
    let rest = qN;
    phrases.forEach(p=>{ rest = rest.replace(p.match,' ').replace(/\s+/g,' ').trim(); });

    // tokens
    let tokens = rest.split(' ').filter(Boolean);

    // constraints
    const constraints = { bedsMin:null, bathsMin:null, parkingMin:null, type:null, features:new Set(), priceMin:null, priceMax:null };

    // atajos numéricos habitaciones/baños/garajes
    tokens = tokens.filter(tok=>{
      const m = tok.match(/^(\d+)(h|hab|habitaciones|b|ba|ban|banos|baños|g|gar|garage|park|parq|parqueadero)$/);
      if(m){
        const n=parseInt(m[1],10), k=m[2][0];
        if(k==='h') constraints.bedsMin=Math.max(constraints.bedsMin||0,n);
        else if(k==='b') constraints.bathsMin=Math.max(constraints.bathsMin||0,n);
        else if(k==='g') constraints.parkingMin=Math.max(constraints.parkingMin||0,n);
        return false;
      }
      // presupuesto
      const money = parseMoneyToken(tok);
      if(money){
        if(money.min!=null) constraints.priceMin = Math.max(constraints.priceMin||0, money.min);
        if(money.max!=null) constraints.priceMax = constraints.priceMax==null ? money.max : Math.min(constraints.priceMax, money.max);
        return false;
      }
      return true;
    });

    // mapear tokens a features/types (mono-palabra) o corregir typos contra vocab
    const mapped=[];
    tokens.forEach(tok=>{
      const t = tok;
      // features mono-palabra
      const fCanon = FEATURE_INDEX_BASE.get(t);
      if(fCanon){ constraints.features.add(fCanon); return; }
      // type
      const tCanon = TYPE_INDEX.get(t);
      if(tCanon){ constraints.type=tCanon; return; }
      // corrección de typo simple (si token largo y no numérico)
      if (t.length>=4 && !/^\d+$/.test(t)) {
        const candidate = vocab.find(v => dlDist1(t, v));
        if (candidate) { mapped.push(candidate); return; }
      }
      mapped.push(t);
    });

    return { phrases, tokens: mapped, constraints };
  }

  /* ---------- Campos + índice de features por propiedad ---------- */
  function featuresIndexFromProp(p){
    const parts=[];
    if(Array.isArray(p.features)) parts.push(...p.features.map(norm));
    const bools = {
      'piscina': p.pool||p.hasPool||p.piscina,
      'balcon': p.balcon||p.balcony||p.hasBalcony,
      'ascensor': p.ascensor||p.elevator||p.hasElevator,
      'gimnasio': p.gym||p.gimnasio||p.hasGym,
      'parqueadero': p.parqueadero||p.garage||p.estacionamiento||p.parking||p.hasParking,
      'terraza': p.terraza||p.rooftop||p.roof||p.hasTerrace,
      'vista al mar': p.oceanView||p.seaView||p.vistaMar,
      'amoblado': p.furnished||p.amoblado,
      'mascotas': p.petFriendly||p.mascotas
    };
    Object.keys(bools).forEach(k=>{ if(bools[k]) parts.push(k); });
    // expandir a sinónimos
    const expanded=[];
    parts.forEach(tag=>{
      const canon = FEATURE_INDEX_BASE.get(norm(tag)) || norm(tag);
      expanded.push(canon);
      const syns = FEATURE_SYNONYMS[canon];
      if(syns) syns.forEach(s=>expanded.push(norm(s)));
    });
    return uniq(expanded).join(' ');
  }

  const fieldText = p => ({
    title: norm(p.title),
    city : norm(p.city),
    hood : norm(p.neighborhood || p.barrio),
    id   : norm(p.id),
    type : norm(p.type),
    desc : norm(p.description),
    feats: featuresIndexFromProp(p)
  });

  function tokensHitStrong(tokens, f){
    return tokens.every(tok =>
      f.title.includes(tok)||f.hood.includes(tok)||f.city.includes(tok)||
      f.id.includes(tok)   ||f.type.includes(tok)||f.feats.includes(tok)
    );
  }

  /* ---------- Re-ranking por feedback ---------- */
  function readClicks(){ try{ return JSON.parse(localStorage.getItem('altorra:ssrc:clicks')||'{}'); }catch{ return {}; } }
  function writeClicks(map){ try{ localStorage.setItem('altorra:ssrc:clicks', JSON.stringify(map)); }catch{} }
  function boostByClicks(id){
    const clicks = readClicks()[id]||0;
    return Math.log(1+clicks)*8; // boost suave
  }
  function registerClick(id){
    const map = readClicks(); map[id]=(map[id]||0)+1; writeClicks(map);
  }

  function scoreProperty(tokens, qStr, f, constraints, p){
    let s=0;
    tokens.forEach(t=>{
      if(f.title.includes(t)) s+=55;
      if(f.hood .includes(t)) s+=45;
      if(f.city .includes(t)) s+=35;
      if(f.id   .includes(t)) s+=40;
      if(f.type .includes(t)) s+=15;
      if(f.feats.includes(t)) s+=70; // features muy relevantes
    });
    constraints.features.forEach(canon=>{ if(f.feats.includes(canon)) s+=85; });
    if(constraints.type && f.type.includes(constraints.type)) s+=55;

    const idx=[f.title,f.hood,f.city,f.id,f.type,f.desc,f.feats].join(' ');
    s += fuzzyScore(qStr, idx)*18;

    // filtros duros + boosts numéricos
    const beds  = p.bedrooms ?? p.habitaciones ?? p.rooms ?? null;
    const baths = p.bathrooms ?? p.banos ?? p.baños ?? null;
    const park  = p.parking ?? p.parqueadero ?? p.garaje ?? p.garages ?? null;
    const price = Number(p.price || p.precio || 0) || null;

    if (constraints.bedsMin && beds != null)  { if(beds  < constraints.bedsMin)  return -1; else s+=22; }
    if (constraints.bathsMin && baths != null){ if(baths < constraints.bathsMin) return -1; else s+=18; }
    if (constraints.parkingMin && park != null){ if(park < constraints.parkingMin) return -1; else s+=14; }

    if (constraints.priceMin!=null && price!=null && price < constraints.priceMin) return -1;
    if (constraints.priceMax!=null && price!=null && price > constraints.priceMax) return -1;
    if (constraints.priceMin!=null || constraints.priceMax!=null) s+=12;

    // popularidad
    s += boostByClicks(p.id);

    return s;
  }

  async function searchProps(query, allProps, vocab){
    if(!query || query.length<MIN_CHARS) return [];
    const { tokens, constraints } = parseQuery(query, vocab);
    const qStr = norm(query);
    const res = [];

    for (const p of allProps){
      const f = fieldText(p);
      if(qStr.length>=3 && !tokensHitStrong(tokens, f)) continue;
      const sc = scoreProperty(tokens, qStr, f, constraints, p);
      if(sc>0) res.push({p, sc, f});
    }

    if (res.length===0 && qStr.length>=3){
      for (const p of allProps){
        const f = fieldText(p);
        const hasOne = tokens.some(tok =>
          f.title.includes(tok)||f.hood.includes(tok)||f.city.includes(tok)||
          f.id.includes(tok)||f.type.includes(tok)||f.feats.includes(tok)
        );
        if(!hasOne) continue;
        const sc = scoreProperty(tokens, qStr, f, constraints, p);
        if(sc>0) res.push({p, sc, f});
      }
    }

    return res.sort((a,b)=>b.sc-a.sc).slice(0,MAX_SUGGESTIONS).map(r=>r.p);
  }

  /* ---------- Dropdown singleton (estable PC/móvil) ---------- */
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
        'z-index:2147483647',
        'display:none'
      ].join(';');
      dd.addEventListener('mousedown', e=>e.preventDefault()); // evita blur en desktop
      document.body.appendChild(dd);
      return dd;
    }
    function setActive(input, {lockWidth=false} = {}){
      activeInput=input; ensure(); position({lockWidth});
      if(!bound){
        bound=true;
        window.addEventListener('resize', ()=>position());
        window.addEventListener('scroll',  ()=>position(), {passive:true});
        window.addEventListener('orientationchange', ()=>setTimeout(()=>position({lockWidth:true}), 250));
      }
    }
    function position({lockWidth=false} = {}){
      if(!dd||!activeInput) return;
      const r = activeInput.getBoundingClientRect();
      const vw= Math.max(document.documentElement.clientWidth, window.innerWidth||0);
      if(lockWidth || lockedWidth==null){
        const desired=r.width;
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

  /* ---------- Highlight seguro ---------- */
  function highlight(text, terms){
    let out = esc(text);
    terms.forEach(t=>{
      if(!t || t.length<2) return;
      const re = new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`,'gi');
      out = out.replace(re,'<mark>$1</mark>');
    });
    return out;
  }

  /* ---------- Render ---------- */
  function renderList(results, queryTerms){
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

      const titleHTML = highlight(p.title||'Propiedad', queryTerms);
      const subline = [p.city, p.neighborhood].filter(Boolean).join(' · ');
      const subHTML = highlight(subline, queryTerms);

      row.innerHTML=`
        <img src="${p.image || '/assets/placeholder.webp'}" alt="${esc(p.title||'Propiedad')}"
             style="width:60px;height:60px;object-fit:cover;border-radius:8px;flex-shrink:0">
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${titleHTML}</div>
          <div style="color:#6b7280;font-size:.86rem">${subHTML}</div>
        </div>
        <div style="font-weight:900;color:#d4af37;white-space:nowrap">
          ${p.price?`$${Number(p.price).toLocaleString('es-CO')} COP`:''}
        </div>`;
      row.addEventListener('click',()=>{
        registerClick(p.id);
        location.href=`detalle-propiedad.html?id=${encodeURIComponent(p.id)}`;
      });
      dd.appendChild(row);
    });
    DD.show();
  }

  /* ---------- Tap-to-close que no interrumpe scroll ---------- */
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

  /* ---------- Evitar zoom iOS y mejorar teclado ---------- */
  function enforceMobileInputStyles(input){
    input.style.fontSize = '16px';
    input.style.lineHeight = '1.4';
    input.setAttribute('inputmode','search');
    input.setAttribute('enterkeyhint','search');
    input.setAttribute('autocomplete','off');
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', async ()=>{
    const inputs = document.querySelectorAll('#f-search, #f-city');
    inputs.forEach(enforceMobileInputStyles);

    const rawData = await loadData();
    const props   = toArrayData(rawData);
    const vocab   = buildVocab(props); // para typos y sinónimos emergentes

    inputs.forEach(input=>{
      const run = debounce(async ()=>{
        const q = input.value.trim();
        if(q.length<MIN_CHARS){ DD.hide(); return; }
        DD.setActive(input, {lockWidth:true});
        DD.el().innerHTML = '<div style="padding:16px;text-align:center;color:#6b7280">Buscando…</div>';
        DD.show(); DD.position();
        try{
          const results = await searchProps(q, props, vocab);
          const termsForHL = uniq(norm(q).split(' ').filter(Boolean));
          renderList(results, termsForHL);
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
      const highlightRow=i=>{
        items().forEach(el=>el.style.background='transparent');
        if(i>=0 && i<items().length){ items()[i].style.background='#eef2ff'; items()[i].scrollIntoView({block:'nearest'}); }
        current=i;
      };
      input.addEventListener('keydown',e=>{
        if(!DD.isOpen()) return; const list=items(); if(!list.length) return;
        if(e.key==='ArrowDown'){ e.preventDefault(); highlightRow(Math.min(list.length-1,current+1)); }
        else if(e.key==='ArrowUp'){ e.preventDefault(); highlightRow(Math.max(0,current-1)); }
        else if(e.key==='Enter'){ if(current>=0){ e.preventDefault(); list[current].click(); } }
        else if(e.key==='Escape'){ DD.hide(); }
      });
    });
  });
})();
