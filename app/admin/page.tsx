'use client'
import { useEffect, useState } from 'react'
import { API_URL } from '../lib/constants'
import { formatCLP } from '../lib/format'

type Stats = {
  totalClients: number; mrr: number; mrrFormatted: string
  signupsToday: number; recentSignups: any[]
}

type Client = {
  id: number; name: string; email: string; whatsapp_phone: string
  business_name: string; industry: string; city: string
  cajas: string; monthly_total: number; status: string; payment_status: string; created_at: string
}

// Use sessionStorage (cleared on tab close) instead of localStorage (persists forever)
const ADMIN_KEY = typeof window !== 'undefined' ? sessionStorage.getItem('stefna_admin_key') : null

export default function Admin() {
  const [key, setKey] = useState(ADMIN_KEY || '')
  const [authed, setAuthed] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [selected, setSelected] = useState<any>(null)

  async function login() {
    try {
      const res = await fetch(`${API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${key}` } })
      if (res.ok) {
        sessionStorage.setItem('stefna_admin_key', key)
        setAuthed(true)
        const data = await res.json()
        setStats(data)
        loadClients()
      }
    } catch {}
  }

  async function loadClients() {
    const res = await fetch(`${API_URL}/admin/clients`, { headers: { Authorization: `Bearer ${key}` } })
    const data = await res.json()
    setClients(data.clients || [])
  }

  async function selectClient(id: number) {
    const res = await fetch(`${API_URL}/admin/client/${id}`, { headers: { Authorization: `Bearer ${key}` } })
    const data = await res.json()
    setSelected(data)
  }

  useEffect(() => { if (ADMIN_KEY) { setKey(ADMIN_KEY); login() } }, []) // eslint-disable-line

  if (!authed) {
    return (
      <Shell>
        <div style={{ maxWidth: 360, margin: '80px auto', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 24, marginBottom: 16 }}>Admin Stefna</h1>
          <input
            type="password"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="Admin key"
            onKeyDown={e => e.key === 'Enter' && login()}
            style={{
              width: '100%', padding: '14px', fontSize: 14, background: 'var(--bg-2)',
              color: 'var(--text)', border: '0.5px solid var(--border)', borderRadius: 10,
              fontFamily: 'var(--sans)', outline: 'none', marginBottom: 12,
            }}
          />
          <button onClick={login} style={{
            width: '100%', padding: '12px', fontSize: 14, fontWeight: 500,
            background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: 10,
            cursor: 'pointer', fontFamily: 'var(--sans)',
          }}>
            Entrar
          </button>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 24, marginBottom: 24 }}>Panel de operación</h1>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
            <StatCard label="Clientes" value={String(stats.totalClients)} />
            <StatCard label="MRR" value={stats.mrrFormatted} />
            <StatCard label="Hoy" value={String(stats.signupsToday)} sub="signups" />
            <StatCard label="Target" value="50" sub={`${stats.totalClients}/50`} />
          </div>
        )}

        {/* Selected client detail */}
        {selected && (
          <div style={{
            background: 'var(--bg-3)', border: '1px solid var(--border-hover)',
            borderRadius: 16, padding: 24, marginBottom: 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 500 }}>{selected.client.business_name}</h2>
              <button onClick={() => setSelected(null)} style={{ fontSize: 12, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>✕ Cerrar</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13 }}>
              <div>
                <Row label="Nombre" value={selected.client.name} />
                <Row label="Email" value={selected.client.email} />
                <Row label="WhatsApp" value={selected.client.whatsapp_phone} />
                <Row label="Ciudad" value={selected.client.city} />
                <Row label="Rubro" value={selected.client.industry} />
              </div>
              <div>
                <Row label="Plan mensual" value={formatCLP(selected.client.monthly_total)} />
                <Row label="Cajas" value={selected.client.cajas} />
                <Row label="Estado" value={selected.client.status} />
                <Row label="Pago" value={selected.client.payment_status} />
                <Row label="Registro" value={selected.client.created_at} />
              </div>
            </div>
            {selected.activityLog?.length > 0 && (
              <div style={{ marginTop: 16, borderTop: '0.5px solid var(--border)', paddingTop: 16 }}>
                <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 8 }}>Activity log</p>
                {selected.activityLog.slice(0, 10).map((log: any, i: number) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--text-2)', padding: '4px 0', borderBottom: '0.5px solid var(--border)' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{log.action}</span> — {log.created_at}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Client table */}
        <div style={{ background: 'var(--bg-2)', border: '0.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--sans)' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid var(--border)' }}>
                {['Negocio', 'Rubro', 'Ciudad', 'Plan', 'Estado', 'Pago', 'Registro'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr
                  key={c.id}
                  onClick={() => selectClient(c.id)}
                  style={{ borderBottom: '0.5px solid var(--border)', cursor: 'pointer' }}
                >
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 500 }}>{c.business_name}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-2)' }}>{c.industry}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-2)' }}>{c.city}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12 }}>{formatCLP(c.monthly_total)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <StatusBadge status={c.status} />
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <StatusBadge status={c.payment_status} />
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 11, color: 'var(--text-3)' }}>{c.created_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)' }}>
      <header style={{ padding: '16px 24px', borderBottom: '0.5px solid var(--border)', maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--text)', textDecoration: 'none' }}>Stefna</a>
        <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Admin</p>
      </header>
      {children}
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: 'var(--bg-2)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
      <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</p>
      <p style={{ fontFamily: 'var(--serif)', fontSize: 26, letterSpacing: '-0.02em' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{sub}</p>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    pending: { bg: 'rgba(224,168,90,0.1)', text: '#E0A85A', border: 'rgba(224,168,90,0.3)' },
    active: { bg: 'rgba(74,138,74,0.1)', text: 'var(--accent)', border: 'var(--accent-border)' },
    paid: { bg: 'rgba(74,138,74,0.1)', text: 'var(--accent)', border: 'var(--accent-border)' },
    unpaid: { bg: 'rgba(224,168,90,0.1)', text: '#E0A85A', border: 'rgba(224,168,90,0.3)' },
    overdue: { bg: 'rgba(217,84,79,0.1)', text: '#D9544F', border: 'rgba(217,84,79,0.3)' },
    suspended: { bg: 'rgba(217,84,79,0.1)', text: '#D9544F', border: 'rgba(217,84,79,0.3)' },
    cancelled: { bg: 'rgba(100,100,100,0.1)', text: '#888', border: 'rgba(100,100,100,0.3)' },
  }
  const c = colors[status] || colors.pending
  return (
    <span style={{ fontSize: 10, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: c.bg, color: c.text, border: `0.5px solid ${c.border}` }}>
      {status}
    </span>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '0.5px solid var(--border)' }}>
      <span style={{ color: 'var(--text-3)' }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}
