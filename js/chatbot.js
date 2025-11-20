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

  // Respuestas predefinidas mejoradas
  const RESPONSES = {
    greeting: [
      '¡Hola! 👋 Soy el asistente virtual de Altorra Inmobiliaria. Puedo ayudarte a encontrar propiedades, resolver dudas sobre nuestros servicios o conectarte con un asesor. ¿Qué necesitas?',
      '¡Bienvenido a Altorra! 🏠 Estoy aquí para ayudarte. Puedo mostrarte propiedades en venta, arriendo o alojamientos por días. ¿Qué te interesa?'
    ],
    comprar: '🏡 Excelente elección para invertir. Tenemos propiedades en venta en las mejores zonas de Cartagena. ¿Qué tipo buscas: apartamento, casa, lote u oficina?',
    arrendar: '🔑 Tenemos opciones de arriendo para todos los gustos. ¿Prefieres apartamento o casa? ¿Tienes alguna zona preferida en Cartagena?',
    alojamiento: '🌴 Nuestros alojamientos por días son perfectos para vacaciones. ¿Cuántas personas serán y en qué fechas planeas tu estadía?',
    precio: '💰 Entiendo que el presupuesto es importante. Dime tu rango aproximado y te muestro las mejores opciones. Por ejemplo: "hasta 300 millones" o "entre 1 y 2 millones mensuales".',
    ubicacion: '📍 Cartagena tiene zonas increíbles:<br>• <b>Bocagrande</b> - Playa y exclusividad<br>• <b>Manga</b> - Tradicional y central<br>• <b>Centro Histórico</b> - Encanto colonial<br>• <b>Crespo</b> - Cerca al aeropuerto<br>¿Cuál te interesa?',
    contacto: '📞 Contáctanos:<br>• <b>WhatsApp:</b> +57 300 243 9810<br>• <b>Email:</b> altorrainmobiliaria@gmail.com<br>• <b>Dirección:</b> Cartagena de Indias<br><br>¿Prefieres que te contactemos nosotros?',
    servicios: '📋 Nuestros servicios incluyen:<br>• Compra y venta de inmuebles<br>• Arriendos<br>• Avalúos comerciales<br>• Asesoría jurídica<br>• Administración de propiedades<br>• Servicios contables<br><br>¿Te interesa alguno en particular?',
    horario: '🕐 Horario de atención:<br><b>Lunes a Viernes:</b> 8:00 AM - 6:00 PM<br><b>Sábados:</b> 9:00 AM - 1:00 PM<br><br>Por WhatsApp respondemos más rápido.',
    gracias: '¡Con mucho gusto! 😊 Recuerda que puedes contactarnos por WhatsApp para una atención más personalizada. ¡Éxitos con tu búsqueda!',
    noEntiendo: 'Hmm, no estoy seguro de entender completamente tu consulta. 🤔<br><br>Te sugiero:<br>• Ser más específico (ej: "apartamento en Bocagrande")<br>• O mejor aún, habla con un asesor que puede ayudarte mejor:',
    default: '¿Hay algo más en lo que pueda ayudarte? También puedo conectarte con un asesor por WhatsApp.',
    sinResultados: 'No encontré propiedades con esos criterios exactos, pero tenemos otras opciones que podrían interesarte. ¿Quieres que te muestre o prefieres hablar con un asesor?',
    ayuda: '¿Cómo puedo ayudarte?<br><br>Puedo:<br>• Mostrar propiedades en venta, arriendo o por días<br>• Filtrar por zona, precio o características<br>• Conectarte con un asesor<br>• Resolver dudas sobre servicios'
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

  // Procesar mensaje del usuario
  function processMessage(message) {
    const msg = message.toLowerCase().trim();

    // Detectar intención con patrones mejorados

    // Saludos
    if (msg.match(/^(hola|buenos|buenas|hey|hi|saludos|qué tal|que tal|ey)$/i) ||
        msg.match(/^hola.{0,10}$/i)) {
      botReply(RESPONSES.greeting[Math.floor(Math.random() * RESPONSES.greeting.length)], QUICK_OPTIONS);
      return;
    }

    // Ayuda
    if (msg.match(/ayuda|help|qué puedes|que puedes|cómo funciona|como funciona|opciones/i)) {
      botReply(RESPONSES.ayuda, QUICK_OPTIONS);
      return;
    }

    // Agradecimientos
    if (msg.match(/gracias|genial|perfecto|excelente|ok|vale|bien|super|listo/i)) {
      botReply(RESPONSES.gracias);
      return;
    }

    // Preguntas sobre precio (sin buscar propiedades)
    if (msg.match(/^(precio|costo|valor|cuánto|cuanto|presupuesto)(\?)?$/i) ||
        msg.match(/qué precios|que precios|rango de precios/i)) {
      botReply(RESPONSES.precio);
      return;
    }

    // Contacto
    if (msg.match(/contacto|teléfono|telefono|email|correo|llamar|número|numero|dirección|direccion/i)) {
      botReply(RESPONSES.contacto);
      return;
    }

    // Horario
    if (msg.match(/horario|hora|atienden|abierto|cuándo|cuando abren|disponibilidad/i)) {
      botReply(RESPONSES.horario);
      return;
    }

    // Servicios
    if (msg.match(/servicio|avalúo|avaluo|jurídico|juridico|legal|contable|qué hacen|que hacen|qué ofrecen|que ofrecen/i)) {
      botReply(RESPONSES.servicios);
      return;
    }

    // Ubicación general
    if (msg.match(/^(ubicación|ubicacion|zona|barrio|donde|dónde|sectores)(\?)?$/i) ||
        msg.match(/qué zonas|que zonas|en qué parte|en que parte/i)) {
      botReply(RESPONSES.ubicacion);
      return;
    }

    // Buscar propiedades basado en la consulta
    const results = searchProperties(msg);

    if (results.length > 0) {
      let html = `Encontré ${results.length} propiedad${results.length > 1 ? 'es' : ''} que podrían interesarte:`;
      results.forEach(p => { html += createPropertyCard(p); });
      html += '<br>¿Te gustaría ver más detalles de alguna?';
      botReply(html);
      return;
    }

    // Si menciona comprar/arrendar pero no hay resultados específicos
    if (msg.match(/comprar|venta|vender/i)) {
      handleOption('comprar');
      return;
    }

    if (msg.match(/arrendar|arriendo|alquiler|rentar/i)) {
      handleOption('arrendar');
      return;
    }

    if (msg.match(/día|dias|alojamiento|hospedaje|vacaciones/i)) {
      handleOption('alojamiento');
      return;
    }

    if (msg.match(/asesor|agente|hablar|whatsapp/i)) {
      handleOption('whatsapp');
      return;
    }

    // Respuesta por defecto
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
  }

  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
