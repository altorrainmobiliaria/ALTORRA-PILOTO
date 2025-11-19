/* ========================================
   ALTORRA - PERFORMANCE OPTIMIZATIONS
   ======================================== */

(function() {
  'use strict';

  // ========== LAZY LOAD IMÁGENES ==========
  function initLazyImages() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Cargar imagen
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }

          // Cargar srcset si existe
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
          }

          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    // Observar imágenes con data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // ========== PRELOAD LINKS ==========
  function initPrefetch() {
    const linkObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target;
          const href = link.href;
          
          if (href && !link.dataset.prefetched) {
            const prefetchLink = document.createElement('link');
            prefetchLink.rel = 'prefetch';
            prefetchLink.href = href;
            document.head.appendChild(prefetchLink);
            link.dataset.prefetched = 'true';
          }
        }
      });
    }, { rootMargin: '200px' });

    // Prefetch links importantes
    document.querySelectorAll('a[href*="detalle-propiedad"]').forEach(link => {
      linkObserver.observe(link);
    });
  }

  // ========== OPTIMIZAR SCROLL ==========
  function optimizeScroll() {
    let ticking = false;
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      lastScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Aquí puedes agregar efectos de scroll
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ========== REDUCIR REPAINTS ==========
  function initBatchedUpdates() {
    // Agrupar actualizaciones DOM
    window.AltorraBatchUpdate = {
      queue: [],
      scheduled: false,
      
      add(fn) {
        this.queue.push(fn);
        if (!this.scheduled) {
          this.scheduled = true;
          requestAnimationFrame(() => {
            this.queue.forEach(fn => fn());
            this.queue = [];
            this.scheduled = false;
          });
        }
      }
    };
  }

  // ========== DETECTAR CONEXIÓN LENTA ==========
  function detectConnection() {
    if ('connection' in navigator) {
      const conn = navigator.connection;
      const isSlow = conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g';
      
      if (isSlow) {
        document.body.classList.add('slow-connection');
        console.warn('⚠️ Conexión lenta detectada');
        
        // Desactivar animaciones pesadas
        document.documentElement.style.setProperty('--animation-duration', '0s');
      }
    }
  }

  // ========== CRITICAL CSS ==========
  function loadNonCriticalCSS() {
    const links = document.querySelectorAll('link[rel="preload"][as="style"]');
    links.forEach(link => {
      link.rel = 'stylesheet';
    });
  }

  // ========== INIT ==========
  function init() {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initLazyImages();
        initPrefetch();
        optimizeScroll();
        initBatchedUpdates();
        detectConnection();
      });
    } else {
      initLazyImages();
      initPrefetch();
      optimizeScroll();
      initBatchedUpdates();
      detectConnection();
    }

    // CSS no crítico después de load
    window.addEventListener('load', loadNonCriticalCSS);
  }

  init();
  console.log('⚡ Performance optimizations cargadas');
})();
