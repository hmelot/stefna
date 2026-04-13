import { LegalLayout, Section } from '../components/LegalLayout'

export default function Privacidad() {
  return (
    <LegalLayout title="Política de privacidad" date="Última actualización: 12 de abril de 2026">
      <Section title="1. Responsable del tratamiento">
        El responsable del tratamiento de datos personales es Stefna, operado por Horacio Melot, con domicilio
        en Chile. Para cualquier consulta sobre protección de datos, puedes escribir a contacto a través del
        formulario en stefna.app.
      </Section>

      <Section title="2. Qué datos recopilamos">
        Durante el registro recopilamos: nombre, email, número de WhatsApp, nombre del negocio, rubro, ciudad
        y preferencias de servicio. Durante la operación del servicio, procesamos las conversaciones de WhatsApp
        entre tus clientes y el encargado, datos de pedidos y transacciones de pago. No recopilamos datos
        sensibles según el artículo 2 letra g) de la Ley 19.628 (origen racial, opiniones políticas, salud,
        vida sexual u orientación sexual).
      </Section>

      <Section title="3. Base legal del tratamiento">
        Procesamos tus datos personales en base a: (a) tu consentimiento expreso otorgado al completar el
        formulario de registro en stefna.app/empezar; y (b) la necesidad contractual para ejecutar el servicio
        que contrataste, conforme al artículo 4 de la Ley 19.628 y las disposiciones de la Ley 21.719 sobre
        tratamiento de datos personales.
      </Section>

      <Section title="4. Para qué los usamos">
        Usamos tus datos exclusivamente para: operar el servicio contratado (armar tu web, entrenar al encargado
        de WhatsApp, procesar cobros, mostrarte métricas en tu panel), comunicarnos contigo sobre el estado del
        servicio, y mejorar la calidad del producto. No vendemos, alquilamos ni compartimos tus datos con terceros
        para fines publicitarios o de marketing.
      </Section>

      <Section title="5. Datos de tus clientes">
        Cuando operas el servicio, Stefna actúa como encargado del tratamiento (procesador) de los datos de
        tus clientes. Tú eres el responsable del tratamiento de esos datos. Las conversaciones de WhatsApp y
        datos de pedidos de tus clientes se almacenan de forma segura y se usan únicamente para operar el
        servicio de tu negocio. No contactamos a tus clientes directamente ni usamos sus datos para otros fines.
        Es tu responsabilidad informar a tus clientes que utilizas un servicio de atención automatizada.
      </Section>

      <Section title="6. Decisiones automatizadas">
        El servicio de encargado de WhatsApp utiliza procesamiento automatizado para responder consultas,
        tomar pedidos y gestionar conversaciones en nombre de tu negocio. Estas respuestas se generan en base
        al contexto de tu negocio (menú, precios, horarios, zona de delivery) que proporcionaste durante el
        registro. No se toman decisiones automatizadas que produzcan efectos jurídicos o significativos sobre
        personas naturales sin intervención humana.
      </Section>

      <Section title="7. Transferencia internacional de datos">
        Para operar el servicio, tus datos pueden ser transferidos y procesados fuera de Chile por los
        siguientes proveedores: Cloudflare (infraestructura global, certificación SOC 2, ISO 27001),
        Meta/WhatsApp (procesamiento de mensajes, servidores globales), y MercadoPago (procesamiento de pagos,
        servidores en Latinoamérica). Estas transferencias se realizan con las garantías adecuadas conforme
        a la normativa vigente. No almacenamos datos de tarjetas de crédito.
      </Section>

      <Section title="8. Retención de datos">
        Mientras tu cuenta esté activa, conservamos todos los datos necesarios para operar el servicio.
        Datos de registro y configuración: mientras dure la relación contractual. Conversaciones de WhatsApp:
        90 días desde la conversación, salvo pedidos activos. Datos de transacciones: según obligaciones
        tributarias aplicables (mínimo 6 años). Al cancelar, eliminamos tus datos y los de tus clientes
        dentro de 30 días, salvo que solicites una copia o existan obligaciones legales de retención.
      </Section>

      <Section title="9. Tus derechos">
        Conforme a la legislación chilena de protección de datos, tienes derecho a: acceder a tus datos
        personales y obtener copia de ellos; rectificar datos inexactos o incompletos; solicitar la
        eliminación de tus datos (lo que implica cancelar el servicio); oponerte al tratamiento de tus datos;
        solicitar la portabilidad de tus datos en formato estructurado; retirar tu consentimiento en cualquier
        momento (sin que esto afecte la licitud del tratamiento previo); y no ser objeto de decisiones basadas
        únicamente en tratamiento automatizado que produzcan efectos jurídicos. Para ejercer estos derechos,
        contáctanos a través de stefna.app. Responderemos dentro de 2 días hábiles conforme al artículo 12
        de la Ley 19.628.
      </Section>

      <Section title="10. Seguridad y brechas">
        Implementamos medidas técnicas y organizativas para proteger tus datos, incluyendo cifrado en
        tránsito (TLS), almacenamiento en infraestructura certificada, y control de acceso restringido.
        En caso de una brecha de seguridad que afecte tus datos personales, te notificaremos sin demora
        indebida, informando la naturaleza de la brecha, los datos afectados, las medidas adoptadas y
        las recomendaciones para mitigar riesgos.
      </Section>

      <Section title="11. Cookies y almacenamiento local">
        stefna.app usa almacenamiento local del navegador (localStorage) para guardar el progreso del formulario
        de registro. No usamos cookies de rastreo, analytics de terceros ni píxeles de seguimiento.
      </Section>

      <Section title="12. Menores de edad">
        El servicio de Stefna está dirigido a personas mayores de 18 años que operan un negocio. No
        recopilamos intencionalmente datos de menores de edad. Si detectamos que hemos recopilado datos
        de un menor, los eliminaremos de inmediato.
      </Section>

      <Section title="13. Ley aplicable">
        Esta política se rige por la legislación de la República de Chile, incluyendo la Ley 19.628 sobre
        Protección de la Vida Privada y la Ley 21.719 que la reforma. Cualquier controversia será sometida
        a los tribunales ordinarios de justicia de Chile.
      </Section>

      <Section title="14. Cambios">
        Si modificamos esta política, te notificamos por WhatsApp o email con al menos 15 días de anticipación.
      </Section>
    </LegalLayout>
  )
}
