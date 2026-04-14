/**
 * Felipe Braun partner caja — mockup/preview component.
 * NOT imported in page.tsx yet — waiting for partnership confirmation.
 *
 * Add to landing by importing in page.tsx between Cajas and Pricing:
 *   import FelipeBraun from './components/FelipeBraun'
 *   <FelipeBraun />
 */
export default function FelipeBraun() {
  return (
    <section style={{
      padding: '100px 24px',
      background: 'var(--bg)',
      borderTop: '0.5px solid var(--border)',
    }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div className="felipe-grid" style={{
          background: 'linear-gradient(135deg, var(--bg-2) 0%, var(--bg-3) 100%)',
          border: '1px solid var(--border-hover)',
          borderRadius: 24,
          padding: '48px 40px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 48,
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle accent glow */}
          <div style={{
            position: 'absolute', top: -100, right: -100,
            width: 300, height: 300,
            background: 'radial-gradient(ellipse, rgba(74,138,74,0.08) 0%, transparent 70%)',
          }} />

          {/* Left: Copy */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--accent-dim)', border: '0.5px solid var(--accent-border)',
              borderRadius: 20, padding: '5px 14px', marginBottom: 24,
            }}>
              <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Exclusivo Stefna
              </span>
            </div>

            <h2 style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 400, lineHeight: 1.15,
              letterSpacing: '-0.02em', marginBottom: 16,
            }}>
              Tu negocio en pantalla.
            </h2>

            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7, fontWeight: 300, marginBottom: 24 }}>
              Un video profesional de Felipe Braun recomendando tu negocio, publicado en tus redes cada mes.
              Tu charcutería, tu café, tu taller — con la voz de alguien que la gente conoce y confía.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
              {[
                '1 video mensual personalizado con tu local',
                'Publicado en tu Instagram y Facebook',
                'Contenido profesional, sin producción de tu parte',
                'Solo para clientes Stefna — cupo limitado',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-2)', fontWeight: 300 }}>
                  <span style={{ color: 'var(--accent)', flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <a href="/empezar" className="hover-link" style={{
                fontSize: 14, fontWeight: 500, padding: '13px 24px',
                background: 'var(--text)', color: 'var(--bg)',
                borderRadius: 10, textDecoration: 'none',
              }}>
                Quiero este diferenciador →
              </a>
              <p style={{ fontSize: 20, fontFamily: 'var(--serif)', letterSpacing: '-0.02em' }}>
                $179.000<span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--sans)' }}> / mes</span>
              </p>
            </div>
          </div>

          {/* Right: Visual mockup */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Video preview placeholder */}
            <div style={{
              background: 'var(--bg)',
              border: '0.5px solid var(--border)',
              borderRadius: 16,
              overflow: 'hidden',
            }}>
              {/* Instagram-style post header */}
              <div style={{
                padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 10,
                borderBottom: '0.5px solid var(--border)',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, color: 'var(--accent)',
                }}>FB</div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600 }}>felipebraun</p>
                  <p style={{ fontSize: 10, color: 'var(--text-3)' }}>Puerto Varas, Chile</p>
                </div>
              </div>

              {/* Video area */}
              <div style={{
                aspectRatio: '4/5',
                background: 'linear-gradient(180deg, var(--bg-3) 0%, var(--bg-2) 100%)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: 32,
                textAlign: 'center',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  border: '2px solid var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <span style={{ fontSize: 24, marginLeft: 4 }}>▶</span>
                </div>
                <p style={{ fontFamily: 'var(--serif)', fontSize: 18, marginBottom: 8 }}>
                  &ldquo;Tienen que probar esto.&rdquo;
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  Felipe Braun · Charcutería Don Fernando
                </p>
              </div>

              {/* Instagram-style engagement */}
              <div style={{ padding: '12px 16px' }}>
                <p style={{ fontSize: 12, color: 'var(--text-2)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>felipebraun</span>{' '}
                  Si están por Puerto Varas, pasen por esta charcutería. La tabla mixta es increíble. 🙌
                </p>
                <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 6 }}>Ver las 47 interacciones</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
