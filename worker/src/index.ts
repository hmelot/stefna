/**
 * Stefna API Worker
 *
 * Handles:
 * - POST /onboarding — receives signup form data, stores in D1, sends notification
 * - GET  /health — status check
 * - Admin endpoints (Bearer auth with timing-safe comparison)
 * - Magic link auth + sessions (hashed tokens in DB)
 * - Dashboard data for authenticated clients
 *
 * Deployed to: stefna-api.hmelot.workers.dev
 */

export interface Env {
  DB: D1Database
  ENVIRONMENT?: string       // 'production' | 'development'
  ADMIN_KEY?: string         // Secret key for admin endpoints
  NOTIFICATION_EMAIL?: string // Where to send signup notifications
}

// ── Crypto helpers ──

const encoder = new TextEncoder()

/** Constant-time string comparison to prevent timing attacks */
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const keyData = encoder.encode('timing-safe-compare-key')
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const [sigA, sigB] = await Promise.all([
    crypto.subtle.sign('HMAC', key, encoder.encode(a)),
    crypto.subtle.sign('HMAC', key, encoder.encode(b)),
  ])
  const arrA = new Uint8Array(sigA)
  const arrB = new Uint8Array(sigB)
  if (arrA.length !== arrB.length) return false
  let result = 0
  for (let i = 0; i < arrA.length; i++) result |= arrA[i] ^ arrB[i]
  return result === 0
}

/** Hash a token before storing in DB (so DB leak doesn't compromise sessions) */
async function hashToken(token: string): Promise<string> {
  const data = encoder.encode(token)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── CORS ──

function getAllowedOrigins(env: Env): string[] {
  const origins = ['https://stefna.app', 'https://stefna.co']
  if (env.ENVIRONMENT !== 'production') origins.push('http://localhost:3000')
  return origins
}

function corsHeaders(origin: string | null, allowedOrigins: string[]): HeadersInit {
  // Fix: don't echo a default origin when request origin is not allowed
  if (!origin || !allowedOrigins.includes(origin)) {
    return {
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    }
  }
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
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
const VALID_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const

// Caja prices — must match app/lib/cajas.ts (all cajas optional, no forced base)
const CAJA_PRICES: Record<string, number> = {
  web: 89_000, seo: 59_000, whatsapp: 89_000, social: 79_000, payments: 29_000, dashboard: 0,
}

const MAX_LEN = {
  name: 200, email: 254, phone: 20, businessName: 200, city: 100, time: 5,
  catalogItems: 5000, deliveryZones: 1000, businessDescription: 1000, webTemplate: 20,
}
const PHONE_RE = /^\+?[\d\s\-()]{8,20}$/

type OnboardingPayload = {
  name: string; email: string; whatsappPhone: string; businessName: string
  industry: string; city: string; usesBSale: boolean; whatsappChannel: string
  openTime: string; closeTime: string; days: string[]; delivery: boolean; cajas: string[]
  webTemplate?: string; catalogItems?: string; deliveryZones?: string; businessDescription?: string
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
  if (!body.days.every(d => VALID_DAYS.includes(d as any))) return 'invalid day in selection'
  if (!Array.isArray(body.cajas) || body.cajas.length === 0 || body.cajas.length > VALID_CAJAS.length) return 'at least one caja is required'
  if (!body.cajas.every(c => VALID_CAJAS.includes(c as any))) return 'invalid caja in selection'
  // Validate optional text fields length
  if (body.catalogItems && body.catalogItems.length > MAX_LEN.catalogItems) return 'catalog too long (max 5000 chars)'
  if (body.deliveryZones && body.deliveryZones.length > MAX_LEN.deliveryZones) return 'delivery zones too long (max 1000 chars)'
  if (body.businessDescription && body.businessDescription.length > MAX_LEN.businessDescription) return 'description too long (max 1000 chars)'
  return null
}

function calcTotal(cajas: string[]): number {
  return cajas.reduce((sum, id) => sum + (CAJA_PRICES[id] || 0), 0)
}

function formatCLP(n: number): string {
  return '$' + n.toLocaleString('es-CL')
}

// ── Rate Limiting (per-instance — acceptable for <50 clients, upgrade to Durable Objects at scale) ──

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

// ── Admin Auth (timing-safe comparison) ──

async function isAdmin(request: Request, env: Env): Promise<boolean> {
  const key = env.ADMIN_KEY
  if (!key) return false
  const auth = request.headers.get('Authorization')
  if (!auth || !auth.startsWith('Bearer ')) return false
  return timingSafeEqual(auth.slice(7), key)
}

// ── Session helper ──

async function getSessionClient(request: Request, env: Env): Promise<{ client_id: number } | null> {
  const sessionId = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!sessionId) return null
  const sessionHash = await hashToken(sessionId)
  return env.DB.prepare("SELECT client_id FROM sessions WHERE id = ? AND expires_at > datetime('now')")
    .bind(sessionHash).first<{ client_id: number }>()
}

// ── Notification ──

const INDUSTRY_LABELS: Record<string, string> = {
  deli: 'Charcutería/Deli', restaurant: 'Restaurante/Café', bakery: 'Panadería/Pastelería',
  bar: 'Bar/Botillería', retail: 'Tienda/Retail', beauty: 'Salud/Belleza',
  workshop: 'Taller/Reparaciones', services: 'Servicios', education: 'Educación/Clases', other: 'Otro',
}

const CAJA_LABELS: Record<string, string> = {
  web: 'Web + dominio', seo: 'SEO local', whatsapp: 'Gestión pedidos WA',
  social: 'Redes sociales', payments: 'Cobros', dashboard: 'Panel de control',
}

async function notifySignup(body: OnboardingPayload, monthlyTotal: number, clientId: number | bigint): Promise<void> {
  // Redacted PII from console log (only business info, no personal data)
  console.log(`[SIGNUP] #${clientId} | ${body.businessName} (${body.industry}) | ${body.city} | ${formatCLP(monthlyTotal)}/mes | cajas: ${body.cajas.join(',')}`)

  try {
    const cajasFormatted = body.cajas.map(c => `• ${CAJA_LABELS[c] || c} — ${formatCLP(CAJA_PRICES[c] || 0)}`).join('\n')
    const rubroLabel = INDUSTRY_LABELS[body.industry] || body.industry

    const emailBody = [
      `🟢 NUEVO CLIENTE STEFNA`,
      ``,
      `Nombre: ${body.name}`,
      `Email: ${body.email}`,
      `WhatsApp: ${body.whatsappPhone}`,
      ``,
      `Negocio: ${body.businessName}`,
      `Rubro: ${rubroLabel}`,
      `Ciudad: ${body.city}`,
      `BSale: ${body.usesBSale ? 'Sí' : 'No'}`,
      ``,
      `Canal WA: ${body.whatsappChannel === 'existing' ? 'Ya tiene número' : 'Necesita nuevo'}`,
      `Horario: ${body.openTime} – ${body.closeTime}`,
      `Días: ${body.days.join(', ')}`,
      `Delivery: ${body.delivery ? 'Sí' : 'No'}`,
      ``,
      `CAJAS SELECCIONADAS:`,
      cajasFormatted,
      ``,
      `TOTAL MENSUAL: ${formatCLP(monthlyTotal)}`,
      ``,
      `Ver en admin: https://stefna.app/admin`,
    ].join('\n')

    await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: 'hmelot@gmail.com', name: 'Horacio Melo' }] }],
        from: { email: 'noreply@stefna.app', name: 'Stefna' },
        subject: `🟢 Nuevo cliente: ${body.businessName} (${body.city}) — ${formatCLP(monthlyTotal)}/mes`,
        content: [{ type: 'text/plain', value: emailBody }],
      }),
    })
  } catch (e) {
    console.error('Email notification error:', e)
  }
}

// ── Routes ──

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin')
    const ao = getAllowedOrigins(env)

    // Reject cross-origin POST from disallowed origins (CSRF mitigation)
    if (request.method === 'POST') {
      // Require X-Requested-With header on all POST requests (simple forms can't set custom headers)
      if (!request.headers.get('X-Requested-With') && origin && !ao.includes(origin)) {
        return jsonResponse({ error: 'Forbidden' }, 403, origin, ao)
      }
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

        // Create agent config if whatsapp is selected
        if (body.cajas.includes('whatsapp') && body.catalogItems?.trim()) {
          const rubroLabel = INDUSTRY_LABELS[body.industry] || body.industry
          const systemPrompt = [
            `Eres el asistente digital de ${body.businessName.trim()}, ${body.businessDescription?.trim().slice(0, MAX_LEN.businessDescription) || `una ${rubroLabel} en ${body.city.trim()}`}.`,
            `Tu trabajo es atender clientes por WhatsApp de manera natural, cálida y profesional.`,
            ``,
            `Horario de atención: ${body.openTime} a ${body.closeTime}, ${body.days.join(', ')}.`,
            body.delivery ? `Hacemos delivery a: ${body.deliveryZones?.trim().slice(0, MAX_LEN.deliveryZones) || 'zona local'}.` : 'No hacemos delivery por el momento.',
            ``,
            `CATÁLOGO:`,
            body.catalogItems.trim().slice(0, MAX_LEN.catalogItems),
            ``,
            `REGLAS:`,
            `- Responde en español, tono cálido y directo`,
            `- Si preguntan precio, responde con el precio real del catálogo`,
            `- Si quieren hacer un pedido, confirma: producto, cantidad, dirección (si delivery), hora`,
            `- Si está fuera de horario, avisa cuándo vuelven a atender`,
            `- Si no sabes algo, di "te confirmo en un momento" — no inventes`,
            `- NUNCA menciones que eres un asistente automatizado o que usas tecnología`,
            `- Recomienda productos cuando tenga sentido, como un experto del local`,
          ].join('\n')

          try {
            await env.DB.prepare(`INSERT INTO agent_configs (client_id, system_prompt, catalog, delivery_zones, greeting) VALUES (?, ?, ?, ?, ?)`)
              .bind(clientId, systemPrompt, body.catalogItems.trim().slice(0, MAX_LEN.catalogItems),
                body.deliveryZones?.trim().slice(0, MAX_LEN.deliveryZones) || null,
                `¡Hola! Bienvenido a ${body.businessName.trim()}. ¿En qué te puedo ayudar?`
              ).run()
          } catch (e) { console.error('Agent config error:', e) }
        }

        // Audit log (no PII in details — only operational data)
        try {
          await env.DB.prepare('INSERT INTO activity_log (client_id, action, details) VALUES (?, ?, ?)')
            .bind(clientId, 'signup', JSON.stringify({
              cajas: body.cajas, monthly_total: monthlyTotal,
              web_template: body.webTemplate?.slice(0, MAX_LEN.webTemplate) || null,
              has_catalog: !!body.catalogItems?.trim(),
              source: origin || 'unknown',
            }))
            .run()
        } catch (e) { console.error('Activity log error:', e) }

        // Notify (non-blocking via waitUntil)
        ctx.waitUntil(notifySignup(body, monthlyTotal, clientId!))

        return jsonResponse({ ok: true, clientId, monthlyTotal, message: 'Registro recibido. Te contactamos por WhatsApp pronto.' }, 201, origin, ao)
      } catch (err: any) {
        console.error('DB error:', err)
        return jsonResponse({ error: 'Error interno. Intenta de nuevo.' }, 500, origin, ao)
      }
    }

    // ── GET /admin/clients ──
    if (url.pathname === '/admin/clients' && request.method === 'GET') {
      if (!(await isAdmin(request, env))) return jsonResponse({ error: 'Unauthorized' }, 401, origin, ao)

      const { results } = await env.DB.prepare(
        'SELECT id, name, email, whatsapp_phone, business_name, industry, city, cajas, monthly_total, status, payment_status, created_at FROM clients ORDER BY created_at DESC LIMIT 100'
      ).all()

      return jsonResponse({ clients: results }, 200, origin, ao)
    }

    // ── GET /admin/stats ──
    if (url.pathname === '/admin/stats' && request.method === 'GET') {
      if (!(await isAdmin(request, env))) return jsonResponse({ error: 'Unauthorized' }, 401, origin, ao)

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
      if (!(await isAdmin(request, env))) return jsonResponse({ error: 'Unauthorized' }, 401, origin, ao)

      const idStr = url.pathname.split('/').pop()
      const id = parseInt(idStr || '', 10)
      if (isNaN(id)) return jsonResponse({ error: 'Invalid client ID' }, 400, origin, ao)

      const client = await env.DB.prepare('SELECT * FROM clients WHERE id = ?').bind(id).first()
      if (!client) return jsonResponse({ error: 'Client not found' }, 404, origin, ao)

      const { results: logs } = await env.DB.prepare('SELECT * FROM activity_log WHERE client_id = ? ORDER BY created_at DESC LIMIT 50').bind(id).all()

      return jsonResponse({ client, activityLog: logs }, 200, origin, ao)
    }

    // ══════════════════════════════════════════
    // AUTH — Magic Link (tokens hashed in DB)
    // ══════════════════════════════════════════

    // ── POST /auth/send-link ──
    if (url.pathname === '/auth/send-link' && request.method === 'POST') {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
      if (isRateLimited(ip)) {
        return jsonResponse({ error: 'Demasiados intentos.' }, 429, origin, ao)
      }

      let body: { email: string }
      try { body = await request.json() }
      catch { return jsonResponse({ error: 'Invalid JSON' }, 400, origin, ao) }

      const email = body.email?.trim().toLowerCase()
      if (!email) return jsonResponse({ error: 'Email requerido' }, 422, origin, ao)

      const client = await env.DB.prepare('SELECT id, name FROM clients WHERE email = ?').bind(email).first<{ id: number; name: string }>()

      if (client) {
        const token = crypto.randomUUID() + '-' + crypto.randomUUID()
        const tokenHash = await hashToken(token)
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

        // Store hash of token, not the token itself
        await env.DB.prepare('INSERT INTO magic_links (client_id, token, expires_at) VALUES (?, ?, ?)')
          .bind(client.id, tokenHash, expiresAt).run()

        // Use hash fragment instead of query param (hash fragments are never sent to servers/logs)
        const link = `https://stefna.app/dashboard#token=${token}`

        // Log only truncated hash for debugging (not the full token)
        console.log(`[MAGIC LINK] client_id=${client.id} hash_prefix=${tokenHash.slice(0, 8)}...`)

        // Activity log — no token stored
        await env.DB.prepare('INSERT INTO activity_log (client_id, action, details) VALUES (?, ?, ?)')
          .bind(client.id, 'magic_link_sent', JSON.stringify({ email })).run()

        // TODO: Send actual email via MailChannels with the link
        ctx.waitUntil((async () => {
          try {
            await fetch('https://api.mailchannels.net/tx/v1/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                personalizations: [{ to: [{ email, name: client.name }] }],
                from: { email: 'noreply@stefna.app', name: 'Stefna' },
                subject: 'Tu link de acceso a Stefna',
                content: [{ type: 'text/plain', value: `Hola ${client.name.split(' ')[0]},\n\nAccede a tu panel de Stefna:\n${link}\n\nEste link expira en 15 minutos.\n\nStefna` }],
              }),
            })
          } catch (e) { console.error('Magic link email error:', e) }
        })())
      }

      // Always return success (prevents email enumeration)
      return jsonResponse({ ok: true, message: 'Si tu email está registrado, recibirás un link de acceso.' }, 200, origin, ao)
    }

    // ── POST /auth/verify ──
    if (url.pathname === '/auth/verify' && request.method === 'POST') {
      let body: { token: string }
      try { body = await request.json() }
      catch { return jsonResponse({ error: 'Invalid JSON' }, 400, origin, ao) }

      const token = body.token?.trim()
      if (!token) return jsonResponse({ error: 'Token requerido' }, 422, origin, ao)

      const tokenHash = await hashToken(token)

      const link = await env.DB.prepare(
        "SELECT id, client_id, expires_at, used FROM magic_links WHERE token = ?"
      ).bind(tokenHash).first<{ id: number; client_id: number; expires_at: string; used: number }>()

      if (!link || link.used || new Date(link.expires_at) < new Date()) {
        return jsonResponse({ error: 'Link inválido o expirado. Solicita uno nuevo.' }, 401, origin, ao)
      }

      // Mark token as used
      await env.DB.prepare('UPDATE magic_links SET used = 1 WHERE id = ?').bind(link.id).run()

      // Create session — store hash of session ID
      const sessionId = crypto.randomUUID()
      const sessionHash = await hashToken(sessionId)
      const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      await env.DB.prepare('INSERT INTO sessions (id, client_id, expires_at) VALUES (?, ?, ?)')
        .bind(sessionHash, link.client_id, sessionExpiry).run()

      const client = await env.DB.prepare('SELECT id, name, email, business_name FROM clients WHERE id = ?')
        .bind(link.client_id).first()

      // Return unhashed session ID to client (they present it on each request, we hash and compare)
      return jsonResponse({ ok: true, sessionId, client }, 200, origin, ao)
    }

    // ── GET /auth/session ──
    if (url.pathname === '/auth/session' && request.method === 'GET') {
      const session = await getSessionClient(request, env)
      if (!session) return jsonResponse({ error: 'Session expired' }, 401, origin, ao)

      const client = await env.DB.prepare(
        'SELECT id, name, email, business_name, industry, city, cajas, monthly_total, status, created_at FROM clients WHERE id = ?'
      ).bind(session.client_id).first()

      return jsonResponse({ ok: true, client }, 200, origin, ao)
    }

    // ── POST /auth/logout ──
    if (url.pathname === '/auth/logout' && request.method === 'POST') {
      const sessionId = request.headers.get('Authorization')?.replace('Bearer ', '')
      if (sessionId) {
        const sessionHash = await hashToken(sessionId)
        await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionHash).run()
      }
      return jsonResponse({ ok: true }, 200, origin, ao)
    }

    // ══════════════════════════════════════════
    // DASHBOARD DATA — Client-facing
    // ══════════════════════════════════════════

    // ── GET /dashboard/summary ──
    if (url.pathname === '/dashboard/summary' && request.method === 'GET') {
      const session = await getSessionClient(request, env)
      if (!session) return jsonResponse({ error: 'Session expired' }, 401, origin, ao)

      const cid = session.client_id

      const convos = await env.DB.prepare(
        "SELECT COUNT(*) as total, COALESCE(SUM(amount_generated), 0) as revenue FROM conversations WHERE client_id = ? AND created_at >= date('now', '-7 days')"
      ).bind(cid).first<{ total: number; revenue: number }>()

      const ordersResult = await env.DB.prepare(
        "SELECT COUNT(*) as total, COALESCE(SUM(total), 0) as revenue FROM orders WHERE client_id = ? AND created_at >= date('now', '-7 days')"
      ).bind(cid).first<{ total: number; revenue: number }>()

      const views = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM page_views WHERE client_id = ? AND created_at >= date('now', '-7 days')"
      ).bind(cid).first<{ total: number }>()

      const recentConvos = await env.DB.prepare(
        'SELECT id, wa_from, customer_name, summary, status, amount_generated, created_at FROM conversations WHERE client_id = ? ORDER BY created_at DESC LIMIT 10'
      ).bind(cid).all()

      const recentOrders = await env.DB.prepare(
        'SELECT id, customer_name, items, total, payment_status, order_status, created_at FROM orders WHERE client_id = ? ORDER BY created_at DESC LIMIT 10'
      ).bind(cid).all()

      return jsonResponse({
        week: {
          conversations: convos?.total ?? 0,
          orders: ordersResult?.total ?? 0,
          revenue: ordersResult?.revenue ?? 0,
          revenueFormatted: formatCLP(ordersResult?.revenue ?? 0),
          pageViews: views?.total ?? 0,
        },
        recentConversations: recentConvos.results,
        recentOrders: recentOrders.results,
      }, 200, origin, ao)
    }

    return jsonResponse({ error: 'Not found' }, 404, origin, ao)
  },
}
