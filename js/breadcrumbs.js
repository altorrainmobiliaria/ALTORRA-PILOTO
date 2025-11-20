/* ========================================
   ALTORRA BREADCRUMBS - Navegación y SEO
   ======================================== */

(function() {
  'use strict';

  const BASE_URL = 'https://altorrainmobiliaria.github.io';

  // Configuración de rutas y breadcrumbs
  const BREADCRUMB_CONFIG = {
    'index.html': [],
    '/': [],

    // Propiedades
    'propiedades-comprar.html': [
      { name: 'Inicio', url: '/' },
      { name: 'Propiedades en Venta', url: '/propiedades-comprar.html' }
    ],
    'propiedades-arrendar.html': [
      { name: 'Inicio', url: '/' },
      { name: 'Propiedades en Arriendo', url: '/propiedades-arrendar.html' }
    ],
    'propiedades-alojamientos.html': [
      { name: 'Inicio', url: '/' },
      { name: 'Alojamientos por Días', url: '/propiedades-alojamientos.html' }
    ],
    'detalle-propiedad.html': [
      { name: 'Inicio', url: '/' },
      { name: 'Propiedades', url: '/propiedades-comprar.html' },
      { name: 'Detalle de Propiedad', url: null } // null = current page, no link
    ],

    // Servicios
    'servicios-administracion.html': [
      { name: 'Inicio', url: '/' },
      { name: 'Servicios', url: null },
      { name: 'Administración de Inmuebles', url: '/servicios-administracion.html' }
    ],
    'servicios-juridicos.html': [
      { name: 'Inicio', url: '/' },
      { name: 'Servicios', url: null },
      { name: 'Servicios Jurídicos', url: '/servicios-juridicos.html' }
    ],
    'servicios-contables.html': [
      { name: 'Inicio', url: '/' },
      { name: 'Servicios', url: null },
      { name: 'Servicios Contables', url: '/servicios-contables.html' }
    ],
    'servicios-mantenimiento.html': [
      { name: 'Inicio', url: '/' },
      { name: 'Servicios', url: null },
      { name: 'Mantenimiento', url: '/servicios-mantenimiento.html' }
    ],
    'servicios-mudanzas.html': [
      { name: 'Inicio', url: '/' },
      { name: 'Servicios', url: null },
      { name: 'Mudanzas', url: '/servicios-mudanzas.html' }
    ],

    // Herramientas
    'comparar.html': [
      { name: 'Inicio', url: '/' },
      { name: 'Comparador de Propiedades', url: '/comparar.html' }
    ],
    'favoritos.html': [
      { name: 'Inicio', url: '/' },
      { name: 'Mis Favoritos', url: '/favoritos.html' }
    ],

    // Institucional
    'contacto.html': [
      { name: 'Inicio', url: '/' },
      { name: 'Contacto', url: '/contacto.html' }
    ],
    'quienes-somos.html': [
      { name: 'Inicio', url: '/' },
      { name: 'Quiénes Somos', url: '/quienes-somos.html' }
    ],
    'publicar-propiedad.html': [
      { name: 'Inicio', url: '/' },
      { name: 'Publicar Propiedad', url: '/publicar-propiedad.html' }
    ],
    'privacidad.html': [
      { name: 'Inicio', url: '/' },
      { name: 'Política de Privacidad', url: '/privacidad.html' }
    ]
  };

  /**
   * Genera el schema markup JSON-LD para breadcrumbs
   * @param {Array} breadcrumbs - Array de objetos {name, url}
   * @returns {Object} Schema markup
   */
  function generateBreadcrumbSchema(breadcrumbs) {
    const itemListElement = breadcrumbs
      .filter(item => item.url !== null) // Excluir items sin URL (página actual)
      .map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url.startsWith('http') ? item.url : BASE_URL + item.url
      }));

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": itemListElement
    };
  }

  /**
   * Genera el HTML para los breadcrumbs
   * @param {Array} breadcrumbs - Array de objetos {name, url}
   * @returns {String} HTML string
   */
  function generateBreadcrumbHTML(breadcrumbs) {
    if (!breadcrumbs || breadcrumbs.length === 0) {
      return '';
    }

    const items = breadcrumbs.map((item, index) => {
      const isLast = index === breadcrumbs.length - 1;

      if (item.url === null || isLast) {
        // Último item o item sin URL - sin link
        return `<li class="breadcrumb-item active" aria-current="page">${item.name}</li>`;
      } else {
        // Item con link
        return `<li class="breadcrumb-item"><a href="${item.url}">${item.name}</a></li>`;
      }
    }).join('');

    return `
      <nav aria-label="breadcrumb" class="altorra-breadcrumb">
        <ol class="breadcrumb">
          ${items}
        </ol>
      </nav>
    `;
  }

  /**
   * Inserta el schema markup en el head del documento
   * @param {Object} schema - Schema markup object
   */
  function insertSchema(schema) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  }

  /**
   * Renderiza los breadcrumbs en el contenedor especificado
   * @param {String} containerId - ID del contenedor (sin #)
   */
  function renderBreadcrumbs(containerId = 'breadcrumb-container') {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn('⚠️ Breadcrumb container not found:', containerId);
      return;
    }

    // Obtener la ruta actual
    const pathname = window.location.pathname;
    const filename = pathname.split('/').pop() || 'index.html';

    // Obtener configuración de breadcrumbs
    let breadcrumbs = BREADCRUMB_CONFIG[filename];

    // Si no hay configuración, intentar con pathname completo
    if (!breadcrumbs) {
      breadcrumbs = BREADCRUMB_CONFIG[pathname];
    }

    // Si aún no hay breadcrumbs, no renderizar nada
    if (!breadcrumbs || breadcrumbs.length === 0) {
      console.log('ℹ️ No breadcrumbs configured for:', filename);
      return;
    }

    // Para detalle-propiedad.html, intentar obtener el título de la propiedad
    if (filename === 'detalle-propiedad.html') {
      updateDetailBreadcrumb(breadcrumbs);
    }

    // Generar HTML
    const html = generateBreadcrumbHTML(breadcrumbs);
    container.innerHTML = html;

    // Generar e insertar schema markup
    const schema = generateBreadcrumbSchema(breadcrumbs);
    insertSchema(schema);

    console.log('✅ Breadcrumbs rendered for:', filename);
  }

  /**
   * Actualiza el breadcrumb de detalle-propiedad con el título real
   * @param {Array} breadcrumbs - Array de breadcrumbs
   */
  function updateDetailBreadcrumb(breadcrumbs) {
    // Intentar obtener el título de la propiedad del meta tag
    const titleMeta = document.querySelector('title');
    if (titleMeta && titleMeta.textContent) {
      const fullTitle = titleMeta.textContent;
      // Extraer solo el título de la propiedad (antes de " | Altorra")
      const propertyTitle = fullTitle.split(' | ')[0];

      // Actualizar el último breadcrumb
      const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
      if (lastBreadcrumb && propertyTitle.length > 10) {
        lastBreadcrumb.name = propertyTitle;
      }
    }

    // Detectar tipo de operación para ajustar el link de "Propiedades"
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');

    // Si podemos determinar la operación, ajustar el link
    if (breadcrumbs.length >= 2) {
      // Por ahora dejamos el link genérico a propiedades-comprar
      // En el futuro se puede mejorar detectando la operación desde los datos
    }
  }

  /**
   * Inicializa los breadcrumbs cuando el DOM esté listo
   */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => renderBreadcrumbs());
    } else {
      renderBreadcrumbs();
    }
  }

  // Exponer API pública
  window.AltorraBreadcrumbs = {
    render: renderBreadcrumbs,
    generateSchema: generateBreadcrumbSchema,
    init: init
  };

  // Auto-inicializar
  init();

})();
