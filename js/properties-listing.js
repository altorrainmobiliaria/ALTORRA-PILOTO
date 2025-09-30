/* Altorra - Lógica común para listados de propiedades (consolidado) */
/* v2025-09-30 - Basado en tu código original, optimizado y unificado */
/* Este archivo reemplaza el JS duplicado en las 3 páginas de propiedades */

document.addEventListener('DOMContentLoaded', async function() {
  // Detectar la operación basada en data-operation del body
  const operation = document.body.dataset.operation; // 'comprar', 'arrendar' o 'dias'
  if (!operation) return console.error('Operation no definida en data-operation');

  // Elementos del DOM (asumiendo IDs iguales en tus 3 páginas)
  const filterForm = document.getElementById('filter-form');
  const cityInput = document.getElementById('filter-city');
  const typeInput = document.getElementById('filter-type');
  const minPriceInput = document.getElementById('filter-min-price');
  const maxPriceInput = document.getElementById('filter-max-price');
  const orderInput = document.getElementById('filter-order');
  const clearBtn = document.getElementById('filter-clear');
  const applyBtn = document.getElementById('filter-apply');
  const listRoot = document.getElementById('property-list');
  const loadMoreBtn = document.getElementById('load-more');

  // Config paginación
  let currentPage = 1;
  const perPage = 12;
  let filteredProperties = [];

  // Cargar datos (usa getJSONCached de tu scripts.js)
  const allProperties = await getJSONCached('properties/data.json', 6 * 60 * 60 * 1000);
  if (!allProperties) {
    listRoot.innerHTML = '<p>Error al cargar propiedades. Intenta recargar.</p>';
    return;
  }

  // Filtrar inicial por operación
  filteredProperties = allProperties.filter(p => p.operation === operation);

  // Función para renderizar (usa buildCard de scripts.js)
  function renderProperties(props, page = 1) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const slice = props.slice(start, end);

    slice.forEach(p => {
      const card = buildCard(p, 'list');
      listRoot.appendChild(card);
    });

    loadMoreBtn.style.display = (end < props.length) ? 'block' : 'none';
  }

  // Aplicar filtros
  function applyFilters() {
    let filtered = allProperties.filter(p => p.operation === operation);

    if (cityInput.value) filtered = filtered.filter(p => p.city.toLowerCase().includes(cityInput.value.toLowerCase()));
    if (typeInput.value !== 'Cualquiera') filtered = filtered.filter(p => p.type === typeInput.value);
    if (minPriceInput.value) filtered = filtered.filter(p => Number(p.price) >= Number(minPriceInput.value));
    if (maxPriceInput.value) filtered = filtered.filter(p => Number(p.price) <= Number(maxPriceInput.value));

    // Ordenar (usa smartOrder de scripts.js)
    if (orderInput.value === 'Precio ↑') filtered.sort((a, b) => a.price - b.price);
    else if (orderInput.value === 'Precio ↓') filtered.sort((a, b) => b.price - a.price);
    else filtered = smartOrder(filtered);

    filteredProperties = filtered;
    listRoot.innerHTML = filtered.length ? '' : '<p>No se encontraron propiedades con estos filtros.</p>';
    currentPage = 1;
    renderProperties(filteredProperties, currentPage);
  }

  // Eventos
  if (applyBtn) applyBtn.addEventListener('click', applyFilters);
  if (clearBtn) clearBtn.addEventListener('click', () => { filterForm.reset(); applyFilters(); });
  if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => { currentPage++; renderProperties(filteredProperties, currentPage); });

  // Inicial
  applyFilters();
});