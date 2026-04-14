import type { Metadata } from 'next'
import RubroLayout from '../components/RubroLayout'
import { CAJAS } from '../lib/cajas'

export const metadata: Metadata = {
  title: 'Presencia digital para restaurantes en Santiago — Stefna',
  description: 'Web, posicionamiento y gestión de pedidos por WhatsApp para tu restaurante en Santiago. Reservas, delivery y cobros operados por nosotros.',
  openGraph: {
    title: 'Presencia digital para restaurantes en Santiago',
    description: 'Tu restaurante en Santiago, siempre abierto. Web, reservas por WhatsApp y cobros — operados por Stefna.',
    url: 'https://stefna.app/restaurante-santiago',
  },
}

const relevantCajas = CAJAS.filter(c => ['web', 'whatsapp', 'payments', 'seo', 'social'].includes(c.id))

const conversation = [
  { from: 'client' as const, text: 'Hola, tienen mesa para 4 este viernes a las 9pm?' },
  { from: 'encargado' as const, text: 'Hola! Sí, tenemos disponibilidad el viernes a las 21:00 para 4 personas.\n\n¿A nombre de quién reservo? Y si alguien tiene alguna restricción alimentaria me cuentas para tenerlo listo.' },
  { from: 'client' as const, text: 'A nombre de Claudia. Uno es vegetariano' },
  { from: 'encargado' as const, text: 'Listo, Claudia! Reserva confirmada:\n\n· Viernes 18 abril, 21:00\n· Mesa para 4\n· 1 vegetariano (le tendremos opciones especiales)\n\nEstamos en Lastarria 220. Si necesitan cancelar o cambiar, me escriben por acá. Los esperamos!' },
]

export default function Page() {
  return (
    <RubroLayout
      rubro="Restaurante"
      city="Santiago"
      description="Tu restaurante pierde reservas cuando no puedes contestar. Armamos tu web, te posicionamos en Google y ponemos un asistente de WhatsApp que toma reservas, maneja restricciones alimentarias y coordina delivery — mientras tú cocinas."
      cajas={relevantCajas}
      conversation={conversation}
    />
  )
}
