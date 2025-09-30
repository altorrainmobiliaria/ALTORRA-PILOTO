/* Altorra - Lógica común para listados de propiedades (consolidado y corregido) */
/* v2025-09-30.2 - Ajustado para carga correcta y debug */

document.addEventLoaded('DOMContentLoaded', async function() {
  console.log('properties-listing.js cargado - Iniciando para operation:', document.body.dataset.operation);
  
  const operation = document.body.dataset.operation;
  if (!operation) {
    console.error('Error: data-operation no definido en body');
    return;
  }

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

  if (!listRoot) {
    console.error('Error: #property-list no encontrado');
    return;
  }

  let currentPage = 1;
  const perPage = 12;
  let filteredProperties = [];

  const allProperties = await getJSONCached('properties/data.json');
  if (!allProperties) {
    console.error('Error: No se pudo cargar properties/data.json');
    listRoot.innerHTML = '<p>Error al cargar propiedades. Verifica la conexión o el archivo data.json.</p>';
    return;
  }
  console.log('Propiedades cargadas:', allProperties.length);

  filteredProperties = allProperties.filter(p => p.operation === operation);
  console.log('Propiedades filtradas iniciales:', filteredProperties.length);

  function renderProperties(props, page = 1) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const slice = props.slice(start, end);

    if (slice.length === 0) {
      listRoot.innerHTML += '<p>No hay más propiedades.</p>';
      return;
    }

    slice.forEach(p => {
      const card = buildCard(p, 'list');
      if (card) listRoot.appendChild(card);
      else console.error('Error: buildCard falló para', p.id);
    });

    if (loadMoreBtn) loadMoreBtn.style.display = (end < props.length) ? 'block' : 'none';
  }

  function applyFilters() {
    let filtered = allProperties.filter(p => p.operation === operation);

    if (cityInput && cityInput.value) filtered = filtered.filter(p => p.city.toLowerCase().includes(cityInput.value.toLowerCase()));
    if (typeInput && typeInput.value !== 'Cualquiera') filtered = filtered.filter(p => p.type === typeInput.value);
    if (minPriceInput && minPriceInput.value) filtered = filtered.filter(p => p.price >= parseInt(minPriceInput.value, 10));
    if (maxPriceInput && maxPriceInput.value) filtered = filtered.filter(p => p.price <= parseInt(maxPriceInput.value, 10));

    if (orderInput && orderInput.value === 'Precio ↑') filtered.sort((a, b) => a.price - b.price);
    else if (orderInput && orderInput.value === 'Precio ↓') filtered.sort((a, b) => b.price - a.price);
    else filtered = smartOrder(filtered);

    filteredProperties = filtered;
    listRoot.innerHTML = '';
    if (filtered.length === 0) listRoot.innerHTML = '<p>No se encontraron propiedades.</p>';
    currentPage = 1;
    renderProperties(filteredProperties, currentPage);
  }

  if (applyBtn) applyBtn.addEventListener('click', applyFilters);
  if (clearBtn) clearBtn.addEventListener('click', () => { if (filterForm) filterForm.reset(); applyFilters(); });
  if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => { currentPage++; renderProperties(filteredProperties, currentPage); });

  applyFilters();
});
