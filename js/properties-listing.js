/* js/properties-listing.js
   Consolidado de listados (comprar/arrendar/alojamientos)
   - Carga y render de propiedades desde properties/data.json (con rutas fallback del piloto)
   - Filtros por querystring (tipo, max, barrio, h, b, features[])
   - Paginación con "Cargar más"
   - Botón WhatsApp y Compartir
   - Integración con favoritos (window.Favs API)
*/

(() => {
  const DATA_PATHS = [
    'properties/data.json',
    '/PRUEBA-PILOTO/properties/data.json',
    '/properties/data.json'
  ];

  const $list = document.querySelector('[data-prop-list]');
  const $more = document.querySelector('[data-load-more]');
  const pageSize = 12; // Ajustable
  let all = [];
  let page = 0;

  // Utils
  const qs = new URLSearchParams(location.search);
  const money = (n) => new Intl.NumberFormat('es-CO', {
    style:'currency', currency:'COP', maximumFractionDigits:0
  }).format(n||0);
  const getTypeFromPage = () =>
    document.body.getAttribute('data-page-type') || qs.get('tipo') || 'comprar';

  const matchesFilters = (p) => {
    const tipo = getTypeFromPage(); // 'comprar' | 'arrendar' | 'alojamientos'
    if (p.tipo !== tipo) return false;

    const max = parseInt(qs.get('max')||'',10);
    if (!Number.isNaN(max) && p.precio && p.precio > max) return false;

    const barrio = (qs.get('barrio')||'').trim().toLowerCase();
    if (barrio && !(p.barrio||'').toLowerCase().includes(barrio)) return false;

    const hab = parseInt(qs.get('h')||'',10);
    if (!Number.isNaN(hab) && (p.habitaciones||0) < hab) return false;

    const ban = parseInt(qs.get('b')||'',10);
    if (!Number.isNaN(ban) && (p.banos||0) < ban) return false;

    const features = qs.getAll('features[]');
    if (features.length) {
      const set = new Set((p.caracteristicas||[]).map(s=>String(s).toLowerCase()));
      for (const f of features) if (!set.has(String(f).toLowerCase())) return false;
    }
    return true;
  };

  const card = (p) => {
    const img = (p.images && p.images[0]) || p.shareImage || p.ogImage || 'hero-emotion.webp';
    const favClass = (window.Favs && window.Favs.has(p.id)) ? ' is-fav' : '';
    const favBtn = window.Favs
      ? `<button class="btn-fav" data-fav-id="${p.id}" title="Agregar a favoritos" aria-label="Agregar a favoritos">❤</button>`
      : '';

    return `
<article class="card-prop${favClass}" data-id="${p.id}">
  <div class="card-thumb">
    <img loading="lazy" src="${img}" alt="${p.titulo||'Propiedad'}">
    ${favBtn}
  </div>
  <div class="card-body">
    <h3 class="card-title">${p.titulo||'Propiedad'}</h3>
    <div class="card-meta">
      <span>${p.habitaciones||0} H · ${p.banos||0} B · ${p.m2||p.area||'—'} m²</span>
      <strong>${
        p.precio
          ? money(p.precio)
          : (p.precioNoche ? money(p.precioNoche) + '/noche' : '')
      }</strong>
    </div>
    <div class="card-actions">
      <a class="btn" href="detalle-propiedad.html?id=${encodeURIComponent(p.id)}">Ver detalle</a>
      <a class="btn outline"
         href="https://wa.me/573235016747?text=${encodeURIComponent(`Hola ALTORRA, me interesa la propiedad ${p.id} (${p.titulo}). ¿Podemos hablar?`)}"
         target="_blank" rel="noopener">WhatsApp</a>
      <button class="btn ghost" data-share data-id="${p.id}">Compartir</button>
    </div>
  </div>
</article>`;
  };

  const renderPage = () => {
    const start = page * pageSize;
    const slice = all.slice(start, start + pageSize);
    const html = slice.map(card).join('');
    $list.insertAdjacentHTML('beforeend', html);
    page++;
    if (page * pageSize >= all.length && $more) $more.hidden = true;

    // Eventos
    if (window.Favs) {
      $list.querySelectorAll('[data-fav-id]').forEach(btn => {
        btn.addEventListener('click', () => window.Favs.toggle(btn.getAttribute('data-fav-id')));
      });
    }
    $list.querySelectorAll('[data-share]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const url = new URL(location.origin + '/detalle-propiedad.html?id=' + encodeURIComponent(id));
        if (navigator.share) {
          try { await navigator.share({title:'ALTORRA', text:'Mira esta propiedad', url:String(url)}); } catch {}
        } else {
          await navigator.clipboard.writeText(String(url));
          const old = btn.textContent;
          btn.textContent = 'Copiado';
          setTimeout(()=>btn.textContent = old, 1500);
        }
      });
    });
  };

  const boot = async () => {
    for (const path of DATA_PATHS) {
      try {
        const res = await fetch(path, {cache:'no-store'});
        if (res.ok) {
          const data = await res.json();
          all = Array.isArray(data) ? data : (data.items || []);
          break;
        }
      } catch {}
    }
    all = (all||[]).filter(matchesFilters);
    if (!$list) return;
    renderPage();
    if ($more) $more.addEventListener('click', renderPage);
  };

  document.addEventListener('DOMContentLoaded', boot);
})();
