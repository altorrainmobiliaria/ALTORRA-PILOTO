# 🔍 VERIFICACIÓN DEL TEMPLATE DE EMAILJS

## ⚠️ PROBLEMA IDENTIFICADO

El formulario envía correctamente los datos, pero **el correo llega vacío** porque las variables del template no coinciden con los parámetros enviados.

---

## 📋 VERIFICACIÓN PASO A PASO

### 1️⃣ Acceder al Template

1. Ve a: https://dashboard.emailjs.com/
2. Click en **"Email Templates"** (menú lateral)
3. Busca el template: **`template_442jrws`** (altorra_contacto)
4. Click en **"Edit"** o el nombre del template

---

### 2️⃣ Verificar Variables (CRÍTICO)

En el contenido HTML del template, **TODAS** las variables deben estar escritas **exactamente así**:

```html
{{nombre}}      ✅ CORRECTO (minúscula)
{{email}}       ✅ CORRECTO (minúscula)
{{telefono}}    ✅ CORRECTO (minúscula)
{{motivo}}      ✅ CORRECTO (minúscula)
{{mensaje}}     ✅ CORRECTO (minúscula)
{{fecha}}       ✅ CORRECTO (minúscula)
{{radicado}}    ✅ CORRECTO (minúscula)
```

**❌ ERRORES COMUNES QUE CAUSAN CORREOS VACÍOS:**

```html
{{Nombre}}      ❌ INCORRECTO (mayúscula inicial)
{{Email}}       ❌ INCORRECTO (mayúscula inicial)
{{Telefono}}    ❌ INCORRECTO (mayúscula inicial)
{{Mensaje}}     ❌ INCORRECTO (mayúscula inicial)
{{nombre }}     ❌ INCORRECTO (espacio al final)
{{ nombre}}     ❌ INCORRECTO (espacio al inicio)
{{NOMBRE}}      ❌ INCORRECTO (todo mayúsculas)
```

---

### 3️⃣ Ejemplo de Template Correcto

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Nuevo contacto - Altorra Inmobiliaria</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #d4af37 0%, #ffd700 100%); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">📧 Nuevo Contacto</h1>
    <p style="color: white; margin: 10px 0 0 0;">Radicado: {{radicado}}</p>
  </div>

  <div style="background: #f9f9f9; padding: 20px; margin-top: 20px; border-radius: 8px;">

    <h2 style="color: #333; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
      Información del Cliente
    </h2>

    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px; font-weight: bold; color: #555;">Nombre:</td>
        <td style="padding: 10px; color: #333;">{{nombre}}</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 10px; font-weight: bold; color: #555;">Email:</td>
        <td style="padding: 10px; color: #333;">{{email}}</td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold; color: #555;">Teléfono:</td>
        <td style="padding: 10px; color: #333;">{{telefono}}</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 10px; font-weight: bold; color: #555;">Motivo:</td>
        <td style="padding: 10px; color: #333;">{{motivo}}</td>
      </tr>
    </table>

    <h3 style="color: #333; margin-top: 20px;">Mensaje:</h3>
    <div style="background: white; padding: 15px; border-left: 4px solid #d4af37; margin: 10px 0;">
      <p style="color: #333; white-space: pre-wrap; margin: 0;">{{mensaje}}</p>
    </div>

    <p style="color: #888; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
      📅 Fecha de envío: {{fecha}}
    </p>

  </div>

  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd;">
    <p style="color: #888; font-size: 12px; margin: 5px 0;">
      <strong>Altorra Inmobiliaria</strong><br>
      Cartagena, Colombia<br>
      📞 +57 300 243 9810 | 📧 contacto@altorrainmobiliaria.com
    </p>
  </div>

</body>
</html>
```

---

### 4️⃣ Verificar "To Email"

En la configuración del template:

- **To email:** `altorrainmobiliaria@gmail.com`
- **From name:** `Formulario Web Altorra`
- **From email:** `{{email}}` (el email del cliente)
- **Reply to:** `{{email}}` (opcional, para poder responder directamente)

---

### 5️⃣ Guardar y Probar

1. Click en **"Save"** (parte superior derecha)
2. Ve a tu sitio: `https://altorrainmobiliaria.github.io/contacto.html`
3. Llena el formulario con datos de prueba
4. Abre la consola (F12) y verifica:
   ```
   ✅ EmailJS inicializado correctamente
   📤 Enviando formulario de contacto: {nombre: "...", email: "..."}
   ✅ Email enviado exitosamente
   ```
5. Revisa tu email `altorrainmobiliaria@gmail.com`
6. **Confirma que todos los campos tienen datos**

---

## 🐛 TROUBLESHOOTING

### Caso 1: Campos vacíos en el correo

**Causa:** Variables del template no coinciden con los parámetros enviados

**Solución:**
1. Revisa que cada `{{variable}}` esté en minúscula
2. Verifica que no haya espacios: `{{nombre}}` ✅ vs `{{nombre }}` ❌
3. Revisa que no haya typos: `{{telefono}}` ✅ vs `{{telefone}}` ❌

### Caso 2: Error "Template not found"

**Causa:** Template ID incorrecto en el código

**Solución:**
1. Verifica en EmailJS dashboard el ID exacto del template
2. Debe ser: `template_442jrws`
3. Si es diferente, actualiza `js/email-service.js` línea 13:
   ```javascript
   const TEMPLATE_CONTACTO = "template_442jrws";  // ← Actualizar aquí
   ```

### Caso 3: Error 401 (Unauthorized)

**Causa:** Public Key o Service ID incorrectos

**Solución:**
1. Ve a EmailJS Dashboard → Account → General
2. Copia tu Public Key
3. Actualiza `js/email-service.js` línea 11:
   ```javascript
   const PUBLIC_KEY = "TU_PUBLIC_KEY_AQUI";  // ← Actualizar aquí
   ```

---

## ✅ CHECKLIST FINAL

Antes de cerrar este documento, confirma:

- [ ] Todas las variables del template están en **minúscula**
- [ ] No hay **espacios** extra en las variables
- [ ] El template está **guardado** correctamente
- [ ] El **To email** apunta a `altorrainmobiliaria@gmail.com`
- [ ] El **Template ID** en el código coincide con el del dashboard
- [ ] Probaste el formulario y **el correo llegó con todos los datos**

---

## 🎯 VARIABLES DEFINITIVAS

**Para copiar y pegar en el template HTML:**

```
{{nombre}}
{{email}}
{{telefono}}
{{motivo}}
{{mensaje}}
{{fecha}}
{{radicado}}
```

**Para verificar en la consola del navegador:**

```javascript
// Ejecuta esto en la consola tras enviar el formulario:
// Deberías ver estos valores:
{
  nombre: "Juan Pérez",
  email: "juan@example.com",
  telefono: "+57 300 123 4567",
  motivo: "Comprar propiedad",
  mensaje: "Hola, estoy interesado...",
  fecha: "20 de noviembre de 2025, 10:30 p.m.",
  radicado: "ALT-1732143856789"
}
```

---

**Última actualización:** 20 de noviembre de 2025
**Autor:** Equipo Técnico Altorra
**Versión:** 1.0
