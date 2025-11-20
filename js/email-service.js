/* ========================================
   ALTORRA - EMAIL SERVICE (EmailJS)
   Archivo: js/email-service.js
   Sistema de envío de emails sin backend
   ======================================== */

(function() {
  'use strict';

  // =============================================
  // CONFIGURACIÓN DE EmailJS
  // =============================================

  const EMAIL_CONFIG = {
    // TODO: Reemplazar con tus credenciales reales de EmailJS
    // 1. Crear cuenta en https://www.emailjs.com/
    // 2. Crear servicio de email (Gmail)
    // 3. Crear templates
    // 4. Reemplazar estos valores

    publicKey: 'YOUR_PUBLIC_KEY', // Tu Public Key de EmailJS
    serviceId: 'service_altorra', // ID del servicio
    templates: {
      contactForm: 'template_contacto',        // Template para contacto.html
      publishForm: 'template_publicar',        // Template para publicar-propiedad.html
      detailForm: 'template_detalle',          // Template para detalle-propiedad.html
      autoResponse: 'template_autorespuesta'   // Template de respuesta automática al usuario
    },
    toEmail: 'altorrainmobiliaria@gmail.com'
  };

  // =============================================
  // SISTEMA DE RADICADOS
  // =============================================

  /**
   * Genera número de radicado único
   * Formato: ALTORRA-YYYYMMDD-HHMMSS-RND
   * Ejemplo: ALTORRA-20251120-143025-A7F3
   */
  function generateRadicado() {
    const now = new Date();

    // Fecha: YYYYMMDD
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePart = `${year}${month}${day}`;

    // Hora: HHMMSS
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timePart = `${hours}${minutes}${seconds}`;

    // Random: 4 caracteres alfanuméricos
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `ALTORRA-${datePart}-${timePart}-${randomPart}`;
  }

  // =============================================
  // INICIALIZACIÓN DE EmailJS
  // =============================================

  /**
   * Inicializa EmailJS con la public key
   */
  function initEmailJS() {
    try {
      if (typeof emailjs === 'undefined') {
        console.error('❌ EmailJS no está cargado. Verifica el script en el HTML.');
        return false;
      }

      emailjs.init(EMAIL_CONFIG.publicKey);
      console.log('✅ EmailJS inicializado correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error al inicializar EmailJS:', error);
      return false;
    }
  }

  // =============================================
  // ENVÍO DE EMAILS
  // =============================================

  /**
   * Envía email usando EmailJS
   * @param {string} templateId - ID del template
   * @param {Object} data - Datos del formulario
   * @returns {Promise}
   */
  async function sendEmail(templateId, data) {
    try {
      const response = await emailjs.send(
        EMAIL_CONFIG.serviceId,
        templateId,
        data
      );

      console.log('✅ Email enviado:', response);
      return {
        success: true,
        response: response
      };
    } catch (error) {
      console.error('❌ Error al enviar email:', error);
      return {
        success: false,
        error: error
      };
    }
  }

  /**
   * Envía email de confirmación al usuario
   * @param {Object} data - Datos del formulario
   * @returns {Promise}
   */
  async function sendAutoResponse(data) {
    const autoResponseData = {
      to_email: data.Email || data.email,
      to_name: data.Nombre || data.nombre,
      radicado: data.radicado,
      message: `Hemos recibido tu solicitud con número de radicado: ${data.radicado}. Un asesor de Altorra se pondrá en contacto contigo pronto.`
    };

    return await sendEmail(EMAIL_CONFIG.templates.autoResponse, autoResponseData);
  }

  // =============================================
  // PROCESAMIENTO DE FORMULARIOS
  // =============================================

  /**
   * Procesa y envía formulario de contacto
   * @param {FormData} formData - Datos del formulario
   * @param {string} formType - Tipo de formulario (contactForm, publishForm, detailForm)
   * @returns {Promise}
   */
  async function processForm(formData, formType = 'contactForm') {
    try {
      // Generar radicado
      const radicado = generateRadicado();

      // Convertir FormData a objeto
      const data = {};
      for (let [key, value] of formData.entries()) {
        // Ignorar campos ocultos de seguridad
        if (key.startsWith('_') || key === 'g-recaptcha-response') {
          continue;
        }
        data[key] = value;
      }

      // Agregar radicado y metadata
      data.radicado = radicado;
      data.to_email = EMAIL_CONFIG.toEmail;
      data.fecha_envio = new Date().toLocaleString('es-CO', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Determinar template según tipo de formulario
      let templateId;
      switch (formType) {
        case 'contactForm':
          templateId = EMAIL_CONFIG.templates.contactForm;
          break;
        case 'publishForm':
          templateId = EMAIL_CONFIG.templates.publishForm;
          break;
        case 'detailForm':
          templateId = EMAIL_CONFIG.templates.detailForm;
          break;
        default:
          templateId = EMAIL_CONFIG.templates.contactForm;
      }

      // Enviar email principal a Altorra
      console.log('📧 Enviando email principal...', data);
      const mainEmailResult = await sendEmail(templateId, data);

      if (!mainEmailResult.success) {
        throw new Error('No se pudo enviar el email principal');
      }

      // Enviar auto-respuesta al usuario
      console.log('📧 Enviando confirmación al usuario...');
      const autoResponseResult = await sendAutoResponse(data);

      if (!autoResponseResult.success) {
        console.warn('⚠️ Email principal enviado pero falló la auto-respuesta');
      }

      return {
        success: true,
        radicado: radicado,
        data: data
      };

    } catch (error) {
      console.error('❌ Error al procesar formulario:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido al enviar el formulario'
      };
    }
  }

  // =============================================
  // API PÚBLICA
  // =============================================

  window.AltorraEmailService = {
    init: initEmailJS,
    generateRadicado: generateRadicado,
    sendEmail: sendEmail,
    processForm: processForm,
    config: EMAIL_CONFIG
  };

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmailJS);
  } else {
    initEmailJS();
  }

})();
