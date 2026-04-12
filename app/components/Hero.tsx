'use client'
export default function Hero() {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '120px 24px 80px',
      position: 'relative', overflow: 'hidden',
      textAlign: 'center',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
      }} />

      {/* Accent glow */}
      <div style={{
        position: 'absolute', top: '40%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 400,
        background: 'radial-gradient(ellipse, rgba(0,51,0,0.12) 0%, transparent 70%)',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 760 }}>
        <p className="fade-up-1" style={{
          display: 'inline-block',
          fontSize: 14, letterSpacing: '0.06em',
          color: 'var(--accent)', fontWeight: 500,
          border: '0.5px solid var(--accent-border)',
          background: 'var(--accent-dim)',
          padding: '8px 20px', borderRadius: 20,
          marginBottom: 32,
        }}>
          Para los que hacen su oficio con cariño
        </p>

        <h1 className="fade-up-2" style={{
          fontFamily: 'var(--serif)',
          fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
          fontWeight: 400,
          lineHeight: 1.08,
          letterSpacing: '-0.03em',
          marginBottom: 24,
          color: 'var(--text)',
        }}>
          Tu negocio, siempre<br />
          <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>abierto.</em>
        </h1>

        <p className="fade-up-3" style={{
          fontSize: 22, color: 'var(--text-2)',
          lineHeight: 1.65, maxWidth: 560, margin: '0 auto 40px',
          fontWeight: 300,
        }}>
          Tú llevas años construyendo algo real.<br />
          Nosotros ponemos lo que falta para que el mundo lo encuentre.
        </p>

        <div className="fade-up-4" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/empezar" style={{
            fontSize: 15, fontWeight: 500,
            padding: '13px 28px',
            background: 'var(--text)', color: 'var(--bg)',
            borderRadius: 10, textDecoration: 'none',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            Quiero ponerme en rumbo →
          </a>
          <a href="#como-funciona" style={{
            fontSize: 15, padding: '13px 28px',
            border: '0.5px solid var(--border-hover)', color: 'var(--text-2)',
            borderRadius: 10, textDecoration: 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}>
            ¿Cómo funciona esto?
          </a>
        </div>

        {/* Social proof */}
        <div style={{
          display: 'flex', gap: 40, justifyContent: 'center',
          marginTop: 72, paddingTop: 40,
          borderTop: '0.5px solid var(--border)',
        }}>
          {[
            { num: '72h', label: 'de formulario a live' },
            { num: '0', label: 'cosas que configurar' },
            { num: '24/7', label: 'tu negocio trabajando' },
          ].map(({ num, label }) => (
            <div key={num} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, color: 'var(--text)', letterSpacing: '-0.02em' }}>{num}</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4, letterSpacing: '0.04em' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
