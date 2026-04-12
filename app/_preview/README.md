# `_preview/` — not-yet-routed app surfaces

This directory uses the `_` prefix so Next.js App Router **does not emit any routes** from its contents. Files here are imported manually during development but never ship as public URLs.

## Why these are not in `app/dashboard` or `app/admin`

The marketing site at `stefna.app` is a static export (`output: 'export'`). Static export has no middleware and no server-side auth, so anything under `app/dashboard/page.tsx` would be a publicly reachable HTML file. For a product surface that will eventually render real PII (client data, MRR, pedidos), that is an unacceptable architectural shortcut.

The plan is:

- `stefna.app` — this repo, public marketing + `/empezar` onboarding (static)
- `app.stefna.app` — separate app with server-side auth, SSR, session cookies
- `admin.stefna.app` — separate app gated behind Cloudflare Access SSO

The `DashboardPreview` and `AdminPreview` files here are design/UX references for when those apps get built. Do not import them from any routed page.
