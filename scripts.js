window.__ALT_BUILD='2025-09-15d';
/* ========== Altorra - scripts base (optimizado rendimiento) ========== */
/* v2025-09-07.1 — Fixes: city sin doble encode + UR... (truncated 13723 characters)...rescar cards (opcional) */

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
  const qOrder = (url.searchParams.get('order')||'').toLowerCase(); // ?order=featured|views|random
  let L = list.slice();

  if(qOrder==='random') return seededShuffle(L, dailySeed());

  // Siempre prioriza featured si existe
  L.sort((a,b)=> (Number(b.featured||0) - Number(a.featured||0)));

  if(qOrder==='views'){
    L.sort((a,b)=>{
      const fb=(Number(b.featured||0)-Number(a.featured||0));
      if(fb) return fb;
      return Number(b.views||0) - Number(a.views||0);
    });
    return L;
  }

  // Por defecto: featured primero, luego highlightScore, luego barajado diario
  L.sort((a,b)=>{
    const fb=(Number(b.featured||0)-Number(a.featured||0));
    if(fb) return fb;
    const hb=Number(b.highlightScore||0)-Number(a.highlightScore||0);
    if(hb) return hb;
    return 0;
  });
  return seededShuffle(L, dailySeed());
}

function escapeHTML(str) { return str.replace(/[&<>"']/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[tag])); }

function formatCOP(amount) { return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount); }

async function getJSONCached(url, ttl = 6 * 60 * 60 * 1000) {
  const cacheKey = `altorra:json:${url}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < ttl) return data;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
    return data;
  } catch (e) {
    console.warn('getJSONCached failed for ' + url, e);
    return null;
  }
}

function buildCard(p, mode) {
  const card = document.createElement('div');
  card.className = 'card';
  card.style = 'background: white; border-radius: var(--card-r); box-shadow: 0 8px 22px rgba(0,0,0,.08);';

  const imgWrapper = document.createElement('div');
  imgWrapper.className = 'card-img';
  const img = document.createElement('img');
  img.src = p.image || p.images[0];
  img.alt = p.title;
  img.loading = 'lazy';
  imgWrapper.appendChild(img);
  card.appendChild(imgWrapper);

  const content = document.createElement('div');
  content.className = 'card-content';
  content.innerHTML = `
    <span class="card-city">${p.city}</span>
    <span class="card-type">${p.type.toUpperCase()}</span>
    <h3>${escapeHTML(p.title)}</h3>
    <p>${p.beds} H - ${p.baths} B - ${p.sqm} m²</p>
    <span class="card-price">${formatCOP(p.price)}</span>
  `;
  card.appendChild(content);

  const favBtn = document.createElement('button');
  favBtn.className = 'fav-btn';
  favBtn.dataset.id = p.id;
  favBtn.innerHTML = '❤️';
  card.appendChild(favBtn);

  card.addEventListener('click', () => location.href = `/p/${p.id}.html`);

  return card;
}

// Resto de tu código original (reseñas, etc.)

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/service-worker.js').catch(err => console.warn('SW failed', err));
}

// JSON-LD
 (function(){
   // Tu código JSON-LD
 })();
