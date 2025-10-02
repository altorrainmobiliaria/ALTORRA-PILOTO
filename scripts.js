/* ========================================
   REEMPLAZAR la función buildCard() en scripts.js
   (aprox. línea 147) — versión con botón de favorito
   ======================================== */

function buildCard(p, mode){
  const el = document.createElement('article');
  el.className = 'card'; 
  el.setAttribute('role','listitem');

  const img = document.createElement('img');
  img.loading='lazy'; 
  img.decoding='async'; 
  img.alt = escapeHtml(p.title || 'Propiedad');
  const raw = p.image || p.img || p.img_url || p.imgUrl || p.photo;

  if (raw) {
    const isAbsolute = /^https?:\/\//i.test(raw);
    if (isAbsolute || raw.startsWith('/')) {
      img.src = raw;
    } else {
      img.src = '/' + raw.replace(/^\.?\//,'');
    }
  } else {
    img.src = 'https://i.postimg.cc/0yYb8Y6r/placeholder.png';
  }

  // Contenedor de la imagen con badge de favorito
  const mediaDiv = document.createElement('div');
  mediaDiv.className = 'media';
  mediaDiv.style.position = 'relative';
  
  // Botón de favorito
  const favBtn = document.createElement('button');
  favBtn.className = 'fav-btn';
  favBtn.type = 'button';
  favBtn.setAttribute('aria-label', 'Guardar favorito');
  favBtn.setAttribute('aria-pressed', 'false');
  favBtn.setAttribute('data-prop-id', p.id || '');
  favBtn.innerHTML = '<span class="heart">♡</span>';
  
  mediaDiv.appendChild(img);
  mediaDiv.appendChild(favBtn);

  const body = document.createElement('div'); 
  body.className='body';
  const h3 = document.createElement('h3'); 
  h3.innerHTML = escapeHtml(p.title || 'Sin título');

  const specs = document.createElement('div'); 
  specs.style.color='var(--muted)';
  const parts = [];
  if(p.beds)  parts.push(p.beds+'H');
  if(p.baths) parts.push(p.baths+'B');
  if(p.sqm)   parts.push(p.sqm+' m²');
  specs.textContent = parts.join(' · ');

  const price = document.createElement('div');
  price.style.marginTop='4px'; 
  price.style.fontWeight='800'; 
  price.style.color='var(--gold)';
  if(p.price){
    price.textContent = (mode==='arriendo' ? '$'+formatCOP(p.price)+' COP / mes' :
                         mode==='dias'     ? '$'+formatCOP(p.price)+' COP / noche' :
                                             '$'+formatCOP(p.price)+' COP');
  }

  el.appendChild(mediaDiv);
  el.appendChild(body);
  body.appendChild(h3); 
  body.appendChild(specs); 
  body.appendChild(price);

  // Click en la tarjeta (excepto en el botón de favorito)
  el.addEventListener('click', function(e){
    if (e.target.closest('.fav-btn')) return;
    const id = p.id || '';
    window.location.href = 'detalle-propiedad.html?id=' + encodeURIComponent(id);
  });
  
  return el;
}
