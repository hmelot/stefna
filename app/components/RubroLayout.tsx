import type { Caja } from '../lib/cajas'

type WaMsg = { from: 'client' | 'encargado'; text: string }

type Props = {
  rubro: string
  city: string
  description: string
  cajas: Caja[]
  conversation: WaMsg[]
}

function WaBubble({ from, text }: WaMsg) {
  const isClient = from === 'client'
  return (
    <div style={{ display: 'flex', justifyContent: isClient ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
      <div style={{
        maxWidth: '80%', padding: '10px 14px',
        background: isClient ? 'rgba(74,138,74,0.15)' : 'var(--bg-2)',
        border: `0.5px solid ${isClient ? 'var(--accent-border)' : 'var(--border)'}`,
        borderRadius: isClient ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        fontSize: 13, color: 'var(--text)', lineHeight: 1.5, fontWeight: 300,
        whiteSpace: 'pre-line' as const,
      }}>
        {text}
      </div>
    </div>
  )
}

export default function RubroLayout({ rubro, city, description, cajas, conversation }: Props) {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)' }}>
      {/* Nav */}
      <header style={{
        padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: 1080, margin: '0 auto',
      }}>
        <a href="/" style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', textDecoration: 'none', letterSpacing: '-0.02em' }}>
          Stefna
        </a>
        <a href="/empezar" className="hover-link" style={{
          fontSize: 13, fontWeight: 500, padding: '9px 18px',
          background: 'var(--text)', color: 'var(--bg)',
          borderRadius: 8, textDecoration: 'none',
        }}>
          Empezar →
        </a>
      </header>

      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{
            display: 'inline-block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--accent)', background: 'var(--accent-dim)', border: '0.5px solid var(--accent-border)',
            padding: '5px 14px', borderRadius: 20, marginBottom: 24,
          }}>
            Presencia digital para {rubro.toLowerCase()}
          </p>
          <h1 style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20,
          }}>
            {rubro} en {city}.<br />
            <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Siempre abierto.</em>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.65, fontWeight: 300, maxWidth: 520, margin: '0 auto 36px' }}>
            {description}
          </p>
          <a href="/empezar" className="hover-link" style={{
            display: 'inline-block', fontSize: 15, fontWeight: 500, padding: '14px 30px',
            background: 'var(--text)', color: 'var(--bg)', borderRadius: 10, textDecoration: 'none',
          }}>
            Armar mi presencia digital →
          </a>
        </div>
      </section>

      {/* Cajas relevantes */}
      <section style={{ padding: '60px 24px', background: 'var(--bg-2)', borderTop: '0.5px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>
            Lo que incluimos para tu {rubro.toLowerCase()}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginTop: 24 }}>
            {cajas.map(caja => (
              <div key={caja.id} className="caja-card" style={{
                background: caja.featured ? 'var(--bg-3)' : 'var(--bg)',
                border: caja.featured ? '1px solid var(--accent)' : '0.5px solid var(--border)',
                borderRadius: 14, padding: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', padding: '3px 8px',
                    borderRadius: 20, background: caja.accent, border: `0.5px solid ${caja.accentBorder}`,
                    color: 'var(--text-2)',
                  }}>{caja.slug}</span>
                  {caja.featured && <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 500 }}>Recomendado</span>}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>{caja.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, fontWeight: 300 }}>{caja.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WA Conversation Example */}
      <section style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>
            Así se ve en acción
          </p>
          <h2 style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 24,
          }}>
            Una conversación real de {rubro.toLowerCase()}.
          </h2>
          <div style={{
            padding: 20, background: 'var(--bg-2)', border: '0.5px solid var(--border)', borderRadius: 16,
          }}>
            {conversation.map((msg, i) => (
              <WaBubble key={i} {...msg} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '60px 24px 80px', textAlign: 'center',
        background: 'var(--bg-2)', borderTop: '0.5px solid var(--border)',
      }}>
        <h2 style={{
          fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 16,
        }}>
          ¿Tienes {rubro.toLowerCase().startsWith('un') ? '' : 'un'}{rubro.toLowerCase().startsWith('una') ? '' : 'a'} {rubro.toLowerCase()} en {city}?
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-2)', fontWeight: 300, marginBottom: 28 }}>
          En 72 horas tu negocio está online. Sin que configures nada.
        </p>
        <a href="/empezar" className="hover-link" style={{
          display: 'inline-block', fontSize: 15, fontWeight: 500, padding: '14px 30px',
          background: 'var(--text)', color: 'var(--bg)', borderRadius: 10, textDecoration: 'none',
        }}>
          Empezar ahora →
        </a>
      </section>

      {/* Footer mini */}
      <footer style={{ padding: '32px 24px', borderTop: '0.5px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'var(--text-3)' }}>© 2026 Stefna · stefna.app · <a href="/terminos" style={{ color: 'var(--text-3)' }}>Términos</a> · <a href="/privacidad" style={{ color: 'var(--text-3)' }}>Privacidad</a></p>
      </footer>
    </main>
  )
}
