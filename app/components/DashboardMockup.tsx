/**
 * Interactive dashboard mockup — shown in the hero section.
 * Displays Fernando's (La Charcutería) panel with realistic metrics.
 * Pure server component — no JS shipped.
 */

const metrics = [
  { label: 'Pedidos esta semana', value: '47', delta: '+12%' },
  { label: 'Ingresos generados', value: '$312K', delta: '+8%' },
  { label: 'Visitas a tu web', value: '284', delta: '+23%' },
  { label: 'Conversaciones WA', value: '63', delta: '+15%' },
]

const conversations = [
  { name: 'María José', time: '14:32', msg: 'Quiero una tabla mixta para llevar', status: 'Pedido confirmado' },
  { name: 'Carlos', time: '11:15', msg: 'Hacen delivery a Llanquihue?', status: 'Respondido en 8s' },
  { name: 'Valentina', time: '09:48', msg: 'Tienen opciones sin gluten?', status: 'Respondido en 12s' },
]

const orders = [
  { id: '#047', client: 'María José', items: 'Tabla mixta + Pastrami', total: '$20.400', status: 'Pagado' },
  { id: '#046', client: 'Rodrigo', items: 'Tabla quesos premium', total: '$15.900', status: 'Pagado' },
  { id: '#045', client: 'Andrea', items: '2x Sándwich pastrami', total: '$15.000', status: 'Pendiente' },
]

export default function DashboardMockup() {
  return (
    <div style={{
      maxWidth: 960, margin: '0 auto', padding: '0 24px',
      marginTop: -20,
    }}>
      <div style={{
        background: 'var(--bg-2)',
        border: '1px solid var(--border-hover)',
        borderRadius: 20,
        overflow: 'hidden',
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

        {/* Dashboard content */}
        <div style={{ padding: '20px' }}>
          {/* Banner */}
          <div style={{
            padding: '16px 20px',
            background: 'rgba(74,138,74,0.08)',
            border: '0.5px solid var(--accent-border)',
            borderRadius: 12,
            marginBottom: 16,
          }}>
            <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 500 }}>Mientras dormías</span> — tu asistente gestionó <strong style={{ color: 'var(--text)' }}>12 conversaciones</strong> y cerró <strong style={{ color: 'var(--text)' }}>4 pedidos</strong> por <strong style={{ color: 'var(--text)' }}>$54.200</strong>
            </p>
          </div>

          {/* Metrics grid */}
          <div className="dash-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            {metrics.map(m => (
              <div key={m.label} style={{
                background: 'var(--bg-3)', border: '0.5px solid var(--border)',
                borderRadius: 10, padding: '14px 16px',
              }}>
                <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{m.label}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.02em' }}>{m.value}</p>
                  <p style={{ fontSize: 11, color: 'var(--accent)' }}>{m.delta}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Two columns: conversations + orders */}
          <div className="dash-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* Conversations */}
            <div style={{ background: 'var(--bg-3)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Últimas conversaciones</p>
              {conversations.map((c, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  padding: '8px 0',
                  borderTop: i > 0 ? '0.5px solid var(--border)' : 'none',
                }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{c.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-2)' }}>{c.msg}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                    <p style={{ fontSize: 10, color: 'var(--text-3)' }}>{c.time}</p>
                    <p style={{ fontSize: 10, color: 'var(--accent)' }}>{c.status}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Orders */}
            <div style={{ background: 'var(--bg-3)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Pedidos recientes</p>
              {orders.map((o, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  padding: '8px 0',
                  borderTop: i > 0 ? '0.5px solid var(--border)' : 'none',
                }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>
                      <span style={{ color: 'var(--text-3)' }}>{o.id}</span> {o.client}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-2)' }}>{o.items}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 500 }}>{o.total}</p>
                    <p style={{ fontSize: 10, color: o.status === 'Pagado' ? 'var(--accent)' : '#E0A85A' }}>{o.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
