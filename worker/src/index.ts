/**
 * Stefna API Worker
 *
 * Handles:
 * - POST /onboarding — receives signup form data, stores in D1
 * - GET /health — status check
 *
 * Deployed to: stefna-api.workers.dev
 */

export interface Env {
  DB: D1Database
}

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://stefna.app',
  'https://stefna.co',
  'http://localhost:3000',
]

const VALID_INDUSTRIES = [
  'deli', 'restaurant', 'bakery', 'bar', 'retail',
  'beauty', 'workshop', 'services', 'education', 'other',
] as const

const VALID_WA_CHANNELS = ['existing', 'new'] as const

const VALID_CAJAS = ['web', 'seo', 'social', 'whatsapp', 'payments', 'dashboard'] as const

// Caja prices — must match app/lib/cajas.ts
const BASE_PRICE = 89_000
const CAJA_PRICES: Record<string, number> = {
  web: 0,
  seo: 59_000,
  whatsapp: 89_000,
  social: 79_000,
  payments: 29_000,
  dashboard: 0,
}

type OnboardingPayload = {
  name: string
  email: string
  whatsappPhone: string
  businessName: string
  industry: string
  city: string
  usesBSale: boolean
  whatsappChannel: string
  openTime: string
  closeTime: string
  days: string[]
  delivery: boolean
  cajas: string[]
}

function corsHeaders(origin: string | null): HeadersInit {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

function jsonResponse(data: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
  })
}

function validate(body: OnboardingPayload): string | null {
  if (!body.name?.trim()) return 'name is required'
  if (!body.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(body.email)) return 'valid email is required'
  if (!body.whatsappPhone?.trim() || body.whatsappPhone.trim().length < 8) return 'valid WhatsApp phone is required'
  if (!body.businessName?.trim()) return 'businessName is required'
  if (!VALID_INDUSTRIES.includes(body.industry as any)) return 'invalid industry'
  if (!body.city?.trim()) return 'city is required'
  if (!VALID_WA_CHANNELS.includes(body.whatsappChannel as any)) return 'invalid whatsappChannel'
  if (!body.openTime || !body.closeTime) return 'openTime and closeTime are required'
  if (!Array.isArray(body.days) || body.days.length === 0) return 'at least one day is required'
  if (!Array.isArray(body.cajas) || body.cajas.length === 0) return 'at least one caja is required'
  if (!body.cajas.every(c => VALID_CAJAS.includes(c as any))) return 'invalid caja in selection'
  return null
}

function calcTotal(cajas: string[]): number {
  return BASE_PRICE + cajas.reduce((sum, id) => sum + (CAJA_PRICES[id] || 0), 0)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin')

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    // Health check
    if (url.pathname === '/health' && request.method === 'GET') {
      return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() }, 200, origin)
    }

    // Onboarding
    if (url.pathname === '/onboarding' && request.method === 'POST') {
      let body: OnboardingPayload
      try {
        body = await request.json()
      } catch {
        return jsonResponse({ error: 'Invalid JSON body' }, 400, origin)
      }

      const validationError = validate(body)
      if (validationError) {
        return jsonResponse({ error: validationError }, 422, origin)
      }

      const monthlyTotal = calcTotal(body.cajas)

      try {
        // Check for duplicate email
        const existing = await env.DB.prepare('SELECT id FROM clients WHERE email = ?').bind(body.email.trim().toLowerCase()).first()
        if (existing) {
          return jsonResponse({ error: 'Este email ya tiene una cuenta registrada.' }, 409, origin)
        }

        // Insert client
        const result = await env.DB.prepare(`
          INSERT INTO clients (name, email, whatsapp_phone, business_name, industry, city, uses_bsale, whatsapp_channel, open_time, close_time, days, delivery, cajas, monthly_total)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          body.name.trim(),
          body.email.trim().toLowerCase(),
          body.whatsappPhone.trim(),
          body.businessName.trim(),
          body.industry,
          body.city.trim(),
          body.usesBSale ? 1 : 0,
          body.whatsappChannel,
          body.openTime,
          body.closeTime,
          body.days.join(','),
          body.delivery ? 1 : 0,
          JSON.stringify(body.cajas),
          monthlyTotal,
        ).run()

        const clientId = result.meta.last_row_id

        // Log the signup
        await env.DB.prepare(`
          INSERT INTO activity_log (client_id, action, details) VALUES (?, 'signup', ?)
        `).bind(clientId, JSON.stringify({
          cajas: body.cajas,
          monthly_total: monthlyTotal,
          source: origin || 'unknown',
        })).run()

        return jsonResponse({
          ok: true,
          clientId,
          monthlyTotal,
          message: `Registro recibido. Te contactamos por WhatsApp pronto.`,
        }, 201, origin)

      } catch (err: any) {
        console.error('DB error:', err)
        return jsonResponse({ error: 'Error interno. Intenta de nuevo.' }, 500, origin)
      }
    }

    // 404 for everything else
    return jsonResponse({ error: 'Not found' }, 404, origin)
  },
}
