const FAV_KEY = 'altorra:favorites';

function getFavorites() {
  return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
}

function saveFavorites(favs) {
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
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
    btn.classList.toggle('active', getFavorites().includes(btn.dataset.id));
  });
}

function updateFavBadge() {
  const badge = document.getElementById('fav-badge');
  if (badge) {
    const count = getFavorites().length;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline' : 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateFavButtons();
  updateFavBadge();
  document.addEventListener('click', e => {
    if (e.target.classList.contains('fav-btn')) toggleFavorite(e.target.dataset.id);
  });
});
