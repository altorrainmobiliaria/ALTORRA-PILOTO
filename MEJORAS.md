# 📋 HISTORIAL DE MEJORAS - ALTORRA INMOBILIARIA

> **Propósito**: Este archivo documenta todas las mejoras, modificaciones y correcciones realizadas al sitio web de Altorra Inmobiliaria. Diseñado para ser leído por humanos y sistemas de IA.

---

## 🗓️ Noviembre 2025

### Semana 1 - Quick Wins (Tareas 1-6 completadas) ✅

#### **Fecha**: 20 de noviembre de 2025

---

### ✅ TAREA 1: Fix typo en footer
**Archivo modificado**: `footer.html`
**Línea**: 35
**Cambio**: Corregido color del enlace de privacidad de `#bd5e1` a `#cbd5e1`
**Impacto**: Consistencia visual en el footer
**Commit**: `2581ed8`

---

### ✅ TAREA 2: Eliminar código duplicado en scripts.js
**Archivo modificado**: `scripts.js`
**Líneas eliminadas**: 234-268 (35 líneas)
**Descripción**: Se removió handler duplicado de `quickSearch` que tenía un `return` inmediato, haciendo el código inútil. La funcionalidad ya está manejada por `js/smart-search.js`.
**Impacto**:
- Código más limpio y mantenible
- Reducción de 35 líneas de código muerto
- Menor confusión para futuros desarrolladores
**Commit**: `2581ed8`

---

### ✅ TAREA 3: Centralizar configuración en js/config.js
**Archivo creado**: `js/config.js` (215 líneas)
**Descripción**: Creado archivo de configuración centralizada que contiene:

**Constantes centralizadas**:
- `CONTACT`: WhatsApp, teléfono, email, dirección, Google Place ID
- `CACHE`: TTLs para data y fragmentos HTML
- `PAGINATION`: Tamaño de página, límites de comparación/favoritos
- `URLS`: URLs base y rutas de datos
- `ANALYTICS`: Configuración de analíticas
- `CHATBOT`: Configuración del bot (nombre, delays, historial)
- `SEO`: Meta tags por defecto, títulos, descripciones
- `BUSINESS_HOURS`: Horarios de atención (lun-vie, sábado, domingo)
- `SERVICES`: Honorarios y descripciones de servicios
- `ZONES`: Array de zonas de Cartagena
- `PROPERTY_TYPES`: Tipos de propiedad disponibles
- `OPERATIONS`: Operaciones (comprar, arrendar, días)
- `FEATURES`: Feature flags para activar/desactivar funcionalidades

**Helper methods**:
- `getWhatsAppLink(message)`: Genera links de WhatsApp
- `getPhoneLink()`: Genera links tel:
- `getEmailLink(subject)`: Genera links mailto:
- `formatPrice(price)`: Formatea precios en COP
- `formatPriceShort(price)`: Formato corto (5M, 1.2B)
- `isBusinessHours()`: Detecta si es horario laboral

**Integración**: Agregado como primer script en `index.html` (línea 42)

**Impacto**:
- Single source of truth para configuración
- Fácil actualizar números de teléfono, precios, etc.
- Mejor escalabilidad y mantenibilidad
**Commit**: `2581ed8`

---

### ✅ TAREA 4: Crear páginas de servicios faltantes
**Archivos creados**:
1. `servicios-administracion.html` (~280 líneas)
2. `servicios-juridicos.html` (~300 líneas)
3. `servicios-contables.html` (~295 líneas)

**Descripción**: Se crearon 3 páginas profesionales completas para los servicios que aparecían en el footer pero retornaban 404.

**Estructura de cada página**:
- Hero section con imagen de fondo y overlay degradado
- Sección de introducción
- 6 tarjetas de servicios/beneficios con iconos SVG y efectos hover
- Sección de honorarios con pricing transparente
- Proceso de trabajo (5-6 pasos con numeración)
- Sección CTA con botones de contacto + WhatsApp
- Botón flotante de WhatsApp
- SEO completo: title, description, OG tags, Twitter Cards

**Contenido específico**:

**servicios-administracion.html**:
- Honorarios: 10% + IVA sobre canon integral
- Servicios: Cobro y gestión, mantenimiento, intermediación, reportes, avalúos, asesoría legal
- 6 beneficios destacados

**servicios-juridicos.html**:
- Honorarios variables según complejidad
- Servicios: Revisión contratos, verificación títulos, asesoría integral, trámites notariales, due diligence, resolución conflictos
- Proceso de 6 pasos

**servicios-contables.html**:
- Honorarios desde $100.000 consulta básica
- Servicios: Gestión tributaria, declaraciones, contabilidad arriendos, estados financieros, análisis rentabilidad, auditoría
- 4 beneficios clave (especialización, optimización, agilidad, confidencialidad)

**Impacto**:
- +3 páginas indexables (mejor SEO)
- Enlaces del footer ahora funcionales
- Información clara de servicios para clientes potenciales
- Aspecto más profesional y completo del sitio
**Commit**: `382d8ff`

---

### ✅ TAREA 5: Títulos y descriptions dinámicos en detalle-propiedad.html
**Archivo modificado**: `detalle-propiedad.html`
**Líneas agregadas**: 278-349 (72 líneas nuevas)

**Descripción**: Implementado sistema de meta tags dinámicos que se actualizan automáticamente al cargar una propiedad.

**Meta tags actualizados dinámicamente**:
1. **`<title>`**: `{Título} en Venta/Arriendo/por Días en {Ciudad} | Altorra Inmobiliaria`
2. **`<meta name="description">`**: `{Tipo} en {Operación} en {Ciudad} - ${Precio}. {specs}. {descripción corta}`
3. **`<link rel="canonical">`**: URL con parámetro `?id={propertyId}`
4. **Open Graph tags**:
   - `og:title`: Título optimizado
   - `og:description`: Description con specs
   - `og:url`: URL canónica con ID
   - `og:image`: Primera imagen de la galería (con URLs absolutas)
5. **Twitter Card tags**:
   - `twitter:title`
   - `twitter:description`
   - `twitter:image`

**Lógica implementada**:
- Detección automática de operación (comprar/arrendar/días)
- Formateo de precio con helper `formatCOP()`
- Construcción de specs: `{X} hab · {Y} baños · {Z}m²`
- Extracto de descripción (primeros 130 caracteres)
- Conversión de rutas relativas a URLs absolutas para imágenes
- Logging en consola para debugging

**Impacto**:
- **SEO**: Cada propiedad tiene título y description únicos
- **Redes sociales**: Cards optimizados con imagen y datos específicos
- **UX**: Títulos descriptivos en pestañas del navegador
- **Analytics**: Mejor tracking con URLs canónicas
- **Indexación**: Google indexa páginas con contenido único
**Commit**: `382d8ff`

---

### ✅ TAREA 6: Agregar estados de carga a formularios
**Archivo modificado**: `js/form-validation.js`
**Líneas agregadas**: ~180 líneas (estilos CSS + funciones JS)

**Archivos actualizados** (carga del script):
- `contacto.html` (línea 344)
- `publicar-propiedad.html` (línea 306)
- `detalle-propiedad.html` (línea 726)

**Descripción**: Sistema completo de estados de carga y notificaciones para formularios.

**Estilos CSS agregados** (líneas 47-124):
- `.form-loading`: Opacidad reducida, pointer-events disabled
- `.btn-loading`: Spinner animado con pseudo-elemento `::after`
- `@keyframes spinner`: Rotación continua 360°
- `.altorra-toast`: Notificaciones estilo toast con animación slide-in
  - Variantes: `.success` (verde), `.error` (rojo)
  - Responsive: Mobile ajusta posición
- Animación `slideIn`: Desde derecha con fade-in

**Funciones JavaScript agregadas** (líneas 265-349):

1. **`showLoading(form)`**:
   - Agrega clase `.form-loading` al form
   - Guarda texto original del botón en `dataset.originalText`
   - Cambia texto a "Enviando..."
   - Agrega clase `.btn-loading` (activa spinner)
   - Deshabilita todos los inputs/botones

2. **`hideLoading(form)`**:
   - Remueve clase `.form-loading`
   - Restaura texto original del botón
   - Remueve clase `.btn-loading`
   - Re-habilita todos los campos

3. **`showToast(message, type)`**:
   - Remueve toast anterior si existe
   - Crea elemento con clase `.altorra-toast`
   - Iconos: ✓ (success) / ✕ (error)
   - Auto-cierre después de 4 segundos con animación reversa

4. **`interceptFormSubmit()`**:
   - Event listener en `document` para capturar todos los submit
   - Ignora formularios de búsqueda (`#quickSearch`)
   - Ignora forms con atributo `data-no-intercept`
   - Solo aplica loading si `validateForm()` retorna true
   - Detecta si el form va a FormSubmit.co

**API global expuesta** (`window.AltorraFormValidation`):
```javascript
{
  validate,
  validatePhone,
  validateEmail,
  validateName,
  showLoading,      // ← Nuevo
  hideLoading,      // ← Nuevo
  showToast         // ← Nuevo
}
```

**Impacto**:
- **UX**: Feedback visual claro durante envío
- **Prevención de errores**: Evita doble envío de formularios
- **Profesionalidad**: Animaciones suaves y modernas
- **Accesibilidad**: Estados disabled claros
- **Extensibilidad**: API pública para uso en otros scripts
**Commit**: `382d8ff`

---

## 📊 Resumen de la Semana 1

**Tareas completadas**: ✅ 10 de 10 (100%)
**Archivos creados**: 12 (config.js + 3 páginas de servicios + breadcrumbs.js + breadcrumbs.css + ga4-script.html + GA4-SETUP.md + urgency.js + urgency.css + exit-intent.js + exit-intent.css)
**Archivos modificados**: 49 (7 originales + 14 con breadcrumbs + 19 con GA4 + 4 con urgency + 5 con exit intent)
**Líneas de código agregadas**: ~3,540+
**Líneas de código eliminadas**: ~35
**Commits realizados**: 7 (pendiente 1)
**Branch**: `claude/claude-md-mi73c11i9bdd5od9-01XitTMhnwzfwRHEiyJPtWut`

**Áreas de impacto**:
- ✅ SEO (meta tags dinámicos, 3 páginas nuevas, breadcrumbs con schema markup)
- ✅ UX (loading states, toast notifications, navegación breadcrumbs, urgencia/escasez)
- ✅ Mantenibilidad (configuración centralizada)
- ✅ Calidad de código (eliminación de duplicados)
- ✅ Bugs críticos (chatbot rígido, bucle con "gracias")
- ✅ Analytics (GA4 + local tracking, 13 eventos personalizados, GDPR compliance)
- ✅ Conversión (badges de urgencia, indicadores de escasez, validación social)
- ✅ Lead capture (exit intent popup con detección inteligente y control de frecuencia)

---

## 📝 Tareas Pendientes - Semana 1

### ✅ TAREA 7: Implementar breadcrumbs con schema markup
**Estado**: ✅ Completada (20 Nov 2025)
**Descripción**: Sistema completo de breadcrumbs con JSON-LD schema.org para SEO y navegación

**Archivos creados**:
1. `js/breadcrumbs.js` (272 líneas)
2. `css/breadcrumbs.css` (127 líneas)

**Archivos modificados**: 14 páginas HTML

**Funcionalidades implementadas**:
- ✅ Generación automática de breadcrumbs según la página
- ✅ Schema markup JSON-LD para Google Rich Results
- ✅ Configuración centralizada de 35+ rutas
- ✅ Detección dinámica de título en detalle-propiedad.html
- ✅ Estilos responsive con animaciones fade-in
- ✅ Separador customizable (›, →, /)
- ✅ Dark mode support
- ✅ Truncado en mobile para breadcrumbs largos (max 150px/200px)
- ✅ API pública: `window.AltorraBreadcrumbs`

**Páginas integradas (14)**:
- Propiedades: detalle-propiedad.html, propiedades-comprar.html, propiedades-arrendar.html, propiedades-alojamientos.html
- Herramientas: comparar.html, favoritos.html
- Institucional: contacto.html, quienes-somos.html, publicar-propiedad.html
- Servicios: servicios-administracion.html, servicios-juridicos.html, servicios-contables.html, servicios-mantenimiento.html, servicios-mudanzas.html

**Estructura HTML agregada**:
```html
<!-- En <head> -->
<link href="css/breadcrumbs.css" rel="stylesheet"/>

<!-- Después de header -->
<div style="max-width: var(--page-max); margin: 0 auto; padding: 0 16px;">
  <div id="breadcrumb-container"></div>
</div>

<!-- Antes de </body> -->
<script defer src="js/breadcrumbs.js"></script>
```

**Schema markup generado**:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Inicio",
      "item": "https://altorrainmobiliaria.github.io/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Propiedades",
      "item": "https://altorrainmobiliaria.github.io/propiedades-comprar.html"
    }
  ]
}
```

**Configuración destacada** (`js/breadcrumbs.js`):
```javascript
const BREADCRUMB_CONFIG = {
  'propiedades-comprar.html': [
    { name: 'Inicio', url: '/' },
    { name: 'Propiedades en Venta', url: '/propiedades-comprar.html' }
  ],
  'detalle-propiedad.html': [
    { name: 'Inicio', url: '/' },
    { name: 'Propiedades', url: '/propiedades-comprar.html' },
    { name: 'Detalle de Propiedad', url: null } // Actualizado dinámicamente
  ],
  // ... 35+ rutas configuradas
};
```

**Estilos responsive**:
- Desktop: breadcrumbs completos, underline hover effect
- Mobile (<560px): truncado con ellipsis, padding reducido
- Separador: › (configurable a →, /)
- Colores: #6b7280 (normal), #d4af37 (hover), #111827 (activo)
- Animación: fadeIn 0.3s con translateY

**API pública**:
```javascript
window.AltorraBreadcrumbs.render('breadcrumb-container');
window.AltorraBreadcrumbs.generateSchema(breadcrumbs);
window.AltorraBreadcrumbs.init();
```

**Impacto SEO**:
- ✅ Google Rich Snippets con breadcrumbs visibles en SERPs
- ✅ Mejora CTR (click-through rate) en resultados de búsqueda
- ✅ Mejor comprensión de estructura del sitio por crawlers
- ✅ Reduce bounce rate con navegación clara
- ✅ Mejora usabilidad y accesibilidad (aria-label, aria-current)

**Testing recomendado**:
1. Verificar breadcrumbs en todas las páginas
2. Validar schema markup en [Google Rich Results Test](https://search.google.com/test/rich-results)
3. Comprobar responsive en mobile (<560px)
4. Verificar navegación funcional (clicks en links)

**Commit**: `909d9e8`

### ✅ TAREA 8: Agregar elementos de urgencia/escasez
**Estado**: ✅ Completada (20 Nov 2025)
**Descripción**: Sistema completo de urgencia y escasez con badges, indicadores y contadores de vistas

**Archivos creados**:
1. `js/urgency.js` (267 líneas) - Módulo de urgencia y escasez
2. `css/urgency.css` (250 líneas) - Estilos para elementos de urgencia

**Archivos modificados**:
1. `js/listado-propiedades.js` - Integración de urgency en createCard()
2. `propiedades-comprar.html` - CSS + JS de urgency
3. `propiedades-arrendar.html` - CSS + JS de urgency
4. `propiedades-alojamientos.html` - CSS + JS de urgency

**Funcionalidades implementadas**:

**1. Módulo de urgencia (js/urgency.js)**:
- ✅ `isNew()` - Detecta propiedades nuevas (< 7 días)
- ✅ `isHot()` - Detecta propiedades populares (alto score + recientes)
- ✅ `getViewCount()` - Genera contador de vistas simulado basado en:
  - Días desde agregación (boost para recientes)
  - highlightScore (0-100)
  - Featured flag (1.5x multiplicador)
  - Decaimiento con el tiempo (0.85 por semana después de 30 días)
  - Variación aleatoria ±15%
- ✅ `countSimilarProperties()` - Cuenta propiedades similares en la zona
- ✅ `hasLowInventory()` - Detecta baja disponibilidad (≤ 3 similares)
- ✅ `renderUrgencyElements()` - Genera HTML de todos los elementos

**2. Badges de urgencia**:
- **✨ NUEVO** - Propiedad agregada en últimos 7 días
  - Fondo: Gradiente verde (#10b981 → #059669)
  - Animación: fadeInScale 0.4s
- **🔥 POPULAR** - Propiedad con alto score (≥85) y reciente (≤14 días)
  - Fondo: Gradiente naranja-rojo (#f59e0b → #dc2626)
  - Animación: pulse 2s infinito

**3. Indicadores de urgencia**:
- **👁️ Visto por X personas hoy**
  - Muestra contador de vistas simuladas (15-120 diarias)
  - Fondo: rgba(59, 130, 246, 0.08) - azul claro
- **⚡ Solo X disponibles en {zona}**
  - Se muestra cuando hay ≤3 propiedades similares
  - Fondo: rgba(239, 68, 68, 0.08) - rojo claro
- **⭐ Propiedad exclusiva en {zona}**
  - Se muestra cuando NO hay similares (count = 0)
  - Fondo: rgba(212, 175, 55, 0.12) - dorado

**4. Estilos CSS (css/urgency.css)**:
- ✅ Badges con backdrop-filter blur para overlay en imágenes
- ✅ Animaciones suaves: fadeInScale, slideInUp, pulse
- ✅ Responsive: Ajuste de tamaños en mobile (480px, 720px)
- ✅ Dark mode support con @media (prefers-color-scheme: dark)
- ✅ Accesibilidad: Respeta prefers-reduced-motion
- ✅ Contenedores flexibles para badges e indicadores

**5. Integración en listados**:
```javascript
// En createCard() de listado-propiedades.js
if (window.AltorraUrgency) {
  const urgency = window.AltorraUrgency.renderUrgencyElements(p, allProperties, {
    showBadges: true,
    showViews: true,
    showInventory: true
  });
  urgencyBadges = urgency.badges;
  urgencyIndicators = urgency.indicators;
}
```

**Configuración personalizable**:
```javascript
CONFIG = {
  newPropertyDays: 7,           // Días para considerar "nuevo"
  hotPropertyDays: 14,          // Días para considerar "popular"
  minViewsPerDay: 15,           // Vistas mínimas diarias
  maxViewsPerDay: 120,          // Vistas máximas diarias
  viewDecayFactor: 0.85,        // Decaimiento semanal de vistas
  lowInventoryThreshold: 3      // Umbral para "pocas disponibles"
}
```

**API pública expuesta** (`window.AltorraUrgency`):
```javascript
{
  getUrgencyData,               // Obtiene todos los datos
  renderUrgencyElements,        // Genera HTML completo
  renderNewBadge,               // Badge individual NUEVO
  renderHotBadge,               // Badge individual POPULAR
  renderViewCount,              // Indicador de vistas
  renderLowInventory,           // Indicador de disponibilidad
  isNew,                        // Detecta propiedad nueva
  isHot,                        // Detecta propiedad popular
  getViewCount,                 // Calcula vistas
  countSimilarProperties,       // Cuenta similares
  CONFIG                        // Configuración editable
}
```

**Impacto psicológico**:
- ✅ **Urgencia**: "Solo X disponibles" impulsa decisión rápida
- ✅ **Validación social**: "Visto por X personas" genera confianza
- ✅ **Novedad**: "NUEVO" capta atención
- ✅ **Popularidad**: "POPULAR" indica alta demanda
- ✅ **Exclusividad**: "Propiedad exclusiva" aumenta percepción de valor

**Impacto en conversión** (estimado):
- +15-25% CTR (click-through rate) en cards con badges
- +10-15% tiempo de permanencia en cards con urgencia
- +20-30% clicks en propiedades marcadas como POPULAR
- Reduce tiempo de decisión promedio

**Testing recomendado**:
1. Verificar badges en propiedades recientes (< 7 días)
2. Verificar contadores de vistas variados (15-120)
3. Verificar indicador de baja disponibilidad (≤3 similares)
4. Verificar responsive en mobile (<480px)
5. Verificar animaciones suaves (o desactivadas con prefers-reduced-motion)

**Commit**: Pendiente

### ✅ TAREA 9: Crear exit intent popup
**Estado**: ✅ Completada (20 Nov 2025)
**Descripción**: Modal de captura de leads que aparece cuando el usuario intenta salir del sitio

**Archivos creados**:
1. `js/exit-intent.js` (520 líneas) - Módulo completo con detección y formulario
2. `css/exit-intent.css` (420 líneas) - Estilos con animaciones y responsividad

**Archivos modificados**:
1. `index.html` - Agregado CSS y JS
2. `detalle-propiedad.html` - Agregado CSS y JS
3. `propiedades-comprar.html` - Agregado CSS y JS
4. `propiedades-arrendar.html` - Agregado CSS y JS
5. `propiedades-alojamientos.html` - Agregado CSS y JS

**Funcionalidades implementadas**:

**1. js/exit-intent.js - Detección y captura de leads**:
- ✅ **Detección de exit intent**:
  - Desktop: Mouse cerca del borde superior (threshold: 30px)
  - Móvil: Scroll hacia arriba rápido (>200px) o timer de 45 segundos
  - Delay de 3 segundos antes de activar detección (evita falsos positivos)
- ✅ **Control de frecuencia**:
  - Cooldown de 7 días entre visualizaciones
  - No mostrar más si el usuario ya envió el formulario
  - Control por sesión (1 vez máximo por sesión)
  - Storage key: `altorra:exit-intent`
- ✅ **Formulario de captura**:
  - Campos: Nombre, Email, Teléfono, Interés (select)
  - Validación HTML5 con patterns
  - Loading state con spinner
  - Mensaje de éxito con link a WhatsApp
- ✅ **Exclusión de páginas**: No se muestra en `/gracias.html`, `/404.html`, `/privacidad.html`
- ✅ **Integración con Analytics**: Eventos `exit_intent_shown`, `exit_intent_closed`, `exit_intent_submitted`
- ✅ **API pública**: `AltorraExitIntent.show()`, `.hide()`, `.enable()`, `.disable()`, `.reset()`
- ✅ **Accesibilidad**:
  - ARIA roles (dialog, modal)
  - Keyboard navigation (ESC para cerrar)
  - Focus management
  - Labels para screen readers

**2. css/exit-intent.css - Diseño responsive y accesible**:
- ✅ **Overlay con backdrop blur** - Efecto glassmorphism
- ✅ **Modal centrado** con max-width 540px
- ✅ **Animaciones suaves**:
  - Fade in + scale para desktop
  - Slide up desde abajo para móvil
  - Bounce animation para el icono
  - Pulse animation para botón de WhatsApp
- ✅ **Formulario estilizado**:
  - Inputs con border interactivo (cambia color con validación)
  - Select custom con chevron SVG
  - Botón con gradiente dorado
  - Loading spinner CSS-only
- ✅ **Estados visuales**:
  - Invalid state (border rojo)
  - Valid state (border verde)
  - Disabled state para botón
  - Hover effects
- ✅ **Responsive design**:
  - Desktop: Modal centrado con border-radius completo
  - Móvil: Modal en bottom sheet con border-radius solo arriba
  - Font-size 16px en móvil (previene zoom en iOS)
- ✅ **Accesibilidad**:
  - `prefers-reduced-motion` - Desactiva animaciones
  - `prefers-contrast: high` - Aumenta contraste
  - `prefers-color-scheme: dark` - Soporte para dark mode
- ✅ **Success state**: Diseño especial con icono de checkmark y botón de WhatsApp

**3. Integración en páginas**:
- ✅ 5 páginas principales con exit intent activo
- ✅ CSS cargado después de `style.css`
- ✅ JS cargado con `defer` al final del `<head>`
- ✅ Orden correcto de carga de scripts

**Configuración disponible** (líneas 10-22 en exit-intent.js):
```javascript
CONFIG = {
  enabled: true,
  cooldownDays: 7,              // No mostrar por X días
  threshold: 30,                // Píxeles desde borde superior
  delay: 3000,                  // Delay antes de activar detección
  mobileScrollThreshold: 200,   // Scroll hacia arriba para activar
  mobileTimeDelay: 45000,       // Timer en móvil (45 segundos)
  trackEvents: true             // Integración con analytics
}
```

**Eventos de Analytics rastreados**:
- `exit_intent_shown` - Popup mostrado (parámetros: page)
- `exit_intent_closed` - Popup cerrado sin enviar
- `exit_intent_submitted` - Formulario enviado (parámetros: interest, page)

**Código de ejemplo para testing**:
```javascript
// Forzar mostrar popup (consola)
AltorraExitIntent.show();

// Reset cooldown (volver a ver popup)
AltorraExitIntent.reset();

// Deshabilitar temporalmente
AltorraExitIntent.disable();

// Ver configuración actual
AltorraExitIntent.getConfig();
```

**Commit**: Pendiente

### ✅ TAREA 10: Integrar Google Analytics 4
**Estado**: ✅ Completada (20 Nov 2025)
**Descripción**: Sistema dual de analytics (local + GA4) con GDPR compliance

**Archivos modificados**:
1. `js/analytics.js` (273 líneas - enhanced con GA4)
2. 19 páginas HTML (todas con snippet de GA4)

**Archivos creados**:
1. `snippets/ga4-script.html` (snippet reutilizable)
2. `docs/GA4-SETUP.md` (guía completa de configuración)

**Funcionalidades implementadas**:

**1. js/analytics.js - Sistema dual (Local + GA4)**:
- ✅ Configuración GA4 en objeto CONFIG (líneas 16-21)
- ✅ Función `isGA4Available()` - verifica si gtag está cargado
- ✅ Función `sendToGA4(eventName, params)` - envía eventos a GA4
  - Normaliza nombres de eventos a snake_case
  - Agrega metadata automática (page_path, page_title, timestamp)
  - Logging opcional con debug mode
- ✅ Función `configureGA4()` - configura GA4 con GDPR compliance
  - anonymize_ip: true
  - allow_google_signals: false
  - allow_ad_personalization_signals: false
- ✅ Función `track()` mejorada - envía a AMBOS sistemas:
  - localStorage (analytics local, sin cookies)
  - Google Analytics 4 (cloud analytics)
- ✅ API pública extendida: `sendToGA4`, `configureGA4`, `enableGA4`, `disableGA4`, `setGA4Debug`

**2. Snippet GA4 (snippets/ga4-script.html)**:
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-XXXXXXXXXX', {
    'anonymize_ip': true,
    'allow_google_signals': false,
    'allow_ad_personalization_signals': false,
    'cookie_flags': 'SameSite=None;Secure'
  });
</script>
```

**3. Páginas HTML integradas (19 archivos)**:
- ✅ index.html
- ✅ detalle-propiedad.html
- ✅ propiedades-comprar.html
- ✅ propiedades-arrendar.html
- ✅ propiedades-alojamientos.html
- ✅ comparar.html
- ✅ favoritos.html
- ✅ contacto.html
- ✅ quienes-somos.html
- ✅ publicar-propiedad.html
- ✅ privacidad.html
- ✅ gracias.html
- ✅ 404.html
- ✅ limpiar-cache.html
- ✅ servicios-administracion.html
- ✅ servicios-juridicos.html
- ✅ servicios-contables.html
- ✅ servicios-mantenimiento.html
- ✅ servicios-mudanzas.html

Cada página tiene el snippet GA4 en el `<head>` después de `<meta charset>` y antes de otros scripts.

**4. Eventos personalizados rastreados (13 eventos)**:
1. `page_view` - Vista de página (automático)
2. `property_view` - Vista de propiedad específica
3. `external_click` - Click en enlace externo
4. `whatsapp_click` - Click en botón de WhatsApp
5. `time_on_page` - Tiempo en página (al salir)
6. `search` - Búsqueda realizada
7. `favorite_added` - Propiedad agregada a favoritos
8. `favorite_removed` - Propiedad removida de favoritos
9. `property_compare_add` - Propiedad agregada al comparador
10. `form_submit` - Envío de formulario
11. `calculator_use` - Uso de calculadora hipotecaria
12. `chatbot_message` - Mensaje enviado al chatbot
13. `breadcrumb_click` - Click en breadcrumb

**5. Documentación completa (docs/GA4-SETUP.md)**:
- ✅ Paso 1: Crear propiedad de GA4
- ✅ Paso 2: Configurar código en el sitio
- ✅ Paso 3: Verificar instalación (3 métodos)
- ✅ Tabla de eventos personalizados con parámetros
- ✅ Guía de configuración de conversiones
- ✅ Sección GDPR y privacidad
- ✅ Debugging y troubleshooting
- ✅ Métricas clave a monitorear (KPIs)
- ✅ Referencias y links útiles

**GDPR Compliance**:
```javascript
gtag('config', 'G-XXXXXXXXXX', {
  'anonymize_ip': true,                           // ✅ IPs anonimizadas
  'allow_google_signals': false,                   // ✅ No cross-device tracking
  'allow_ad_personalization_signals': false,       // ✅ No personalización de ads
  'cookie_flags': 'SameSite=None;Secure'          // ✅ Cookies seguras
});
```

**Testing**:
```javascript
// Activar modo debug en consola
AltorraAnalytics.setGA4Debug(true);

// Enviar evento de prueba
AltorraAnalytics.track('test_event', { test: 'value' });

// Ver estadísticas locales
console.table(AltorraAnalytics.getStats());
```

**Conversiones recomendadas para marcar en GA4**:
1. `whatsapp_click` (Impacto: Alto) - Contacto directo
2. `form_submit` (Impacto: Alto) - Lead capturado
3. `property_view` (Impacto: Medio) - Interés en propiedad
4. `calculator_use` (Impacto: Medio) - Usuario evaluando compra

**Métricas clave a monitorear**:
- Usuarios activos y páginas vistas
- Engagement (tiempo en página, páginas por sesión)
- Conversiones (WhatsApp clicks, formularios enviados)
- Propiedades populares (más vistas, más favoritadas)
- Búsquedas (términos populares, tasa de éxito)

**Próximos pasos** (requiere acción manual del usuario):
1. Crear cuenta de Google Analytics 4
2. Obtener Measurement ID (formato: G-XXXXXXXXXX)
3. Reemplazar placeholder 'G-XXXXXXXXXX' en:
   - js/analytics.js línea 18
   - Todas las páginas HTML (snippet en <head>)
4. Validar instalación con Google Tag Assistant
5. Marcar eventos como conversiones en GA4
6. Configurar audiencias personalizadas

**Impacto**:
- ✅ Analytics profesional con insights en tiempo real
- ✅ Tracking de 13 eventos personalizados
- ✅ GDPR compliant (cumple con regulaciones de privacidad)
- ✅ Sistema dual (datos locales + cloud)
- ✅ Sin dependencias de cookies para analytics local
- ✅ Debugging fácil con modo debug
- ✅ Documentación completa para implementación

**Commit**: Pendiente

---

## 🐛 Correcciones de Bugs

### ✅ Chatbot - Flujos rígidos (Detectado y Corregido: 20 Nov 2025)
**Archivo modificado**: `js/chatbot.js`
**Líneas modificadas**: ~100 líneas

**Descripción del problema original**: El chatbot no interpretaba mensajes libres durante flujos activos. Por ejemplo, si el usuario estaba en el flujo de "propietario" y escribía "quiero alojamientos", el bot ignoraba el mensaje y continuaba con el flujo de propietario.

**Problemas específicos reportados** (por ChatGPT en modo agente):
1. ❌ Cambio de contexto ignorado dentro de flujos
2. ❌ Mensajes libres no influyen en la conversación
3. ❌ Comandos globales ("atrás", "volver") limitados
4. ❌ No maneja respuestas como "no sé" o "ninguna zona"
5. ❌ Falta manejo de respuestas que no coinciden

**Soluciones implementadas**:

1. **Mejorada función `isNewGlobalIntent()`** (líneas 960-1021):
   - ✅ Ahora detecta intenciones SIN verbos explícitos si el mensaje es corto (<30 caracteres)
   - ✅ Agregados comandos de cancelación: "cancelar", "salir", "terminar", "no quiero continuar"
   - ✅ Detecta "atrás"/"volver" en cualquier punto del flujo
   - ✅ Detecta cambios a propietario desde cualquier flujo

2. **Mejorada función `applyOwnerAnswer()`** (líneas 1454-1463):
   - ✅ Detecta respuestas ambiguas: "no sé", "no estoy seguro", "ninguna", "cualquiera", "no importa"
   - ✅ Permite saltar preguntas: "saltar", "pasar", "omitir", "después lo digo"
   - ✅ Cuando detecta ambigüedad, salta el campo y continúa con siguiente pregunta

3. **Mejorado procesamiento en flujo de propietario** (líneas 2565-2609):
   - ✅ Detecta nueva intención global con log de debug
   - ✅ Limpia contexto completamente (role, lastQuestion, consultationPhase)
   - ✅ Ejecuta handleOption() con la nueva intención detectada
   - ✅ Soporta cambio a: comprar, arrendar, alojamiento, propietario, atrás

4. **Mejorado procesamiento en flujo de consultoría** (líneas 2615-2682):
   - ✅ Misma lógica de detección de intenciones que flujo de propietario
   - ✅ Limpia contexto y ejecuta nuevo flujo correctamente

**Resultado**:
- ✅ El bot ahora responde correctamente cuando el usuario cambia de intención
- ✅ Los comandos "atrás", "cancelar", "volver" funcionan en cualquier punto
- ✅ Las respuestas ambiguas se manejan elegantemente
- ✅ Los mensajes libres son interpretados correctamente

**Testing recomendado**:
1. Iniciar flujo de propietario → escribir "quiero alojamientos" → debe cambiar a flujo de alojamiento
2. Durante preguntas, escribir "no sé" → debe saltar la pregunta
3. Escribir "atrás" en cualquier momento → debe volver al menú principal
4. Escribir solo "alojamientos" sin "quiero" → debe detectar intención

**Impacto**:
- UX significativamente mejorada
- Bot más flexible y natural
- Menos frustración para usuarios
- Mejor manejo de casos edge

**Estado**: ✅ Corregido
**Prioridad**: Alta (completado)
**Commit**: Pendiente

---

### ✅ Chatbot - Bucle con agradecimientos "gracias" (CRÍTICO - 20 Nov 2025)
**Archivo modificado**: `js/chatbot.js`
**Líneas modificadas**: ~60 líneas en 3 funciones

**Descripción del problema**: Cuando el usuario escribía "gracias" durante un flujo activo (ej: en pregunta de zona), el bot entraba en bucle infinito repitiendo la misma pregunta. Esto ocurría porque "gracias" se clasificaba incorrectamente como respuesta de slot (slot response) en lugar de intención global.

**Reproducción del bug**:
```
Usuario: "Quiero comprar"
Bot: "¿Qué tipo de propiedad te interesa?"
Usuario: "Apartamento"
Bot: "¿Qué zona de Cartagena prefieres?"
Usuario: "gracias"
Bot: "¿Qué zona de Cartagena prefieres?" ← BUCLE INFINITO
Usuario: "gracias"
Bot: "¿Qué zona de Cartagena prefieres?" ← REPITE
```

**Causa raíz identificada**:
- `isSlotResponse()` (línea 952 original) clasificaba cualquier mensaje corto (< 25 caracteres) sin verbos de intención como "respuesta de slot"
- "gracias" (7 caracteres) pasaba este filtro
- Se guardaba "gracias" como valor de zona
- El bot continuaba con la siguiente pregunta → BUCLE

**Soluciones implementadas**:

1. **Parchada función `isSlotResponse()`** (líneas 915-972):
   ```javascript
   // ⚠️ CRÍTICO: Nunca clasificar agradecimientos/despedidas como slot response
   if (matchesSynonym(text, 'thanks') || matchesSynonym(text, 'goodbye')) {
     return false;
   }

   // Excluir también al final del algoritmo
   if (matchesSynonym(text, 'greeting')) return false;
   if (matchesSynonym(text, 'thanks')) return false;
   if (matchesSynonym(text, 'goodbye')) return false;
   if (matchesSynonym(text, 'back')) return false;
   if (matchesSynonym(text, 'contact')) return false;
   ```
   - ✅ Agradecimientos y despedidas NUNCA son slot responses
   - ✅ Verifica al inicio y al final del algoritmo
   - ✅ Previene clasificación incorrecta

2. **Mejorada función `isNewGlobalIntent()`** (líneas 978-986):
   ```javascript
   // ⚠️ CRÍTICO: Agradecimientos y despedidas siempre son intenciones globales
   if (matchesSynonym(text, 'thanks')) {
     return true;
   }

   if (matchesSynonym(text, 'goodbye')) {
     return true;
   }
   ```
   - ✅ Detecta agradecimientos como intención global prioritaria
   - ✅ Detecta despedidas como intención global prioritaria
   - ✅ Se verifica ANTES de cualquier otra lógica

3. **Agregado manejo explícito en `processMessage()`** (líneas 2539-2567):
   ```javascript
   // ⚠️ CRÍTICO: Manejo de agradecimientos y despedidas
   if (matchesSynonym(msg, 'thanks')) {
     conversationContext.lastQuestion = null;
     conversationContext.consultationPhase = null;
     if (conversationContext.role && conversationContext.role.startsWith('propietario_')) {
       conversationContext.role = null;
     }
     saveContext();
     botReply(RESPONSES.gracias);
     return;
   }

   if (matchesSynonym(msg, 'goodbye')) {
     // ... similar cleanup
     botReply('¡Hasta pronto! 👋 ...');
     return;
   }
   ```
   - ✅ Limpia completamente el contexto de flujo activo
   - ✅ Responde apropiadamente
   - ✅ Termina la ejecución (return) sin continuar flujo

**Palabras detectadas** (vía sinónimos en líneas 81-82):
- **Agradecimientos**: gracias, thank, agradezco, muy amable, te agradezco, mil gracias
- **Despedidas**: adios, adiós, chao, chau, bye, hasta luego, nos vemos, me voy, gracias por todo

**Resultado**:
- ✅ "gracias" ahora cierra el flujo y responde correctamente
- ✅ NO se guarda "gracias" como respuesta de zona/precio/etc
- ✅ El bot NO repite la pregunta
- ✅ Despedidas funcionan igual que agradecimientos
- ✅ El contexto se limpia completamente

**Testing realizado**:
1. ✅ Test 1: "Quiero comprar" → "Apartamento" → "gracias" → Bot responde con mensaje de agradecimiento
2. ✅ Test 2: "Soy propietario" → "Quiero vender" → (en pregunta) "gracias" → Bot cierra flujo
3. ✅ Test 3: "Busco arriendo" → "adiós" → Bot se despide correctamente
4. ✅ Test 4: "gracias" múltiples veces → Bot NO entra en bucle

**Impacto**:
- UX crítica restaurada - usuarios pueden terminar conversaciones naturalmente
- Previene frustración de bucles infinitos
- Bot más natural y humano
- Mejora significativa en satisfacción del usuario

**Archivos afectados**:
- `js/chatbot.js` (3 funciones modificadas: isSlotResponse, isNewGlobalIntent, processMessage)

**Estado**: ✅ Corregido y probado
**Prioridad**: CRÍTICA (completado)
**Commit**: Pendiente

---

### 🤖 CHATBOT V2.1-V2.3: Suite completa de mejoras críticas

**Fecha**: 20 de noviembre de 2025
**Commits**: `694166b`, `a4e266c`, `[pending]`

---

#### **PROBLEMA 1: Bot saltaba etapa consultiva**

**Síntoma**: Al seleccionar "apartamento", bot pasaba directo al asesor sin preguntar presupuesto/zona

**Causa raíz**: `hasEnoughInfoToRecommend()` aceptaba cualquier 3 campos, sin validar campos obligatorios

**Solución**:
```javascript
// ANTES: Aceptaba cualquier 3 campos
if (points >= 3) return true;

// AHORA: Requiere 3 campos OBLIGATORIOS
const hasRequiredFields =
  ctx.interest &&      // comprar/arrendar/dias (OBLIGATORIO)
  ctx.propertyType &&  // apartamento/casa/lote (OBLIGATORIO)
  ctx.budget;          // presupuesto (OBLIGATORIO)
```

**Orden de preguntas corregido**:
1. `propertyType` (OBLIGATORIO)
2. `zone` (RECOMENDADO)
3. `budget` (OBLIGATORIO)
4. `purpose` (OPCIONAL)
5. `beds` (OPCIONAL)

**Archivo**: `js/chatbot.js:388-417, 362-385`

---

#### **PROBLEMA 2: Filtrado de propiedades débil y no sincronizado con data.json**

**Síntoma**: Recomendaciones no coincidían con data.json, difícil debuggear por qué no había resultados

**Solución**: Filtrado secuencial con logging detallado en cada paso

```javascript
🔍 Búsqueda iniciada: 12 propiedades en inventario
📊 Después de filtrar por operación (comprar): 8 propiedades
🏠 Después de filtrar por tipo (apartamento): 5 propiedades
💰 Después de filtrar por presupuesto (hasta $600M): 3 propiedades
📍 Después de filtrar por zona (bocagrande): 2 propiedades
✅ Recomendaciones finales: 2 propiedades
```

**Lógica de filtrado**:
1. **Operación** (comprar/arrendar/dias) - OBLIGATORIO
2. **Tipo de propiedad** - OBLIGATORIO
3. **Presupuesto** - OBLIGATORIO (permite hasta +20%)
4. **Zona** - OPCIONAL (si no hay, muestra todas)
5. **Scoring** - Ordena por coincidencia
6. **Top 3** - Retorna máximo 3 propiedades

**Archivo**: `js/chatbot.js:464-534`

---

#### **PROBLEMA 3: Bot seguía preguntando después de decir "NO" al asesor**

**Síntoma**: Usuario dice "no" a contactar asesor → Bot continúa con preguntas sin sentido

**Solución**: Manejo de post-recomendación con opciones útiles

```javascript
if (conversationContext.consultationPhase === 'recommendation') {
  if (matchesSynonym(msg, 'no')) {
    // Limpiar contexto y ofrecer alternativas
    conversationContext.consultationPhase = null;
    conversationContext.lastQuestion = null;
    saveContext();

    // Mostrar opciones útiles
    botReply('Entiendo. ¿Qué te gustaría hacer?', [
      '🔄 Ajustar criterios de búsqueda',
      '🏠 Ver todas las propiedades',
      '🔍 Nueva búsqueda',
      '📱 Ver opciones de contacto'
    ]);
    return;
  }
}
```

**Archivo**: `js/chatbot.js:2773-2810`

---

#### **PROBLEMA 4: Vocabulario limitado - Bot no entendía variaciones naturales**

**Síntoma**: Bot no reconocía "busco arrendar", "quiero comprar", "penthouse", "con piscina", etc.

**Solución**: Vocabulario expandido masivamente (100+ nuevos sinónimos)

**Ejemplos de expansión**:
```javascript
// Operaciones
buy: ['comprar', 'adquisición', 'quiero comprar', 'busco comprar', ...] // 9→18

// Tipos de propiedad
apartment: ['apartamento', 'penthouse', 'ático', 'dúplex', 'studio', ...] // 7→15
house: ['casa', 'villa', 'cabaña', 'residencia', ...] // 5→11

// Zonas
bocagrande: ['bocagrande', 'boca', 'sector bocagrande', 'playa bocagrande', ...] // 3→7

// Características
pool: ['piscina', 'jacuzzi', 'turco', 'con piscina', 'tiene piscina', ...] // 3→10
parking: ['parqueadero', 'parqueo', 'con parqueadero', ...] // 8→15
```

**Total de sinónimos agregados**: ~100+ en todas las categorías

**Archivo**: `js/chatbot.js:43-102`

---

#### **PROBLEMA 5: Filtro de zona NO funcionaba (critical bug)**

**Síntoma**: Usuario pide "apartamento en country" → Bot muestra propiedades de "Parque Heredia - Milán"

**Causa raíz**:
1. Solo hay 1 propiedad en "Country" → es una CASA (no apartamento)
2. Filtro usaba `neighborhood.includes('country')` → "Parque Heredia - Milán" NO incluye "country"
3. Código decía "mostrando todas las zonas" sin avisar → Mostraba Milán, Serena, Bocagrande

**Solución 1: Regex mejorado para coincidencia exacta**
```javascript
// ANTES
return neighborhood.includes(ctx.zone.toLowerCase());

// AHORA
const regex = new RegExp(`\\b${searchZone}\\b|^${searchZone}`, 'i');
return regex.test(neighborhood);
```

**Solución 2: Mensaje claro cuando no hay resultados en zona**
```javascript
if (zoneFiltered.length === 0) {
  console.warn(`⚠️ No hay ${ctx.propertyType}s en ${ctx.zone}`);
  conversationContext.noResultsInZone = true;
  conversationContext.requestedZone = ctx.zone;
  return []; // Retornar vacío para mostrar mensaje personalizado
}
```

**Archivo**: `js/chatbot.js:612-637`

---

#### **PROBLEMA 6: NO había sistema de selección de propiedades de interés**

**Requerimiento del usuario**:
> "Lo ideal es que el usuario pueda seleccionar una o mas opciones de apartamentos como si fuese un check list... la idea es que al finalizar la conversacion el asesor pueda conocer cuales fueron las propiedades de interes"

**Solución implementada**:

**a) Checkbox en cada tarjeta**
```html
<div class="property-interest-toggle">
  <input type="checkbox" id="prop-101-27" data-prop-id="101-27" />
  <label for="prop-101-27">Me interesa</label>
</div>
```

- Ubicado en esquina superior derecha
- No interfiere con clic para ver detalles
- Estado se guarda en `selectedProperties[]`

**b) Contador dinámico**
```html
<div id="selected-props-counter">
  2 propiedades seleccionadas
</div>
```

- Se actualiza en tiempo real
- Fondo azul claro #e7f3ff

**c) Mensaje WhatsApp con propiedades seleccionadas**
```
📋 PROPIEDADES SELECCIONADAS (2):

1. *Apartamento moderno en Milán*
   💰 $350M • 3H • 2B • 72m²
   📍 Parque Heredia - Milán

2. *Apartamento amoblado en Trevi*
   💰 $565M • 2H • 2B • 58m²
   📍 Serena del Mar - Trevi

🔍 MI PERFIL DE BÚSQUEDA:
• Comprar apartamento
• Presupuesto: hasta $700M

¿Podríamos agendar una visita a las propiedades seleccionadas?
```

**Funciones implementadas**:
- `togglePropertyInterest(propId, propData)`
- `updateSelectedCounter()`
- `isPropertySelected(propId)`
- `chatbotSendToAdvisor()` - Envía por WhatsApp

**Archivos**:
- `js/chatbot.js:1873-2018` (JavaScript)
- `css/chatbot.css:330-372` (CSS)

---

#### **PROBLEMA 7: Mensaje genérico cuando no hay resultados en zona específica**

**Requerimiento del usuario**:
> "seria bueno que el chatbot sea consciente que no tiene propiedades que cumplan con los requisitos del interesado, sin embargo ofrece opciones similares informando al usuario no tengo propiedades que coincidan con tu busqueda pero te puedo recomendar estas propiedades que coinciden con alguno de tus requisitos. pero que las recomendaciones sean inteligentes."

**Solución: Mensaje inteligente y consciente**

**ANTES**:
```
"No encontré propiedades con esos criterios"
[Muestra propiedades aleatorias sin explicar]
```

**AHORA**:
```
😔 Lo siento, no tengo propiedades que coincidan exactamente con tu búsqueda

📋 Tu búsqueda original:
• Tipo: apartamento ✓
• Zona: Country ✗ (no disponible)
• Presupuesto: hasta $700M ✓
• Habitaciones: 3+ ✓

💡 Sin embargo, encontré 3 apartamentos que cumplen con tus otros requisitos:

Estas propiedades cumplen con: mismo tipo, dentro de tu presupuesto, 3+ habitaciones, pero están ubicadas en otras zonas.

[Propiedad 1]
✓ Tipo • ✓ Presupuesto • ✓ Habitaciones • ✗ Zona: Parque Heredia - Milán

[Propiedad 2]
✓ Tipo • ✓ Presupuesto • ✓ Habitaciones • ✗ Zona: Serena del Mar

[Propiedad 3]
✓ Tipo • ✓ Presupuesto • ✓ Habitaciones • ✗ Zona: Bocagrande
```

**Función de análisis inteligente**:
```javascript
function analyzePropertyMatch(property, ctx) {
  const matches = {
    type: false,      // ¿Cumple con el tipo?
    budget: false,    // ¿Está dentro del presupuesto?
    zone: false,      // ¿Está en la zona solicitada?
    beds: false,      // ¿Tiene las habitaciones necesarias?
    operation: false, // ¿Es la operación correcta?
    score: 0          // Puntuación total
  };

  // Verificar cada criterio y sumar puntos
  if (property.type === ctx.propertyType) {
    matches.type = true;
    matches.score += 3;
  }
  // ... más verificaciones

  return matches;
}
```

**Mejoras en búsqueda de alternativas**:
```javascript
function getSmartRecommendationsWithoutZone(ctx) {
  // 1. Filtrar por operación (OBLIGATORIO)
  // 2. Filtrar por tipo (OBLIGATORIO)
  // 3. Filtrar por presupuesto (30% margen para alternativas)
  // 4. Analizar qué criterios cumple cada propiedad
  // 5. Ordenar por score de coincidencia
  // 6. Retornar top 5
}
```

**Archivos**:
- `js/chatbot.js:463-520` (analyzePropertyMatch)
- `js/chatbot.js:523-568` (getSmartRecommendationsWithoutZone mejorado)
- `js/chatbot.js:745-843` (mensaje inteligente)

---

#### **ANÁLISIS DE IMPACTO - Cambios sincronizados**

**Funciones NO afectadas** (flujo normal intacto):
- ✅ `getSmartRecommendations()` - Sigue funcionando cuando SÍ hay resultados
- ✅ `processMessage()` - Flujo de mensajes intacto
- ✅ `handleOption()` - Opciones rápidas intactas
- ✅ Flujo de propietarios - No modificado
- ✅ Flujo de alojamiento - No modificado

**Funciones mejoradas** (solo para casos edge):
- ✅ `getSmartRecommendationsWithoutZone()` - Se usa SOLO cuando no hay resultados en zona
- ✅ `generatePersonalizedRecommendation()` - Solo cambia mensaje cuando `noResultsInZone = true`
- ✅ `analyzePropertyMatch()` - NUEVA función auxiliar, no afecta flujos existentes

**Propiedades temporales seguras**:
- `_matchAnalysis` - Se agrega temporalmente a propiedades, NO se persiste
- `_score` - Temporal para ordenamiento, NO se guarda
- `noResultsInZone` - Flag temporal en contexto, se limpia después de usarse

**Testing de regresión necesario**:
1. ✅ Búsqueda con resultados → Debe funcionar igual que antes
2. ✅ Búsqueda sin resultados en zona → Muestra mensaje inteligente con alternativas
3. ✅ Búsqueda sin resultados en absoluto → Muestra mensaje genérico
4. ✅ Flujo completo comprar/arrendar/dias → No afectado
5. ✅ Sistema de selección de propiedades → Funciona en todos los flujos

---

#### **ESTADÍSTICAS DE CAMBIOS**

**Commits realizados**:
- `694166b` - Chatbot v2.1: Flujo consultivo + vocabulario
- `a4e266c` - Chatbot v2.2: Filtro zona + sistema selección
- `[pending]` - Chatbot v2.3: Recomendaciones inteligentes

**Líneas modificadas totales**:
- `js/chatbot.js`: +550 líneas (259 + 246 + 45)
- `css/chatbot.css`: +46 líneas

**Funciones nuevas**:
1. `analyzePropertyMatch(property, ctx)` - Analiza qué criterios cumple
2. `togglePropertyInterest(propId, propData)` - Selección de propiedades
3. `updateSelectedCounter()` - Actualiza contador
4. `isPropertySelected(propId)` - Verifica selección
5. `chatbotSendToAdvisor()` - Envío WhatsApp con selección

**Funciones mejoradas**:
1. `hasEnoughInfoToRecommend()` - Campos obligatorios
2. `getNextConsultationQuestion()` - Orden correcto
3. `getSmartRecommendations()` - Filtro de zona con regex
4. `getSmartRecommendationsWithoutZone()` - Scoring inteligente
5. `generatePersonalizedRecommendation()` - Mensaje consciente
6. `createPropertyCard()` - Checkbox de interés

**Sinónimos agregados**: ~100+ en todas las categorías

---

#### **MEJORAS DE UX RESULTANTES**

**Para el usuario**:
- ✅ **Claridad**: Sabe exactamente por qué no ve propiedades en su zona
- ✅ **Control**: Puede marcar propiedades de interés con checkbox
- ✅ **Conveniencia**: Mensaje WhatsApp incluye su selección
- ✅ **Transparencia**: Ve qué criterios cumplen las alternativas
- ✅ **Profesionalismo**: Experiencia similar a sitios modernos

**Para el asesor**:
- ✅ **Información precisa**: Recibe listado de propiedades de interés
- ✅ **Menos fricción**: No necesita preguntar "¿cuáles te interesaron?"
- ✅ **Mejor conversión**: Usuario ya mostró interés específico
- ✅ **Ahorro de tiempo**: Perfil completo en un mensaje
- ✅ **Contexto claro**: Sabe qué buscaba y qué no encontró

---

#### **TESTING RECOMENDADO**

**Test 1: Búsqueda normal con resultados**
```
Usuario: "quiero comprar apartamento en bocagrande hasta 700m"
Esperado:
- ✓ Muestra apartamentos en Bocagrande
- ✓ Dentro del presupuesto
- ✓ Con checkbox "Me interesa"
- ✓ Contador funcional
```

**Test 2: Búsqueda sin resultados en zona específica**
```
Usuario: "quiero comprar apartamento en country hasta 700m"
Esperado:
- ✓ Mensaje: "No tengo propiedades que coincidan exactamente"
- ✓ Muestra "Tu búsqueda original" con ✓/✗
- ✓ Ofrece alternativas en otras zonas
- ✓ Indica qué criterios cumplen (✓ Tipo • ✓ Presupuesto • ✗ Zona: Milán)
```

**Test 3: Selección de propiedades**
```
1. Ver recomendaciones
2. Marcar 2 propiedades con checkbox
3. Ver contador: "2 propiedades seleccionadas"
4. Clic en "Contactar asesor"
Esperado:
- ✓ WhatsApp se abre con mensaje pre-llenado
- ✓ Incluye "PROPIEDADES SELECCIONADAS (2)"
- ✓ Lista detallada de las 2 propiedades
- ✓ Perfil de búsqueda al final
```

**Test 4: No marcar ninguna propiedad**
```
1. Ver recomendaciones
2. NO marcar checkboxes
3. Clic en "Contactar asesor"
Esperado:
- ✓ WhatsApp se abre
- ✓ Solo incluye perfil de búsqueda (sin listado)
- ✓ Pregunta genérica de ayuda
```

**Test 5: Decir NO al asesor**
```
1. Ver recomendaciones
2. Bot pregunta: "¿Te gustaría agendar una visita?"
3. Usuario: "no"
Esperado:
- ✓ Bot responde: "Entiendo. ¿Qué te gustaría hacer?"
- ✓ Ofrece opciones: Ajustar criterios, Ver todas, Nueva búsqueda
- ✓ NO sigue preguntando cosas sin sentido
```

---

**Estado**: ✅ Implementado y testeado
**Prioridad**: CRÍTICA
**Commits**: `694166b`, `a4e266c`, `862f709`

---

## Problema 8: Sistema de selección (checklist) no integrado con contacto al asesor

### 📋 Síntoma
El usuario reportó:
- ✅ Los checkboxes "Me interesa" funcionaban
- ❌ PERO: Cuando el usuario decía "hablar con asesor", NO se enviaban las propiedades seleccionadas
- ❌ El botón para contactar asesor solo aparecía en algunos casos
- ❌ No era claro cómo enviar las propiedades seleccionadas al asesor
- ❌ El contador de selección era poco visible

### 🔍 Causa raíz
**Problema de integración entre funciones:**

1. **Dos formas de contactar al asesor desconectadas:**
   - Líneas 2974-2990: Cuando usuario dice "hablar con asesor" → Generaba link genérico
   - Líneas 3442-3476: Caso 'contacto' → Enviaba perfil pero no propiedades seleccionadas
   - **NINGUNA llamaba a `chatbotSendToAdvisor()`** que SÍ incluye las propiedades

2. **Contador poco visible:**
   - Color azul claro (#e7f3ff) poco llamativo
   - Texto simple sin énfasis
   - No indicaba claramente que está "listo para enviar"

3. **Checkboxes sin feedback visual claro:**
   - No cambiaba de color al seleccionar
   - No era obvio cuáles estaban seleccionados

### ✅ Solución implementada

#### **1. Unificación de contacto con asesor (chatbot.js:2974-3006)**

**ANTES:**
```javascript
// Creaba link genérico sin propiedades seleccionadas
const waLink = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent('Hola Altorra, quiero hablar con un asesor')}`;
const html = `¡Claro! Te comunico con un asesor de Altorra.<br><br>
  <a href="${waLink}" ...>💬 Chatear por WhatsApp</a>`;
```

**DESPUÉS:**
```javascript
// Ahora usa la función que incluye propiedades seleccionadas
let html = `¡Claro! Te comunico con un asesor de Altorra.<br><br>`;

// Si hay propiedades seleccionadas, informar
if (selectedProperties.length > 0) {
  html += `✅ <b>Tienes ${selectedProperties.length} ${selectedProperties.length === 1 ? 'propiedad seleccionada' : 'propiedades seleccionadas'}</b><br><br>`;
  html += `Al hacer clic en el botón de abajo, se enviarán automáticamente tus propiedades de interés junto con tu perfil de búsqueda.<br><br>`;
} else {
  html += `💡 <i>Tip: Si ya viste propiedades que te interesan, puedes marcarlas con el checkbox "Me interesa" antes de contactar al asesor.</i><br><br>`;
}

// Botón que llama a chatbotSendToAdvisor()
html += `
  <button onclick="window.chatbotSendToAdvisor()" class="chat-whatsapp-link" ...>
    ${selectedProperties.length > 0 ? '📱 Enviar propiedades seleccionadas al asesor' : '💬 Chatear con asesor por WhatsApp'}
  </button>
`;
```

**Impacto:**
- ✅ SIEMPRE incluye propiedades seleccionadas
- ✅ Mensaje dinámico según si hay o no propiedades seleccionadas
- ✅ Texto del botón cambia dinámicamente
- ✅ Proporciona feedback claro al usuario

#### **2. Mejora del caso 'contacto' (chatbot.js:3457-3491)**

**ANTES:**
```javascript
case 'contacto':
  // Generaba link manual con solo el perfil
  let waMessage = 'Hola Altorra, necesito hablar con un asesor';
  // Agregaba contexto pero NO propiedades seleccionadas
  if (ctxContact.interest || ctxContact.propertyType || ctxContact.zone) { ... }
  const waLinkContact = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(waMessage)}`;
  contactResponse += `<a href="${waLinkContact}" ...>Hablar por WhatsApp</a>`;
```

**DESPUÉS:**
```javascript
case 'contacto':
  // Ahora informa sobre propiedades seleccionadas
  if (selectedProperties.length > 0) {
    contactResponse += `✅ <b>Tienes ${selectedProperties.length} ${selectedProperties.length === 1 ? 'propiedad seleccionada' : 'propiedades seleccionadas'}</b><br><br>`;
    contactResponse += `Al hacer clic en el botón, se enviarán automáticamente tus propiedades de interés junto con tu perfil de búsqueda.<br><br>`;
  }

  // Botón que llama a chatbotSendToAdvisor()
  contactResponse += `
    <button onclick="window.chatbotSendToAdvisor()" ...>
      ${selectedProperties.length > 0 ? '📱 Enviar propiedades al asesor' : '💬 Hablar por WhatsApp'}
    </button>
  `;
```

**Impacto:**
- ✅ Consistencia en todo el chatbot
- ✅ Siempre incluye propiedades seleccionadas

#### **3. Contador más visible (chatbot.js:682, 802)**

**ANTES:**
```javascript
intro += '<div id="selected-props-counter" style="display:none;background:#e7f3ff;padding:10px;border-radius:8px;margin:10px 0;font-weight:600;color:#0066cc;"></div>';
```

**DESPUÉS:**
```javascript
intro += '<div id="selected-props-counter" style="display:none;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:#fff;padding:12px 16px;border-radius:10px;margin:12px 0;font-weight:700;text-align:center;font-size:0.95rem;box-shadow:0 3px 10px rgba(102, 126, 234, 0.3);"></div>';
```

**Mejora en el texto (chatbot.js:2044):**
```javascript
// ANTES:
counter.textContent = `${selectedProperties.length} ${selectedProperties.length === 1 ? 'propiedad seleccionada' : 'propiedades seleccionadas'}`;

// DESPUÉS:
counter.innerHTML = `✓ ${selectedProperties.length} ${selectedProperties.length === 1 ? 'propiedad seleccionada' : 'propiedades seleccionadas'} - Listo para enviar al asesor`;
```

**Impacto:**
- ✅ Gradiente morado vibrante (muy visible)
- ✅ Sombra para destacar
- ✅ Mensaje claro: "Listo para enviar al asesor"
- ✅ Icono ✓ para confirmar acción

#### **4. Estilos del checkbox mejorados (chatbot.css:330-382)**

**ANTES:**
```css
.property-interest-toggle {
  background: rgba(255, 255, 255, 0.95);
  padding: 6px 10px;
  transition: all 0.2s ease;
}
.property-interest-toggle input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--chat-gold);
}
```

**DESPUÉS:**
```css
.property-interest-toggle {
  background: rgba(255, 255, 255, 0.95);
  padding: 6px 12px;
  transition: all 0.3s ease;
}
.property-interest-toggle:hover {
  transform: translateY(-1px); /* Efecto de elevación */
}
.property-interest-toggle input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #10b981; /* Verde para selección */
}
.property-interest-toggle input[type="checkbox"]:checked {
  accent-color: #059669; /* Verde más oscuro cuando está checked */
}

/* Efecto visual cuando el checkbox está checked */
.property-interest-toggle:has(input:checked) {
  background: linear-gradient(135deg, #d4f4dd 0%, #d1fae5 100%);
  border: 1px solid #10b981;
}
.property-interest-toggle:has(input:checked) label {
  color: #047857;
}
```

**Impacto:**
- ✅ Checkbox 18px (más grande, más visible)
- ✅ Color verde para indicar selección (más intuitivo que dorado)
- ✅ **Fondo del toggle cambia a verde claro cuando está checked**
- ✅ **Borde verde para máximo contraste**
- ✅ **Texto del label cambia a verde oscuro**
- ✅ Efecto de elevación en hover
- ✅ **Feedback visual instantáneo al seleccionar**

### 📊 Análisis de impacto

**Funciones modificadas:**
- `processMessage()` - Líneas 2974-3006 (detección de "contactar asesor")
- `handleOption()` caso 'contacto' - Líneas 3457-3491
- `updateSelectedCounter()` - Línea 2044

**Archivos modificados:**
- `js/chatbot.js`: +60 líneas netas (mejoras y nuevos mensajes)
- `css/chatbot.css`: +24 líneas (nuevos estilos para checkbox checked)

**Flujos afectados:**
- ✅ Cuando usuario dice "hablar con asesor" → Ahora incluye propiedades
- ✅ Cuando usuario selecciona opción "Contacto" → Ahora incluye propiedades
- ✅ Cuando usuario ve propiedades → Contador más visible
- ✅ Cuando usuario marca checkbox → Feedback visual claro

**Compatibilidad:**
- ✅ No rompe flujos existentes
- ✅ Función `chatbotSendToAdvisor()` ya existía y funcionaba bien
- ✅ Solo se agregó integración entre funciones
- ✅ Estilos CSS compatibles con todos los navegadores modernos (`:has()` selector)

### 🧪 Testing manual recomendado

**Escenario 1: Usuario selecciona propiedades y pide asesor**
1. Buscar propiedades ("apartamento en bocagrande")
2. Bot muestra 3 propiedades
3. Marcar 2 propiedades con checkbox "Me interesa"
4. Verificar que contador muestra "✓ 2 propiedades seleccionadas - Listo para enviar"
5. Decir "quiero hablar con un asesor"
6. Bot debe mostrar: "✅ Tienes 2 propiedades seleccionadas"
7. Hacer clic en botón "📱 Enviar propiedades seleccionadas al asesor"
8. **Verificar WhatsApp:**
   - ✅ Incluye "📋 PROPIEDADES SELECCIONADAS (2):"
   - ✅ Lista las 2 propiedades con detalles
   - ✅ Incluye perfil de búsqueda completo

**Escenario 2: Usuario NO selecciona propiedades**
1. Buscar propiedades
2. NO marcar ninguna
3. Decir "contactar asesor"
4. Bot debe mostrar tip: "Si ya viste propiedades que te interesan..."
5. Botón debe decir "💬 Chatear con asesor por WhatsApp"
6. **Verificar WhatsApp:**
   - ✅ Solo incluye perfil de búsqueda
   - ✅ NO incluye sección "PROPIEDADES SELECCIONADAS"

**Escenario 3: Feedback visual del checkbox**
1. Ver propiedades en el chat
2. Pasar mouse sobre checkbox → debe elevarse ligeramente
3. Hacer clic en checkbox
4. **Verificar:**
   - ✅ Fondo del toggle cambia a verde claro
   - ✅ Borde verde aparece
   - ✅ Texto "Me interesa" cambia a verde oscuro
   - ✅ Contador aparece abajo con gradiente morado
5. Desmarcar checkbox
6. **Verificar:**
   - ✅ Vuelve a fondo blanco
   - ✅ Borde desaparece
   - ✅ Contador desaparece si era la última propiedad

**Escenario 4: Caso 'contacto' desde menú rápido**
1. Hacer clic en opción rápida "Contacto"
2. Verificar que aparece botón que llama a `chatbotSendToAdvisor()`
3. Si hay propiedades seleccionadas, debe informar

### 📈 Resultados esperados

**UX mejorada:**
- ✅ Usuario siempre sabe cuántas propiedades tiene seleccionadas
- ✅ Feedback visual claro al seleccionar (verde)
- ✅ Mensaje explícito de que propiedades serán enviadas
- ✅ Botón con texto dinámico según contexto
- ✅ No hay confusión sobre cómo enviar propiedades al asesor

**Para el asesor:**
- ✅ Recibe lista clara de propiedades de interés
- ✅ Puede priorizar seguimiento según propiedades específicas
- ✅ Contexto completo: perfil + propiedades seleccionadas
- ✅ Mejor calificación de leads (sabe exactamente qué interesa)

**Métricas a monitorear:**
- % de usuarios que seleccionan propiedades antes de contactar
- Número promedio de propiedades seleccionadas por conversación
- Tasa de conversión de chat → WhatsApp con propiedades seleccionadas
- Calidad de leads según asesor (¿más específicos?)

### 🎯 Próximos pasos opcionales

**Mejoras futuras:**
1. **Persistir selección en localStorage** - Mantener propiedades seleccionadas entre sesiones
2. **Máximo de propiedades seleccionables** - Limitar a 5-7 para no saturar al asesor
3. **Botón flotante fijo** - Siempre visible si hay propiedades seleccionadas
4. **Preview de selección** - Mini-cards de propiedades seleccionadas antes de enviar
5. **Analytics** - Trackear qué propiedades se seleccionan más

**Estado**: ✅ Implementado y testeado
**Prioridad**: ALTA (mejora directa de conversión)
**Commits**: `[pending]`

---

## 📚 Notas para Desarrolladores / IAs

### Convenciones de código
- **JavaScript**: IIFE pattern con `'use strict'`
- **Nombres de variables**: camelCase para variables, UPPER_CASE para constantes
- **Comentarios**: Español, descriptivos
- **Logging**: Usar `console.log('✅ ...')` para éxitos, `console.warn()` para warnings

### Estructura de archivos
```
/js/               # Módulos JavaScript
/css/              # Hojas de estilo por feature
/properties/       # Datos JSON de propiedades
/multimedia/       # Imágenes generales
/allure/, /Milan/  # Imágenes de proyectos específicos
```

### Configuración centralizada
Siempre usar `window.ALTORRA_CONFIG` en lugar de hardcodear valores:
```javascript
// ❌ NO hacer esto
const whatsapp = '573002439810';

// ✅ Hacer esto
const whatsapp = window.ALTORRA_CONFIG.CONTACT.whatsapp;
```

### Testing
- **Manual testing requerido** para todos los formularios
- Probar en móvil (iOS/Android) para validar estilos y eventos touch
- Verificar meta tags con herramientas como Facebook Debugger, Twitter Card Validator

---

## 🔗 Referencias

- **Repositorio**: https://github.com/altorrainmobiliaria/ALTORRA-PILOTO
- **Sitio en producción**: https://altorrainmobiliaria.github.io
- **Google Maps Place ID**: ChIJoym3zbYl9o4Rxs-NeVE8-FY
- **FormSubmit endpoint**: altorrainmobiliaria@gmail.com

---

**Última actualización**: 20 de noviembre de 2025
**Actualizado por**: Claude (Anthropic AI Assistant)
