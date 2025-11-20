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

  // Estado del chatbot
  let properties = [];
  let isOpen = false;
  let hasGreeted = false;
  let welcomeBubbleShown = false;

  // Conocimiento completo del sitio web
  const SITE_KNOWLEDGE = {
    pages: {
      inicio: { url: 'index.html', desc: 'Página principal con todas las propiedades destacadas' },
      comprar: { url: 'propiedades-comprar.html', desc: 'Propiedades en venta en Cartagena' },
      arrendar: { url: 'propiedades-arrendar.html', desc: 'Propiedades en arriendo mensual' },
      alojamiento: { url: 'propiedades-alojamiento.html', desc: 'Alojamientos por días para vacaciones' },
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
      laguito: 'Zona turística con edificios frente al mar.'
    },
    propertyTypes: ['apartamento', 'casa', 'lote', 'oficina', 'local', 'bodega', 'finca'],
    features: {
      comprar: 'Inversión a largo plazo, valorización, patrimonio propio',
      arrendar: 'Flexibilidad, sin compromiso de compra, incluye administración',
      alojamiento: 'Ideal para vacaciones, amoblado, servicios incluidos'
    }
  };

  // Respuestas predefinidas mejoradas con enlaces
  const RESPONSES = {
    greeting: [
      '¡Hola! 👋 Soy <b>Altorra IA</b>, tu asistente inmobiliario virtual.<br><br>Puedo ayudarte a:<br>• 🏠 Encontrar propiedades<br>• 📍 Conocer zonas de Cartagena<br>• 📋 Resolver dudas sobre servicios<br>• 💬 Conectarte con un asesor<br><br>¿Qué necesitas hoy?',
      '¡Bienvenido a <b>Altorra Inmobiliaria</b>! 🏠<br><br>Soy tu asistente IA. Cuéntame:<br>• ¿Buscas <b>comprar</b>, <b>arrendar</b> o <b>alojamiento por días</b>?<br>• ¿Tienes alguna zona preferida?<br>• ¿Cuál es tu presupuesto?'
    ],
    comprar: '🏡 <b>Propiedades en Venta</b><br><br>Tenemos apartamentos, casas, lotes y oficinas en las mejores zonas de Cartagena.<br><br><b>Ventajas de comprar:</b><br>• Inversión con valorización<br>• Patrimonio propio<br>• Sin pago mensual de arriendo<br><br>👉 <a href="propiedades-comprar.html" style="color:#d4af37;font-weight:600;">Ver todas las propiedades en venta</a><br><br>¿Qué tipo de propiedad buscas?',
    arrendar: '🔑 <b>Arriendos en Cartagena</b><br><br>Opciones para todos los presupuestos con contrato y respaldo legal.<br><br><b>Ventajas del arriendo:</b><br>• Flexibilidad<br>• Sin inversión inicial grande<br>• Mantenimiento incluido<br><br>👉 <a href="propiedades-arrendar.html" style="color:#d4af37;font-weight:600;">Ver propiedades en arriendo</a><br><br>¿Prefieres apartamento o casa?',
    alojamiento: '🌴 <b>Alojamientos por Días</b><br><br>Perfectos para vacaciones, amoblados y con todos los servicios.<br><br><b>Incluyen:</b><br>• WiFi y servicios<br>• Ubicaciones turísticas<br>• Atención personalizada<br><br>👉 <a href="propiedades-alojamiento.html" style="color:#d4af37;font-weight:600;">Ver alojamientos disponibles</a><br><br>¿Cuántas personas serán y qué fechas?',
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
    nosotros: '🏢 <b>Sobre Altorra Inmobiliaria</b><br><br>Somos una empresa inmobiliaria en Cartagena de Indias con experiencia en:<br>• Compra y venta<br>• Arriendos<br>• Alojamientos turísticos<br>• Asesoría legal y contable<br><br>👉 <a href="quienes-somos.html" style="color:#d4af37;font-weight:600;">Conocer nuestra historia</a>'
  };

  // Opciones rápidas iniciales
  const QUICK_OPTIONS = [
    { text: 'Quiero comprar', action: 'comprar' },
    { text: 'Busco arriendo', action: 'arrendar' },
    { text: 'Alojamiento por días', action: 'alojamiento' },
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

  // Manejar opciones rápidas
  function handleOption(action) {
    switch (action) {
      case 'comprar':
        addMessage('Quiero comprar una propiedad', false);
        const buyProps = properties.filter(p => p.operation === 'comprar').slice(0, 2);
        if (buyProps.length > 0) {
          let html = RESPONSES.comprar + '<br><br>Aquí te muestro algunas opciones:';
          buyProps.forEach(p => { html += createPropertyCard(p); });
          botReply(html);
        } else {
          botReply(RESPONSES.comprar);
        }
        break;

      case 'arrendar':
        addMessage('Busco arriendo', false);
        const rentProps = properties.filter(p => p.operation === 'arrendar').slice(0, 2);
        if (rentProps.length > 0) {
          let html = RESPONSES.arrendar + '<br><br>Te muestro nuestras opciones:';
          rentProps.forEach(p => { html += createPropertyCard(p); });
          botReply(html);
        } else {
          botReply(RESPONSES.arrendar + '<br><br>Actualmente no tenemos propiedades en arriendo publicadas, pero contáctanos y te ayudamos a encontrar una.');
        }
        break;

      case 'alojamiento':
        addMessage('Alojamiento por días', false);
        const stayProps = properties.filter(p => p.operation === 'dias' || p.operation === 'alojar').slice(0, 2);
        if (stayProps.length > 0) {
          let html = RESPONSES.alojamiento + '<br><br>Mira estas opciones:';
          stayProps.forEach(p => { html += createPropertyCard(p); });
          botReply(html);
        } else {
          botReply(RESPONSES.alojamiento + '<br><br>Próximamente tendremos opciones disponibles. Contáctanos para más información.');
        }
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
    }
  }

  // Procesar mensaje del usuario con inteligencia mejorada
  function processMessage(message) {
    const msg = message.toLowerCase().trim();

    // === SALUDOS ===
    if (msg.match(/^(hola|buenos|buenas|hey|hi|saludos|qué tal|que tal|ey|hello)$/i) ||
        msg.match(/^hola.{0,15}$/i) ||
        msg.match(/^buenas?\s*(tardes?|noches?|días?|dias?)/i)) {
      botReply(RESPONSES.greeting[Math.floor(Math.random() * RESPONSES.greeting.length)], QUICK_OPTIONS);
      return;
    }

    // === AYUDA Y CAPACIDADES ===
    if (msg.match(/ayuda|help|qué puedes|que puedes|cómo funciona|como funciona|opciones|qué haces|que haces|para qué sirves|para que sirves/i)) {
      botReply(RESPONSES.ayuda, QUICK_OPTIONS);
      return;
    }

    // === AGRADECIMIENTOS ===
    if (msg.match(/^(gracias|genial|perfecto|excelente|ok|vale|bien|super|listo|bueno|entendido|claro)$/i)) {
      botReply(RESPONSES.gracias);
      return;
    }

    // === SOBRE NOSOTROS / QUIÉNES SOMOS ===
    if (msg.match(/quiénes son|quienes son|sobre ustedes|sobre altorra|la empresa|la inmobiliaria|quién es|quien es/i)) {
      botReply(RESPONSES.nosotros);
      return;
    }

    // === PUBLICAR PROPIEDAD ===
    if (msg.match(/publicar|vender mi|arrendar mi|consignar|poner en venta|tengo una propiedad|quiero vender|quiero arrendar mi/i)) {
      botReply(RESPONSES.publicar);
      return;
    }

    // === COMPARADOR ===
    if (msg.match(/comparar|comparador|comparación|comparacion|versus|vs|diferencia entre/i)) {
      botReply(RESPONSES.comparar);
      return;
    }

    // === PRECIOS GENERALES ===
    if (msg.match(/^(precio|costo|valor|cuánto|cuanto|presupuesto|tarifas?)(\?)?$/i) ||
        msg.match(/qué precios|que precios|rango de precios|cuánto cuesta|cuanto cuesta|cuánto vale|cuanto vale/i)) {
      botReply(RESPONSES.precio);
      return;
    }

    // === CONTACTO ===
    if (msg.match(/contacto|teléfono|telefono|email|correo|llamar|número|numero|dirección|direccion|ubicación de la oficina|dónde quedan|donde quedan/i)) {
      botReply(RESPONSES.contacto);
      return;
    }

    // === HORARIO ===
    if (msg.match(/horario|hora|atienden|abierto|cuándo|cuando abren|disponibilidad|a qué hora|a que hora/i)) {
      botReply(RESPONSES.horario);
      return;
    }

    // === SERVICIOS ===
    if (msg.match(/servicio|avalúo|avaluo|jurídico|juridico|legal|contable|qué hacen|que hacen|qué ofrecen|que ofrecen|administración|administracion/i)) {
      botReply(RESPONSES.servicios);
      return;
    }

    // === ZONAS ESPECÍFICAS ===
    for (const [zone, info] of Object.entries(SITE_KNOWLEDGE.zones)) {
      if (msg.includes(zone)) {
        const zoneTitle = zone.charAt(0).toUpperCase() + zone.slice(1);
        let response = `📍 <b>${zoneTitle}</b><br><br>${info}<br><br>`;

        // Buscar propiedades en esa zona
        const zoneProps = properties.filter(p =>
          (p.neighborhood && p.neighborhood.toLowerCase().includes(zone)) ||
          (p.city && p.city.toLowerCase().includes(zone))
        ).slice(0, 2);

        if (zoneProps.length > 0) {
          response += `<b>Propiedades disponibles en ${zoneTitle}:</b>`;
          zoneProps.forEach(p => { response += createPropertyCard(p); });
        } else {
          response += `Actualmente no tenemos propiedades publicadas en ${zoneTitle}, pero contáctanos y te ayudamos a buscar.`;
        }

        botReply(response);
        return;
      }
    }

    // === UBICACIÓN GENERAL ===
    if (msg.match(/^(ubicación|ubicacion|zona|barrio|donde|dónde|sectores|barrios)(\?)?$/i) ||
        msg.match(/qué zonas|que zonas|en qué parte|en que parte|mejores zonas|qué barrios|que barrios/i)) {
      botReply(RESPONSES.ubicacion);
      return;
    }

    // === TIPOS DE PROPIEDAD ESPECÍFICOS ===
    const typeMatch = msg.match(/(apartamento|apto|casa|lote|terreno|oficina|local|bodega|finca)/i);
    if (typeMatch && !msg.match(/comprar|arrendar|venta|arriendo|alquiler/i)) {
      const type = typeMatch[1].toLowerCase().replace('apto', 'apartamento').replace('terreno', 'lote');
      const typeProps = properties.filter(p => p.type === type).slice(0, 3);

      if (typeProps.length > 0) {
        let html = `🏠 <b>${type.charAt(0).toUpperCase() + type.slice(1)}s disponibles:</b>`;
        typeProps.forEach(p => { html += createPropertyCard(p); });
        html += '<br>¿Te interesa alguno en particular? ¿Buscas para comprar o arrendar?';
        botReply(html);
      } else {
        botReply(`Actualmente no tenemos ${type}s publicados, pero contáctanos y te ayudamos a encontrar uno.`);
      }
      return;
    }

    // === BÚSQUEDA DE PROPIEDADES ===
    const results = searchProperties(msg);

    if (results.length > 0) {
      let html = `✨ Encontré <b>${results.length} propiedad${results.length > 1 ? 'es' : ''}</b> que coinciden:`;
      results.forEach(p => { html += createPropertyCard(p); });
      html += '<br>Haz clic en cualquiera para ver todos los detalles, o dime si quieres filtrar más.';
      botReply(html);
      return;
    }

    // === OPERACIONES SIN RESULTADOS ESPECÍFICOS ===
    if (msg.match(/comprar|compra|venta|vender|inversión|inversion|invertir/i)) {
      handleOption('comprar');
      return;
    }

    if (msg.match(/arrendar|arriendo|alquiler|alquilar|rentar|renta/i)) {
      handleOption('arrendar');
      return;
    }

    if (msg.match(/día|dias|días|alojamiento|hospedaje|vacaciones|turismo|turista|hotel|airbnb|por noche/i)) {
      handleOption('alojamiento');
      return;
    }

    // === CONTACTO CON ASESOR ===
    if (msg.match(/asesor|agente|hablar|whatsapp|persona|humano|llamar/i)) {
      handleOption('whatsapp');
      return;
    }

    // === RESPUESTA POR DEFECTO ===
    const waLink = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent('Hola Altorra, ' + message)}`;
    botReply(`
      ${RESPONSES.noEntiendo}
      <a href="${waLink}" target="_blank" rel="noopener" class="chat-whatsapp-link">
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.789l4.94-1.293A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
        Contactar por WhatsApp
      </a>
    `);
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
