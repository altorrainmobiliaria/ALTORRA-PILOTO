/* ========================================
   ALTORRA - EXIT INTENT POPUP
   Captura de leads cuando el usuario intenta salir
   ======================================== */

(function() {
  'use strict';

  // Configuración
  const CONFIG = {
    enabled: true,
    storageKey: 'altorra:exit-intent',
    // Frecuencia de muestra
    cooldownDays: 7, // No mostrar nuevamente por X días
    sessionShown: false, // Control por sesión
    // Detección
    threshold: 30, // Píxeles desde el borde superior para activar
    delay: 3000, // Esperar X ms antes de activar detección (evitar falsos positivos)
    // Mobile
    mobileScrollThreshold: 200, // Scroll hacia arriba para activar en móvil
    mobileTimeDelay: 45000, // 45 segundos en mobile como alternativa
    // Analytics
    trackEvents: true
  };

  // Estado del popup
  let popupElement = null;
  let isShowing = false;
  let detectionActive = false;
  let lastScrollY = 0;
  let mobileTimer = null;

  // ========================================
  // STORAGE & FREQUENCY CONTROL
  // ========================================

  /**
   * Verifica si el popup ya fue mostrado recientemente
   */
  function hasBeenShownRecently() {
    try {
      const data = localStorage.getItem(CONFIG.storageKey);
      if (!data) return false;

      const { lastShown, submitted } = JSON.parse(data);

      // Si ya envió el formulario, no mostrar nunca más
      if (submitted) return true;

      // Verificar cooldown period
      if (lastShown) {
        const daysSince = (Date.now() - lastShown) / (1000 * 60 * 60 * 24);
        if (daysSince < CONFIG.cooldownDays) {
          return true;
        }
      }

      return false;
    } catch (e) {
      console.warn('Exit intent storage error:', e);
      return false;
    }
  }

  /**
   * Marca el popup como mostrado
   */
  function markAsShown() {
    try {
      const data = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '{}');
      data.lastShown = Date.now();
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Exit intent storage error:', e);
    }
  }

  /**
   * Marca el formulario como enviado
   */
  function markAsSubmitted() {
    try {
      const data = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '{}');
      data.submitted = true;
      data.submittedAt = Date.now();
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Exit intent storage error:', e);
    }
  }

  // ========================================
  // POPUP UI
  // ========================================

  /**
   * Crea el HTML del popup
   */
  function createPopupHTML() {
    return `
      <div class="exit-intent-overlay" id="exitIntentOverlay" role="dialog" aria-modal="true" aria-labelledby="exitIntentTitle">
        <div class="exit-intent-modal">
          <button class="exit-intent-close" id="exitIntentClose" aria-label="Cerrar popup">
            ✕
          </button>

          <div class="exit-intent-content">
            <div class="exit-intent-icon">🏠</div>
            <h2 id="exitIntentTitle" class="exit-intent-title">¡Espera! No te vayas sin tu asesoría gratuita</h2>
            <p class="exit-intent-description">
              Déjanos tus datos y un asesor experto te contactará para ayudarte a encontrar
              <strong>la propiedad perfecta</strong> en Cartagena.
            </p>

            <form id="exitIntentForm" class="exit-intent-form">
              <div class="exit-intent-field">
                <label for="exitName" class="sr-only">Nombre completo</label>
                <input
                  type="text"
                  id="exitName"
                  name="name"
                  placeholder="Nombre completo *"
                  required
                  minlength="3"
                  autocomplete="name"
                />
              </div>

              <div class="exit-intent-field">
                <label for="exitEmail" class="sr-only">Correo electrónico</label>
                <input
                  type="email"
                  id="exitEmail"
                  name="email"
                  placeholder="Correo electrónico *"
                  required
                  autocomplete="email"
                />
              </div>

              <div class="exit-intent-field">
                <label for="exitPhone" class="sr-only">Teléfono/WhatsApp</label>
                <input
                  type="tel"
                  id="exitPhone"
                  name="phone"
                  placeholder="Teléfono/WhatsApp *"
                  required
                  pattern="[0-9]{10,}"
                  autocomplete="tel"
                />
              </div>

              <div class="exit-intent-field">
                <label for="exitInterest" class="sr-only">¿Qué te interesa?</label>
                <select id="exitInterest" name="interest" required>
                  <option value="">¿Qué te interesa? *</option>
                  <option value="comprar">Comprar una propiedad</option>
                  <option value="arrendar">Arrendar una propiedad</option>
                  <option value="alojamiento">Alojamiento por días</option>
                  <option value="vender">Vender mi propiedad</option>
                  <option value="administracion">Administración de inmuebles</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <button type="submit" class="exit-intent-submit" id="exitIntentSubmit">
                <span class="submit-text">Solicitar Asesoría Gratuita</span>
                <span class="submit-loading" style="display:none;">
                  <span class="spinner"></span> Enviando...
                </span>
              </button>

              <p class="exit-intent-privacy">
                <small>
                  Al enviar, aceptas nuestra
                  <a href="privacidad.html" target="_blank">política de privacidad</a>.
                </small>
              </p>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Muestra el popup
   */
  function showPopup() {
    if (isShowing || CONFIG.sessionShown) return;

    // Verificar cooldown
    if (hasBeenShownRecently()) {
      console.log('🚫 Exit intent: Cooldown activo');
      return;
    }

    isShowing = true;
    CONFIG.sessionShown = true;

    // Crear popup si no existe
    if (!popupElement) {
      const container = document.createElement('div');
      container.innerHTML = createPopupHTML();
      popupElement = container.firstElementChild;
      document.body.appendChild(popupElement);

      // Attach event listeners
      attachEventListeners();
    }

    // Mostrar con animación
    requestAnimationFrame(() => {
      popupElement.classList.add('visible');
      document.body.style.overflow = 'hidden'; // Prevent scroll
    });

    // Marcar como mostrado
    markAsShown();

    // Track analytics
    if (CONFIG.trackEvents && window.AltorraAnalytics) {
      window.AltorraAnalytics.track('exit_intent_shown', {
        page: window.location.pathname
      });
    }

    console.log('✅ Exit intent popup mostrado');
  }

  /**
   * Cierra el popup
   */
  function hidePopup() {
    if (!isShowing || !popupElement) return;

    popupElement.classList.remove('visible');
    document.body.style.overflow = ''; // Restore scroll
    isShowing = false;

    // Track analytics
    if (CONFIG.trackEvents && window.AltorraAnalytics) {
      window.AltorraAnalytics.track('exit_intent_closed', {
        page: window.location.pathname
      });
    }
  }

  // ========================================
  // EVENT HANDLERS
  // ========================================

  /**
   * Maneja el envío del formulario
   */
  function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('#exitIntentSubmit');
    const submitText = submitBtn.querySelector('.submit-text');
    const submitLoading = submitBtn.querySelector('.submit-loading');

    // Validación básica
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Obtener datos del formulario
    const formData = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      interest: form.interest.value,
      source: 'Exit Intent Popup',
      page: window.location.pathname,
      timestamp: new Date().toISOString()
    };

    // Mostrar loading
    submitBtn.disabled = true;
    submitText.style.display = 'none';
    submitLoading.style.display = 'inline-flex';

    // Simular envío (en producción, enviar a API o servicio)
    setTimeout(() => {
      // Marcar como enviado
      markAsSubmitted();

      // Track analytics
      if (CONFIG.trackEvents && window.AltorraAnalytics) {
        window.AltorraAnalytics.track('exit_intent_submitted', {
          interest: formData.interest,
          page: formData.page
        });
      }

      // Mostrar mensaje de éxito
      showSuccessMessage();

      console.log('✅ Exit intent form submitted:', formData);

      // Cerrar popup después de 2 segundos
      setTimeout(() => {
        hidePopup();
      }, 2000);
    }, 1500);
  }

  /**
   * Muestra mensaje de éxito
   */
  function showSuccessMessage() {
    const content = popupElement.querySelector('.exit-intent-content');
    content.innerHTML = `
      <div class="exit-intent-success">
        <div class="exit-intent-icon success">✓</div>
        <h2 class="exit-intent-title">¡Gracias por tu interés!</h2>
        <p class="exit-intent-description">
          Un asesor se contactará contigo en las próximas <strong>24 horas</strong>.
        </p>
        <p style="margin-top: 16px;">
          <a href="https://wa.me/573002439810" target="_blank" class="exit-intent-whatsapp">
            📱 O escríbenos por WhatsApp ahora
          </a>
        </p>
      </div>
    `;
  }

  /**
   * Adjunta event listeners al popup
   */
  function attachEventListeners() {
    // Botón cerrar
    const closeBtn = popupElement.querySelector('#exitIntentClose');
    closeBtn.addEventListener('click', hidePopup);

    // Click en overlay (cerrar)
    const overlay = popupElement.querySelector('.exit-intent-overlay');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        hidePopup();
      }
    });

    // Formulario
    const form = popupElement.querySelector('#exitIntentForm');
    form.addEventListener('submit', handleFormSubmit);

    // ESC key para cerrar
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isShowing) {
        hidePopup();
      }
    });
  }

  // ========================================
  // EXIT INTENT DETECTION
  // ========================================

  /**
   * Detecta intención de salida en desktop (mouse cerca del borde superior)
   */
  function handleMouseMove(e) {
    if (!detectionActive || isShowing) return;

    // Si el mouse está cerca del borde superior y se mueve hacia arriba
    if (e.clientY <= CONFIG.threshold && e.movementY < 0) {
      showPopup();
    }
  }

  /**
   * Detecta intención de salida en móvil (scroll hacia arriba rápido)
   */
  function handleMobileScroll() {
    if (!detectionActive || isShowing) return;

    const currentScrollY = window.scrollY;

    // Scroll hacia arriba rápido (más de X píxeles)
    if (lastScrollY - currentScrollY > CONFIG.mobileScrollThreshold) {
      showPopup();
    }

    lastScrollY = currentScrollY;
  }

  /**
   * Detecta si es dispositivo móvil
   */
  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth < 768;
  }

  /**
   * Inicia la detección de exit intent
   */
  function startDetection() {
    // Esperar un tiempo antes de activar (evitar falsos positivos al cargar)
    setTimeout(() => {
      detectionActive = true;

      if (isMobile()) {
        // Móvil: detectar scroll hacia arriba
        window.addEventListener('scroll', handleMobileScroll, { passive: true });
        lastScrollY = window.scrollY;

        // Alternativa: timer (mostrar después de X segundos)
        if (CONFIG.mobileTimeDelay > 0) {
          mobileTimer = setTimeout(() => {
            showPopup();
          }, CONFIG.mobileTimeDelay);
        }
      } else {
        // Desktop: detectar mouse en borde superior
        document.addEventListener('mousemove', handleMouseMove);
      }

      console.log('✅ Exit intent detection activo');
    }, CONFIG.delay);
  }

  /**
   * Detiene la detección
   */
  function stopDetection() {
    detectionActive = false;
    document.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('scroll', handleMobileScroll);

    if (mobileTimer) {
      clearTimeout(mobileTimer);
      mobileTimer = null;
    }
  }

  // ========================================
  // API PÚBLICA
  // ========================================

  window.AltorraExitIntent = {
    show: showPopup,
    hide: hidePopup,
    enable: () => { CONFIG.enabled = true; startDetection(); },
    disable: () => { CONFIG.enabled = false; stopDetection(); },
    reset: () => {
      localStorage.removeItem(CONFIG.storageKey);
      CONFIG.sessionShown = false;
      console.log('✅ Exit intent reset');
    },
    getConfig: () => CONFIG
  };

  // ========================================
  // INICIALIZACIÓN
  // ========================================

  function init() {
    if (!CONFIG.enabled) {
      console.log('ℹ️ Exit intent deshabilitado');
      return;
    }

    // No activar en ciertas páginas
    const excludedPages = ['/gracias.html', '/404.html', '/privacidad.html'];
    if (excludedPages.some(page => window.location.pathname.includes(page))) {
      console.log('ℹ️ Exit intent: Página excluida');
      return;
    }

    // Iniciar detección
    startDetection();
  }

  // Iniciar cuando DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
