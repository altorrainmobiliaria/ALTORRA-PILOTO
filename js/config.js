/**
 * Configuración centralizada de Altorra Inmobiliaria
 * Este archivo contiene todas las constantes y configuraciones globales del sitio
 */

(function() {
  'use strict';

  // Información de contacto
  const CONTACT = {
    whatsapp: '573002439810',
    phone: '573002439810',  // Número principal (mismo que WhatsApp)
    email: 'altorrainmobiliaria@gmail.com',
    address: 'Cartagena de Indias, Colombia',
    googleMapsPlaceId: 'ChIJoym3zbYl9o4Rxs-NeVE8-FY'
  };

  // Configuración de caché
  const CACHE = {
    dataTTL: 6 * 60 * 60 * 1000,        // 6 horas para datos de propiedades
    fragmentTTL: 7 * 24 * 60 * 60 * 1000, // 7 días para fragmentos HTML
    revalidateInterval: 60 * 60 * 1000   // 1 hora para revalidación en background
  };

  // Configuración de paginación
  const PAGINATION = {
    pageSize: 9,                // Propiedades por página
    maxCompare: 3,              // Máximo de propiedades para comparar
    maxFavorites: 50            // Máximo de favoritos permitidos
  };

  // URLs y rutas
  const URLS = {
    baseUrl: 'https://altorrainmobiliaria.github.io',
    dataPath: 'properties/data.json',
    reviewsPath: 'reviews.json'
  };

  // Configuración de analíticas
  const ANALYTICS = {
    enabled: true,
    sessionTimeout: 30 * 60 * 1000,  // 30 minutos
    trackScrollDepth: true,
    trackClicks: true
  };

  // Configuración del chatbot
  const CHATBOT = {
    botName: 'Altorra IA',
    typingDelay: 800,
    messageDelay: 400,
    maxConversationHistory: 100
  };

  // Configuración de SEO
  const SEO = {
    siteName: 'ALTORRA Inmobiliaria',
    defaultTitle: 'Altorra | Inmobiliaria en Cartagena',
    defaultDescription: 'Altorra Inmobiliaria - Gestión integral en soluciones inmobiliarias. Encuentra apartamentos, casas y propiedades en Cartagena para comprar, arrendar o alquilar por días.',
    defaultImage: '/multimedia/hero-contact.webp',
    twitterHandle: '@altorra',  // Si tienen Twitter
    facebookAppId: ''           // Si tienen Facebook App
  };

  // Horarios de atención
  const BUSINESS_HOURS = {
    weekdays: {
      open: '08:00',
      close: '18:00',
      display: '8:00 AM - 6:00 PM'
    },
    saturday: {
      open: '09:00',
      close: '13:00',
      display: '9:00 AM - 1:00 PM'
    },
    sunday: {
      open: null,
      close: null,
      display: 'Cerrado'
    }
  };

  // Servicios y comisiones
  const SERVICES = {
    venta: {
      honorarios: '3% sobre valor de venta (urbano) / 10% (rural)',
      descripcion: 'Servicio completo de venta de inmuebles'
    },
    arriendo: {
      honorarios: '10% + IVA sobre el canon integral',
      descripcion: 'Administración y gestión de arriendos'
    },
    administracion: {
      honorarios: '10% + IVA mensual',
      descripcion: 'Administración de propiedades'
    }
  };

  // Zonas de Cartagena (para filtros y búsquedas)
  const ZONES = [
    'Bocagrande',
    'Manga',
    'Centro',
    'Getsemaní',
    'Castillogrande',
    'Crespo',
    'El Laguito',
    'Pie de la Popa',
    'Serena del Mar',
    'Country',
    'Parque Heredia'
  ];

  // Tipos de propiedad
  const PROPERTY_TYPES = [
    { value: 'apartamento', label: 'Apartamento' },
    { value: 'casa', label: 'Casa' },
    { value: 'lote', label: 'Lote' },
    { value: 'oficina', label: 'Oficina' },
    { value: 'local', label: 'Local Comercial' }
  ];

  // Operaciones
  const OPERATIONS = [
    { value: 'comprar', label: 'Comprar' },
    { value: 'arrendar', label: 'Arrendar' },
    { value: 'dias', label: 'Por días' }
  ];

  // Feature flags (para activar/desactivar funcionalidades)
  const FEATURES = {
    chatbot: true,
    favorites: true,
    comparison: true,
    calculator: true,
    smartSearch: true,
    virtualTours: false,      // A implementar
    mapView: false,           // A implementar
    savedSearches: false,     // A implementar
    exitIntent: false         // A implementar
  };

  // Exportar configuración global
  window.ALTORRA_CONFIG = {
    CONTACT,
    CACHE,
    PAGINATION,
    URLS,
    ANALYTICS,
    CHATBOT,
    SEO,
    BUSINESS_HOURS,
    SERVICES,
    ZONES,
    PROPERTY_TYPES,
    OPERATIONS,
    FEATURES,

    // Helpers para acceso rápido
    getWhatsAppLink: function(message = 'Hola Altorra, necesito información sobre propiedades') {
      return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
    },

    getPhoneLink: function() {
      return `tel:+${CONTACT.phone}`;
    },

    getEmailLink: function(subject = 'Consulta desde web') {
      return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}`;
    },

    formatPrice: function(price) {
      try {
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(price);
      } catch (e) {
        return `$${price.toLocaleString('es-CO')}`;
      }
    },

    formatPriceShort: function(price) {
      const millions = price / 1000000;
      if (millions >= 1000) {
        return `$${(millions / 1000).toFixed(1)}B`;
      }
      return `$${millions.toFixed(0)}M`;
    },

    isBusinessHours: function() {
      const now = new Date();
      const day = now.getDay(); // 0 = Domingo, 6 = Sábado
      const hour = now.getHours();

      if (day === 0) return false; // Domingo
      if (day === 6) {
        return hour >= 9 && hour < 13; // Sábado 9am-1pm
      }
      return hour >= 8 && hour < 18; // Lun-Vie 8am-6pm
    }
  };

  // Versión para debugging
  window.ALTORRA_CONFIG.VERSION = '1.0.0';

  console.log('✅ Altorra Config loaded v' + window.ALTORRA_CONFIG.VERSION);
})();
