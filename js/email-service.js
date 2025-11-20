/* ========================================
   ALTORRA - SERVICIO DE ENVÍO DE EMAILS
   Archivo: js/email-service.js
   Integración con EmailJS
   ======================================== */

(function() {
  'use strict';

  // ===== CONFIGURACIÓN EMAILJS =====
  const EMAILJS_CONFIG = {
    publicKey: 'EiJacymAjNl-Q8X1j',     // ✅ Public Key configurado
    serviceId: 'service_tddohxc',        // ✅ Service ID configurado
    templates: {
      contacto: 'template_442jrws',      // Template ID del formulario de contacto ✅
      publicar: 'altorra_publicar',      // Template para publicar propiedad
      detalle: 'altorra_detalle',        // Template para consultas desde detalle
      autorespuesta: 'altorra_confirmacion'  // Template de confirmación al usuario
    }
  };

  // ===== GENERADOR DE RADICADOS =====
  // Formato: ALT + 7 caracteres alfanuméricos = 10 caracteres totales
  function generateRadicado() {
    const now = new Date();

    // Convertir timestamp a base36 para comprimir
    const timestamp = now.getTime();
    const base36 = timestamp.toString(36).toUpperCase();

    // Tomar los últimos 7 caracteres del timestamp en base36
    // Esto da un código único y corto
    const code = base36.slice(-7);

    // Formato: ALT + 7 caracteres = 10 caracteres totales
    // Ejemplo: ALTM8K5X2P
    return `ALT${code}`;
  }

  // ===== FORMATEAR FECHA =====
  function formatDate(date) {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return new Intl.DateTimeFormat('es-CO', options).format(date);
  }

  // ===== PREPARAR DATOS DEL FORMULARIO =====
  function prepareFormData(form, formType) {
    const formData = new FormData(form);
    const data = {};

    // Convertir FormData a objeto
    for (let [key, value] of formData.entries()) {
      // Ignorar campos internos y honeypots
      if (key.startsWith('_') || key === 'website_url') continue;
      data[key] = value;
    }

    // Agregar metadatos
    data.radicado = generateRadicado();
    data.fecha = formatDate(new Date());
    data.tipoFormulario = formType;

    return data;
  }

  // ===== ENVIAR EMAIL CON EMAILJS =====
  async function sendEmail(templateId, params) {
    // Verificar que EmailJS esté cargado
    if (typeof emailjs === 'undefined') {
      throw new Error('EmailJS no está cargado. Verifica que el script esté incluido en la página.');
    }

    // 🐛 DEBUG: Mostrar configuración antes de enviar
    console.log('🔧 Config EmailJS:', {
      serviceId: EMAILJS_CONFIG.serviceId,
      templateId: templateId,
      publicKey: EMAILJS_CONFIG.publicKey.substring(0, 10) + '...'
    });
    console.log('📤 Enviando email con params:', params);

    try {
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        templateId,
        params,
        EMAILJS_CONFIG.publicKey
      );

      console.log('✅ Email enviado exitosamente:', response);

      return {
        success: true,
        response: response,
        messageId: response.text
      };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      console.error('❌ Error details:', {
        message: error.text || error.message,
        status: error.status,
        full: error
      });
      return {
        success: false,
        error: error.text || error.message || 'Error desconocido',
        errorObject: error
      };
    }
  }

  // ===== PROCESAR FORMULARIO DE CONTACTO =====
  async function processContactForm(form) {
    const data = prepareFormData(form, 'contacto');

    // 🐛 DEBUG: Verificar datos extraídos del formulario
    console.log('📋 Datos del formulario:', data);

    // Preparar parámetros para EmailJS
    const emailParams = {
      radicado: data.radicado,
      nombre: data.Nombre || data.nombre || '',
      email: data.Email || data.email || '',
      telefono: data.Telefono || data.telefono || data.Teléfono || '',
      motivo: data.Motivo || data.motivo || 'No especificado',
      mensaje: data.Mensaje || data.mensaje || '',
      fecha: data.fecha
    };

    // 🐛 DEBUG: Verificar parámetros que se envían a EmailJS
    console.log('📧 Parámetros para EmailJS:', emailParams);

    // Enviar email a ALTORRA
    const result = await sendEmail(EMAILJS_CONFIG.templates.contacto, emailParams);

    // 🐛 DEBUG: Verificar resultado del envío
    console.log('📊 Resultado de sendEmail:', result);

    // ⏸️ AUTORESPUESTA DESACTIVADA TEMPORALMENTE
    // (Activar cuando se cree el template altorra_confirmacion en EmailJS)
    /*
    if (result.success) {
      await sendEmail(EMAILJS_CONFIG.templates.autorespuesta, {
        radicado: data.radicado,
        nombre: data.Nombre || data.nombre || '',
        to_email: data.Email || data.email || ''
      });
    }
    */

    const finalResult = {
      success: result.success,
      radicado: data.radicado,
      error: result.error
    };

    // 🐛 DEBUG: Verificar qué se retorna
    console.log('🎯 Retornando:', finalResult);

    return finalResult;
  }

  // ===== PROCESAR FORMULARIO DE PUBLICAR PROPIEDAD =====
  async function processPublishForm(form) {
    const data = prepareFormData(form, 'publicar');

    // Enviar email a ALTORRA
    const result = await sendEmail(EMAILJS_CONFIG.templates.publicar, {
      radicado: data.radicado,
      // Datos del propietario
      nombre: data.Nombre || data.nombre || '',
      email: data.Email || data.email || '',
      telefono: data.Telefono || data.telefono || data.Teléfono || '',
      // Datos de la propiedad
      operacion: data.Operacion || data.operacion || '',
      tipo: data['Tipo de propiedad'] || data.tipo || '',
      precio: data['Precio estimado (COP)'] || data.precio || '',
      descripcion: data['Descripción de la propiedad'] || data.descripcion || '',
      fecha: data.fecha
    });

    // ⏸️ AUTORESPUESTA DESACTIVADA TEMPORALMENTE
    // (Activar cuando se cree el template altorra_confirmacion en EmailJS)
    /*
    if (result.success) {
      await sendEmail(EMAILJS_CONFIG.templates.autorespuesta, {
        radicado: data.radicado,
        nombre: data.Nombre || data.nombre || '',
        to_email: data.Email || data.email || ''
      });
    }
    */

    return {
      success: result.success,
      radicado: data.radicado,
      error: result.error
    };
  }

  // ===== PROCESAR FORMULARIO DE DETALLE =====
  async function processDetailForm(form) {
    const data = prepareFormData(form, 'detalle');

    // Enviar email a ALTORRA
    const result = await sendEmail(EMAILJS_CONFIG.templates.detalle, {
      radicado: data.radicado,
      nombre: data.nombre || '',
      email: data.email || '',
      telefono: data.telefono || '',
      mensaje: data.mensaje || '',
      propiedadId: data.propertyId || '',
      propiedadTitulo: data.propertyTitle || '',
      fecha: data.fecha
    });

    // ⏸️ AUTORESPUESTA DESACTIVADA TEMPORALMENTE
    // (Activar cuando se cree el template altorra_confirmacion en EmailJS)
    /*
    if (result.success) {
      await sendEmail(EMAILJS_CONFIG.templates.autorespuesta, {
        radicado: data.radicado,
        nombre: data.nombre || '',
        to_email: data.email || ''
      });
    }
    */

    return {
      success: result.success,
      radicado: data.radicado,
      error: result.error
    };
  }

  // ===== API PÚBLICA =====
  window.AltorraEmailService = {
    // Procesar formularios
    processContactForm,
    processPublishForm,
    processDetailForm,

    // Utilidades
    generateRadicado,

    // Configuración (para debugging)
    getConfig() {
      return {
        publicKey: EMAILJS_CONFIG.publicKey,
        serviceId: EMAILJS_CONFIG.serviceId,
        templates: EMAILJS_CONFIG.templates
      };
    },

    // Verificar si está configurado
    isConfigured() {
      return EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY_HERE' &&
             EMAILJS_CONFIG.serviceId !== 'YOUR_SERVICE_ID_HERE';
    }
  };

  // Inicializar EmailJS cuando esté disponible
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_CONFIG.publicKey);
    console.log('✅ EmailJS inicializado correctamente');
  } else {
    console.warn('⚠️ EmailJS no está cargado todavía. Asegúrate de incluir el script de EmailJS en tu HTML.');
  }

})();
