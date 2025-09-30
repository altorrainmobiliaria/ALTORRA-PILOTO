/* Altorra — Carga y cacheo de header/footer + inicialización de navegación accesible */
 (function () {
  if (window.__altorraHeaderInit__) return;
  window.__altorraHeaderInit__ = true;

  /* ===== Config de caché (ajusta cuando cambie header/footer) ===== */
  const CACHE_VERSION = '2025-09-07.2';          // 🔁 Sube si editas header.html o footer.html
  const TTL_MS = 1000 * 60 * 60 * 24 * 7;        // 7 días
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
    if (typeof after === 'function') {
      try { after(); } catch (e) { console.warn('init después de inyección falló:', e); }
    }
  }

  /* Inyecta con caché + revalidación background */
  function inject(id, url, after) {
    const host = document.getElementById(id);
    if (!host) return console.error('Host ID no encontrado:', id);
    const cached = readCache(url);

    if (cached) {
      setHTML(host, cached, after);
    }

    fetch(url, { cache: 'no-cache' })
      .then(r => r.ok ? r.text() : Promise.reject(r.status))
      .then(html => {
        writeCache(url, html);
        setHTML(host, html, after);
      })
      .catch(e => console.warn('Fetch de ' + url + ' falló:', e));
  }

  function initHeader() {
    // Tu código original para nav, drawer, etc.
    const toggle = document.getElementById('nav-toggle');
    const drawer = document.getElementById('nav-drawer');
    if (toggle && drawer) {
      toggle.addEventListener('click', () => drawer.classList.toggle('open'));
      // Resto del init
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    inject('header-placeholder', 'header.html', initHeader);
    inject('footer-placeholder', 'footer.html', null);
  });
})();
