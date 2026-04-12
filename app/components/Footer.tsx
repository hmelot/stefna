'use client'
export default function Footer() {
  return (
    <footer style={{
      padding: '80px 24px 48px',
      background: 'var(--bg-2)',
      borderTop: '0.5px solid var(--border)',
    }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 48, alignItems: 'start', marginBottom: 56 }}>
          <div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 28, marginBottom: 14, letterSpacing: '-0.02em', color: 'var(--text)' }}>Stefna</p>
            <p style={{ fontSize: 14, color: 'var(--text-2)', maxWidth: 280, lineHeight: 1.7, fontWeight: 300 }}>
              Presencia digital completa para negocios que quieren crecer sin complicarse.
            </p>
          </div>
          {[
            { title: 'Producto', links: [
              { label: 'Cómo funciona', href: '#como-funciona' },
              { label: 'Qué incluye', href: '#que-incluye' },
              { label: 'Precios', href: '#precios' },
            ]},
            { title: 'Empezar', links: [
              { label: 'Armar mi plan', href: '/empezar' },
            ]},
            { title: 'Legal', links: [
              { label: 'Términos', href: '/terminos' },
              { label: 'Privacidad', href: '/privacidad' },
            ]},
          ].map(({ title, links }) => (
            <div key={title}>
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>{title}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {links.map(link => (
                  <a key={link.label} href={link.href} style={{ fontSize: 14, color: 'var(--text-2)', textDecoration: 'none', fontWeight: 300 }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, borderTop: '0.5px solid var(--border)' }}>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>© 2026 Stefna. Hecho en el sur de Chile.</p>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>stefna.app</p>
        </div>
      </div>
    </footer>
  )
}
