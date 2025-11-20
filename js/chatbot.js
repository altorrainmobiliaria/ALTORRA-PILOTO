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

  // ============================================
  // DICCIONARIO DE SINÓNIMOS E INTELIGENCIA NATURAL
  // ============================================

  // Normalizar texto: quitar acentos, lowercase, espacios extra
  function normalizeText(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Sinónimos para comandos de navegación
  const SYNONYMS = {
    // Volver atrás / reiniciar
    back: ['atras', 'atrás', 'volver', 'regresar', 'ir atras', 'ir atrás', 'back', 'anterior', 'retroceder', 'salir', 'cancelar', 'menu', 'menú', 'inicio'],

    // Confirmaciones positivas
    yes: ['si', 'sí', 'ok', 'okay', 'vale', 'dale', 'listo', 'claro', 'bueno', 'bien', 'perfecto', 'exacto', 'correcto', 'afirmativo', 'por supuesto', 'obvio', 'seguro', 'ya', 'aja', 'ajá', 'simón', 'eso', 'así es'],

    // Negaciones
    no: ['no', 'nop', 'nope', 'nel', 'negativo', 'para nada', 'ninguno', 'ninguna', 'nunca', 'jamas', 'jamás'],

    // Operación: Comprar
    buy: ['comprar', 'compra', 'adquirir', 'invertir', 'inversion', 'inversión', 'venta', 'en venta', 'para compra', 'adquisición', 'adquisicion', 'propiedad en venta', 'inmueble en venta', 'quiero comprar', 'busco comprar', 'interesa comprar', 'deseo comprar', 'compraría', 'compraria'],

    // Operación: Arrendar
    rent: ['arrendar', 'arriendo', 'alquilar', 'alquiler', 'rentar', 'renta', 'mensual', 'arrendamiento', 'arrendatario', 'inquilino', 'quiero arrendar', 'busco arrendar', 'interesa arrendar', 'deseo arrendar', 'para arrendar', 'en arriendo', 'en alquiler', 'arrendaria', 'arrendar\u00eda', 'alquilaría', 'alquilaria'],

    // Operación: Alojamiento
    stay: ['alojamiento', 'hospedaje', 'vacaciones', 'dias', 'días', 'temporal', 'turismo', 'hotel', 'airbnb', 'noche', 'noches', 'finde', 'fin de semana', 'vacacional', 'temporada', 'corta estadia', 'corta estadía', 'short stay', 'por días', 'estadia temporal', 'estadía temporal', 'turístico', 'turistico', 'temporalmente', 'unos dias', 'unos días'],

    // Propietario
    owner: ['propietario', 'dueño', 'dueña', 'tengo una', 'tengo un', 'mi propiedad', 'mi casa', 'mi apartamento', 'mi apto', 'mi inmueble', 'vender mi', 'arrendar mi', 'soy dueño', 'soy dueña', 'soy propietario', 'soy propietaria', 'poseo', 'tengo propiedad', 'tengo inmueble', 'quiero publicar', 'quiero anunciar'],

    // Tipos de propiedad
    apartment: ['apartamento', 'apto', 'aparta', 'depa', 'departamento', 'piso', 'flat', 'apartaestudio', 'studio', 'penthouse', 'ático', 'atico', 'duplex', 'dúplex', 'apartamentos', 'aptos'],
    house: ['casa', 'casita', 'vivienda', 'chalet', 'townhouse', 'residencia', 'hogar', 'casa unifamiliar', 'villa', 'cabaña', 'cabana', 'cottage', 'casas'],
    lot: ['lote', 'terreno', 'predio', 'solar', 'parcela', 'tierra', 'finca', 'terreno urbano', 'terreno rural', 'lote urbanizable', 'lote sin construir', 'lotes', 'terrenos'],
    office: ['oficina', 'local', 'comercial', 'negocio', 'bodega', 'espacio comercial', 'consultorio', 'local comercial', 'oficina comercial', 'espacio de trabajo', 'oficinas', 'locales'],

    // Contacto / Asesor
    contact: ['asesor', 'asesora', 'contacto', 'contactar', 'hablar', 'llamar', 'whatsapp', 'telefono', 'teléfono', 'numero', 'número', 'ayuda humana', 'persona real', 'agente', 'representante', 'consejero', 'asistencia', 'comunicar', 'comunicarse', 'escribir', 'chatear', 'conversar', 'llamada', 'mensaje', 'hablar con alguien', 'persona', 'humano'],

    // Saludos
    greeting: ['hola', 'buenos', 'buenas', 'hey', 'hi', 'hello', 'saludos', 'que tal', 'qué tal', 'ey', 'alo', 'aló', 'buen dia', 'buen día', 'buenas tardes', 'buenas noches', 'holi', 'holaa', 'holaaa', 'que hubo', 'qué hubo', 'como estas', 'cómo estás', 'como va', 'cómo va', 'buenas dias'],

    // Despedidas
    goodbye: ['adios', 'adiós', 'chao', 'chau', 'bye', 'hasta luego', 'nos vemos', 'me voy', 'gracias por todo', 'hasta pronto', 'nos hablamos', 'hasta la proxima', 'hasta la próxima', 'me retiro', 'ya me voy', 'ciao', 'goodbye', 'see you', 'hasta mañana', 'que estes bien', 'que estés bien', 'cuídate', 'cuidate'],

    // Agradecimientos
    thanks: ['gracias', 'thank', 'agradezco', 'muy amable', 'te agradezco', 'mil gracias', 'muchas gracias', 'gracias por la ayuda', 'gracias por tu ayuda', 'agradecido', 'agradecida', 'thank you', 'thanks', 'grax', 'graciass', 'graciasss', 'te lo agradezco', 'super gracias'],

    // Zonas de Cartagena
    bocagrande: ['bocagrande', 'boca grande', 'bocagrade', 'boca', 'zona norte', 'sector bocagrande', 'playa bocagrande'],
    manga: ['manga', 'la manga', 'barrio manga', 'zona manga'],
    centro: ['centro', 'historico', 'histórico', 'amurallado', 'ciudad vieja', 'ciudad amurallada', 'centro historico', 'centro histórico', 'casco antiguo', 'casco histórico'],
    getsemani: ['getsemani', 'getsemaní', 'getsemany', 'barrio getsemani', 'barrio getsemaní'],
    castillogrande: ['castillogrande', 'castillo grande', 'castillo', 'zona castillogrande'],
    crespo: ['crespo', 'barrio crespo', 'zona crespo'],
    laguito: ['laguito', 'el laguito', 'barrio laguito', 'zona laguito'],
    piedelapopa: ['pie de la popa', 'pie la popa', 'la popa', 'popa', 'barrio popa', 'cerro de la popa'],
    serena: ['serena del mar', 'serena', 'barcelona de indias', 'la serena', 'sector serena'],
    country: ['country', 'barrio country', 'el country', 'zona country'],
    parqueheredia: ['parque heredia', 'milan', 'milán', 'parque heredia milan', 'parque heredia milán', 'zona milan', 'zona milán'],

    // Características
    pool: ['piscina', 'alberca', 'pool', 'pileta', 'natación', 'natacion', 'jacuzzi', 'turco', 'sauna', 'zona húmeda', 'zona humeda', 'área de piscina', 'area de piscina', 'con piscina', 'tiene piscina'],
    parking: ['parqueadero', 'parking', 'garage', 'garaje', 'estacionamiento', 'carro', 'vehiculo', 'vehículo', 'parqueo', 'plaza de garaje', 'cubierto', 'parqueadero cubierto', 'plaza de parking', 'con parqueadero', 'tiene parqueadero', 'estacionamiento cubierto'],
    furnished: ['amoblado', 'amueblado', 'muebles', 'equipado', 'con muebles', 'mobiliario', 'completamente amoblado', 'semi amoblado', 'semi-amoblado', 'con electrodomésticos', 'con electrodomesticos', 'equipada', 'amoblada'],
    aircon: ['aire acondicionado', 'aire', 'ac', 'clima', 'climatizado', 'climatización', 'climatizacion', 'a/c', 'aire central', 'split', 'con aire', 'tiene aire', 'climatizada'],
    view: ['vista', 'panoramica', 'panorámica', 'vista al mar', 'frente al mar', 'vista mar', 'balcón', 'balcon', 'terraza', 'vista ciudad', 'vista panorámica', 'vista panoramica', 'con vista', 'vista hermosa', 'con balcón', 'con balcon', 'con terraza']
  };

  // Función para verificar si el mensaje contiene algún sinónimo de una categoría
  function matchesSynonym(text, category) {
    const normalized = normalizeText(text);
    const synonyms = SYNONYMS[category];
    if (!synonyms) return false;

    return synonyms.some(syn => {
      const normalizedSyn = normalizeText(syn);
      // Buscar como palabra completa o como parte del texto
      const regex = new RegExp(`\\b${normalizedSyn}\\b|^${normalizedSyn}|${normalizedSyn}$`, 'i');
      return regex.test(normalized);
    });
  }

  // Función para detectar múltiples categorías en un mensaje
  function detectCategories(text) {
    const detected = [];
    for (const category of Object.keys(SYNONYMS)) {
      if (matchesSynonym(text, category)) {
        detected.push(category);
      }
    }
    return detected;
  }

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

  // Resetear conversación (para "atrás", "reiniciar", cambio de modo, etc.)
  function resetConversation(options = { full: false }) {
    const keepGreeting = conversationContext.hasGreetedUser;
    // Volver al estado base usando deep copy
    conversationContext = JSON.parse(JSON.stringify(INITIAL_CONTEXT));

    // Si no es reinicio duro, conservamos info de saludo
    if (!options.full) {
      conversationContext.hasGreetedUser = keepGreeting;
    } else {
      // Reinicio completo - limpiar historial también
      conversationHistory = [];
    }

    saveContext();
  }

  // Generar transcripción completa de la conversación
  function generateConversationTranscript() {
    if (conversationHistory.length === 0) return '';

    let transcript = '--- HISTORIAL DE CONVERSACIÓN ---\n\n';
    conversationHistory.forEach(entry => {
      // Limitar longitud de cada mensaje para WhatsApp
      const shortMsg = entry.message.length > 150
        ? entry.message.substring(0, 147) + '...'
        : entry.message;
      transcript += `[${entry.timestamp}] ${entry.sender}: ${shortMsg}\n`;
    });
    transcript += '\n--- FIN HISTORIAL ---';

    return transcript;
  }

  // Estado del chatbot
  let properties = [];
  let isOpen = false;
  let hasGreeted = false;
  let welcomeBubbleShown = false;
  let conversationHistory = []; // Historial completo de la conversación

  // Contexto inicial base de la conversación
  const INITIAL_CONTEXT = {
    // Rol del usuario (prioridad alta)
    role: null,              // 'comprador' | 'arrendatario' | 'turista' | 'propietario_venta' | 'propietario_arriendo'
    hasGreetedUser: false,   // Si ya saludamos al usuario

    // Datos de búsqueda (compradores/arrendatarios/turistas)
    interest: null,          // comprar, arrendar, dias
    propertyType: null,      // apartamento, casa, etc.
    zone: null,              // bocagrande, manga, etc.
    budget: null,            // presupuesto
    beds: null,              // habitaciones
    baths: null,             // baños
    guests: null,            // número de personas (para alojamientos)
    stayDates: null,         // texto de las fechas para alojamientos (ej: "del 5 al 10 de enero")
    purpose: null,           // vivienda, inversión, trabajo
    timeline: null,          // urgente, flexible
    family: null,            // solo, pareja, familia

    // Control de flujo
    lastQuestion: null,      // última pregunta hecha
    questionsAsked: [],      // preguntas ya respondidas
    consultationPhase: 'discovery', // discovery, recommendation, closing
    dataPoints: 0,           // cantidad de información recopilada

    // Datos del inmueble del propietario (para venta)
    ownerPropertyForSale: {
      type: null,            // apartamento, casa, lote, oficina
      zone: null,            // barrio/zona
      price: null,           // valor estimado
      sqm: null,             // área en m²
      beds: null,            // habitaciones
      baths: null,           // baños
      parking: null,         // parqueadero (sí/no)
      condition: null        // nuevo, usado, remodelado
    },

    // Datos del inmueble del propietario (para arriendo)
    ownerPropertyForRent: {
      type: null,
      zone: null,
      canon: null,           // canon mensual deseado
      furnished: null,       // amoblado (sí/no)
      pets: null,            // mascotas permitidas
      beds: null,
      availableFrom: null    // fecha disponible
    }
  };

  // Contexto de la conversación - memoria del chatbot (instancia viva)
  let conversationContext = JSON.parse(JSON.stringify(INITIAL_CONTEXT));

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

    // ⭐ ORDEN CORRECTO: Preguntas OBLIGATORIAS primero
    // 1. propertyType (OBLIGATORIO) - para saber qué busca
    // 2. zone (RECOMENDADO) - para filtrar ubicación
    // 3. budget (OBLIGATORIO) - para filtrar por precio
    // 4. purpose (OPCIONAL) - para personalizar recomendación
    // 5. beds (OPCIONAL) - para afinar búsqueda
    const questionOrder = ['propertyType', 'zone', 'budget', 'purpose', 'beds'];

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

    // ⭐ CAMBIO CRÍTICO: Campos OBLIGATORIOS para hacer recomendaciones
    // NO se puede recomendar sin estos 3 campos básicos
    const hasRequiredFields =
      ctx.interest &&           // comprar/arrendar/dias
      ctx.propertyType &&       // apartamento/casa/lote
      ctx.budget;               // presupuesto (crítico para filtrar)

    // Si no tiene los campos obligatorios, NO está listo
    if (!hasRequiredFields) {
      return false;
    }

    // Contar puntos de datos para analytics
    let points = 0;
    if (ctx.interest) points++;
    if (ctx.propertyType) points++;
    if (ctx.zone) points++;
    if (ctx.budget) points++;
    if (ctx.beds) points++;
    if (ctx.purpose) points++;

    conversationContext.dataPoints = points;

    // Con los 3 campos obligatorios, ya podemos recomendar
    // (zone es opcional - si no la tiene, busca en todas las zonas)
    return true;
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

  // ⭐ FUNCIÓN AUXILIAR: Analizar qué criterios cumple una propiedad
  function analyzePropertyMatch(property, ctx) {
    const matches = {
      type: false,
      budget: false,
      zone: false,
      beds: false,
      operation: false,
      score: 0
    };

    // Verificar operación
    if (property.operation === ctx.interest ||
        (ctx.interest === 'dias' && property.operation === 'alojar')) {
      matches.operation = true;
      matches.score += 3;
    }

    // Verificar tipo
    if (property.type === ctx.propertyType) {
      matches.type = true;
      matches.score += 3;
    }

    // Verificar presupuesto (con margen del 20%)
    if (ctx.budget && property.price) {
      const maxBudget = ctx.budget * 1.2;
      if (property.price <= maxBudget) {
        matches.budget = true;
        matches.score += 2;
        // Bonus si está muy cerca del presupuesto
        if (property.price <= ctx.budget) {
          matches.score += 1;
        }
      }
    }

    // Verificar zona
    if (ctx.zone && property.neighborhood) {
      const neighborhood = property.neighborhood.toLowerCase();
      const searchZone = ctx.zone.toLowerCase();
      const regex = new RegExp(`\\b${searchZone}\\b|^${searchZone}`, 'i');
      if (regex.test(neighborhood)) {
        matches.zone = true;
        matches.score += 3;
      }
    }

    // Verificar habitaciones
    if (ctx.beds && property.beds) {
      if (property.beds >= ctx.beds) {
        matches.beds = true;
        matches.score += 1;
      }
    }

    return matches;
  }

  // Función auxiliar para obtener recomendaciones SIN filtro de zona (para alternativas)
  function getSmartRecommendationsWithoutZone(ctx) {
    let results = [...properties];

    console.log(`🔍 Búsqueda de alternativas (sin zona): ${results.length} propiedades en inventario`);

    // 1. Filtrar por operación (OBLIGATORIO)
    results = filterByOperation(results, ctx.interest);
    console.log(`📊 Después de filtrar por operación (${ctx.interest}): ${results.length} propiedades`);

    // 2. Filtrar por tipo de propiedad (OBLIGATORIO)
    if (ctx.propertyType) {
      const typeFiltered = results.filter(p => p.type === ctx.propertyType);
      if (typeFiltered.length > 0) {
        results = typeFiltered;
      } else {
        console.warn(`⚠️ No hay ${ctx.propertyType}s disponibles, buscando tipos similares...`);
        // Si no hay del tipo exacto, buscar cualquier tipo pero con penalización en score
      }
    }

    // 3. Filtrar por presupuesto (PREFERIBLE con margen del 30% para alternativas)
    if (ctx.budget) {
      const maxBudget = ctx.budget * 1.3; // Más flexible para alternativas
      const budgetFiltered = results.filter(p => p.price && p.price <= maxBudget);
      if (budgetFiltered.length > 0) {
        results = budgetFiltered;
      } else {
        console.warn(`⚠️ No hay propiedades dentro del presupuesto ampliado`);
        // Si no hay dentro del presupuesto, mostrar las más cercanas
        results.sort((a, b) => Math.abs(a.price - ctx.budget) - Math.abs(b.price - ctx.budget));
      }
    }

    // 4. Analizar qué criterios cumple cada propiedad
    results.forEach(p => {
      p._matchAnalysis = analyzePropertyMatch(p, ctx);
      p._score = p._matchAnalysis.score;
    });

    // 5. Ordenar por score (mayor a menor)
    results.sort((a, b) => b._score - a._score);

    console.log(`✅ Alternativas encontradas: ${Math.min(results.length, 5)} propiedades`);

    return results.slice(0, 5); // Retornar hasta 5 para mostrar más alternativas
  }

  // Función para hacer recomendaciones inteligentes basadas en el perfil
  function getSmartRecommendations() {
    const ctx = conversationContext;
    let results = [...properties];

    console.log(`🔍 Búsqueda iniciada: ${results.length} propiedades en inventario`);

    // 1. Filtrar por operación (OBLIGATORIO)
    results = filterByOperation(results, ctx.interest);
    console.log(`📊 Después de filtrar por operación (${ctx.interest}): ${results.length} propiedades`);

    // 2. Filtrar por tipo de propiedad (OBLIGATORIO)
    if (ctx.propertyType) {
      const typeFiltered = results.filter(p => p.type === ctx.propertyType);
      console.log(`🏠 Después de filtrar por tipo (${ctx.propertyType}): ${typeFiltered.length} propiedades`);

      if (typeFiltered.length > 0) {
        results = typeFiltered;
      } else {
        // No hay propiedades del tipo especificado
        console.warn(`⚠️ No hay ${ctx.propertyType}s disponibles para ${ctx.interest}`);
        return [];
      }
    }

    // 3. Filtrar por presupuesto (OBLIGATORIO) - con margen del 20%
    if (ctx.budget) {
      const maxBudget = ctx.budget * 1.2; // Permitir 20% más
      const budgetFiltered = results.filter(p => p.price && p.price <= maxBudget);
      console.log(`💰 Después de filtrar por presupuesto (hasta ${formatPrice(maxBudget)}): ${budgetFiltered.length} propiedades`);

      if (budgetFiltered.length > 0) {
        results = budgetFiltered;
      } else {
        // No hay propiedades dentro del presupuesto
        console.warn(`⚠️ No hay propiedades dentro del presupuesto de ${formatPrice(ctx.budget)}`);
        // Retornar las 3 más cercanas al presupuesto
        results.sort((a, b) => Math.abs(a.price - ctx.budget) - Math.abs(b.price - ctx.budget));
        return results.slice(0, 3);
      }
    }

    // 4. Filtrar por zona (OPCIONAL) - MEJORADO con coincidencia más estricta
    if (ctx.zone && ctx.zone !== 'otra' && ctx.zone !== 'cualquiera') {
      const zoneFiltered = results.filter(p => {
        if (!p.neighborhood) return false;
        const neighborhood = p.neighborhood.toLowerCase();
        const searchZone = ctx.zone.toLowerCase();

        // ⭐ MEJORA: Coincidencia más flexible pero precisa
        // Buscar la zona como palabra completa o al inicio de la cadena
        const regex = new RegExp(`\\b${searchZone}\\b|^${searchZone}`, 'i');
        return regex.test(neighborhood);
      });

      if (zoneFiltered.length > 0) {
        console.log(`📍 Después de filtrar por zona (${ctx.zone}): ${zoneFiltered.length} propiedades`);
        results = zoneFiltered;
      } else {
        // ⚠️ NO hay propiedades en esa zona - guardar este estado para mostrar mensaje claro
        console.warn(`⚠️ No hay ${ctx.propertyType}s en ${ctx.zone}`);
        conversationContext.noResultsInZone = true;
        conversationContext.requestedZone = ctx.zone;
        saveContext();
        // Retornar vacío para mostrar mensaje personalizado
        return [];
      }
    }

    // 5. Calcular puntuación para cada propiedad
    results.forEach(p => {
      p._score = scoreProperty(p, ctx);
    });

    // 6. Ordenar por puntuación (mayor a menor)
    results.sort((a, b) => b._score - a._score);

    console.log(`✅ Recomendaciones finales: ${Math.min(results.length, 3)} propiedades`);

    // 7. Retornar máximo 3 propiedades
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

      // ⭐ NUEVO: Agregar contador de propiedades seleccionadas
      intro += '<br><br><div id="selected-props-counter" style="display:none;background:#e7f3ff;padding:10px;border-radius:8px;margin:10px 0;font-weight:600;color:#0066cc;"></div>';

      // Agregar opción de contacto con contexto completo
      intro += '<br>💬 <b>Siguiente paso:</b><br>';
      intro += '• Marca las propiedades que te interesan con el checkbox "Me interesa"<br>';
      intro += '• Luego haz clic en el botón de abajo para contactar un asesor con tu selección<br><br>';

      // Crear mensaje de WhatsApp de forma inteligente según cantidad de resultados
      let waText = '';
      const MAX_PROPERTIES_IN_MESSAGE = 3;

      if (results.length <= MAX_PROPERTIES_IN_MESSAGE) {
        // Pocas propiedades: incluir detalles específicos
        waText = `Hola Altorra, me interesan estas propiedades:\n\n`;

        results.forEach((p, i) => {
          const priceStr = p.price ? `$${(p.price/1000000).toFixed(0)}M` : '';
          waText += `${i + 1}. ${p.title}\n`;
          waText += `   ${priceStr} • ${p.beds || 0}H • ${p.baths || 0}B • ${p.sqm || 0}m²\n`;
          if (p.neighborhood) waText += `   Zona: ${p.neighborhood}\n`;
          waText += `\n`;
        });
      } else {
        // Muchas propiedades: solo enviar perfil y cantidad
        waText = `Hola Altorra, estoy buscando propiedades y encontré ${results.length} opciones que me interesan.\n\n`;
      }

      // Agregar contexto de búsqueda resumido (siempre)
      waText += `Mi perfil de búsqueda:\n`;
      const opName = ctx.interest === 'comprar' ? 'Comprar' :
                     ctx.interest === 'arrendar' ? 'Arrendar' : 'Alojamiento';
      waText += `• ${opName} ${ctx.propertyType || 'propiedad'}`;
      if (ctx.zone && ctx.zone !== 'otra') waText += ` en ${ctx.zone}`;
      waText += `\n`;
      if (ctx.purpose) {
        const purposeText = ctx.purpose === 'vivienda' ? 'Para vivir' :
                           ctx.purpose === 'inversion' ? 'Para inversión' : ctx.purpose;
        waText += `• ${purposeText}\n`;
      }
      if (ctx.budget) waText += `• Presupuesto: ${formatPrice(ctx.budget)}\n`;
      if (ctx.beds) waText += `• ${ctx.beds}+ habitaciones\n`;

      if (results.length > MAX_PROPERTIES_IN_MESSAGE) {
        waText += `\nMe gustaría agendar una visita y conocer más detalles de las opciones disponibles.`;
      }

      // ⭐ BOTÓN MEJORADO: Se genera dinámicamente al hacer clic para incluir propiedades seleccionadas
      intro += `
        <br><br>
        <button
          onclick="window.chatbotSendToAdvisor()"
          class="chat-whatsapp-link"
          style="border:none;cursor:pointer;width:100%;text-align:center;">
          <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.789l4.94-1.293A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
          📱 Contactar asesor con mis propiedades de interés
        </button>
      `;
    } else {
      // ⭐ NO HAY RESULTADOS - Mensaje personalizado según el motivo

      const opName = ctx.interest === 'comprar' ? 'Comprar' :
                     ctx.interest === 'arrendar' ? 'Arrendar' : 'Alojamiento';

      // ⭐ NUEVO: Detectar si el problema es la zona específica
      if (ctx.noResultsInZone && ctx.requestedZone) {
        const zoneName = ctx.requestedZone.charAt(0).toUpperCase() + ctx.requestedZone.slice(1);

        // Mensaje claro sobre qué NO tiene
        intro += `😔 <b>Lo siento, no tengo propiedades que coincidan exactamente con tu búsqueda</b><br><br>`;

        intro += `📋 <b>Tu búsqueda original:</b><br>`;
        intro += `• Tipo: ${ctx.propertyType} ✓<br>`;
        intro += `• Zona: ${zoneName} ✗ <i>(no disponible)</i><br>`;
        if (ctx.budget) intro += `• Presupuesto: hasta ${formatPrice(ctx.budget)} ✓<br>`;
        if (ctx.beds) intro += `• Habitaciones: ${ctx.beds}+ ✓<br>`;
        intro += `<br>`;

        // Buscar alternativas en otras zonas (sin filtro de zona)
        const alternativesCtx = { ...ctx };
        delete alternativesCtx.zone;
        const alternativeResults = getSmartRecommendationsWithoutZone(alternativesCtx);

        if (alternativeResults.length > 0) {
          // Mensaje inteligente sobre las alternativas
          intro += `💡 <b>Sin embargo, encontré ${alternativeResults.length} ${ctx.propertyType}${alternativeResults.length > 1 ? 's' : ''} que cumplen con tus otros requisitos:</b><br><br>`;

          // Explicar qué criterios cumplen las alternativas
          const criteriosComunes = [];
          if (ctx.propertyType) criteriosComunes.push('mismo tipo');
          if (ctx.budget) criteriosComunes.push('dentro de tu presupuesto');
          if (ctx.beds) criteriosComunes.push(`${ctx.beds}+ habitaciones`);

          if (criteriosComunes.length > 0) {
            intro += `<i>Estas propiedades cumplen con: ${criteriosComunes.join(', ')}, pero están ubicadas en otras zonas.</i><br><br>`;
          }

          // Mostrar las alternativas con análisis de coincidencias
          alternativeResults.slice(0, 3).forEach(p => {
            intro += createPropertyCard(p);

            // Mostrar qué criterios cumple cada propiedad
            if (p._matchAnalysis) {
              const match = p._matchAnalysis;
              intro += `<div style="font-size:0.75rem;color:#6b7280;margin:-8px 0 12px;padding:0 8px;">`;
              const matchDetails = [];
              if (match.type) matchDetails.push('✓ Tipo');
              if (match.budget) matchDetails.push('✓ Presupuesto');
              if (match.beds) matchDetails.push('✓ Habitaciones');
              if (!match.zone && p.neighborhood) matchDetails.push(`✗ Zona: ${p.neighborhood}`);
              intro += matchDetails.join(' • ');
              intro += `</div>`;
            }
          });

          intro += `<br>💬 <b>¿Qué te gustaría hacer?</b><br>`;
          intro += `• <b>Ver estas opciones</b>: Marca las que te interesen con el checkbox "Me interesa"<br>`;
          intro += `• <b>Recibir notificaciones</b>: Te avisamos cuando haya ${ctx.propertyType}s en ${zoneName}<br>`;
          intro += `• <b>Hablar con un asesor</b>: Te ayudamos a encontrar la propiedad perfecta<br><br>`;

          // Agregar contador de selección
          intro += '<div id="selected-props-counter" style="display:none;background:#e7f3ff;padding:10px;border-radius:8px;margin:10px 0;font-weight:600;color:#0066cc;"></div>';

          // Botón de WhatsApp
          intro += `
            <button
              onclick="window.chatbotSendToAdvisor()"
              class="chat-whatsapp-link"
              style="border:none;cursor:pointer;width:100%;text-align:center;">
              <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.789l4.94-1.293A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
              📱 Contactar asesor con mis propiedades de interés
            </button>
          `;
        } else {
          // No hay alternativas en absoluto
          intro += '📋 <b>Lamentablemente no tenemos opciones similares disponibles en este momento.</b><br><br>';

          intro += '💡 <b>¿Qué puedes hacer?</b><br>';
          intro += `• <b>Hablar con un asesor</b>: Te avisamos cuando tengamos ${ctx.propertyType}s en ${zoneName}<br>`;
          intro += '• <b>Explorar otras zonas</b>: Podemos buscar en zonas cercanas<br>';
          intro += '• <b>Ajustar criterios</b>: Considera otros tipos de propiedad o presupuestos<br><br>';

          // Botón de WhatsApp con perfil
          let waText = `Hola Altorra, estoy buscando ${ctx.propertyType} en ${zoneName}`;
          if (ctx.budget) waText += ` hasta ${formatPrice(ctx.budget)}`;
          waText += `. No encontré opciones en el sitio. ¿Podrían ayudarme?`;
          const waSummary = encodeURIComponent(waText);

          intro += `
            <a href="https://wa.me/${CONFIG.whatsappNumber}?text=${waSummary}"
               target="_blank"
               rel="noopener"
               class="chat-whatsapp-link">
              <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.789l4.94-1.293A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
              📱 Contactar asesor
            </a>
          `;
        }

        // Limpiar flags
        ctx.noResultsInZone = false;
        ctx.requestedZone = null;
        saveContext();

      } else {
        // Mensaje genérico sin resultados
        intro += '😔 <b>Lo siento</b>, actualmente no tenemos propiedades disponibles que coincidan exactamente con tu búsqueda.<br><br>';

        intro += '📋 <b>Tu perfil de búsqueda:</b><br>';
        intro += `• ${opName} ${ctx.propertyType || 'propiedad'}`;
        if (ctx.zone && ctx.zone !== 'otra' && ctx.zone !== 'cualquiera') intro += ` en ${ctx.zone}`;
        intro += `<br>`;
        if (ctx.budget) intro += `• Presupuesto: ${formatPrice(ctx.budget)}<br>`;
        if (ctx.beds) intro += `• ${ctx.beds}+ habitaciones<br>`;

        intro += '<br>💡 <b>¿Qué puedes hacer?</b><br>';
        intro += '• <b>Hablar con un asesor</b>: Te ayudaremos a encontrar opciones personalizadas<br>';
        intro += '• <b>Recibir notificaciones</b>: Te avisamos cuando lleguen propiedades que coincidan<br>';
        intro += '• <b>Ajustar criterios</b>: Podemos explorar otras zonas o presupuestos<br><br>';
      }

      // Crear mensaje de WhatsApp con el perfil completo
      let waText = `Hola Altorra, estoy buscando una propiedad pero no encontré opciones en el sitio web.\n\n`;
      waText += `Mi perfil de búsqueda:\n`;
      waText += `• ${opName} ${ctx.propertyType || 'propiedad'}`;
      if (ctx.zone && ctx.zone !== 'otra' && ctx.zone !== 'cualquiera') waText += ` en ${ctx.zone}`;
      waText += `\n`;
      if (ctx.budget) waText += `• Presupuesto: ${formatPrice(ctx.budget)}\n`;
      if (ctx.beds) waText += `• ${ctx.beds}+ habitaciones\n`;
      if (ctx.purpose) {
        const purposeText = ctx.purpose === 'vivienda' ? 'Para vivir' :
                           ctx.purpose === 'inversion' ? 'Para inversión' : ctx.purpose;
        waText += `• ${purposeText}\n`;
      }
      waText += `\n¿Podrían ayudarme a encontrar opciones que se ajusten a mi perfil o avisarme cuando haya nuevas propiedades disponibles?`;

      const waSummary = encodeURIComponent(waText);

      intro += `
        <a href="https://wa.me/${CONFIG.whatsappNumber}?text=${waSummary}"
           target="_blank"
           rel="noopener"
           class="chat-whatsapp-link">
          <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.789l4.94-1.293A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
          📱 Contactar asesor con mi perfil
        </a>
      `;
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
    alojamiento: '🌴 <b>Alojamientos por Días</b><br><br>Contamos con propiedades amobladas en las mejores zonas turísticas de Cartagena para estadías cortas.<br><br>Cada propiedad tiene diferentes características y amenidades. Un asesor te brindará información detallada según tus necesidades.<br><br>👉 <a href="propiedades-alojamientos.html" style="color:#d4af37;font-weight:600;">Ver alojamientos disponibles</a><br><br>¿Cuántas personas serán y qué fechas tienes en mente?',
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
    if (criteria.stayDates) {
      conversationContext.stayDates = criteria.stayDates;
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

  // ============================================
  // DETECCIÓN DE INTENCIÓN NUEVA vs RESPUESTA A SLOT
  // ============================================

  // Detectar si el mensaje parece una respuesta corta a un slot (dato puntual)
  function isSlotResponse(msg) {
    const text = msg.toLowerCase().trim();
    const len = text.length;

    // ⚠️ CRÍTICO: Nunca clasificar agradecimientos/despedidas como slot response
    // Esto previene bucles cuando el usuario escribe "gracias" en medio de un flujo
    if (matchesSynonym(text, 'thanks') || matchesSynonym(text, 'goodbye')) {
      return false;
    }

    // Mensajes muy cortos son probablemente respuestas a slots
    // PERO no si son comandos globales
    if (len <= 3 && !matchesSynonym(text, 'back')) return true;

    // Solo números (ej: "3", "200", "1800000")
    if (/^\d+$/.test(text)) return true;

    // Confirmaciones simples - usando diccionario de sinónimos
    if (len < 20 && (matchesSynonym(text, 'yes') || matchesSynonym(text, 'no'))) {
      // Pero solo si no parece un comando de navegación
      if (!matchesSynonym(text, 'back') && !matchesSynonym(text, 'contact')) {
        return true;
      }
    }

    // Formato de presupuesto/dinero sin contexto adicional
    if (/^\$?\s*[\d\.,]+\s*(m|millones?|mil)?$/i.test(text)) return true;
    if (/^[\d\.,]+\s*(millon|millones|millón)$/i.test(text)) return true;

    // Números con unidades simples (habitaciones, baños, personas, metros)
    if (/^\d+\s*(habitacion|habitaciones|cuartos?|alcobas?|ba[ñn]os?|personas?|m2|metros?)$/i.test(text)) return true;

    // Respuestas de opciones típicas del flujo - usando diccionario de sinónimos
    if (len < 20 && (matchesSynonym(text, 'apartment') || matchesSynonym(text, 'house') ||
        matchesSynonym(text, 'lot') || matchesSynonym(text, 'office'))) return true;
    if (/^(vivienda|inversi[oó]n|trabajo|negocio)$/i.test(text)) return true;
    if (/^(solo|pareja|familia)$/i.test(text)) return true;
    if (/^(urgente|flexible|sin prisa)$/i.test(text)) return true;

    // Zonas simples sin contexto - usando diccionario de sinónimos
    if (len < 25 && (matchesSynonym(text, 'bocagrande') || matchesSynonym(text, 'manga') ||
        matchesSynonym(text, 'centro'))) return true;
    if (/^(crespo|pie de la popa|castillogrande|serena|parque heredia)$/i.test(text)) return true;

    // Fechas simples
    if (/^(del \d+ al \d+|esta semana|pr[oó]xima semana|\d+ d[ií]as?)$/i.test(text)) return true;

    // ⚠️ CRÍTICO: Antes de clasificar mensajes cortos como slot response,
    // verificar que NO sean intenciones globales (gracias, hola, adiós, comandos)
    if (len < 25 && !/quiero|busco|necesito|te dije|me interesa|pregunt|cu[aá]l|c[oó]mo|qu[eé]|horario/i.test(text)) {
      // Excluir mensajes que claramente no son respuestas
      if (matchesSynonym(text, 'greeting')) return false;
      if (matchesSynonym(text, 'thanks')) return false;
      if (matchesSynonym(text, 'goodbye')) return false;
      if (matchesSynonym(text, 'back')) return false;
      if (matchesSynonym(text, 'contact')) return false;

      return true;
    }

    return false;
  }

  // Detectar si el mensaje es una nueva intención global que debe interrumpir el flujo actual
  function isNewGlobalIntent(msg) {
    const text = msg.toLowerCase().trim();

    // ⚠️ CRÍTICO: Agradecimientos y despedidas siempre son intenciones globales
    // Esto previene que se procesen como respuestas de slot
    if (matchesSynonym(text, 'thanks')) {
      return true;
    }

    if (matchesSynonym(text, 'goodbye')) {
      return true;
    }

    // Frases de corrección o insistencia (el usuario quiere cambiar el tema)
    if (/te dije que|ya te dije|pero quiero|no[,\s]+quiero|en realidad quiero|mejor quiero|prefiero|cambi[eé] de opini[oó]n/i.test(text)) {
      return true;
    }

    // Comandos de navegación/cancelación
    if (matchesSynonym(text, 'back')) {
      return true;
    }
    if (/cancelar|salir|terminar|no quiero (seguir|continuar)|volver.*inicio|men[uú].*principal/i.test(text)) {
      return true;
    }

    // Solicitudes de contacto con asesor (usando diccionario de sinónimos)
    if (matchesSynonym(text, 'contact')) {
      return true;
    }

    // Opciones de ajuste de búsqueda que el usuario puede escribir
    if (/ampliar.*presupuesto|explorar otras zonas|ajustar.*criterios|ver todas/i.test(text)) {
      return true;
    }

    // Cambios explícitos de operación/modo (usando diccionario de sinónimos)
    // MEJORA: Detectar cambios incluso sin verbos de intención si el mensaje es corto y claro
    const len = text.length;

    // Detectar cambio a comprar - con o sin verbos de intención
    // MEJORADO: Más flexible, acepta frases sin verbos explícitos
    if (matchesSynonym(text, 'buy')) {
      // Si tiene verbo de intención O es mensaje corto/directo O tiene contexto implícito
      if (/quiero|busco|necesito|me interesa|deseo|prefiero|opto por|mejor/i.test(text) || len < 40) {
        return true;
      }
    }

    // Detectar cambio a arrendar - con o sin verbos de intención
    // MEJORADO: Incluye más sinónimos y es más flexible
    if (matchesSynonym(text, 'rent')) {
      // Incluye variaciones: alquilar, rentar, renta, arriendo, arrendar
      if (/quiero|busco|necesito|me interesa|deseo|prefiero|opto por|mejor/i.test(text) || len < 40) {
        return true;
      }
    }

    // Detectar cambio a alojamiento - con o sin verbos de intención
    // MEJORADO: Más flexible para captar "quiero alojamientos", "alojamiento", etc.
    if (matchesSynonym(text, 'stay')) {
      // Incluye variaciones: alojamiento, alojamientos, hospedaje, hotel, vacaciones, días
      if (/quiero|busco|necesito|me interesa|deseo|prefiero|opto por|mejor/i.test(text) || len < 40) {
        return true;
      }
    }

    // Detectar cambio a propietario
    if (matchesSynonym(text, 'owner')) {
      if (/quiero|busco|necesito|tengo/i.test(text) || len < 30) {
        return true;
      }
    }
    // Comando directo de operación
    if (/^(comprar|arrendar|alquilar|alojamiento|hospedaje|por dias|por días)$/i.test(text)) {
      return true;
    }

    // Intenciones de propietario (siempre son globales)
    if (matchesSynonym(text, 'owner')) {
      return true;
    }

    // Preguntas generales sobre la empresa/servicios
    if (/\?/.test(text) || /^(cu[aá]l|c[oó]mo|qu[eé]|d[oó]nde|cu[aá]ndo|cu[aá]nto)/i.test(text)) {
      // Verificar si es pregunta de servicio, no de slot
      if (/horario|atienden|abierto|proceso|requisito|documento|contacto|tel[eé]fono|whatsapp|direcci[oó]n|servicio|cobran|honorario|comisi[oó]n/i.test(text)) {
        return true;
      }
    }

    // Saludos (usando diccionario de sinónimos)
    if (matchesSynonym(text, 'greeting') && text.length < 30) {
      return true;
    }

    // Peticiones de ayuda general
    if (/^(ayuda|help|men[uú]|opciones|qu[eé] puedes hacer)\b/i.test(text)) {
      return true;
    }

    // Mensajes largos con múltiples criterios (probablemente nueva búsqueda)
    if (text.length > 50 && /quiero|busco|necesito|me interesa/i.test(text)) {
      return true;
    }

    return false;
  }

  // Función de "slot filling" - usa la última pregunta del bot para interpretar respuestas
  function applyAnswerToLastQuestion(msg, criteria) {
    const last = conversationContext.lastQuestion;
    if (!last) return;

    const text = msg.toLowerCase().trim();

    // MEJORA: Detectar respuestas ambiguas o que indican que el usuario no sabe/no importa
    const isAmbiguous = /^(no s[eé]|no estoy seguro|no tengo claro|no lo s[eé]|no me acuerdo|no recuerdo|ninguna|cualquiera|no importa|me da igual|lo que sea|todas?|todos?|sin preferencia)$/i.test(text);
    const isSkipRequest = /^(saltar|pasar|omitir|siguiente|despu[eé]s lo digo|no tengo preferencia)$/i.test(text);

    if (isAmbiguous || isSkipRequest) {
      // El usuario no puede/quiere responder - saltar este campo y continuar
      conversationContext.lastQuestion = null;
      saveContext();
      return true; // Indicar que se procesó (aunque no se guardó valor)
    }

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

    // Tipo de propiedad - usando diccionario de sinónimos
    if (last === 'propertyType' && !conversationContext.propertyType) {
      if (matchesSynonym(text, 'apartment')) conversationContext.propertyType = 'apartamento';
      else if (matchesSynonym(text, 'house')) conversationContext.propertyType = 'casa';
      else if (matchesSynonym(text, 'lot')) conversationContext.propertyType = 'lote';
      else if (matchesSynonym(text, 'office')) conversationContext.propertyType = 'oficina';
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

    // PROPIETARIOS - PREGUNTAS GENERALES
    if (/soy propietario|tengo una propiedad|tengo un inmueble|mi inmueble|mi apartamento|mi casa/.test(text)) {
      if (/vender mi|poner en venta|quiero vender|venta de mi/.test(text)) return RESPONSES.propietarioVenta;
      if (/arrendar mi|administrar mi|poner en arriendo|arriendo de mi/.test(text)) return RESPONSES.propietarioArriendos;
      return RESPONSES.propietarioGeneral;
    }

    // HONORARIOS ADMINISTRACIÓN ARRIENDOS
    if (/administraci[oó]n.*(arriendo|inmueble|apartamento|casa)|cu[aá]nto cobran.*administrar|porcentaje.*administraci[oó]n|honorarios.*administraci[oó]n/.test(text)) {
      const adm = SITE_KNOWLEDGE.servicioAdministracion;
      let html = `🔑 <b>Servicio de Administración de Arriendos</b><br><br>`;
      html += `<b>Honorarios:</b> ${adm.honorarios}<br><br>`;
      html += `<b>Incluye:</b><br>`;
      adm.beneficios.forEach(b => {
        html += `• ${b}<br>`;
      });
      html += `<br>Si deseas, puedo tomar unos datos básicos de tu inmueble o te conecto directo con un asesor.`;
      return html;
    }

    // HONORARIOS VENTA
    if (/honorarios.*venta|porcentaje.*venta|cu[aá]nto cobran.*vender|cobran.*comisi[oó]n.*venta/.test(text)) {
      const venta = SITE_KNOWLEDGE.servicioVenta;
      let html = `🏡 <b>Servicio de Venta de Inmuebles</b><br><br>`;
      html += `<b>Honorarios:</b> ${venta.honorarios}<br><br>`;
      html += `<b>Te ofrecemos:</b><br>`;
      venta.beneficios.forEach(b => {
        html += `• ${b}<br>`;
      });
      html += `<br><b>Información que solemos solicitar:</b><br>`;
      venta.infoRequerida.forEach(i => {
        html += `• ${i}<br>`;
      });
      html += `<br>¿Te gustaría que te asesoremos en la venta de tu inmueble?`;
      return html;
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

  // ============================================
  // DETECCIÓN Y FLUJO DE PROPIETARIOS
  // ============================================

  // Detectar si el usuario es propietario (ALTA PRIORIDAD)
  function detectOwnerIntent(msg) {
    const text = msg.toLowerCase();

    // Patrones de propietario que quiere VENDER
    const sellPatterns = [
      /quiero vender mi (propiedad|apartamento|casa|inmueble|lote|oficina)/,
      /vender mi (propiedad|apartamento|casa|inmueble)/,
      /poner en venta mi (propiedad|apartamento|casa|inmueble)/,
      /tengo (una?|un) (propiedad|apartamento|casa|inmueble|lote) para vender/,
      /tengo (una?|un) (propiedad|apartamento|casa|inmueble) (que|y) quiero vender/,
      /necesito vender mi (propiedad|apartamento|casa|inmueble)/,
      /quiero consignar mi (propiedad|apartamento|casa|inmueble) para venta/,
      // Frases cortas tipo "quiero vender"
      /^quiero vender$/,
      /quiero vender\b/,
      /vender una (propiedad|casa|apartamento|oficina|lote)/,
      /vender un (inmueble|apartamento|lote|local)/
    ];

    // Patrones de propietario que quiere ARRENDAR/ADMINISTRAR
    const rentPatterns = [
      /quiero arrendar mi (propiedad|apartamento|casa|inmueble)/,
      /arrendar mi (propiedad|apartamento|casa|inmueble)/,
      /poner en arriendo mi (propiedad|apartamento|casa|inmueble)/,
      /tengo (una?|un) (propiedad|apartamento|casa|inmueble) para arrendar/,
      /tengo (una?|un) (propiedad|apartamento|casa|inmueble) para arriendo/,
      /quiero que administren mi (propiedad|apartamento|casa|inmueble)/,
      /necesito administrar mi (propiedad|apartamento|casa|inmueble)/,
      /busco administraci[oó]n para mi (propiedad|apartamento|casa|inmueble)/
    ];

    // Patrones generales de propietario (sin especificar venta/arriendo)
    const generalOwnerPatterns = [
      /soy propietario/,
      /tengo (una?|un) (propiedad|apartamento|casa|inmueble|lote)/,
      /mi (propiedad|apartamento|casa|inmueble)/
    ];

    // Verificar patrones de venta (más específicos primero)
    for (const pattern of sellPatterns) {
      if (pattern.test(text)) {
        return 'propietario_venta';
      }
    }

    // Verificar patrones de arriendo
    for (const pattern of rentPatterns) {
      if (pattern.test(text)) {
        return 'propietario_arriendo';
      }
    }

    // Verificar patrones generales + contexto
    for (const pattern of generalOwnerPatterns) {
      if (pattern.test(text)) {
        // Si menciona "vender" o "venta" en el mismo mensaje
        if (/vender|venta/.test(text)) {
          return 'propietario_venta';
        }
        // Si menciona "arrendar", "arriendo" o "administrar"
        if (/arrendar|arriendo|administrar|administraci[oó]n/.test(text)) {
          return 'propietario_arriendo';
        }
        // Propietario sin especificar
        return 'propietario_general';
      }
    }

    return null;
  }

  // Preguntas para propietario que quiere VENDER
  const OWNER_SALE_QUESTIONS = [
    { field: 'type', question: '¿Qué tipo de inmueble deseas vender?', options: ['Apartamento', 'Casa', 'Lote', 'Oficina', 'Local', 'Otro'] },
    { field: 'zone', question: '¿En qué zona o barrio está ubicado?' },
    { field: 'price', question: '¿Cuál es el valor aproximado de venta?' },
    { field: 'sqm', question: '¿Cuál es el área en metros cuadrados (m²)?' },
    { field: 'beds', question: '¿Cuántas habitaciones tiene?' },
    { field: 'baths', question: '¿Cuántos baños tiene?' },
    { field: 'parking', question: '¿Tiene parqueadero?', options: ['Sí', 'No'] },
    { field: 'condition', question: '¿En qué estado se encuentra?', options: ['Nuevo', 'Usado buen estado', 'Para remodelar'] }
  ];

  // Preguntas para propietario que quiere ARRENDAR
  const OWNER_RENT_QUESTIONS = [
    { field: 'type', question: '¿Qué tipo de inmueble deseas arrendar?', options: ['Apartamento', 'Casa', 'Oficina', 'Local', 'Otro'] },
    { field: 'zone', question: '¿En qué zona o barrio está ubicado?' },
    { field: 'canon', question: '¿Cuál es el canon mensual deseado? (incluye administración)' },
    { field: 'beds', question: '¿Cuántas habitaciones tiene?' },
    { field: 'furnished', question: '¿Está amoblado?', options: ['Sí', 'No', 'Parcialmente'] },
    { field: 'pets', question: '¿Se permiten mascotas?', options: ['Sí', 'No'] },
    { field: 'availableFrom', question: '¿Desde cuándo estaría disponible?' }
  ];

  // Obtener siguiente pregunta para propietario
  function getNextOwnerQuestion(role) {
    const questions = role === 'propietario_venta' ? OWNER_SALE_QUESTIONS : OWNER_RENT_QUESTIONS;
    const data = role === 'propietario_venta' ? conversationContext.ownerPropertyForSale : conversationContext.ownerPropertyForRent;

    for (const q of questions) {
      if (!data[q.field]) {
        return q;
      }
    }
    return null; // Todas las preguntas respondidas
  }

  // Generar resumen del inmueble para WhatsApp
  function generateOwnerSummary(role) {
    let summary = '';

    if (role === 'propietario_venta') {
      const d = conversationContext.ownerPropertyForSale;
      summary = `Hola Altorra, soy propietario y quiero VENDER mi inmueble:\n\n` +
        `📋 DATOS DEL INMUEBLE:\n` +
        `• Tipo: ${d.type || 'No especificado'}\n` +
        `• Zona: ${d.zone || 'No especificada'}\n` +
        `• Valor: ${d.price ? formatPrice(d.price) : 'No especificado'}\n` +
        `• Área: ${d.sqm ? d.sqm + ' m²' : 'No especificada'}\n` +
        `• Habitaciones: ${d.beds || 'No especificado'}\n` +
        `• Baños: ${d.baths || 'No especificado'}\n` +
        `• Parqueadero: ${d.parking || 'No especificado'}\n` +
        `• Estado: ${d.condition || 'No especificado'}`;
    } else {
      const d = conversationContext.ownerPropertyForRent;
      summary = `Hola Altorra, soy propietario y quiero ARRENDAR mi inmueble:\n\n` +
        `📋 DATOS DEL INMUEBLE:\n` +
        `• Tipo: ${d.type || 'No especificado'}\n` +
        `• Zona: ${d.zone || 'No especificada'}\n` +
        `• Canon deseado: ${d.canon ? formatPrice(d.canon) : 'No especificado'}\n` +
        `• Habitaciones: ${d.beds || 'No especificado'}\n` +
        `• Amoblado: ${d.furnished || 'No especificado'}\n` +
        `• Mascotas: ${d.pets || 'No especificado'}\n` +
        `• Disponible desde: ${d.availableFrom || 'No especificado'}`;
    }

    // Agregar transcripción de la conversación
    const transcript = generateConversationTranscript();
    if (transcript) {
      summary += `\n\n${transcript}`;
    }

    return summary;
  }

  // Manejar flujo de propietario
  function handleOwnerFlow(role, isFirstInteraction = false) {
    let response = '';

    // Saludo inicial si es la primera interacción
    if (!conversationContext.hasGreetedUser) {
      response += '¡Hola! Soy <b>Altorra IA</b>, tu asistente virtual. 👋<br><br>';
      conversationContext.hasGreetedUser = true;
    }

    // Explicación del servicio según el tipo
    if (isFirstInteraction) {
      if (role === 'propietario_venta') {
        response += `🏡 <b>Servicio de Venta de Inmuebles</b><br><br>`;
        response += `Excelente decisión. En ALTORRA te ayudamos a vender tu propiedad de forma rápida y segura.<br><br>`;
        response += `<b>Te ofrecemos:</b><br>`;
        response += `✅ Marketing digital en portales, redes y Google Ads<br>`;
        response += `✅ Gestión de visitas y negociación<br>`;
        response += `✅ Respaldo jurídico y notarial completo<br><br>`;
        response += `<b>Honorarios:</b> 3% sobre valor de venta (urbano) / 10% (rural)<br><br>`;
        response += `Para darte una mejor asesoría, necesito algunos datos de tu inmueble.<br><br>`;
      } else if (role === 'propietario_arriendo') {
        response += `🔑 <b>Servicio de Administración y Arriendo</b><br><br>`;
        response += `Perfecto. En ALTORRA administramos tu propiedad de forma profesional y sin complicaciones.<br><br>`;
        response += `<b>Te ofrecemos:</b><br>`;
        response += `✅ Publicidad profesional en portales y redes<br>`;
        response += `✅ Selección rigurosa de arrendatarios<br>`;
        response += `✅ Contratos con respaldo legal<br>`;
        response += `✅ Administración de pagos y cobros<br>`;
        response += `✅ Inspecciones periódicas<br>`;
        response += `🔐 Opción de póliza de arrendamiento<br><br>`;
        response += `<b>Honorarios:</b> 10% + IVA sobre el canon integral<br><br>`;
        response += `Para darte una mejor asesoría, necesito algunos datos de tu inmueble.<br><br>`;
      }
    }

    // Obtener siguiente pregunta
    const nextQ = getNextOwnerQuestion(role);

    if (nextQ) {
      response += `<b>${nextQ.question}</b>`;
      conversationContext.lastQuestion = nextQ.field;

      // Si tiene opciones, mostrarlas como botones
      if (nextQ.options) {
        const options = nextQ.options.map(opt => ({
          text: opt,
          action: `owner_set_${nextQ.field}_${opt.toLowerCase().replace(/\s+/g, '_')}`
        }));
        botReply(response, options);
      } else {
        botReply(response);
      }
    } else {
      // Todas las preguntas respondidas - generar resumen
      const summary = generateOwnerSummary(role);
      const waLink = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(summary)}`;

      response += `✅ <b>¡Perfecto!</b> Ya tengo toda la información de tu inmueble.<br><br>`;
      response += `<b>Resumen:</b><br>`;

      if (role === 'propietario_venta') {
        const d = conversationContext.ownerPropertyForSale;
        const parking = (d.parking || '').toLowerCase();
        response += `• ${d.type} en ${d.zone}<br>`;
        response += `• ${d.beds} hab, ${d.baths} baños, ${d.sqm} m²<br>`;
        response += `• Valor: ${formatPrice(d.price)}<br>`;
        response += `• ${parking.startsWith('s') ? 'Con' : 'Sin'} parqueadero, ${d.condition || ''}<br><br>`;
      } else {
        const d = conversationContext.ownerPropertyForRent;
        const furn = (d.furnished || '').toLowerCase();
        const pets = (d.pets || '').toLowerCase();
        response += `• ${d.type} en ${d.zone}<br>`;
        response += `• ${d.beds} hab, Canon: ${formatPrice(d.canon)}<br>`;
        response += `• ${furn.startsWith('s') ? 'Amoblado' : 'Sin amoblar'}, Mascotas: ${pets.startsWith('s') ? 'Sí' : 'No'}<br><br>`;
      }

      response += `Un asesor te contactará pronto. También puedes escribirnos directamente:<br><br>`;
      response += `<a href="${waLink}" target="_blank" rel="noopener" class="chat-whatsapp-link">`;
      response += `<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.789l4.94-1.293A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>`;
      response += `Contactar asesor con mi información</a>`;

      botReply(response);
      conversationContext.consultationPhase = 'closing';
    }

    saveContext();
  }

  // Aplicar respuesta del propietario a la última pregunta
  function applyOwnerAnswer(msg) {
    const role = conversationContext.role;
    if (!role || !role.startsWith('propietario_')) return false;

    const last = conversationContext.lastQuestion;
    if (!last) return false;

    const data = role === 'propietario_venta' ? conversationContext.ownerPropertyForSale : conversationContext.ownerPropertyForRent;
    const text = msg.toLowerCase().trim();

    // MEJORA: Detectar respuestas ambiguas o que indican que el usuario no sabe/no importa
    const isAmbiguous = /^(no s[eé]|no estoy seguro|no tengo claro|no lo s[eé]|no me acuerdo|no recuerdo|ninguna|cualquiera|no importa|me da igual|lo que sea|todas?|todos?)$/i.test(text);
    const isSkipRequest = /^(saltar|pasar|omitir|siguiente|despu[eé]s lo digo)$/i.test(text);

    if (isAmbiguous || isSkipRequest) {
      // El usuario no puede/quiere responder - saltar este campo y continuar
      conversationContext.lastQuestion = null;
      saveContext();
      return true; // Indicar que se procesó (aunque no se guardó valor)
    }

    // Intentar parsear la respuesta según el campo
    switch (last) {
      case 'type':
        // Usar diccionario de sinónimos para detectar tipo de propiedad
        if (matchesSynonym(text, 'apartment')) data.type = 'Apartamento';
        else if (matchesSynonym(text, 'house')) data.type = 'Casa';
        else if (matchesSynonym(text, 'lot')) data.type = 'Lote';
        else if (matchesSynonym(text, 'office')) data.type = 'Oficina';
        else if (/local/.test(text)) data.type = 'Local';
        else data.type = msg;
        break;
      case 'zone':
        data.zone = msg;
        break;
      case 'price':
      case 'canon':
        const parsed = parseBudget(msg);
        if (parsed) data[last] = parsed;
        else data[last] = msg;
        break;
      case 'sqm':
        const sqmMatch = msg.match(/(\d+)/);
        data.sqm = sqmMatch ? parseInt(sqmMatch[1]) : msg;
        break;
      case 'beds':
      case 'baths':
        const numMatch = msg.match(/(\d+)/);
        if (numMatch) data[last] = parseInt(numMatch[1]);
        else if (WORD_NUMBERS[text]) data[last] = WORD_NUMBERS[text];
        else data[last] = msg;
        break;
      case 'parking':
      case 'furnished':
      case 'pets':
        // Usar diccionario de sinónimos para yes/no
        if (matchesSynonym(text, 'yes') || /tiene|con/.test(text)) data[last] = 'Sí';
        else if (matchesSynonym(text, 'no') || /sin/.test(text)) data[last] = 'No';
        else data[last] = msg;
        break;
      case 'condition':
        if (/nuevo/.test(text)) data.condition = 'Nuevo';
        else if (/usado|buen/.test(text)) data.condition = 'Usado buen estado';
        else if (/remodelar|arreglar/.test(text)) data.condition = 'Para remodelar';
        else data.condition = msg;
        break;
      case 'availableFrom':
        data.availableFrom = msg;
        break;
      default:
        return false;
    }

    conversationContext.lastQuestion = null;
    saveContext();
    return true;
  }

  // Opciones rápidas iniciales
  const QUICK_OPTIONS = [
    { text: 'Quiero comprar', action: 'comprar' },
    { text: 'Busco arriendo', action: 'arrendar' },
    { text: 'Alojamiento por días', action: 'alojamiento' },
    { text: 'Soy propietario', action: 'propietario' }
  ];

  // Opciones para propietarios - conectan directo al flujo de consultoría
  const PROPIETARIO_OPTIONS = [
    { text: 'Quiero vender mi propiedad', action: 'owner_set_venta' },
    { text: 'Quiero arrendar mi propiedad', action: 'owner_set_arriendo' },
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

    // Guardar en historial (texto limpio sin HTML)
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (cleanText) {
      conversationHistory.push({
        sender: isBot ? 'Bot' : 'Usuario',
        message: cleanText,
        timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      });
    }

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

  // ⭐ NUEVA FUNCIONALIDAD: Gestión de propiedades de interés
  const selectedProperties = [];

  function togglePropertyInterest(propId, propData) {
    const index = selectedProperties.findIndex(p => p.id === propId);
    const checkbox = document.querySelector(`input[data-prop-id="${propId}"]`);

    if (index > -1) {
      // Ya está seleccionada - remover
      selectedProperties.splice(index, 1);
      if (checkbox) checkbox.checked = false;
    } else {
      // No está seleccionada - agregar
      selectedProperties.push({
        id: propId,
        title: propData.title,
        price: propData.price,
        neighborhood: propData.neighborhood,
        beds: propData.beds,
        baths: propData.baths,
        sqm: propData.sqm,
        operation: propData.operation
      });
      if (checkbox) checkbox.checked = true;
    }

    // Actualizar contador si existe
    updateSelectedCounter();
  }

  function updateSelectedCounter() {
    const counter = document.getElementById('selected-props-counter');
    if (counter) {
      if (selectedProperties.length > 0) {
        counter.textContent = `${selectedProperties.length} ${selectedProperties.length === 1 ? 'propiedad seleccionada' : 'propiedades seleccionadas'}`;
        counter.style.display = 'block';
      } else {
        counter.style.display = 'none';
      }
    }
  }

  function isPropertySelected(propId) {
    return selectedProperties.some(p => p.id === propId);
  }

  // Crear tarjeta de propiedad ⭐ MEJORADA con checkbox de interés
  function createPropertyCard(prop) {
    const imgSrc = prop.image || (Array.isArray(prop.images) && prop.images[0]) || '';
    const priceText = formatPrice(prop.price) + ' COP';
    const specs = [];
    if (prop.beds) specs.push(prop.beds + 'H');
    if (prop.baths) specs.push(prop.baths + 'B');
    if (prop.sqm) specs.push(prop.sqm + ' m²');

    const isSelected = isPropertySelected(prop.id);

    return `
      <div class="chat-property-card">
        <div class="property-interest-toggle">
          <input
            type="checkbox"
            id="prop-${prop.id}"
            data-prop-id="${prop.id}"
            ${isSelected ? 'checked' : ''}
            onchange="window.chatbotToggleInterest('${prop.id}', ${JSON.stringify(prop).replace(/"/g, '&quot;')})"
          />
          <label for="prop-${prop.id}">Me interesa</label>
        </div>
        <div class="card-clickable" onclick="window.location.href='detalle-propiedad.html?id=${prop.id}'">
          <img src="${imgSrc}" alt="${prop.title}" onerror="this.src='https://i.postimg.cc/0yYb8Y6r/placeholder.png'">
          <div class="card-body">
            <h4>${prop.title}</h4>
            <div class="price">${priceText}</div>
            <div class="specs">${specs.join(' · ')}</div>
          </div>
        </div>
      </div>
    `;
  }

  // Exponer función globalmente para que los checkboxes puedan llamarla
  window.chatbotToggleInterest = function(propId, propData) {
    togglePropertyInterest(propId, propData);
  };

  // ⭐ NUEVA FUNCIÓN: Enviar propiedades seleccionadas al asesor por WhatsApp
  window.chatbotSendToAdvisor = function() {
    const ctx = conversationContext;
    const opName = ctx.interest === 'comprar' ? 'Comprar' :
                   ctx.interest === 'arrendar' ? 'Arrendar' : 'Alojamiento';

    let waText = `Hola Altorra, me interesan las siguientes propiedades:\n\n`;

    // Si el usuario seleccionó propiedades específicas, incluirlas
    if (selectedProperties.length > 0) {
      waText += `📋 *PROPIEDADES SELECCIONADAS (${selectedProperties.length}):*\n\n`;

      selectedProperties.forEach((p, i) => {
        const priceStr = p.price ? `$${(p.price/1000000).toFixed(0)}M` : '';
        waText += `${i + 1}. *${p.title}*\n`;
        waText += `   💰 ${priceStr}`;
        if (p.beds || p.baths || p.sqm) {
          waText += ` • `;
          const specs = [];
          if (p.beds) specs.push(`${p.beds}H`);
          if (p.baths) specs.push(`${p.baths}B`);
          if (p.sqm) specs.push(`${p.sqm}m²`);
          waText += specs.join(' • ');
        }
        waText += `\n`;
        if (p.neighborhood) waText += `   📍 ${p.neighborhood}\n`;
        waText += `\n`;
      });

      waText += `\n`;
    } else {
      // Si no seleccionó ninguna, enviar perfil general
      waText += `Estoy buscando propiedades con las siguientes características:\n\n`;
    }

    // Agregar contexto de búsqueda
    waText += `🔍 *MI PERFIL DE BÚSQUEDA:*\n`;
    waText += `• ${opName} ${ctx.propertyType || 'propiedad'}`;
    if (ctx.zone && ctx.zone !== 'otra' && ctx.zone !== 'cualquiera') waText += ` en ${ctx.zone}`;
    waText += `\n`;
    if (ctx.budget) waText += `• Presupuesto: hasta ${formatPrice(ctx.budget)}\n`;
    if (ctx.beds) waText += `• ${ctx.beds}+ habitaciones\n`;
    if (ctx.purpose) {
      const purposeText = ctx.purpose === 'vivienda' ? 'Para vivir' :
                         ctx.purpose === 'inversion' ? 'Para inversión' : ctx.purpose;
      waText += `• ${purposeText}\n`;
    }

    if (selectedProperties.length > 0) {
      waText += `\n¿Podríamos agendar una visita a las propiedades seleccionadas?`;
    } else {
      waText += `\n¿Podrían ayudarme a encontrar opciones que se ajusten a mi perfil?`;
    }

    const waLink = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(waText)}`;
    window.open(waLink, '_blank');
  };

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

    // Filtrar por zona/barrio usando todas las zonas conocidas
    const allZones = Object.keys(SITE_KNOWLEDGE.zones);
    const aliases = SITE_KNOWLEDGE.zoneAliases || {};

    // Primero revisar aliases (frases como "pie de la popa")
    let detectedZone = null;
    for (const [alias, zoneKey] of Object.entries(aliases)) {
      if (q.includes(alias)) {
        detectedZone = zoneKey;
        break;
      }
    }

    // Si no se detectó por alias, revisar zonas directas
    if (!detectedZone) {
      for (const zone of allZones) {
        if (q.includes(zone)) {
          detectedZone = zone;
          break;
        }
      }
    }

    if (detectedZone) {
      const z = detectedZone.toLowerCase();
      results = results.filter(p =>
        (p.neighborhood && p.neighborhood.toLowerCase().includes(z)) ||
        (p.city && p.city.toLowerCase().includes(z)) ||
        (p.address && p.address.toLowerCase().includes(z))
      );
    }

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
        // Resetear contexto de búsqueda para empezar limpio
        conversationContext.interest = 'comprar';
        conversationContext.consultationPhase = 'discovery';
        conversationContext.role = 'comprador';
        conversationContext.purpose = null;
        conversationContext.propertyType = null;
        conversationContext.zone = null;
        conversationContext.budget = null;
        conversationContext.beds = null;
        conversationContext.baths = null;
        conversationContext.guests = null;
        conversationContext.stayDates = null;
        conversationContext.lastQuestion = null;
        conversationContext.questionsAsked = [];
        conversationContext.dataPoints = 0;

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
        // Resetear contexto de búsqueda para empezar limpio
        conversationContext.interest = 'arrendar';
        conversationContext.consultationPhase = 'discovery';
        conversationContext.role = 'arrendatario';
        conversationContext.purpose = null;
        conversationContext.propertyType = null;
        conversationContext.zone = null;
        conversationContext.budget = null;
        conversationContext.beds = null;
        conversationContext.baths = null;
        conversationContext.guests = null;
        conversationContext.stayDates = null;
        conversationContext.lastQuestion = null;
        conversationContext.questionsAsked = [];
        conversationContext.dataPoints = 0;

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
        // Resetear contexto de búsqueda para empezar limpio
        conversationContext.interest = 'dias';
        conversationContext.role = 'turista';
        conversationContext.purpose = null;
        conversationContext.propertyType = null;
        conversationContext.zone = null;
        conversationContext.budget = null;
        conversationContext.beds = null;
        conversationContext.baths = null;
        conversationContext.guests = null;
        conversationContext.stayDates = null;
        conversationContext.lastQuestion = null;
        conversationContext.questionsAsked = [];
        conversationContext.dataPoints = 0;

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

      // Nuevos handlers para flujo de consultoría de propietarios
      case 'owner_set_venta':
        addMessage('Quiero vender mi propiedad', false);
        conversationContext.role = 'propietario_venta';
        // Resetear datos del propietario para empezar limpio
        conversationContext.ownerPropertyForSale = {
          type: null, zone: null, price: null, sqm: null,
          beds: null, baths: null, parking: null, condition: null
        };
        conversationContext.lastQuestion = null;
        handleOwnerFlow('propietario_venta', true);
        break;

      case 'owner_set_arriendo':
        addMessage('Quiero arrendar mi propiedad', false);
        conversationContext.role = 'propietario_arriendo';
        // Resetear datos del propietario para empezar limpio
        conversationContext.ownerPropertyForRent = {
          type: null, zone: null, canon: null, beds: null,
          furnished: null, pets: null, availableFrom: null
        };
        conversationContext.lastQuestion = null;
        handleOwnerFlow('propietario_arriendo', true);
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
        keywords: ['contacto', 'teléfono', 'telefono', 'email', 'correo', 'llamar', 'número', 'numero', 'dirección', 'direccion', 'whatsapp', 'comunicar', 'hablar', 'hablar con un asesor', 'hablar con asesor', 'contactar asesor', 'necesito asesor', 'quiero asesor']
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
        keywords: ['vender mi', 'poner en venta', 'quiero vender mi', 'vendo mi', 'quiero vender mi propiedad', 'necesito vender mi', 'busco vender mi', 'quiero vender', 'vender propiedad', 'vender apartamento', 'vender casa']
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

    // Aplicar multiplicadores de prioridad para intenciones críticas
    // Las intenciones de propietario deben tener ALTA prioridad sobre búsquedas
    if (intents.propietarioVenta.score > 0) {
      intents.propietarioVenta.score *= 2.5; // Alta prioridad
    }
    if (intents.propietarioArriendos.score > 0) {
      intents.propietarioArriendos.score *= 2.5; // Alta prioridad
    }
    if (intents.propietario.score > 0) {
      intents.propietario.score *= 2.0; // Prioridad media-alta
    }

    // Las intenciones de alojamiento deben tener prioridad sobre arriendo genérico
    if (intents.alojamiento.score > 0 && intents.arrendar.score > 0) {
      // Si hay indicios de alojamiento por días, priorizar sobre arriendo
      if (msg.match(/días|dias|vacaciones|hospedaje|temporal|por.*noche/i)) {
        intents.alojamiento.score *= 1.8;
      }
    }

    // Penalizar 'comprar' si hay patrones de propietario
    if ((intents.propietarioVenta.score > 0 || intents.propietarioArriendos.score > 0) && intents.comprar.score > 0) {
      intents.comprar.score *= 0.3; // Reducir significativamente
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
    // Primero buscar usando el diccionario de sinónimos de zonas
    const zoneCategories = [
      { category: 'bocagrande', zone: 'bocagrande' },
      { category: 'manga', zone: 'manga' },
      { category: 'centro', zone: 'centro' },
      { category: 'getsemani', zone: 'getsemani' },
      { category: 'castillogrande', zone: 'castillogrande' },
      { category: 'crespo', zone: 'crespo' },
      { category: 'laguito', zone: 'laguito' },
      { category: 'piedelapopa', zone: 'pie de la popa' },
      { category: 'serena', zone: 'serena del mar' },
      { category: 'country', zone: 'country' },
      { category: 'parqueheredia', zone: 'parque heredia' }
    ];

    for (const { category, zone } of zoneCategories) {
      if (matchesSynonym(msg, category)) {
        return zone;
      }
    }

    // Luego buscar en aliases (frases compuestas)
    for (const [alias, zoneKey] of Object.entries(SITE_KNOWLEDGE.zoneAliases)) {
      if (msg.includes(alias)) {
        return zoneKey;
      }
    }

    // Finalmente buscar directamente en las zonas
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
      minPrice: null,
      stayDates: null
    };

    // Detectar operación - mejorado con más patrones
    // IMPORTANTE: No detectar "vender/venta" como compra cuando el usuario es propietario
    const isOwnerPattern = /quiero (vender|arrendar) mi|vender mi (propiedad|casa|apartamento|inmueble)|arrendar mi (propiedad|casa|apartamento|inmueble)|poner en (venta|arriendo) mi|busco quien (compre|arriende) mi/i;

    if (!msg.match(isOwnerPattern)) {
      // Solo si NO es un propietario, entonces buscar operación de compra/arriendo
      // Usando diccionario de sinónimos para mejor detección
      if (matchesSynonym(msg, 'buy')) {
        criteria.operation = 'comprar';
      } else if (matchesSynonym(msg, 'rent')) {
        criteria.operation = 'arrendar';
      } else if (matchesSynonym(msg, 'stay')) {
        criteria.operation = 'dias';
      }
    }
    // Si es patrón de propietario, NO establecer operación (se manejará en processMessage)

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

    // Detectar tipo de propiedad - usando diccionario de sinónimos
    if (matchesSynonym(msg, 'apartment')) {
      criteria.type = 'apartamento';
    } else if (matchesSynonym(msg, 'house')) {
      criteria.type = 'casa';
    } else if (matchesSynonym(msg, 'lot')) {
      criteria.type = 'lote';
    } else if (matchesSynonym(msg, 'office')) {
      criteria.type = 'oficina';
    } else if (msg.match(/local\s*comercial|\blocal\b/i)) {
      criteria.type = 'local';
    } else if (msg.match(/finca|parcela|hacienda|granja/i)) {
      criteria.type = 'finca';
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

    // Detectar rango de fechas (para alojamientos) en formato sencillo
    // Ej: "del 5 al 10 de enero" o "5/01 al 10/01"
    const dateRange1 = msg.match(/del\s+([^,]+?)\s+(?:al|hasta)\s+([^,\.]+)/i);
    const dateRange2 = msg.match(/(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s*(?:al|-|a)\s*(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i);

    if (dateRange1) {
      criteria.stayDates = `del ${dateRange1[1].trim()} al ${dateRange1[2].trim()}`;
    } else if (dateRange2) {
      criteria.stayDates = `${dateRange2[1]} al ${dateRange2[2]}`;
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

    // ===============================
    // COMANDOS GLOBALES / CAMBIO DE CONTEXTO
    // ===============================

    // Volver al inicio / menú principal (usando diccionario de sinónimos)
    if (matchesSynonym(msg, 'back') && msg.length < 30) {
      resetConversation(); // limpiamos flujo pero conservamos que ya se saludó
      botReply('Listo, volvamos al inicio. ¿Qué deseas hacer ahora?', QUICK_OPTIONS);
      return;
    }

    // Reiniciar completamente la conversación
    if (/reiniciar|empezar de nuevo|nuevo chat|borrar conversaci[oó]n|desde cero/i.test(msg)) {
      resetConversation({ full: true });
      botReply('De acuerdo, empezamos desde cero. ¿Qué necesitas hoy?', QUICK_OPTIONS);
      return;
    }

    // Cambiar explícitamente de modo principal, aunque esté en medio de otro flujo
    // Usar diccionario de sinónimos para detectar intención

    // Detectar intención de arrendar
    const wantsRent = matchesSynonym(msg, 'rent') &&
      (/quiero|busco|necesito|me interesa|deseo/i.test(msg) || msg.length < 20);
    if (wantsRent && !matchesSynonym(msg, 'owner')) {
      resetConversation();
      handleOption('arrendar');
      return;
    }

    // Detectar intención de comprar
    const wantsBuy = matchesSynonym(msg, 'buy') &&
      (/quiero|busco|necesito|me interesa|deseo/i.test(msg) || msg.length < 20);
    if (wantsBuy && !matchesSynonym(msg, 'owner')) {
      resetConversation();
      handleOption('comprar');
      return;
    }

    // Detectar intención de alojamiento/hospedaje
    const wantsStay = matchesSynonym(msg, 'stay') &&
      (/quiero|busco|necesito|me interesa|deseo/i.test(msg) || msg.length < 20);
    if (wantsStay) {
      resetConversation();
      handleOption('alojamiento');
      return;
    }

    // Detectar intención de propietario
    const isOwner = matchesSynonym(msg, 'owner') ||
      /^soy propietario|^soy dueño|^tengo (una |un )?(propiedad|casa|apartamento|apto|inmueble)/i.test(msg);
    if (isOwner) {
      resetConversation();
      handleOption('propietario');
      return;
    }

    // Detectar intención de contactar asesor
    const wantsContact = matchesSynonym(msg, 'contact') &&
      (/quiero|necesito|hablar|contactar|llamar/i.test(msg) || msg.length < 25);
    if (wantsContact) {
      // Ir directamente a contacto
      const waLink = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent('Hola Altorra, quiero hablar con un asesor')}`;
      const html = `¡Claro! Te comunico con un asesor de Altorra.<br><br>
        <a href="${waLink}" target="_blank" rel="noopener" style="display:inline-block;background:#25d366;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
          💬 Chatear por WhatsApp
        </a><br><br>
        También puedes llamar al <b>${CONFIG.whatsappNumber}</b>.`;

      // CRÍTICO: Limpiar el contexto para que el bot no siga preguntando después
      conversationContext.lastQuestion = null;
      conversationContext.consultationPhase = null;
      conversationContext.dataPoints = 0;
      saveContext();

      botReply(html);
      return;
    }

    // ===============================
    // FIN COMANDOS GLOBALES
    // ===============================

    // ⚠️ CRÍTICO: Manejo de agradecimientos y despedidas
    // Estos siempre cierran el flujo activo, independientemente del estado
    if (matchesSynonym(msg, 'thanks')) {
      // Limpiar contexto de flujo activo
      conversationContext.lastQuestion = null;
      conversationContext.consultationPhase = null;
      if (conversationContext.role && conversationContext.role.startsWith('propietario_')) {
        conversationContext.role = null;
      }
      saveContext();

      // Responder con mensaje de agradecimiento
      botReply(RESPONSES.gracias);
      return;
    }

    if (matchesSynonym(msg, 'goodbye')) {
      // Limpiar contexto de flujo activo
      conversationContext.lastQuestion = null;
      conversationContext.consultationPhase = null;
      if (conversationContext.role && conversationContext.role.startsWith('propietario_')) {
        conversationContext.role = null;
      }
      saveContext();

      // Responder con mensaje de despedida
      botReply('¡Hasta pronto! 👋<br><br>Recuerda que estamos disponibles <b>Lun-Vie 8am-6pm</b> y <b>Sábados 9am-1pm</b>.<br><br>¡Éxitos con tu búsqueda inmobiliaria! 🏠');
      return;
    }

    // 🔹 ATAJO: si la conversación ya está casi cerrada y el usuario dice "bien",
    // respóndele con el mensaje de cierre corporativo.
    const isFlowActive =
      conversationContext.lastQuestion ||
      conversationContext.consultationPhase === 'discovery' ||
      (conversationContext.role && conversationContext.role.startsWith('propietario_'));

    if (!isFlowActive && /^(bien|muy bien|todo bien|ok bien)$/.test(msg)) {
      botReply(RESPONSES.gracias);
      return;
    }

    const { intent, score } = analyzeIntent(msg);
    const criteria = extractSearchCriteria(msg);

    // ===============================
    // ⚡ CRÍTICO: DETECCIÓN DE CAMBIO DE INTENCIÓN GLOBAL
    // Esto debe evaluarse ANTES de continuar con flujos activos
    // ===============================

    // Si el usuario está en un flujo activo (propietario o consultoría) pero quiere cambiar de tema
    const hasActiveFlow = conversationContext.role && conversationContext.role.startsWith('propietario_');
    const hasPendingQuestion = conversationContext.lastQuestion;

    if ((hasActiveFlow || hasPendingQuestion) && isNewGlobalIntent(msg)) {
      console.log('🔄 Nueva intención global detectada, cambiando de flujo:', msg);

      // Detectar qué intención específica es y ejecutarla
      if (matchesSynonym(msg, 'buy') && !matchesSynonym(msg, 'owner')) {
        resetConversation();
        handleOption('comprar');
        return;
      } else if (matchesSynonym(msg, 'rent') && !matchesSynonym(msg, 'owner')) {
        resetConversation();
        handleOption('arrendar');
        return;
      } else if (matchesSynonym(msg, 'stay')) {
        resetConversation();
        handleOption('alojamiento');
        return;
      } else if (matchesSynonym(msg, 'owner')) {
        resetConversation();
        handleOption('propietario');
        return;
      }
      // Si es otro comando global (back, contact), continuar con el flujo normal
    }

    // ========== PRIORIDAD ALTA: DETECCIÓN DE PROPIETARIOS ==========
    // Evaluar PRIMERO si el usuario es un propietario que quiere vender/arrendar
    const ownerIntent = detectOwnerIntent(msg);
    if (ownerIntent) {
      // Si ya tiene rol de propietario, continuar el flujo
      if (conversationContext.role && conversationContext.role.startsWith('propietario_')) {
        handleOwnerFlow(conversationContext.role, false);
        return;
      }
      // Nueva detección de propietario
      if (ownerIntent === 'propietario_venta') {
        conversationContext.role = 'propietario_venta';
        handleOwnerFlow('propietario_venta', true);
        return;
      } else if (ownerIntent === 'propietario_arriendo') {
        conversationContext.role = 'propietario_arriendo';
        handleOwnerFlow('propietario_arriendo', true);
        return;
      } else if (ownerIntent === 'propietario_general') {
        // Preguntar qué servicio necesita
        const html = `¡Excelente! Nos especializamos en ayudar a propietarios.<br><br>¿Qué servicio te interesa?`;
        botReply(html, [
          { text: 'Quiero vender mi propiedad', action: 'owner_set_venta' },
          { text: 'Quiero arrendar mi propiedad', action: 'owner_set_arriendo' }
        ]);
        return;
      }
    }

    // Si ya es propietario y responde algo, procesar como continuación del flujo
    // (La detección de cambio de intención ya se hizo arriba, en líneas 2593-2615)
    if (conversationContext.role && conversationContext.role.startsWith('propietario_')) {
      if (isSlotResponse(msg)) {
        // Es respuesta al slot - aplicar y continuar flujo
        applyOwnerAnswer(msg);
        handleOwnerFlow(conversationContext.role, false);
        return;
      } else {
        // Mensaje ambiguo - intentar aplicar como respuesta
        applyOwnerAnswer(msg);
        handleOwnerFlow(conversationContext.role, false);
        return;
      }
    }

    // ========== FIN DETECCIÓN DE PROPIETARIOS ==========

    // ========== MANEJO POST-RECOMENDACIÓN ==========
    // Si ya mostramos recomendaciones y el usuario responde, manejar apropiadamente
    if (conversationContext.consultationPhase === 'recommendation') {
      // Si el usuario dice "NO" después de ver recomendaciones, ofrecer alternativas
      if (matchesSynonym(msg, 'no') && msg.length < 30) {
        // Limpiar fase de consultoría para no seguir preguntando
        conversationContext.consultationPhase = null;
        conversationContext.lastQuestion = null;
        saveContext();

        // Ofrecer opciones útiles
        const html = `Entiendo. ¿Qué te gustaría hacer?`;
        const options = [
          { text: '🔄 Ajustar criterios de búsqueda', action: 'adjust_criteria' },
          { text: '🏠 Ver todas las propiedades', action: 'view_all' },
          { text: '🔍 Nueva búsqueda', action: 'restart' },
          { text: '📱 Ver opciones de contacto', action: 'contact_info' }
        ];
        botReply(html, options);
        return;
      }

      // Si el usuario dice "SI" o quiere contactar, ya tiene el botón de WhatsApp
      // Limpiar el contexto y agradecer
      if (matchesSynonym(msg, 'yes') && msg.length < 30) {
        conversationContext.consultationPhase = null;
        conversationContext.lastQuestion = null;
        saveContext();

        botReply('¡Perfecto! Puedes usar el botón de WhatsApp arriba para contactar a un asesor con toda la información. 😊<br><br>¿Hay algo más en lo que pueda ayudarte?', QUICK_OPTIONS);
        return;
      }

      // Si el mensaje no es ni sí ni no, pero estamos en fase de recomendación,
      // limpiar el contexto y procesar como mensaje normal
      conversationContext.consultationPhase = null;
      // No limpiar lastQuestion aquí, dejarlo para el flujo normal
    }

    // ========== DETECCIÓN INTELIGENTE: RESPUESTA A SLOT ==========
    // Si hay una pregunta pendiente del flujo de consultoría, procesar la respuesta
    // (La detección de cambio de intención ya se hizo arriba, en líneas 2593-2615)
    if (conversationContext.lastQuestion) {
      const isSlot = isSlotResponse(msg);

      if (isSlot) {
        // Parece una respuesta al slot - aplicar y continuar flujo
        updateContext(msg, criteria);
        applyAnswerToLastQuestion(msg, criteria);

        // Continuar la consultoría con la siguiente pregunta
        const nextQuestion = getNextConsultationQuestion();
        if (nextQuestion) {
          conversationContext.lastQuestion = nextQuestion.field;
          saveContext();
          const options = nextQuestion.options ? nextQuestion.options.map(opt => ({
            text: opt.text,
            action: `set_${nextQuestion.field}_${opt.value}`
          })) : null;
          botReply(`<b>${nextQuestion.question}</b>`, options);
          return;
        } else {
          // Ya no hay más preguntas - mostrar recomendaciones
          conversationContext.lastQuestion = null;
          conversationContext.consultationPhase = 'recommendation';
          saveContext();
          const results = getSmartRecommendations();
          if (results.length > 0) {
            const recommendation = generatePersonalizedRecommendation(results);
            botReply(recommendation);
          } else {
            botReply('Gracias por la información. Lamentablemente no encontré propiedades con esos criterios exactos. ¿Te gustaría ajustar algún parámetro o hablar con un asesor?', QUICK_OPTIONS);
          }
          return;
        }
      }
      // Si no es claramente ni nueva intención ni slot response,
      // continuamos con el procesamiento normal (el mensaje es ambiguo)
    }

    // Actualizar contexto de la conversación
    updateContext(msg, criteria);

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
          if (!conversationContext.hasGreetedUser) {
            // Primera interacción - saludo más completo y guía
            conversationContext.hasGreetedUser = true;
            const welcomeHtml = `¡Bienvenido a <b>Altorra Inmobiliaria</b>! 🏠<br><br>
Soy tu asistente virtual y puedo ayudarte con:<br><br>
• <b>Comprar</b> - Encuentra tu inmueble ideal<br>
• <b>Arrendar</b> - Opciones de arriendo a largo plazo<br>
• <b>Alojamientos</b> - Estadías por días en Cartagena<br>
• <b>Vender o Arrendar tu propiedad</b> - Servicios para propietarios<br><br>
¿Qué te gustaría hacer hoy?`;
            botReply(welcomeHtml, QUICK_OPTIONS);
          } else {
            // Ya saludó antes - saludo más corto
            botReply(RESPONSES.greeting[Math.floor(Math.random() * RESPONSES.greeting.length)], QUICK_OPTIONS);
          }
          return;
        case 'estado':
          botReply('¡Muy bien, gracias por preguntar! 😊<br><br>Estoy aquí para ayudarte con tu búsqueda inmobiliaria en Cartagena. ¿Qué necesitas hoy?', QUICK_OPTIONS);
          return;
        case 'despedida':
          botReply('¡Hasta pronto! 👋<br><br>Fue un gusto ayudarte. Recuerda que puedes volver cuando quieras.<br><br>Si necesitas atención inmediata, contáctanos por WhatsApp: <b>+57 300 243 9810</b>');
          return;
        case 'gracias':
          // Detectar si es confirmación en flujo activo vs agradecimiento real
          const isActiveFlow = conversationContext.lastQuestion ||
            conversationContext.dataPoints > 0 ||
            conversationContext.consultationPhase === 'discovery' ||
            conversationContext.interest;

          // Palabras que son claramente agradecimiento - usando diccionario de sinónimos
          const isClearThanks = matchesSynonym(msg, 'thanks');

          // Palabras de confirmación que podrían ser continuación - usando diccionario de sinónimos
          const isConfirmation = matchesSynonym(msg, 'yes') && msg.length < 20;

          if (isActiveFlow && isConfirmation && !isClearThanks) {
            // Es una confirmación en flujo activo - pedir siguiente información
            let followUpResponse = '¡Perfecto! ';

            if (conversationContext.lastQuestion) {
              // Continuar la consultoría
              const nextQuestion = getNextConsultationQuestion();
              if (nextQuestion) {
                followUpResponse += `<b>${nextQuestion.question}</b>`;
                conversationContext.lastQuestion = nextQuestion.field;
                const options = nextQuestion.options ? nextQuestion.options.map(opt => ({
                  text: opt.text,
                  action: `set_${nextQuestion.field}_${opt.value}`
                })) : null;
                botReply(followUpResponse, options);
              } else {
                // Ya terminó la consultoría - mostrar recomendaciones
                const results = getSmartRecommendations();
                const recommendation = generatePersonalizedRecommendation(results);
                botReply(recommendation);
              }
            } else {
              // No hay pregunta pendiente, ofrecer opciones
              followUpResponse += '¿En qué más puedo ayudarte?';
              botReply(followUpResponse, QUICK_OPTIONS);
            }
            return;
          }

          // Es un agradecimiento real
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
          // Generar link de WhatsApp con contexto de la conversación
          const ctxContact = conversationContext;
          let waMessage = 'Hola Altorra, necesito hablar con un asesor';

          // Agregar contexto si existe
          if (ctxContact.interest || ctxContact.propertyType || ctxContact.zone) {
            waMessage += '.\n\nMi búsqueda:\n';
            if (ctxContact.interest) {
              const opName = ctxContact.interest === 'comprar' ? 'Comprar' :
                             ctxContact.interest === 'arrendar' ? 'Arrendar' : 'Alojamiento';
              waMessage += `• Operación: ${opName}\n`;
            }
            if (ctxContact.propertyType) waMessage += `• Tipo: ${ctxContact.propertyType}\n`;
            if (ctxContact.zone) waMessage += `• Zona: ${ctxContact.zone}\n`;
            if (ctxContact.budget) waMessage += `• Presupuesto: $${(ctxContact.budget/1000000).toFixed(0)} millones\n`;
            if (ctxContact.beds) waMessage += `• Habitaciones: ${ctxContact.beds}+\n`;
          }

          const waLinkContact = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(waMessage)}`;

          let contactResponse = `📞 <b>¡Te conecto con un asesor!</b><br><br>`;
          contactResponse += `Nuestro equipo está listo para ayudarte de forma personalizada.<br><br>`;
          contactResponse += `<a href="${waLinkContact}" target="_blank" rel="noopener" class="chat-whatsapp-link">`;
          contactResponse += `<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.789l4.94-1.293A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>`;
          contactResponse += `Hablar por WhatsApp</a><br><br>`;
          contactResponse += `<b>Horario:</b> Lun-Vie 8am-6pm, Sáb 9am-1pm<br>`;
          contactResponse += `Por WhatsApp respondemos más rápido.`;

          // CRÍTICO: Limpiar el contexto para que el bot no siga preguntando después
          conversationContext.lastQuestion = null;
          conversationContext.consultationPhase = null;
          conversationContext.dataPoints = 0;
          saveContext();

          botReply(contactResponse);
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
          handleOption('owner_set_arriendo');
          return;
        case 'propietarioVenta':
          handleOption('owner_set_venta');
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

    // Evitar mostrar propiedades al azar cuando el mensaje parece de propietario
    if (/vender\b|arrendar\b|administrar\b/.test(msg) &&
        !criteria.operation && !criteria.type && !criteria.zone) {

      botReply(
        'Entiendo que quieres gestionar un inmueble (vender, arrendar o administrar), ' +
        'pero no logré identificar todos los datos.<br><br>' +
        '¿Eres propietario del inmueble o estás buscando uno para comprar/arrendar?',
        [
          { text: 'Soy propietario', action: 'propietario' },
          { text: 'Busco comprar', action: 'comprar' },
          { text: 'Busco arrendar', action: 'arrendar' }
        ]
      );
      return;
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
