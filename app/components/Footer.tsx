export default function Footer() {
  return (
    <footer style={{
      padding: '60px 24px 40px',
      background: 'var(--bg)',
      borderTop: '0.5px solid var(--border)',
    }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 48, alignItems: 'start', marginBottom: 48 }}>
          <div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 22, marginBottom: 12, letterSpacing: '-0.02em' }}>Stefna</p>
            <p style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 260, lineHeight: 1.6, fontWeight: 300 }}>
              Presencia digital completa para negocios que quieren crecer sin complicarse.
            </p>
          </div>
          {[
            { title: 'Producto', links: ['Cómo funciona', 'Precios', 'Casos reales'] },
            { title: 'Empresa', links: ['Nosotros', 'Manifiesto', 'Contacto'] },
            { title: 'Legal', links: ['Términos', 'Privacidad'] },
          ].map(({ title, links }) => (
            <div key={title}>
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>{title}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(link => (
                  <a key={link} href="#" style={{ fontSize: 13, color: 'var(--text-2)', textDecoration: 'none', fontWeight: 300 }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}>
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, borderTop: '0.5px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>© 2026 Stefna. Hecho en el sur de Chile.</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>stefna.app</p>
        </div>
      </div>
    </footer>
  )
}
