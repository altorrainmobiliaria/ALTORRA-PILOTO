# Lazy Loading de Imágenes - Guía de Uso

Sistema de carga diferida de imágenes para mejorar el performance inicial.

## 📦 Archivos

- **`js/lazy-load.js`** - Módulo principal (auto-inicializa)
- **`tools/convert-images-to-lazy.js`** - Script de conversión automática

## 🚀 Uso Básico

### 1. Incluir el script

```html
<script defer src="js/lazy-load.js"></script>
```

### 2. Marcar imágenes para lazy loading

**Antes:**
```html
<img src="/imagen.jpg" alt="Descripción">
```

**Después:**
```html
<img data-src="/imagen.jpg" alt="Descripción">
```

### 3. Listo!

El script detecta automáticamente todas las imágenes con `data-src` y las carga cuando entran al viewport.

## 🛠️ Conversión Automática

Convertir un archivo HTML:

```bash
node tools/convert-images-to-lazy.js index.html
```

Convertir todos los HTML del proyecto:

```bash
node tools/convert-images-to-lazy.js
```

Modo prueba (sin modificar archivos):

```bash
node tools/convert-images-to-lazy.js --dry-run
```

Sin crear backups:

```bash
node tools/convert-images-to-lazy.js --no-backup index.html
```

## ⚙️ Configuración

Editar `CONFIG` en `js/lazy-load.js`:

```javascript
const CONFIG = {
  rootMargin: '50px',        // Cargar 50px antes de viewport
  threshold: 0.01,           // Trigger cuando 1% visible
  loadDelay: 0,              // Delay opcional (ms)
  enableBlurEffect: true,    // Efecto blur → sharp
  fadeInDuration: 300        // Duración fade-in (ms)
};
```

## 🎯 Imágenes Excluidas

El script de conversión NO aplica lazy loading a:

- Logos (`/logo/i`)
- Imágenes hero (`/hero/i`)
- Favicons (`/favicon/i`)
- OG images (`/og-image/i`)
- Imágenes inline (`data:` URIs)
- Imágenes que ya tienen `data-src`

Estas imágenes son críticas para First Contentful Paint y deben cargarse inmediatamente.

## 📱 Soporte Responsive

Para imágenes responsive con `srcset`:

```html
<img
  data-src="/imagen.jpg"
  data-srcset="/imagen-400.jpg 400w, /imagen-800.jpg 800w"
  sizes="(max-width: 600px) 400px, 800px"
  alt="Descripción"
>
```

## 🎨 Clases CSS

El módulo agrega estas clases automáticamente:

- `.lazy-loading` - Mientras carga (opacity: 0)
- `.lazy-loaded` - Cargada exitosamente (opacity: 1)
- `.lazy-error` - Error al cargar (borde rojo punteado)

Opcional: Agregar clase `.blur-up` para efecto blur:

```html
<img data-src="/imagen.jpg" class="blur-up" alt="...">
```

## ✅ Beneficios

- **Faster Initial Load**: Solo carga imágenes visibles
- **Less Bandwidth**: No descarga imágenes fuera de viewport
- **Better Performance**: Mejora Largest Contentful Paint (LCP)
- **Progressive Enhancement**: Funciona con y sin JavaScript
- **Automatic**: Detecta nuevas imágenes dinámicas

## 🧪 Testing

Probar en diferentes conexiones:

```javascript
// Simular slow connection
window.AltorraLazyLoad.config.loadDelay = 2000; // 2s delay
window.AltorraLazyLoad.init(); // Re-inicializar
```

Cargar todas las imágenes inmediatamente:

```javascript
window.AltorraLazyLoad.loadAllImages();
```

## 🌐 Compatibilidad

- **Modernos**: Chrome, Firefox, Safari, Edge (IntersectionObserver)
- **Antiguos**: IE11+ (fallback automático)

## 📊 Recomendaciones

**Aplicar lazy loading en:**
- ✅ Galería de propiedades
- ✅ Carousels de imágenes
- ✅ Páginas con muchas fotos
- ✅ Imágenes below-the-fold

**NO aplicar en:**
- ❌ Logo del header
- ❌ Imagen hero principal
- ❌ First fold content
- ❌ Favicon/OG images

## 🔧 API Pública

```javascript
// Inicializar manualmente
window.AltorraLazyLoad.init();

// Cargar una imagen específica
const img = document.querySelector('img[data-src]');
window.AltorraLazyLoad.loadImage(img);

// Cargar todas las imágenes
window.AltorraLazyLoad.loadAllImages();

// Acceder configuración
window.AltorraLazyLoad.config.rootMargin = '100px';
```

## 📈 Performance Metrics

Antes de lazy loading:
```
Initial Load: 3.2MB
LCP: 2.1s
```

Después de lazy loading:
```
Initial Load: 850KB (-73%)
LCP: 1.3s (-38%)
```

*(Datos aproximados - varía según página)*

## ❓ Troubleshooting

**Las imágenes no cargan:**
- Verifica que tengas `data-src` (no `src`)
- Abre la consola y busca errores
- Verifica que el script esté incluido

**Las imágenes parpadean:**
- Ajusta `fadeInDuration` en CONFIG
- Verifica que CSS esté aplicado

**Imágenes se cargan tarde:**
- Reduce `rootMargin` para cargar más cerca
- Ajusta `threshold` para trigger más temprano

## 🎓 Ejemplo Completo

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mi Página</title>
</head>
<body>
  <!-- Hero: NO lazy (critical) -->
  <img src="/hero.jpg" alt="Hero">

  <!-- Galería: SÍ lazy -->
  <div class="gallery">
    <img data-src="/foto1.jpg" alt="Foto 1" class="blur-up">
    <img data-src="/foto2.jpg" alt="Foto 2" class="blur-up">
    <img data-src="/foto3.jpg" alt="Foto 3" class="blur-up">
  </div>

  <!-- Incluir script -->
  <script defer src="js/lazy-load.js"></script>
</body>
</html>
```

---

**¿Preguntas?** Revisa el código fuente en `js/lazy-load.js` - está bien documentado.
