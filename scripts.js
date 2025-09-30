window.__ALT_BUILD = '2025-09-15d';
/* ========== Altorra - scripts base (optimizado rendimiento) ========== */
/* v2025-09-07.1 — Fixes: city sin doble encode + UR...(truncated 13723 characters)...rescar cards (opcional) */
document.addEventListener('altorra:json-updated', (ev) => {
  if (!/properties\/data\.json$/.test(ev.detail?.url || '')) return;
  // Render simple otra vez (sin flicker porque ya hay contenido)
  cfg.forEach(async (c) => {
    const root = document.getElementById(c.targetId);
    if(!root) return;
    const arr = await fetchByOperation(c.operation);
    root.innerHTML = '';

    /* === REEMPLAZO 2: usar orden inteligente en refresco === */
    const ordered = smartOrder(arr);
    ordered.slice(0,8).forEach(p => root.appendChild(buildCard(p, c.mode)));
  });
}, { once: true });
});

/* ============== 6) Registrar service worker para PWA (si existe) ============== */
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/service-worker.js').catch(function(err){
    console.warn('SW registration failed', err);
  });
}

/* === Altorra Fase2.5: Org JSON-LD (auto) === */
(function(){
  try{
    if(document.querySelector('script[type="application/ld+json"].org-jsonld')) return;
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
  }catch(e){ console.warn("Org JSON-LD inject failed", e); }
}());

// Agregado para index: Cargar propiedades en rows
document.addEventListener('DOMContentLoaded', async () => {
  const operations = [
    { id: 'venta-row', operation: 'comprar' },
    { id: 'arriendo-row', operation: 'arrendar' },
    { id: 'dias-row', operation: 'dias' }
  ];

  operations.forEach(async (op) => {
    const root = document.getElementById(op.id);
    if (!root) return;
    const arr = allProperties.filter(p => p.operation === op.operation); // Asumiendo allProperties de getJSONCached
    const ordered = smartOrder(arr);
    root.innerHTML = '';
    ordered.slice(0, 3).forEach(p => root.appendChild(buildCard(p, 'home')));
  });

  // Reseñas
  const reviews = await getJSONCached('reviews.json');
  if (reviews) {
    const shuffled = seededShuffle(reviews, dailySeed());
    const selected = shuffled.slice(0, 3);
    const root = document.getElementById('google-reviews');
    selected.forEach(r => {
      const reviewCard = document.createElement('div');
      reviewCard.className = 'review-card';
      reviewCard.innerHTML = `
        <div class="rating">★${r.rating}</div>
        <p>"${escapeHTML(r.content)}"</p>
        <p>- ${r.author} via ${r.time}</p>
      `;
      root.appendChild(reviewCard);
    });
  }
});
