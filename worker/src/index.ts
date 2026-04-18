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

import { tasksForClient, calcProgress, TASKS_BY_CAJA } from './tasks'
import { createDirectUploadUrl, imageDeliveryUrl, fetchImageAsBase64 } from './images'
import { extractMenuDoublePass } from './ocr'
import { generateSite, SiteContent } from './site-gen'

export interface Env {
  DB: D1Database
  ENVIRONMENT?: string       // 'production' | 'development'
  ADMIN_KEY?: string         // Secret key for admin endpoints
  NOTIFICATION_EMAIL?: string // Where to send signup notifications
  ANTHROPIC_API_KEY?: string // Claude API key for menu OCR
  CF_ACCOUNT_ID?: string     // Cloudflare account ID for Images API
  CF_IMAGES_TOKEN?: string   // CF Images API token
  CF_IMAGES_HASH?: string    // Account hash for imagedelivery.net URLs
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

// ── Portal magic link ──

async function sendPortalMagicLink(env: Env, clientId: number | bigint, email: string, name: string): Promise<void> {
  try {
    const token = crypto.randomUUID() + '-' + crypto.randomUUID()
    const tokenHash = await hashToken(token)
    // Portal links valid for 72h (onboarding is a multi-day process)
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()

    await env.DB.prepare('INSERT INTO magic_links (client_id, token, expires_at) VALUES (?, ?, ?)')
      .bind(clientId, tokenHash, expiresAt).run()

    const firstName = name.split(' ')[0] || 'hola'
    const link = `https://stefna.app/portal#token=${token}`

    await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email, name }] }],
        from: { email: 'noreply@stefna.app', name: 'Stefna' },
        subject: `${firstName}, tu panel está listo`,
        content: [{
          type: 'text/plain',
          value: [
            `${firstName},`,
            ``,
            `Bienvenido a Stefna. Tu solicitud está recibida.`,
            ``,
            `Para que tu negocio esté online lo antes posible, necesitamos algunas cosas más. Todo está en tu panel — son tareas cortas, de 2 a 5 minutos cada una.`,
            ``,
            `Abre tu panel:`,
            link,
            ``,
            `Este link es válido por 72 horas. Si se vence, pedí uno nuevo en stefna.app/portal.`,
            ``,
            `Tú seguí haciendo lo tuyo. Nosotros hacemos el resto.`,
            ``,
            `— Stefna`,
          ].join('\n'),
        }],
      }),
    })
  } catch (e) {
    console.error('Portal magic link error:', e)
  }
}

// ── Site generation pipeline ──

async function runSiteGenPipeline(env: Env, clientId: number): Promise<void> {
  const started = Date.now()
  try {
    await env.DB.prepare("INSERT INTO pipeline_logs (client_id, pipeline, status) VALUES (?, 'web_generate', 'started')")
      .bind(clientId).run()

    // Get client info
    const client = await env.DB.prepare(
      'SELECT business_name, industry, city, whatsapp_phone, open_time, close_time, days, delivery FROM clients WHERE id = ?'
    ).bind(clientId).first<any>()
    if (!client) throw new Error('Client not found')

    // Get template choice
    const templateTask = await env.DB.prepare(
      "SELECT payload FROM onboarding_tasks WHERE client_id = ? AND task_key = 'pick_template'"
    ).bind(clientId).first<{ payload: string }>()
    let template: 'minimal' | 'modern' | 'classic' | 'bold' = 'minimal'
    if (templateTask?.payload) {
      try {
        const p = JSON.parse(templateTask.payload)
        if (['minimal', 'modern', 'classic', 'bold'].includes(p.template)) template = p.template
      } catch {}
    }

    // Get description
    const descTask = await env.DB.prepare(
      "SELECT payload FROM onboarding_tasks WHERE client_id = ? AND task_key = 'describe_business'"
    ).bind(clientId).first<{ payload: string }>()
    let description = `${client.industry} en ${client.city}`
    if (descTask?.payload) {
      try { description = JSON.parse(descTask.payload).text || description } catch {}
    }

    // Get photos
    const { results: photos } = await env.DB.prepare(
      "SELECT cf_image_id, slot FROM uploads WHERE client_id = ? AND kind IN ('photo', 'exterior') ORDER BY created_at"
    ).bind(clientId).all<{ cf_image_id: string; slot: string | null }>()

    // Get menu items
    const { results: menuItems } = await env.DB.prepare(
      'SELECT name, price_clp, description, category FROM menu_items WHERE client_id = ? ORDER BY category, name'
    ).bind(clientId).all<any>()

    const content: SiteContent = {
      business_name: client.business_name,
      description,
      city: client.city,
      whatsapp: client.whatsapp_phone,
      hours: { open: client.open_time, close: client.close_time, days: (client.days || '').split(',') },
      delivery: { enabled: !!client.delivery },
      photos: photos.filter(p => p.cf_image_id).map(p => ({ image_id: p.cf_image_id, slot: p.slot || undefined })),
      menu_items: menuItems as any,
      template,
    }

    const stagingUrl = `https://stefna-api.hmelot.workers.dev/site/${clientId}`

    // Upsert site_preview
    await env.DB.prepare(
      `INSERT INTO site_previews (client_id, template_id, staging_url, content_json, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(client_id) DO UPDATE SET
         template_id = excluded.template_id,
         staging_url = excluded.staging_url,
         content_json = excluded.content_json,
         updated_at = datetime('now')`
    ).bind(clientId, template, stagingUrl, JSON.stringify(content)).run()

    const duration = Date.now() - started
    await env.DB.prepare("INSERT INTO pipeline_logs (client_id, pipeline, status, duration_ms, details) VALUES (?, 'web_generate', 'success', ?, ?)")
      .bind(clientId, duration, JSON.stringify({ template, photos: content.photos.length, menu_items: content.menu_items?.length || 0 })).run()
  } catch (err: any) {
    const duration = Date.now() - started
    console.error('Site gen pipeline error:', err)
    await env.DB.prepare("INSERT INTO pipeline_logs (client_id, pipeline, status, duration_ms, details) VALUES (?, 'web_generate', 'failed', ?, ?)")
      .bind(clientId, duration, JSON.stringify({ error: String(err).slice(0, 500) })).run()
  }
}

// ── Menu OCR pipeline ──

async function runMenuOcrPipeline(env: Env, clientId: number, uploadId: number, cfImageId: string): Promise<void> {
  const started = Date.now()
  try {
    await env.DB.prepare("INSERT INTO pipeline_logs (client_id, pipeline, status, details) VALUES (?, 'menu_ocr', 'started', ?)")
      .bind(clientId, JSON.stringify({ upload_id: uploadId, cf_image_id: cfImageId })).run()

    if (!env.ANTHROPIC_API_KEY || !env.CF_IMAGES_HASH) {
      throw new Error('ANTHROPIC_API_KEY or CF_IMAGES_HASH not configured')
    }

    // Fetch the uploaded image from CF Images as base64
    const imageUrl = imageDeliveryUrl(env.CF_IMAGES_HASH, cfImageId, 'public')
    const { base64, mediaType } = await fetchImageAsBase64(imageUrl)

    // Run double-pass extraction
    const { result, needsReview, reason } = await extractMenuDoublePass(base64, mediaType, env.ANTHROPIC_API_KEY)

    // Save extracted items to menu_items table
    const stmts = result.items.map(item =>
      env.DB.prepare('INSERT INTO menu_items (client_id, upload_id, name, price_clp, description, category, confidence) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .bind(
          clientId,
          uploadId,
          item.name.slice(0, 200),
          item.price_clp,
          item.description?.slice(0, 500) || null,
          item.category?.slice(0, 100) || null,
          item.confidence,
        )
    )
    if (stmts.length > 0) await env.DB.batch(stmts)

    // Auto-mark confirm_menu task as pending (currently_due) with count
    await env.DB.prepare(
      `UPDATE onboarding_tasks SET payload = ? WHERE client_id = ? AND task_key = 'confirm_menu'`
    ).bind(JSON.stringify({ extracted: result.items.length, needsReview, reason }), clientId).run()

    const duration = Date.now() - started
    await env.DB.prepare("INSERT INTO pipeline_logs (client_id, pipeline, status, duration_ms, details) VALUES (?, 'menu_ocr', 'success', ?, ?)")
      .bind(clientId, duration, JSON.stringify({ items: result.items.length, needsReview, reason })).run()
  } catch (err: any) {
    const duration = Date.now() - started
    console.error('Menu OCR pipeline error:', err)
    await env.DB.prepare("INSERT INTO pipeline_logs (client_id, pipeline, status, duration_ms, details) VALUES (?, 'menu_ocr', 'failed', ?, ?)")
      .bind(clientId, duration, JSON.stringify({ error: String(err).slice(0, 500) })).run()
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

        // Create onboarding tasks for Mission Control portal
        try {
          const taskDefs = tasksForClient(body.cajas)
          const stmts = taskDefs.map(t =>
            env.DB.prepare('INSERT OR IGNORE INTO onboarding_tasks (client_id, caja, task_key, title, description, order_num, bucket) VALUES (?, ?, ?, ?, ?, ?, ?)')
              .bind(clientId, t.caja, t.task_key, t.title, t.description, t.order_num, 'currently_due')
          )
          // If client already provided webTemplate in step 5, mark that task completed
          if (body.webTemplate && body.cajas.includes('web')) {
            stmts.push(
              env.DB.prepare("UPDATE onboarding_tasks SET bucket = 'completed', payload = ?, completed_at = datetime('now') WHERE client_id = ? AND task_key = 'pick_template'")
                .bind(JSON.stringify({ template: body.webTemplate }), clientId)
            )
          }
          // If client provided catalogItems in step 5, pre-seed menu_items
          if (body.catalogItems?.trim() && body.cajas.includes('whatsapp')) {
            stmts.push(
              env.DB.prepare("UPDATE onboarding_tasks SET bucket = 'completed', completed_at = datetime('now') WHERE client_id = ? AND task_key = 'upload_menu'")
                .bind(clientId)
            )
          }
          // Mark general 'describe_business' complete if we have the description
          if (body.businessDescription?.trim()) {
            stmts.push(
              env.DB.prepare("UPDATE onboarding_tasks SET bucket = 'completed', completed_at = datetime('now') WHERE client_id = ? AND task_key = 'describe_business'")
                .bind(clientId)
            )
          }
          await env.DB.batch(stmts)
        } catch (e) { console.error('Task creation error:', e) }

        // Notify (non-blocking via waitUntil)
        ctx.waitUntil(notifySignup(body, monthlyTotal, clientId!))

        // Send portal magic link (non-blocking)
        ctx.waitUntil(sendPortalMagicLink(env, clientId!, email, body.name.trim()))

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

    // ══════════════════════════════════════════
    // PORTAL — Mission Control
    // ══════════════════════════════════════════

    // ── GET /portal/tasks ── returns all tasks + progress for logged-in client
    if (url.pathname === '/portal/tasks' && request.method === 'GET') {
      const session = await getSessionClient(request, env)
      if (!session) return jsonResponse({ error: 'Session expired' }, 401, origin, ao)

      // Get client info + cajas
      const client = await env.DB.prepare(
        'SELECT id, name, business_name, industry, city, cajas FROM clients WHERE id = ?'
      ).bind(session.client_id).first<any>()
      if (!client) return jsonResponse({ error: 'Client not found' }, 404, origin, ao)

      let cajas: string[] = []
      try { cajas = JSON.parse(client.cajas || '[]') } catch {}

      // Get tasks
      const { results: tasks } = await env.DB.prepare(
        'SELECT id, caja, task_key, title, description, bucket, order_num, payload, completed_at FROM onboarding_tasks WHERE client_id = ? ORDER BY caja, order_num'
      ).bind(session.client_id).all<any>()

      // Calculate progress
      const progress = calcProgress(tasks as any, cajas)

      return jsonResponse({
        client: {
          name: client.name,
          business_name: client.business_name,
          industry: client.industry,
          city: client.city,
          cajas,
        },
        tasks,
        progress,
      }, 200, origin, ao)
    }

    // ── POST /portal/task/:id/complete ── mark a task complete with payload
    if (url.pathname.startsWith('/portal/task/') && url.pathname.endsWith('/complete') && request.method === 'POST') {
      const session = await getSessionClient(request, env)
      if (!session) return jsonResponse({ error: 'Session expired' }, 401, origin, ao)

      const taskIdStr = url.pathname.split('/')[3]
      const taskId = parseInt(taskIdStr, 10)
      if (isNaN(taskId)) return jsonResponse({ error: 'Invalid task ID' }, 400, origin, ao)

      let body: { payload?: any }
      try { body = await request.json() } catch { body = {} }

      // Verify the task belongs to this client
      const task = await env.DB.prepare('SELECT id, client_id FROM onboarding_tasks WHERE id = ?')
        .bind(taskId).first<{ id: number; client_id: number }>()
      if (!task || task.client_id !== session.client_id) {
        return jsonResponse({ error: 'Task not found' }, 404, origin, ao)
      }

      await env.DB.prepare(
        "UPDATE onboarding_tasks SET bucket = 'completed', payload = ?, completed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?"
      ).bind(body.payload ? JSON.stringify(body.payload) : null, taskId).run()

      // Trigger site regeneration if this was a web-related task
      const webTaskKeys = ['upload_photos', 'pick_template', 'describe_business', 'confirm_content']
      const webTask = await env.DB.prepare('SELECT task_key FROM onboarding_tasks WHERE id = ?').bind(taskId).first<{ task_key: string }>()
      if (webTask && webTaskKeys.includes(webTask.task_key)) {
        ctx.waitUntil(runSiteGenPipeline(env, session.client_id))
      }

      return jsonResponse({ ok: true }, 200, origin, ao)
    }

    // ── POST /portal/upload-url ── request a CF Images direct upload URL
    if (url.pathname === '/portal/upload-url' && request.method === 'POST') {
      const session = await getSessionClient(request, env)
      if (!session) return jsonResponse({ error: 'Session expired' }, 401, origin, ao)

      if (!env.CF_ACCOUNT_ID || !env.CF_IMAGES_TOKEN) {
        return jsonResponse({ error: 'Image uploads not configured yet' }, 503, origin, ao)
      }

      let body: { kind: string; slot?: string }
      try { body = await request.json() } catch { body = { kind: 'photo' } }

      // Validate kind
      const validKinds = ['photo', 'menu', 'logo', 'exterior']
      if (!validKinds.includes(body.kind)) {
        return jsonResponse({ error: 'Invalid upload kind' }, 422, origin, ao)
      }

      try {
        const upload = await createDirectUploadUrl(env.CF_ACCOUNT_ID, env.CF_IMAGES_TOKEN, {
          client_id: String(session.client_id),
          kind: body.kind,
          slot: body.slot || '',
        })
        return jsonResponse({ ok: true, uploadURL: upload.uploadURL, imageId: upload.imageId }, 200, origin, ao)
      } catch (e: any) {
        console.error('Upload URL error:', e)
        return jsonResponse({ error: 'Could not create upload URL' }, 500, origin, ao)
      }
    }

    // ── POST /portal/upload-complete ── record completed upload in DB
    if (url.pathname === '/portal/upload-complete' && request.method === 'POST') {
      const session = await getSessionClient(request, env)
      if (!session) return jsonResponse({ error: 'Session expired' }, 401, origin, ao)

      let body: { imageId: string; kind: string; slot?: string; filename?: string; sizeBytes?: number }
      try { body = await request.json() } catch { return jsonResponse({ error: 'Invalid JSON' }, 400, origin, ao) }

      if (!body.imageId) return jsonResponse({ error: 'imageId required' }, 422, origin, ao)

      const result = await env.DB.prepare(
        'INSERT INTO uploads (client_id, kind, slot, cf_image_id, filename, size_bytes) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(
        session.client_id,
        body.kind?.slice(0, 50) || 'photo',
        body.slot?.slice(0, 50) || null,
        body.imageId.slice(0, 200),
        body.filename?.slice(0, 200) || null,
        Math.min(body.sizeBytes || 0, 50_000_000),
      ).run()

      // Trigger OCR pipeline if this is a menu upload
      if (body.kind === 'menu' && env.ANTHROPIC_API_KEY && env.CF_IMAGES_HASH) {
        ctx.waitUntil(runMenuOcrPipeline(env, session.client_id, Number(result.meta.last_row_id), body.imageId))
      }

      return jsonResponse({ ok: true, uploadId: result.meta.last_row_id }, 201, origin, ao)
    }

    // ── GET /portal/uploads ── list uploads for this client
    if (url.pathname === '/portal/uploads' && request.method === 'GET') {
      const session = await getSessionClient(request, env)
      if (!session) return jsonResponse({ error: 'Session expired' }, 401, origin, ao)

      const kind = url.searchParams.get('kind')
      const query = kind
        ? 'SELECT id, kind, slot, cf_image_id, filename, created_at FROM uploads WHERE client_id = ? AND kind = ? ORDER BY created_at DESC'
        : 'SELECT id, kind, slot, cf_image_id, filename, created_at FROM uploads WHERE client_id = ? ORDER BY created_at DESC'
      const stmt = kind
        ? env.DB.prepare(query).bind(session.client_id, kind)
        : env.DB.prepare(query).bind(session.client_id)

      const { results } = await stmt.all()

      // Add delivery URLs
      const accountHash = env.CF_IMAGES_HASH || 'unknown'
      const withUrls = results.map((r: any) => ({
        ...r,
        thumbnail_url: r.cf_image_id ? imageDeliveryUrl(accountHash, r.cf_image_id, 'thumbnail') : null,
        public_url: r.cf_image_id ? imageDeliveryUrl(accountHash, r.cf_image_id, 'public') : null,
      }))

      return jsonResponse({ uploads: withUrls }, 200, origin, ao)
    }

    // ── GET /portal/menu-items ── list extracted menu items (editable)
    if (url.pathname === '/portal/menu-items' && request.method === 'GET') {
      const session = await getSessionClient(request, env)
      if (!session) return jsonResponse({ error: 'Session expired' }, 401, origin, ao)

      const { results } = await env.DB.prepare(
        'SELECT id, name, price_clp, description, category, confidence, confirmed, created_at FROM menu_items WHERE client_id = ? ORDER BY category, name'
      ).bind(session.client_id).all()

      return jsonResponse({ items: results }, 200, origin, ao)
    }

    // ── PATCH /portal/menu-items/:id ── edit a menu item
    if (url.pathname.startsWith('/portal/menu-items/') && request.method === 'POST') {
      const session = await getSessionClient(request, env)
      if (!session) return jsonResponse({ error: 'Session expired' }, 401, origin, ao)

      const itemId = parseInt(url.pathname.split('/').pop() || '', 10)
      if (isNaN(itemId)) return jsonResponse({ error: 'Invalid item ID' }, 400, origin, ao)

      let body: { name?: string; price_clp?: number; description?: string; category?: string; confirmed?: boolean; delete?: boolean }
      try { body = await request.json() } catch { return jsonResponse({ error: 'Invalid JSON' }, 400, origin, ao) }

      // Verify ownership
      const item = await env.DB.prepare('SELECT id, client_id FROM menu_items WHERE id = ?')
        .bind(itemId).first<{ id: number; client_id: number }>()
      if (!item || item.client_id !== session.client_id) {
        return jsonResponse({ error: 'Item not found' }, 404, origin, ao)
      }

      if (body.delete) {
        await env.DB.prepare('DELETE FROM menu_items WHERE id = ?').bind(itemId).run()
        return jsonResponse({ ok: true, deleted: true }, 200, origin, ao)
      }

      await env.DB.prepare(`UPDATE menu_items SET
        name = COALESCE(?, name),
        price_clp = COALESCE(?, price_clp),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        confirmed = COALESCE(?, confirmed),
        updated_at = datetime('now')
        WHERE id = ?`)
        .bind(
          body.name?.slice(0, 200) ?? null,
          typeof body.price_clp === 'number' ? body.price_clp : null,
          body.description?.slice(0, 500) ?? null,
          body.category?.slice(0, 100) ?? null,
          typeof body.confirmed === 'boolean' ? (body.confirmed ? 1 : 0) : null,
          itemId,
        ).run()

      return jsonResponse({ ok: true }, 200, origin, ao)
    }

    // ══════════════════════════════════════════
    // SITE PREVIEW — public renderer for generated sites
    // ══════════════════════════════════════════

    // ── GET /site/:clientId ── renders the client's generated website
    if (url.pathname.startsWith('/site/') && request.method === 'GET') {
      const idStr = url.pathname.split('/').pop() || ''
      const clientId = parseInt(idStr, 10)
      if (isNaN(clientId)) return new Response('Not found', { status: 404 })

      const preview = await env.DB.prepare('SELECT content_json, template_id FROM site_previews WHERE client_id = ?')
        .bind(clientId).first<{ content_json: string; template_id: string }>()

      if (!preview) return new Response('Site not generated yet', { status: 404 })

      try {
        const content: SiteContent = JSON.parse(preview.content_json)
        const html = generateSite(content, env.CF_IMAGES_HASH || 'unknown')
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=60',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'SAMEORIGIN',
          },
        })
      } catch (e) {
        return new Response('Site render error', { status: 500 })
      }
    }

    // ── POST /portal/generate-site ── regenerate the client's site preview
    if (url.pathname === '/portal/generate-site' && request.method === 'POST') {
      const session = await getSessionClient(request, env)
      if (!session) return jsonResponse({ error: 'Session expired' }, 401, origin, ao)

      ctx.waitUntil(runSiteGenPipeline(env, session.client_id))
      return jsonResponse({ ok: true, message: 'Generando tu web…' }, 202, origin, ao)
    }

    // ── GET /portal/site-preview ── returns the current staging URL for this client
    if (url.pathname === '/portal/site-preview' && request.method === 'GET') {
      const session = await getSessionClient(request, env)
      if (!session) return jsonResponse({ error: 'Session expired' }, 401, origin, ao)

      const preview = await env.DB.prepare('SELECT staging_url, template_id, updated_at, approved_at FROM site_previews WHERE client_id = ?')
        .bind(session.client_id).first()

      return jsonResponse({ preview: preview || null, staging_url: preview ? `https://stefna-api.hmelot.workers.dev/site/${session.client_id}` : null }, 200, origin, ao)
    }

    return jsonResponse({ error: 'Not found' }, 404, origin, ao)
  },
}
