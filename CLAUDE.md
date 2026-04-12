# Stefna — Guía para Claude Code

## Contexto del proyecto
Stefna es una plataforma de presencia digital para PYMEs latinoamericanas.
Web + WhatsApp + cobros + SEO — operado 100% por Stefna. El cliente no toca nada.

**Leer siempre antes de trabajar:**
- `BRAND.md` — identidad visual, tono, paleta, tipografía, copy rules
- `app/manifesto.ts` — el manifiesto de la marca
- `app/brand.ts` — constantes de color y tipografía para código

## Stack
- Next.js 14 + TypeScript + `output: 'export'`
- Deploy: Cloudflare Pages via Wrangler
- Backend (pendiente): Cloudflare Workers + D1 + R2
- AI: Anthropic Claude API
- Pagos: MercadoPago
- WhatsApp: Meta Cloud API

## Comandos
```bash
npm run dev          # desarrollo local
npm run build        # build + copia mockups, robots.txt, llms.txt al output
npx wrangler pages deploy out --project-name=stefna
```

## Estructura
```
app/
  components/        # Nav, Hero, Problem, HowItWorks, Cajas, Pricing, Cases, FAQ, Footer
  page.tsx           # compone todo
  globals.css        # design system — colores y fuentes de BRAND.md
  manifesto.ts       # manifiesto completo
  brand.ts           # constantes de identidad
public/
  mockups/           # pantallas internas (protegidas con CF Access)
  _headers           # security headers
  robots.txt
  llms.txt
```

## Reglas de desarrollo
1. No hay secrets en código — usar `.env.local` o Cloudflare Secrets
2. Siempre correr build antes de deploy
3. Los mockups van en `/public/mockups/` y se copian al output manualmente
4. Rutas privadas (`/admin`, `/dashboard`, `/mockups`) tienen `noindex` en `_headers`
5. Nunca mencionar IA en copy visible al cliente — ver BRAND.md

## Identidad visual (resumen — ver BRAND.md para detalle)
- Negro cálido: `#0F0E0C`
- Verde Tompkins: `#003300` (3 negro : 2 verde — fórmula oficial Pumalín)
- Terracota: `#C17A5A`
- Fuente display: Libre Baskerville 700
- Fuente UI: Nunito 300/400/600

## Primer cliente
Fernando — La Charcutería, Puerto Varas.
El caso de Fernando es la prueba de concepto. Todo debe funcionar para él primero.

## Contacto
Horacio Melot — hmelot@gmail.com
