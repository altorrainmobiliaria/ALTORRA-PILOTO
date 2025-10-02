/* ==== ORDEN INTELIGENTE ==== */
function dailySeed(){
  const k='altorra:shuffleSeed';
  const today=(new Date()).toISOString().slice(0,10);
  try{
    const raw=localStorage.getItem(k);
    if(raw){
      const obj=JSON.parse(raw);
      if(obj && obj.date===today) return obj.seed;
    }
  }catch(_){}
  const seed=Math.floor(Math.random()*1e9);
  try{ localStorage.setItem(k, JSON.stringify({date:today, seed})); }catch(_){}
  return seed;
}
function seededShuffle(list, seed){
  let s = seed || 1; const a=1664525, c=1013904223, m=2**32;
  const r=()=> (s = (a*s + c) % m) / m;
  const arr=list.slice();
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(r()*(i+1)); const t=arr[i]; arr[i]=arr[j]; arr[j]=t;
  }
  return arr;
}
function smartOrder(list){
  const url = new URL(document.location);
  const qOrder = (url.searchParams.get('order')||'').toLowerCase();
  let L = list.slice();

  if(qOrder==='random') return seededShuffle(L, dailySeed());

  L.sort((a,b)=> (Number(b.featured||0) - Number(a.featured||0)));

  if(qOrder==='views'){
    L.sort((a,b)=>{
      const fb=(Number(b.featured||0)-Number(a.featured||0));
      if(fb) return fb;
      return Number(b.views||0) - Number(a.views||0);
    });
    return L;
  }

  L.sort((a,b)=>{
    const fb=(Number(b.featured||0)-Number(a.featured||0));
    if(fb) return fb;
    const hb=Number(b.highlightScore||0)-Number(a.highlightScore||0);
    if(hb) return hb;
    return 0;
  });
  return seededShuffle(L, dailySeed());
}

window.__ALT_BUILD='2025-10-02-fix';

/* ===== CACHE INTELIGENTE CON VERSIÓN ===== */
const ALT_CACHE_VER = '2025-10-02.1'; // ✅ Cambiar si actualizas data.json
const ALT_NS = 'altorra:json:';

function jsonKey(url){ return `${ALT_NS}${url}::${ALT_CACHE_VER}`; }
function now(){ return Date.now(); }

function resolveAsset(u){ 
  if(!u) return ''; 
  try{ return new URL(u, document.baseURI).href; }
  catch(_){ return u; }
}

/**
 * Cache JSON con revalidación inteligente
 */
async function getJSONCached(url, { ttlMs = 1000 * 60 * 30, revalidate = true } = {}) {
  let cached = null;
  try {
    const raw = localStorage.getItem(jsonKey(url));
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj && obj.t && (now() - obj.t) < ttlMs && obj.data) {
        cached = obj.data;
      }
    }
  } catch(_) {}

  if (cached) {
    if (revalidate) {
      fetch(url, { cache: 'no-store' })
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(data => {
          try { localStorage.setItem(jsonKey(url), JSON.stringify({ t: now(), data })); } catch(_){}
          document.dispatchEvent(new CustomEvent('altorra:json-updated', { detail: { url } }));
        })
        .catch(()=>{ /* silencio */ });
    }
    return cached;
  }

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  try { localStorage.setItem(jsonKey(url), JSON.stringify({ t: now(), data })); } catch(_){}
  return data;
}

/* ===== LAZY LOAD IMÁGENES ===== */
document.addEventListener('DOMContentLoaded', function() {
  const isCritical = (img) => {
    if (img.hasAttribute('loading')) return true;
    if (img.matches('.no-lazy, [data-eager]')) return true;
    const inHeader = img.closest('header');
    const inFooter = img.closest('footer');
    const isHero = img.closest('.hero');
    return !!(inHeader || inFooter || isHero);
  };

  document.querySelectorAll('img').forEach(function(img) {
    if (!isCritical(img)) {
      img.setAttribute('loading', 'lazy');
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    }
  });
});

/* ===== RESEÑAS ===== */
(function(){
  const wrap = document.getElementById('google-reviews');
  const fallback = document.getElementById('reviews-fallback');
  if(!wrap) return;
  fetch('reviews.json').then(function(res){
    if(!res.ok) throw new Error('HTTP '+res.status);
    return res.json();
  }).then(function(reviews){
    if(Array.isArray(reviews) && reviews.length){
      if(fallback) fallback.hidden = true;
      let sample = reviews.slice().sort(()=>Math.random()-0.5).slice(0,3);
      wrap.innerHTML = '';
      sample.forEach(function(r){
        const card = document.createElement('article');
        card.className = 'review-card';
        const head = document.createElement('div');
        head.className = 'review-head';
        const name = document.createElement('div'); name.textContent = r.author;
        const stars = document.createElement('div'); stars.className = 'review-stars';
        const rating = Math.round(parseFloat(r.rating) || 0);
        stars.textContent = '★★★★★'.slice(0, rating);
        stars.setAttribute('aria-label', rating+' de 5');
        const time = document.createElement('div');
        time.style.marginLeft='auto'; time.style.color='#6b7280'; time.style.fontSize='.9rem';
        time.textContent = r.time || '';
        head.appendChild(name); head.appendChild(stars); head.appendChild(time);
        const body = document.createElement('p');
        body.className = 'review-text'; body.textContent = r.content;
        card.appendChild(head); card.appendChild(body); wrap.appendChild(card);
      });
    }
  }).catch(function(err){ console.warn('No se pudieron cargar reseñas', err); });
})();

/* ===== BUSCADOR RÁPIDO HOME ===== */
(function(){
  const form = document.getElementById('quickSearch');
  if(!form) return;

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    e.stopImmediatePropagation();

    const codeEl = document.getElementById('f-code');
    const code = (codeEl && codeEl.value || '').trim();
    if (code) {
      try {
        const data = await getJSONCached('properties/data.json', { ttlMs: 1000*60*60*6, revalidate: true });
        const match = Array.isArray(data) ? data.find(p => String(p.id||'').toLowerCase().trim() === code.toLowerCase()) : null;
        if (match) {
          window.location.href = 'detalle-propiedad.html?id=' + encodeURIComponent(match.id);
        } else {
          alert('El código ingresado no existe. Por favor ingresa un código válido.');
        }
      } catch {
        alert('No fue posible validar el código en este momento.');
      }
      return;
    }

    const op = document.getElementById('op')?.value || 'comprar';
    const type = document.getElementById('f-type')?.value || '';
    const city = document.getElementById('f-city')?.value || '';
    const budget = document.getElementById('f-budget')?.value || '';

    const map = {
      comprar: 'propiedades-comprar.html',
      arrendar: 'propiedades-arrendar.html',
      alojar: 'propiedades-alojamientos.html'
    };
    const dest = map[op] || 'propiedades-comprar.html';

    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (type) params.set('type', type);
    if (budget) params.set('max', budget);

    const query = params.toString();
    window.location.href = dest + (query ? '?' + query : '');
  });
})();

/* ===== FLECHAS DE CARRUSELES (HOME) ===== */
(function(){
  document.querySelectorAll('.arrow').forEach(function(btn){
    const targetId = btn.dataset.target;
    const root = document.getElementById(targetId);
    if(!root) return;
    btn.addEventListener('click', function(){
      const card = root.querySelector('.card');
      if(!card) return;
      const gap = parseFloat(getComputedStyle(root).gap) || 12;
      const step = card.getBoundingClientRect().width + gap;
      const dir = btn.classList.contains('left') ? -1 : 1;
      root.scrollBy({ left: dir * step, behavior: 'smooth' });
    });
  });
})();

/* ===== MINIATURAS HOME ===== */
(function(){
  const cfg = [
    {operation:'comprar', targetId:'carouselVenta',    mode:'venta'},
    {operation:'arrendar',targetId:'carouselArriendo', mode:'arriendo'},
    {operation:'dias',    targetId:'carouselDias',     mode:'dias'}
  ];

  function formatCOP(n){ if(n==null) return ''; return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.'); }
  function escapeHtml(s){ return String(s||'').replace(/[&<>"]/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }

  function buildCard(p, mode){
    const el = document.createElement('article');
    el.className = 'card'; el.setAttribute('role','listitem');

    const img = document.createElement('img');
    img.loading='lazy'; img.decoding='async'; img.alt = escapeHtml(p.title || 'Propiedad');
    const raw = p.image || p.img || p.img_url || p.imgUrl || p.photo;

    if (raw) {
      const isAbsolute = /^https?:\/\//i.test(raw);
      if (isAbsolute || raw.startsWith('/')) {
        img.src = raw;
      } else {
        img.src = '/' + raw.replace(/^\.?\//,'');
      }
    } else {
      img.src = 'https://i.postimg.cc/0yYb8Y6r/placeholder.png';
    }

    const body = document.createElement('div'); body.className='body';
    const h3 = document.createElement('h3'); h3.innerHTML = escapeHtml(p.title || 'Sin título');

    const specs = document.createElement('div'); specs.style.color='var(--muted)';
    const parts = [];
    if(p.beds)  parts.push(p.beds+'H');
    if(p.baths) parts.push(p.baths+'B');
    if(p.sqm)   parts.push(p.sqm+' m²');
    specs.textContent = parts.join(' · ');

    const price = document.createElement('div');
    price.style.marginTop='4px'; price.style.fontWeight='800'; price.style.color='var(--gold)';
    if(p.price){
      price.textContent = (mode==='arriendo' ? '+formatCOP(p.price)+' COP / mes' :
                           mode==='dias'     ? '+formatCOP(p.price)+' COP / noche' :
                                               '+formatCOP(p.price)+' COP');
    }

    el.appendChild(img); el.appendChild(body);
    body.appendChild(h3); body.appendChild(specs); body.appendChild(price);

    el.addEventListener('click', function(){
      const id = p.id || '';
      window.location.href = 'detalle-propiedad.html?id=' + encodeURIComponent(id);
    });
    return el;
  }

  async function fetchByOperation(op){
    try{
      let data = await getJSONCached('properties/data.json', { ttlMs: 1000*60*60*6, revalidate: true });
      if(!Array.isArray(data)) throw new Error('Formato inválido');
      return data.filter(it => String(it.operation).toLowerCase() === String(op).toLowerCase());
    }catch(e){
      console.warn('No se pudieron cargar propiedades', op, e);
      return [];
    }
  }

  document.addEventListener('DOMContentLoaded', async function(){
    const tasks = cfg.map(c => fetchByOperation(c.operation).then(arr => ({c, arr})));
    const results = await Promise.all(tasks);
    results.forEach(({c, arr})=>{
      const root = document.getElementById(c.targetId);
      if(!root) return;
      root.innerHTML = '';
      let empty = root.parentElement && root.parentElement.querySelector('.empty-home-msg');
      if(!empty){ root.insertAdjacentHTML('afterend','<p class="empty-home-msg" style="display:none;margin-top:12px;">Sin propiedades para mostrar.</p>'); empty = root.parentElement && root.parentElement.querySelector('.empty-home-msg'); }
      if(arr.length===0){ if(empty) empty.style.display = 'block'; return; } else { if(empty) empty.style.display='none'; }

      const ordered = smartOrder(arr);
      ordered.slice(0,8).forEach(p => root.appendChild(buildCard(p, c.mode)));
    });

    document.addEventListener('altorra:json-updated', (ev) => {
      if (!/properties\/data\.json$/.test(ev.detail?.url || '')) return;
      cfg.forEach(async (c) => {
        const root = document.getElementById(c.targetId);
        if(!root) return;
        const arr = await fetchByOperation(c.operation);
        root.innerHTML = '';
        const ordered = smartOrder(arr);
        ordered.slice(0,8).forEach(p => root.appendChild(buildCard(p, c.mode)));
      });
    }, { once: true });
  });
})();

/* ===== SERVICE WORKER ===== */
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/service-worker.js').catch(function(err){
    console.warn('SW registration failed', err);
  });
}

/* ===== ORG JSON-LD ===== */
(function(){
  try{
    if(document.querySelector('script[type="application/ld+json"].org-jsonld')) return;
    var org = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ALTORRA Inmobiliaria",
      "url": "https://altorrainmobiliaria.github.io/",
      "logo": "https://i.postimg.cc/SsPmBFXt/Chat-GPT-Image-9-altorra-logo-2025-10-31-20.png",
      "sameAs": ["https://www.instagram.com/altorrainmobiliaria", "https://www.facebook.com/share/16MEXCeAB4/?mibextid=wwXIfr", "https://www.tiktok.com/@altorrainmobiliaria"]
    };
    var s = document.createElement('script');
    s.type = "application/ld+json";
    s.className = "org-jsonld";
    s.textContent = JSON.stringify(org);
    document.head.appendChild(s);
  }catch(e){ console.warn("Org JSON-LD inject failed", e); }
})();
