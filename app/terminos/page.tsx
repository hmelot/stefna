import { LegalLayout, Section } from '../components/LegalLayout'

export default function Terminos() {
  return (
    <LegalLayout title="Términos y condiciones" date="Última actualización: 12 de abril de 2026">
      <Section title="1. Qué es Stefna">
        Stefna es un servicio de presencia digital operada para negocios pequeños en Chile. Nosotros armamos,
        operamos y mantenemos la infraestructura digital de tu negocio — web, posicionamiento, atención por
        WhatsApp y cobros. Tú contratas el servicio; nosotros lo ejecutamos.
      </Section>

      <Section title="2. El servicio">
        Al contratar Stefna recibes acceso a las cajas que seleccionaste durante el proceso de registro en
        stefna.app/empezar. Cada caja incluye funcionalidades específicas descritas en stefna.app al momento
        de la contratación. Nos reservamos el derecho de mejorar, modificar o actualizar las funcionalidades
        incluidas en cada caja, siempre manteniendo o superando el nivel de servicio contratado.
      </Section>

      <Section title="3. Tu dominio">
        El dominio web que registramos para tu negocio es tuyo. Si cancelas el servicio, el dominio permanece
        a tu nombre y puedes transferirlo o usarlo como quieras. Stefna no retiene dominios de clientes bajo
        ninguna circunstancia.
      </Section>

      <Section title="4. Pagos">
        El servicio se cobra mensualmente a través de MercadoPago. El monto corresponde a la suma de las cajas
        activas en tu plan (base $89.000 CLP/mes + cajas adicionales). Los precios pueden cambiar con aviso
        previo de 30 días. Si hay un cambio de precio, puedes cancelar sin penalización antes de que aplique.
      </Section>

      <Section title="5. Cancelación">
        Puedes cancelar en cualquier momento. No hay contratos de permanencia, multas ni penalizaciones.
        Al cancelar: tu dominio sigue siendo tuyo, tu web se desactiva dentro de 15 días, y el encargado de
        WhatsApp deja de operar. Los datos de tus clientes almacenados durante el servicio se eliminan dentro
        de 30 días posteriores a la cancelación, salvo que solicites una copia o existan obligaciones legales
        de retención.
      </Section>

      <Section title="6. Suspensión por falta de pago">
        Si el pago mensual no se registra dentro de los primeros 5 días del ciclo, el servicio de WhatsApp entra
        en modo reducido. Si el pago no se regulariza dentro de 15 días, el servicio se suspende completamente.
        Tu dominio no se ve afectado — sigue siendo tuyo.
      </Section>

      <Section title="7. Roles de protección de datos">
        Respecto a los datos de tu negocio (nombre, email, configuración), Stefna actúa como responsable del
        tratamiento. Respecto a los datos de tus clientes (conversaciones de WhatsApp, pedidos, pagos), Stefna
        actúa como encargado del tratamiento y tú como responsable. Esto significa que tú eres responsable de
        informar a tus clientes sobre el uso de un servicio automatizado de atención, conforme a la legislación
        chilena de protección de datos (Ley 19.628 y Ley 21.719).
      </Section>

      <Section title="8. Uso aceptable">
        El servicio es para negocios legítimos que operan en Chile. No se permite usar Stefna para actividades
        ilegales, spam, contenido discriminatorio o engañoso. Nos reservamos el derecho de suspender el servicio
        si detectamos un uso que viole esta política, con aviso previo salvo casos graves.
      </Section>

      <Section title="9. Propiedad intelectual">
        El diseño y código de tu sitio web son creados por Stefna. Mientras mantengas el servicio activo,
        tienes licencia plena de uso sobre tu sitio. Al cancelar, el contenido que tú proporcionaste (textos,
        fotos, catálogo) sigue siendo tuyo. El código y diseño base de Stefna no son transferibles. El dominio
        siempre es tuyo.
      </Section>

      <Section title="10. Limitación de responsabilidad">
        Stefna opera la infraestructura digital de tu negocio con el mayor cuidado posible, pero no garantizamos
        disponibilidad ininterrumpida del servicio. No somos responsables por pérdidas comerciales derivadas de
        interrupciones temporales, errores del encargado de WhatsApp o problemas de terceros (MercadoPago,
        proveedores de hosting, APIs de WhatsApp). Nuestra responsabilidad máxima se limita al valor de las
        mensualidades pagadas en los últimos 3 meses.
      </Section>

      <Section title="11. Fuerza mayor">
        Stefna no será responsable por incumplimientos causados por eventos fuera de su control razonable,
        incluyendo pero no limitado a: desastres naturales, interrupciones de internet, fallas de proveedores
        de infraestructura, cambios regulatorios, o restricciones de las APIs de terceros (WhatsApp, MercadoPago,
        Google).
      </Section>

      <Section title="12. Ley aplicable y jurisdicción">
        Estos términos se rigen por la legislación de la República de Chile. Para la resolución de cualquier
        controversia derivada de estos términos, las partes se someten a la jurisdicción de los tribunales
        ordinarios de justicia de Chile.
      </Section>

      <Section title="13. Cambios a estos términos">
        Podemos actualizar estos términos. Te notificaremos por WhatsApp o email con al menos 15 días de
        anticipación. Si continúas usando el servicio después de ese plazo, se entiende que aceptas los
        cambios.
      </Section>
    </LegalLayout>
  )
}
