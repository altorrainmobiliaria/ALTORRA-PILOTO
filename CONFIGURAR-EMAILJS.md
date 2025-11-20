# 📧 CONFIGURACIÓN DE EMAILJS - ALTORRA Inmobiliaria

## ⚠️ ACCIÓN REQUERIDA

Los formularios **NO funcionarán** hasta completar esta configuración (15 minutos).

---

## 🔑 PASO 1: OBTENER TUS CREDENCIALES DE EMAILJS

### 1.1 Ir a EmailJS Dashboard
- URL: https://dashboard.emailjs.com/

### 1.2 Obtener PUBLIC KEY
1. Ve a **"Account"** → **"General"**
2. Busca la sección **"API Keys"**
3. Copia tu **"Public Key"** (algo como: `user_xxxxxxxxxxxx` o similar)

### 1.3 Obtener SERVICE ID
1. Ve a **"Email Services"** (menú lateral izquierdo)
2. Deberías ver el servicio de Gmail que conectaste
3. Copia el **"Service ID"** (algo como: `service_xxxxxxx`)

---

## 📝 PASO 2: ACTUALIZAR EL CÓDIGO

Abre el archivo: `/js/email-service.js`

**Busca las líneas 12-13:**

```javascript
publicKey: 'YOUR_PUBLIC_KEY_HERE',  // ⚠️ CAMBIAR
serviceId: 'YOUR_SERVICE_ID_HERE',   // ⚠️ CAMBIAR
```

**Reemplázalas con tus datos reales:**

```javascript
publicKey: 'TU_PUBLIC_KEY_AQUI',     // ✅ Pegar el Public Key
serviceId: 'TU_SERVICE_ID_AQUI',     // ✅ Pegar el Service ID
```

**Ejemplo (con datos ficticios):**
```javascript
publicKey: 'user_a1b2c3d4e5f6g7h8',
serviceId: 'service_abc123',
```

---

## 🎨 PASO 3: CREAR LOS 4 TEMPLATES EN EMAILJS

Necesitas crear 4 templates en EmailJS con estos nombres exactos:

### ✅ Template 1: **altorra_contacto** (YA CREADO)
- **Template ID:** `template_442jrws` ✅
- **Propósito:** Formulario de contacto general
- **Ya está configurado en el código** ✅

### ⏳ Template 2: **altorra_publicar**
**Cómo crearlo:**
1. Ve a **"Email Templates"** → **"Create New Template"**
2. **Template Name:** `altorra_publicar`
3. **Subject:** `🏠 Nueva propiedad para publicar - {{radicado}}`
4. **Content:** Usa el mismo diseño HTML premium pero cambia las variables:
```
{{radicado}}
{{nombre}}
{{email}}
{{telefono}}
{{operacion}}
{{tipo}}
{{precio}}
{{descripcion}}
{{fecha}}
```

### ⏳ Template 3: **altorra_detalle**
**Cómo crearlo:**
1. **Template Name:** `altorra_detalle`
2. **Subject:** `💬 Consulta sobre propiedad - {{radicado}}`
3. **Content:** Incluye estas variables:
```
{{radicado}}
{{nombre}}
{{email}}
{{telefono}}
{{mensaje}}
{{propiedadId}}
{{propiedadTitulo}}
{{fecha}}
```

### ⏳ Template 4: **altorra_confirmacion**
**Cómo crearlo:**
1. **Template Name:** `altorra_confirmacion`
2. **Subject:** `✅ Confirmación - Tu solicitud ha sido recibida`
3. **To Email:** `{{to_email}}` (importante: esto envía al cliente)
4. **Content:** Mensaje de confirmación simple:
```html
Hola {{nombre}},

Hemos recibido tu solicitud correctamente.

Número de radicado: {{radicado}}

Nuestro equipo se pondrá en contacto contigo pronto.

Gracias por confiar en ALTORRA Inmobiliaria.
```

---

## 🧪 PASO 4: LIMPIAR BLOQUEOS (SOLO PRIMERA VEZ)

Si ya intentaste enviar formularios y te bloqueó, ejecuta esto en la consola del navegador (F12):

```javascript
// Limpiar rate limiting
localStorage.removeItem('altorra:form-limit:publishForm');
localStorage.removeItem('altorra:form-limit:contactForm');
localStorage.removeItem('altorra:form-limit:detailForm');
console.log('✅ Límites de formularios limpiados');
location.reload();
```

---

## ✅ PASO 5: PROBAR LOS FORMULARIOS

### 5.1 Verificar en Consola
Abre la consola del navegador (F12) y busca estos mensajes:

✅ **SI VES ESTO:** `✅ EmailJS inicializado correctamente`
- Todo está bien configurado

❌ **SI VES ESTO:** `⚠️ EmailJS no está cargado todavía`
- El script de EmailJS no se cargó
- Verifica tu conexión a internet

❌ **SI VES ESTO:** `EmailJS no está configurado correctamente`
- Falta completar el PASO 2 (Public Key y Service ID)

### 5.2 Probar Formulario de Contacto
1. Ve a: `contacto.html`
2. Llena todos los campos
3. Haz clic en "Enviar solicitud"
4. **DEBERÍAS VER:**
   - Loading spinner
   - Toast verde: "✓ ¡Enviado correctamente! Radicado: ALTORRA-20251120-..."
   - Formulario se limpia automáticamente

5. **DEBERÍAS RECIBIR 2 EMAILS:**
   - ✅ En `altorrainmobiliaria@gmail.com`: Email con datos del cliente
   - ✅ En el email del cliente: Confirmación con radicado

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### ❌ Error: "Servicio de email no configurado"
**Causa:** Falta completar el PASO 2
**Solución:** Actualiza el Public Key y Service ID en `/js/email-service.js`

### ❌ Error: "Has enviado muchos formularios"
**Causa:** Rate limiting activado
**Solución:** Ejecuta el script del PASO 4 en la consola

### ❌ No llegan los emails
**Causas posibles:**
1. **Template ID incorrecto:** Verifica que los nombres coincidan exactamente
2. **Service no conectado:** Ve a EmailJS → Email Services → Verifica que Gmail esté conectado
3. **Límite de EmailJS:** Plan gratuito tiene límite de 200 emails/mes

### ❌ Error 401 (Unauthorized)
**Causa:** Public Key o Service ID incorrectos
**Solución:** Vuelve a copiar las credenciales del dashboard de EmailJS

---

## 📊 ESTADO ACTUAL

| Componente | Estado | Acción Requerida |
|------------|--------|------------------|
| **Email Service** | ✅ Creado | ⏳ Configurar Public Key y Service ID |
| **Template contacto** | ✅ Creado (template_442jrws) | ✅ Listo |
| **Template publicar** | ⏳ Pendiente | ❌ Crear en EmailJS |
| **Template detalle** | ⏳ Pendiente | ❌ Crear en EmailJS |
| **Template confirmación** | ⏳ Pendiente | ❌ Crear en EmailJS |
| **contacto.html** | ✅ Integrado | ✅ Listo |
| **publicar-propiedad.html** | ✅ Integrado | ✅ Listo |
| **detalle-propiedad.html** | ✅ Integrado | ✅ Listo |

---

## 📦 ARCHIVOS MODIFICADOS

```
✅ js/email-service.js           - Servicio de envío de emails
✅ js/form-validation.js         - Validación + integración EmailJS
✅ contacto.html                 - EmailJS SDK agregado
✅ publicar-propiedad.html       - EmailJS SDK agregado
✅ detalle-propiedad.html        - EmailJS SDK agregado
```

---

## 🚀 DESPUÉS DE CONFIGURAR

Una vez completes todos los pasos, los formularios funcionarán así:

1. **Usuario llena formulario** → Validación en tiempo real
2. **Clic en enviar** → Loading spinner
3. **EmailJS envía 2 emails:**
   - A tu email: Datos completos del cliente
   - Al cliente: Confirmación con radicado
4. **Toast de éxito** → Muestra número de radicado
5. **Formulario se limpia** → Listo para otro envío

---

## 📞 SOPORTE

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica que todos los templates estén creados
3. Confirma que Public Key y Service ID estén correctos
4. Prueba con un solo template primero (contacto)

---

**Última actualización:** 20 de noviembre de 2024
**Versión:** 1.0
