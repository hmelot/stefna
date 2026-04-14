/**
 * Stefna API Worker
 *
 * Handles:
 * - POST /onboarding — receives signup form data, stores in D1, sends notification
 * - GET  /health — status check
 * - GET  /admin/clients — list all clients (auth required)
 * - GET  /admin/stats — MRR, client count, recent signups (auth required)
 *
 * Deployed to: stefna-api.hmelot.workers.dev
 */

export interface Env {
  DB: D1Database
  ENVIRONMENT?: string       // 'production' | 'development'
  ADMIN_KEY?: string         // Secret key for admin endpoints
  NOTIFICATION_EMAIL?: string // Where to send signup notifications
}

// ── CORS ──

function getAllowedOrigins(env: Env): string[] {
  const origins = ['https://stefna.app', 'https://stefna.co']
  if (env.ENVIRONMENT !== 'production') origins.push('http://localhost:3000')
  return origins
}

function corsHeaders(origin: string | null, allowedOrigins: string[]): HeadersInit {
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

function jsonResponse(data: unknown, status: number, origin: string | null, ao: string[]): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin, ao) },
  })
}

// ── Validation ──

const VALID_INDUSTRIES = [
  'deli', 'restaurant', 'bakery', 'bar', 'retail',
  'beauty', 'workshop', 'services', 'education', 'other',
] as const

const VALID_WA_CHANNELS = ['existing', 'new'] as const
const VALID_CAJAS = ['web', 'seo', 'social', 'whatsapp', 'payments', 'dashboard'] as const

// Caja prices — must match app/lib/cajas.ts (all cajas optional, no forced base)
const CAJA_PRICES: Record<string, number> = {
  web: 89_000, seo: 59_000, whatsapp: 89_000, social: 79_000, payments: 29_000, dashboard: 0,
}

const MAX_LEN = { name: 200, email: 254, phone: 20, businessName: 200, city: 100, time: 5 }
const PHONE_RE = /^\+?[\d\s\-()]{8,20}$/

type OnboardingPayload = {
  name: string; email: string; whatsappPhone: string; businessName: string
  industry: string; city: string; usesBSale: boolean; whatsappChannel: string
  openTime: string; closeTime: string; days: string[]; delivery: boolean; cajas: string[]
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
  return cajas.reduce((sum, id) => sum + (CAJA_PRICES[id] || 0), 0)
}

function formatCLP(n: number): string {
  return '$' + n.toLocaleString('es-CL')
}

// ── Rate Limiting ──

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW = 60_000
let rateLimitCallCount = 0

function isRateLimited(ip: string): boolean {
  const now = Date.now()
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

// ── Admin Auth ──

function isAdmin(request: Request, env: Env): boolean {
  const key = env.ADMIN_KEY
  if (!key) return false
  const auth = request.headers.get('Authorization')
  return auth === `Bearer ${key}`
}

// ── Notification ──

async function notifySignup(body: OnboardingPayload, monthlyTotal: number, clientId: number | bigint): Promise<void> {
  // Send notification via console log for now.
  // When email service is configured, this will send to NOTIFICATION_EMAIL.
  // For now, the admin can check /admin/clients.
  console.log(`[SIGNUP] #${clientId} | ${body.businessName} (${body.industry}) | ${body.name} | ${body.whatsappPhone} | ${body.city} | ${formatCLP(monthlyTotal)}/mes | cajas: ${body.cajas.join(',')}`)
}

// ── Routes ──

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin')
    const ao = getAllowedOrigins(env)

    // Reject cross-origin POST from disallowed origins
    if (request.method === 'POST' && origin && !ao.includes(origin)) {
      return jsonResponse({ error: 'Forbidden' }, 403, origin, ao)
    }

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin, ao) })
    }

    // ── GET /health ──
    if (url.pathname === '/health' && request.method === 'GET') {
      return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() }, 200, origin, ao)
    }

    // ── POST /onboarding ──
    if (url.pathname === '/onboarding' && request.method === 'POST') {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
      if (isRateLimited(ip)) {
        return jsonResponse({ error: 'Demasiados intentos. Espera un momento.' }, 429, origin, ao)
      }

      let body: OnboardingPayload
      try { body = await request.json() }
      catch { return jsonResponse({ error: 'Invalid JSON body' }, 400, origin, ao) }

      const validationError = validate(body)
      if (validationError) return jsonResponse({ error: validationError }, 422, origin, ao)

      const monthlyTotal = calcTotal(body.cajas)

      try {
        const email = body.email.trim().toLowerCase()

        // Duplicate check — generic response to prevent enumeration
        const existing = await env.DB.prepare('SELECT id FROM clients WHERE email = ?').bind(email).first()
        if (existing) {
          return jsonResponse({ ok: true, message: 'Registro recibido. Te contactamos por WhatsApp pronto.' }, 201, origin, ao)
        }

        const result = await env.DB.prepare(`
          INSERT INTO clients (name, email, whatsapp_phone, business_name, industry, city, uses_bsale, whatsapp_channel, open_time, close_time, days, delivery, cajas, monthly_total)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          body.name.trim().slice(0, MAX_LEN.name), email,
          body.whatsappPhone.trim().slice(0, MAX_LEN.phone),
          body.businessName.trim().slice(0, MAX_LEN.businessName),
          body.industry, body.city.trim().slice(0, MAX_LEN.city),
          body.usesBSale ? 1 : 0, body.whatsappChannel,
          body.openTime.slice(0, MAX_LEN.time), body.closeTime.slice(0, MAX_LEN.time),
          body.days.slice(0, 7).join(','), body.delivery ? 1 : 0,
          JSON.stringify(body.cajas), monthlyTotal,
        ).run()

        const clientId = result.meta.last_row_id

        // Audit log
        try {
          await env.DB.prepare('INSERT INTO activity_log (client_id, action, details) VALUES (?, ?, ?)')
            .bind(clientId, 'signup', JSON.stringify({ cajas: body.cajas, monthly_total: monthlyTotal, source: origin || 'unknown' }))
            .run()
        } catch (e) { console.error('Activity log error:', e) }

        // Notify (non-blocking)
        notifySignup(body, monthlyTotal, clientId!)

        return jsonResponse({ ok: true, clientId, monthlyTotal, message: 'Registro recibido. Te contactamos por WhatsApp pronto.' }, 201, origin, ao)
      } catch (err: any) {
        console.error('DB error:', err)
        return jsonResponse({ error: 'Error interno. Intenta de nuevo.' }, 500, origin, ao)
      }
    }

    // ── GET /admin/clients ──
    if (url.pathname === '/admin/clients' && request.method === 'GET') {
      if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401, origin, ao)

      const { results } = await env.DB.prepare(
        'SELECT id, name, email, whatsapp_phone, business_name, industry, city, cajas, monthly_total, status, payment_status, created_at FROM clients ORDER BY created_at DESC LIMIT 100'
      ).all()

      return jsonResponse({ clients: results }, 200, origin, ao)
    }

    // ── GET /admin/stats ──
    if (url.pathname === '/admin/stats' && request.method === 'GET') {
      if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401, origin, ao)

      const countResult = await env.DB.prepare('SELECT COUNT(*) as total FROM clients').first<{ total: number }>()
      const mrrResult = await env.DB.prepare("SELECT COALESCE(SUM(monthly_total), 0) as mrr FROM clients WHERE status != 'cancelled'").first<{ mrr: number }>()
      const recentResult = await env.DB.prepare('SELECT id, business_name, industry, city, monthly_total, created_at FROM clients ORDER BY created_at DESC LIMIT 5').all()
      const todayResult = await env.DB.prepare("SELECT COUNT(*) as today FROM clients WHERE created_at >= date('now')").first<{ today: number }>()

      return jsonResponse({
        totalClients: countResult?.total ?? 0,
        mrr: mrrResult?.mrr ?? 0,
        mrrFormatted: formatCLP(mrrResult?.mrr ?? 0),
        signupsToday: todayResult?.today ?? 0,
        recentSignups: recentResult.results,
      }, 200, origin, ao)
    }

    // ── GET /admin/client/:id ──
    if (url.pathname.startsWith('/admin/client/') && request.method === 'GET') {
      if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401, origin, ao)

      const id = url.pathname.split('/').pop()
      const client = await env.DB.prepare('SELECT * FROM clients WHERE id = ?').bind(id).first()
      if (!client) return jsonResponse({ error: 'Client not found' }, 404, origin, ao)

      const { results: logs } = await env.DB.prepare('SELECT * FROM activity_log WHERE client_id = ? ORDER BY created_at DESC LIMIT 50').bind(id).all()

      return jsonResponse({ client, activityLog: logs }, 200, origin, ao)
    }

    return jsonResponse({ error: 'Not found' }, 404, origin, ao)
  },
}
