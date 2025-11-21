/* ========================================
   ALTORRA - SERVICIO DE ENVÍO DE EMAILS
   Archivo: js/email-service.js
   Integración con EmailJS
   ======================================== */

(function() {
  'use strict';

  // ===== CONFIGURACIÓN EMAILJS =====
  const PUBLIC_KEY  = "EiJacymAjNl-Q8X1j";       // Public Key de EmailJS
  const SERVICE_ID  = "service_tddohxc";         // Service ID configurado
  const TEMPLATE_CONTACTO = "template_442jrws";  // Template: altorra_contacto
  const TEMPLATE_PUBLICAR = "altorra_publicar";  // Template: publicar propiedad
  const TEMPLATE_DETALLE  = "altorra_detalle";   // Template: detalle propiedad

  // ⚠️ IMPORTANTE - WHITELIST DE DOMINIOS EN EMAILJS:
  // Para evitar errores de conexión (CORS/401), debes agregar estos dominios
  // en EmailJS Dashboard → Account → Authorized Domains:
  //   - https://altorrainmobiliaria.github.io
  //   - https://altorrainmobiliaria.github.io/*
  //   - https://*.github.io
  //   - http://localhost (para pruebas locales)
  //
  // Sin el whitelist, EmailJS rechazará las solicitudes con error de conexión.

  // ===== GENERADOR DE RADICADOS =====
  // Formato: ALT-timestamp (ej: ALT-1732143856789)
  function generateRadicado() {
    return "ALT-" + Date.now();
  }

  // ===== FORMATEAR FECHA =====
  function formatDate(date) {
    return date.toLocaleString("es-CO", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  // ===== FUNCIÓN PARA MOSTRAR ESTADO =====
  function setStatus(message, type) {
    const statusEl = document.getElementById("formStatus");
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.dataset.type = type || "";
    }
  }

  // ===== INICIALIZAR EMAILJS =====
  function initEmailJS() {
    if (typeof emailjs === 'undefined') {
      console.error('❌ EmailJS no está cargado');
      return false;
    }
    emailjs.init(PUBLIC_KEY);
    console.log('✅ EmailJS inicializado correctamente');
    return true;
  }

  // ===== PROCESAR FORMULARIO DE CONTACTO =====
  function processContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Validación básica
      const nombre   = document.getElementById("contactNombre").value.trim();
      const email    = document.getElementById("contactEmail").value.trim();
      const telefono = document.getElementById("contactTelefono").value.trim();
      const motivo   = document.getElementById("contactMotivo").value;
      const mensaje  = document.getElementById("contactMensaje").value.trim();

      if (!nombre || !email || !telefono || !motivo || !mensaje) {
        setStatus("Por favor completa todos los campos obligatorios.", "error");
        return;
      }

      // Generar radicado y fecha
      const radicado = generateRadicado();
      const fecha    = formatDate(new Date());

      // Preparar parámetros para EmailJS (nombres en minúscula)
      const templateParams = {
        nombre:   nombre,
        email:    email,
        telefono: telefono,
        motivo:   motivo,
        mensaje:  mensaje,
        fecha:    fecha,
        radicado: radicado
      };

      // Debug mejorado - Verificar que todos los campos tienen datos
      console.log('📤 Enviando formulario de contacto');
      console.log('📋 Parámetros enviados a EmailJS:', templateParams);
      console.log('✅ Verificación de datos:');
      console.log('  - Nombre:', nombre ? '✓' : '✗ VACÍO');
      console.log('  - Email:', email ? '✓' : '✗ VACÍO');
      console.log('  - Teléfono:', telefono ? '✓' : '✗ VACÍO');
      console.log('  - Motivo:', motivo ? '✓' : '✗ VACÍO');
      console.log('  - Mensaje:', mensaje ? '✓' : '✗ VACÍO');
      console.log('  - Radicado:', radicado);
      console.log('⚠️ IMPORTANTE: Las variables del template EmailJS deben estar en minúscula:');
      console.log('   {{nombre}}, {{email}}, {{telefono}}, {{motivo}}, {{mensaje}}, {{fecha}}, {{radicado}}');

      // Deshabilitar botón
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Enviando...";
      }
      setStatus("Enviando tu mensaje…", "info");

      // Enviar con EmailJS
      console.log('🚀 Iniciando envío a EmailJS...');
      console.log('   Service ID:', SERVICE_ID);
      console.log('   Template ID:', TEMPLATE_CONTACTO);

      emailjs.send(SERVICE_ID, TEMPLATE_CONTACTO, templateParams)
        .then(function (response) {
          console.log('✅ Email enviado exitosamente!');
          console.log('   Status:', response.status);
          console.log('   Text:', response.text);
          console.log('📬 Revisa tu email: altorrainmobiliaria@gmail.com');
          console.log('   Si los campos llegan vacíos, verifica que las variables del template estén en minúscula.');
          setStatus("Mensaje enviado correctamente.", "success");

          // Redirigir a página de gracias
          setTimeout(function() {
            window.location.href = "gracias.html";
          }, 1000);
        })
        .catch(function (error) {
          console.error("❌ Error al enviar email");
          console.error("   Tipo de error:", error.name || 'Unknown');
          console.error("   Mensaje:", error.text || error.message || 'Sin detalles');
          console.error("   Status:", error.status || 'N/A');
          console.error("   Detalles completos:", error);

          // Mensajes de error más específicos
          let errorMsg = "No fue posible enviar el mensaje. ";
          if (error.status === 401) {
            errorMsg += "Credenciales de EmailJS inválidas.";
            console.error("💡 Solución: Verifica PUBLIC_KEY y SERVICE_ID en email-service.js");
          } else if (error.status === 404) {
            errorMsg += "Template no encontrado.";
            console.error("💡 Solución: Verifica que el template_442jrws existe en EmailJS");
          } else if (error.text && error.text.includes('limit')) {
            errorMsg += "Límite de envíos alcanzado.";
            console.error("💡 Solución: Verifica tu cuota en EmailJS dashboard");
          } else {
            errorMsg += "Intenta de nuevo en unos minutos.";
          }

          setStatus(errorMsg, "error");

          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Enviar mensaje";
          }
        });
    });
  }

  // ===== PROCESAR FORMULARIO DE PUBLICAR PROPIEDAD =====
  function processPublishForm() {
    const form = document.getElementById("publishForm");
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Obtener valores con los IDs correctos del formulario
      const nombre      = document.getElementById("publishNombre")?.value.trim() || "";
      const email       = document.getElementById("publishEmail")?.value.trim() || "";
      const telefono    = document.getElementById("publishTelefono")?.value.trim() || "";
      const operacion   = document.getElementById("publishOperacion")?.value || "";
      const tipo        = document.getElementById("publishTipo")?.value || "";
      const precio      = document.getElementById("publishPrecio")?.value.trim() || "";
      const descripcion = document.getElementById("publishDescripcion")?.value.trim() || "";

      if (!nombre || !email || !telefono || !operacion || !tipo) {
        setStatus("Por favor completa todos los campos obligatorios.", "error");
        return;
      }

      const radicado = generateRadicado();
      const fecha    = formatDate(new Date());

      const templateParams = {
        radicado:     radicado,
        nombre:       nombre,
        email:        email,
        telefono:     telefono,
        operacion:    operacion,
        tipo:         tipo,
        precio:       precio,
        descripcion:  descripcion,
        fecha:        fecha
      };

      console.log('📤 Enviando formulario de publicar:', templateParams);

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Enviando...";
      }
      setStatus("Enviando tu solicitud…", "info");

      emailjs.send(SERVICE_ID, TEMPLATE_PUBLICAR, templateParams)
        .then(function (response) {
          console.log('✅ Email enviado exitosamente:', response);
          setStatus("Solicitud enviada correctamente.", "success");

          setTimeout(function() {
            window.location.href = "gracias.html";
          }, 1000);
        })
        .catch(function (error) {
          console.error("❌ Error al enviar email:", error);
          setStatus("No fue posible enviar la solicitud. Intenta de nuevo.", "error");

          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Publicar propiedad";
          }
        });
    });
  }

  // ===== PROCESAR FORMULARIO DE DETALLE =====
  function processDetailForm() {
    const form = document.getElementById("detailContactForm");
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const nombre          = document.getElementById("detailNombre")?.value.trim() || "";
      const email           = document.getElementById("detailEmail")?.value.trim() || "";
      const telefono        = document.getElementById("detailTelefono")?.value.trim() || "";
      const mensaje         = document.getElementById("detailMensaje")?.value.trim() || "";
      const propiedadId     = document.getElementById("detailPropertyId")?.value || "";
      const propiedadTitulo = document.getElementById("detailPropertyTitle")?.value || "";

      if (!nombre || !email || !telefono || !mensaje) {
        setStatus("Por favor completa todos los campos obligatorios.", "error");
        return;
      }

      const radicado = generateRadicado();
      const fecha    = formatDate(new Date());

      const templateParams = {
        radicado:         radicado,
        nombre:           nombre,
        email:            email,
        telefono:         telefono,
        mensaje:          mensaje,
        propiedadId:      propiedadId,
        propiedadTitulo:  propiedadTitulo,
        fecha:            fecha
      };

      console.log('📤 Enviando formulario de detalle:', templateParams);

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Enviando...";
      }
      setStatus("Enviando tu consulta…", "info");

      emailjs.send(SERVICE_ID, TEMPLATE_DETALLE, templateParams)
        .then(function (response) {
          console.log('✅ Email enviado exitosamente:', response);
          setStatus("Consulta enviada correctamente.", "success");

          setTimeout(function() {
            window.location.href = "gracias.html";
          }, 1000);
        })
        .catch(function (error) {
          console.error("❌ Error al enviar email:", error);
          setStatus("No fue posible enviar la consulta. Intenta de nuevo.", "error");

          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Enviar consulta";
          }
        });
    });
  }

  // ===== INICIALIZACIÓN =====
  document.addEventListener("DOMContentLoaded", function () {
    if (!initEmailJS()) {
      console.error('❌ No se pudo inicializar EmailJS');
      return;
    }

    // Inicializar el formulario correspondiente según la página
    processContactForm();
    processPublishForm();
    processDetailForm();
  });

  // ===== API PÚBLICA (para debugging) =====
  window.AltorraEmailService = {
    generateRadicado: generateRadicado,
    getConfig: function() {
      return {
        publicKey: PUBLIC_KEY,
        serviceId: SERVICE_ID,
        templates: {
          contacto: TEMPLATE_CONTACTO,
          publicar: TEMPLATE_PUBLICAR,
          detalle: TEMPLATE_DETALLE
        }
      };
    },
    isConfigured: function() {
      return PUBLIC_KEY !== 'YOUR_PUBLIC_KEY_HERE' &&
             SERVICE_ID !== 'YOUR_SERVICE_ID_HERE';
    }
  };

})();
