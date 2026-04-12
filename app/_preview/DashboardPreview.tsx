'use client'
// Design reference — NOT routed. See ./README.md.

import { useState } from 'react'
import Metric from '../components/ui/Metric'
import Panel from '../components/ui/Panel'
import { formatCLP, statusColor } from '../lib/format'
import type { Status } from '../lib/types'

type Mock = {
  business: string
  yesterday: { messages: number; revenue: number }
  week: { orders: number; revenue: number; visits: number; conversations: number }
  conversations: { name: string; preview: string; time: string; kind: 'replied' | 'order' }[]
  orders: { id: string; customer: string; total: number; paid: boolean }[]
  visits: { source: string; count: number }[]
  boxes: { name: string; status: Status }[]
}

const MOCK: Mock = {
  business: 'Panadería Don Luis',
  yesterday: { messages: 14, revenue: 87_300 },
  week: { orders: 63, revenue: 412_500, visits: 284, conversations: 97 },
  conversations: [
    { name: 'María S.', preview: '¿Tienen marraquetas para mañana?', time: '08:42', kind: 'replied' },
    { name: 'Carlos R.', preview: 'Quiero reservar 3 kuchenes…', time: '07:18', kind: 'order' },
    { name: 'Ana P.', preview: 'Horario del sábado?', time: 'Ayer', kind: 'replied' },
    { name: '+56 9 8842', preview: 'Hacen delivery a Ñuñoa?', time: 'Ayer', kind: 'replied' },
  ],
  orders: [
    { id: '#0142', customer: 'Carlos R.', total: 28_400, paid: true },
    { id: '#0141', customer: 'María S.', total: 12_900, paid: true },
    { id: '#0140', customer: 'Diego L.', total: 45_600, paid: false },
    { id: '#0139', customer: 'Ana P.', total: 8_700, paid: true },
  ],
  visits: [
    { source: 'Google', count: 142 },
    { source: 'Google Maps', count: 89 },
    { source: 'Directo', count: 38 },
    { source: 'Instagram', count: 15 },
  ],
  boxes: [
    { name: 'Web', status: 'green' },
    { name: 'WhatsApp', status: 'green' },
    { name: 'Cobros', status: 'green' },
    { name: 'SEO local', status: 'amber' },
    { name: 'Google Maps', status: 'green' },
    { name: 'Redes', status: 'gray' },
  ],
}

const TOTAL_VISITS = MOCK.visits.reduce((acc, v) => acc + v.count, 0)

export default function DashboardPreview() {
  const [shared, setShared] = useState(false)
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)' }}>
      <DashNav business={MOCK.business} />
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 24px 96px' }}>
        <section style={{
          background: 'linear-gradient(180deg, var(--bg-3) 0%, var(--bg-2) 100%)',
          border: '0.5px solid var(--border)', borderRadius: 16,
          padding: '32px 36px', marginBottom: 32, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -80, right: -40, width: 320, height: 260,
            background: 'radial-gradient(ellipse, rgba(93,202,165,0.08) 0%, transparent 70%)',
          }} />
          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 14 }}>
            Mientras dormías
          </p>
          <h1 style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)',
            fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.2, maxWidth: 640,
          }}>
            Tu encargado atendió <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{MOCK.yesterday.messages} mensajes</em> y generó <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{formatCLP(MOCK.yesterday.revenue)}</em> en pedidos.
          </h1>
          <button
            type="button"
            onClick={() => setShared(true)}
            style={{
              marginTop: 22, padding: '10px 20px', fontSize: 13, fontWeight: 500,
              background: shared ? 'var(--accent-dim)' : 'var(--text)',
              color: shared ? 'var(--accent)' : 'var(--bg)',
              border: shared ? '0.5px solid var(--accent-border)' : 'none',
              borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--sans)',
            }}
          >
            {shared ? '✓ Imagen lista para Instagram' : 'Compartir mi resultado'}
          </button>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
          <Metric label="Pedidos esta semana" value={MOCK.week.orders.toString()} delta="+18%" />
          <Metric label="Ingresos semana" value={formatCLP(MOCK.week.revenue)} delta="+22%" />
          <Metric label="Visitas web" value={MOCK.week.visits.toString()} delta="+6%" />
          <Metric label="Conversaciones WA" value={MOCK.week.conversations.toString()} delta="+14%" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 32 }}>
          <Panel title="Últimas conversaciones">
            {MOCK.conversations.map((c, i) => (
              <div key={`${c.name}-${i}`} style={{
                display: 'flex', justifyContent: 'space-between', gap: 12,
                padding: '14px 0',
                borderBottom: i < MOCK.conversations.length - 1 ? '0.5px solid var(--border)' : 'none',
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{c.name}</p>
                  <p style={{
                    fontSize: 12, color: 'var(--text-2)', fontWeight: 300,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {c.preview}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.time}</p>
                  {c.kind === 'order' && (
                    <p style={{ fontSize: 10, color: 'var(--accent)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      pedido
                    </p>
                  )}
                </div>
              </div>
            ))}
          </Panel>

          <Panel title="Pedidos recientes">
            {MOCK.orders.map((order, i) => (
              <div key={order.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 0',
                borderBottom: i < MOCK.orders.length - 1 ? '0.5px solid var(--border)' : 'none',
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{order.id} · {order.customer}</p>
                  <p style={{
                    fontSize: 11, marginTop: 3,
                    color: order.paid ? 'var(--accent)' : 'var(--text-3)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {order.paid ? 'pagado' : 'pendiente'}
                  </p>
                </div>
                <p style={{ fontFamily: 'var(--serif)', fontSize: 18, letterSpacing: '-0.01em' }}>{formatCLP(order.total)}</p>
              </div>
            ))}
          </Panel>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          <Panel title="Visitas web por fuente">
            {MOCK.visits.map(v => {
              const pct = (v.count / TOTAL_VISITS) * 100
              return (
                <div key={v.source} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-2)' }}>{v.source}</span>
                    <span style={{ color: 'var(--text)' }}>{v.count}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)' }} />
                  </div>
                </div>
              )
            })}
          </Panel>

          <Panel title="Estado de tus cajas">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {MOCK.boxes.map(box => (
                <div key={box.name} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', background: 'var(--bg)',
                  border: '0.5px solid var(--border)', borderRadius: 10,
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: statusColor(box.status), flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{box.name}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </main>
  )
}

function DashNav({ business }: { business: string }) {
  return (
    <nav style={{ padding: '0 24px', borderBottom: '0.5px solid var(--border)', background: 'var(--bg)' }}>
      <div style={{
        maxWidth: 1080, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60,
      }}>
        <a href="/" style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', textDecoration: 'none', letterSpacing: '-0.02em' }}>
          Stefna
        </a>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{business}</span>
          <span style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--bg-3)', border: '0.5px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: 'var(--text-2)',
          }}>
            {business[0] ?? '?'}
          </span>
        </div>
      </div>
    </nav>
  )
}
