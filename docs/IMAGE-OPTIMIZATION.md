# Optimización de Imágenes - Guía Completa

Sistema automatizado para optimizar, comprimir y generar versiones responsive de imágenes.

## 🎯 Objetivo

Reducir el tamaño de las imágenes sin pérdida visible de calidad para:
- ⚡ Cargar páginas más rápido
- 💾 Ahorrar bandwidth
- 📱 Mejorar experiencia en móviles
- 🚀 Mejor SEO (Core Web Vitals)

## 📦 Requisitos

```bash
npm install sharp
```

Sharp es una librería de procesamiento de imágenes ultra-rápida (ya instalada para OG images).

## 🚀 Uso Rápido

### Optimizar un directorio

```bash
node tools/optimize-images.js multimedia
```

### Optimizar todos los directorios de imágenes

```bash
node tools/optimize-images.js
```

Por defecto procesa: `allure`, `Milan`, `serena`, `fmia`, `fotoprop`, `multimedia`

### Modo prueba (sin modificar archivos)

```bash
node tools/optimize-images.js --dry-run
```

## ⚙️ Opciones

| Opción | Descripción |
|--------|-------------|
| `--dry-run, -d` | Modo prueba (muestra qué haría sin modificar) |
| `--no-backup` | No crear archivos `.backup` |
| `--no-webp` | No generar versiones WebP |
| `--no-responsive` | No generar tamaños responsive |
| `--quality <n>` | Calidad JPEG/WebP (1-100, default: 80) |
| `--output <dir>` | Guardar en otro directorio |
| `--help, -h` | Mostrar ayuda |

## 📖 Ejemplos

### Optimizar con máxima calidad

```bash
node tools/optimize-images.js --quality 90 multimedia
```

### Solo optimizar, sin WebP ni responsive

```bash
node tools/optimize-images.js --no-webp --no-responsive allure
```

### Guardar optimizadas en otro directorio

```bash
node tools/optimize-images.js --output optimized multimedia
```

### Ver qué se haría sin modificar

```bash
node tools/optimize-images.js --dry-run
```

## 🎨 Configuración Predeterminada

```javascript
{
  quality: {
    jpeg: 80,    // 80% calidad JPEG (balance perfecto)
    webp: 80,    // 80% calidad WebP
    png: 8       // Nivel 8 de compresión PNG
  },

  responsive: {
    enabled: true,
    sizes: [400, 800, 1200, 1600]  // 4 tamaños
  },

  webp: {
    enabled: true,
    replaceOriginal: false  // Mantener originales
  },

  minSize: 50 * 1024  // Solo optimizar si > 50KB
}
```

## 🖼️ ¿Qué hace el script?

### 1. Optimización Básica

**Para cada imagen:**
- ✅ Comprime JPEG con mozjpeg (mejor algoritmo)
- ✅ Comprime PNG con nivel 8
- ✅ Activa progressive rendering
- ✅ Elimina metadatos innecesarios
- ✅ Mantiene calidad visual

**Resultado:**
```
imagen.jpg
  5.2MB → 1.8MB (-65%)
```

### 2. Generación de WebP

WebP es un formato moderno de Google que comprime mejor:

```
imagen.jpg       (original)
imagen.webp      (versión WebP, -30% más pequeño)
```

**Uso en HTML:**
```html
<picture>
  <source srcset="imagen.webp" type="image/webp">
  <img src="imagen.jpg" alt="...">
</picture>
```

### 3. Versiones Responsive

Genera múltiples tamaños para diferentes dispositivos:

```
imagen.jpg           (original 1920px)
imagen-400w.jpg      (móvil pequeño)
imagen-800w.jpg      (móvil/tablet)
imagen-1200w.jpg     (desktop)
imagen-1600w.jpg     (desktop HD)
```

**Uso en HTML:**
```html
<img
  src="imagen.jpg"
  srcset="
    imagen-400w.jpg 400w,
    imagen-800w.jpg 800w,
    imagen-1200w.jpg 1200w,
    imagen-1600w.jpg 1600w
  "
  sizes="(max-width: 600px) 400px,
         (max-width: 1200px) 800px,
         1200px"
  alt="..."
>
```

### 4. Backups Automáticos

Por seguridad, crea copias `.backup` antes de modificar:

```
imagen.jpg
imagen.jpg.backup  ← backup del original
```

## 📊 Ejemplo de Output

```
📁 Procesando: multimedia
  Found 15 images

  ✅ multimedia/hero.jpg
     5.2MB → 1.8MB (-65.4%)
     💚 WebP: 1.2MB
     📐 400w: 45KB
     📐 800w: 180KB
     📐 1200w: 420KB

  ✅ multimedia/logo.png
     850KB → 320KB (-62.4%)
     💚 WebP: 280KB

  ⏭️  Skipped (too small): multimedia/icon.png

============================================================
📊 ESTADÍSTICAS
============================================================
Imágenes procesadas: 14
Imágenes saltadas:   1
Errores:             0

Tamaño original:     45.2MB
Tamaño optimizado:   15.8MB
Espacio ahorrado:    29.4MB (-65.0%)
============================================================
```

## 🎯 Recomendaciones

### Cuándo optimizar

✅ **Sí optimizar:**
- Fotos de propiedades (suelen ser muy pesadas)
- Imágenes hero/banner
- Galerías de fotos
- Antes de subir al repositorio

❌ **No optimizar:**
- Logos pequeños (< 50KB)
- Iconos SVG
- Imágenes ya optimizadas
- Screenshots de UI (pierden nitidez)

### Calidad recomendada

| Tipo | Calidad | Razón |
|------|---------|-------|
| Fotos propiedades | 80% | Balance perfecto |
| Hero images | 85% | Más importantes |
| Thumbnails | 75% | Menos críticas |
| Iconos | 100% | Ya son pequeños |

### Workflow recomendado

1. **Siempre hacer dry-run primero:**
   ```bash
   node tools/optimize-images.js --dry-run multimedia
   ```

2. **Revisar resultados y optimizar:**
   ```bash
   node tools/optimize-images.js multimedia
   ```

3. **Verificar visualmente las imágenes**

4. **Si están bien, eliminar backups:**
   ```bash
   find . -name "*.backup" -delete
   ```

5. **Commit y push**

## 🔧 Integración con Lazy Loading

Combinar con el sistema de lazy loading:

```html
<!-- Responsive + Lazy -->
<img
  data-src="imagen-800w.jpg"
  data-srcset="
    imagen-400w.webp 400w,
    imagen-800w.webp 800w,
    imagen-1200w.webp 1200w
  "
  sizes="(max-width: 600px) 400px, 800px"
  alt="Propiedad"
  class="blur-up"
>
```

Resultado: Máximo performance!

## 📈 Impacto Esperado

**Antes de optimizar:**
```
Página con 10 fotos: 35MB
LCP: 4.2s
Bandwidth mensual: 2.5TB
```

**Después de optimizar:**
```
Página con 10 fotos: 8MB (-77%)
LCP: 1.8s (-57%)
Bandwidth mensual: 580GB (-77%)
```

*(Datos aproximados)*

## ⚠️ Advertencias

1. **Backups:** Siempre crea backups (--no-backup solo si estás seguro)
2. **Calidad:** No bajes de 75% para fotos de productos
3. **Testing:** Prueba en diferentes dispositivos después
4. **Git:** Imágenes grandes en Git no son ideales (considera Git LFS)
5. **Formatos:** WebP no funciona en IE11 (usa fallbacks)

## 🐛 Troubleshooting

**"Error: sharp no está instalado"**
```bash
npm install sharp
```

**"Las imágenes se ven pixeladas"**
- Sube la calidad: `--quality 90`
- O no optimices ese tipo de imagen

**"El script es muy lento"**
- Normal con muchas imágenes
- Sharp es rápido pero procesar 100+ fotos toma tiempo
- Considera procesar por directorio

**"No genera versiones responsive"**
- Solo si la imagen original es mayor que el tamaño
- Usar `--no-responsive` para deshabilitar

**"Los backups ocupan mucho espacio"**
- Elimínalos cuando estés seguro:
  ```bash
  find . -name "*.backup" -delete
  ```

## 📚 Recursos

- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [WebP vs JPEG](https://developers.google.com/speed/webp)
- [Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [Image Optimization](https://web.dev/fast/#optimize-your-images)

## 🎓 Tips Avanzados

### Batch processing por tipo

```bash
# Solo JPEGs
find multimedia -name "*.jpg" -exec node tools/optimize-images.js {} \;

# Solo PNGs
node tools/optimize-images.js --no-responsive multimedia/*.png
```

### Optimizar antes de commit (Git hook)

Crear `.git/hooks/pre-commit`:
```bash
#!/bin/bash
node tools/optimize-images.js --dry-run
```

### Monitorear tamaños

```bash
# Antes
du -sh multimedia/

# Después
du -sh multimedia/
```

---

**¿Dudas?** El script está bien documentado internamente. Revisa `tools/optimize-images.js`.
