export default function Cases() {
  return (
    <section id="casos" style={{ padding: '100px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ maxWidth: 520, marginBottom: 56 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>
            Casos reales
          </p>
          <h2 style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em',
          }}>
            Negocios que<br />encontraron su rumbo.
          </h2>
        </div>

        {/* Caso Fernando */}
        <div style={{
          background: 'var(--bg-2)',
          border: '0.5px solid var(--border)',
          borderRadius: 20, padding: '40px',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 48, alignItems: 'center',
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--accent-dim)', border: '0.5px solid var(--accent-border)',
              borderRadius: 20, padding: '4px 12px', marginBottom: 24,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
              <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 500, letterSpacing: '0.06em' }}>EN VIVO</span>
            </div>

            <h3 style={{
              fontFamily: 'var(--serif)',
              fontSize: 24, fontWeight: 400, letterSpacing: '-0.02em',
              marginBottom: 8, lineHeight: 1.3,
            }}>
              Charcutería · Puerto Varas
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 28, fontWeight: 300, lineHeight: 1.6 }}>
              Fernando llevaba años atendiendo pedidos por WhatsApp sin control — respondía cuando podía, perdía pedidos de noche, sin forma de cobrar fácil.
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 300, lineHeight: 1.6 }}>
              Hoy su encargado de WhatsApp responde en segundos, toma pedidos completos y confirma el pago — mientras Fernando duerme.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { num: '47', label: 'pedidos esta semana' },
              { num: '$312K', label: 'CLP generados' },
              { num: '284', label: 'visitas a su web' },
              { num: '18', label: 'días activo' },
            ].map(({ num, label }) => (
              <div key={num} style={{
                background: 'var(--bg)',
                border: '0.5px solid var(--border)',
                borderRadius: 12, padding: '20px 16px',
                textAlign: 'center',
              }}>
                <p style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 4 }}>{num}</p>
                <p style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.4 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', marginTop: 24 }}>
          Más casos próximamente — tu negocio podría ser el siguiente.
        </p>
      </div>
    </section>
  )
}
