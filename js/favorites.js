/* js/favorites.js
   Favoritos en localStorage + badge en header
   Requiere en header.html un <span data-fav-badge>
*/
window.Favs = (() => {
  const KEY = 'altorra:favorites';
  const $badge = () => document.querySelector('[data-fav-badge]');

  const load = () => {
    try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); }
    catch { return new Set(); }
  };
  const save = (set) => {
    localStorage.setItem(KEY, JSON.stringify([...set]));
    const b = $badge();
    if (b) b.textContent = String(set.size);
  };

  const store = load();
  const has = (id) => store.has(String(id));
  const add = (id) => { store.add(String(id)); save(store); };
  const remove = (id) => { store.delete(String(id)); save(store); };
  const toggle = (id) => { has(id) ? remove(id) : add(id); };

  document.addEventListener('DOMContentLoaded', () => save(store));

  return { has, add, remove, toggle, all: () => [...store] };
})();
