import { CAJAS } from '../lib/cajas'

export default function Cajas() {
  return (
    <section id="que-incluye" style={{ padding: '100px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56, flexWrap: 'wrap', gap: 24 }}>
          <div style={{ maxWidth: 520 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>
              Qué incluye
            </p>
            <h2 style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em',
            }}>
              Seis cajas.<br />Una sola suscripción.
            </h2>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-2)', maxWidth: 280, lineHeight: 1.6, fontWeight: 300 }}>
            Activas las cajas que necesitas. Agregas más cuando quieras. Sin contratos largos.
          </p>
        </div>

        <div className="scroll-x" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(280px, 1fr))',
          gap: 12,
        }}>
          {CAJAS.map(({ num, name, slug, desc, items, accent, accentBorder, featured }) => (
            <div key={num} className="caja-card" style={{
              background: featured ? 'var(--bg-2)' : 'var(--bg)',
              border: featured ? '1px solid var(--accent)' : '0.5px solid var(--border)',
              borderRadius: 16, padding: '28px',
              flexShrink: 0,
              transition: 'border-color 0.2s',
              position: 'relative',
            }}>
              {featured && (
                <p style={{
                  position: 'absolute', top: -1, left: 24,
                  fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
                  background: 'var(--accent)', color: 'var(--bg)',
                  padding: '3px 10px', borderRadius: '0 0 8px 8px',
                  textTransform: 'uppercase',
                }}>
                  Recomendado
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, marginTop: featured ? 12 : 0 }}>
                <span style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.06em' }}>{num}</span>
                <span style={{
                  fontSize: 11, fontWeight: 500, letterSpacing: '0.06em',
                  padding: '3px 10px', borderRadius: 20,
                  background: accent, border: `0.5px solid ${accentBorder}`,
                  color: 'var(--text-2)',
                }}>
                  {slug}
                </span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 10, lineHeight: 1.3 }}>{name}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, fontWeight: 300, marginBottom: 20 }}>{desc}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {items.map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-2)' }}>
                    <span style={{ color: 'var(--accent)', fontSize: 12 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 24, padding: '16px 20px',
          background: 'var(--bg-2)', border: '0.5px solid var(--border)',
          borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 16 }}>🔗</span>
          <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 300 }}>
            ¿Ya usas BSale, Alegra o Defontana? Lo conectamos y tu catálogo se sincroniza automáticamente. Cambias un precio y se actualiza en tu web y WhatsApp al instante.
          </p>
        </div>
      </div>
    </section>
  )
}
