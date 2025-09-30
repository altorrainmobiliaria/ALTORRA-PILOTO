/* Altorra - Lógica común para listados de propiedades (consolidado) */
/* v2025-09-30 - Ajustado para corregir carga de propiedades */

document.addEventListener('DOMContentLoaded', async function() {
  const operation = document.body.dataset.operation;
  if (!operation) return console.error('Operation no definida en data-operation');

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

  let currentPage = 1;
  const perPage = 12;
  let filteredProperties = [];

  // Asegurarse de que getJSONCached y buildCard estén definidos (de scripts.js)
  if (typeof getJSONCached !== 'function' || typeof buildCard !== 'function') {
    console.error('Faltan funciones getJSONCached o buildCard. Verifica scripts.js');
    listRoot.innerHTML = '<p>Error: funciones no disponibles. Recarga o contacta soporte.</p>';
    return;
  }

  const allProperties = await getJSONCached('properties/data.json', 6 * 60 * 60 * 1000);
  if (!allProperties || !Array.isArray(allProperties)) {
    listRoot.innerHTML = '<p>No se pudieron cargar las propiedades. Verifica el archivo data.json.</p>';
    return;
  }

  filteredProperties = allProperties.filter(p => p.operation === operation);

  function renderProperties(props, page = 1) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const slice = props.slice(start, end);

    if (slice.length === 0 && page === 1) {
      listRoot.innerHTML = '<p>No hay propiedades disponibles para esta operación.</p>';
      return;
    }

    slice.forEach(p => {
      const card = buildCard(p, 'list');
      if (card) listRoot.appendChild(card); // Solo si card es válido
    });

    loadMoreBtn.style.display = (end < props.length) ? 'block' : 'none';
  }

  function applyFilters() {
    let filtered = allProperties.filter(p => p.operation === operation);

    if (cityInput.value) filtered = filtered.filter(p => p.city.toLowerCase().includes(cityInput.value.toLowerCase()));
    if (typeInput.value !== 'Cualquiera') filtered = filtered.filter(p => p.type === typeInput.value);
    if (minPriceInput.value) filtered = filtered.filter(p => Number(p.price) >= Number(minPriceInput.value));
    if (maxPriceInput.value) filtered = filtered.filter(p => Number(p.price) <= Number(maxPriceInput.value));

    if (orderInput.value === 'Precio ↑') filtered.sort((a, b) => a.price - b.price);
    else if (orderInput.value === 'Precio ↓') filtered.sort((a, b) => b.price - a.price);
    else filtered = smartOrder(filtered);

    filteredProperties = filtered;
    listRoot.innerHTML = filtered.length ? '' : '<p>No se encontraron propiedades con estos filtros.</p>';
    currentPage = 1;
    renderProperties(filteredProperties, currentPage);
  }

  if (applyBtn) applyBtn.addEventListener('click', applyFilters);
  if (clearBtn) clearBtn.addEventListener('click', () => { filterForm.reset(); applyFilters(); });
  if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => { currentPage++; renderProperties(filteredProperties, currentPage); });

  applyFilters();
});
