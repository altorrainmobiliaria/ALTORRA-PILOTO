# 📧 Configuración de EmailJS para Altorra Inmobiliaria

## ⚠️ IMPORTANTE - LEER PRIMERO

Los formularios de contacto ahora usan **EmailJS** en lugar de FormSubmit. Esto elimina:
- ❌ Redirección fuera de la página
- ❌ CAPTCHA en inglés
- ❌ Emails sin formato

Y agrega:
- ✅ Confirmación en la misma página
- ✅ Número de radicado único
- ✅ Emails con formato de tabla profesional
- ✅ Copia al usuario Y a altorrainmobiliaria@gmail.com

---

## 📋 Requisitos Previos

- Cuenta de Gmail: altorrainmobiliaria@gmail.com
- 10-15 minutos para configurar
- Acceso a internet

---

## 🚀 Pasos de Configuración

### Paso 1: Crear Cuenta en EmailJS

1. Ve a https://www.emailjs.com/
2. Haz clic en **"Sign Up"**
3. Selecciona **"Sign up with Google"**
4. Usa la cuenta **altorrainmobiliaria@gmail.com**
5. Acepta los términos y condiciones

**Plan Gratuito:**
- ✅ 200 emails/mes (suficiente para iniciar)
- ✅ Sin tarjeta de crédito requerida
- ✅ Todas las funciones necesarias

---

### Paso 2: Conectar Gmail

1. En el dashboard de EmailJS, ve a **"Email Services"**
2. Haz clic en **"Add New Service"**
3. Selecciona **"Gmail"**
4. Dale un nombre al servicio: `service_altorra`
5. Haz clic en **"Connect Account"**
6. Autoriza el acceso a Gmail
7. **Guarda el Service ID:** `service_XXXXXXX`

**NOTA IMPORTANTE:** Guarda este Service ID, lo necesitarás en el Paso 5.

---

### Paso 3: Crear Templates de Email

Debes crear **4 templates** diferentes. Aquí están los detalles:

#### 📝 Template 1: Formulario de Contacto (contacto.html)

**Template ID:** `template_contacto`

**Subject:** `Nuevo contacto desde la web - {{Nombre}}`

**Content (HTML):**

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #d4af37; border-bottom: 3px solid #d4af37; padding-bottom: 10px;">
    ✉️ Nuevo Contacto desde Altorra Inmobiliaria
  </h2>

  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="font-size: 18px; font-weight: bold; color: #111827; margin: 0;">
      Número de radicado:
    </p>
    <p style="font-size: 24px; font-family: 'Courier New', monospace; color: #d4af37; font-weight: bold; margin: 10px 0;">
      {{radicado}}
    </p>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr style="background: #111827;">
      <th style="padding: 12px; text-align: left; color: white; border: 1px solid #ddd;">Campo</th>
      <th style="padding: 12px; text-align: left; color: white; border: 1px solid #ddd;">Información</th>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Nombre</td>
      <td style="padding: 10px; border: 1px solid #ddd;">{{Nombre}}</td>
    </tr>
    <tr style="background: #f9fafb;">
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email</td>
      <td style="padding: 10px; border: 1px solid #ddd;">{{Email}}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Teléfono</td>
      <td style="padding: 10px; border: 1px solid #ddd;">{{Telefono}}</td>
    </tr>
    <tr style="background: #f9fafb;">
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Motivo</td>
      <td style="padding: 10px; border: 1px solid #ddd;">{{Motivo}}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Mensaje</td>
      <td style="padding: 10px; border: 1px solid #ddd; white-space: pre-wrap;">{{Mensaje}}</td>
    </tr>
    <tr style="background: #f9fafb;">
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Fecha</td>
      <td style="padding: 10px; border: 1px solid #ddd;">{{fecha_envio}}</td>
    </tr>
  </table>

  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
    <p style="margin: 0; color: #92400e;">
      <strong>⏰ Acción requerida:</strong> Un cliente está esperando respuesta. Contacta en las próximas 24 horas.
    </p>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

  <p style="color: #6b7280; font-size: 12px; text-align: center;">
    Este mensaje fue enviado desde el formulario de contacto de <a href="https://altorrainmobiliaria.github.io" style="color: #d4af37;">altorrainmobiliaria.github.io</a>
  </p>
</div>
```

**To Email:** `{{to_email}}` (dejar así)

**From Name:** `Formulario Web - Altorra`

**Reply To:** `{{Email}}` (para responder directamente al cliente)

---

#### 📝 Template 2: Publicar Propiedad (publicar-propiedad.html)

**Template ID:** `template_publicar`

**Subject:** `Solicitud para publicar propiedad - {{Nombre}}`

**Content (HTML):**

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #d4af37; border-bottom: 3px solid #d4af37; padding-bottom: 10px;">
    🏠 Nueva Solicitud para Publicar Propiedad
  </h2>

  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="font-size: 18px; font-weight: bold; color: #111827; margin: 0;">
      Número de radicado:
    </p>
    <p style="font-size: 24px; font-family: 'Courier New', monospace; color: #d4af37; font-weight: bold; margin: 10px 0;">
      {{radicado}}
    </p>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr style="background: #111827;">
      <th style="padding: 12px; text-align: left; color: white; border: 1px solid #ddd;">Campo</th>
      <th style="padding: 12px; text-align: left; color: white; border: 1px solid #ddd;">Información</th>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Propietario</td>
      <td style="padding: 10px; border: 1px solid #ddd;">{{Nombre}}</td>
    </tr>
    <tr style="background: #f9fafb;">
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email</td>
      <td style="padding: 10px; border: 1px solid #ddd;">{{Email}}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Teléfono</td>
      <td style="padding: 10px; border: 1px solid #ddd;">{{Telefono}}</td>
    </tr>
    <tr style="background: #f9fafb;">
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Ciudad</td>
      <td style="padding: 10px; border: 1px solid #ddd;">{{Ciudad}}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Operación</td>
      <td style="padding: 10px; border: 1px solid #ddd;">{{Operacion}}</td>
    </tr>
    <tr style="background: #f9fafb;">
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Tipo de Propiedad</td>
      <td style="padding: 10px; border: 1px solid #ddd;">{{Tipo}}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Precio Estimado</td>
      <td style="padding: 10px; border: 1px solid #ddd;">{{Precio}}</td>
    </tr>
    <tr style="background: #f9fafb;">
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Descripción</td>
      <td style="padding: 10px; border: 1px solid #ddd; white-space: pre-wrap;">{{Descripcion}}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Fecha</td>
      <td style="padding: 10px; border: 1px solid #ddd;">{{fecha_envio}}</td>
    </tr>
  </table>

  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
    <p style="margin: 0; color: #92400e;">
      <strong>💰 Oportunidad de negocio:</strong> Contacta al propietario en las próximas 24 horas para valorar la propiedad.
    </p>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

  <p style="color: #6b7280; font-size: 12px; text-align: center;">
    Este mensaje fue enviado desde el formulario de publicación de <a href="https://altorrainmobiliaria.github.io" style="color: #d4af37;">altorrainmobiliaria.github.io</a>
  </p>
</div>
```

**To Email:** `{{to_email}}`

**From Name:** `Solicitud Publicación - Altorra`

**Reply To:** `{{Email}}`

---

#### 📝 Template 3: Consulta desde Detalle de Propiedad

**Template ID:** `template_detalle`

**Subject:** `Consulta sobre {{property_title}} (ID: {{property_id}})`

**Content (HTML):**

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #d4af37; border-bottom: 3px solid #d4af37; padding-bottom: 10px;">
    🏡 Consulta sobre Propiedad
  </h2>

  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="font-size: 18px; font-weight: bold; color: #111827; margin: 0;">
      Número de radicado:
    </p>
    <p style="font-size: 24px; font-family: 'Courier New', monospace; color: #d4af37; font-weight: bold; margin: 10px 0;">
      {{radicado}}
    </p>
  </div>

  <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
    <p style="margin: 0 0 5px 0; color: #1e40af; font-weight: bold;">Propiedad de interés:</p>
    <p style="margin: 0; font-size: 18px; color: #1e3a8a;">{{property_title}}</p>
    <p style="margin: 5px 0 0 0; color: #60a5fa; font-size: 14px;">ID: {{property_id}}</p>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr style="background: #111827;">
      <th style="padding: 12px; text-align: left; color: white; border: 1px solid #ddd;">Campo</th>
      <th style="padding: 12px; text-align: left; color: white; border: 1px solid #ddd;">Información</th>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Nombre</td>
      <td style="padding: 10px; border: 1px solid #ddd;">{{name}}</td>
    </tr>
    <tr style="background: #f9fafb;">
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email</td>
      <td style="padding: 10px; border: 1px solid #ddd;">{{email}}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Teléfono</td>
      <td style="padding: 10px; border: 1px solid #ddd;">{{phone}}</td>
    </tr>
    <tr style="background: #f9fafb;">
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Mensaje</td>
      <td style="padding: 10px; border: 1px solid #ddd; white-space: pre-wrap;">{{message}}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Fecha</td>
      <td style="padding: 10px; border: 1px solid #ddd;">{{fecha_envio}}</td>
    </tr>
  </table>

  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
    <p style="margin: 0; color: #92400e;">
      <strong>🔥 Cliente interesado:</strong> Esta persona está viendo una propiedad específica. Responde rápido para aumentar las posibilidades de cierre.
    </p>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

  <p style="color: #6b7280; font-size: 12px; text-align: center;">
    Este mensaje fue enviado desde el detalle de propiedad en <a href="https://altorrainmobiliaria.github.io" style="color: #d4af37;">altorrainmobiliaria.github.io</a>
  </p>
</div>
```

**To Email:** `{{to_email}}`

**From Name:** `Consulta Propiedad - Altorra`

**Reply To:** `{{email}}`

---

#### 📝 Template 4: Auto-respuesta al Usuario

**Template ID:** `template_autorespuesta`

**Subject:** `Confirmación de contacto - Altorra Inmobiliaria`

**Content (HTML):**

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #d4af37; margin: 0;">Altorra Inmobiliaria</h1>
    <p style="color: #6b7280; margin: 5px 0;">Tu socio confiable en bienes raíces</p>
  </div>

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
    <h2 style="margin: 0 0 10px 0; font-size: 28px;">✓ ¡Mensaje Recibido!</h2>
    <p style="margin: 0; font-size: 16px; opacity: 0.9;">Gracias por contactarnos</p>
  </div>

  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin: 0 0 10px 0; color: #374151;">Hola <strong>{{to_name}}</strong>,</p>
    <p style="margin: 10px 0; color: #374151; line-height: 1.6;">
      Hemos recibido tu solicitud y queremos confirmarte que un asesor de Altorra Inmobiliaria se pondrá en contacto contigo en el menor tiempo posible.
    </p>
  </div>

  <div style="border: 2px dashed #d4af37; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
    <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">Tu número de radicado es:</p>
    <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 24px; color: #d4af37; font-weight: bold;">
      {{radicado}}
    </p>
    <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
      (Guarda este número para futuras referencias)
    </p>
  </div>

  <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
    <p style="margin: 0; color: #1e40af;">
      <strong>⏰ Tiempo de respuesta:</strong> Menos de 24 horas hábiles
    </p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <p style="color: #6b7280; margin-bottom: 15px;">¿Necesitas respuesta inmediata?</p>
    <a href="https://wa.me/573002439810" style="display: inline-block; background: #25d366; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
      💬 Chatea con nosotros en WhatsApp
    </a>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

  <div style="text-align: center;">
    <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
      <strong>Altorra Inmobiliaria</strong>
    </p>
    <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
      📞 +57 300 243 9810 | 📧 altorrainmobiliaria@gmail.com
    </p>
    <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
      Cartagena de Indias, Colombia
    </p>
  </div>
</div>
```

**To Email:** `{{to_email}}` (email del usuario que envió el formulario)

**From Name:** `Altorra Inmobiliaria`

**Reply To:** `altorrainmobiliaria@gmail.com`

---

### Paso 4: Obtener la Public Key

1. En EmailJS, ve a **"Account"** (arriba a la derecha)
2. Busca la sección **"API Keys"** o **"General"**
3. Encontrarás tu **Public Key** (similar a: `user_XXXXXXXXXXXXXXXXXX`)
4. **Copia esta clave**

---

### Paso 5: Actualizar el Código

Abre el archivo `/js/email-service.js` y actualiza las siguientes líneas:

```javascript
const EMAIL_CONFIG = {
  // REEMPLAZAR ESTOS VALORES:
  publicKey: 'TU_PUBLIC_KEY_AQUI',        // La Public Key del Paso 4
  serviceId: 'service_altorra',            // El Service ID del Paso 2
  templates: {
    contactForm: 'template_contacto',      // Template ID del contacto
    publishForm: 'template_publicar',      // Template ID de publicar
    detailForm: 'template_detalle',        // Template ID de detalle
    autoResponse: 'template_autorespuesta' // Template ID de auto-respuesta
  },
  toEmail: 'altorrainmobiliaria@gmail.com'
};
```

**Ejemplo con valores reales:**
```javascript
const EMAIL_CONFIG = {
  publicKey: 'user_kX3mP9LqR2nY7wZv',
  serviceId: 'service_altorra',
  templates: {
    contactForm: 'template_contacto',
    publishForm: 'template_publicar',
    detailForm: 'template_detalle',
    autoResponse: 'template_autorespuesta'
  },
  toEmail: 'altorrainmobiliaria@gmail.com'
};
```

---

### Paso 6: Probar el Sistema

1. Abre la página en el navegador: https://altorrainmobiliaria.github.io/contacto.html
2. Llena el formulario de contacto
3. Haz clic en "Enviar mensaje"
4. Deberías ver:
   - ✅ Modal de confirmación con número de radicado
   - ✅ Email en altorrainmobiliaria@gmail.com con tabla de datos
   - ✅ Email de confirmación al usuario

**Si algo falla:**
- Abre la consola del navegador (F12)
- Busca mensajes de error en rojo
- Verifica que copiaste correctamente los IDs y la Public Key

---

## 🎯 Verificación Final

Usa este checklist para asegurarte de que todo funciona:

- [ ] Cuenta de EmailJS creada
- [ ] Servicio de Gmail conectado
- [ ] 4 templates creados (contacto, publicar, detalle, auto-respuesta)
- [ ] Public Key copiada
- [ ] Código actualizado en `email-service.js`
- [ ] Formulario de contacto probado - ¿Llega el email?
- [ ] Formulario de publicar probado - ¿Llega el email?
- [ ] Auto-respuesta funciona - ¿El usuario recibe confirmación?
- [ ] Modal de radicado aparece correctamente
- [ ] No hay errores en la consola del navegador

---

## ❓ Preguntas Frecuentes

**P: ¿Qué pasa si supero los 200 emails/mes?**
R: EmailJS te enviará una notificación. Puedes upgradear al plan pagado ($15/mes por 1000 emails) o implementar una solución backend propia.

**P: ¿Los emails van a spam?**
R: No, porque Gmail es el remitente autorizado. Asegúrate de que el email de "Reply To" sea el del usuario para facilitar respuestas.

**P: ¿Puedo cambiar el diseño de los emails?**
R: Sí, en EmailJS puedes editar los templates cuando quieras. El HTML es totalmente personalizable.

**P: ¿Qué pasa si hay un error de envío?**
R: El usuario verá un mensaje de error. Los datos NO se pierden porque el navegador los guarda temporalmente con el autosave.

**P: ¿Funciona sin internet?**
R: No, EmailJS requiere conexión para enviar emails. El formulario mostrará error si no hay internet.

---

## 🔧 Solución de Problemas

### Error: "EmailJS not loaded"
**Solución:** Verifica que el script de EmailJS esté cargando:
```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
```

### Error: "Invalid public key"
**Solución:** Copia de nuevo la Public Key desde EmailJS y pégala en `email-service.js`

### Emails no llegan
**Solución:**
1. Verifica la consola del navegador para errores
2. Confirma que el Service ID y Template IDs son correctos
3. Revisa la bandeja de spam en Gmail
4. Verifica que la cuenta de Gmail esté conectada en EmailJS

### Modal no aparece
**Solución:**
1. Abre consola (F12) y busca errores
2. Verifica que `form-validation.js` esté cargando
3. Confirma que no hay conflictos de CSS

---

## 📞 Soporte

Si necesitas ayuda adicional:
- 📧 Email: emailjs@emailjs.com (soporte de EmailJS)
- 📚 Documentación: https://www.emailjs.com/docs/
- 💬 Chat de soporte: En el dashboard de EmailJS

---

**Última actualización:** Noviembre 20, 2025
**Versión del sistema:** 1.0
**Autor:** Claude Code para Altorra Inmobiliaria
