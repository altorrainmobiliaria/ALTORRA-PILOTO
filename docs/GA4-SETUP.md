# 📊 Guía de Configuración de Google Analytics 4 (GA4)

## 🎯 Objetivo

Integrar Google Analytics 4 en el sitio de Altorra Inmobiliaria para rastrear métricas de usuario, conversiones y comportamiento.

---

## 📋 Paso 1: Crear Propiedad de GA4

1. **Acceder a Google Analytics**
   - Ir a [https://analytics.google.com](https://analytics.google.com)
   - Iniciar sesión con la cuenta de Google de la empresa

2. **Crear nueva propiedad**
   - Click en "Administrador" (icono de engranaje)
   - En la columna "Propiedad", click en "+ Crear propiedad"
   - Nombre de la propiedad: **"Altorra Inmobiliaria"**
   - Zona horaria: **"Colombia (GMT-5)"**
   - Moneda: **"Peso colombiano (COP)"**

3. **Configurar flujo de datos**
   - Seleccionar "Web"
   - URL del sitio web: **`https://altorrainmobiliaria.github.io`**
   - Nombre del flujo: **"Sitio Web Principal"**
   - Click en "Crear flujo"

4. **Obtener Measurement ID**
   - En la pantalla de detalles del flujo, copiar el **ID de medición**
   - Formato: `G-XXXXXXXXXX` (ej: `G-ABC123DEF4`)
   - ⚠️ Guardar este ID, se usará en el siguiente paso

---

## 📋 Paso 2: Configurar el Código en el Sitio

### 2.1 Actualizar `js/analytics.js`

**Archivo**: `/js/analytics.js`
**Línea**: 18

```javascript
// ANTES (línea 18):
measurementId: 'G-XXXXXXXXXX', // ⚠️ REEMPLAZAR con el ID real de GA4

// DESPUÉS:
measurementId: 'G-ABC123DEF4', // ✅ Tu ID real de GA4
```

### 2.2 Agregar snippet de GA4 en TODAS las páginas HTML

**Ubicación**: En el `<head>`, justo después de `<meta charset="utf-8"/>` y ANTES de cualquier otro script.

**Snippet a agregar** (ver `/snippets/ga4-script.html`):

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123DEF4"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-ABC123DEF4', {
    'anonymize_ip': true,
    'allow_google_signals': false,
    'allow_ad_personalization_signals': false,
    'cookie_flags': 'SameSite=None;Secure'
  });
</script>
```

**Páginas HTML a modificar (22 archivos)**:
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

**⚠️ IMPORTANTE**: Reemplazar `G-ABC123DEF4` con tu Measurement ID real.

---

## 📋 Paso 3: Verificar Instalación

### 3.1 Prueba Local

1. Abrir el sitio en modo desarrollador (F12)
2. Ir a la pestaña "Console"
3. Verificar los siguientes mensajes:
   ```
   📊 Altorra Analytics inicializado
   ✅ Google Analytics 4 activo
   ✅ GA4 configurado: G-ABC123DEF4
   ```

4. Navegar por el sitio y verificar eventos en consola:
   ```
   📊 Analytics: page_view {referrer: "", title: "..."}
   ✅ GA4 Event: page_view {...}
   ```

### 3.2 Prueba en Vivo con Google Analytics

1. Ir a Google Analytics > Informes > Tiempo real
2. Abrir el sitio web en otra pestaña
3. En GA4 "Tiempo real", deberías ver:
   - ✅ 1+ usuario activo
   - ✅ Vistas de página
   - ✅ Eventos personalizados

### 3.3 Prueba con Google Tag Assistant

1. Instalar extensión: [Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Abrir el sitio
3. Click en la extensión Tag Assistant
4. Verificar:
   - ✅ Google Analytics 4 detectado
   - ✅ Measurement ID correcto
   - ✅ Sin errores

---

## 📊 Eventos Personalizados Rastreados

El sistema automáticamente envía los siguientes eventos a GA4:

| Evento | Descripción | Parámetros |
|--------|-------------|-----------|
| `page_view` | Vista de página | `page_path`, `page_title`, `referrer` |
| `property_view` | Vista de propiedad | `id`, `title`, `price`, `city` |
| `external_click` | Click en enlace externo | `url`, `text` |
| `whatsapp_click` | Click en WhatsApp | `page` |
| `time_on_page` | Tiempo en página | `duration`, `page` |
| `search` | Búsqueda realizada | `query`, `results_count` |
| `favorite_added` | Propiedad favorita agregada | `property_id`, `property_title` |
| `favorite_removed` | Propiedad favorita removida | `property_id` |
| `property_compare_add` | Añadir a comparación | `property_id` |
| `form_submit` | Envío de formulario | `form`, `type` |
| `calculator_use` | Uso de calculadora | `price`, `months` |
| `chatbot_message` | Mensaje al chatbot | `message_type` |

---

## 🎯 Configurar Conversiones en GA4

### Eventos Recomendados como Conversiones

1. **Contacto por WhatsApp**
   - Evento: `whatsapp_click`
   - Impacto: Alto

2. **Envío de formularios**
   - Evento: `form_submit`
   - Impacto: Alto

3. **Vistas de propiedades**
   - Evento: `property_view`
   - Impacto: Medio

4. **Uso de calculadora**
   - Evento: `calculator_use`
   - Impacto: Medio

### Cómo marcar como conversión:

1. Ir a GA4 > Configurar > Eventos
2. Buscar el evento (ej: `whatsapp_click`)
3. Activar "Marcar como conversión"
4. Guardar

---

## 🔒 Configuración de Privacidad (GDPR)

El código ya está configurado para cumplir con GDPR:

```javascript
gtag('config', 'G-ABC123DEF4', {
  'anonymize_ip': true,                           // ✅ Anonimizar IP
  'allow_google_signals': false,                   // ✅ No cross-device tracking
  'allow_ad_personalization_signals': false,       // ✅ No personalización de ads
  'cookie_flags': 'SameSite=None;Secure'          // ✅ Cookies seguras
});
```

**Características de privacidad**:
- ✅ IPs anonimizadas
- ✅ No tracking cross-device
- ✅ No personalización de anuncios
- ✅ Cookies con flags de seguridad
- ✅ Sistema local de analytics complementario (no requiere cookies)

---

## 🧪 Debugging y Troubleshooting

### Activar modo debug

En la consola del navegador:

```javascript
// Activar debug de GA4
AltorraAnalytics.setGA4Debug(true);

// Enviar evento de prueba
AltorraAnalytics.track('test_event', {
  test: 'value',
  timestamp: new Date()
});

// Ver estadísticas locales
console.table(AltorraAnalytics.getStats());
```

### Problemas comunes

**1. "GA4 no disponible" en consola**
- ✅ Verificar que el snippet de gtag.js esté en el HTML
- ✅ Verificar que el Measurement ID sea correcto
- ✅ Verificar que no haya bloqueadores de ads activos

**2. Eventos no aparecen en GA4**
- ✅ Esperar 24-48 horas para datos en informes estándar
- ✅ Usar "Tiempo real" para ver eventos inmediatos
- ✅ Verificar que CONFIG.ga4.enabled = true

**3. Errores de CORS**
- ✅ Los snippets de GA4 deben estar en el HTML, no cargados dinámicamente
- ✅ Verificar que el sitio se sirva por HTTPS (GitHub Pages lo hace automáticamente)

---

## 📈 Métricas Clave a Monitorear

### KPIs Principales

1. **Tráfico**
   - Usuarios activos
   - Páginas vistas
   - Tasa de rebote

2. **Engagement**
   - Tiempo promedio en página
   - Páginas por sesión
   - Vistas de propiedades

3. **Conversiones**
   - Clicks en WhatsApp
   - Formularios enviados
   - Favoritos agregados

4. **Propiedades Populares**
   - Propiedades más vistas
   - Propiedades más favoritadas
   - Propiedades más comparadas

5. **Búsquedas**
   - Términos de búsqueda populares
   - Tasa de éxito de búsquedas

---

## 🔗 Referencias

- [Documentación oficial de GA4](https://support.google.com/analytics/answer/9304153)
- [Eventos recomendados para inmobiliarias](https://support.google.com/analytics/answer/9267735)
- [GDPR y Google Analytics](https://support.google.com/analytics/answer/9019185)
- [Tag Assistant](https://support.google.com/tagassistant/answer/2947093)

---

**Última actualización**: 20 de noviembre de 2025
**Responsable**: Claude AI Assistant
