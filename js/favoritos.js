/* ===================================
   SISTEMA DE FAVORITOS - ALTORRA
   Archivo: js/favoritos.js
   VERSIÓN CORREGIDA (aparece a la primera en todas las páginas)
   =================================== */

(function() {
  'use strict';

  const FAV_KEY = 'altorra:favoritos';
  const BADGE_UPDATE_EVENT = 'altorra:fav-update';

  // ========== Utilidades de Header / Nav ==========
  function getNavList() {
    return document.querySelector('nav .nav-list');
  }

  function ensureFavNavExists() {
    let badge = document.getElementById('fav-badge');
    let badgeContainer = document.getElementById('fav-badge-container');

    // Si ya existe el contenedor y el badge, listo
    if (badgeContainer && badge) return badge;

    const nav = getNavList();
    if (!nav) return null;

    // Crear contenedor y enlace si no existen
    if (!badgeContainer) {
      const li = document.createElement('div');
      li.id = 'fav-badge-container';
      li.className = 'nav-item';
      li.style.position = 'relative';

      const link = document.createElement('a');
      link.href = 'favoritos.html';
      link.className = 'nav-btn';
      link.innerHTML = '♥ Favoritos';
      link.style.position = 'relative';

      badge = document.createElement('span');
      badge.id = 'fav-badge';
      badge.style.cssText = `
        position: absolute;
        top: -4px;
        right: -8px;
        background: var(--gold);
        color: #000;
        font-size: 0.7rem;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 10px;
        min-width: 18px;
        text-align: center;
        display: none; /* oculto si count=0; el link siempre visible */
      `;

      link.appendChild(badge);
      li.appendChild(link);
      nav.appendChild(li);
    } else if (!badge) {
      // Si el contenedor existe pero falta el badge, lo creamos
      const link = badgeContainer.querySelector('a') || (() => {
        const a = document.createElement('a');
        a.href = 'favoritos.html';
        a.className = 'nav-btn';
        a.innerHTML = '♥ Favoritos';
        a.style.position = 'relative';
        badgeContainer.appendChild(a);
        return a;
      })();
      badge = document.createElement('span');
      badge.id = 'fav-badge';
      badge.style.cssText = `
        position: absolute;
        top: -4px;
        right: -8px;
        background: var(--gold);
        color: #000;
        font-size: 0.7rem;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 10px;
        min-width: 18px;
        text-align: center;
        display: none;
      `;
      link.appendChild(badge);
    }

    return document.getElementById('fav-badge');
  }

  // ========== API de Favoritos ==========
  function getFavorites() {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (!raw) return [];
      const favs = JSON.parse(raw);
      return Array.isArray(favs) ? favs : [];
    } catch {
      return [];
    }
  }

  function saveFavorites(favs) {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(favs));
      document.dispatchEvent(new CustomEvent(BADGE_UPDATE_EVENT, { detail: { count: favs.length } }));
    } catch(e) {
      console.warn('No se pudo guardar favoritos', e);
    }
  }

  function isFavorite(propId) {
    const favs = getFavorites();
    return favs.some(f => f.id === propId);
  }

  function addFavorite(prop) {
    const favs = getFavorites();
    if (favs.some(f => f.id === prop.id)) return;

    favs.push({
      id: prop.id,
      title: prop.title,
      city: prop.city,
      price: prop.price,
      image: prop.image,
      operation: prop.operation,
      beds: prop.beds,
      baths: prop.baths,
      sqm: prop.sqm,
      type: prop.type,
      addedAt: Date.now()
    });

    saveFavorites(favs);
  }

  function removeFavorite(propId) {
    let favs = getFavorites();
    favs = favs.filter(f => f.id !== propId);
    saveFavorites(favs);
  }

  function toggleFavorite(prop) {
    if (isFavorite(prop.id)) {
      removeFavorite(prop.id);
      return false;
    } else {
      addFavorite(prop);
      return true;
    }
  }

  // ========== Inicializar Botones de Favoritos ==========
  function initFavoriteButtons() {
    document.querySelectorAll('.fav-btn').forEach(btn => {
      // Si ya fue inicializado, saltar
      if (btn.dataset.favInit === 'true') return;
      btn.dataset.favInit = 'true';

      const card = btn.closest('.card');
      if (!card) return;

      // Buscar el link de detalle
      const detailLink = card.querySelector('a[href*="detalle-propiedad.html"]');
      if (!detailLink) return;

      const url = new URL(detailLink.href, window.location.href);
      const propId = url.searchParams.get('id');
      if (!propId) return;

      // Marcar si ya es favorito
      const isFav = isFavorite(propId);
      btn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
      const heart = btn.querySelector('.heart');
      if (heart) heart.textContent = isFav ? '♥' : '♡';

      // Evento click
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Extraer datos de la propiedad desde el DOM
        const titleEl = card.querySelector('h3, .meta h3');
        const priceEl = card.querySelector('.price');
        const specsEl = card.querySelector('.specs');
        const imgEl = card.querySelector('.media img');

        // Determinar operación por la URL actual
        let operation = 'comprar';
        if (window.location.pathname.includes('arrendar')) operation = 'arrendar';
        else if (window.location.pathname.includes('alojamientos')) operation = 'dias';

        // Extraer precio numérico
        let priceNum = 0;
        if (priceEl) {
          const priceText = priceEl.textContent;
          const match = priceText.match(/[\d.]+/g);
          if (match) {
            priceNum = parseInt(match.join('').replace(/\./g, ''), 10);
          }
        }

        // Extraer ciudad de specs si existe
        let city = 'Cartagena';
        if (specsEl) {
          const specsText = specsEl.textContent;
          const parts = specsText.split('·').map(p => p.trim());
          // Buscar la parte que parece una ciudad (no tiene números ni m²)
          const cityPart = parts.find(p => !p.match(/\d/) && !p.includes('m²'));
          if (cityPart) city = cityPart;
        }

        // Extraer tipo
        let type = '';
        if (specsEl) {
          const specsText = specsEl.textContent.toLowerCase();
          if (specsText.includes('apartamento')) type = 'apartamento';
          else if (specsText.includes('casa')) type = 'casa';
          else if (specsText.includes('lote')) type = 'lote';
          else if (specsText.includes('oficina')) type = 'oficina';
        }

        const prop = {
          id: propId,
          title: titleEl ? titleEl.textContent.trim() : 'Propiedad',
          price: priceNum,
          image: imgEl ? imgEl.src : '',
          city: city,
          operation: operation,
          type: type
        };

        const nowFav = toggleFavorite(prop);
        btn.setAttribute('aria-pressed', nowFav ? 'true' : 'false');
        if (heart) heart.textContent = nowFav ? '♥' : '♡';

        showToast(nowFav ? '♥ Agregado a favoritos' : 'Removido de favoritos');
      });
    });
  }

  // ========== Badge en Header ==========
  function updateBadge() {
    // Asegura que el acceso exista (aunque aún no haya favoritos)
    const badgeEl = ensureFavNavExists();
    const favs = getFavorites();
    const count = favs.length;

    // Si todavía no existe el nav (header no inyectado), salimos sin error.
    if (!badgeEl) return;

    // Actualizar contador
    badgeEl.textContent = count;

    // Mostrar/ocultar solo el circulito con el número; el enlace ♥ Favoritos queda siempre
    badgeEl.style.display = count > 0 ? 'block' : 'none';
  }

  // ========== Toast Notification ==========
  function showToast(message) {
    const existing = document.getElementById('altorra-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'altorra-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #111;
      color: #fff;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 9999;
      animation: toast-in 0.3s ease;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

    if (!document.getElementById('toast-style')) {
      const style = document.createElement('style');
      style.id = 'toast-style';
      style.textContent = `
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes toast-out {
          from { opacity: 1; transform: translateX(-50%) translateY(0); }
          to { opacity: 0; transform: translateX(-50%) translateY(20px); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toast-out 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  // ========== Observadores de cambios en el DOM ==========
  // Observa cards y carouseles para (re)inicializar botones de favoritos
  const cardsObserver = new MutationObserver((mutations) => {
    let needsInit = false;
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          if (node.classList && node.classList.contains('card')) {
            needsInit = true;
          } else if (node.querySelector && node.querySelector('.card')) {
            needsInit = true;
          }
        }
      });
    });
    if (needsInit) {
      setTimeout(initFavoriteButtons, 100);
    }
  });

  // ====== Esperador seguro del NAV (aparece a la primera) ======
  let navReadyFired = false;
  function whenNavReady(run) {
    if (navReadyFired) return;
    const navNow = getNavList();
    if (navNow) {
      navReadyFired = true;
      run();
      return;
    }

    // 1) Observer focalizado (header-placeholder si existe, si no, header o body)
    const host =
      document.getElementById('header-placeholder') ||
      document.querySelector('header') ||
      document.body;

    let mo; let timer; let loadedHandler;

    const cleanup = () => {
      if (mo) mo.disconnect();
      if (timer) clearInterval(timer);
      if (loadedHandler) window.removeEventListener('load', loadedHandler);
    };

    const tryRun = () => {
      if (navReadyFired) return;
      if (getNavList()) {
        navReadyFired = true;
        cleanup();
        run();
      }
    };

    // MutationObserver (ligero, sin tocar estilos)
    mo = new MutationObserver(() => tryRun());
    mo.observe(host, { childList: true, subtree: true });

    // 2) Fallback por tiempo (cubre el caso de “se insertó antes de observar”)
    let tries = 0;
    timer = setInterval(() => {
      tryRun();
      if (++tries >= 40) { // ~4s
        cleanup(); // evitamos dejar intervalos vivos
      }
    }, 100);

    // 3) Fallback al "load" del documento
    loadedHandler = () => tryRun();
    window.addEventListener('load', loadedHandler);
  }

  // ========== Inicialización ==========
  function init() {
    // Inicializar botones existentes
    initFavoriteButtons();

    // Intento inmediato (si el nav ya está)
    updateBadge();

    // Observar cambios en el grid de propiedades
    const grid = document.getElementById('list');
    if (grid) {
      cardsObserver.observe(grid, { childList: true, subtree: true });
    }

    // También observar los carruseles del home
    const carousels = document.querySelectorAll('.carousel-row');
    carousels.forEach(carousel => {
      cardsObserver.observe(carousel, { childList: true, subtree: true });
    });

    // Esperar de forma segura a que el NAV esté listo (primera carga incluida)
    whenNavReady(() => {
      ensureFavNavExists();
      updateBadge();
    });
  }

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Escuchar actualizaciones de favoritos
  document.addEventListener(BADGE_UPDATE_EVENT, updateBadge);

  // Re-inicializar cuando se cargan más propiedades
  document.addEventListener('altorra:properties-loaded', () => {
    setTimeout(initFavoriteButtons, 100);
  });

  // Exponer API global
  window.AltorraFavoritos = {
    get: getFavorites,
    add: addFavorite,
    remove: removeFavorite,
    toggle: toggleFavorite,
    isFavorite: isFavorite,
    init: initFavoriteButtons
  };
})();
