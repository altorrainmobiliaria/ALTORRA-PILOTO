/* Altorra — Carga y cacheo de header/footer + inicialización de navegación accesible */
(function () {
  if (window.__altorraHeaderInit__) return;
  window.__altorraHeaderInit__ = true;

  const CACHE_VERSION = '2025-09-07.2';
  const TTL_MS = 1000 * 60 * 60 * 24 * 7;
  const LS_PREFIX = 'altorra:fragment:';

  function cacheKey(url) { return `${LS_PREFIX}${url}::${CACHE_VERSION}`; }

  function readCache(url) {
    try {
      const raw = localStorage.getItem(cacheKey(url));
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !obj.html || !obj.t) return null;
      if (Date.now() - obj.t > TTL_MS) return null;
      return obj.html;
    } catch { return null; }
  }

  function writeCache(url, html) {
    try { localStorage.setItem(cacheKey(url), JSON.stringify({ html, t: Date.now() })); } catch {}
  }

  function setHTML(host, html, after) {
    host.innerHTML = html;
    if (typeof after === 'function') after();
  }

  function inject(id, url, after) {
    const host = document.getElementById(id);
    if (!host) return;
    const cached = readCache(url);
    if (cached) setHTML(host, cached, after);

    fetch(url).then(r => r.text()).then(html => {
      writeCache(url, html);
      setHTML(host, html, after);
    }).catch(() => {});
  }

  function initHeader() {
    // Inicialización de nav (drawer, etc.)
    const toggle = document.querySelector('.nav-toggle');
    const drawer = document.querySelector('.nav-drawer');
    if (toggle && drawer) {
      toggle.addEventListener('click', () => drawer.classList.toggle('open'));
    }
    updateFavBadge(); // Para favoritos
  }

  document.addEventListener('DOMContentLoaded', () => {
    inject('header-placeholder', 'header.html', initHeader);
    inject('footer-placeholder', 'footer.html');
  });
})();
