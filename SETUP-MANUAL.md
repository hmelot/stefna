# Stefna — Pasos manuales pendientes (Horacio)

Estas son las acciones que solo tú puedes hacer. Claude no tiene acceso a tus cuentas.

---

## 1. Email Routing (5 minutos)

Esto hace que `hola@stefna.app` llegue a tu Gmail.

1. Ve a `dash.cloudflare.com`
2. Click en el dominio `stefna.app`
3. Menú izquierdo → **Email** → **Email Routing**
4. Click **"Enable Email Routing"** si no está habilitado
5. Click **"Create address"**
6. Custom address: `hola`
7. Destination: `hmelot@gmail.com`
8. Click **Save**
9. Cloudflare te pedirá verificar el email destino — revisa tu Gmail y confirma

**Verificar:** Envía un email a `hola@stefna.app` desde otro correo y verifica que llega a tu Gmail.

---

## 2. Google Search Console (2 minutos)

Esto permite que Google indexe stefna.app correctamente.

1. Ve a `search.google.com/search-console`
2. Si ya agregaste la propiedad `https://stefna.app`, click en ella
3. Click **"Verificar"** (el archivo de verificación ya está en producción)
4. Si te dice "verificado", listo. Si no, espera 5 minutos y reintenta
5. Una vez verificado, ve a **Sitemaps** → agrega `https://stefna.app/sitemap.xml`

---

## 3. Meta Business + WhatsApp Cloud API (1-3 días)

Esto es BLOQUEANTE para que el encargado de WhatsApp funcione.

### Paso 1: Crear cuenta Meta Business
1. Ve a `business.facebook.com`
2. Si no tienes cuenta, click **"Crear cuenta"**
3. Nombre: "Stefna" o tu nombre personal
4. Completa los datos

### Paso 2: Verificar el negocio
1. Dentro de Meta Business Suite → **Configuración** → **Centro de seguridad** → **Verificación de negocio**
2. Sube un documento: RUT, patente municipal, o boleta de servicios
3. Espera aprobación (1-3 días hábiles)

### Paso 3: Crear app de desarrollador
1. Ve a `developers.facebook.com`
2. Click **"Crear app"** → tipo: **Negocio**
3. Nombre: "Stefna WhatsApp"
4. Agrega el producto **"WhatsApp"**
5. En la sección de WhatsApp → **Configuración de API**:
   - Anota el `Phone number ID`
   - Anota el `WhatsApp Business Account ID`
   - Genera un **token permanente** (no el temporal de 24h)

### Paso 4: Configurar webhook
1. En la app → WhatsApp → **Configuración** → **Webhooks**
2. URL de callback: `https://stefna-wa.hmelot.workers.dev/webhook`
3. Token de verificación: `stefna-wa-verify-2026` (lo configuraremos como secret)
4. Suscríbete a: `messages`

### Paso 5: Darme los valores
Una vez tengas todo, pásame estos 4 valores y los configuro como secrets en Cloudflare:
```
META_ACCESS_TOKEN=
META_APP_SECRET=
META_VERIFY_TOKEN=stefna-wa-verify-2026
WHATSAPP_PHONE_NUMBER_ID=
```

---

## 4. MercadoPago Token de Producción (10 minutos)

Esto habilita cobros reales en el onboarding.

1. Ve a `mercadopago.cl` → inicia sesión
2. Ve a **Desarrolladores** → `mercadopago.cl/developers`
3. Click en tu aplicación (o crea una nueva: "Stefna")
4. Ve a **Credenciales de producción**
5. Copia:
   - `Access Token` (empieza con `APP_USR-...`)
   - `Public Key` (empieza con `APP_USR-...`)
6. Pásame ambos y los configuro como secrets

---

## 5. Probar el Admin (1 minuto)

1. Ve a `stefna.app/admin`
2. Ingresa la clave: `stefna-admin-2026`
3. Deberías ver el dashboard con tus clientes de prueba
4. Click en cualquier cliente para ver el detalle

---

## 6. Probar el Dashboard de cliente (2 minutos)

1. Ve a `stefna.app/dashboard`
2. Ingresa un email que esté registrado (ej: `hmelot@gmail.com`)
3. El sistema dice "revisa tu email" — pero el email aún no se envía
4. Para probar sin email: pídeme que genere un magic link manual para ti

---

## 7. Rotar tokens expuestos (5 minutos)

Los siguientes tokens se expusieron en el chat de la app. Hay que rotarlos:

- **GitHub PAT** (`ghp_dWPl...`): ya borrado ✅
- **Anthropic API Key** (`sk-ant-api03--ufZ...`): pendiente de revocar
  → `console.anthropic.com/settings/keys` → busca la key → Revoke → crea nueva

---

## Orden recomendado

1. Email Routing (no bloquea nada pero es básico)
2. Google Search Console (SEO empieza a contar desde que verificas)
3. MercadoPago (para cobros reales en /empezar)
4. Meta Business (proceso más largo, empiézalo ya)
5. Rotar Anthropic key (cuando vayas a activar el encargado WA)
