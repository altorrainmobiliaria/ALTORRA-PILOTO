/* ===== Utilidades comunes ===== */
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));
const $  = (sel, el=document) => el.querySelector(sel);
const fmtCOP = n => (n||n===0) ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.') : '';

function getQuery(k, def=''){
  const u = new URL(location.href);
  return u.searchParams.get(k) ?? def;
}
function setQuery(k, v){
  const u = new URL(location.href);
  if(v==null || v==='') u.searchParams.delete(k);
  else u.searchParams.set(k, v);
  location.href = u.toString();
}

/* Rutas relativas para repos bajo subcarpeta (PILOTO) */
function normSrc(src){
  if(!src) return '';
  if(src.startsWith('http')||src.startsWith('//')) return src;
  return src.replace(/^\/+/, ''); // quita "/" inicial
}

/* ===== Carga de propiedades (JSON) ===== */
async function loadProperties(){
  const res = await fetch('properties/data.json',{cache:'no-store'});
  if(!res.ok) throw new Error('HTTP '+res.status);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/* ===== Ordenamiento =====
  sort=featured | views | random | priceAsc | priceDesc
*/
function sortProperties(list, mode){
  const arr = list.slice();
  switch((mode||'').toLowerCase()){
    case 'featured':
      // featured primero, luego por precio desc
      arr.sort((a,b)=> (b.featured===true)-(a.featured===true) || (b.price||0)-(a.price||0));
      break;
    case 'views':
      arr.sort((a,b)=> (b.views||0)-(a.views||0));
      break;
    case 'priceasc':
      arr.sort((a,b)=> (a.price||0)-(b.price||0));
      break;
    case 'pricedesc':
      arr.sort((a,b)=> (b.price||0)-(a.price||0));
      break;
    case 'random':
      for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
      break;
    default:
      // por defecto: featured
      arr.sort((a,b)=> (b.featured===true)-(a.featured===true) || (b.price||0)-(a.price||0));
  }
  return arr;
}

/* ===== Render de tarjeta ===== */
function renderCard(p){
  const img = normSrc(p.image || (Array.isArray(p.images)&&p.images[0]) || 'multimedia/placeholder.webp');
  const opRaw = (p.operation||'').toLowerCase();
  const op = opRaw==='arrendar' || opRaw==='arriendo' ? 'Arriendo' : (opRaw==='dias' ? 'Por días' : 'Venta');
  const price = p.price ? `$${fmtCOP(p.price)} COP` + (op==='Arriendo' ? ' / mes' : (op==='Por días'?' / noche':'')) : '';
  const m2 = p.sqm ? `${p.sqm} m²` : '';

  const url = `detalle-propiedad.html?id=${encodeURIComponent(p.id)}`;

  return `
  <article class="card property">
    <a href="${url}" class="card-media"><img src="${img}" alt="${p.title||'Propiedad'}" loading="lazy" decoding="async"></a>
    <div class="card-body">
      <h3 class="card-title"><a href="${url}">${p.title||'-'}</a></h3>
      <div class="card-meta">${[p.city, (p.type||'').toString().charAt(0).toUpperCase()+ (p.type||'').toString().slice(1)].filter(Boolean).join(' · ')}</div>
      <div class="card-specs">
        ${p.beds ? `<span>${p.beds} Hab</span>`:''}
        ${p.baths ? `<span>${p.baths} Baños</span>`:''}
        ${m2 ? `<span>${m2}</span>`:''}
      </div>
      <div class="card-price">${price}</div>
      ${p.featured?`<div class="chip chip-featured">Destacada</div>`:''}
      ${p.views?`<div class="chip chip-views">${p.views} vistas</div>`:''}
    </div>
  </article>`;
}

/* ===== Inyección en páginas ===== */
async function mountHomeOrLists(){
  const grid = $('#prop-grid');
  if(!grid) return;

  const mode = getQuery('sort','featured'); // featured|views|random|priceAsc|priceDesc
  const opFilter = grid.getAttribute('data-operation'); // comprar|arrendar|dias|*
  const typeFilter = grid.getAttribute('data-type'); // si existiera
  const all = await loadProperties();

  const filtered = all.filter(p=>{
    const op = (p.operation||'').toLowerCase();
    const okOp = !opFilter || opFilter==='*' ? true : (op===opFilter);
    const okType = !typeFilter ? true : ((p.type||'').toString().toLowerCase()===typeFilter.toLowerCase());
    return Number(p.available)===1 && okOp && okType;
  });

  const sorted = sortProperties(filtered, mode);

  grid.innerHTML = `
    <div class="toolbar">
      <label>Ordenar:</label>
      <select id="sortSelect">
        <option value="featured" ${mode==='featured'?'selected':''}>Destacadas</option>
        <option value="views" ${mode==='views'?'selected':''}>Más vistas</option>
        <option value="random" ${mode==='random'?'selected':''}>Aleatorio</option>
        <option value="priceAsc" ${mode==='priceasc'?'selected':''}>Precio (menor a mayor)</option>
        <option value="priceDesc" ${mode==='pricedesc'?'selected':''}>Precio (mayor a menor)</option>
      </select>
    </div>
    <div class="grid-cards">${sorted.map(renderCard).join('')}</div>
  `;

  const sel = $('#sortSelect');
  if(sel){
    sel.addEventListener('change', ()=> setQuery('sort', sel.value));
  }
}

/* ===== Inicio ===== */
document.addEventListener('DOMContentLoaded', ()=>{
  mountHomeOrLists();
});
