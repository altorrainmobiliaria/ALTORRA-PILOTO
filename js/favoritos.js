/* ===================================
   SISTEMA DE FAVORITOS - ALTORRA
   Archivo: js/favoritos.js
   =================================== */

(function() {
  'use strict';

  const FAV_KEY = 'altorra:favoritos';
  const BADGE_UPDATE_EVENT = 'altorra:fav-update';

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
    // Evitar duplicados
    if (favs.some(f => f.id === prop.id)) return;
    
    // Guardar info mínima necesaria
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
      return false; // ya no es favorito
    } else {
      addFavorite(prop);
      return true; // ahora es favorito
    }
  }

  // ========== Inicializar Botones de Favoritos ==========
  function initFavoriteButtons() {
    document.querySelectorAll('.fav-btn').forEach(btn => {
      const card = btn.closest('.card');
      if (!card) return;

      // Obtener ID de la propiedad desde el link "Ver detalles"
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

        // Obtener datos de la propiedad desde el DOM
        const titleEl = card.querySelector('h3');
        const priceEl = card.querySelector('.price');
        const specsEl = card.querySelector('.specs');
        const imgEl = card.querySelector('img');

        const prop = {
          id: propId,
          title: titleEl ? titleEl.textContent.trim() : 'Propiedad',
          price: priceEl ? priceEl.textContent.replace(/[^\d]/g, '') : 0,
          image: imgEl ? imgEl.src : '',
          city: 'Cartagena', // default, puedes extraerlo de specs si quieres
          operation: window.location.pathname.includes('arrendar') ? 'arrendar' : 
                     window.location.pathname.includes('alojamientos') ? 'dias' : 'comprar'
        };

        const nowFav = toggleFavorite(prop);
        btn.setAttribute('aria-pressed', nowFav ? 'true' : 'false');
        if (heart) heart.textContent = nowFav ? '♥' : '♡';

        // Feedback visual
        showToast(nowFav ? '♥ Agregado a favoritos' : 'Removido de favoritos');
      });
    });
  }

  // ========== Badge en Header ==========
  function updateBadge() {
    const favs = getFavorites();
    const count = favs.length;

    let badge = document.getElementById('fav-badge');
    if (!badge) {
      // Crear badge si no existe
      const nav = document.querySelector('nav .nav-list');
      if (!nav) return;

      const li = document.createElement('div');
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
        display: ${count > 0 ? 'block' : 'none'};
      `;
      
      link.appendChild(badge);
      li.appendChild(link);
      nav.appendChild(li);
    }

    badge.textContent = count;
    badge.style.display = count > 0 ? 'block' : 'none';
  }

  // ========== Toast Notification ==========
  function showToast(message) {
    // Remover toast anterior si existe
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

    // Agregar animación CSS
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

  // ========== Inicialización ==========
  document.addEventListener('DOMContentLoaded', () => {
    initFavoriteButtons();
    updateBadge();
  });

  // Escuchar actualizaciones de favoritos
  document.addEventListener(BADGE_UPDATE_EVENT, updateBadge);

  // Exponer API global (para usar en otras páginas)
  window.AltorraFavoritos = {
    get: getFavorites,
    add: addFavorite,
    remove: removeFavorite,
    toggle: toggleFavorite,
    isFavorite: isFavorite
  };
})();