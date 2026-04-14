/**
 * Stefna API Worker
 *
 * Handles:
 * - POST /onboarding — receives signup form data, stores in D1
 * - GET /health — status check
 *
 * Deployed to: stefna-api.hmelot.workers.dev
 */

export interface Env {
  DB: D1Database
  ENVIRONMENT?: string // 'production' | 'development'
}

// Allowed origins for CORS — localhost only in dev
function getAllowedOrigins(env: Env): string[] {
  const origins = ['https://stefna.app', 'https://stefna.co']
  if (env.ENVIRONMENT !== 'production') origins.push('http://localhost:3000')
  return origins
}

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

// Max field lengths to prevent payload abuse
const MAX_LEN = { name: 200, email: 254, phone: 20, businessName: 200, city: 100, time: 5 }

// Simple IP-based rate limiter (in-memory, resets on Worker restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5 // max requests
const RATE_WINDOW = 60_000 // per 60 seconds

let rateLimitCallCount = 0

function isRateLimited(ip: string): boolean {
  const now = Date.now()

  // Prune expired entries every 50 calls to prevent unbounded growth
  if (++rateLimitCallCount % 50 === 0) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetAt) rateLimitMap.delete(key)
    }
  }

  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT
}

const PHONE_RE = /^\+?[\d\s\-()]{8,20}$/

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

function corsHeaders(origin: string | null, allowedOrigins: string[]): HeadersInit {
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

function jsonResponse(data: unknown, status: number, origin: string | null, allowedOrigins: string[]): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin, allowedOrigins),
    },
  })
}

function validate(body: OnboardingPayload): string | null {
  if (!body.name?.trim() || body.name.length > MAX_LEN.name) return 'name is required (max 200 chars)'
  if (!body.email?.trim() || body.email.length > MAX_LEN.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(body.email)) return 'valid email is required'
  if (!body.whatsappPhone?.trim() || !PHONE_RE.test(body.whatsappPhone.trim())) return 'valid WhatsApp phone is required'
  if (!body.businessName?.trim() || body.businessName.length > MAX_LEN.businessName) return 'businessName is required (max 200 chars)'
  if (!VALID_INDUSTRIES.includes(body.industry as any)) return 'invalid industry'
  if (!body.city?.trim() || body.city.length > MAX_LEN.city) return 'city is required (max 100 chars)'
  if (!VALID_WA_CHANNELS.includes(body.whatsappChannel as any)) return 'invalid whatsappChannel'
  if (!body.openTime || body.openTime.length > MAX_LEN.time || !body.closeTime || body.closeTime.length > MAX_LEN.time) return 'openTime and closeTime are required'
  if (!Array.isArray(body.days) || body.days.length === 0 || body.days.length > 7) return 'between 1 and 7 days required'
  if (!Array.isArray(body.cajas) || body.cajas.length === 0 || body.cajas.length > VALID_CAJAS.length) return 'at least one caja is required'
  if (!body.cajas.every(c => VALID_CAJAS.includes(c as any))) return 'invalid caja in selection'
  return null
}

function calcTotal(cajas: string[]): number {
  return BASE_PRICE + cajas.filter(id => id !== 'web').reduce((sum, id) => sum + (CAJA_PRICES[id] || 0), 0)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin')
    const allowedOrigins = getAllowedOrigins(env)

    // Reject requests from disallowed origins on POST
    if (request.method === 'POST' && origin && !allowedOrigins.includes(origin)) {
      return jsonResponse({ error: 'Forbidden' }, 403, origin, allowedOrigins)
    }

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin, allowedOrigins) })
    }

    // Health check
    if (url.pathname === '/health' && request.method === 'GET') {
      return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() }, 200, origin, allowedOrigins)
    }

    // Onboarding
    if (url.pathname === '/onboarding' && request.method === 'POST') {
      // Rate limiting
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
      if (isRateLimited(ip)) {
        return jsonResponse({ error: 'Demasiados intentos. Espera un momento.' }, 429, origin, allowedOrigins)
      }

      let body: OnboardingPayload
      try {
        body = await request.json()
      } catch {
        return jsonResponse({ error: 'Invalid JSON body' }, 400, origin, allowedOrigins)
      }

      const validationError = validate(body)
      if (validationError) {
        return jsonResponse({ error: validationError }, 422, origin, allowedOrigins)
      }

      const monthlyTotal = calcTotal(body.cajas)

      try {
        const email = body.email.trim().toLowerCase()

        // Check for duplicate — return generic success to prevent email enumeration
        const existing = await env.DB.prepare('SELECT id FROM clients WHERE email = ?').bind(email).first()
        if (existing) {
          // Same response as success — don't reveal whether email exists
          return jsonResponse({
            ok: true,
            message: 'Registro recibido. Te contactamos por WhatsApp pronto.',
          }, 201, origin, allowedOrigins)
        }

        const insertClient = env.DB.prepare(`
          INSERT INTO clients (name, email, whatsapp_phone, business_name, industry, city, uses_bsale, whatsapp_channel, open_time, close_time, days, delivery, cajas, monthly_total)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          body.name.trim().slice(0, MAX_LEN.name),
          email,
          body.whatsappPhone.trim().slice(0, MAX_LEN.phone),
          body.businessName.trim().slice(0, MAX_LEN.businessName),
          body.industry,
          body.city.trim().slice(0, MAX_LEN.city),
          body.usesBSale ? 1 : 0,
          body.whatsappChannel,
          body.openTime.slice(0, MAX_LEN.time),
          body.closeTime.slice(0, MAX_LEN.time),
          body.days.slice(0, 7).join(','),
          body.delivery ? 1 : 0,
          JSON.stringify(body.cajas),
          monthlyTotal,
        )

        const clientResult = await insertClient.run()
        const clientId = clientResult.meta.last_row_id

        // Log signup — await to ensure audit trail
        try {
          await env.DB.prepare(`
            INSERT INTO activity_log (client_id, action, details) VALUES (?, 'signup', ?)
          `).bind(clientId, JSON.stringify({
            cajas: body.cajas,
            monthly_total: monthlyTotal,
            source: origin || 'unknown',
          })).run()
        } catch (logErr) {
          console.error('Activity log error:', logErr)
        }

        return jsonResponse({
          ok: true,
          clientId,
          monthlyTotal,
          message: 'Registro recibido. Te contactamos por WhatsApp pronto.',
        }, 201, origin, allowedOrigins)

      } catch (err: any) {
        console.error('DB error:', err)
        return jsonResponse({ error: 'Error interno. Intenta de nuevo.' }, 500, origin, allowedOrigins)
      }
    }

    // 404 for everything else
    return jsonResponse({ error: 'Not found' }, 404, origin, allowedOrigins)
  },
}
