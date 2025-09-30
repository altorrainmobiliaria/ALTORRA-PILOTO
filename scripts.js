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

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, tag => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#039;"}[tag]));
}

function formatCOP(amount) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(amount);
}

async function getJSONCached(url, ttl = 6*60*60*1000) {
  const cacheKey = `altorra:json:${url}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const {data, timestamp} = JSON.parse(cached);
      if (Date.now() - timestamp < ttl) return data;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    localStorage.setItem(cacheKey, JSON.stringify({data, timestamp: Date.now()}));
    return data;
  } catch(e) {
    console.warn('getJSONCached failed:', e);
    return null;
  }
}

function buildCard(p, mode) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img src="${p.images[0]}" alt="${escapeHTML(p.title)}" loading="lazy">
    <div class="card-content">
      <span class="card-city">${p.city}</span>
      <span class="card-type">${p.type}</span>
      <h3>${escapeHTML(p.title)}</h3>
      <p>${p.beds} Hab / ${p.baths} Baños / ${p.sqm} m²</p>
      <p class="card-price">${formatCOP(p.price)}</p>
    </div>
    <button class="fav-btn" data-id="${p.id}">❤️</button>
  `;
  return card;
}

document.addEventListener('DOMContentLoaded', async () => {
  // Lazy loading imágenes
  document.querySelectorAll('img[loading!="lazy"]').forEach(img => img.loading = 'lazy');

  // Cargar propiedades para rows en home
  const allProperties = await getJSONCached('properties/data.json');
  if (allProperties) {
    const cfg = [
      {targetId: 'venta-row', operation: 'comprar', mode: 'home'},
      {targetId: 'arriendo-row', operation: 'arrendar', mode: 'home'},
      {targetId: 'dias-row', operation: 'dias', mode: 'home'}
    ];
    cfg.forEach(c => {
      const root = document.getElementById(c.targetId);
      if (!root) return;
      const arr = allProperties.filter(p => p.operation === c.operation);
      const ordered = smartOrder(arr);
      root.innerHTML = '';
      ordered.slice(0,3).forEach(p => root.appendChild(buildCard(p, c.mode)));
    });
  }

  // Reseñas
  const reviews = await getJSONCached('reviews.json');
  if (reviews) {
    const shuffled = seededShuffle(reviews, dailySeed());
    const selected = shuffled.slice(0,3);
    const root = document.getElementById('google-reviews');
    if (root) {
      selected.forEach(r => {
        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
          <div class="stars">${'★'.repeat(r.rating)}</div>
          <p>${escapeHTML(r.content)}</p>
          <cite>- ${r.author} (${r.time})</cite>
        `;
        root.appendChild(card);
      });
    }
  }
});

// SW
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').catch(console.warn);
}

// JSON-LD
(function(){
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ALTORRA Inmobiliaria",
    "url": "https://altorrainmobiliaria.github.io/ALTORRA-PILOTO/",
    "logo": "https://i.postimg.cc/SsPmBFXt/Chat-GPT-Image-9-altorra-logo-2025-10-31-20.png",
    "sameAs": ["https://www.instagram.com/altorrainmobiliaria"]
  });
  document.head.appendChild(script);
})();
