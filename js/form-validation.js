/* ========================================
   ALTORRA - VALIDACIÓN DE FORMULARIOS
   Archivo: js/form-validation.js
   ======================================== */

(function() {
  'use strict';

  // Configuración de validación
  const CONFIG = {
    phone: {
      pattern: /^(\+57)?[\s]?3[0-9]{9}$/,
      message: 'Ingresa un número válido de Colombia (ej: 3001234567 o +57 3001234567)'
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Ingresa un correo electrónico válido'
    },
    name: {
      minLength: 3,
      pattern: /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/,
      message: 'El nombre solo puede contener letras y espacios'
    },
    security: {
      minFormTime: 3000,           // Minimum 3 seconds on page before submit
      rateLimitWindow: 10 * 60 * 1000,  // 10 minutes
      maxSubmissions: 3            // Max 3 submissions per window
    }
  };

  // ===== SECURITY FEATURES =====

  // Track form timestamps (when user first saw the form)
  const formLoadTimes = new Map();

  // Rate limiting storage
  function getRateLimitKey(formId) {
    return `altorra:form-limit:${formId}`;
  }

  function checkRateLimit(formId) {
    try {
      const key = getRateLimitKey(formId);
      const data = localStorage.getItem(key);
      if (!data) return true;

      const submissions = JSON.parse(data);
      const now = Date.now();

      // Filter out old submissions outside the window
      const recentSubmissions = submissions.filter(
        timestamp => (now - timestamp) < CONFIG.security.rateLimitWindow
      );

      // Update storage with cleaned data
      if (recentSubmissions.length === 0) {
        localStorage.removeItem(key);
        return true;
      }

      // Check if limit exceeded
      if (recentSubmissions.length >= CONFIG.security.maxSubmissions) {
        return false;
      }

      return true;
    } catch (e) {
      console.warn('Rate limit check failed:', e);
      return true; // Fail open
    }
  }

  function recordSubmission(formId) {
    try {
      const key = getRateLimitKey(formId);
      const data = localStorage.getItem(key);
      const submissions = data ? JSON.parse(data) : [];

      submissions.push(Date.now());

      // Keep only recent submissions
      const recentSubmissions = submissions.filter(
        timestamp => (Date.now() - timestamp) < CONFIG.security.rateLimitWindow
      );

      localStorage.setItem(key, JSON.stringify(recentSubmissions));
    } catch (e) {
      console.warn('Failed to record submission:', e);
    }
  }

  // Honeypot detection
  function checkHoneypot(form) {
    // Check both possible honeypot names (FormSubmit uses _gotcha)
    const honeypot = form.querySelector('input[name="_gotcha"]') || form.querySelector('input[name="website_url"]');
    if (honeypot && honeypot.value.trim() !== '') {
      console.warn('🍯 Honeypot triggered - likely spam');
      return false;
    }
    return true;
  }

  // Timestamp validation (anti-bot: must spend minimum time on form)
  function checkFormTiming(form) {
    const formId = form.id || form.action;
    const loadTime = formLoadTimes.get(formId);

    if (!loadTime) {
      console.warn('No load time recorded for form');
      return true; // Fail open
    }

    const timeSpent = Date.now() - loadTime;
    if (timeSpent < CONFIG.security.minFormTime) {
      console.warn(`Form submitted too fast: ${timeSpent}ms (min: ${CONFIG.security.minFormTime}ms)`);
      return false;
    }

    return true;
  }

  // Initialize form timestamp
  function initFormTimestamp(form) {
    const formId = form.id || form.action;
    formLoadTimes.set(formId, Date.now());

    // Also populate hidden timestamp field if exists
    const timestampField = form.querySelector('input[name="_formtime"]');
    if (timestampField) {
      timestampField.value = Date.now().toString();
    }
  }

  // Estilos para mensajes de error Y loading states
  const ERROR_STYLES = `
    .form-error {
      color: #dc2626;
      font-size: 0.85rem;
      margin-top: 4px;
      display: block;
      font-weight: 600;
    }
    .field-error input,
    .field-error textarea,
    .field-error select {
      border-color: #dc2626 !important;
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
    }
    .field-success input,
    .field-success textarea,
    .field-success select {
      border-color: #16a34a !important;
    }

    /* ===== LOADING STATES ===== */
    .form-loading {
      position: relative;
      pointer-events: none;
      opacity: 0.7;
    }
    .form-loading input,
    .form-loading textarea,
    .form-loading select,
    .form-loading button {
      cursor: not-allowed !important;
    }
    .btn-loading {
      position: relative;
      pointer-events: none;
      opacity: 0.8;
    }
    .btn-loading::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      top: 50%;
      left: 50%;
      margin-left: -8px;
      margin-top: -8px;
      border: 2px solid #fff;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spinner 0.6s linear infinite;
    }
    @keyframes spinner {
      to { transform: rotate(360deg); }
    }

    /* Toast notifications */
    .altorra-toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #111;
      color: #fff;
      padding: 16px 24px;
      border-radius: 12px;
      font-weight: 600;
      z-index: 9999;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideIn 0.3s ease;
      max-width: 400px;
    }
    .altorra-toast.success {
      background: #16a34a;
    }
    .altorra-toast.error {
      background: #dc2626;
    }
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @media (max-width: 640px) {
      .altorra-toast {
        bottom: 16px;
        right: 16px;
        left: 16px;
        max-width: none;
      }
    }
  `;

  // Inyectar estilos
  if (!document.getElementById('form-validation-styles')) {
    const style = document.createElement('style');
    style.id = 'form-validation-styles';
    style.textContent = ERROR_STYLES;
    document.head.appendChild(style);
  }

  // Announce to screen readers
  function announceToScreenReader(message, form) {
    const liveRegion = form.querySelector('[role="status"]') || form.querySelector('#formStatus');
    if (liveRegion) {
      liveRegion.textContent = message;
      // Clear after a delay so it can be announced again if needed
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 3000);
    }
  }

  // Mostrar error
  function showError(input, message) {
    const parent = input.closest('label') || input.parentElement;
    parent.classList.remove('field-success');
    parent.classList.add('field-error');

    // Add aria-invalid
    input.setAttribute('aria-invalid', 'true');

    let errorEl = parent.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'form-error';
      errorEl.id = `${input.id || input.name}-error`;
      errorEl.setAttribute('role', 'alert');
      parent.appendChild(errorEl);

      // Link error to input with aria-describedby
      const currentDescribedBy = input.getAttribute('aria-describedby') || '';
      const describedByIds = currentDescribedBy.split(' ').filter(Boolean);
      if (!describedByIds.includes(errorEl.id)) {
        describedByIds.push(errorEl.id);
        input.setAttribute('aria-describedby', describedByIds.join(' '));
      }
    }
    errorEl.textContent = message;
  }

  // Limpiar error
  function clearError(input) {
    const parent = input.closest('label') || input.parentElement;
    parent.classList.remove('field-error');

    // Remove aria-invalid
    input.removeAttribute('aria-invalid');

    const errorEl = parent.querySelector('.form-error');
    if (errorEl) {
      // Remove error ID from aria-describedby
      const errorId = errorEl.id;
      const currentDescribedBy = input.getAttribute('aria-describedby') || '';
      const describedByIds = currentDescribedBy.split(' ').filter(id => id !== errorId && id);
      if (describedByIds.length > 0) {
        input.setAttribute('aria-describedby', describedByIds.join(' '));
      } else {
        input.removeAttribute('aria-describedby');
      }

      errorEl.remove();
    }
  }

  // Marcar como válido
  function markValid(input) {
    const parent = input.closest('label') || input.parentElement;
    parent.classList.add('field-success');

    // Ensure aria-invalid is false
    input.setAttribute('aria-invalid', 'false');
  }

  // Validar teléfono
  function validatePhone(input) {
    const value = input.value.trim();
    if (!value) {
      showError(input, 'Este campo es obligatorio');
      return false;
    }
    if (!CONFIG.phone.pattern.test(value)) {
      showError(input, CONFIG.phone.message);
      return false;
    }
    clearError(input);
    markValid(input);
    return true;
  }

  // Validar email
  function validateEmail(input) {
    const value = input.value.trim();
    if (!value) {
      showError(input, 'Este campo es obligatorio');
      return false;
    }
    if (!CONFIG.email.pattern.test(value)) {
      showError(input, CONFIG.email.message);
      return false;
    }
    clearError(input);
    markValid(input);
    return true;
  }

  // Validar nombre
  function validateName(input) {
    const value = input.value.trim();
    if (!value) {
      showError(input, 'Este campo es obligatorio');
      return false;
    }
    if (value.length < CONFIG.name.minLength) {
      showError(input, `Mínimo ${CONFIG.name.minLength} caracteres`);
      return false;
    }
    if (!CONFIG.name.pattern.test(value)) {
      showError(input, CONFIG.name.message);
      return false;
    }
    clearError(input);
    markValid(input);
    return true;
  }

  // Validar campo requerido genérico
  function validateRequired(input) {
    const value = input.value.trim();
    if (!value) {
      showError(input, 'Este campo es obligatorio');
      return false;
    }
    clearError(input);
    markValid(input);
    return true;
  }

  // Validar número
  function validateNumber(input) {
    const value = input.value.trim();
    if (input.hasAttribute('required') && !value) {
      showError(input, 'Este campo es obligatorio');
      return false;
    }
    if (value && isNaN(value)) {
      showError(input, 'Ingresa solo números');
      return false;
    }
    const min = input.getAttribute('min');
    if (min && Number(value) < Number(min)) {
      showError(input, `El valor mínimo es ${min}`);
      return false;
    }
    clearError(input);
    if (value) markValid(input);
    return true;
  }

  // Validar formulario completo
  function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      // Ignorar campos ocultos y honey pot
      if (input.type === 'hidden' || input.name === '_honey') return;
      
      let fieldValid = true;
      
      // Validaciones por tipo
      if (input.type === 'email' || input.name.toLowerCase().includes('email')) {
        fieldValid = validateEmail(input);
      } else if (input.type === 'tel' || input.name.toLowerCase().includes('tel') || input.name.toLowerCase().includes('phone')) {
        fieldValid = validatePhone(input);
      } else if (input.type === 'number') {
        fieldValid = validateNumber(input);
      } else if (input.name.toLowerCase().includes('nombre') || input.name.toLowerCase().includes('name')) {
        fieldValid = validateName(input);
      } else if (input.hasAttribute('required')) {
        fieldValid = validateRequired(input);
      }
      
      if (!fieldValid) isValid = false;
    });
    
    return isValid;
  }

  // Inicializar validación en tiempo real
  function initRealtimeValidation(form) {
    const inputs = form.querySelectorAll('input:not([type="hidden"]), textarea, select');
    
    inputs.forEach(input => {
      // Validar al salir del campo
      input.addEventListener('blur', () => {
        if (input.value.trim()) {
          if (input.type === 'email' || input.name.toLowerCase().includes('email')) {
            validateEmail(input);
          } else if (input.type === 'tel' || input.name.toLowerCase().includes('tel')) {
            validatePhone(input);
          } else if (input.type === 'number') {
            validateNumber(input);
          } else if (input.name.toLowerCase().includes('nombre') || input.name.toLowerCase().includes('name')) {
            validateName(input);
          }
        }
      });
      
      // Limpiar error al escribir
      input.addEventListener('input', () => {
        if (input.parentElement.classList.contains('field-error')) {
          clearError(input);
        }
      });
    });
  }

  // Inicializar en todos los formularios
  document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
      // Ignorar formularios de búsqueda
      if (form.id === 'quickSearch' || form.classList.contains('search-box')) return;

      // Initialize timestamp tracking
      initFormTimestamp(form);

      initRealtimeValidation(form);

      form.addEventListener('submit', (e) => {
        // ===== SECURITY CHECKS FIRST =====
        const formId = form.id || 'form';

        // Check honeypot
        if (!checkHoneypot(form)) {
          e.preventDefault();
          console.warn('🚫 Form blocked: Honeypot detected spam');
          showToast('Error al enviar el formulario. Intenta nuevamente.', 'error');
          return;
        }

        // Check timing (anti-bot)
        if (!checkFormTiming(form)) {
          e.preventDefault();
          console.warn('🚫 Form blocked: Submitted too fast');
          showToast('Por favor, tómate un momento para revisar el formulario.', 'error');
          return;
        }

        // Check rate limit
        if (!checkRateLimit(formId)) {
          e.preventDefault();
          console.warn('🚫 Form blocked: Rate limit exceeded');
          showToast('Has enviado muchos formularios. Intenta nuevamente en unos minutos.', 'error');
          return;
        }

        // ===== VALIDATION CHECKS =====
        if (!validateForm(form)) {
          e.preventDefault();

          // Count errors for screen reader announcement
          const errorCount = form.querySelectorAll('.field-error').length;
          const errorMessage = errorCount === 1
            ? 'Hay 1 error en el formulario. Por favor corrígelo antes de enviar.'
            : `Hay ${errorCount} errores en el formulario. Por favor corrígelos antes de enviar.`;

          // Announce to screen readers
          announceToScreenReader(errorMessage, form);

          // Scroll al primer error
          const firstError = form.querySelector('.field-error input, .field-error textarea, .field-error select');
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
          }

          // Mostrar mensaje global
          const existingAlert = form.querySelector('.form-alert');
          if (!existingAlert) {
            const alert = document.createElement('div');
            alert.className = 'form-alert';
            alert.setAttribute('role', 'alert');
            alert.style.cssText = 'padding:12px;background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;color:#991b1b;margin-bottom:16px;font-weight:600';
            alert.textContent = '⚠️ Por favor corrige los errores antes de enviar';
            form.insertBefore(alert, form.firstChild);
            setTimeout(() => alert.remove(), 5000);
          }
        } else {
          // Form is valid and passed security checks
          // Announce success to screen readers
          announceToScreenReader('Formulario válido. Enviando...', form);

          // Record this submission for rate limiting
          recordSubmission(formId);
        }
      });
    });
  });

  // ===== LOADING STATES =====

  // Mostrar estado de carga en formulario
  function showLoading(form) {
    form.classList.add('form-loading');
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.textContent = 'Enviando...';
      submitBtn.classList.add('btn-loading');
      submitBtn.disabled = true;
    }
    // Deshabilitar todos los inputs
    form.querySelectorAll('input, textarea, select, button').forEach(el => {
      el.disabled = true;
    });
  }

  // Ocultar estado de carga
  function hideLoading(form) {
    form.classList.remove('form-loading');
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      if (submitBtn.dataset.originalText) {
        submitBtn.textContent = submitBtn.dataset.originalText;
        delete submitBtn.dataset.originalText;
      }
      submitBtn.classList.remove('btn-loading');
      submitBtn.disabled = false;
    }
    // Re-habilitar todos los inputs
    form.querySelectorAll('input, textarea, select, button').forEach(el => {
      el.disabled = false;
    });
  }

  // Mostrar toast notification
  function showToast(message, type = 'success') {
    // Remover toast anterior si existe
    const existingToast = document.querySelector('.altorra-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `altorra-toast ${type}`;

    const icon = type === 'success' ? '✓' : '✕';
    toast.innerHTML = `<span style="font-size:1.5rem">${icon}</span><span>${message}</span>`;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ===== AJAX FORM SUBMISSION =====

  /**
   * Submit form via AJAX instead of full page reload
   * @param {HTMLFormElement} form - The form to submit
   * @returns {Promise<boolean>} - Success status
   */
  async function submitFormAjax(form) {
    try {
      // Create FormData from form
      const formData = new FormData(form);

      // Get form action URL
      const actionUrl = form.action;

      // Send via fetch with JSON accept header for FormSubmit.co
      const response = await fetch(actionUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'  // FormSubmit.co returns JSON with this header
        }
      });

      // Check response
      if (response.ok) {
        // Success!
        console.log('✅ Form submitted successfully via AJAX');

        // Announce to screen readers
        announceToScreenReader('Formulario enviado correctamente. Gracias por contactarnos.', form);

        // Show success message
        showToast('¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');

        // Reset form
        form.reset();

        // Clear all field states
        form.querySelectorAll('.field-success, .field-error').forEach(el => {
          el.classList.remove('field-success', 'field-error');
        });

        // Remove all aria-invalid attributes
        form.querySelectorAll('[aria-invalid]').forEach(el => {
          el.removeAttribute('aria-invalid');
        });

        // Track analytics if available
        if (window.AltorraAnalytics) {
          window.AltorraAnalytics.track('form_submit', {
            form: form.id || 'unknown',
            method: 'ajax'
          });
        }

        return true;
      } else {
        // Error response
        console.error('❌ Form submission failed:', response.status, response.statusText);

        // Try to parse error message
        let errorMessage = 'Error al enviar el formulario. Por favor intenta nuevamente.';
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // Couldn't parse JSON, use default message
        }

        // Announce to screen readers
        announceToScreenReader(errorMessage, form);

        // Show error toast
        showToast(errorMessage, 'error');

        return false;
      }
    } catch (error) {
      // Network error or other exception
      console.error('❌ Form submission error:', error);

      const errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';

      // Announce to screen readers
      announceToScreenReader(errorMessage, form);

      // Show error toast
      showToast(errorMessage, 'error');

      return false;
    }
  }

  // Interceptar envío de formularios para AJAX + loading states
  function interceptFormSubmit() {
    document.addEventListener('submit', async (e) => {
      const form = e.target;

      // Ignorar formularios de búsqueda o que ya tienen handler personalizado
      if (form.id === 'quickSearch' || form.classList.contains('search-box')) return;
      if (form.hasAttribute('data-no-intercept')) return;

      // Prevent default form submission (we'll handle via AJAX)
      e.preventDefault();

      // Solo continuar si el formulario es válido
      if (!validateForm(form)) {
        return;
      }

      // Show loading state
      showLoading(form);

      // Submit via AJAX
      const success = await submitFormAjax(form);

      // Hide loading state
      hideLoading(form);

      // Reset form timestamp if successful (allow immediate resubmission)
      if (success) {
        initFormTimestamp(form);
      }
    });
  }

  // Inicializar interceptor
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', interceptFormSubmit);
  } else {
    interceptFormSubmit();
  }

  // Exponer API global
  window.AltorraFormValidation = {
    validate: validateForm,
    validatePhone,
    validateEmail,
    validateName,
    showLoading,
    hideLoading,
    showToast,
    // AJAX features
    submitFormAjax,
    // Security features
    checkHoneypot,
    checkRateLimit,
    checkFormTiming,
    initFormTimestamp,
    // Accessibility features
    announceToScreenReader,
    showError,
    clearError,
    markValid
  };

  console.log('✅ Form validation + AJAX + security + accessibility loaded');

})();
