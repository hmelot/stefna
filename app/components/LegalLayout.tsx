export function LegalLayout({ title, date, children }: { title: string; date: string; children: React.ReactNode }) {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)' }}>
      <header style={{ padding: '24px', borderBottom: '0.5px solid var(--border)', maxWidth: 720, margin: '0 auto' }}>
        <a href="/" style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', textDecoration: 'none', letterSpacing: '-0.02em' }}>
          Stefna
        </a>
      </header>
      <article style={{ maxWidth: 620, margin: '0 auto', padding: '56px 24px 96px' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Legal</p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 32 }}>
          {title}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 40 }}>{date}</p>
        {children}
      </article>
    </main>
  )
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, color: 'var(--text)' }}>{title}</h2>
      <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, fontWeight: 300 }}>{children}</p>
    </div>
  )
}
