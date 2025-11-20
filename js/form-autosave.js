/* ========================================
   ALTORRA - AUTO-GUARDADO DE FORMULARIOS
   Archivo: js/form-autosave.js
   Guarda borradores automáticamente en localStorage
   ======================================== */

(function() {
  'use strict';

  // Configuración
  const CONFIG = {
    storagePrefix: 'altorra:draft:',     // Prefijo para localStorage
    saveDelay: 2000,                     // Debounce: guardar después de 2s sin escribir
    excludedFields: ['_gotcha', '_honey', '_captcha', '_template', '_next', '_autoresponse', '_formtime'],
    excludedTypes: ['hidden', 'submit', 'button'],
    // Forms to enable autosave (by ID or class)
    enabledForms: ['contactForm', 'publishForm'],
    maxDraftAge: 7 * 24 * 60 * 60 * 1000,  // 7 días
    showNotifications: true
  };

  // Timers para debouncing
  const saveTimers = new Map();

  // Track which forms have been restored
  const restoredForms = new Set();

  // ===== STORAGE HELPERS =====

  /**
   * Get storage key for a form
   */
  function getStorageKey(formId) {
    return `${CONFIG.storagePrefix}${formId}`;
  }

  /**
   * Save draft to localStorage
   */
  function saveDraft(formId, data) {
    try {
      const draft = {
        data,
        savedAt: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(getStorageKey(formId), JSON.stringify(draft));
      console.log(`💾 Draft saved for ${formId}`);
      return true;
    } catch (e) {
      console.warn('Failed to save draft:', e);
      return false;
    }
  }

  /**
   * Load draft from localStorage
   */
  function loadDraft(formId) {
    try {
      const stored = localStorage.getItem(getStorageKey(formId));
      if (!stored) return null;

      const draft = JSON.parse(stored);

      // Check if draft is too old
      const age = Date.now() - draft.savedAt;
      if (age > CONFIG.maxDraftAge) {
        console.log(`🗑️ Draft for ${formId} expired, removing`);
        clearDraft(formId);
        return null;
      }

      return draft;
    } catch (e) {
      console.warn('Failed to load draft:', e);
      return null;
    }
  }

  /**
   * Clear draft from localStorage
   */
  function clearDraft(formId) {
    try {
      localStorage.removeItem(getStorageKey(formId));
      console.log(`🗑️ Draft cleared for ${formId}`);
      return true;
    } catch (e) {
      console.warn('Failed to clear draft:', e);
      return false;
    }
  }

  /**
   * Check if draft exists
   */
  function hasDraft(formId) {
    return loadDraft(formId) !== null;
  }

  // ===== FORM DATA EXTRACTION =====

  /**
   * Extract form data as object
   */
  function extractFormData(form) {
    const data = {};
    const formData = new FormData(form);

    for (const [name, value] of formData.entries()) {
      // Skip excluded fields
      if (CONFIG.excludedFields.includes(name)) continue;

      // Skip empty values
      if (!value || value.trim() === '') continue;

      // Get input element to check type
      const input = form.querySelector(`[name="${name}"]`);
      if (input && CONFIG.excludedTypes.includes(input.type)) continue;

      // Store value
      data[name] = value;
    }

    return data;
  }

  /**
   * Restore form data from object
   */
  function restoreFormData(form, data) {
    Object.entries(data).forEach(([name, value]) => {
      const input = form.querySelector(`[name="${name}"]`);
      if (!input) return;

      // Set value based on input type
      if (input.type === 'checkbox') {
        input.checked = value === 'on' || value === true;
      } else if (input.type === 'radio') {
        const radio = form.querySelector(`[name="${name}"][value="${value}"]`);
        if (radio) radio.checked = true;
      } else {
        input.value = value;
      }

      // Trigger input event to update any listeners
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  // ===== UI INDICATORS =====

  /**
   * Show draft notification banner
   */
  function showDraftNotification(form, draft) {
    // Don't show if already shown
    if (form.querySelector('.draft-notification')) return;

    const savedDate = new Date(draft.savedAt);
    const timeAgo = getTimeAgo(draft.savedAt);

    const notification = document.createElement('div');
    notification.className = 'draft-notification';
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');
    notification.innerHTML = `
      <div class="draft-notification-content">
        <div class="draft-icon">💾</div>
        <div class="draft-text">
          <strong>Borrador guardado</strong>
          <span class="draft-time">Guardado ${timeAgo}</span>
        </div>
        <div class="draft-actions">
          <button type="button" class="draft-restore-btn" aria-label="Restaurar borrador">
            Restaurar
          </button>
          <button type="button" class="draft-clear-btn" aria-label="Eliminar borrador">
            Eliminar
          </button>
        </div>
      </div>
    `;

    // Insert at top of form
    form.insertBefore(notification, form.firstChild);

    // Add event listeners
    notification.querySelector('.draft-restore-btn').addEventListener('click', () => {
      restoreFormData(form, draft.data);
      notification.remove();
      restoredForms.add(form.id);

      if (CONFIG.showNotifications && window.AltorraFormValidation) {
        window.AltorraFormValidation.showToast('Borrador restaurado correctamente', 'success');
      }
    });

    notification.querySelector('.draft-clear-btn').addEventListener('click', () => {
      clearDraft(form.id);
      notification.remove();

      if (CONFIG.showNotifications && window.AltorraFormValidation) {
        window.AltorraFormValidation.showToast('Borrador eliminado', 'success');
      }
    });
  }

  /**
   * Show auto-save indicator (small icon)
   */
  function showSaveIndicator(form) {
    let indicator = form.querySelector('.autosave-indicator');

    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'autosave-indicator';
      indicator.setAttribute('aria-live', 'polite');
      indicator.setAttribute('role', 'status');
      form.appendChild(indicator);
    }

    indicator.innerHTML = '💾 Guardando...';
    indicator.classList.add('saving');

    // Change to "saved" after a moment
    setTimeout(() => {
      indicator.innerHTML = '✓ Guardado';
      indicator.classList.remove('saving');
      indicator.classList.add('saved');

      // Fade out after 2 seconds
      setTimeout(() => {
        indicator.classList.remove('saved');
      }, 2000);
    }, 500);
  }

  // ===== UTILITY FUNCTIONS =====

  /**
   * Get human-readable time ago
   */
  function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'hace unos segundos';
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} horas`;
    return `hace ${Math.floor(seconds / 86400)} días`;
  }

  // ===== DEBOUNCED SAVE =====

  /**
   * Schedule a save with debouncing
   */
  function scheduleSave(form) {
    const formId = form.id;

    // Clear existing timer
    if (saveTimers.has(formId)) {
      clearTimeout(saveTimers.get(formId));
    }

    // Set new timer
    const timer = setTimeout(() => {
      const data = extractFormData(form);

      // Only save if there's actual data
      if (Object.keys(data).length > 0) {
        const saved = saveDraft(formId, data);
        if (saved) {
          showSaveIndicator(form);
        }
      }

      saveTimers.delete(formId);
    }, CONFIG.saveDelay);

    saveTimers.set(formId, timer);
  }

  // ===== FORM INITIALIZATION =====

  /**
   * Initialize autosave for a form
   */
  function initAutosave(form) {
    const formId = form.id;

    // Check if form should have autosave
    const shouldEnable = CONFIG.enabledForms.includes(formId) ||
                        CONFIG.enabledForms.some(cls => form.classList.contains(cls));

    if (!shouldEnable) {
      console.log(`⏭️ Autosave skipped for ${formId}`);
      return;
    }

    console.log(`🔧 Initializing autosave for ${formId}`);

    // Check for existing draft
    const draft = loadDraft(formId);
    if (draft && !restoredForms.has(formId)) {
      // Show notification to restore
      showDraftNotification(form, draft);
    }

    // Attach input listeners for auto-save
    const inputs = form.querySelectorAll('input:not([type="hidden"]), textarea, select');

    inputs.forEach(input => {
      // Skip excluded fields
      if (CONFIG.excludedFields.includes(input.name)) return;
      if (CONFIG.excludedTypes.includes(input.type)) return;

      // Save on input
      input.addEventListener('input', () => {
        scheduleSave(form);
      });

      // Save on change (for selects, radio, checkbox)
      input.addEventListener('change', () => {
        scheduleSave(form);
      });
    });

    // Clear draft on successful submit
    form.addEventListener('submit', (e) => {
      // Wait a bit to ensure submission was successful
      // (form-validation.js will handle the actual submission)
      setTimeout(() => {
        // If form still exists and is reset, clear draft
        if (form.checkValidity && form.checkValidity()) {
          clearDraft(formId);
        }
      }, 1000);
    });

    // Also listen for custom success event if available
    document.addEventListener('altorra:form-success', (e) => {
      if (e.detail.formId === formId) {
        clearDraft(formId);
      }
    });
  }

  // ===== STYLES =====

  const STYLES = `
    /* Draft notification banner */
    .draft-notification {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: #fff;
      padding: 16px 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      animation: slideDown 0.3s ease;
    }
    .draft-notification-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .draft-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    .draft-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .draft-text strong {
      font-weight: 700;
      font-size: 1rem;
    }
    .draft-time {
      font-size: 0.85rem;
      opacity: 0.9;
    }
    .draft-actions {
      display: flex;
      gap: 8px;
    }
    .draft-restore-btn,
    .draft-clear-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .draft-restore-btn {
      background: #fff;
      color: #2563eb;
    }
    .draft-restore-btn:hover {
      background: #f0f9ff;
      transform: translateY(-1px);
    }
    .draft-clear-btn {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
    }
    .draft-clear-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    /* Auto-save indicator */
    .autosave-indicator {
      position: fixed;
      bottom: 80px;
      right: 24px;
      background: #111;
      color: #fff;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      z-index: 9998;
    }
    .autosave-indicator.saving,
    .autosave-indicator.saved {
      opacity: 1;
    }
    .autosave-indicator.saved {
      background: #16a34a;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 640px) {
      .draft-notification-content {
        flex-direction: column;
        align-items: flex-start;
      }
      .draft-actions {
        width: 100%;
      }
      .draft-restore-btn,
      .draft-clear-btn {
        flex: 1;
      }
      .autosave-indicator {
        bottom: 70px;
        right: 16px;
        left: 16px;
        text-align: center;
      }
    }
  `;

  // Inject styles
  if (!document.getElementById('form-autosave-styles')) {
    const style = document.createElement('style');
    style.id = 'form-autosave-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  // ===== INITIALIZATION =====

  document.addEventListener('DOMContentLoaded', () => {
    // Find all forms
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
      // Skip forms without ID
      if (!form.id) {
        console.warn('Form without ID found, skipping autosave:', form);
        return;
      }

      // Initialize autosave
      initAutosave(form);
    });
  });

  // Clean up old drafts on page load
  function cleanupOldDrafts() {
    try {
      const keysToRemove = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CONFIG.storagePrefix)) {
          try {
            const draft = JSON.parse(localStorage.getItem(key));
            const age = Date.now() - draft.savedAt;

            if (age > CONFIG.maxDraftAge) {
              keysToRemove.push(key);
            }
          } catch (e) {
            // Invalid draft, remove it
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      if (keysToRemove.length > 0) {
        console.log(`🗑️ Cleaned up ${keysToRemove.length} old draft(s)`);
      }
    } catch (e) {
      console.warn('Failed to cleanup old drafts:', e);
    }
  }

  // Run cleanup
  cleanupOldDrafts();

  // Expose API
  window.AltorraFormAutosave = {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
    extractFormData,
    restoreFormData,
    initAutosave
  };

  console.log('✅ Form autosave loaded (draft recovery + auto-save)');

})();
