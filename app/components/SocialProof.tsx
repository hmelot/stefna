/**
 * Social proof section with Fernando's real metrics.
 * Replaces the old Cases section with a more visual, data-driven approach.
 */
export default function SocialProof() {
  return (
    <section id="casos" style={{ padding: '100px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>
            En la vida real
          </p>
          <h2 style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em',
          }}>
            Negocios que encontraron su rumbo.
          </h2>
        </div>

        {/* Fernando's card */}
        <div style={{
          background: 'var(--bg-2)',
          border: '0.5px solid var(--border)',
          borderRadius: 20, padding: '40px',
          maxWidth: 800, margin: '0 auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--accent)',
            }}>F</div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 500 }}>La Charcutería</p>
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Fernando · Puerto Varas · Activo desde abril 2026</p>
            </div>
            <div style={{
              marginLeft: 'auto',
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--accent-dim)', border: '0.5px solid var(--accent-border)',
              borderRadius: 20, padding: '4px 12px',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
              <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 500 }}>EN VIVO</span>
            </div>
          </div>

          <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7, fontWeight: 300, marginBottom: 28, maxWidth: 560 }}>
            Fernando llevaba años atendiendo pedidos por WhatsApp sin control — respondía cuando podía,
            perdía pedidos de noche, sin forma de cobrar fácil. Hoy su asistente responde en segundos,
            toma pedidos completos y confirma el pago — mientras Fernando duerme.
          </p>

          {/* Metrics */}
          <div className="proof-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { value: '47', label: 'pedidos / semana' },
              { value: '$312K', label: 'CLP generados' },
              { value: '63', label: 'conversaciones WA' },
              { value: '8s', label: 'tiempo de respuesta' },
            ].map(m => (
              <div key={m.label} style={{
                background: 'var(--bg-3)', border: '0.5px solid var(--border)',
                borderRadius: 12, padding: '18px 16px', textAlign: 'center',
              }}>
                <p style={{ fontFamily: 'var(--serif)', fontSize: 26, letterSpacing: '-0.02em', marginBottom: 4 }}>{m.value}</p>
                <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', marginTop: 24 }}>
          Tu negocio podría ser el siguiente. <a href="/empezar" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Empieza hoy →</a>
        </p>
      </div>
    </section>
  )
}
