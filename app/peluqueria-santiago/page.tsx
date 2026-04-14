import type { Metadata } from 'next'
import RubroLayout from '../components/RubroLayout'
import { CAJAS } from '../lib/cajas'

export const metadata: Metadata = {
  title: 'Presencia digital para peluquerías en Santiago — Stefna',
  description: 'Web, posicionamiento y reservas por WhatsApp para tu peluquería en Santiago. Todo operado por nosotros.',
  openGraph: {
    title: 'Presencia digital para peluquerías en Santiago',
    description: 'Tu peluquería en Santiago, siempre abierta. Web, reservas por WhatsApp y redes sociales — operados por Stefna.',
    url: 'https://stefna.app/peluqueria-santiago',
  },
}

const relevantCajas = CAJAS.filter(c => ['web', 'seo', 'social', 'whatsapp'].includes(c.id))

const conversation = [
  { from: 'client' as const, text: 'Hola, tienen hora para corte + tintura mañana?' },
  { from: 'encargado' as const, text: 'Hola! Mañana tenemos disponible:\n\n· 10:30 con Camila (corte + tintura)\n· 14:00 con Javiera (corte + tintura)\n· 16:30 con Camila\n\nCorte + tintura desde $35.000 dependiendo del largo. ¿Cuál te acomoda?' },
  { from: 'client' as const, text: 'Las 14:00 con Javiera. Tengo pelo largo' },
  { from: 'encargado' as const, text: 'Reservado! Mañana 14:00 con Javiera.\n\n· Corte + tintura pelo largo — $42.000\n· Duración aprox: 2 horas\n\nEstamos en Ñuñoa, Irarrázaval 2850. Si necesitas cancelar, avísame con 2 horas de anticipación. Te esperamos!' },
]

export default function Page() {
  return (
    <RubroLayout
      rubro="Peluquería"
      city="Santiago"
      description="Tu peluquería pierde clientes cuando no puedes contestar el teléfono. Armamos tu web, te posicionamos en Google y ponemos un asistente de WhatsApp que agenda horas, muestra disponibilidad y confirma — mientras tú atiendes."
      cajas={relevantCajas}
      conversation={conversation}
    />
  )
}
