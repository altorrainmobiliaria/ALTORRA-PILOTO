/* ===================================
   SISTEMA DE FAVORITOS - ALTORRA (parche robusto)
   Archivo: js/favoritos.js
   Fecha: 2025-10-02
   =================================== */

(function () {
  'use strict';

  // ====== Claves, eventos y selectores base ======
  const FAV_KEY = 'altorra:favoritos';
  const BADGE_UPDATE_EVENT = 'altorra:fav-update';

  // Ajusta si tu contenedor de cards en index usa otro selector:
  // - Por defecto apunto a secciones con cards .property-card.
  const CARD_CONTAINER_SELECTORS = [
    '#home-prop-venta',          // si tienes un id específico en home (opcional)
    '#home-prop-arriendo',       // idem
    '#home-prop-alojamientos',   // idem
    '.cards-list',               // genérico de listas
    'section'                    // fallback: observamos secciones
  ];

  const CARD_SELECTOR = '.property-card'; // ajusta si tu clase de card es otra
  const BTN_CLASS = 'fav-btn';
  const BTN_DATA_FLAG = 'favBound'; // dataset flag para evitar doble binding

  // ====== Estado y utilidades de almacenamiento ======
  function loadFavs() {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveFavs(list) {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(list));
    } catch {}
    dispatchBadgeUpdate();
  }

  function isFav(id) {
    const list = loadFavs();
    return list.includes(id);
  }

  function toggleFav(id) {
    const list = loadFavs();
    const idx = list.indexOf(id);
    if (idx === -1) list.push(id);
    else list.splice(idx, 1);
    saveFavs(list);
    return list.includes(id);
  }

  function dispatchBadgeUpdate() {
    document.dispatchEvent(new CustomEvent(BADGE_UPDATE_EVENT));
  }

  // ====== Header badge (corazón en nav) ======
  function getFavCount() {
    return loadFavs().length;
  }

  function updateHeaderBadge() {
    // Intenta ubicaciones probables:
    const badge = document.getElementById('fav-badge');
    const badgeContainer = document.getElementById('fav-badge-container');

    const count = String(getFavCount());

    if (badge) {
      badge.textContent = count;
      badge.style.display = count === '0' ? 'none' : 'inline-block';
    }
    if (badgeContainer) {
      // Por si el contenedor cambia de estilo cuando hay o no hay favs
      badgeContainer.classList.toggle('has-favs', count !== '0');
    }
  }

  // ====== Botón de favorito por card ======
  function makeFavButton(id) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = BTN_CLASS;
    btn.setAttribute('aria-label', 'Guardar en favoritos');
    btn.innerHTML = `
      <span class="fav-icon" aria-hidden="true">♡</span>
      <span class="fav-text">Guardar en favoritos</span>
    `;
    if (isFav(id)) {
      btn.classList.add('is-active');
      btn.querySelector('.fav-icon').textContent = '❤';
      btn.querySelector('.fav-text').textContent = 'En favoritos';
    }
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const active = toggleFav(id);
      btn.classList.toggle('is-active', active);
      btn.querySelector('.fav-icon').textContent = active ? '❤' : '♡';
      btn.querySelector('.fav-text').textContent = active ? 'En favoritos' : 'Guardar en favoritos';
    });
    return btn;
  }

  // Inserta el botón dentro de la card en un lugar consistente.
  function injectBtnInCard(card) {
    // Evita reinyectar en la misma card
    if (card.dataset[BTN_DATA_FLAG]) return;

    // Obtén el ID estable de la card.
    // Preferimos data-id; si no existe, intenta con un atributo o texto.
    const id = card.getAttribute('data-id') || card.dataset.id || card.id || '';
    if (!id) return; // sin id no podemos persistir favorito

    // Dónde insertar: intenta una barra de acciones; si no, al inicio del contenido.
    let actions = card.querySelector('.card-actions, .form-actions, .actions');
    if (!actions) {
      // Crea una zona de acciones si no existe (no invasivo)
      actions = document.createElement('div');
      actions.className = 'card-actions';
      card.appendChild(actions);
    }

    // Evita duplicados
    if (actions.querySelector(`.${BTN_CLASS}`)) {
      card.dataset[BTN_DATA_FLAG] = '1';
      return;
    }

    actions.prepend(makeFavButton(id));
    card.dataset[BTN_DATA_FLAG] = '1';
  }

  // Escanea todas las cards actuales
  function scanAndInject(root = document) {
    const cards = root.querySelectorAll(CARD_SELECTOR);
    cards.forEach(injectBtnInCard);
  }

  // ====== Observador de cambios (para dinámicos) ======
  let observers = [];

  function observeContainers() {
    // Limpia observadores previos
    observers.forEach(o => o.disconnect());
    observers = [];

    const targets = [];
    CARD_CONTAINER_SELECTORS.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        // Sólo considera contenedores que tengan al menos una card o que vayan a tener
        targets.push(el);
      });
    });
    // Si no encontramos contenedores, como fallback observamos el body
    if (targets.length === 0) targets.push(document.body);

    targets.forEach(target => {
      const ob = new MutationObserver(() => {
        scanAndInject(target);
      });
      ob.observe(target, { childList: true, subtree: true });
      observers.push(ob);
    });
  }

  // ====== Inicialización segura y repetible ======
  function init() {
    try {
      scanAndInject();
      observeContainers();
      updateHeaderBadge();
    } catch (e) {
      // reintenta en el siguiente frame si algo no estaba listo
      requestAnimationFrame(() => {
        try {
          scanAndInject();
          observeContainers();
          updateHeaderBadge();
        } catch {}
      });
    }
  }

  // Hookeos múltiples para no fallar en el primer render
  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('load', init);

  // Si en tu render de cards lanzas este evento, nos enganchamos también:
  document.addEventListener('altorra:cards-ready', init);

  // Actualiza el badge cuando cambie el storage desde otra pestaña
  window.addEventListener('storage', (e) => {
    if (e.key === FAV_KEY) updateHeaderBadge();
  });
  document.addEventListener(BADGE_UPDATE_EVENT, updateHeaderBadge);

})();
