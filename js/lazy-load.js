/* ========================================
   ALTORRA - LAZY LOADING DE IMÁGENES
   Archivo: js/lazy-load.js
   Carga diferida con Intersection Observer
   ======================================== */

(function() {
  'use strict';

  // Configuración
  const CONFIG = {
    rootMargin: '50px',        // Cargar 50px antes de entrar al viewport
    threshold: 0.01,           // Trigger cuando 1% es visible
    loadDelay: 0,              // Delay opcional para testing (ms)
    enableBlurEffect: true,    // Efecto blur → sharp
    placeholderColor: '#f3f4f6', // Color del placeholder
    fadeInDuration: 300        // Duración de fade-in (ms)
  };

  // Track loaded images
  const loadedImages = new Set();

  /**
   * Check if browser supports Intersection Observer
   */
  function supportsIntersectionObserver() {
    return 'IntersectionObserver' in window;
  }

  /**
   * Load image
   */
  function loadImage(img) {
    return new Promise((resolve, reject) => {
      // Skip if already loaded
      if (loadedImages.has(img)) {
        resolve(img);
        return;
      }

      const src = img.dataset.src;
      const srcset = img.dataset.srcset;

      if (!src) {
        reject(new Error('No data-src attribute found'));
        return;
      }

      // Create temporary image to preload
      const tempImg = new Image();

      tempImg.onload = () => {
        // Set actual image sources
        img.src = src;
        if (srcset) {
          img.srcset = srcset;
        }

        // Remove data attributes
        delete img.dataset.src;
        delete img.dataset.srcset;

        // Add loaded class for animation
        img.classList.add('lazy-loaded');

        // Mark as loaded
        loadedImages.add(img);

        resolve(img);
      };

      tempImg.onerror = () => {
        console.error('Failed to load image:', src);
        img.classList.add('lazy-error');
        reject(new Error(`Failed to load: ${src}`));
      };

      // Start loading
      tempImg.src = src;
      if (srcset) {
        tempImg.srcset = srcset;
      }
    });
  }

  /**
   * Intersection Observer callback
   */
  function onIntersection(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;

        // Add delay if configured (for testing)
        setTimeout(() => {
          loadImage(img)
            .then(() => {
              // Stop observing this image
              observer.unobserve(img);
            })
            .catch(err => {
              console.warn('Image load error:', err);
              observer.unobserve(img);
            });
        }, CONFIG.loadDelay);
      }
    });
  }

  /**
   * Initialize lazy loading with Intersection Observer
   */
  function initIntersectionObserver() {
    const images = document.querySelectorAll('img[data-src]');

    if (images.length === 0) {
      console.log('📷 No lazy images found');
      return;
    }

    const observer = new IntersectionObserver(onIntersection, {
      rootMargin: CONFIG.rootMargin,
      threshold: CONFIG.threshold
    });

    images.forEach(img => {
      // Add lazy-loading class
      img.classList.add('lazy-loading');

      // Set placeholder if no src
      if (!img.src || img.src === window.location.href) {
        // Create tiny placeholder SVG
        const placeholder = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='${CONFIG.placeholderColor}' width='400' height='300'/%3E%3C/svg%3E`;
        img.src = placeholder;
      }

      // Observe image
      observer.observe(img);
    });

    console.log(`📷 Lazy loading initialized for ${images.length} images`);
  }

  /**
   * Fallback for browsers without Intersection Observer
   */
  function fallbackLazyLoad() {
    const images = document.querySelectorAll('img[data-src]');

    images.forEach(img => {
      loadImage(img)
        .catch(err => console.warn('Fallback load error:', err));
    });

    console.log(`📷 Fallback lazy load for ${images.length} images (no IntersectionObserver)`);
  }

  /**
   * Load all images immediately (emergency fallback)
   */
  function loadAllImages() {
    const images = document.querySelectorAll('img[data-src]');
    const promises = Array.from(images).map(img => loadImage(img));

    return Promise.allSettled(promises);
  }

  /**
   * Inject styles for lazy loading
   */
  function injectStyles() {
    if (document.getElementById('lazy-load-styles')) return;

    const styles = `
      /* Lazy loading images */
      img[data-src] {
        background: ${CONFIG.placeholderColor};
      }

      img.lazy-loading {
        opacity: 0;
        transition: opacity ${CONFIG.fadeInDuration}ms ease-in-out;
      }

      img.lazy-loaded {
        opacity: 1;
      }

      img.lazy-error {
        opacity: 0.5;
        border: 2px dashed #fca5a5;
      }

      ${CONFIG.enableBlurEffect ? `
      /* Optional blur effect */
      img.lazy-loading.blur-up {
        filter: blur(10px);
        transform: scale(1.05);
        transition: filter ${CONFIG.fadeInDuration}ms ease,
                    transform ${CONFIG.fadeInDuration}ms ease,
                    opacity ${CONFIG.fadeInDuration}ms ease;
      }

      img.lazy-loaded.blur-up {
        filter: blur(0);
        transform: scale(1);
      }
      ` : ''}

      /* Noscript fallback */
      noscript img {
        opacity: 1 !important;
      }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = 'lazy-load-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  /**
   * Initialize on DOM ready
   */
  function init() {
    // Inject styles
    injectStyles();

    // Check support
    if (supportsIntersectionObserver()) {
      initIntersectionObserver();
    } else {
      console.warn('⚠️ IntersectionObserver not supported, using fallback');
      fallbackLazyLoad();
    }
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API
  window.AltorraLazyLoad = {
    init,
    loadImage,
    loadAllImages,
    config: CONFIG
  };

  console.log('✅ Lazy load module loaded');

})();
