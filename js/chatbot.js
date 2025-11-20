/* ========================================
   ALTORRA CHATBOT - Asistente Inteligente
   ======================================== */

(function() {
  'use strict';

  // Configuración
  const CONFIG = {
    botName: 'Altorra IA',
    whatsappNumber: '573002439810',
    typingDelay: 800,
    messageDelay: 400
  };

  // Diccionario de números en palabras
  const WORD_NUMBERS = {
    'una': 1, 'un': 1, 'uno': 1,
    'dos': 2,
    'tres': 3,
    'cuatro': 4,
    'cinco': 5,
    'seis': 6,
    'siete': 7,
    'ocho': 8
  };

  // Función para parsear presupuesto en múltiples formatos
  function parseBudget(msg) {
    const text = msg.toLowerCase();

    // 1) "1.8 millones" / "2,5 millones" / "300 millones"
    const millionsMatch = text.match(/(\d+[.,]?\d*)\s*(millon|millones|millón)/i);
    if (millionsMatch) {
      const num = parseFloat(millionsMatch[1].replace(',', '.'));
      return num * 1000000;
    }

    // 2) Formato corto: "200m", "1.5m"
    const shortMatch = text.match(/(\d+[.,]?\d*)\s*m(?!\w)/i);
    if (shortMatch) {
      const num = parseFloat(shortMatch[1].replace(',', '.'));
      return num * 1000000;
    }

    // 3) "$1.800.000" / "1800000" / "2.300.000" (formato pesos colombianos)
    const pesosMatch = text.match(/\$?\s*([\d\.]{6,})/);
    if (pesosMatch) {
      const raw = pesosMatch[1].replace(/\./g, '');
      const value = parseInt(raw, 10);
      if (!isNaN(value) && value >= 100000) return value;
    }

    // 4) "1800 mil" / "2500 mil"
    const milMatch = text.match(/(\d+)\s*mil(?!\w)/i);
    if (milMatch) {
      const num = parseInt(milMatch[1]);
      return num * 1000;
    }

    return null;
  }

  // Función para guardar contexto en sessionStorage
  function saveContext() {
    try {
      sessionStorage.setItem('altorra-chatbot-context', JSON.stringify(conversationContext));
    } catch(e) {}
  }

  // Función para cargar contexto desde sessionStorage
  function loadContext() {
    try {
      const raw = sessionStorage.getItem('altorra-chatbot-context');
      if (raw) {
        const saved = JSON.parse(raw);
        conversationContext = { ...conversationContext, ...saved };
      }
    } catch(e) {}
  }

  // Estado del chatbot
  let properties = [];
  let isOpen = false;
  let hasGreeted = false;
  let welcomeBubbleShown = false;

  // Contexto de la conversación - memoria del chatbot
  let conversationContext = {
    interest: null,        // comprar, arrendar, dias, propietario
    propertyType: null,    // apartamento, casa, etc.
    zone: null,            // bocagrande, manga, etc.
    budget: null,          // presupuesto
    beds: null,            // habitaciones
    baths: null,           // baños
    guests: null,          // número de personas (para alojamientos)
    purpose: null,         // vivienda, inversión, trabajo
    timeline: null,        // urgente, flexible
    family: null,          // solo, pareja, familia
    lastQuestion: null,    // última pregunta hecha
    questionsAsked: [],    // preguntas ya respondidas
    consultationPhase: 'discovery', // discovery, recommendation, closing
    dataPoints: 0          // cantidad de información recopilada
  };

  // Sistema de consultoría - preguntas calificadoras
  const CONSULTATION_QUESTIONS = {
    comprar: {
      purpose: {
        question: '¿Para qué sería esta compra?',
        options: [
          { text: 'Para vivir yo/mi familia', value: 'vivienda' },
          { text: 'Para inversión/renta', value: 'inversion' },
          { text: 'Para oficina/negocio', value: 'trabajo' }
        ]
      },
      propertyType: {
        question: '¿Qué tipo de propiedad te interesa?',
        options: [
          { text: 'Apartamento', value: 'apartamento' },
          { text: 'Casa', value: 'casa' },
          { text: 'Lote/Terreno', value: 'lote' },
          { text: 'Oficina/Local', value: 'oficina' }
        ]
      },
      zone: {
        question: '¿Qué zona de Cartagena prefieres?',
        options: [
          { text: 'Bocagrande (playa, turístico)', value: 'bocagrande' },
          { text: 'Manga (tradicional, familiar)', value: 'manga' },
          { text: 'Centro Histórico', value: 'centro' },
          { text: 'Otra zona / No estoy seguro', value: 'otra' }
        ]
      },
      budget: {
        question: '¿Cuál es tu presupuesto aproximado?',
        options: [
          { text: 'Hasta $200 millones', value: 200000000 },
          { text: '$200 - $400 millones', value: 400000000 },
          { text: '$400 - $700 millones', value: 700000000 },
          { text: 'Más de $700 millones', value: 1000000000 }
        ]
      },
      beds: {
        question: '¿Cuántas habitaciones necesitas?',
        options: [
          { text: '1-2 habitaciones', value: 2 },
          { text: '3 habitaciones', value: 3 },
          { text: '4 o más habitaciones', value: 4 }
        ]
      }
    },
    arrendar: {
      purpose: {
        question: '¿Para qué necesitas el arriendo?',
        options: [
          { text: 'Para vivir', value: 'vivienda' },
          { text: 'Temporal por trabajo', value: 'trabajo' },
          { text: 'Para estudiantes', value: 'estudio' }
        ]
      },
      propertyType: {
        question: '¿Qué tipo de propiedad buscas?',
        options: [
          { text: 'Apartamento', value: 'apartamento' },
          { text: 'Casa', value: 'casa' },
          { text: 'Habitación/Estudio', value: 'estudio' }
        ]
      },
      zone: {
        question: '¿Qué zona prefieres?',
        options: [
          { text: 'Bocagrande', value: 'bocagrande' },
          { text: 'Manga', value: 'manga' },
          { text: 'Centro', value: 'centro' },
          { text: 'Flexible / Cualquier zona', value: 'cualquiera' }
        ]
      },
      budget: {
        question: '¿Cuál es tu presupuesto mensual?',
        options: [
          { text: 'Hasta $1.5 millones', value: 1500000 },
          { text: '$1.5 - $3 millones', value: 3000000 },
          { text: '$3 - $5 millones', value: 5000000 },
          { text: 'Más de $5 millones', value: 10000000 }
        ]
      }
    }
  };

  // Función para obtener la siguiente pregunta de consultoría
  function getNextConsultationQuestion() {
    const ctx = conversationContext;
    const interest = ctx.interest;

    if (!interest || !CONSULTATION_QUESTIONS[interest]) return null;

    const questions = CONSULTATION_QUESTIONS[interest];

    // Orden de preguntas
    const questionOrder = ['purpose', 'propertyType', 'zone', 'budget', 'beds'];

    for (const field of questionOrder) {
      if (questions[field] && !ctx[field]) {
        return { field, ...questions[field] };
      }
    }

    return null; // Ya tenemos toda la información
  }

  // Función para verificar si tenemos suficiente información para recomendar
  function hasEnoughInfoToRecommend() {
    const ctx = conversationContext;
    let points = 0;

    if (ctx.interest) points++;
    if (ctx.propertyType) points++;
    if (ctx.zone) points++;
    if (ctx.budget) points++;
    if (ctx.beds) points++;
    if (ctx.purpose) points++;

    conversationContext.dataPoints = points;

    // Necesitamos al menos 3 puntos de datos para recomendar
    return points >= 3;
  }

  // Función de puntuación para propiedades
  function scoreProperty(p, ctx) {
    let score = 0;

    // Coincidencia de tipo (+3)
    if (ctx.propertyType && p.type === ctx.propertyType) score += 3;

    // Coincidencia de zona (+3)
    if (ctx.zone && p.neighborhood) {
      const neighborhood = p.neighborhood.toLowerCase();
      if (neighborhood.includes(ctx.zone)) score += 3;
    }

    // Coincidencia de habitaciones (+2)
    if (ctx.beds && p.beds >= ctx.beds) score += 2;
    else if (ctx.beds && p.beds === ctx.beds - 1) score += 1; // Casi coincide

    // Coincidencia de presupuesto (hasta +4)
    if (ctx.budget && p.price) {
      const diff = Math.abs(p.price - ctx.budget);
      if (diff <= ctx.budget * 0.1) score += 4;      // Muy cerca (±10%)
      else if (diff <= ctx.budget * 0.2) score += 2; // Aceptable (±20%)
      else if (p.price <= ctx.budget * 1.15) score += 1; // Dentro del rango
    }

    // Bonus: propiedades destacadas
    if (p.featured) score += 2;

    // Bonus: propiedades con más fotos
    if (p.images && p.images.length > 3) score += 1;

    return score;
  }

  // Función auxiliar para filtrar por operación
  function filterByOperation(props, operation) {
    if (!operation) return props;
    if (operation === 'dias') {
      // Alojamientos pueden tener operación 'dias' o 'alojar'
      return props.filter(p => p.operation === 'dias' || p.operation === 'alojar');
    }
    return props.filter(p => p.operation === operation);
  }

  // Función para hacer recomendaciones inteligentes basadas en el perfil
  function getSmartRecommendations() {
    const ctx = conversationContext;
    let results = [...properties];

    // Filtrar por operación (lo imprescindible)
    results = filterByOperation(results, ctx.interest);

    // Calcular puntuación para cada propiedad
    results.forEach(p => {
      p._score = scoreProperty(p, ctx);
    });

    // Filtrar propiedades con alguna afinidad y ordenar por puntuación
    results = results
      .filter(p => p._score > 0)
      .sort((a, b) => b._score - a._score);

    // Si no hay resultados con puntuación, mostrar los mejores sin filtro estricto
    if (results.length === 0) {
      results = filterByOperation([...properties], ctx.interest);
      // Ordenar por presupuesto si existe
      if (ctx.budget) {
        results.sort((a, b) => Math.abs(a.price - ctx.budget) - Math.abs(b.price - ctx.budget));
      }
    }

    return results.slice(0, 3);
  }

  // Generar respuesta de recomendación personalizada
  function generatePersonalizedRecommendation(results) {
    const ctx = conversationContext;

    let intro = '✨ <b>Basándome en tu perfil</b>:<br>';
    if (ctx.purpose === 'inversion') intro += '• Buscas para <b>inversión</b><br>';
    else if (ctx.purpose === 'vivienda') intro += '• Buscas para <b>vivir</b><br>';
    if (ctx.propertyType) intro += `• Tipo: <b>${ctx.propertyType}</b><br>`;
    if (ctx.zone && ctx.zone !== 'otra') intro += `• Zona: <b>${ctx.zone.charAt(0).toUpperCase() + ctx.zone.slice(1)}</b><br>`;
    if (ctx.budget) intro += `• Presupuesto: hasta <b>$${(ctx.budget/1000000).toFixed(0)} millones</b><br>`;
    if (ctx.beds) intro += `• Habitaciones: <b>${ctx.beds}+</b><br>`;

    intro += '<br>';

    if (results.length > 0) {
      intro += `He encontrado <b>${results.length} propiedad${results.length > 1 ? 'es' : ''}</b> que se ajustan a tus necesidades:`;

      results.forEach(p => {
        intro += createPropertyCard(p);
      });

      // Agregar valor según propósito
      if (ctx.purpose === 'inversion') {
        intro += '<br><br>💡 <b>Tip de inversión:</b> Estas propiedades tienen buen potencial de arriendo en la zona.';
      } else if (ctx.purpose === 'vivienda' && ctx.family === 'familia') {
        intro += '<br><br>💡 <b>Tip:</b> Estas propiedades están cerca de colegios y zonas familiares.';
      }

      // Agregar opción de contacto con contexto completo
      intro += '<br><br>¿Te gustaría agendar una visita?';

      // Crear mensaje de WhatsApp con todo el contexto
      const waSummary = encodeURIComponent(
        `Hola Altorra, estoy interesado en una propiedad:\n` +
        `• Operación: ${ctx.interest === 'comprar' ? 'Compra' : ctx.interest === 'arrendar' ? 'Arriendo' : ctx.interest || 'No definido'}\n` +
        `• Tipo: ${ctx.propertyType || 'No definido'}\n` +
        `• Zona: ${ctx.zone ? ctx.zone.charAt(0).toUpperCase() + ctx.zone.slice(1) : 'No definida'}\n` +
        `• Presupuesto: ${ctx.budget ? formatPrice(ctx.budget) : 'No definido'}\n` +
        `• Habitaciones: ${ctx.beds || 'No definido'}\n` +
        `• Propósito: ${ctx.purpose === 'vivienda' ? 'Para vivir' : ctx.purpose === 'inversion' ? 'Inversión' : ctx.purpose || 'No definido'}`
      );

      intro += `
        <br><br>
        <a href="https://wa.me/${CONFIG.whatsappNumber}?text=${waSummary}"
           target="_blank"
           rel="noopener"
           class="chat-whatsapp-link">
          <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.789l4.94-1.293A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
          Hablar con un asesor (con mi perfil)
        </a>
      `;
    } else {
      intro += 'No encontré propiedades exactas con estos criterios, pero puedo ajustar la búsqueda.<br><br>';
      intro += '¿Qué prefieres:<br>';
      intro += '• Ampliar el presupuesto<br>';
      intro += '• Explorar otras zonas<br>';
      intro += '• Hablar con un asesor para opciones personalizadas';
    }

    return intro;
  }

  // Conocimiento del proceso inmobiliario
  const REAL_ESTATE_KNOWLEDGE = {
    procesoCompra: {
      pasos: [
        'Definir presupuesto y pre-aprobación de crédito si aplica',
        'Búsqueda de propiedades según criterios',
        'Visitas y evaluación de opciones',
        'Negociación del precio',
        'Promesa de compraventa con arras',
        'Estudio de títulos y libertad del inmueble',
        'Firma de escritura pública',
        'Pago y registro de la propiedad'
      ],
      documentos: ['Cédula', 'Certificado de ingresos', 'Extractos bancarios', 'Declaración de renta'],
      tiempoEstimado: '30-60 días desde la promesa'
    },
    procesoArriendo: {
      requisitos: [
        'Carta laboral o certificación de ingresos',
        'Referencias personales y comerciales',
        'Codeudor o fiador (en algunos casos)',
        'Depósito de seguridad'
      ],
      nota: 'Las condiciones específicas varían según cada propiedad'
    },
    inversion: {
      factores: ['Ubicación y valorización', 'Potencial de arriendo', 'Estado del inmueble', 'Amenidades del sector'],
      rentabilidad: 'En Cartagena, un arriendo puede generar 0.4% a 0.8% mensual del valor del inmueble'
    }
  };

  // Conocimiento completo del sitio web y negocio
  const SITE_KNOWLEDGE = {
    pages: {
      inicio: { url: 'index.html', desc: 'Página principal con todas las propiedades destacadas' },
      comprar: { url: 'propiedades-comprar.html', desc: 'Propiedades en venta en Cartagena' },
      arrendar: { url: 'propiedades-arrendar.html', desc: 'Propiedades en arriendo mensual' },
      alojamiento: { url: 'propiedades-alojamientos.html', desc: 'Alojamientos por días para vacaciones' },
      publicar: { url: 'publicar-propiedad.html', desc: 'Formulario para publicar tu propiedad' },
      contacto: { url: 'contacto.html', desc: 'Información de contacto y formulario' },
      nosotros: { url: 'quienes-somos.html', desc: 'Información sobre Altorra Inmobiliaria' },
      comparar: { url: 'comparar.html', desc: 'Comparar propiedades lado a lado' }
    },
    company: {
      name: 'Altorra Inmobiliaria',
      city: 'Cartagena de Indias',
      phone: '+57 300 243 9810',
      email: 'altorrainmobiliaria@gmail.com',
      services: ['Compra y venta', 'Arriendos', 'Alojamientos por días', 'Avalúos comerciales', 'Asesoría jurídica', 'Administración de propiedades', 'Servicios contables']
    },
    zones: {
      bocagrande: 'Zona exclusiva con playa, restaurantes y vida nocturna. Ideal para inversión turística.',
      manga: 'Barrio tradicional y central, perfecto para familias. Buenos precios.',
      centro: 'Centro Histórico con encanto colonial. Ideal para Airbnb y turismo.',
      crespo: 'Cerca al aeropuerto, zona residencial tranquila.',
      castillogrande: 'Exclusiva y familiar, cerca a la playa.',
      cabrero: 'Zona céntrica con buena valorización.',
      laguito: 'Zona turística con edificios frente al mar.',
      country: 'El Country, zona residencial exclusiva y familiar con excelentes colegios.',
      piedelapopa: 'Pie de la Popa, tradicional con vistas a la ciudad.',
      torices: 'Barrio residencial con buena conectividad.',
      ternera: 'Zona en crecimiento con proyectos nuevos.',
      boquilla: 'La Boquilla, cerca a la playa con ambiente local.',
      marbella: 'Zona residencial tranquila y familiar.',
      sandiego: 'San Diego, dentro del Centro Histórico con encanto.',
      getsemani: 'Getsemaní, bohemio y artístico, ideal para turismo.',
      chambacú: 'Cerca al centro, en desarrollo.',
      losalpes: 'Los Alpes, residencial de estrato medio.',
      sanfernando: 'San Fernando, tradicional y familiar.',
      chino: 'Barrio Chino, céntrico y comercial.',
      bosque: 'El Bosque, zona comercial y residencial.',
      espinal: 'El Espinal, residencial accesible.',
      daniellemaitre: 'Daniel Lemaitre, tradicional.',
      olayaherrera: 'Olaya Herrera, popular y comercial.'
    },
    // Variaciones y sinónimos de zonas para mejor detección
    zoneAliases: {
      'el country': 'country',
      'country club': 'country',
      'pie de la popa': 'piedelapopa',
      'pie la popa': 'piedelapopa',
      'la popa': 'piedelapopa',
      'centro historico': 'centro',
      'centro histórico': 'centro',
      'ciudad amurallada': 'centro',
      'la boquilla': 'boquilla',
      'castillo grande': 'castillogrande',
      'san diego': 'sandiego',
      'getsemani': 'getsemani',
      'los alpes': 'losalpes',
      'san fernando': 'sanfernando',
      'barrio chino': 'chino',
      'el bosque': 'bosque',
      'el espinal': 'espinal',
      'daniel lemaitre': 'daniellemaitre',
      'olaya': 'olayaherrera'
    },
    propertyTypes: ['apartamento', 'casa', 'lote', 'oficina', 'local', 'bodega', 'finca'],
    // Servicios para PROPIETARIOS que quieren arrendar (administración)
    servicioAdministracion: {
      honorarios: '10% + IVA sobre el canon integral (arriendo + administración de copropiedad)',
      beneficios: [
        'Publicidad y marketing profesional en portales, Google y Meta',
        'Atención a interesados y coordinación de visitas',
        'Selección rigurosa de arrendatarios con validación integral',
        'Contratos claros con respaldo legal',
        'Administración transparente de pagos y cobros',
        'Inspecciones periódicas al inmueble',
        'Orientación jurídica ante incumplimientos',
        'Opción de póliza de arrendamiento (canon, administración, servicios)'
      ]
    },
    // Servicios para PROPIETARIOS que quieren vender
    servicioVenta: {
      honorarios: '3% sobre valor de venta (urbano) / 10% (rural)',
      beneficios: [
        'Marketing digital en portales, redes, web y Google Ads',
        'Gestión personalizada: atención, visitas y negociación',
        'Respaldo jurídico y notarial completo'
      ],
      infoRequerida: [
        'Precio del inmueble',
        'Fotos o videos actualizados',
        'Área (m²) y dirección',
        'Valor de administración (si aplica)',
        'Habitaciones, baños y parqueadero',
        'Información de la propiedad y amenidades',
        'Certificado de libertad y tradición'
      ]
    }
  };

  // Respuestas predefinidas mejoradas con enlaces
  const RESPONSES = {
    greeting: [
      '¡Hola! 👋 Soy <b>Altorra IA</b>, tu asistente inmobiliario virtual.<br><br>Puedo ayudarte a:<br>• 🏠 Encontrar propiedades<br>• 📍 Conocer zonas de Cartagena<br>• 📋 Resolver dudas sobre servicios<br>• 💬 Conectarte con un asesor<br><br>¿Qué necesitas hoy?',
      '¡Bienvenido a <b>Altorra Inmobiliaria</b>! 🏠<br><br>Soy tu asistente IA. Cuéntame:<br>• ¿Buscas <b>comprar</b>, <b>arrendar</b> o <b>alojamiento por días</b>?<br>• ¿Tienes alguna zona preferida?<br>• ¿Cuál es tu presupuesto?'
    ],
    comprar: '🏡 <b>Propiedades en Venta</b><br><br>Contamos con apartamentos, casas, lotes y oficinas en las mejores zonas de Cartagena.<br><br>Te acompañamos en todo el proceso de compra con respaldo jurídico y notarial.<br><br>👉 <a href="propiedades-comprar.html" style="color:#d4af37;font-weight:600;">Ver propiedades en venta</a><br><br>¿Qué tipo de propiedad buscas y cuál es tu presupuesto?',
    arrendar: '🔑 <b>Arriendos en Cartagena</b><br><br>Contamos con propiedades en arriendo en las mejores zonas de la ciudad, con contratos respaldados legalmente.<br><br>👉 <a href="propiedades-arrendar.html" style="color:#d4af37;font-weight:600;">Ver propiedades en arriendo</a><br><br>¿Qué tipo de propiedad buscas y en qué zona?',
    alojamiento: '🌴 <b>Alojamientos por Días</b><br><br>Contamos con propiedades amobladas en las mejores zonas turísticas de Cartagena para estadías cortas.<br><br>Cada propiedad tiene diferentes características y amenidades. Un asesor te brindará información detallada según tus necesidades.<br><br>👉 <a href="propiedades-alojamiento.html" style="color:#d4af37;font-weight:600;">Ver alojamientos disponibles</a><br><br>¿Cuántas personas serán y qué fechas tienes en mente?',
    precio: '💰 <b>Rangos de Precio</b><br><br>Dime tu presupuesto y te muestro las mejores opciones:<br><br>• <b>Compra:</b> Desde $150 millones<br>• <b>Arriendo:</b> Desde $1.5 millones/mes<br>• <b>Por días:</b> Desde $200.000/noche<br><br>Ejemplo: "apartamento hasta 300 millones" o "arriendo hasta 2 millones"',
    ubicacion: '📍 <b>Zonas de Cartagena</b><br><br>• <b>Bocagrande</b> - Playa, restaurantes, vida nocturna. Ideal inversión turística.<br>• <b>Manga</b> - Tradicional, central, familiar. Buenos precios.<br>• <b>Centro Histórico</b> - Encanto colonial. Ideal Airbnb.<br>• <b>Castillogrande</b> - Exclusiva, familiar, cerca a playa.<br>• <b>Crespo</b> - Cerca al aeropuerto, tranquila.<br>• <b>Laguito</b> - Frente al mar, turística.<br><br>¿Cuál zona te interesa explorar?',
    contacto: '📞 <b>Contacto Directo</b><br><br>• <b>WhatsApp:</b> +57 300 243 9810<br>• <b>Email:</b> altorrainmobiliaria@gmail.com<br>• <b>Ciudad:</b> Cartagena de Indias<br><br>👉 <a href="contacto.html" style="color:#d4af37;font-weight:600;">Ir a página de contacto</a><br><br>¿Prefieres que te contactemos nosotros?',
    servicios: '📋 <b>Nuestros Servicios</b><br><br>• ✅ Compra y venta de inmuebles<br>• ✅ Arriendos con contrato<br>• ✅ Alojamientos por días<br>• ✅ Avalúos comerciales<br>• ✅ Asesoría jurídica<br>• ✅ Administración de propiedades<br>• ✅ Servicios contables<br><br>👉 <a href="quienes-somos.html" style="color:#d4af37;font-weight:600;">Conocer más sobre nosotros</a>',
    horario: '🕐 <b>Horario de Atención</b><br><br>• <b>Lunes a Viernes:</b> 8:00 AM - 6:00 PM<br>• <b>Sábados:</b> 9:00 AM - 1:00 PM<br><br>💡 Por WhatsApp respondemos más rápido, incluso fines de semana.',
    gracias: '¡Con mucho gusto! 😊<br><br>Recuerda que puedes:<br>• 📱 Contactarnos por WhatsApp<br>• 🔄 Comparar propiedades<br>• ❤️ Guardar favoritos<br><br>¡Éxitos con tu búsqueda!',
    noEntiendo: '🤔 No estoy seguro de entender tu consulta.<br><br><b>Intenta ser más específico:</b><br>• "Apartamento en Bocagrande"<br>• "Casa para arrendar"<br>• "Alojamiento para 4 personas"<br><br>O puedo conectarte con un asesor humano:',
    default: '¿Hay algo más en lo que pueda ayudarte?<br><br>También puedo:<br>• Mostrarte propiedades específicas<br>• Explicarte sobre zonas<br>• Conectarte con un asesor',
    sinResultados: 'No encontré propiedades exactas con esos criterios, pero tenemos opciones similares.<br><br>¿Te gustaría:<br>• Ver todas las propiedades disponibles?<br>• Ajustar los criterios de búsqueda?<br>• Hablar con un asesor?',
    ayuda: '🤖 <b>Soy Altorra IA</b><br><br>Puedo ayudarte con:<br>• 🏠 Buscar propiedades (compra, arriendo, días)<br>• 📍 Información de zonas de Cartagena<br>• 💰 Filtrar por precio<br>• 📋 Explicar servicios<br>• 💬 Conectarte con asesor<br>• 🔄 Usar el comparador<br><br>Solo escribe tu pregunta o usa los botones rápidos.',
    publicar: '📝 <b>Publica tu Propiedad</b><br><br>¿Tienes una propiedad para vender o arrendar?<br><br>Completa nuestro formulario y un asesor te contactará en menos de 24 horas.<br><br>👉 <a href="publicar-propiedad.html" style="color:#d4af37;font-weight:600;">Ir al formulario de publicación</a>',
    comparar: '🔄 <b>Comparador de Propiedades</b><br><br>Puedes comparar hasta 3 propiedades lado a lado para ver:<br>• Precios<br>• Características<br>• Ubicación<br>• Amenidades<br><br>Agrega propiedades con el botón "Comparar" en cada tarjeta.<br><br>👉 <a href="comparar.html" style="color:#d4af37;font-weight:600;">Ver comparación actual</a>',
    nosotros: '🏢 <b>Sobre Altorra Inmobiliaria</b><br><br>Somos una empresa inmobiliaria en Cartagena de Indias con experiencia en:<br>• Compra y venta<br>• Arriendos<br>• Alojamientos turísticos<br>• Asesoría legal y contable<br><br>👉 <a href="quienes-somos.html" style="color:#d4af37;font-weight:600;">Conocer nuestra historia</a>',
    // Respuestas para PROPIETARIOS
    propietarioArriendos: `🏠 <b>Administración y Arriendo de Inmuebles</b><br><br>
En ALTORRA administramos tu propiedad para arrendarla de forma segura y sin complicaciones.<br><br>
<b>Te ofrecemos:</b><br>
✅ Publicidad profesional en portales y redes<br>
✅ Selección rigurosa de arrendatarios<br>
✅ Contratos con respaldo legal<br>
✅ Administración de pagos y cobros<br>
✅ Inspecciones periódicas<br>
✅ Orientación jurídica ante incumplimientos<br>
🔐 Opción de póliza de arrendamiento<br><br>
<b>Honorarios:</b> 10% + IVA sobre el canon integral<br><br>
👉 <a href="publicar-propiedad.html" style="color:#d4af37;font-weight:600;">Registrar mi propiedad</a><br>
📞 <a href="https://wa.me/573002439810?text=Hola%20Altorra%2C%20tengo%20una%20propiedad%20para%20arrendar" target="_blank" style="color:#d4af37;font-weight:600;">Hablar con un asesor</a>`,
    propietarioVenta: `🏡 <b>Venta de Inmuebles</b><br><br>
Somos referentes en venta de inmuebles con proceso ágil, seguro e integral.<br><br>
<b>Te ofrecemos:</b><br>
✅ Marketing digital en portales, redes y Google Ads<br>
✅ Gestión personalizada de visitas y negociación<br>
✅ Respaldo jurídico y notarial completo<br><br>
<b>Información requerida:</b><br>
• Precio, fotos/videos y área (m²)<br>
• Habitaciones, baños, parqueadero<br>
• Certificado de libertad y tradición<br><br>
📸 Podemos visitar tu inmueble para tomar fotos profesionales<br><br>
<b>Honorarios:</b> 3% urbano / 10% rural<br><br>
👉 <a href="publicar-propiedad.html" style="color:#d4af37;font-weight:600;">Registrar mi propiedad</a><br>
📞 <a href="https://wa.me/573002439810?text=Hola%20Altorra%2C%20quiero%20vender%20mi%20propiedad" target="_blank" style="color:#d4af37;font-weight:600;">Hablar con un asesor</a>`,
    propietarioGeneral: `📋 <b>¿Eres Propietario?</b><br><br>
En ALTORRA te ayudamos a vender o arrendar tu inmueble con respaldo profesional.<br><br>
<b>¿Qué deseas hacer?</b><br>
• 🏷️ <b>Vender:</b> Marketing, negociación y respaldo legal<br>
• 🔑 <b>Arrendar:</b> Administración completa, selección de arrendatarios<br><br>
Nosotros invertimos en toda la publicidad y marketing para conseguir clientes potenciales.<br><br>
👉 <a href="publicar-propiedad.html" style="color:#d4af37;font-weight:600;">Ir al formulario de publicación</a>`,
    // Respuestas sobre procesos inmobiliarios
    procesoCompra: `📋 <b>Proceso de Compra de Inmueble</b><br><br>
<b>Pasos principales:</b><br>
1️⃣ Definir presupuesto y pre-aprobación de crédito<br>
2️⃣ Búsqueda según tus criterios<br>
3️⃣ Visitas y evaluación<br>
4️⃣ Negociación del precio<br>
5️⃣ Promesa de compraventa<br>
6️⃣ Estudio de títulos<br>
7️⃣ Escritura pública<br>
8️⃣ Registro de la propiedad<br><br>
<b>Documentos necesarios:</b><br>
• Cédula de ciudadanía<br>
• Certificación de ingresos<br>
• Extractos bancarios<br>
• Declaración de renta (si aplica)<br><br>
⏱️ <b>Tiempo estimado:</b> 30-60 días<br><br>
¿Te gustaría que te ayude a encontrar propiedades dentro de tu presupuesto?`,
    procesoArriendo: `📋 <b>Proceso de Arriendo</b><br><br>
<b>Requisitos para arrendar:</b><br>
• Carta laboral o certificación de ingresos<br>
• Referencias personales y comerciales<br>
• Codeudor o fiador (según el caso)<br>
• Depósito de seguridad<br><br>
Las condiciones específicas del arriendo (canon, administración, servicios incluidos) varían según cada propiedad.<br><br>
El contrato es típicamente a 12 meses con posibilidad de renovación.<br><br>
¿Qué tipo de propiedad estás buscando para arrendar?`,
    inversion: `💹 <b>Inversión Inmobiliaria en Cartagena</b><br><br>
Cartagena es excelente para invertir por su crecimiento turístico y valorización constante.<br><br>
<b>Factores a considerar:</b><br>
• Ubicación estratégica (turismo, servicios)<br>
• Potencial de arriendo<br>
• Estado y amenidades<br>
• Proyección de valorización<br><br>
<b>Rentabilidad esperada:</b><br>
Un arriendo puede generar <b>0.4% a 0.8% mensual</b> del valor del inmueble.<br><br>
<b>Mejores zonas para inversión:</b><br>
• <b>Bocagrande:</b> Alta demanda turística<br>
• <b>Centro Histórico:</b> Ideal para Airbnb<br>
• <b>Manga:</b> Arriendo tradicional, buenos precios<br><br>
¿Buscas para arriendo tradicional o por días?`,
    financiacion: `🏦 <b>Financiación de Vivienda</b><br><br>
La mayoría de bancos en Colombia financian hasta el <b>70% del valor</b> del inmueble.<br><br>
<b>Requisitos generales:</b><br>
• Ingresos mínimos según el valor del crédito<br>
• Historial crediticio favorable<br>
• Cuota inicial del 30%<br><br>
<b>Tasas actuales:</b> Aproximadamente 10-13% EA<br><br>
💡 <b>Tip:</b> Compara opciones entre varios bancos y considera subsidios si aplicas.<br><br>
Nosotros te asesoramos en todo el proceso. ¿Te gustaría ver opciones dentro de tu presupuesto?`,
    negociacion: `🤝 <b>Negociación del Precio</b><br><br>
<b>Consejos para negociar:</b><br>
• Investiga el precio del m² en la zona<br>
• Identifica tiempo en el mercado<br>
• Evalúa el estado del inmueble<br>
• Considera gastos adicionales (escrituras, impuestos)<br><br>
En ALTORRA te ayudamos a negociar el mejor precio posible, respaldados por conocimiento del mercado local.<br><br>
¿Ya tienes alguna propiedad en mente para negociar?`
  };

  // Funciones de ayuda para respuestas contextuales
  function getContextualFollowUp() {
    const ctx = conversationContext;

    // Si sabemos el interés pero no el tipo de propiedad
    if (ctx.interest && !ctx.propertyType) {
      return '¿Qué tipo de propiedad prefieres: apartamento, casa u otro?';
    }

    // Si sabemos tipo pero no zona
    if (ctx.propertyType && !ctx.zone) {
      return '¿Tienes alguna zona de preferencia en Cartagena?';
    }

    // Si sabemos zona pero no presupuesto
    if (ctx.zone && !ctx.budget) {
      return '¿Cuál es tu presupuesto aproximado?';
    }

    // Si sabemos presupuesto pero no habitaciones
    if (ctx.budget && !ctx.beds) {
      return '¿Cuántas habitaciones necesitas?';
    }

    return null;
  }

  function updateContext(msg, criteria) {
    // Actualizar contexto con la información extraída
    if (criteria.operation) {
      conversationContext.interest = criteria.operation;
    }
    if (criteria.type) {
      conversationContext.propertyType = criteria.type;
    }
    if (criteria.zone) {
      conversationContext.zone = criteria.zone;
    }
    if (criteria.beds) {
      conversationContext.beds = criteria.beds;
    }
    if (criteria.baths) {
      conversationContext.baths = criteria.baths;
    }
    if (criteria.maxPrice || criteria.minPrice) {
      conversationContext.budget = criteria.maxPrice || criteria.minPrice;
    }
    if (criteria.guests) {
      conversationContext.guests = criteria.guests;
    }

    // Detectar propósito
    if (msg.match(/invertir|inversión|inversion|negocio|rentar|airbnb/i)) {
      conversationContext.purpose = 'inversion';
    } else if (msg.match(/vivir|vivienda|mudar|trasladar|familia/i)) {
      conversationContext.purpose = 'vivienda';
    } else if (msg.match(/trabajo|oficina|empresa|negocio/i)) {
      conversationContext.purpose = 'trabajo';
    }

    // Detectar urgencia
    if (msg.match(/urgente|pronto|rápido|rapido|inmediato|ya|hoy/i)) {
      conversationContext.timeline = 'urgente';
    } else if (msg.match(/tranquilo|sin afán|cuando sea|flexible/i)) {
      conversationContext.timeline = 'flexible';
    }

    // Detectar familia
    if (msg.match(/solo|soltero|soltera/i)) {
      conversationContext.family = 'solo';
    } else if (msg.match(/pareja|esposo|esposa|novio|novia/i)) {
      conversationContext.family = 'pareja';
    } else if (msg.match(/familia|hijos|niños|niñas/i)) {
      conversationContext.family = 'familia';
    }

    // Guardar contexto en sessionStorage
    saveContext();
  }

  // Función de "slot filling" - usa la última pregunta del bot para interpretar respuestas
  function applyAnswerToLastQuestion(msg, criteria) {
    const last = conversationContext.lastQuestion;
    if (!last) return;

    const text = msg.toLowerCase();

    // Presupuesto
    if (last === 'budget' && !conversationContext.budget) {
      const parsed = parseBudget(msg);
      if (parsed) {
        conversationContext.budget = parsed;
        saveContext();
      }
    }

    // Habitaciones
    if (last === 'beds' && !conversationContext.beds) {
      if (criteria.beds) {
        conversationContext.beds = criteria.beds;
      } else {
        const numMatch = text.match(/^(\d+)$/);
        if (numMatch) conversationContext.beds = parseInt(numMatch[1]);
      }
      saveContext();
    }

    // Propósito
    if (last === 'purpose' && !conversationContext.purpose) {
      if (/invertir|inversión|inversion|negocio|rentar|airbnb/i.test(text)) {
        conversationContext.purpose = 'inversion';
      } else if (/vivir|vivienda|familia|mud(a|o)|hogar/i.test(text)) {
        conversationContext.purpose = 'vivienda';
      } else if (/trabajo|oficina|empresa/i.test(text)) {
        conversationContext.purpose = 'trabajo';
      }
      saveContext();
    }

    // Tipo de propiedad
    if (last === 'propertyType' && !conversationContext.propertyType) {
      if (/apartamento|apto|aparta/i.test(text)) conversationContext.propertyType = 'apartamento';
      else if (/\bcasa\b/i.test(text)) conversationContext.propertyType = 'casa';
      else if (/lote|terreno/i.test(text)) conversationContext.propertyType = 'lote';
      else if (/oficina/i.test(text)) conversationContext.propertyType = 'oficina';
      saveContext();
    }

    // Zona
    if (last === 'zone' && !conversationContext.zone) {
      const z = detectZone(text);
      if (z) { conversationContext.zone = z; saveContext(); }
    }

    // Personas
    if (last === 'guests' && !conversationContext.guests) {
      if (criteria.guests) conversationContext.guests = criteria.guests;
      else {
        const numMatch = text.match(/^(\d+)$/);
        if (numMatch) conversationContext.guests = parseInt(numMatch[1]);
      }
      saveContext();
    }
  }

  // Motor de conocimiento inmobiliario - responde FAQs
  function answerFromKnowledge(msg) {
    const text = msg.toLowerCase();

    // PROPIETARIOS
    if (/soy propietario|tengo una propiedad|tengo un inmueble|mi inmueble|mi apartamento|mi casa/.test(text)) {
      if (/vender mi|poner en venta|quiero vender/.test(text)) return RESPONSES.propietarioVenta;
      if (/arrendar mi|administrar mi|poner en arriendo/.test(text)) return RESPONSES.propietarioArriendos;
      return RESPONSES.propietarioGeneral;
    }

    // PROCESOS
    if (/proceso.*compra|pasos.*comprar|c[oó]mo comprar|documentos.*comprar|requisitos.*compra/.test(text)) return RESPONSES.procesoCompra;
    if (/proceso.*arriendo|requisitos.*arriendo|c[oó]mo arrendar|fiador|codeudor/.test(text)) return RESPONSES.procesoArriendo;

    // INVERSIÓN Y FINANCIACIÓN
    if (/invertir en|inversi[oó]n inmobiliaria|rentabilidad|valorizaci[oó]n/.test(text)) return RESPONSES.inversion;
    if (/financiar|financiaci[oó]n|cr[eé]dito|hipoteca|cuota inicial/.test(text)) return RESPONSES.financiacion;
    if (/negociar|c[oó]mo negociar|mejor precio/.test(text)) return RESPONSES.negociacion;

    // EMPRESA
    if (/qu[ié][eé]nes son|sobre ustedes|sobre altorra|la inmobiliaria/.test(text)) return RESPONSES.nosotros;
    if (/horario|a qu[eé] hora|cu[aá]ndo atienden/.test(text)) return RESPONSES.horario;

    return null;
  }

  // Detectar acciones en la página
  function matchPageByTopic(msg) {
    const text = msg.toLowerCase();

    if (/publicar mi|consignar mi|registrar mi|quiero publicar/.test(text)) {
      return { url: SITE_KNOWLEDGE.pages.publicar.url, desc: 'Publicar tu propiedad' };
    }
    if (/comparar propiedades|usar.*comparador|cu[aá]l es mejor/.test(text)) {
      return { url: SITE_KNOWLEDGE.pages.comparar.url, desc: 'Comparador de propiedades' };
    }
    if (/p[aá]gina de contacto|formulario de contacto|quiero dejar mis datos/.test(text)) {
      return { url: SITE_KNOWLEDGE.pages.contacto.url, desc: 'Página de contacto' };
    }
    if (/ver todas.*venta|todas las.*venta/.test(text)) {
      return { url: SITE_KNOWLEDGE.pages.comprar.url, desc: 'Propiedades en venta' };
    }
    if (/ver todas.*arriendo|todos los arriendos/.test(text)) {
      return { url: SITE_KNOWLEDGE.pages.arrendar.url, desc: 'Propiedades en arriendo' };
    }

    return null;
  }

  // Opciones rápidas iniciales
  const QUICK_OPTIONS = [
    { text: 'Quiero comprar', action: 'comprar' },
    { text: 'Busco arriendo', action: 'arrendar' },
    { text: 'Alojamiento por días', action: 'alojamiento' },
    { text: 'Soy propietario', action: 'propietario' }
  ];

  // Opciones para propietarios
  const PROPIETARIO_OPTIONS = [
    { text: 'Quiero vender mi propiedad', action: 'propietario_venta' },
    { text: 'Quiero arrendar mi propiedad', action: 'propietario_arriendos' },
    { text: 'Contactar asesor', action: 'whatsapp' }
  ];

  // Crear estructura HTML del chatbot
  function createChatbotHTML() {
    const container = document.createElement('div');
    container.id = 'altorra-chatbot';
    container.innerHTML = `
      <!-- Botón toggle -->
      <button class="chatbot-toggle" id="chatbot-toggle" aria-label="Abrir chat">
        <svg class="chat-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
        <svg class="close-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>

      <!-- Ventana del chat -->
      <div class="chatbot-window" id="chatbot-window">
        <div class="chatbot-header">
          <div class="chatbot-avatar">🏠</div>
          <div class="chatbot-info">
            <h3>${CONFIG.botName}</h3>
            <p>Asistente Virtual</p>
          </div>
        </div>

        <div class="chatbot-messages" id="chatbot-messages"></div>

        <div class="chatbot-input">
          <input type="text" id="chatbot-input" placeholder="Escribe tu mensaje..." autocomplete="off">
          <button id="chatbot-send" aria-label="Enviar mensaje">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(container);
  }

  // Cargar propiedades
  async function loadProperties() {
    try {
      const response = await fetch('properties/data.json');
      if (response.ok) {
        properties = await response.json();
      }
    } catch (e) {
      console.warn('No se pudieron cargar las propiedades para el chatbot');
    }
  }

  // Formatear precio
  function formatPrice(price) {
    if (!price) return '';
    return '$' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // Agregar mensaje al chat
  function addMessage(text, isBot = true, options = null) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isBot ? 'bot' : 'user'}`;
    messageDiv.innerHTML = text;
    messagesContainer.appendChild(messageDiv);

    // Agregar opciones si las hay
    if (options && isBot) {
      const optionsDiv = document.createElement('div');
      optionsDiv.className = 'chat-options';
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'chat-option';
        btn.textContent = opt.text;
        btn.addEventListener('click', () => handleOption(opt.action));
        optionsDiv.appendChild(btn);
      });
      messagesContainer.appendChild(optionsDiv);
    }

    // Scroll al final
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Mostrar indicador de escritura
  function showTyping() {
    const messagesContainer = document.getElementById('chatbot-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Ocultar indicador de escritura
  function hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  }

  // Respuesta del bot con delay
  function botReply(text, options = null) {
    showTyping();
    setTimeout(() => {
      hideTyping();
      addMessage(text, true, options);
    }, CONFIG.typingDelay);
  }

  // Crear tarjeta de propiedad
  function createPropertyCard(prop) {
    const imgSrc = prop.image || (Array.isArray(prop.images) && prop.images[0]) || '';
    const priceText = formatPrice(prop.price) + ' COP';
    const specs = [];
    if (prop.beds) specs.push(prop.beds + 'H');
    if (prop.baths) specs.push(prop.baths + 'B');
    if (prop.sqm) specs.push(prop.sqm + ' m²');

    return `
      <div class="chat-property-card" onclick="window.location.href='detalle-propiedad.html?id=${prop.id}'">
        <img src="${imgSrc}" alt="${prop.title}" onerror="this.src='https://i.postimg.cc/0yYb8Y6r/placeholder.png'">
        <div class="card-body">
          <h4>${prop.title}</h4>
          <div class="price">${priceText}</div>
          <div class="specs">${specs.join(' · ')}</div>
        </div>
      </div>
    `;
  }

  // Buscar propiedades
  function searchProperties(query) {
    const q = query.toLowerCase();
    let results = properties;

    // Filtrar por operación
    if (q.includes('comprar') || q.includes('venta') || q.includes('compra')) {
      results = results.filter(p => p.operation === 'comprar');
    } else if (q.includes('arrendar') || q.includes('arriendo') || q.includes('alquiler')) {
      results = results.filter(p => p.operation === 'arrendar');
    } else if (q.includes('días') || q.includes('dias') || q.includes('alojamiento') || q.includes('vacaciones')) {
      results = results.filter(p => p.operation === 'dias' || p.operation === 'alojar');
    }

    // Filtrar por tipo
    if (q.includes('apartamento') || q.includes('apto')) {
      results = results.filter(p => p.type === 'apartamento');
    } else if (q.includes('casa')) {
      results = results.filter(p => p.type === 'casa');
    } else if (q.includes('lote') || q.includes('terreno')) {
      results = results.filter(p => p.type === 'lote');
    } else if (q.includes('oficina')) {
      results = results.filter(p => p.type === 'oficina');
    }

    // Filtrar por zona/barrio
    const zones = ['bocagrande', 'manga', 'centro', 'crespo', 'castillogrande'];
    zones.forEach(zone => {
      if (q.includes(zone)) {
        results = results.filter(p =>
          (p.neighborhood && p.neighborhood.toLowerCase().includes(zone)) ||
          (p.city && p.city.toLowerCase().includes(zone))
        );
      }
    });

    // Filtrar por habitaciones
    const bedsMatch = q.match(/(\d+)\s*(habitacion|cuarto|alcoba|hab)/i);
    if (bedsMatch) {
      const beds = parseInt(bedsMatch[1]);
      results = results.filter(p => p.beds >= beds);
    }

    // Filtrar por precio
    const priceMatch = q.match(/(\d+)\s*(millon|millón)/i);
    if (priceMatch) {
      const maxPrice = parseInt(priceMatch[1]) * 1000000;
      results = results.filter(p => p.price <= maxPrice * 1.2); // 20% de tolerancia
    }

    return results.slice(0, 3); // Máximo 3 resultados
  }

  // Manejar opciones rápidas con enfoque consultivo
  function handleOption(action) {
    switch (action) {
      case 'comprar':
        addMessage('Quiero comprar una propiedad', false);
        conversationContext.interest = 'comprar';
        conversationContext.consultationPhase = 'discovery';

        // Iniciar consultoría en lugar de mostrar propiedades al azar
        let comprarResponse = `🏡 <b>¡Excelente decisión!</b> Comprar un inmueble en Cartagena es una gran inversión.<br><br>`;
        comprarResponse += `Para encontrar la propiedad <b>perfecta para ti</b>, necesito conocerte mejor.<br><br>`;

        const firstQuestionComprar = getNextConsultationQuestion();
        if (firstQuestionComprar) {
          comprarResponse += `<b>${firstQuestionComprar.question}</b>`;
          conversationContext.lastQuestion = firstQuestionComprar.field;

          // Crear opciones como botones
          const options = firstQuestionComprar.options.map(opt => ({
            text: opt.text,
            action: `set_${firstQuestionComprar.field}_${opt.value}`
          }));
          botReply(comprarResponse, options);
        } else {
          botReply(comprarResponse);
        }
        break;

      case 'arrendar':
        addMessage('Busco arriendo', false);
        conversationContext.interest = 'arrendar';
        conversationContext.consultationPhase = 'discovery';

        let arrendarResponse = `🔑 <b>¡Perfecto!</b> Tenemos opciones de arriendo para todos los presupuestos.<br><br>`;
        arrendarResponse += `Para recomendarte las mejores opciones, cuéntame un poco más:<br><br>`;

        const firstQuestionArrendar = getNextConsultationQuestion();
        if (firstQuestionArrendar) {
          arrendarResponse += `<b>${firstQuestionArrendar.question}</b>`;
          conversationContext.lastQuestion = firstQuestionArrendar.field;

          const options = firstQuestionArrendar.options.map(opt => ({
            text: opt.text,
            action: `set_${firstQuestionArrendar.field}_${opt.value}`
          }));
          botReply(arrendarResponse, options);
        } else {
          botReply(arrendarResponse);
        }
        break;

      case 'alojamiento':
        addMessage('Alojamiento por días', false);
        conversationContext.interest = 'dias';

        let alojamientoResponse = `🌴 <b>¡Cartagena te espera!</b><br><br>`;
        alojamientoResponse += `Para encontrar el alojamiento ideal, necesito saber:<br><br>`;
        alojamientoResponse += `• ¿Cuántas personas serán?<br>`;
        alojamientoResponse += `• ¿Qué fechas tienes en mente?<br>`;
        alojamientoResponse += `• ¿Prefieres cerca a la playa o en el centro histórico?<br><br>`;

        const stayProps = properties.filter(p => p.operation === 'dias' || p.operation === 'alojar').slice(0, 2);
        if (stayProps.length > 0) {
          alojamientoResponse += `Mientras tanto, aquí hay algunas opciones populares:`;
          stayProps.forEach(p => { alojamientoResponse += createPropertyCard(p); });
        }

        alojamientoResponse += `<br><br>👉 <a href="propiedades-alojamientos.html" style="color:#d4af37;font-weight:600;">Ver todos los alojamientos</a>`;
        botReply(alojamientoResponse);
        break;

      case 'whatsapp':
        addMessage('Quiero contactar un asesor', false);
        const waLink = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent('Hola Altorra, necesito información sobre propiedades')}`;
        botReply(`
          Te conecto con un asesor inmediatamente:
          <a href="${waLink}" target="_blank" rel="noopener" class="chat-whatsapp-link">
            <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.789l4.94-1.293A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.487 0-4.783-.79-6.665-2.136l-.356-.267-3.692.968.985-3.596-.29-.362A9.958 9.958 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
            Abrir WhatsApp
          </a>
        `);
        break;

      case 'propietario':
        addMessage('Soy propietario', false);
        botReply(RESPONSES.propietarioGeneral, PROPIETARIO_OPTIONS);
        break;

      case 'propietario_venta':
        addMessage('Quiero vender mi propiedad', false);
        botReply(RESPONSES.propietarioVenta);
        break;

      case 'propietario_arriendos':
        addMessage('Quiero arrendar mi propiedad', false);
        botReply(RESPONSES.propietarioArriendos);
        break;

      case 'ver_ambas':
        // Mostrar propiedades tanto en venta como arriendo según el contexto
        addMessage('Ver ambas opciones', false);
        const ctx = conversationContext;
        const criteria = {
          type: ctx.propertyType,
          zone: ctx.zone
        };

        const comprar = smartSearchProperties({ ...criteria, operation: 'comprar' });
        const arrendar = smartSearchProperties({ ...criteria, operation: 'arrendar' });

        let ambasHtml = '';
        if (comprar.length > 0) {
          ambasHtml += `<b>🏡 En Venta:</b>`;
          comprar.forEach(p => { ambasHtml += createPropertyCard(p); });
          ambasHtml += '<br>';
        }
        if (arrendar.length > 0) {
          ambasHtml += `<b>🔑 En Arriendo:</b>`;
          arrendar.forEach(p => { ambasHtml += createPropertyCard(p); });
        }
        if (ambasHtml) {
          ambasHtml += '<br><br>¿Te interesa alguna propiedad? Puedo darte más información o agendar una visita.';
        } else {
          ambasHtml = 'No encontré propiedades con esos criterios. ¿Te gustaría explorar otras zonas?';
        }
        botReply(ambasHtml);
        break;

      default:
        // Manejar respuestas de consultoría (set_field_value)
        if (action.startsWith('set_')) {
          const parts = action.split('_');
          if (parts.length >= 3) {
            const field = parts[1];
            const value = parts.slice(2).join('_');

            // Guardar el valor en el contexto
            if (field === 'purpose') {
              conversationContext.purpose = value;
              addMessage(CONSULTATION_QUESTIONS[conversationContext.interest]?.purpose?.options?.find(o => o.value === value)?.text || value, false);
            } else if (field === 'propertyType') {
              conversationContext.propertyType = value;
              addMessage(CONSULTATION_QUESTIONS[conversationContext.interest]?.propertyType?.options?.find(o => o.value === value)?.text || value, false);
            } else if (field === 'zone') {
              conversationContext.zone = value;
              addMessage(CONSULTATION_QUESTIONS[conversationContext.interest]?.zone?.options?.find(o => o.value === value)?.text || value, false);
            } else if (field === 'budget') {
              conversationContext.budget = parseInt(value);
              addMessage(CONSULTATION_QUESTIONS[conversationContext.interest]?.budget?.options?.find(o => o.value === parseInt(value))?.text || value, false);
            } else if (field === 'beds') {
              conversationContext.beds = parseInt(value);
              addMessage(CONSULTATION_QUESTIONS[conversationContext.interest]?.beds?.options?.find(o => o.value === parseInt(value))?.text || value, false);
            }

            // Verificar si tenemos suficiente información
            if (hasEnoughInfoToRecommend()) {
              // Cambiar a fase de recomendación
              conversationContext.consultationPhase = 'recommendation';
              const results = getSmartRecommendations();
              const recommendation = generatePersonalizedRecommendation(results);
              botReply(recommendation);
            } else {
              // Continuar con la siguiente pregunta
              const nextQuestion = getNextConsultationQuestion();
              if (nextQuestion) {
                let response = '✅ ¡Perfecto!<br><br>';
                response += `<b>${nextQuestion.question}</b>`;
                conversationContext.lastQuestion = nextQuestion.field;

                const options = nextQuestion.options.map(opt => ({
                  text: opt.text,
                  action: `set_${nextQuestion.field}_${opt.value}`
                }));
                botReply(response, options);
              } else {
                // Ya tenemos toda la información
                conversationContext.consultationPhase = 'recommendation';
                const results = getSmartRecommendations();
                const recommendation = generatePersonalizedRecommendation(results);
                botReply(recommendation);
              }
            }
          }
        }
        break;
    }
  }

  // Analizar intención del mensaje con puntuación
  function analyzeIntent(msg) {
    const intents = {
      saludo: {
        score: 0,
        keywords: ['hola', 'buenos', 'buenas', 'hey', 'hi', 'saludos', 'que tal', 'qué tal', 'hello', 'ey', 'buenas tardes', 'buenas noches', 'buenos días', 'buenos dias']
      },
      estado: {
        score: 0,
        keywords: ['como estas', 'cómo estás', 'como vas', 'cómo vas', 'como va todo', 'que tal estas', 'qué tal estás', 'todo bien', 'como te va']
      },
      despedida: {
        score: 0,
        keywords: ['adios', 'adiós', 'chao', 'hasta luego', 'nos vemos', 'bye', 'me voy', 'gracias por todo']
      },
      comprar: {
        score: 0,
        keywords: ['comprar', 'compra', 'venta', 'adquirir', 'busco para comprar', 'quiero comprar', 'necesito comprar', 'me interesa comprar', 'propiedad en venta', 'inmueble en venta', 'para compra', 'quisiera comprar', 'estoy buscando para comprar', 'deseo comprar', 'interesado en comprar', 'busco casa', 'busco apartamento', 'necesito propiedad']
      },
      arrendar: {
        score: 0,
        keywords: ['arrendar', 'arriendo', 'alquiler', 'alquilar', 'rentar', 'renta', 'busco arriendo', 'necesito arrendar', 'quiero arrendar', 'para arrendar', 'en arriendo', 'mensual', 'arrendamiento', 'quisiera arrendar', 'busco para arrendar', 'necesito alquilar']
      },
      inversion: {
        score: 0,
        keywords: ['invertir', 'inversión', 'inversion', 'rentabilidad', 'retorno', 'negocio', 'airbnb', 'renta por días', 'generar ingresos', 'capital', 'patrimonio', 'valorización', 'valorizacion']
      },
      procesoCompra: {
        score: 0,
        keywords: ['cómo comprar', 'como comprar', 'proceso de compra', 'pasos para comprar', 'qué necesito para comprar', 'que necesito para comprar', 'documentos para comprar', 'requisitos compra', 'escritura', 'notaría', 'notaria']
      },
      procesoArriendo: {
        score: 0,
        keywords: ['cómo arrendar', 'como arrendar', 'requisitos arriendo', 'requisitos para arrendar', 'qué necesito para arrendar', 'que necesito para arrendar', 'fiador', 'codeudor', 'depósito', 'deposito', 'contrato arriendo']
      },
      financiacion: {
        score: 0,
        keywords: ['financiar', 'financiación', 'financiacion', 'crédito', 'credito', 'hipoteca', 'banco', 'préstamo', 'prestamo', 'cuota inicial', 'tasa de interés', 'leasing']
      },
      negociacion: {
        score: 0,
        keywords: ['negociar', 'negociación', 'negociacion', 'regatear', 'descuento', 'mejor precio', 'oferta', 'contraoferta']
      },
      alojamiento: {
        score: 0,
        keywords: ['días', 'dias', 'alojamiento', 'hospedaje', 'vacaciones', 'turismo', 'turista', 'hotel', 'airbnb', 'por noche', 'temporal', 'corta estadía', 'fin de semana', 'fines de semana', 'semana santa', 'navidad', 'año nuevo']
      },
      precio: {
        score: 0,
        keywords: ['precio', 'costo', 'valor', 'cuánto', 'cuanto', 'presupuesto', 'tarifa', 'económico', 'economico', 'barato', 'costoso', 'rango', 'millones', 'pesos']
      },
      ubicacion: {
        score: 0,
        keywords: ['ubicación', 'ubicacion', 'zona', 'barrio', 'donde', 'dónde', 'sector', 'cerca', 'lejos', 'norte', 'sur', 'playa', 'centro', 'afueras']
      },
      contacto: {
        score: 0,
        keywords: ['contacto', 'teléfono', 'telefono', 'email', 'correo', 'llamar', 'número', 'numero', 'dirección', 'direccion', 'whatsapp', 'comunicar', 'hablar']
      },
      servicios: {
        score: 0,
        keywords: ['servicio', 'avalúo', 'avaluo', 'jurídico', 'juridico', 'legal', 'contable', 'administración', 'administracion', 'asesoría', 'asesoria', 'trámite', 'tramite']
      },
      ayuda: {
        score: 0,
        keywords: ['ayuda', 'help', 'ayudar', 'puedes', 'funciona', 'opciones', 'haces', 'sirves', 'capacidad', 'información', 'informacion', 'info', 'explicar', 'cómo', 'como']
      },
      gracias: {
        score: 0,
        keywords: ['gracias', 'genial', 'perfecto', 'excelente', 'ok', 'vale', 'bien', 'super', 'listo', 'bueno', 'entendido', 'claro', 'agradezco', 'muchas gracias']
      },
      publicar: {
        score: 0,
        keywords: ['publicar', 'consignar', 'registrar inmueble', 'inscribir propiedad']
      },
      propietario: {
        score: 0,
        keywords: ['soy propietario', 'tengo una propiedad', 'tengo un apartamento', 'tengo una casa', 'mi propiedad', 'mi inmueble', 'mi apartamento', 'mi casa', 'dueño de', 'propietario de']
      },
      propietarioArriendos: {
        score: 0,
        keywords: ['arrendar mi', 'administrar mi', 'poner en arriendo', 'quiero arrendar mi propiedad', 'arriendo mi', 'administren mi', 'que arrienden mi', 'busco arrendar mi', 'necesito arrendar mi']
      },
      propietarioVenta: {
        score: 0,
        keywords: ['vender mi', 'poner en venta', 'quiero vender mi', 'vendo mi', 'quiero vender mi propiedad', 'necesito vender mi', 'busco vender mi']
      },
      comparar: {
        score: 0,
        keywords: ['comparar', 'comparador', 'comparación', 'comparacion', 'versus', 'diferencia', 'mejor opción', 'cual es mejor', 'cuál es mejor']
      },
      nosotros: {
        score: 0,
        keywords: ['quiénes son', 'quienes son', 'sobre ustedes', 'sobre altorra', 'la empresa', 'la inmobiliaria', 'quién es', 'quien es', 'historia', 'trayectoria', 'experiencia']
      },
      horario: {
        score: 0,
        keywords: ['horario', 'hora', 'atienden', 'abierto', 'disponibilidad', 'cuando abren', 'a que hora', 'a qué hora', 'días de atención', 'días de atencion']
      },
      habitaciones: {
        score: 0,
        keywords: ['habitación', 'habitacion', 'habitaciones', 'cuarto', 'cuartos', 'alcoba', 'alcobas', 'dormitorio', 'dormitorios', 'recámara', 'recamara']
      },
      banos: {
        score: 0,
        keywords: ['baño', 'bano', 'baños', 'banos', 'sanitario', 'sanitarios']
      },
      parqueadero: {
        score: 0,
        keywords: ['parqueadero', 'parqueaderos', 'garage', 'garaje', 'estacionamiento', 'parking', 'carro', 'vehículo', 'vehiculo']
      },
      tamano: {
        score: 0,
        keywords: ['metros', 'm2', 'área', 'area', 'tamaño', 'tamano', 'grande', 'pequeño', 'pequeña', 'espacioso', 'amplio']
      }
    };

    // Calcular puntuación para cada intención
    for (const [intent, data] of Object.entries(intents)) {
      for (const keyword of data.keywords) {
        if (msg.includes(keyword)) {
          // Dar más peso a coincidencias más largas
          data.score += keyword.length;
        }
      }
    }

    // Obtener la intención con mayor puntuación
    let bestIntent = null;
    let bestScore = 0;
    for (const [intent, data] of Object.entries(intents)) {
      if (data.score > bestScore) {
        bestScore = data.score;
        bestIntent = intent;
      }
    }

    return { intent: bestIntent, score: bestScore };
  }

  // Función inteligente para detectar zona con aliases y variaciones
  function detectZone(msg) {
    // Primero buscar en aliases (frases compuestas)
    for (const [alias, zoneKey] of Object.entries(SITE_KNOWLEDGE.zoneAliases)) {
      if (msg.includes(alias)) {
        return zoneKey;
      }
    }

    // Luego buscar directamente en las zonas
    for (const zone of Object.keys(SITE_KNOWLEDGE.zones)) {
      if (msg.includes(zone)) {
        return zone;
      }
    }

    return null;
  }

  // Extraer criterios de búsqueda del mensaje - MEJORADO
  function extractSearchCriteria(msg) {
    const criteria = {
      operation: null,
      type: null,
      zone: null,
      beds: null,
      baths: null,
      guests: null,
      maxPrice: null,
      minPrice: null
    };

    // Detectar operación - mejorado con más patrones
    if (msg.match(/comprar|compra|venta|vender|inversión|inversion|adquirir|busco.*para.*comprar|quiero.*comprar|necesito.*comprar/i)) {
      criteria.operation = 'comprar';
    } else if (msg.match(/arrendar|arriendo|alquiler|alquilar|rentar|renta|busco.*arriendo|necesito.*arrendar|mensual/i)) {
      criteria.operation = 'arrendar';
    } else if (msg.match(/días|dias|alojamiento|hospedaje|vacaciones|temporal|por.*noche|semana.*santa|fin.*semana/i)) {
      criteria.operation = 'dias';
    }

    // Inferir operación por contexto de precio si no se detectó
    if (!criteria.operation) {
      const priceMatch = msg.match(/(\d+)\s*(millon|millón)/i);
      if (priceMatch) {
        const price = parseInt(priceMatch[1]) * 1000000;
        // Si el precio es menor a 10 millones, probablemente es arriendo
        if (price < 10000000) {
          criteria.operation = 'arrendar';
        } else if (price >= 50000000) {
          // Si es mayor a 50 millones, probablemente es compra
          criteria.operation = 'comprar';
        }
      }
    }

    // Detectar tipo de propiedad - mejorado
    const typePatterns = {
      'apartamento': /apartamento|apto|aparta|depa|departamento/i,
      'casa': /\bcasa\b|casita|vivienda/i,
      'lote': /\blote\b|terreno|predio/i,
      'oficina': /oficina/i,
      'local': /local\s*comercial|\blocal\b/i,
      'bodega': /bodega|almacén|almacen/i,
      'finca': /finca|parcela|hacienda|granja/i
    };
    for (const [type, pattern] of Object.entries(typePatterns)) {
      if (msg.match(pattern)) {
        criteria.type = type;
        break;
      }
    }

    // Detectar zona usando la función inteligente
    criteria.zone = detectZone(msg);

    // Detectar número de habitaciones - con números
    const bedsMatch = msg.match(/(\d+)\s*(habitacion|habitaciones|cuarto|cuartos|alcoba|alcobas|dormitorio|dormitorios|hab|recamara|recamaras)/i);
    if (bedsMatch) {
      criteria.beds = parseInt(bedsMatch[1]);
    }

    // Detectar número de habitaciones - con palabras (dos, tres, etc.)
    if (!criteria.beds) {
      const bedsWordMatch = msg.match(/(una|un|uno|dos|tres|cuatro|cinco|seis)\s+(habitacion|habitaciones|cuarto|cuartos|alcoba|alcobas|dormitorio|dormitorios|hab)/i);
      if (bedsWordMatch) {
        const word = bedsWordMatch[1].toLowerCase();
        criteria.beds = WORD_NUMBERS[word] || null;
      }
    }

    // Detectar número de baños - con números
    const bathsMatch = msg.match(/(\d+)\s*(baño|baños|bano|banos|sanitario|sanitarios)/i);
    if (bathsMatch) {
      criteria.baths = parseInt(bathsMatch[1]);
    }

    // Detectar número de baños - con palabras
    if (!criteria.baths) {
      const bathsWordMatch = msg.match(/(un|uno|dos|tres|cuatro)\s+(baño|baños|bano|banos)/i);
      if (bathsWordMatch) {
        const word = bathsWordMatch[1].toLowerCase();
        criteria.baths = WORD_NUMBERS[word] || null;
      }
    }

    // Detectar precio usando parseBudget mejorado
    const budget = parseBudget(msg);
    if (budget) {
      if (msg.match(/hasta|máximo|maximo|menos\s*de|no\s*más\s*de|no\s*mas\s*de|tope|limite/i)) {
        criteria.maxPrice = budget;
      } else if (msg.match(/desde|mínimo|minimo|más\s*de|mas\s*de|mayor\s*a|a\s*partir/i)) {
        criteria.minPrice = budget;
      } else {
        // Sin indicador, asumir es el máximo con tolerancia
        criteria.maxPrice = budget * 1.2;
      }
    }

    // Detectar número de personas/huéspedes (para alojamientos)
    const guestsMatch = msg.match(/(\d+)\s*(persona|personas|huésped|huespedes|huéspedes|adulto|adultos)/i);
    if (guestsMatch) {
      criteria.guests = parseInt(guestsMatch[1]);
    }

    // Detectar número de personas con palabras
    if (!criteria.guests) {
      const guestsWordMatch = msg.match(/(somos|para|seremos)\s*(una|un|dos|tres|cuatro|cinco|seis|siete|ocho)/i);
      if (guestsWordMatch) {
        const word = guestsWordMatch[2].toLowerCase();
        criteria.guests = WORD_NUMBERS[word] || null;
      }
    }

    // Detectar "somos X" sin la palabra persona
    if (!criteria.guests) {
      const somosMatch = msg.match(/somos\s*(\d+)/i);
      if (somosMatch) {
        criteria.guests = parseInt(somosMatch[1]);
      }
    }

    return criteria;
  }

  // Búsqueda inteligente de propiedades - MEJORADA
  function smartSearchProperties(criteria) {
    let results = [...properties];

    // Filtrar por operación usando la función auxiliar
    results = filterByOperation(results, criteria.operation);

    // Filtrar por tipo
    if (criteria.type) {
      results = results.filter(p => p.type === criteria.type);
    }

    // Filtrar por zona - búsqueda flexible
    if (criteria.zone) {
      const zoneKey = criteria.zone.toLowerCase();
      results = results.filter(p => {
        const neighborhood = (p.neighborhood || '').toLowerCase();
        const city = (p.city || '').toLowerCase();
        const address = (p.address || '').toLowerCase();

        // Buscar coincidencia directa
        if (neighborhood.includes(zoneKey) || city.includes(zoneKey) || address.includes(zoneKey)) {
          return true;
        }

        // Buscar variaciones comunes
        const zoneVariations = {
          'country': ['country', 'el country', 'country club'],
          'piedelapopa': ['pie de la popa', 'popa', 'pie la popa'],
          'centro': ['centro', 'histórico', 'historico', 'amurallada'],
          'sandiego': ['san diego', 'diego'],
          'castillogrande': ['castillo grande', 'castillogrande'],
          'getsemani': ['getsemaní', 'getsemani'],
          'boquilla': ['boquilla', 'la boquilla']
        };

        const variations = zoneVariations[zoneKey] || [zoneKey];
        return variations.some(v =>
          neighborhood.includes(v) || city.includes(v) || address.includes(v)
        );
      });
    }

    // Filtrar por habitaciones
    if (criteria.beds) {
      results = results.filter(p => p.beds >= criteria.beds);
    }

    // Filtrar por baños
    if (criteria.baths) {
      results = results.filter(p => p.baths >= criteria.baths);
    }

    // Filtrar por precio máximo
    if (criteria.maxPrice) {
      results = results.filter(p => p.price <= criteria.maxPrice);
    }

    // Filtrar por precio mínimo
    if (criteria.minPrice) {
      results = results.filter(p => p.price >= criteria.minPrice);
    }

    // Ordenar por relevancia (propiedades con más coincidencias primero)
    results.sort((a, b) => {
      let scoreA = 0, scoreB = 0;

      // Dar más peso a coincidencias exactas
      if (criteria.type && a.type === criteria.type) scoreA += 2;
      if (criteria.type && b.type === criteria.type) scoreB += 2;

      // Propiedades con más fotos tienden a ser mejores
      if (a.images && a.images.length > 3) scoreA += 1;
      if (b.images && b.images.length > 3) scoreB += 1;

      return scoreB - scoreA;
    });

    return results.slice(0, 3);
  }

  // Procesar mensaje del usuario con inteligencia mejorada
  function processMessage(message) {
    const msg = message.toLowerCase().trim();
    const { intent, score } = analyzeIntent(msg);
    const criteria = extractSearchCriteria(msg);

    // Actualizar contexto de la conversación
    updateContext(msg, criteria);

    // Aplicar slot filling - usar la última pregunta del bot para interpretar respuestas
    applyAnswerToLastQuestion(msg, criteria);

    // Intentar responder con conocimiento inmobiliario si no es claramente una búsqueda
    const knowledgeAnswer = answerFromKnowledge(msg);
    if (knowledgeAnswer && !criteria.operation && !criteria.type && !criteria.zone) {
      botReply(knowledgeAnswer);
      return;
    }

    // Detectar si el usuario quiere realizar una acción en la página
    const matchedPage = matchPageByTopic(msg);
    if (matchedPage && !criteria.operation && !criteria.type) {
      const html = `Puedo ayudarte con eso.<br><br>👉 <a href="${matchedPage.url}" style="color:#d4af37;font-weight:600;">Ir a ${matchedPage.desc}</a><br><br>¿Hay algo más en lo que pueda asistirte?`;
      botReply(html);
      return;
    }

    // Si hay criterios de búsqueda específicos, buscar propiedades
    const hasCriteria = criteria.operation || criteria.type || criteria.zone || criteria.beds || criteria.maxPrice || criteria.guests;

    // Si el usuario ya está en contexto de alojamiento y menciona personas, usar ese contexto
    if (!criteria.operation && conversationContext.interest === 'dias' && criteria.guests) {
      criteria.operation = 'dias';
    }

    // Si el usuario ya está en otro contexto y da información relevante, usar ese contexto
    if (!criteria.operation && conversationContext.interest && (criteria.type || criteria.zone || criteria.beds || criteria.maxPrice)) {
      criteria.operation = conversationContext.interest;
    }

    if (hasCriteria) {
      // Si no se especificó operación pero tenemos tipo o zona, preguntar inteligentemente
      if (!criteria.operation && (criteria.type || criteria.zone)) {
        // Buscar en todas las operaciones
        const comprarResults = smartSearchProperties({ ...criteria, operation: 'comprar' });
        const arrendarResults = smartSearchProperties({ ...criteria, operation: 'arrendar' });

        let description = '';
        if (criteria.type) description += `<b>${criteria.type}s</b> `;
        if (criteria.zone) {
          const zoneName = criteria.zone.charAt(0).toUpperCase() + criteria.zone.slice(1);
          description += `en <b>${zoneName}</b>`;
        }

        let html = `Entiendo que buscas ${description}.<br><br>`;

        // Mostrar opciones disponibles
        if (comprarResults.length > 0 || arrendarResults.length > 0) {
          html += '¿Qué operación te interesa?<br><br>';

          if (comprarResults.length > 0) {
            html += `• <b>Comprar:</b> ${comprarResults.length} propiedad${comprarResults.length > 1 ? 'es' : ''} disponible${comprarResults.length > 1 ? 's' : ''}<br>`;
          }
          if (arrendarResults.length > 0) {
            html += `• <b>Arrendar:</b> ${arrendarResults.length} propiedad${arrendarResults.length > 1 ? 'es' : ''} disponible${arrendarResults.length > 1 ? 's' : ''}<br>`;
          }

          // Actualizar contexto
          conversationContext.propertyType = criteria.type;
          conversationContext.zone = criteria.zone;

          const options = [];
          if (comprarResults.length > 0) options.push({ text: 'Para comprar', action: 'comprar' });
          if (arrendarResults.length > 0) options.push({ text: 'Para arrendar', action: 'arrendar' });
          options.push({ text: 'Ver ambas opciones', action: 'ver_ambas' });

          botReply(html, options);
          return;
        }
      }

      const results = smartSearchProperties(criteria);

      if (results.length > 0) {
        let description = '✨ ';
        if (criteria.type) description += `${criteria.type}s `;
        if (criteria.operation === 'comprar') description += 'en venta ';
        if (criteria.operation === 'arrendar') description += 'en arriendo ';
        if (criteria.operation === 'dias') description += 'por días ';
        if (criteria.zone) description += `en ${criteria.zone.charAt(0).toUpperCase() + criteria.zone.slice(1)} `;
        if (criteria.beds) description += `con ${criteria.beds}+ habitaciones `;
        if (criteria.maxPrice) description += `hasta $${(criteria.maxPrice/1000000).toFixed(0)} millones `;

        let html = `Encontré <b>${results.length} propiedad${results.length > 1 ? 'es' : ''}</b> ${description}:`;
        results.forEach(p => { html += createPropertyCard(p); });

        // Agregar seguimiento contextual
        const followUp = getContextualFollowUp();
        if (followUp) {
          html += `<br><br>${followUp}`;
        } else {
          html += '<br><br>Haz clic en cualquiera para ver detalles. ¿Te gustaría agendar una visita o ajustar los criterios?';
        }
        botReply(html);
        return;
      } else {
        // No hay resultados pero sí criterios - dar sugerencias inteligentes
        let suggestion = '';
        let description = '';
        if (criteria.type) description += `${criteria.type}s `;
        if (criteria.zone) description += `en ${criteria.zone.charAt(0).toUpperCase() + criteria.zone.slice(1)} `;

        suggestion += `No encontré ${description}con esos criterios exactos.<br><br>`;

        // Buscar alternativas
        const alternativeResults = smartSearchProperties({
          operation: criteria.operation,
          type: criteria.type
        });

        if (alternativeResults.length > 0 && criteria.zone) {
          suggestion += `Pero tenemos ${alternativeResults.length} ${criteria.type || 'propiedades'} en otras zonas:<br>`;
          alternativeResults.slice(0, 2).forEach(p => { suggestion += createPropertyCard(p); });
          suggestion += '<br>';
        }

        // Sugerir según el contexto
        if (conversationContext.purpose === 'inversion') {
          suggestion += 'Para inversión, te recomiendo explorar Bocagrande o Centro Histórico por su alta demanda turística.<br><br>';
        }

        if (criteria.operation === 'comprar') {
          suggestion += '👉 <a href="propiedades-comprar.html" style="color:#d4af37;font-weight:600;">Ver todas las propiedades en venta</a>';
        } else if (criteria.operation === 'arrendar') {
          suggestion += '👉 <a href="propiedades-arrendar.html" style="color:#d4af37;font-weight:600;">Ver todas las propiedades en arriendo</a>';
        } else if (criteria.operation === 'dias') {
          suggestion += '👉 <a href="propiedades-alojamientos.html" style="color:#d4af37;font-weight:600;">Ver todos los alojamientos</a>';
        } else {
          suggestion += '👉 <a href="index.html" style="color:#d4af37;font-weight:600;">Ver todas las propiedades</a>';
        }
        suggestion += '<br><br>¿Te gustaría ajustar los criterios o hablar con un asesor?';
        botReply(suggestion);
        return;
      }
    }

    // Procesar según la intención detectada
    if (score > 0) {
      switch (intent) {
        case 'saludo':
          botReply(RESPONSES.greeting[Math.floor(Math.random() * RESPONSES.greeting.length)], QUICK_OPTIONS);
          return;
        case 'estado':
          botReply('¡Muy bien, gracias por preguntar! 😊<br><br>Estoy aquí para ayudarte con tu búsqueda inmobiliaria en Cartagena. ¿Qué necesitas hoy?', QUICK_OPTIONS);
          return;
        case 'despedida':
          botReply('¡Hasta pronto! 👋<br><br>Fue un gusto ayudarte. Recuerda que puedes volver cuando quieras.<br><br>Si necesitas atención inmediata, contáctanos por WhatsApp: <b>+57 300 243 9810</b>');
          return;
        case 'gracias':
          botReply(RESPONSES.gracias);
          return;
        case 'ayuda':
          botReply(RESPONSES.ayuda, QUICK_OPTIONS);
          return;
        case 'comprar':
          handleOption('comprar');
          return;
        case 'arrendar':
          handleOption('arrendar');
          return;
        case 'alojamiento':
          handleOption('alojamiento');
          return;
        case 'inversion':
          conversationContext.purpose = 'inversion';
          botReply(RESPONSES.inversion);
          return;
        case 'procesoCompra':
          botReply(RESPONSES.procesoCompra);
          return;
        case 'procesoArriendo':
          botReply(RESPONSES.procesoArriendo);
          return;
        case 'financiacion':
          botReply(RESPONSES.financiacion);
          return;
        case 'negociacion':
          botReply(RESPONSES.negociacion);
          return;
        case 'precio':
          botReply(RESPONSES.precio);
          return;
        case 'contacto':
          botReply(RESPONSES.contacto);
          return;
        case 'servicios':
          botReply(RESPONSES.servicios);
          return;
        case 'nosotros':
          botReply(RESPONSES.nosotros);
          return;
        case 'horario':
          botReply(RESPONSES.horario);
          return;
        case 'publicar':
          botReply(RESPONSES.publicar);
          return;
        case 'propietario':
          handleOption('propietario');
          return;
        case 'propietarioArriendos':
          handleOption('propietario_arriendos');
          return;
        case 'propietarioVenta':
          handleOption('propietario_venta');
          return;
        case 'comparar':
          botReply(RESPONSES.comparar);
          return;
        case 'ubicacion':
          // Verificar si menciona una zona específica
          for (const [zone, info] of Object.entries(SITE_KNOWLEDGE.zones)) {
            if (msg.includes(zone)) {
              const zoneTitle = zone.charAt(0).toUpperCase() + zone.slice(1);
              let response = `📍 <b>${zoneTitle}</b><br><br>${info}<br><br>`;
              const zoneProps = properties.filter(p =>
                (p.neighborhood && p.neighborhood.toLowerCase().includes(zone)) ||
                (p.city && p.city.toLowerCase().includes(zone))
              ).slice(0, 2);
              if (zoneProps.length > 0) {
                response += `<b>Propiedades disponibles:</b>`;
                zoneProps.forEach(p => { response += createPropertyCard(p); });
              }
              botReply(response);
              return;
            }
          }
          botReply(RESPONSES.ubicacion);
          return;
      }
    }

    // Buscar propiedades con el texto completo como último recurso
    const results = searchProperties(msg);
    if (results.length > 0) {
      let html = `✨ Encontré <b>${results.length} propiedad${results.length > 1 ? 'es' : ''}</b>:`;
      results.forEach(p => { html += createPropertyCard(p); });
      html += '<br>¿Te interesa alguna? Puedo darte más detalles.';
      botReply(html);
      return;
    }

    // Respuesta inteligente por defecto basada en contexto
    let response = '';
    const ctx = conversationContext;

    // Si tenemos contexto, dar respuesta personalizada
    if (ctx.interest || ctx.propertyType || ctx.zone) {
      response = 'Entiendo que ';
      if (ctx.interest === 'comprar') response += 'buscas comprar';
      else if (ctx.interest === 'arrendar') response += 'buscas arrendar';
      else if (ctx.interest === 'dias') response += 'buscas alojamiento por días';

      if (ctx.propertyType) response += ` un ${ctx.propertyType}`;
      if (ctx.zone) response += ` en ${ctx.zone.charAt(0).toUpperCase() + ctx.zone.slice(1)}`;
      response += '.<br><br>';

      // Dar seguimiento específico
      const followUp = getContextualFollowUp();
      if (followUp) {
        response += `Para ayudarte mejor: ${followUp}`;
      } else {
        response += '¿Podrías darme más detalles sobre lo que necesitas?';
      }
    } else {
      // Sin contexto - respuesta general pero amigable
      response = `Disculpa, no logré entender completamente tu mensaje.<br><br>`;

      if (msg.length < 15) {
        response += 'Intenta ser más específico, por ejemplo:<br>';
        response += '• "Busco apartamento en Bocagrande para comprar"<br>';
        response += '• "Necesito casa en arriendo con 3 habitaciones"<br>';
        response += '• "¿Cómo es el proceso para comprar?"<br><br>';
      } else {
        response += '¿Podrías reformular tu pregunta o elegir una opción?<br><br>';
      }
    }

    response += `
      Si prefieres atención personalizada:
      <a href="https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent('Hola Altorra, ' + message)}" target="_blank" rel="noopener" class="chat-whatsapp-link">
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.789l4.94-1.293A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
        Hablar con un asesor
      </a>
    `;

    botReply(response, QUICK_OPTIONS);
  }

  // Toggle del chatbot
  function toggleChat() {
    const window = document.getElementById('chatbot-window');
    const toggle = document.getElementById('chatbot-toggle');

    isOpen = !isOpen;
    window.classList.toggle('open', isOpen);
    toggle.classList.toggle('active', isOpen);
    toggle.classList.add('seen');

    // Saludo inicial
    if (isOpen && !hasGreeted) {
      hasGreeted = true;
      setTimeout(() => {
        addMessage(RESPONSES.greeting[0], true, QUICK_OPTIONS);
      }, 500);
    }

    // Focus en el input
    if (isOpen) {
      setTimeout(() => {
        document.getElementById('chatbot-input').focus();
      }, 300);
    }
  }

  // Enviar mensaje
  function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();

    if (!message) return;

    addMessage(message, false);
    input.value = '';

    setTimeout(() => {
      processMessage(message);
    }, CONFIG.messageDelay);
  }

  // Crear burbuja de bienvenida
  function createWelcomeBubble() {
    if (welcomeBubbleShown) return;

    const bubble = document.createElement('div');
    bubble.className = 'chatbot-welcome-bubble';
    bubble.id = 'chatbot-welcome-bubble';
    bubble.innerHTML = `
      <button class="close-bubble" onclick="event.stopPropagation(); this.parentElement.remove();">×</button>
      <span class="ia-badge">IA</span>¡Hola! Soy tu asistente virtual. ¿Necesitas ayuda?
    `;

    bubble.addEventListener('click', () => {
      bubble.remove();
      toggleChat();
    });

    document.body.appendChild(bubble);
    welcomeBubbleShown = true;

    // Auto-ocultar después de 8 segundos
    setTimeout(() => {
      if (bubble.parentElement) {
        bubble.style.opacity = '0';
        setTimeout(() => bubble.remove(), 300);
      }
    }, 8000);
  }

  // Inicializar chatbot
  function init() {
    createChatbotHTML();
    loadProperties();
    loadContext(); // Cargar contexto guardado de sesiones anteriores

    // Event listeners
    document.getElementById('chatbot-toggle').addEventListener('click', toggleChat);
    document.getElementById('chatbot-send').addEventListener('click', sendMessage);
    document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) toggleChat();
    });

    // Mostrar burbuja de bienvenida después de 3 segundos
    setTimeout(() => {
      if (!isOpen && !sessionStorage.getItem('altorra-chatbot-seen')) {
        createWelcomeBubble();
        sessionStorage.setItem('altorra-chatbot-seen', 'true');
      }
    }, 3000);
  }

  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
