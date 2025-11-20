# 🖼️ Herramientas de Optimización de Imágenes

## Scripts Disponibles

### 1. analyze-images.js - Analizador

**¿Qué hace?**
- Escanea todas las imágenes del proyecto
- Reporta tamaños, formatos, dimensiones
- Identifica imágenes que necesitan optimización
- Sugiere acciones específicas
- **NO modifica nada**

**Uso:**
```bash
# Analizar todo
node tools/analyze-images.js

# Analizar directorio específico
node tools/analyze-images.js multimedia

# Analizar varios directorios
node tools/analyze-images.js allure Milan
```

**Output ejemplo:**
```
📊 REPORTE DE ANÁLISIS DE IMÁGENES
=================================================
📁 Total de imágenes: 42
💾 Tamaño total: 58.3MB

📊 Por formato:
  JPEG   28 ████████████████████
  PNG    10 ███████
  WEBP    4 ██

📏 Por tamaño:
  Pequeñas (< 100KB):  8
  Medianas (< 500KB):  14
  Grandes (< 2MB):     16
  Muy grandes (> 2MB): 4

⚠️  Imágenes que necesitan optimización: 18

💡 SUGERENCIAS:
  🔴 4 imágenes grandes que deberían comprimirse
  🟡 14 imágenes sin versión WebP
```

### 2. optimize-images.js - Optimizador

**¿Qué hace?**
- Comprime imágenes (JPEG mozjpeg, PNG nivel 8)
- Genera versiones WebP automáticamente
- Crea tamaños responsive (400w, 800w, 1200w, 1600w)
- Crea backups antes de modificar
- Reporta ahorro de espacio

**Uso básico:**
```bash
# Dry run (ver qué haría)
node tools/optimize-images.js --dry-run

# Optimizar directorio
node tools/optimize-images.js multimedia

# Optimizar todo
node tools/optimize-images.js
```

**Opciones avanzadas:**
```bash
# Calidad 90% (más alta)
node tools/optimize-images.js --quality 90 multimedia

# Sin WebP
node tools/optimize-images.js --no-webp multimedia

# Sin responsive
node tools/optimize-images.js --no-responsive multimedia

# Sin backups (CUIDADO!)
node tools/optimize-images.js --no-backup multimedia

# Guardar en otro directorio
node tools/optimize-images.js --output optimized multimedia
```

**Output ejemplo:**
```
📁 Procesando: multimedia

  ✅ multimedia/hero.jpg
     5.2MB → 1.8MB (-65.4%)
     💚 WebP: 1.2MB
     📐 400w: 45KB
     📐 800w: 180KB
     📐 1200w: 420KB

============================================================
📊 ESTADÍSTICAS
============================================================
Imágenes procesadas: 14
Tamaño original:     45.2MB
Tamaño optimizado:   15.8MB
Espacio ahorrado:    29.4MB (-65.0%)
============================================================
```

## 🚀 Workflow Recomendado

### 1️⃣ Analizar primero
```bash
node tools/analyze-images.js
```
→ Ver cuánto se puede ahorrar

### 2️⃣ Dry run para verificar
```bash
node tools/optimize-images.js --dry-run
```
→ Ver qué se va a hacer

### 3️⃣ Optimizar
```bash
node tools/optimize-images.js
```
→ Aplicar optimizaciones

### 4️⃣ Verificar resultados
Abrir algunas imágenes y verificar que se vean bien

### 5️⃣ Limpiar backups (opcional)
```bash
find . -name "*.backup" -delete
```

### 6️⃣ Commit
```bash
git add .
git commit -m "Optimizadas imágenes (-65% tamaño)"
git push
```

## ⚙️ Configuración por Defecto

```javascript
{
  quality: {
    jpeg: 80,    // Balance perfecto
    webp: 80,
    png: 8
  },

  responsive: {
    sizes: [400, 800, 1200, 1600]  // px
  },

  minSize: 50 * 1024  // Solo optimizar si > 50KB
}
```

## 📊 Resultados Típicos

| Tipo | Antes | Después | Ahorro |
|------|-------|---------|--------|
| Foto propiedad | 4.2MB | 1.4MB | -67% |
| Hero banner | 3.8MB | 1.2MB | -68% |
| Gallery thumb | 850KB | 280KB | -67% |
| Logo PNG | 450KB | 180KB | -60% |

## ⚠️ Importante

1. **Siempre hacer dry-run primero**
2. **Verificar imágenes después de optimizar**
3. **Los backups se crean automáticamente**
4. **No subir backups a Git** (agregar `*.backup` a `.gitignore`)
5. **WebP requiere fallbacks para IE11**

## 🐛 Problemas Comunes

**"sharp no está instalado"**
```bash
npm install sharp
```

**"Las imágenes se ven mal"**
- Aumenta calidad: `--quality 90`
- O no optimices ese tipo de imagen

**"Muy lento"**
- Normal con muchas imágenes
- Considera procesar por directorio

## 📚 Más Info

Ver documentación completa: `docs/IMAGE-OPTIMIZATION.md`

## 💡 Tips

- Optimizar antes de commit
- Usar WebP para navegadores modernos con `<picture>` fallback
- Combinar con lazy loading para máximo performance
- Medir mejoras con Lighthouse

---

**Requisitos:** Node.js + Sharp (`npm install sharp`)
