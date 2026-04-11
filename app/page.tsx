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
      <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#666', marginBottom: '2rem' }}>
        Próximamente
      </p>
      <h1 style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', fontWeight: 700, letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>
        Vorta
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#888', marginTop: '1.5rem', textAlign: 'center', maxWidth: '400px', lineHeight: 1.6 }}>
        Presencia digital de primer nivel para negocios que no se conforman.
      </p>
    </main>
  )
}
