/* Altorra - Búsqueda avanzada (Fase 3) */
(function(){
  const $ = (s, el=document) => el.querySelector(s);
  const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));

  function formatCOP(n){ try{ return (Number(n)||0).toLocaleString('es-CO'); }catch(_){ return String(n||''); } }

  async function getData(){
    // mismo patrón de fallback que el sitio
    const urls = [
      'properties/data.json',
      '/PRUEBA-PILOTO/properties/data.json',
      '/properties/data.json'
    ];
    for(const u of urls){
      try{
        const res = await fetch(u, {cache:'no-store'});
        if(res.ok) return await res.json();
      }catch(_){}
    }
    return [];
  }

  function readParams(){
    const u = new URL(location.href);
    return {
      op:   (u.searchParams.get('op')||'').toLowerCase(),
      type: (u.searchParams.get('type')||'').toLowerCase(),
      city: (u.searchParams.get('city')||'').toLowerCase(),
      beds: Number(u.searchParams.get('beds')||'')||null,
      baths:Number(u.searchParams.get('baths')||'')||null,
      min:  Number(u.searchParams.get('min')||'')||null,
      max:  Number(u.searchParams.get('max')||'')||null,
      q:    (u.searchParams.get('q')||'').toLowerCase().trim(),
      code: (u.searchParams.get('code')||'').trim(),
      order:(u.searchParams.get('order')||'featured').toLowerCase(),
    };
  }
  function writeParams(p){
    const u = new URL(location.href);
    Object.entries(p).forEach(([k,v])=>{
      if(v===null || v===undefined || v==='') u.searchParams.delete(k);
      else u.searchParams.set(k, v);
    });
    history.replaceState(null,'',u.toString());
  }

  function applyUI(p){
    $('#f-op').value = p.op || '';
    $('#f-type').value = p.type || '';
    $('#f-city').value = p.city || '';
    $('#f-beds').value = p.beds || '';
    $('#f-baths').value = p.baths || '';
    $('#f-min').value = p.min || '';
    $('#f-max').value = p.max || '';
    $('#f-q').value = p.q || '';
    $('#f-code').value = p.code || '';
    $('#order').value = p.order || 'featured';
  }

  function buildChips(p){
    const chips = [];
    if(p.op) chips.push(`Operación: ${p.op}`);
    if(p.type) chips.push(`Tipo: ${p.type}`);
    if(p.city) chips.push(`Ciudad: ${p.city}`);
    if(p.beds) chips.push(`≥ ${p.beds} hab`);
    if(p.baths) chips.push(`≥ ${p.baths} baños`);
    if(p.min) chips.push(`Mín: $${formatCOP(p.min)}`);
    if(p.max) chips.push(`Máx: $${formatCOP(p.max)}`);
    if(p.q) chips.push(`Texto: "${p.q}"`);
    if(p.code) chips.push(`Código: ${p.code}`);
    $('#chips').innerHTML = chips.map(t=>`<span class="chip">${t}</span>`).join('');
  }

  function seededShuffle(arr, seed){
    const a = arr.slice();
    function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}}
    const rand = mulberry32(seed>>>0);
    for(let i=a.length-1;i>0;i--){ const j = Math.floor(rand()* (i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  }
  function dailySeed(){
    const today=(new Date()).toISOString().slice(0,10); let raw=null;
    try{ raw=localStorage.getItem('altorra:shuffleSeed'); }catch(_){}
    if(raw){ try{ const obj=JSON.parse(raw); if(obj && obj.date===today) return obj.seed; }catch(_){}
    const seed=Math.floor(Math.random()*1e9);
    try{ localStorage.setItem('altorra:shuffleSeed', JSON.stringify({date:today, seed})); }catch(_){}
    return seed;
  }
  function orderList(list, order){
    const L = list.slice();
    if(order==='random') return seededShuffle(L, dailySeed());
    if(order==='views'){
      return L.sort((a,b)=> (Number(b.featured||0)-Number(a.featured||0)) || (Number(b.views||0)-Number(a.views||0)));
    }
    // default: featured desc, highlight desc, then daily shuffle
    L.sort((a,b)=> (Number(b.featured||0)-Number(a.featured||0)) || (Number(b.highlightScore||0)-Number(a.highlightScore||0)));
    return seededShuffle(L, dailySeed());
  }

  function passes(p, f){
    if(f.code){ if((p.id||'').toLowerCase() !== f.code.toLowerCase()) return false; }
    if(f.op){ if((p.operation||'').toLowerCase()!==f.op) return false; }
    if(f.type){ if((p.type||'').toLowerCase()!==f.type) return false; }
    if(f.city){ if((p.city||'').toLowerCase()!==f.city) return false; }
    if(f.beds){ if(Number(p.beds||0) < f.beds) return false; }
    if(f.baths){ if(Number(p.baths||0) < f.baths) return false; }
    if(f.min){ if(Number(p.price||0) < f.min) return false; }
    if(f.max){ if(Number(p.price||0) > f.max) return false; }
    if(f.q){
      const text = [p.title,p.description,p.neighborhood,p.type,p.city].filter(Boolean).join(' ').toLowerCase();
      if(!text.includes(f.q)) return false;
    }
    return true;
  }

  function buildCard(p){
    const el = document.createElement('article'); el.className='card'; el.setAttribute('role','listitem');
    const img = document.createElement('img');
    img.loading='lazy'; img.decoding='async'; img.alt = p.title||'Propiedad';
    const src = p.image || (Array.isArray(p.images)&&p.images[0]) || 'https://i.postimg.cc/0yYb8Y6r/placeholder.png';
    img.src = (src.startsWith('http')||src.startsWith('/')) ? src : ('/'+src.replace(/^\.?\//,''));
    const body = document.createElement('div'); body.className='info'; body.style.padding='12px';
    const h3 = document.createElement('h3'); h3.textContent = p.title || 'Sin título';
    const specs = document.createElement('div'); specs.style.color='var(--muted)';
    const parts=[]; if(p.beds)parts.push(p.beds+'H'); if(p.baths)parts.push(p.baths+'B'); if(p.sqm)parts.push(p.sqm+' m²');
    specs.textContent = parts.join(' · ');
    const price = document.createElement('div'); price.style.marginTop='4px'; price.style.fontWeight='800'; price.style.color='var(--gold)';
    if(p.price) price.textContent = '$'+formatCOP(p.price)+' COP' + ( (p.operation==='arrendar')?' / mes': (p.operation==='dias')?' / noche':'' );
    const actions = document.createElement('div'); actions.className='actions';
    const w = document.createElement('button'); w.className='btn whatsapp'; w.type='button'; w.textContent='WhatsApp';
    w.addEventListener('click', (ev)=>{
      ev.stopPropagation();
      const msg = encodeURIComponent(`Hola, me interesa la propiedad ${p.id||''}: ${p.title||''}`);
      location.href = `https://wa.me/573235016747?text=${msg}`;
    });
    const sh = document.createElement('button'); sh.className='btn share'; sh.type='button'; sh.textContent='Compartir';
    sh.addEventListener('click', async (ev)=>{
      ev.stopPropagation();
      const url = location.origin + location.pathname.replace(/\/[^\/]*$/, '/') + 'detalle-propiedad.html?id='+encodeURIComponent(p.id||'');
      if(navigator.share){
        try{ await navigator.share({title:p.title||'Propiedad', text:'Mira esta propiedad', url}); }catch(_){}
      }else{
        try{ await navigator.clipboard.writeText(url); alert('Enlace copiado'); }catch(_){ prompt('Copia el enlace:', url); }
      }
    });
    el.addEventListener('click', ()=>{
      location.href='detalle-propiedad.html?id='+encodeURIComponent(p.id||'');
    });

    el.appendChild(img); el.appendChild(body);
    body.appendChild(h3); body.appendChild(specs); body.appendChild(price); body.appendChild(actions);
    actions.appendChild(w); actions.appendChild(sh);
    return el;
  }

  async function main(){
    const form = $('#filtersForm');
    const results = $('#results');
    const empty = $('#empty');
    const count = $('#count');
    const orderSel = $('#order');

    let params = readParams();
    applyUI(params);
    buildChips(params);

    const data = await getData();
    function render(){
      const list = data.filter(p => Number(p.available||1)===1).filter(p => passes(p, params));
      const ordered = orderList(list, params.order||'featured');
      results.innerHTML = '';
      ordered.forEach(p => results.appendChild(buildCard(p)));
      const n = ordered.length;
      count.textContent = n + (n===1 ? ' resultado' : ' resultados');
      empty.style.display = n? 'none':'block';
    }

    form.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      params = {
        op: $('#f-op').value || '',
        type: $('#f-type').value || '',
        city: $('#f-city').value || '',
        beds: $('#f-beds').value || '',
        baths: $('#f-baths').value || '',
        min: $('#f-min').value || '',
        max: $('#f-max').value || '',
        q: $('#f-q').value || '',
        code: $('#f-code').value || '',
        order: $('#order').value || 'featured',
      };
      writeParams(params);
      buildChips(params);
      render();
    });
    orderSel.addEventListener('change', ()=>{
      params.order = orderSel.value || 'featured';
      writeParams(params);
      render();
    });

    // Render inicial
    render();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', main);
  else main();
})();