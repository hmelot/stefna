# Stefna Worker — Secrets setup

Comandos para configurar los secretos necesarios. Ejecutar desde `/worker/`.

## Requeridos para OCR de menús

```bash
npx wrangler secret put ANTHROPIC_API_KEY
# Pegar la API key cuando pida (console.anthropic.com/settings/keys)
```

## Requeridos para uploads de fotos

Primero habilitar CF Images en el dashboard:
https://dash.cloudflare.com/?to=/:account/images/plans

Después obtener el account hash:
https://dash.cloudflare.com/?to=/:account/images/images
(aparece arriba como "Account ID" en la pestaña Images)

```bash
npx wrangler secret put CF_ACCOUNT_ID
# Tu account ID: 3a8a797174448655faf162fbd79c4b42

npx wrangler secret put CF_IMAGES_TOKEN
# Crear token en: https://dash.cloudflare.com/profile/api-tokens
# Permisos: Account > Cloudflare Images > Edit

npx wrangler secret put CF_IMAGES_HASH
# Pegar el account hash de la pestaña Images
```

## Requeridos para WhatsApp (cuando haya Meta verificada)

```bash
npx wrangler secret put META_VERIFY_TOKEN   # tu propio token arbitrario
npx wrangler secret put META_APP_SECRET     # del dashboard de Meta
npx wrangler secret put META_ACCESS_TOKEN   # token del WABA
```

## Verificar qué está configurado

```bash
npx wrangler secret list
```

## Crear named variants en CF Images (una vez)

En https://dash.cloudflare.com/?to=/:account/images/variants crear:
- `thumbnail`: 400x400, fit=cover, quality=80, format=auto
- `gallery`: 800x600, fit=cover, quality=85, format=auto
- `hero`: 1600x900, fit=cover, quality=85, format=auto
- `logo`: 400x400, fit=contain, format=auto, background=transparent
- `og`: 1200x630, fit=cover, quality=85, format=auto
- `public`: 1200x1200, fit=contain, quality=85, format=auto (default fallback)
