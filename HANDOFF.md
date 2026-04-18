# Stefna — Handoff Completo (17 abril 2026)

## Qué es Stefna
Plataforma que digitaliza PYMEs chilenas. Modelo: Stefna opera todo (web, SEO, WhatsApp, cobros) a cambio de suscripción mensual. El cliente no toca nada técnico. Max 50-100 clientes (boutique).

Primer cliente: Fernando — charcutería en Puerto Varas.

## URLs live
- **Landing**: https://stefna.app
- **Onboarding**: https://stefna.app/empezar (6 pasos)
- **Portal de Misión** (NUEVO): https://stefna.app/portal (Mission Control post-signup)
- **Dashboard cliente**: https://stefna.app/dashboard
- **Admin**: https://stefna.app/admin
- **Site preview público** (NUEVO): https://stefna-api.hmelot.workers.dev/site/:clientId
- **Worker API**: https://stefna-api.hmelot.workers.dev
- **GitHub**: https://github.com/hmelot/stefna

## Stack
- Next.js 15 + TypeScript (SSR via @cloudflare/next-on-pages)
- Cloudflare Pages (frontend) + Cloudflare Workers (API)
- Cloudflare D1 (SQLite) — database_id: ff5d63cb-c204-47a9-bcf1-185c9fa66a69
- Deploy: `npm run build:cf && npx wrangler pages deploy .vercel/output/static --project-name=stefna`
- Worker deploy: `cd worker && npx wrangler deploy`

## Estructura del repo
```
stefna/
├── app/
│   ├── page.tsx                    # Landing (Nav, Hero, DashboardMockup, Problem, BeforeAfter, HowItWorks, Cajas, ComparisonTable, Pricing, SocialProof, FAQ, Footer)
│   ├── empezar/page.tsx            # Onboarding 6 pasos
│   ├── dashboard/page.tsx          # Dashboard cliente (auth con magic link)
│   ├── admin/page.tsx              # Admin panel (auth con Bearer key)
│   ├── terminos/page.tsx           # Legal
│   ├── privacidad/page.tsx         # Legal
│   ├── charcuteria-puerto-varas/   # Página por rubro (SEO)
│   ├── panaderia-santiago/         # Página por rubro
│   ├── restaurante-santiago/       # Página por rubro
│   ├── cafe-valparaiso/            # Página por rubro
│   ├── peluqueria-santiago/        # Página por rubro
│   ├── taller-concepcion/          # Página por rubro
│   ├── tienda-santiago/            # Página por rubro
│   ├── components/
│   │   ├── Nav.tsx, Hero.tsx, Problem.tsx, HowItWorks.tsx
│   │   ├── Cajas.tsx (consumes lib/cajas.ts)
│   │   ├── Pricing.tsx (consumes lib/plans.ts)
│   │   ├── FAQ.tsx (with WA conversation example)
│   │   ├── Footer.tsx
│   │   ├── DashboardMockup.tsx (interactive mockup in hero)
│   │   ├── BeforeAfter.tsx, ComparisonTable.tsx, SocialProof.tsx
│   │   ├── FelipeBraun.tsx (Felipe Braun partnership section)
│   │   ├── WaBubble.tsx (shared WA message bubble)
│   │   ├── RubroLayout.tsx (shared layout for rubro pages)
│   │   ├── LegalLayout.tsx (shared layout for legal pages)
│   │   └── ui/Metric.tsx, ui/Panel.tsx
│   ├── _preview/
│   │   ├── AdminPreview.tsx (design reference, not routed)
│   │   └── DashboardPreview.tsx
│   ├── lib/
│   │   ├── types.ts (PlanId, CajaId, Industry, Status, WhatsappChannel)
│   │   ├── cajas.ts (CAJAS array — single source of truth, calcTotal, recommendedCajasFor)
│   │   ├── plans.ts (PLANS for landing pricing section)
│   │   ├── labels.ts (INDUSTRY_LABELS, WEEKDAYS)
│   │   ├── format.ts (formatCLP, statusColor, safeJsonLd)
│   │   ├── validation.ts (isValidEmail, isValidPhone)
│   │   └── constants.ts (API_URL, ONBOARDING_STORAGE_KEY)
│   ├── globals.css (design system, responsive, hover classes)
│   ├── layout.tsx (metadata, JSON-LD, next/font/google)
│   ├── brand.ts, manifesto.ts
│   └── BRAND.md
├── worker/
│   ├── src/index.ts (API: onboarding, auth, dashboard, admin + email notification)
│   ├── src/schema.sql (v1: clients, activity_log)
│   ├── src/schema-v2.sql (v2: + magic_links, sessions, conversations, orders, agent_configs, page_views)
│   └── wrangler.toml
├── worker-wa/
│   ├── src/index.ts (WhatsApp encargado — scaffold, NOT deployed, needs Meta creds)
│   └── wrangler.toml
├── public/ (_headers, robots.txt, sitemap.xml, llms.txt, logo.svg)
├── CLAUDE.md, BRAND.md
└── package.json (next@15, @cloudflare/next-on-pages)
```

## Identidad visual actual
- Fondo: #0a0a0a (negro cálido)
- Accent: #4A8A4A (verde Stefna)
- Tipografía: DM Serif Display (display) + DM Sans (UI) via next/font/google
- Design system en globals.css con CSS variables

## Modelo de precios (cajas modulares)
Todas las cajas son opcionales. Sin base forzada.
- Web: $89.000/mes
- SEO local: $59.000/mes
- Gestión pedidos WA: $89.000/mes (featured/recomendado)
- Redes sociales: $79.000/mes
- Cobros: $29.000/mes
- Panel de control: Gratis

## Onboarding (6 pasos)
1. **Cuenta**: nombre, email, WhatsApp
2. **Negocio**: nombre, rubro (10 opciones), ciudad, BSale checkbox
3. **WhatsApp + horarios**: canal WA, horarios, días, delivery
4. **Arma tu plan**: selector de cajas con recomendación por rubro, total sticky
5. **Personaliza** (NUEVO): template picker para web (4 estilos), catálogo/menú con precios (texto libre), zonas de delivery, descripción del negocio
6. **Resumen**: todos los datos + total → confirmar

## Worker API endpoints
- `POST /onboarding` — guarda cliente en D1, auto-crea agent_config si WA seleccionado, envía email a hmelot@gmail.com
- `GET /health` — status check
- `POST /auth/send-link` — envía magic link (TODO: conectar email real)
- `POST /auth/verify` — verifica token, crea sesión 24h
- `GET /auth/session` — valida sesión, retorna datos cliente
- `GET /dashboard/summary` — métricas semanales del cliente autenticado
- `GET /admin/stats` — MRR, total clientes (Bearer auth)
- `GET /admin/clients` — lista clientes (Bearer auth)
- `GET /admin/client/:id` — detalle + activity log (Bearer auth)

## D1 Tables (producción)
**v1**: clients, activity_log
**v2**: magic_links, sessions, conversations, orders, agent_configs, page_views
**v3** (NUEVO): onboarding_tasks, uploads, menu_items, pipeline_logs, site_previews

## Portal de Misión (/portal) — sistema de onboarding autónomo
El cliente entra via magic link 72h post-signup (auto-enviado por email).

**Flujo end-to-end:**
1. Cliente llena `/empezar` (6 pasos) → paga → datos en D1
2. Worker crea tareas automáticas según cajas compradas
3. Worker envía magic link con token hasheado (72h expiración)
4. Cliente click link → entra al Portal con sessionStorage
5. Ve checklist gamificado por caja con progress bar
6. Cada tarea completada dispara pipeline en background:
   - Upload fotos → CF Images direct upload
   - Upload menú → Claude Vision OCR (doble pasada) → menu_items table
   - Pick template + photos completo → site generation pipeline → staging URL
7. Portal muestra staging URL live cuando la web está generada

**Endpoints Worker para portal:**
- POST `/portal/upload-url` — pide one-time URL de CF Images
- POST `/portal/upload-complete` — registra upload, dispara OCR si kind=menu
- GET `/portal/tasks` — lista tareas + progress
- POST `/portal/task/:id/complete` — marca completa, dispara pipelines
- GET `/portal/uploads?kind=photo` — lista uploads del cliente
- GET `/portal/menu-items` — items extraídos
- POST `/portal/menu-items/:id` — editar/borrar item extraído
- POST `/portal/generate-site` — fuerza regen de staging
- GET `/portal/site-preview` — staging URL del cliente

**Pipelines:**
- `menu_ocr` — Claude Sonnet 4.5 + tool use + strict schema + double-pass (temp=0). Rules CLP chilenos ($12.900→12900). Confidence por item. Flags para human review si hay mismatches.
- `web_generate` — template + fotos + menu + horarios → HTML estático. 4 templates (minimal/modern/classic/bold). Servido en `/site/:clientId`.

**Secretos pendientes** (sin estos, features degradan con 503 "not configured"):
- 🔴 `ANTHROPIC_API_KEY` → sin esto no hay OCR de menús
- 🔴 `CF_ACCOUNT_ID` + `CF_IMAGES_TOKEN` + `CF_IMAGES_HASH` → sin esto no hay uploads
- Se configuran con: `npx wrangler secret put NOMBRE` en `/worker/`

## Lo que FALTA (bloqueantes marcados con 🔴)

### Producto
- 🔴 ANTHROPIC_API_KEY (secret del Worker) → sin esto no hay OCR de menús
- 🔴 CF Images habilitado + token + hash → sin esto no hay uploads de fotos
- 🔴 Meta Business verificada → sin esto no hay WhatsApp encargado real
- 🔴 MercadoPago token producción → sin esto no hay cobros
- 🔴 Email routing hola@stefna.app → hmelot@gmail.com (2 min en Cloudflare)
- 🔴 R2 habilitado (opcional — sólo para menús PDF, fotos ya van a CF Images)
- Magic link del portal ya se envía vía MailChannels (funciona)
- Dashboard cliente con datos reales (hoy usa mock data si no hay sesión)
- Google Search Console verificación
- Reminder automation: si cliente no completa tareas en 24h/48h/72h → enviar WA/email
- Preview/approval flow: /preview/[cliente_id] con auto-approve al día 4-7

### Landing
- Felipe Braun section ya existe (FelipeBraun.tsx) — revisar copy y diseño
- Dashboard mockup interactivo en hero (DashboardMockup.tsx) — tiene tabs clickeables

### Operación
- Proceso manual de setup post-signup (Horacio + Claude Code)
- No hay sistema de seguimiento automático (nurturing, reminders)
- No hay sistema de facturación recurrente

## Felipe Braun (partnership potencial)
- Actor chileno famoso, amigo de Horacio
- Tiene IA que genera videos con su imagen (se escaneó)
- Problema: muchas empresas le piden videos, no da abasto, le pagan con canje
- Propuesta: caja "Tu negocio en pantalla" ($179K/mes, Felipe se queda 85-90%)
- Es un CLOSER de ventas para Stefna, no un centro de profit
- Marketplace de canjes: proyecto separado, no mezclarlo con Stefna

## Contacto
Horacio Melo — hmelot@gmail.com
