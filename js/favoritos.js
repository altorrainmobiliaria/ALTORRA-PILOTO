/* ===================================
   SISTEMA DE FAVORITOS - ALTORRA
   Archivo: js/favoritos.js
   VERSIÓN REFORZADA (siempre crea ♥ Favoritos en TODAS las páginas)
   =================================== */

(function() {
  'use strict';

  const FAV_KEY = 'altorra:favoritos';
  const BADGE_UPDATE_EVENT = 'altorra:fav-update';

  // ====== Selección robusta del NAV ======
  const NAV_SELECTORS = [
    'nav .nav-list',
    '#header nav .nav-list',
    'header nav .nav-list',
    '.main-nav .nav-list',
    '.site-header nav .nav-list'
  ];

  function getNavList() {
    for (const sel of NAV_SELECTORS) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  // ====== Asegurar acceso ♥ Favoritos en el header ======
  function ensureFavNavExists() {
    let badge = document.getElementById('fav-badge');
    let badgeContainer = document.getElementById('fav-badge-container');

    if (badgeContainer && badge) return badge; // ya está todo

    const nav = getNavList();
    if (!nav) return null; // aún no existe el nav

    if (!badgeContainer) {
      const li = document.createElement('div');
      li.id = 'fav-badge-container';
      li.className = 'nav-item';
      li.style.position = 'relative';

      const link = document.createElement('a');
      link.href = 'favoritos.html';
      link.className = 'nav-btn';
      link.textContent = '♥ Favoritos';
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
      const link = badgeContainer.querySelector('a') || (() => {
        const a = document.createElement('a');
        a.href = 'favoritos.html';
        a.className = 'nav-btn';
        a.textContent = '♥ Favoritos';
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

  // ====== API de Favoritos ======
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

  // ====== Inicializar Botones de Favoritos ======
  function initFavoriteButtons() {
    document.querySelectorAll('.fav-btn').forEach(btn => {
      if (btn.dataset.favInit === 'true') return;
      btn.dataset.favInit = 'true';

      const card = btn.closest('.card');
      if (!card) return;

      const detailLink = card.querySelector('a[href*="detalle-propiedad.html"]');
      if (!detailLink) return;

      const url = new URL(detailLink.href, window.location.href);
      const propId = url.searchParams.get('id');
      if (!propId) return;

      const alreadyFav = isFavorite(propId);
      btn.setAttribute('aria-pressed', alreadyFav ? 'true' : 'false');
      const heart = btn.querySelector('.heart');
      if (heart) heart.textContent = alreadyFav ? '♥' : '♡';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const priceEl = card.querySelector('.price');
        const specsEl = card.querySelector('.specs');
        const titleEl = card.querySelector('h3, .meta h3');
        const imgEl = card.querySelector('.media img');

        let operation = 'comprar';
        if (location.pathname.includes('arrendar')) operation = 'arrendar';
        else if (location.pathname.includes('alojamientos')) operation = 'dias';

        let priceNum = 0;
        if (priceEl) {
          const match = (priceEl.textContent || '').match(/[\d.]+/g);
          if (match) priceNum = parseInt(match.join('').replace(/\./g, ''), 10);
        }

        let city = 'Cartagena';
        if (specsEl) {
          const parts = specsEl.textContent.split('·').map(p => p.trim());
          const cityPart = parts.find(p => !p.match(/\d/) && !p.includes('m²'));
          if (cityPart) city = cityPart;
        }

        let type = '';
        if (specsEl) {
          const t = specsEl.textContent.toLowerCase();
          if (t.includes('apartamento')) type = 'apartamento';
          else if (t.includes('casa')) type = 'casa';
          else if (t.includes('lote')) type = 'lote';
          else if (t.includes('oficina')) type = 'oficina';
        }

        const prop = {
          id: propId,
          title: titleEl ? titleEl.textContent.trim() : 'Propiedad',
          price: priceNum,
          image: imgEl ? imgEl.src : '',
          city,
          operation,
          type
        };

        const nowFav = toggleFavorite(prop);
        btn.setAttribute('aria-pressed', nowFav ? 'true' : 'false');
        if (heart) heart.textContent = nowFav ? '♥' : '♡';

        showToast(nowFav ? '♥ Agregado a favoritos' : 'Removido de favoritos');
      });
    });
  }

  // ====== Badge en Header ======
  function updateBadge() {
    const badge = ensureFavNavExists();       // crea/asegura el acceso
    const count = getFavorites().length;

    if (!badge) return;                       // nav aún no está, ya lo cubre el observador
    badge.textContent = count;
    badge.style.display = count > 0 ? 'block' : 'none'; // el link queda siempre
  }

  // ====== Toast ======
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

  // ====== Observadores ======
  // 1) Cards/carouseles para inicializar botones dinámicos
  const cardsObserver = new MutationObserver((mutations) => {
    let needsInit = false;
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          if (node.classList && node.classList.contains('card')) needsInit = true;
          else if (node.querySelector && node.querySelector('.card')) needsInit = true;
        }
      });
    });
    if (needsInit) setTimeout(initFavoriteButtons, 100);
  });

  // 2) Header/nav inyectado en cualquier momento (observa todo el documento)
  let headerObserver;
  function observeHeader() {
    if (headerObserver) headerObserver.disconnect();

    headerObserver = new MutationObserver(() => {
      if (getNavList()) {
        ensureFavNavExists();
        updateBadge();
      }
    });

    // Observa todo el documento: sirve para páginas donde no existe #header-placeholder
    headerObserver.observe(document.documentElement, { childList: true, subtree: true });

    // Fallback adicional: reintentos temporizados por si el observer se pierde algo
    let tries = 0;
    const maxTries = 40; // ~8s si el intervalo es 200ms
    const timer = setInterval(() => {
      if (getNavList()) {
        ensureFavNavExists();
        updateBadge();
        clearInterval(timer);
      }
      if (++tries >= maxTries) clearInterval(timer);
    }, 200);
  }

  // ====== Inicialización ======
  function init() {
    initFavoriteButtons();
    updateBadge();    // intentará crear el acceso si el nav ya existe

    // Observa listados y carouseles (si existen en esta página)
    const grid = document.getElementById('list');
    if (grid) cardsObserver.observe(grid, { childList: true, subtree: true });
    document.querySelectorAll('.carousel-row').forEach(c => {
      cardsObserver.observe(c, { childList: true, subtree: true });
    });

    observeHeader();  // garantiza el acceso en cualquier página/tiempo
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Eventos globales
  document.addEventListener(BADGE_UPDATE_EVENT, updateBadge);
  document.addEventListener('altorra:properties-loaded', () => {
    setTimeout(initFavoriteButtons, 100);
  });

  // Exponer API (útil para depurar)
  window.AltorraFavoritos = {
    get: getFavorites,
    add: addFavorite,
    remove: removeFavorite,
    toggle: toggleFavorite,
    isFavorite: isFavorite,
    init: initFavoriteButtons
  };
})();
