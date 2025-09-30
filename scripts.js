window.__ALT_BUILD='2025-09-15d';
/* ========== Altorra - scripts base (optimizado rendimiento) ========== */
/* v2025-09-07.1 — Fixes: city sin doble encode + URLs absolutas en imágenes */

// Tu código original aquí... (copia todo lo que tenías antes de las funciones específicas)

function buildCard(p, mode) {
  // Tu código original de buildCard...
  // Al final, antes de return card, agrega:

  const favBtn = document.createElement('button');
  favBtn.className = 'fav-btn';
  favBtn.dataset.id = p.id;
  favBtn.innerHTML = '❤️';
  card.appendChild(favBtn);  // Agregado botón fav

  return card;
}

// Resto de tu código original...

/* ============== 6) Registrar service worker para PWA (si existe) ============== */
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/service-worker.js').catch(function(err){
    console.warn('SW registration failed', err);
  });
}

/* === Altorra Fase2.5: Org JSON-LD (auto) === */
// Tu código JSON-LD...
