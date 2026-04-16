# Stefna — Handoff Completo (16 abril 2026)

## Qué es Stefna
Plataforma que digitaliza PYMEs chilenas. Modelo: Stefna opera todo (web, SEO, WhatsApp, cobros) a cambio de suscripción mensual. El cliente no toca nada técnico. Max 50-100 clientes (boutique).

Primer cliente: Fernando — charcutería en Puerto Varas.

## URLs live
- **Landing**: https://stefna.app
- **Onboarding**: https://stefna.app/empezar (6 pasos)
- **Dashboard cliente**: https://stefna.app/dashboard
- **Admin**: https://stefna.app/admin
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
clients, activity_log, magic_links, sessions, conversations, orders, agent_configs, page_views

## Lo que FALTA (bloqueantes marcados con 🔴)

### Producto
- 🔴 Meta Business verificada → sin esto no hay WhatsApp encargado real
- 🔴 MercadoPago token producción → sin esto no hay cobros
- 🔴 Email routing hola@stefna.app → hmelot@gmail.com (2 min en Cloudflare)
- Magic link email real (hoy solo se loguea en console, no envía email)
- Dashboard cliente con datos reales (hoy usa mock data si no hay sesión)
- Google Search Console verificación

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
