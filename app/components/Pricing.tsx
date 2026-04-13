import { PLANS } from '../lib/plans'
import { formatCLP } from '../lib/format'

export default function Pricing() {
  return (
    <section id="precios" style={{ padding: '100px 24px', background: 'var(--bg-2)', borderTop: '0.5px solid var(--border)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>
            Precios
          </p>
          <h2 style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 16,
          }}>
            Arma tu plan. Paga solo lo que necesitas.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-2)', fontWeight: 300, maxWidth: 480, margin: '0 auto' }}>
            Empieza con la base y agrega cajas. Sin contratos. Sin letra chica. Cancelas cuando quieras.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 12 }}>
          {PLANS.map(({ id, name, price, description, items, featured }) => (
            <div key={id} className="caja-card" style={{
              background: featured ? 'var(--bg-3)' : 'var(--bg)',
              border: featured ? '1px solid rgba(255,255,255,0.15)' : '0.5px solid var(--border)',
              borderRadius: 16, padding: '32px 28px',
              position: 'relative',
              transition: 'border-color 0.2s',
            }}>
              {featured && (
                <p style={{
                  position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
                  background: 'var(--accent)', color: '#fff',
                  padding: '3px 14px', borderRadius: '0 0 8px 8px',
                  textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}>
                  Recomendado
                </p>
              )}
              <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, marginTop: featured ? 12 : 0 }}>{name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 24, fontWeight: 300, lineHeight: 1.5 }}>{description}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                {id === 'starter' && <p style={{ fontSize: 13, color: 'var(--text-3)' }}>desde</p>}
                <p style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 38, fontWeight: 400, letterSpacing: '-0.03em',
                }}>
                  {formatCLP(price)}
                </p>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 28 }}>CLP / mes</p>
              <div style={{ height: '0.5px', background: 'var(--border)', marginBottom: 24 }} />
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {items.map(item => (
                  <li key={item} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-2)', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="/empezar" className="hover-link" style={{
                display: 'block', textAlign: 'center',
                padding: '11px', fontSize: 13, fontWeight: 500,
                background: featured ? 'var(--text)' : 'transparent',
                color: featured ? 'var(--bg)' : 'var(--text-2)',
                border: featured ? 'none' : '0.5px solid var(--border-hover)',
                borderRadius: 8, textDecoration: 'none',
                transition: 'opacity 0.2s',
              }}>
                Armar mi plan →
              </a>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', marginTop: 32, fontWeight: 300 }}>
          Estos son ejemplos. En el siguiente paso armas tu plan eligiendo exactamente las cajas que necesitas.
        </p>
      </div>
    </section>
  )
}
