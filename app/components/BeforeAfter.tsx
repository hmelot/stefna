/**
 * Before/After comparison section — inspired by cap-table.lat's "Excel vs Cap-Table"
 * Shows the contrast between running a business without Stefna vs with Stefna.
 */

const before = [
  { icon: '✕', text: 'Pedidos de WhatsApp se pierden de noche y fines de semana' },
  { icon: '✕', text: 'Sin web o con una que nadie encuentra' },
  { icon: '✕', text: 'Cobras por transferencia y persigues comprobantes' },
  { icon: '✕', text: 'No sabes cuántos clientes llegan ni de dónde' },
  { icon: '✕', text: 'Dependes de recomendaciones boca a boca' },
]

const after = [
  { icon: '✓', text: 'Un asistente responde, toma pedidos y cobra — 24/7' },
  { icon: '✓', text: 'Web profesional que aparece en Google Maps' },
  { icon: '✓', text: 'Link de pago por WhatsApp, confirma automáticamente' },
  { icon: '✓', text: 'Panel con pedidos, visitas y conversaciones en tiempo real' },
  { icon: '✓', text: 'Apareces cuando buscan tu rubro en tu ciudad' },
]

export default function BeforeAfter() {
  return (
    <section style={{ padding: '100px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>
            El cambio
          </p>
          <h2 style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em',
          }}>
            De perder pedidos a<br />
            <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>dormir tranquilo.</em>
          </h2>
        </div>

        <div className="before-after" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Before */}
          <div style={{
            background: 'var(--bg-2)',
            border: '0.5px solid var(--border)',
            borderRadius: 16, padding: '32px 28px',
          }}>
            <div style={{
              display: 'inline-block', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#D9544F', background: 'rgba(217,84,79,0.1)',
              border: '0.5px solid rgba(217,84,79,0.3)', padding: '4px 12px', borderRadius: 20,
              marginBottom: 24,
            }}>
              Sin Stefna
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {before.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ color: '#D9544F', fontSize: 14, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5, fontWeight: 300 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* After */}
          <div style={{
            background: 'rgba(74,138,74,0.04)',
            border: '1px solid var(--accent-border)',
            borderRadius: 16, padding: '32px 28px',
          }}>
            <div style={{
              display: 'inline-block', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--accent)', background: 'var(--accent-dim)',
              border: '0.5px solid var(--accent-border)', padding: '4px 12px', borderRadius: 20,
              marginBottom: 24,
            }}>
              Con Stefna
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {after.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--accent)', fontSize: 14, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5, fontWeight: 300 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
