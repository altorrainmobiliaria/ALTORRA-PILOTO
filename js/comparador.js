/* ========================================
   ALTORRA - Comparador de Propiedades
   ======================================== */

(function() {
  'use strict';

  const STORAGE_KEY = 'altorra:compare';
  const MAX_ITEMS = 3;
  const WHATSAPP_NUMBER = '573002439810';

  // Obtener lista de comparación
  function getCompareList() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  // Guardar lista de comparación
  function saveCompareList(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      updateBadge();
      document.dispatchEvent(new CustomEvent('altorra:compare-updated'));
    } catch (e) {
      console.warn('No se pudo guardar la lista de comparación');
    }
  }

  // Verificar si una propiedad está en la lista
  function isInCompare(propId) {
    const list = getCompareList();
    return list.some(p => p.id === propId);
  }

  // Agregar propiedad a comparar
  function addToCompare(property) {
    const list = getCompareList();

    if (list.length >= MAX_ITEMS) {
      alert(`Solo puedes comparar hasta ${MAX_ITEMS} propiedades. Elimina una para agregar otra.`);
      return false;
    }

    if (isInCompare(property.id)) {
      return false;
    }

    // Guardar solo los datos necesarios
    list.push({
      id: property.id,
      title: property.title,
      price: property.price,
      city: property.city,
      type: property.type,
      beds: property.beds,
      baths: property.baths,
      sqm: property.sqm,
      garages: property.garages,
      strata: property.strata,
      admin_fee: property.admin_fee,
      year_built: property.year_built,
      neighborhood: property.neighborhood,
      operation: property.operation,
      features: property.features || [],
      image: property.image || (Array.isArray(property.images) && property.images[0]) || ''
    });

    saveCompareList(list);
    showToast('Agregado a comparar');
    return true;
  }

  // Remover propiedad de comparar
  function removeFromCompare(propId) {
    let list = getCompareList();
    list = list.filter(p => p.id !== propId);
    saveCompareList(list);
    showToast('Removido de comparar');
    return true;
  }

  // Toggle comparar
  function toggleCompare(property) {
    if (isInCompare(property.id)) {
      removeFromCompare(property.id);
      return false;
    } else {
      return addToCompare(property);
    }
  }

  // Limpiar lista
  function clearCompare() {
    saveCompareList([]);
  }

  // Formatear precio
  function formatPrice(price) {
    if (!price) return '-';
    return '$ ' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // Mostrar toast
  function showToast(message) {
    const existing = document.querySelector('.compare-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'compare-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #111;
      color: #fff;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.2s ease;
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 250);
    }, 2000);
  }

  // Crear badge flotante
  function createBadge() {
    if (document.getElementById('compare-badge')) return;

    const badge = document.createElement('div');
    badge.id = 'compare-badge';
    badge.className = 'compare-badge';
    badge.innerHTML = `
      <svg viewBox="0 0 24 24"><path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z"/></svg>
      <span>Comparar</span>
      <span class="count">0</span>
    `;

    badge.addEventListener('click', () => {
      window.location.href = 'comparar.html';
    });

    document.body.appendChild(badge);
    updateBadge();
  }

  // Actualizar badge
  function updateBadge() {
    const badge = document.getElementById('compare-badge');
    if (!badge) return;

    const list = getCompareList();
    const count = badge.querySelector('.count');

    if (count) {
      count.textContent = list.length;
    }

    if (list.length > 0) {
      badge.classList.add('visible');
    } else {
      badge.classList.remove('visible');
    }
  }

  // Crear botón de comparar para una tarjeta
  function createCompareButton(property) {
    const btn = document.createElement('button');
    btn.className = 'btn-compare';
    btn.type = 'button';
    btn.dataset.propId = property.id;

    const inList = isInCompare(property.id);
    btn.innerHTML = inList
      ? '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> En comparar'
      : '<svg viewBox="0 0 24 24"><path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z"/></svg> Comparar';

    if (inList) {
      btn.classList.add('added');
    }

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const added = toggleCompare(property);

      if (added) {
        btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> En comparar';
        btn.classList.add('added');
      } else {
        btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z"/></svg> Comparar';
        btn.classList.remove('added');
      }
    });

    return btn;
  }

  // Formatear tipo de operación
  function formatOperation(op) {
    const operations = {
      'comprar': '🏷️ Venta',
      'arrendar': '🔑 Arriendo',
      'dias': '🌴 Por días',
      'alojar': '🌴 Por días'
    };
    return operations[op] || op || '-';
  }

  // Renderizar página de comparación
  function renderComparePage(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const list = getCompareList();

    if (list.length === 0) {
      container.innerHTML = `
        <div class="compare-empty">
          <svg viewBox="0 0 24 24"><path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z"/></svg>
          <h2>No hay propiedades para comparar</h2>
          <p>Agrega propiedades desde el listado para compararlas aquí</p>
          <a href="propiedades-comprar.html" class="btn">Ver propiedades</a>
        </div>
      `;
      return;
    }

    // Definir filas de comparación
    const rows = [
      { label: 'Operación', key: 'operation', format: formatOperation },
      { label: 'Precio', key: 'price', format: formatPrice },
      { label: 'Ciudad', key: 'city' },
      { label: 'Barrio', key: 'neighborhood' },
      { label: 'Tipo', key: 'type', format: (v) => v ? v.charAt(0).toUpperCase() + v.slice(1) : '-' },
      { label: 'Habitaciones', key: 'beds' },
      { label: 'Baños', key: 'baths' },
      { label: 'Área (m²)', key: 'sqm' },
      { label: 'Parqueaderos', key: 'garages' },
      { label: 'Estrato', key: 'strata' },
      { label: 'Administración', key: 'admin_fee', format: formatPrice },
      { label: 'Año construcción', key: 'year_built' }
    ];

    // Construir grid con wrapper para scroll en móvil
    let html = '';

    // Indicador de scroll para móvil
    if (list.length >= 2) {
      html += '<div class="compare-scroll-hint">👆 Desliza horizontalmente para ver todas las propiedades</div>';
    }

    html += `<div class="compare-grid-wrapper"><div class="compare-grid" style="--compare-cols: ${list.length}">`;

    // Header con fotos y títulos
    html += '<div class="compare-header">';
    html += '<div class="compare-header-cell"></div>';

    list.forEach(prop => {
      const imgSrc = prop.image || 'https://i.postimg.cc/0yYb8Y6r/placeholder.png';
      html += `
        <div class="compare-header-cell">
          <img src="${imgSrc}" alt="${prop.title}" onerror="this.src='https://i.postimg.cc/0yYb8Y6r/placeholder.png'">
          <h3>${prop.title}</h3>
          <div class="price">${formatPrice(prop.price)}</div>
          <button class="remove-btn" onclick="AltorraComparador.remove('${prop.id}')">Eliminar</button>
        </div>
      `;
    });
    html += '</div>';

    // Filas de datos
    rows.forEach(row => {
      html += '<div class="compare-row">';
      html += `<div class="compare-label">${row.label}</div>`;

      // Encontrar el mejor valor para destacar
      let values = list.map(p => p[row.key]);
      let bestIdx = -1;

      if (row.key === 'price') {
        // Menor precio es mejor
        const minPrice = Math.min(...values.filter(v => v));
        bestIdx = values.findIndex(v => v === minPrice);
      } else if (['beds', 'baths', 'sqm', 'garages'].includes(row.key)) {
        // Mayor es mejor
        const maxVal = Math.max(...values.filter(v => v));
        bestIdx = values.findIndex(v => v === maxVal);
      }

      list.forEach((prop, idx) => {
        let value = prop[row.key];
        if (row.format) {
          value = row.format(value);
        }
        const isHighlight = idx === bestIdx && bestIdx !== -1 && value && value !== '-';
        html += `<div class="compare-value${isHighlight ? ' highlight' : ''}">${value || '-'}</div>`;
      });

      html += '</div>';
    });

    // Características comunes
    const allFeatures = new Set();
    list.forEach(p => {
      if (Array.isArray(p.features)) {
        p.features.forEach(f => allFeatures.add(f));
      }
    });

    if (allFeatures.size > 0) {
      Array.from(allFeatures).slice(0, 8).forEach(feature => {
        html += '<div class="compare-row">';
        html += `<div class="compare-label">${feature}</div>`;
        list.forEach(prop => {
          const has = Array.isArray(prop.features) && prop.features.includes(feature);
          html += `<div class="compare-value">${has ? '<span class="check">✓</span>' : '<span class="cross">—</span>'}</div>`;
        });
        html += '</div>';
      });
    }

    // Botones de acción
    html += '<div class="compare-actions">';
    html += '<div class="compare-action-cell"></div>';

    list.forEach(prop => {
      const waText = encodeURIComponent(`Hola Altorra, me interesa la propiedad "${prop.title}" (ID: ${prop.id})`);
      html += `
        <div class="compare-action-cell">
          <a href="detalle-propiedad.html?id=${prop.id}" class="btn btn-primary">Ver detalles</a>
          <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${waText}" target="_blank" rel="noopener" class="btn btn-wa">WhatsApp</a>
        </div>
      `;
    });

    html += '</div>';
    html += '</div>';
    html += '</div>'; // Cerrar compare-grid-wrapper

    // Botón limpiar
    html += `
      <div style="text-align: center; margin-top: 24px;">
        <button onclick="AltorraComparador.clear()" style="
          padding: 10px 20px;
          border: 1px solid rgba(17,24,39,0.12);
          border-radius: 8px;
          background: #f8f9fa;
          font-weight: 600;
          cursor: pointer;
        ">Limpiar comparación</button>
      </div>
    `;

    container.innerHTML = html;
  }

  // API pública
  window.AltorraComparador = {
    get: getCompareList,
    add: addToCompare,
    remove: function(propId) {
      removeFromCompare(propId);
      // Re-renderizar si estamos en la página de comparación
      const container = document.getElementById('compare-container');
      if (container) {
        renderComparePage('compare-container');
      }
    },
    toggle: toggleCompare,
    isIn: isInCompare,
    clear: function() {
      if (confirm('¿Eliminar todas las propiedades de la comparación?')) {
        clearCompare();
        const container = document.getElementById('compare-container');
        if (container) {
          renderComparePage('compare-container');
        }
      }
    },
    createButton: createCompareButton,
    render: renderComparePage,
    updateBadge: updateBadge
  };

  // Inicializar
  document.addEventListener('DOMContentLoaded', () => {
    createBadge();

    // Auto-renderizar si estamos en la página de comparación
    const container = document.getElementById('compare-container');
    if (container) {
      renderComparePage('compare-container');
    }
  });

})();
