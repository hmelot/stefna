/**
 * Stefna WhatsApp Encargado Worker
 *
 * Receives webhooks from Meta WhatsApp Cloud API, processes messages
 * using Claude API, and responds on behalf of the business.
 *
 * Endpoints:
 * - GET  /webhook — Meta verification challenge
 * - POST /webhook — incoming WhatsApp messages
 *
 * Required secrets (set via `wrangler secret put`):
 * - ANTHROPIC_API_KEY
 * - META_VERIFY_TOKEN
 * - META_APP_SECRET
 * - META_ACCESS_TOKEN
 */

export interface Env {
  DB: D1Database
  ANTHROPIC_API_KEY: string
  META_VERIFY_TOKEN: string
  META_APP_SECRET: string
  META_ACCESS_TOKEN: string
}

// ── Types ──

type WaMessage = {
  from: string // phone number
  id: string
  timestamp: string
  type: 'text' | 'image' | 'audio' | 'document' | 'location' | 'interactive'
  text?: { body: string }
}

type WaWebhookBody = {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: { display_phone_number: string; phone_number_id: string }
        contacts?: Array<{ profile: { name: string }; wa_id: string }>
        messages?: WaMessage[]
      }
      field: string
    }>
  }>
}

type ConversationRow = {
  id: number
  client_id: number
  wa_from: string
  customer_name: string
  messages: string // JSON
  status: string
}

type AgentConfig = {
  client_id: number
  system_prompt: string
  catalog: string // JSON
  delivery_zones: string | null
  greeting: string | null
}

// ── HMAC Verification ──

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
  const expected = 'sha256=' + Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
  return expected === signature
}

// ── Claude API ──

async function callClaude(systemPrompt: string, messages: Array<{ role: string; content: string }>, apiKey: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages: messages.slice(-20), // Keep last 20 messages for context
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API error: ${res.status} ${err}`)
  }

  const data = await res.json() as { content: Array<{ type: string; text: string }> }
  return data.content[0]?.text || 'Lo siento, no pude procesar tu mensaje.'
}

// ── WhatsApp API ──

async function sendWhatsAppMessage(phoneNumberId: string, to: string, text: string, accessToken: string): Promise<void> {
  const res = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`WhatsApp send error: ${res.status} ${err}`)
  }
}

// ── Build System Prompt ──

function buildSystemPrompt(config: AgentConfig, clientData: any): string {
  // If custom system prompt exists, use it
  if (config.system_prompt && config.system_prompt.trim()) {
    return config.system_prompt
  }

  // Build default prompt from client data
  const catalog = JSON.parse(config.catalog || '[]')
  const catalogText = catalog.length > 0
    ? `\nProductos/servicios disponibles:\n${catalog.map((p: any) => `- ${p.name}: $${p.price} ${p.available === false ? '(agotado)' : ''}`).join('\n')}`
    : ''

  const deliveryText = config.delivery_zones
    ? `\nHacemos delivery: ${config.delivery_zones}`
    : ''

  return `Eres el encargado digital de ${clientData.business_name}, un negocio de ${clientData.industry} en ${clientData.city}.
Tu trabajo es atender clientes por WhatsApp de manera natural y amigable.

Horario de atención: ${clientData.open_time} a ${clientData.close_time}
Días: ${clientData.days}${deliveryText}${catalogText}

Reglas:
- Responde en español, tono cálido y directo
- Si preguntan precio, responde con el precio real del catálogo
- Si quieren hacer un pedido, confirma: producto, cantidad, dirección (si delivery), hora
- Si está fuera de horario, avisa cuándo vuelven a atender
- NUNCA menciones que eres un asistente automatizado, un bot, o que usas tecnología
- Si no sabes algo, di "te confirmo en un momento" y no inventes
- Sé breve — máximo 2-3 párrafos por respuesta
- Usa emojis con moderación (máximo 1-2 por mensaje)`
}

// ── Main Handler ──

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // ── GET /webhook — Meta verification ──
    if (url.pathname === '/webhook' && request.method === 'GET') {
      const mode = url.searchParams.get('hub.mode')
      const token = url.searchParams.get('hub.verify_token')
      const challenge = url.searchParams.get('hub.challenge')

      if (mode === 'subscribe' && token === env.META_VERIFY_TOKEN) {
        return new Response(challenge, { status: 200 })
      }
      return new Response('Forbidden', { status: 403 })
    }

    // ── POST /webhook — Incoming messages ──
    if (url.pathname === '/webhook' && request.method === 'POST') {
      const rawBody = await request.text()

      // Verify HMAC signature
      const signature = request.headers.get('x-hub-signature-256') || ''
      if (env.META_APP_SECRET) {
        const valid = await verifySignature(rawBody, signature, env.META_APP_SECRET)
        if (!valid) {
          console.error('Invalid webhook signature')
          return new Response('Invalid signature', { status: 401 })
        }
      }

      let body: WaWebhookBody
      try { body = JSON.parse(rawBody) }
      catch { return new Response('Invalid JSON', { status: 400 }) }

      // Process each message
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value
          if (!value.messages) continue

          const phoneNumberId = value.metadata.phone_number_id
          const contacts = value.contacts || []

          for (const message of value.messages) {
            if (message.type !== 'text' || !message.text?.body) continue

            const customerPhone = message.from
            const customerName = contacts.find(c => c.wa_id === customerPhone)?.profile?.name || ''
            const customerMessage = message.text.body

            try {
              await processMessage(env, phoneNumberId, customerPhone, customerName, customerMessage)
            } catch (err) {
              console.error(`Error processing message from ${customerPhone}:`, err)
            }
          }
        }
      }

      // Always return 200 to acknowledge webhook
      return new Response('OK', { status: 200 })
    }

    // ── GET /health ──
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'stefna-wa' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response('Not found', { status: 404 })
  },
}

// ── Process a single incoming message ──

async function processMessage(
  env: Env,
  phoneNumberId: string,
  customerPhone: string,
  customerName: string,
  customerMessage: string,
): Promise<void> {
  // Find which client this phone number belongs to
  // Match by the WhatsApp phone number registered in the client's config
  const client = await env.DB.prepare(
    "SELECT id, name, business_name, industry, city, open_time, close_time, days, delivery FROM clients WHERE whatsapp_phone LIKE ? AND status = 'active'"
  ).bind(`%${phoneNumberId.slice(-8)}%`).first<any>()

  if (!client) {
    console.log(`No active client found for phone ${phoneNumberId}`)
    return
  }

  // Get or create conversation
  let conversation = await env.DB.prepare(
    "SELECT id, messages FROM conversations WHERE client_id = ? AND wa_from = ? AND status = 'active' AND created_at >= datetime('now', '-24 hours')"
  ).bind(client.id, customerPhone).first<{ id: number; messages: string }>()

  let messages: Array<{ role: string; content: string; timestamp: string }> = []

  if (conversation) {
    messages = JSON.parse(conversation.messages || '[]')
  } else {
    // Create new conversation
    const result = await env.DB.prepare(
      'INSERT INTO conversations (client_id, wa_from, customer_name, messages) VALUES (?, ?, ?, ?)'
    ).bind(client.id, customerPhone, customerName, '[]').run()
    conversation = { id: result.meta.last_row_id as number, messages: '[]' }
  }

  // Add customer message
  messages.push({ role: 'user', content: customerMessage, timestamp: new Date().toISOString() })

  // Get agent config
  const config = await env.DB.prepare('SELECT * FROM agent_configs WHERE client_id = ?')
    .bind(client.id).first<AgentConfig>()

  const systemPrompt = config
    ? buildSystemPrompt(config, client)
    : buildSystemPrompt({ client_id: client.id, system_prompt: '', catalog: '[]', delivery_zones: null, greeting: null }, client)

  // Call Claude
  const claudeMessages = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }))
  const response = await callClaude(systemPrompt, claudeMessages, env.ANTHROPIC_API_KEY)

  // Add assistant response
  messages.push({ role: 'assistant', content: response, timestamp: new Date().toISOString() })

  // Update conversation in D1
  await env.DB.prepare(
    "UPDATE conversations SET messages = ?, customer_name = ?, updated_at = datetime('now') WHERE id = ?"
  ).bind(JSON.stringify(messages), customerName || conversation.id, conversation.id).run()

  // Send response via WhatsApp
  await sendWhatsAppMessage(phoneNumberId, customerPhone, response, env.META_ACCESS_TOKEN)

  console.log(`[WA] ${client.business_name} | ${customerName} (${customerPhone}) | "${customerMessage.slice(0, 50)}" → "${response.slice(0, 50)}"`)
}
