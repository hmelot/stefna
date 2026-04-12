export default function Privacidad() {
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
          Política de privacidad
        </h1>
        <p style={metaStyle}>Última actualización: 12 de abril de 2026</p>

        <Section title="1. Qué datos recopilamos">
          Durante el registro recopilamos: nombre, email, número de WhatsApp, nombre del negocio, rubro, ciudad
          y preferencias de servicio. Durante la operación del servicio, procesamos las conversaciones de WhatsApp
          entre tus clientes y el encargado, datos de pedidos y transacciones de pago.
        </Section>

        <Section title="2. Para qué los usamos">
          Usamos tus datos exclusivamente para operar el servicio contratado: armar tu web, entrenar al encargado
          de WhatsApp con el contexto de tu negocio, procesar cobros y mostrarte métricas en tu panel. No vendemos,
          alquilamos ni compartimos tus datos con terceros para fines publicitarios.
        </Section>

        <Section title="3. Datos de tus clientes">
          Las conversaciones de WhatsApp y datos de pedidos de tus clientes se almacenan de forma segura y se usan
          únicamente para operar el servicio de tu negocio. No contactamos a tus clientes directamente ni usamos
          sus datos para otros fines. Tú eres el responsable de informar a tus clientes que utilizas un servicio
          de atención automatizada.
        </Section>

        <Section title="4. Dónde se almacenan">
          Los datos se almacenan en infraestructura de Cloudflare (edge computing global con cumplimiento SOC 2,
          ISO 27001). Las conversaciones de WhatsApp se procesan a través de la API oficial de Meta. Los pagos
          se procesan a través de MercadoPago. No almacenamos datos de tarjetas de crédito.
        </Section>

        <Section title="5. Retención">
          Mientras tu cuenta esté activa, conservamos todos los datos necesarios para operar el servicio.
          Al cancelar, eliminamos tus datos y los de tus clientes dentro de 30 días. Puedes solicitar una
          copia de tus datos antes de la eliminación escribiendo a hmelot@gmail.com.
        </Section>

        <Section title="6. Tus derechos">
          Puedes solicitar en cualquier momento: acceso a tus datos, corrección de información incorrecta,
          eliminación de tus datos (lo que implica cancelar el servicio), o una copia portable de tu información.
          Para ejercer estos derechos, escríbenos a hmelot@gmail.com.
        </Section>

        <Section title="7. Cookies">
          stefna.app usa almacenamiento local del navegador (localStorage) para guardar el progreso del formulario
          de registro. No usamos cookies de rastreo, analytics de terceros ni píxeles de seguimiento.
        </Section>

        <Section title="8. Cambios">
          Si modificamos esta política, te notificamos por WhatsApp o email con al menos 15 días de anticipación.
        </Section>

        <Section title="9. Contacto">
          Para cualquier consulta sobre privacidad: hmelot@gmail.com
        </Section>
      </article>
    </main>
  )
}

const metaStyle: React.CSSProperties = { fontSize: 13, color: 'var(--text-3)', marginBottom: 40 }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, color: 'var(--text)' }}>{title}</h2>
      <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, fontWeight: 300 }}>{children}</p>
    </div>
  )
}
