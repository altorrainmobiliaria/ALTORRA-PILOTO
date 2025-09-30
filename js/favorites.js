/* Altorra - Sistema de Favoritos (corregido) */

const FAV_KEY = 'altorra:favorites';

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
  } catch { return []; }
}

function saveFavorites(favs) {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  } catch {}
}

function toggleFavorite(id) {
  let favs = getFavorites();
  const index = favs.indexOf(id);
  if (index > -1) favs.splice(index, 1);
  else favs.push(id);
  saveFavorites(favs);
  updateFavButtons();
  updateFavBadge();
}

function updateFavButtons() {
  document.querySelectorAll('.fav-btn').forEach(btn => {
    const id = btn.dataset.id;
    btn.style.color = getFavorites().includes(id) ? 'var(--accent)' : '#ccc';
  });
}

function updateFavBadge() {
  const badge = document.getElementById('fav-badge');
  if (badge) {
    const count = getFavorites().length;
    badge.textContent = count > 0 ? count : '';
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  }
}

document.addEventLoaded('DOMContentLoaded', () => {
  updateFavButtons();
  updateFavBadge();
  document.body.addEventListener('click', e => {
    if (e.target.classList.contains('fav-btn')) {
      toggleFavorite(e.target.dataset.id);
    }
  });
});
