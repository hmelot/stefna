'use client'

const cajas = [
  {
    num: '01',
    title: 'Tu vitrina en internet',
    slug: 'Web',
    desc: 'Landing profesional con dominio propio. Apareces en Google Maps y búsquedas locales desde el día uno.',
    items: ['Dominio .com propio', 'Diseño personalizado', 'Ficha Google Maps', 'Optimizada para móvil'],
    accent: 'rgba(93,202,165,0.08)',
    accentBorder: 'rgba(93,202,165,0.2)',
  },
  {
    num: '02',
    title: 'Apareces primero',
    slug: 'SEO local',
    desc: 'Cuando alguien busca tu rubro en tu ciudad, apareces tú. Posicionamiento local que construye solo.',
    items: ['Google Business Profile', 'Keywords locales', 'Reseñas gestionadas', 'Reportes mensuales'],
    accent: 'rgba(93,165,202,0.08)',
    accentBorder: 'rgba(93,165,202,0.2)',
  },
  {
    num: '03',
    title: 'Contenido sin esfuerzo',
    slug: 'Redes',
    desc: 'Publicaciones semanales en Instagram y Facebook. Tu presencia activa sin que toques nada.',
    items: ['4 posts por semana', 'Diseño con tu marca', 'Calendario editorial', 'Historias incluidas'],
    accent: 'rgba(165,93,202,0.08)',
    accentBorder: 'rgba(165,93,202,0.2)',
  },
  {
    num: '04',
    title: 'Tu encargado de WhatsApp',
    slug: 'WhatsApp',
    desc: 'Responde preguntas, toma pedidos, envía tu catálogo, coordina delivery y cobra — sin que toques el teléfono.',
    items: ['Entrenado con tu negocio', 'Toma pedidos completos', 'Responde en segundos', 'Disponible 24/7'],
    accent: 'rgba(93,202,120,0.08)',
    accentBorder: 'rgba(93,202,120,0.25)',
    featured: true,
  },
  {
    num: '05',
    title: 'Recibe pagos al instante',
    slug: 'Cobros',
    desc: 'Link de pago por WhatsApp, transferencia o tarjeta. Sin POS, sin complicaciones.',
    items: ['MercadoPago integrado', 'Link directo por WA', 'Confirmación automática', 'Sin comisiones extra'],
    accent: 'rgba(202,165,93,0.08)',
    accentBorder: 'rgba(202,165,93,0.2)',
  },
  {
    num: '06',
    title: 'Ve tus números',
    slug: 'Dashboard',
    desc: 'Un panel simple que muestra pedidos, visitas, conversaciones y lo que está pasando en tu negocio.',
    items: ['Pedidos en tiempo real', 'Visitas a tu web', 'Conversaciones WA', 'Resumen semanal'],
    accent: 'rgba(202,93,93,0.08)',
    accentBorder: 'rgba(202,93,93,0.2)',
  },
]

export default function Cajas() {
  return (
    <section id="que-incluye" style={{ padding: '100px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56, flexWrap: 'wrap', gap: 24 }}>
          <div style={{ maxWidth: 520 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>
              Qué incluye
            </p>
            <h2 style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em',
            }}>
              Seis cajas.<br />Una sola suscripción.
            </h2>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-2)', maxWidth: 280, lineHeight: 1.6, fontWeight: 300 }}>
            Activas las cajas que necesitas. Agregas más cuando quieras. Sin contratos largos.
          </p>
        </div>

        {/* Scroll horizontal en mobile, grid en desktop */}
        <div className="scroll-x" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(280px, 1fr))',
          gap: 12,
        }}>
          {cajas.map(({ num, title, slug, desc, items, accent, accentBorder, featured }) => (
            <div key={num} style={{
              background: featured ? 'var(--bg-2)' : 'var(--bg)',
              border: featured ? `1px solid var(--accent)` : `0.5px solid var(--border)`,
              borderRadius: 16, padding: '28px',
              flexShrink: 0,
              transition: 'border-color 0.2s, transform 0.2s',
              position: 'relative',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = featured ? 'var(--accent)' : 'var(--border-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = featured ? 'var(--accent)' : 'var(--border)' }}>
              {featured && (
                <p style={{
                  position: 'absolute', top: -1, left: 24,
                  fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
                  background: 'var(--accent)', color: 'var(--bg)',
                  padding: '3px 10px', borderRadius: '0 0 8px 8px',
                  textTransform: 'uppercase',
                }}>
                  El más pedido
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, marginTop: featured ? 12 : 0 }}>
                <span style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.06em' }}>{num}</span>
                <span style={{
                  fontSize: 11, fontWeight: 500, letterSpacing: '0.06em',
                  padding: '3px 10px', borderRadius: 20,
                  background: accent, border: `0.5px solid ${accentBorder}`,
                  color: 'var(--text-2)',
                }}>
                  {slug}
                </span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 10, lineHeight: 1.3 }}>{title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, fontWeight: 300, marginBottom: 20 }}>{desc}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {items.map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-2)' }}>
                    <span style={{ color: 'var(--accent)', fontSize: 12 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* BSale integration note */}
        <div style={{
          marginTop: 24, padding: '16px 20px',
          background: 'var(--bg-2)', border: '0.5px solid var(--border)',
          borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 16 }}>🔗</span>
          <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 300 }}>
            ¿Ya usas BSale, Alegra u otro sistema? Lo conectamos y tu catálogo queda listo en minutos — sin cargar nada manualmente.
          </p>
        </div>
      </div>
    </section>
  )
}
