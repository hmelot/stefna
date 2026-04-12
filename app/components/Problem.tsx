'use client'
const problems = [
  {
    title: 'No apareces cuando te buscan',
    desc: 'Cuando alguien busca tu rubro en tu ciudad, aparece la competencia. Ese cliente se va sin saber que existes.',
    icon: '↓',
  },
  {
    title: 'WhatsApp sin control',
    desc: 'Respondes cuando puedes. Los pedidos se pierden de noche, los fines de semana, cuando estás ocupado.',
    icon: '×',
  },
  {
    title: 'Sin tiempo para aprender esto',
    desc: 'Tienes un negocio que operar. No tienes horas para aprender marketing digital, webs o redes sociales.',
    icon: '○',
  },
]

export default function Problem() {
  return (
    <section id="problema" style={{ padding: '100px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ maxWidth: 580, marginBottom: 56 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>
            El problema
          </p>
          <h2 style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em',
            marginBottom: 16,
          }}>
            Tu negocio es bueno.<br />Pero nadie lo encuentra.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-2)', lineHeight: 1.6, fontWeight: 300 }}>
            El 80% de las PYMEs en Latinoamérica pierde clientes cada día porque no tiene presencia digital real — o tiene algo que no funciona.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {problems.map(({ title, desc, icon }) => (
            <div key={title} style={{
              background: 'var(--bg-2)',
              border: '0.5px solid var(--border)',
              borderRadius: 16, padding: '28px 28px',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                border: '0.5px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, color: 'var(--text-2)',
                marginBottom: 20,
              }}>
                {icon}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 10, letterSpacing: '-0.01em' }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, fontWeight: 300 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
