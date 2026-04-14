const steps = [
  { num: '01', who: 'Tú · 5 min', title: 'Cuéntanos de tu negocio', desc: 'Un formulario simple. Nombre, rubro, ciudad, qué vendes. Nada técnico.' },
  { num: '02', who: 'Nosotros · 48h', title: 'Armamos todo por ti', desc: 'Web, dominio, encargado de WhatsApp con tu menú y precios, link de cobro.' },
  { num: '03', who: 'Tú · 30 min', title: 'Revisas y apruebas', desc: 'Te mostramos todo antes de publicar. Un mensaje de WhatsApp y listo.' },
  { num: '04', who: 'Todos los días · 24/7', title: 'Tu negocio trabaja solo', desc: 'El encargado responde, toma pedidos y cobra. Tú duermes tranquilo.' },
]

export default function HowItWorks() {
  return (
    <section id="como-funciona" style={{ padding: '100px 24px', background: 'var(--bg-2)', borderTop: '0.5px solid var(--border)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ maxWidth: 520, marginBottom: 64 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>
            Cómo funciona
          </p>
          <h2 style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em',
          }}>
            De cero a clientes<br />en 72 horas.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 2 }}>
          {steps.map(({ num, who, title, desc }, i) => (
            <div key={num} style={{
              padding: '32px 28px',
              borderLeft: i === 0 ? '0.5px solid var(--border)' : 'none',
              borderRight: '0.5px solid var(--border)',
              borderTop: '0.5px solid var(--border)',
              borderBottom: '0.5px solid var(--border)',
              position: 'relative',
            }}>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 20, letterSpacing: '0.06em' }}>{num}</p>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: who.startsWith('Nosotros') ? 'var(--accent)' : 'rgba(255,255,255,0.3)',
                marginBottom: 20,
              }} />
              <h3 style={{ fontSize: 17, fontWeight: 500, marginBottom: 10, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, fontWeight: 300, marginBottom: 16 }}>{desc}</p>
              <p style={{
                fontSize: 12, fontWeight: 500,
                color: who.startsWith('Nosotros') ? 'var(--accent)' : 'var(--text-3)',
                letterSpacing: '0.04em',
              }}>
                {who}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
