/* ========================================
   ALTORRA - SERVICIO DE ENVÍO DE EMAILS
   Archivo: js/email-service.js
   Integración con EmailJS
   ======================================== */

(function() {
  'use strict';

  // ===== CONFIGURACIÓN EMAILJS =====
  const EMAILJS_CONFIG = {
    publicKey: 'YOUR_PUBLIC_KEY_HERE',  // ⚠️ CAMBIAR POR TU PUBLIC KEY
    serviceId: 'YOUR_SERVICE_ID_HERE',   // ⚠️ CAMBIAR POR TU SERVICE ID
    templates: {
      contacto: 'template_442jrws',      // Template ID del formulario de contacto ✅
      publicar: 'altorra_publicar',      // Template para publicar propiedad
      detalle: 'altorra_detalle',        // Template para consultas desde detalle
      autorespuesta: 'altorra_confirmacion'  // Template de confirmación al usuario
    }
  };

  // ===== GENERADOR DE RADICADOS =====
  function generateRadicado() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Generar código aleatorio de 4 caracteres
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();

    return `ALTORRA-${year}${month}${day}-${hours}${minutes}${seconds}-${randomCode}`;
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

    try {
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        templateId,
        params,
        EMAILJS_CONFIG.publicKey
      );

      return {
        success: true,
        response: response,
        messageId: response.text
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error,
        message: error.text || 'Error desconocido'
      };
    }
  }

  // ===== PROCESAR FORMULARIO DE CONTACTO =====
  async function processContactForm(form) {
    const data = prepareFormData(form, 'contacto');

    // Enviar email a ALTORRA
    const result = await sendEmail(EMAILJS_CONFIG.templates.contacto, {
      radicado: data.radicado,
      nombre: data.Nombre || data.nombre || '',
      email: data.Email || data.email || '',
      telefono: data.Telefono || data.telefono || data.Teléfono || '',
      motivo: data.Motivo || data.motivo || 'No especificado',
      mensaje: data.Mensaje || data.mensaje || '',
      fecha: data.fecha
    });

    // Enviar autorespuesta al usuario
    if (result.success) {
      await sendEmail(EMAILJS_CONFIG.templates.autorespuesta, {
        radicado: data.radicado,
        nombre: data.Nombre || data.nombre || '',
        to_email: data.Email || data.email || ''
      });
    }

    return {
      success: result.success,
      radicado: data.radicado,
      error: result.error
    };
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

    // Enviar autorespuesta al usuario
    if (result.success) {
      await sendEmail(EMAILJS_CONFIG.templates.autorespuesta, {
        radicado: data.radicado,
        nombre: data.Nombre || data.nombre || '',
        to_email: data.Email || data.email || ''
      });
    }

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

    // Enviar autorespuesta al usuario
    if (result.success) {
      await sendEmail(EMAILJS_CONFIG.templates.autorespuesta, {
        radicado: data.radicado,
        nombre: data.nombre || '',
        to_email: data.email || ''
      });
    }

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
