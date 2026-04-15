'use client'
import { useState } from 'react'

/**
 * Interactive dashboard mockup — shown in the hero section.
 * Displays Fernando's (La Charcutería) panel with clickable tabs.
 */

type Tab = 'resumen' | 'conversaciones' | 'pedidos' | 'cajas'

const TABS: { id: Tab; label: string }[] = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'conversaciones', label: 'Conversaciones' },
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'cajas', label: 'Cajas' },
]

const metrics = [
  { label: 'Pedidos esta semana', value: '47', delta: '+12%' },
  { label: 'Ingresos generados', value: '$312K', delta: '+8%' },
  { label: 'Visitas a tu web', value: '284', delta: '+23%' },
  { label: 'Conversaciones WA', value: '63', delta: '+15%' },
]

const conversations = [
  { name: 'María José', time: '14:32', preview: 'Quiero una tabla mixta para llevar', status: 'Pedido confirmado', msgs: 4 },
  { name: 'Carlos', time: '11:15', preview: 'Hacen delivery a Llanquihue?', status: 'Respondido en 8s', msgs: 3 },
  { name: 'Valentina', time: '09:48', preview: 'Tienen opciones sin gluten?', status: 'Respondido en 12s', msgs: 2 },
  { name: 'Rodrigo', time: 'Ayer', preview: 'Quiero la tabla de quesos premium', status: 'Pedido entregado', msgs: 6 },
  { name: 'Andrea', time: 'Ayer', preview: 'Hola, están abiertos mañana?', status: 'Respondido en 5s', msgs: 2 },
]

const orders = [
  { id: '#047', client: 'María José', items: 'Tabla mixta + Sándwich pastrami', total: '$20.400', payment: 'Pagado', delivery: 'Retiro en local', time: '14:45' },
  { id: '#046', client: 'Rodrigo', items: 'Tabla quesos premium', total: '$15.900', payment: 'Pagado', delivery: 'Delivery Llanquihue', time: '12:30' },
  { id: '#045', client: 'Andrea', items: '2x Sándwich pastrami', total: '$15.000', payment: 'Pendiente', delivery: 'Retiro en local', time: '11:00' },
  { id: '#044', client: 'Camila', items: 'Tabla mixta grande', total: '$18.900', payment: 'Pagado', delivery: 'Delivery Puerto Varas', time: 'Ayer' },
  { id: '#043', client: 'Diego', items: 'Queso brie + Jamón serrano 200g', total: '$12.500', payment: 'Pagado', delivery: 'Retiro en local', time: 'Ayer' },
]

const cajas = [
  { name: 'Tu vitrina en internet', slug: 'Web', status: 'active' as const, detail: 'Uptime 99.8% · 284 visitas esta semana', accent: 'rgba(93,202,165,0.08)', accentBorder: 'rgba(93,202,165,0.2)' },
  { name: 'Que te encuentren primero', slug: 'SEO', status: 'progress' as const, detail: 'Posición Google Maps: #4 · Día 18 de 30 (en proceso)', accent: 'rgba(93,165,202,0.08)', accentBorder: 'rgba(93,165,202,0.2)' },
  { name: 'Gestión de pedidos WA', slug: 'WhatsApp', status: 'active' as const, detail: '63 conversaciones · 47 pedidos · Respuesta promedio: 8s', accent: 'rgba(93,202,120,0.08)', accentBorder: 'rgba(93,202,120,0.25)' },
  { name: 'Cobros sin fricción', slug: 'Cobros', status: 'active' as const, detail: 'MercadoPago activo · $312K recaudados esta semana', accent: 'rgba(202,165,93,0.08)', accentBorder: 'rgba(202,165,93,0.2)' },
]

const statusColor = { active: 'var(--accent)', progress: '#E0A85A', inactive: 'var(--text-3)' }
const statusLabel = { active: 'Activa', progress: 'En proceso', inactive: 'Inactiva' }

export default function DashboardMockup() {
  const [tab, setTab] = useState<Tab>('resumen')

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', marginTop: -20 }}>
      <div style={{
        background: 'var(--bg-2)',
        border: '1px solid var(--border-hover)',
        borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        {/* Title bar */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '0.5px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 8 }}>Panel de Fernando — La Charcutería, Puerto Varas</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
            <p style={{ fontSize: 11, color: 'var(--accent)' }}>En vivo</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 0,
          borderBottom: '0.5px solid var(--border)',
          padding: '0 20px',
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '12px 18px', fontSize: 12, fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? 'var(--text)' : 'var(--text-3)',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                fontFamily: 'var(--sans)', transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: '20px', minHeight: 320 }}>
          {tab === 'resumen' && <TabResumen />}
          {tab === 'conversaciones' && <TabConversaciones />}
          {tab === 'pedidos' && <TabPedidos />}
          {tab === 'cajas' && <TabCajas />}
        </div>
      </div>
    </div>
  )
}

function TabResumen() {
  return (
    <>
      {/* Banner */}
      <div style={{
        padding: '16px 20px', background: 'rgba(74,138,74,0.08)',
        border: '0.5px solid var(--accent-border)', borderRadius: 12, marginBottom: 16,
      }}>
        <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
          <span style={{ color: 'var(--accent)', fontWeight: 500 }}>Mientras dormías</span> — tu asistente gestionó{' '}
          <strong style={{ color: 'var(--text)' }}>12 conversaciones</strong> y cerró{' '}
          <strong style={{ color: 'var(--text)' }}>4 pedidos</strong> por{' '}
          <strong style={{ color: 'var(--text)' }}>$54.200</strong>
        </p>
      </div>

      {/* Metrics */}
      <div className="dash-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background: 'var(--bg-3)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{m.label}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.02em' }}>{m.value}</p>
              <p style={{ fontSize: 11, color: 'var(--accent)' }}>{m.delta}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two columns preview */}
      <div className="dash-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: 'var(--bg-3)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
          <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Últimas conversaciones</p>
          {conversations.slice(0, 3).map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: i > 0 ? '0.5px solid var(--border)' : 'none' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{c.name}</p>
                <p style={{ fontSize: 11, color: 'var(--text-2)' }}>{c.preview}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                <p style={{ fontSize: 10, color: 'var(--text-3)' }}>{c.time}</p>
                <p style={{ fontSize: 10, color: 'var(--accent)' }}>{c.status}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--bg-3)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
          <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Pedidos recientes</p>
          {orders.slice(0, 3).map((o, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: i > 0 ? '0.5px solid var(--border)' : 'none' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}><span style={{ color: 'var(--text-3)' }}>{o.id}</span> {o.client}</p>
                <p style={{ fontSize: 11, color: 'var(--text-2)' }}>{o.items}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 500 }}>{o.total}</p>
                <p style={{ fontSize: 10, color: o.payment === 'Pagado' ? 'var(--accent)' : '#E0A85A' }}>{o.payment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function TabConversaciones() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>63 conversaciones esta semana</p>
      {conversations.map((c, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 16px', background: 'var(--bg-3)', border: '0.5px solid var(--border)', borderRadius: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: 'var(--bg)',
              border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 600, color: 'var(--text-2)',
            }}>
              {c.name[0]}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{c.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-2)' }}>{c.preview}</p>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>{c.time}</p>
            <p style={{ fontSize: 10, color: 'var(--accent)' }}>{c.status}</p>
            <p style={{ fontSize: 10, color: 'var(--text-3)' }}>{c.msgs} mensajes</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function TabPedidos() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>47 pedidos esta semana</p>
        <p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>$312K generados</p>
      </div>
      <div style={{ border: '0.5px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--sans)' }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid var(--border)' }}>
              {['Pedido', 'Productos', 'Total', 'Pago', 'Entrega', 'Hora'].map(h => (
                <th key={h} style={{ padding: '10px 12px', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => (
              <tr key={i} style={{ borderBottom: i < orders.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
                <td style={{ padding: '10px 12px', fontSize: 12 }}><span style={{ color: 'var(--text-3)' }}>{o.id}</span> {o.client}</td>
                <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-2)' }}>{o.items}</td>
                <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 500 }}>{o.total}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: o.payment === 'Pagado' ? 'rgba(74,138,74,0.1)' : 'rgba(224,168,90,0.1)', color: o.payment === 'Pagado' ? 'var(--accent)' : '#E0A85A' }}>{o.payment}</span>
                </td>
                <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-2)' }}>{o.delivery}</td>
                <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-3)' }}>{o.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TabCajas() {
  return (
    <div>
      <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Estado de tus cajas</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {cajas.map((c, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '18px 20px', background: 'var(--bg-3)', border: '0.5px solid var(--border)', borderRadius: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: statusColor[c.status],
              }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{c.name}</p>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: c.accent, border: `0.5px solid ${c.accentBorder}`, color: 'var(--text-2)' }}>{c.slug}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-2)' }}>{c.detail}</p>
              </div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 500, padding: '3px 10px', borderRadius: 10,
              color: statusColor[c.status],
              background: c.status === 'active' ? 'rgba(74,138,74,0.1)' : 'rgba(224,168,90,0.1)',
            }}>
              {statusLabel[c.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
