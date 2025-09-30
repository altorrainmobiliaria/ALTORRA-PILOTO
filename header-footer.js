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
    if (!host) return;
    const cached = readCache(url);

    if (cached) {
      setHTML(host, cached, after);
      fetch(url, { cache: 'no-cache' })
        .then(r => r.ok ? r.text() : Promise.reject(r.status))
        .then(html => {
          if (html && html !== cached) {
            writeCache(url, html);
            setHTML(host, html, after);
          }
        })
        .catch(() => {});
    } else {
      fetch(url, { cache: 'no-cache' })
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
        .then(html => { writeCache(url, html); setHTML(host, html, after); })
        .catch(e => console.warn('No se pudo cargar', url, e));
    }
  }

  /* ===== Navegación (misma UI, sin cambios de diseño) ===== */
  function initHeader() {
    const header = document.querySelector('header');
    if (!header) return;

    /* --- Desktop: menús con paneles --- */
    const isDesktop = () => window.innerWidth > 860;
    let open = null, hideTimer = null;

    function getPanel(btn) {
      const id = btn.getAttribute('data-panel');
      return id ? document.getElementById(id) : null;
    }

    function hideNow(panel, btn) {
      if (!panel) return;
      panel.classList.remove('menu-visible');
      panel.setAttribute('aria-hidden', 'true');
      panel.style.visibility = 'hidden';
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (open && open.panel === panel) open = null;
    }

    function place(btn, panel) {
      if (!btn || !panel) return;
      if (open && open.panel !== panel) hideNow(open.panel, open.btn);
      clearTimeout(hideTimer);

      const b = btn.getBoundingClientRect();
      panel.style.visibility = 'hidden';
      panel.classList.add('menu-visible');
      panel.setAttribute('aria-hidden', 'false');

      const w = panel.offsetWidth || 320;
      let left = Math.round(b.left + (b.width / 2) - (w / 2));
      left = Math.max(12, Math.min(left, window.innerWidth - w - 12));

      const h = panel.offsetHeight || 200;
      let top = Math.round(b.bottom + 8);
      if (top + h > window.innerHeight - 12) {
        top = Math.round(b.top - h - 8);
        if (top < 12) top = 12;
      }

      panel.style.left = left + 'px';
      panel.style.top = top + 'px';
      panel.style.visibility = 'visible';
      btn.setAttribute('aria-expanded', 'true');
      open = { panel, btn };
    }

    function scheduleHide(panel, btn) {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => hideNow(panel, btn), 120);
    }

    function setupDesktopMenus() {
      const items = header.querySelectorAll('.nav-item');
      items.forEach(item => {
        const btn = item.querySelector('.nav-btn[data-panel]');
        if (!btn) return;
        const panel = getPanel(btn);
        ['mouseenter', 'focusin'].forEach(ev => {
          btn.addEventListener(ev, () => { if (isDesktop()) place(btn, panel); });
          if (panel) panel.addEventListener(ev, () => { if (isDesktop()) place(btn, panel); });
        });
        ['mouseleave', 'focusout'].forEach(ev => {
          btn.addEventListener(ev, () => { if (isDesktop()) scheduleHide(panel, btn); });
          if (panel) panel.addEventListener(ev, () => { if (isDesktop()) scheduleHide(panel, btn); });
        });
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && open) hideNow(open.panel, open.btn);
      });
      document.addEventListener('click', (e) => {
        if (!open) return;
        const insidePanel = open.panel.contains(e.target);
        const insideBtn = open.btn.contains(e.target);
        if (!insidePanel && !insideBtn) hideNow(open.panel, open.btn);
      });

      window.addEventListener('resize', () => {
        if (open && isDesktop()) place(open.btn, open.panel);
        if (open && !isDesktop()) hideNow(open.panel, open.btn);
      });
    }

    /* --- Móvil: drawer con backdrop y focus trap --- */
    const toggle   = document.getElementById('navToggle');
    const drawer   = document.getElementById('mobileMenu');
    const backdrop = document.getElementById('drawerBackdrop');

    function isOpen() { return drawer && drawer.classList.contains('open'); }

    function openDrawer() {
      if (!drawer) return;
      drawer.removeAttribute('hidden');        // visible para AT y CSS
      drawer.classList.add('open');            // ✅ necesario según CSS (.drawer.open)
      toggle && toggle.setAttribute('aria-expanded', 'true');

      if (backdrop) {
        backdrop.classList.add('open');        // ✅ muestra backdrop (.drawer-backdrop.open)
        backdrop.setAttribute('aria-hidden', 'false');
      }
      document.body.style.overflow = 'hidden';

      const firstLink = drawer.querySelector('a,button,[tabindex]:not([tabindex="-1"])');
      if (firstLink) firstLink.focus({ preventScroll: true });
    }

    function closeDrawer() {
      if (!drawer) return;
      drawer.classList.remove('open');         // cierra animación
      drawer.setAttribute('hidden', '');       // oculta semánticamente
      toggle && toggle.setAttribute('aria-expanded', 'false');

      if (backdrop) {
        backdrop.classList.remove('open');
        backdrop.setAttribute('aria-hidden', 'true');
      }
      document.body.style.overflow = '';
      toggle && toggle.focus({ preventScroll: true });
    }

    if (toggle && drawer) {
      toggle.addEventListener('click', () => { isOpen() ? closeDrawer() : openDrawer(); });
      backdrop && backdrop.addEventListener('click', closeDrawer);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) closeDrawer(); });

      // Trap de foco simple
      drawer.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const focusables = drawer.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      });

      // Si el viewport pasa a desktop con el drawer abierto, ciérralo
      window.addEventListener('resize', () => { if (window.innerWidth > 860 && isOpen()) closeDrawer(); });
    }

    // Inicializa menús desktop
    setupDesktopMenus();
  }

  /* ===== Inicio ===== */
  document.addEventListener('DOMContentLoaded', function () {
    inject('header-placeholder', 'header.html', initHeader);
    inject('footer-placeholder', 'footer.html', null);
  });
})();
