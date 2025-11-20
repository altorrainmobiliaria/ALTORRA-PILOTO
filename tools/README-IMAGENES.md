# Guía Simple: Optimización de Imágenes

## ¿Para qué sirven estas herramientas?

Tienes **dos herramientas** para manejar imágenes:

### 1️⃣ **analyze-images.js** - Ver qué imágenes necesitan optimización

**¿Qué hace?**
- Revisa todas las imágenes de la página
- Te dice cuáles son muy pesadas
- Te muestra un reporte

**¿Cómo usarlo?**

```bash
# Ver todas las imágenes
node tools/analyze-images.js

# Ver solo imágenes de una carpeta específica
node tools/analyze-images.js multimedia
node tools/analyze-images.js allure
```

**Resultado:**
Te muestra un reporte como este:
```
📊 REPORTE DE ANÁLISIS DE IMÁGENES
========================================
📁 Total de imágenes: 45
💾 Tamaño total: 25.5MB

⚠️  Imágenes que necesitan optimización: 12

📦 Top 10 más grandes:
  1.   5.2MB - multimedia/hero.jpg
  2.   3.8MB - allure/foto1.jpg
  ...
```

---

### 2️⃣ **optimize-images.js** - Optimizar las imágenes

**¿Qué hace?**
- Reduce el tamaño de las imágenes (hasta 70% más pequeñas)
- Crea versiones WebP (formato moderno)
- Crea versiones responsive (para móviles, tablets, desktop)
- Guarda backups automáticos

**¿Cómo usarlo?**

```bash
# Primero SIEMPRE hacer una prueba (no modifica nada)
node tools/optimize-images.js --dry-run multimedia

# Si te gusta el resultado, optimizar de verdad
node tools/optimize-images.js multimedia

# Optimizar TODO
node tools/optimize-images.js
```

**IMPORTANTE:**
- Siempre usa `--dry-run` primero para ver qué haría
- Se crean backups automáticos (archivo.jpg.backup)
- Puedes borrar los backups después si todo salió bien

---

## 📋 Workflow Recomendado (Paso a Paso)

### Escenario 1: Tienes nuevas fotos de propiedades

```bash
# Paso 1: Copia las fotos a la carpeta correcta
# Ejemplo: copia tus fotos a /allure/

# Paso 2: Ver qué tan pesadas son
node tools/analyze-images.js allure

# Paso 3: Prueba de optimización (no modifica nada)
node tools/optimize-images.js --dry-run allure

# Paso 4: Si te gusta, optimiza de verdad
node tools/optimize-images.js allure

# Paso 5: Revisa que las imágenes se vean bien en la página

# Paso 6: Si todo está bien, borra los backups
find allure -name "*.backup" -delete
```

### Escenario 2: La página carga lento, quiero optimizar todo

```bash
# Paso 1: Ver el estado actual
node tools/analyze-images.js

# Paso 2: Prueba global
node tools/optimize-images.js --dry-run

# Paso 3: Optimizar todo
node tools/optimize-images.js

# Paso 4: Verificar visualmente la página

# Paso 5: Borrar backups (cuando estés seguro)
find . -name "*.backup" -delete
```

---

## ⚙️ Opciones Útiles

### Para analyze-images.js:
```bash
# Ver ayuda
node tools/analyze-images.js --help

# Analizar solo una carpeta
node tools/analyze-images.js multimedia
```

### Para optimize-images.js:
```bash
# Ver ayuda
node tools/optimize-images.js --help

# Modo prueba (no modifica)
node tools/optimize-images.js --dry-run

# Cambiar calidad (default: 80)
node tools/optimize-images.js --quality 90 multimedia

# No crear WebP
node tools/optimize-images.js --no-webp multimedia

# No crear versiones responsive
node tools/optimize-images.js --no-responsive multimedia

# No crear backups (PELIGROSO, solo si estás seguro)
node tools/optimize-images.js --no-backup multimedia
```

---

## 🎯 Preguntas Frecuentes

### ¿Cuándo debo optimizar?
- Antes de subir fotos nuevas al repositorio
- Si la página carga lento
- Si las imágenes pesan más de 500KB

### ¿Cuándo NO optimizar?
- Logos pequeños (< 50KB)
- Iconos SVG
- Imágenes ya optimizadas

### ¿Se van a ver mal las fotos?
No. Con calidad 80% (default) no se nota la diferencia visualmente.

### ¿Qué pasa con los backups?
Se crean automáticamente con extensión `.backup`.
Bórralos cuando estés seguro de que todo salió bien:
```bash
find . -name "*.backup" -delete
```

### ¿Cómo sé si funcionó?
Compara el "antes" y "después":
```bash
# Antes
du -sh multimedia/
# 45MB

# Después de optimizar
du -sh multimedia/
# 15MB  (¡-67%!)
```

---

## 🚨 Errores Comunes

### "sharp no está instalado"
**Solución:**
```bash
npm install sharp
```

### "Las imágenes se ven pixeladas"
**Solución:** Sube la calidad
```bash
node tools/optimize-images.js --quality 90 multimedia
```

### "No genera versiones responsive"
**Razón:** La imagen original es pequeña (menor que los tamaños a generar).
**Solución:** Normal. No todas las imágenes necesitan versiones responsive.

---

## 💡 Tip Final

**Workflow simple que siempre funciona:**

1. `node tools/analyze-images.js allure` - Ver qué hay
2. `node tools/optimize-images.js --dry-run allure` - Prueba
3. `node tools/optimize-images.js allure` - Optimizar
4. Verificar visualmente
5. `find allure -name "*.backup" -delete` - Limpiar

**¡Eso es todo!** 🎉
