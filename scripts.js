window.__ALT_BUILD='2025-09-15d';
/* ========== Altorra - scripts base (optimizado rendimiento) ========== */
/* v2025-09-07.1 — Fixes: city sin doble encode + URLs absolutas en imágenes */

/* ============== 0) Utilidades comunes ============== */
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[tag]));
}

function formatCOP(amount) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(amount);
}

// Función para cargar JSON con caché (asumida de tu original)
async function getJSONCached(url, ttl = 6 * 60 * 60 * 1000) {
  const cacheKey = `altorra:json:${url}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < ttl) return data;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
    return data;
  } catch (e) {
    console.warn('Error en getJSONCached:', e);
    return null;
  }
}

// Orden inteligente (de tu original)
function dailySeed() {
  const k = 'altorra:shuffleSeed';
  const today = (new Date()).toISOString().slice(0,10);
  try {
    const raw = localStorage.getItem(k);
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj && obj.date === today) return obj.seed;
    }
  } catch (_) {}
  const seed = Math.floor(Math.random() * 1e9);
  try { localStorage.setItem(k, JSON.stringify({ date: today, seed })); } catch (_) {}
  return seed;
}

function seededShuffle(list, seed) {
  let s = seed || 1; const a = 1664525, c = 1013904223, m = 2**32;
  const r = () => (s = (a * s + c) % m) / m;
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

function smartOrder(list) {
  const url = new URL(document.location);
  const qOrder = (url.searchParams.get('order') || '').toLowerCase();
  let L = list.slice();

  L.sort((a, b) => (Number(b.featured || 0) - Number(a.featured || 0)));

  if (qOrder === 'views') {
    L.sort((a, b) => {
      const fb = (Number(b.featured || 0) - Number(a.featured || 0));
      if (fb) return fb;
      return Number(b.views || 0) - Number(a.views || 0);
    });
    return L;
  }

  L.sort((a, b) => {
    const fb = (Number(b.featured || 0) - Number(a.featured || 0));
    if (fb) return fb;
    const hb = Number(b.highlightScore || 0) - Number(a.highlightScore || 0);
    if (hb) return hb;
    return 0;
  });
  return seededShuffle(L, dailySeed());
}

// Función buildCard (reconstruida basada en tu uso)
function buildCard(p, mode) {
  const card = document.createElement('div');
  card.className = 'card';

  const img = document.createElement('img');
  img.src = p.images?.[0] || '/placeholder.jpg'; // Ajusta según tu data.json
  img.alt = p.title || 'Propiedad';
  img.loading = 'lazy';
  card.appendChild(img);

  const content = document.createElement('div');
  content.className = 'card-content';
  content.innerHTML = `
    <h3>${escapeHTML(p.title || 'Sin título')}</h3>
    <p>${p.beds || 0} Hab / ${p.baths || 0} Baños / ${p.sqm || 0} m²</p>
    <p>${formatCOP(p.price || 0)}</p>
  `;
  card.appendChild(content);

  // Botón de favoritos (de Fase 2.1, opcional aquí si lo quieres desde el inicio)
  const favBtn = document.createElement('button');
  favBtn.className = 'fav-btn';
  favBtn.dataset.id = p.id;
  favBtn.innerHTML = '❤️';
  card.appendChild(favBtn);

  return card;
}

/* ============== 6) Registrar service worker para PWA (si existe) ============== */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').catch(function(err) {
    console.warn('SW registration failed', err);
  });
}

/* === Altorra Fase2.5: Org JSON-LD (auto) === */
(function() {
  try {
    if (document.querySelector('script[type="application/ld+json"].org-jsonld')) return;
    var org = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ALTORRA Inmobiliaria",
      "url": "https://altorrainmobiliaria.github.io/ALTORRA-PILOTO/",
      "logo": "https://i.postimg.cc/SsPmBFXt/Chat-GPT-Image-9-altorra-logo-2025-10-31-20.png",
      "sameAs": ["https://www.instagram.com/altorrainmobiliaria", "https://www.facebook.com/share/16MEXCeAB4/?mibextid=wwXIfr", "https://www.tiktok.com/@altorrainmobiliaria"]
    };
    var s = document.createElement('script');
    s.type = "application/ld+json";
    s.className = "org-jsonld";
    s.textContent = JSON.stringify(org);
    document.head.appendChild(s);
  } catch (e) { console.warn("Org JSON-LD inject failed", e); }
})();
