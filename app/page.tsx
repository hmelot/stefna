export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: '#fff',
      padding: '2rem',
    }}>
      <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555', marginBottom: '2rem' }}>
        Próximamente
      </p>
      <h1 style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', fontWeight: 700, letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>
        Stefna
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#666', marginTop: '1.5rem', textAlign: 'center', maxWidth: '420px', lineHeight: 1.6 }}>
        Tu negocio, en rumbo.
      </p>
    </main>
  )
}
