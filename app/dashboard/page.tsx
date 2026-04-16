'use client'
import { useEffect, useState } from 'react'
import { API_URL } from '../lib/constants'
import { formatCLP } from '../lib/format'

type Client = {
  id: number; name: string; email: string; business_name: string
  industry: string; city: string; cajas: string; monthly_total: number; status: string
}

type WeekSummary = {
  conversations: number; orders: number; revenue: number
  revenueFormatted: string; pageViews: number
}

type Conversation = {
  id: number; customer_name: string; summary: string; status: string
  amount_generated: number; created_at: string
}

type Order = {
  id: number; customer_name: string; items: string; total: number
  payment_status: string; order_status: string; created_at: string
}

type DashboardData = {
  week: WeekSummary
  recentConversations: Conversation[]
  recentOrders: Order[]
}

export default function Dashboard() {
  const [session, setSession] = useState<string | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)
  const [authState, setAuthState] = useState<'loading' | 'login' | 'authenticated'>('loading')
  const [email, setEmail] = useState('')
  const [linkSent, setLinkSent] = useState(false)

  // Check for token in URL hash (magic link callback — hash fragments never sent to server logs)
  useEffect(() => {
    const hash = window.location.hash
    const tokenMatch = hash.match(/token=([^&]+)/)
    const token = tokenMatch ? tokenMatch[1] : null
    const saved = sessionStorage.getItem('stefna_session')

    if (token) {
      // Clear hash immediately to avoid leaking token in browser history
      window.history.replaceState({}, '', '/dashboard')
      verifyToken(token)
    } else if (saved) {
      checkSession(saved)
    } else {
      setAuthState('login')
    }
  }, [])

  async function verifyToken(token: string) {
    try {
      const res = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (data.ok && data.sessionId) {
        sessionStorage.setItem('stefna_session', data.sessionId)
        setSession(data.sessionId)
        setClient(data.client)
        setAuthState('authenticated')
        // Clean URL
        window.history.replaceState({}, '', '/dashboard')
        loadDashboard(data.sessionId)
      } else {
        setAuthState('login')
      }
    } catch {
      setAuthState('login')
    }
  }

  async function checkSession(sessionId: string) {
    try {
      const res = await fetch(`${API_URL}/auth/session`, {
        headers: { 'Authorization': `Bearer ${sessionId}` },
      })
      const data = await res.json()
      if (data.ok && data.client) {
        setSession(sessionId)
        setClient(data.client)
        setAuthState('authenticated')
        loadDashboard(sessionId)
      } else {
        sessionStorage.removeItem('stefna_session')
        setAuthState('login')
      }
    } catch {
      setAuthState('login')
    }
  }

  async function loadDashboard(sessionId: string) {
    try {
      const res = await fetch(`${API_URL}/dashboard/summary`, {
        headers: { 'Authorization': `Bearer ${sessionId}` },
      })
      const d = await res.json()
      setData(d)
    } catch { /* Dashboard will show empty state */ }
  }

  async function sendMagicLink() {
    try {
      await fetch(`${API_URL}/auth/send-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setLinkSent(true)
    } catch { /* fail silently */ }
  }

  async function logout() {
    // Revoke session server-side
    if (session) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${session}` },
        })
      } catch { /* Best effort */ }
    }
    sessionStorage.removeItem('stefna_session')
    setSession(null)
    setClient(null)
    setData(null)
    setAuthState('login')
  }

  // ── LOGIN SCREEN ──
  if (authState === 'loading') {
    return <Shell><p style={{ textAlign: 'center', color: 'var(--text-3)', padding: '100px 0' }}>Cargando...</p></Shell>
  }

  if (authState === 'login') {
    return (
      <Shell>
        <div style={{ maxWidth: 400, margin: '80px auto', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 12 }}>
            Entra a tu panel
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 300, marginBottom: 32 }}>
            Te enviamos un link de acceso a tu email. Sin contraseña.
          </p>
          {linkSent ? (
            <div style={{ padding: 24, background: 'var(--accent-dim)', border: '0.5px solid var(--accent-border)', borderRadius: 14 }}>
              <p style={{ fontSize: 14, color: 'var(--accent)' }}>Revisa tu email. Te enviamos un link para entrar.</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>Si no lo ves, revisa spam o escríbenos.</p>
            </div>
          ) : (
            <div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                style={{
                  width: '100%', padding: '14px 16px', fontSize: 15,
                  background: 'var(--bg-2)', color: 'var(--text)',
                  border: '0.5px solid var(--border)', borderRadius: 10,
                  fontFamily: 'var(--sans)', outline: 'none', marginBottom: 12,
                }}
              />
              <button
                onClick={sendMagicLink}
                disabled={!email.includes('@')}
                style={{
                  width: '100%', padding: '14px', fontSize: 14, fontWeight: 500,
                  background: email.includes('@') ? 'var(--text)' : 'var(--bg-3)',
                  color: email.includes('@') ? 'var(--bg)' : 'var(--text-3)',
                  border: 'none', borderRadius: 10, cursor: email.includes('@') ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--sans)',
                }}
              >
                Enviar link de acceso →
              </button>
            </div>
          )}
        </div>
      </Shell>
    )
  }

  // ── DASHBOARD ──
  const week = data?.week
  const cajas: string[] = client?.cajas ? JSON.parse(client.cajas) : []

  return (
    <Shell>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 400, letterSpacing: '-0.02em' }}>
              {client?.business_name}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{client?.city} · Plan {formatCLP(client?.monthly_total ?? 0)}/mes</p>
          </div>
          <button onClick={logout} style={{
            fontSize: 12, color: 'var(--text-3)', background: 'none', border: '0.5px solid var(--border)',
            borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'var(--sans)',
          }}>
            Salir
          </button>
        </div>

        {/* Banner */}
        {week && (week.orders > 0 || week.conversations > 0) && (
          <div style={{
            padding: '18px 22px', background: 'rgba(74,138,74,0.08)',
            border: '0.5px solid var(--accent-border)', borderRadius: 14, marginBottom: 24,
          }}>
            <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 500 }}>Esta semana</span> — tu asistente gestionó{' '}
              <strong style={{ color: 'var(--text)' }}>{week.conversations} conversaciones</strong> y cerró{' '}
              <strong style={{ color: 'var(--text)' }}>{week.orders} pedidos</strong> por{' '}
              <strong style={{ color: 'var(--text)' }}>{week.revenueFormatted}</strong>
            </p>
          </div>
        )}

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          <MetricCard label="Pedidos" value={String(week?.orders ?? 0)} />
          <MetricCard label="Ingresos" value={week?.revenueFormatted ?? '$0'} />
          <MetricCard label="Visitas web" value={String(week?.pageViews ?? 0)} />
          <MetricCard label="Conversaciones" value={String(week?.conversations ?? 0)} />
        </div>

        {/* Two columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Conversations */}
          <div style={{ background: 'var(--bg-2)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
            <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
              Últimas conversaciones
            </p>
            {data?.recentConversations && data.recentConversations.length > 0 ? (
              data.recentConversations.map(c => (
                <div key={c.id} style={{ padding: '10px 0', borderTop: '0.5px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{c.customer_name || 'Sin nombre'}</p>
                    <p style={{ fontSize: 11, color: c.status === 'resolved' ? 'var(--accent)' : 'var(--text-3)' }}>{c.status}</p>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{c.summary || '...'}</p>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Aún no hay conversaciones. Llegarán cuando el asistente de WhatsApp esté activo.</p>
            )}
          </div>

          {/* Orders */}
          <div style={{ background: 'var(--bg-2)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
            <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
              Pedidos recientes
            </p>
            {data?.recentOrders && data.recentOrders.length > 0 ? (
              data.recentOrders.map(o => (
                <div key={o.id} style={{ padding: '10px 0', borderTop: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{o.customer_name || 'Sin nombre'}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-2)' }}>{o.order_status}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{formatCLP(o.total)}</p>
                    <p style={{ fontSize: 11, color: o.payment_status === 'paid' ? 'var(--accent)' : '#E0A85A' }}>{o.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Aún no hay pedidos. Llegarán cuando el asistente de WhatsApp esté activo.</p>
            )}
          </div>
        </div>

        {/* Active cajas */}
        <div style={{ marginTop: 24, background: 'var(--bg-2)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
          <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            Tus cajas activas
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {cajas.map(c => (
              <span key={c} style={{
                padding: '6px 14px', fontSize: 12, fontWeight: 500,
                background: 'var(--accent-dim)', border: '0.5px solid var(--accent-border)',
                borderRadius: 20, color: 'var(--accent)',
              }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)' }}>
      <header style={{
        padding: '16px 24px', borderBottom: '0.5px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: 900, margin: '0 auto',
      }}>
        <a href="/" style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--text)', textDecoration: 'none', letterSpacing: '-0.02em' }}>
          Stefna
        </a>
        <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Panel de cliente</p>
      </header>
      {children}
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: 'var(--bg-2)', border: '0.5px solid var(--border)',
      borderRadius: 12, padding: '16px 18px',
    }}>
      <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</p>
      <p style={{ fontFamily: 'var(--serif)', fontSize: 24, letterSpacing: '-0.02em' }}>{value}</p>
    </div>
  )
}
