export default function Terminos() {
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
          Términos y condiciones
        </h1>
        <p style={metaStyle}>Última actualización: 12 de abril de 2026</p>

        <Section title="1. Qué es Stefna">
          Stefna es un servicio de presencia digital operada para negocios pequeños. Nosotros armamos, operamos y
          mantenemos la infraestructura digital de tu negocio — web, posicionamiento, atención por WhatsApp y cobros.
          Tú contratas el servicio; nosotros lo ejecutamos.
        </Section>

        <Section title="2. El servicio">
          Al contratar Stefna recibes acceso a las cajas que seleccionaste durante el proceso de registro.
          Cada caja incluye funcionalidades específicas descritas en stefna.app al momento de la contratación.
          Nos reservamos el derecho de mejorar, modificar o actualizar las funcionalidades incluidas en cada caja,
          siempre manteniendo o superando el nivel de servicio contratado.
        </Section>

        <Section title="3. Tu dominio">
          El dominio web que registramos para tu negocio es tuyo. Si cancelas el servicio, el dominio permanece
          a tu nombre y puedes transferirlo o usarlo como quieras. Stefna no retiene dominios de clientes bajo
          ninguna circunstancia.
        </Section>

        <Section title="4. Pagos">
          El servicio se cobra mensualmente a través de MercadoPago. El monto corresponde a la suma de las cajas
          activas en tu plan. Los precios pueden cambiar con aviso previo de 30 días. Si hay un cambio de precio,
          puedes cancelar sin penalización antes de que aplique.
        </Section>

        <Section title="5. Cancelación">
          Puedes cancelar en cualquier momento. No hay contratos de permanencia, multas ni penalizaciones.
          Al cancelar: tu dominio sigue siendo tuyo, tu web se desactiva dentro de 15 días, y el encargado de
          WhatsApp deja de operar. Los datos de tus clientes almacenados durante el servicio se eliminan dentro
          de 30 días posteriores a la cancelación, salvo que solicites una copia.
        </Section>

        <Section title="6. Suspensión por falta de pago">
          Si el pago mensual no se registra dentro de los primeros 5 días del ciclo, el servicio de WhatsApp entra
          en modo reducido. Si el pago no se regulariza dentro de 15 días, el servicio se suspende completamente.
          Tu dominio no se ve afectado — sigue siendo tuyo.
        </Section>

        <Section title="7. Uso aceptable">
          El servicio es para negocios legítimos. No se permite usar Stefna para actividades ilegales, spam,
          contenido discriminatorio o engañoso. Nos reservamos el derecho de suspender el servicio si detectamos
          un uso que viole esta política, con aviso previo salvo casos graves.
        </Section>

        <Section title="8. Limitación de responsabilidad">
          Stefna opera la infraestructura digital de tu negocio con el mayor cuidado posible, pero no garantizamos
          disponibilidad ininterrumpida del servicio. No somos responsables por pérdidas comerciales derivadas de
          interrupciones temporales, errores del encargado de WhatsApp o problemas de terceros (MercadoPago,
          proveedores de hosting, APIs).
        </Section>

        <Section title="9. Cambios a estos términos">
          Podemos actualizar estos términos. Te notificaremos por WhatsApp o email con al menos 15 días de
          anticipación. Si continúas usando el servicio después de ese plazo, se entiende que aceptas los
          cambios.
        </Section>

        <Section title="10. Contacto">
          Para cualquier duda sobre estos términos: hmelot@gmail.com
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
