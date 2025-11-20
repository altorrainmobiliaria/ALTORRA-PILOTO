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
    }
  };

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

  // Mostrar error
  function showError(input, message) {
    const parent = input.closest('label') || input.parentElement;
    parent.classList.remove('field-success');
    parent.classList.add('field-error');
    
    let errorEl = parent.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'form-error';
      parent.appendChild(errorEl);
    }
    errorEl.textContent = message;
  }

  // Limpiar error
  function clearError(input) {
    const parent = input.closest('label') || input.parentElement;
    parent.classList.remove('field-error');
    const errorEl = parent.querySelector('.form-error');
    if (errorEl) errorEl.remove();
  }

  // Marcar como válido
  function markValid(input) {
    const parent = input.closest('label') || input.parentElement;
    parent.classList.add('field-success');
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
      
      initRealtimeValidation(form);
      
      form.addEventListener('submit', (e) => {
        if (!validateForm(form)) {
          e.preventDefault();
          
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
            alert.style.cssText = 'padding:12px;background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;color:#991b1b;margin-bottom:16px;font-weight:600';
            alert.textContent = '⚠️ Por favor corrige los errores antes de enviar';
            form.insertBefore(alert, form.firstChild);
            setTimeout(() => alert.remove(), 5000);
          }
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

  // Interceptar envío de formularios para agregar loading states
  function interceptFormSubmit() {
    document.addEventListener('submit', (e) => {
      const form = e.target;

      // Ignorar formularios de búsqueda o que ya tienen handler personalizado
      if (form.id === 'quickSearch' || form.classList.contains('search-box')) return;
      if (form.hasAttribute('data-no-intercept')) return;

      // Solo aplicar loading si el formulario es válido
      if (validateForm(form)) {
        showLoading(form);

        // Si el form va a formsubmit.co, simular success después de envío
        if (form.action && form.action.includes('formsubmit.co')) {
          // FormSubmit.co redirige, así que no podemos detectar success/error
          // Mostramos loading hasta que la página cambie
          console.log('📤 Formulario enviándose a FormSubmit.co...');
        }
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
    showToast
  };

  console.log('✅ Form validation + loading states loaded');

})();
