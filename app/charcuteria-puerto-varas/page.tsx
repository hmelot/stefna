import type { Metadata } from 'next'
import RubroLayout from '../components/RubroLayout'
import { CAJAS } from '../lib/cajas'

export const metadata: Metadata = {
  title: 'Presencia digital para charcuterías en Puerto Varas — Stefna',
  description: 'Web, posicionamiento y gestión de pedidos por WhatsApp para tu charcutería en Puerto Varas. Todo operado por nosotros. Tú no tocas nada.',
  openGraph: {
    title: 'Presencia digital para charcuterías en Puerto Varas',
    description: 'Tu charcutería en Puerto Varas, siempre abierta. Web, pedidos por WhatsApp y cobros — operados por Stefna.',
    url: 'https://stefna.app/charcuteria-puerto-varas',
  },
}

const relevantCajas = CAJAS.filter(c => ['web', 'whatsapp', 'payments', 'seo'].includes(c.id))

const conversation = [
  { from: 'client' as const, text: 'Hola, tienen tabla mixta disponible hoy?' },
  { from: 'encargado' as const, text: 'Hola! Sí, hoy tenemos:\n\n· Tabla mixta — jamón serrano, queso brie, aceitunas kalamata, higos — $12.900\n· Tabla de quesos premium — gruyère, camembert, manchego con mermelada de higos — $15.900\n· Sándwich de pastrami con mostaza de Dijon — $7.500\n\nTodas van con pan artesanal de la casa. ¿Te armo un pedido?' },
  { from: 'client' as const, text: 'La mixta y el pastrami. Hacen delivery a Llanquihue?' },
  { from: 'encargado' as const, text: 'Sí! Delivery a Llanquihue cuesta $3.000, demora aprox 40 min.\n\nTu pedido:\n· Tabla mixta — $12.900\n· Sándwich pastrami — $7.500\n· Delivery — $3.000\nTotal: $23.400\n\nTe mando el link de pago:' },
]

export default function Page() {
  return (
    <RubroLayout
      rubro="Charcutería"
      city="Puerto Varas"
      description="Tu charcutería en Puerto Varas merece que la encuentren. Armamos tu web, posicionamos tu negocio en Google y ponemos un asistente de WhatsApp que toma pedidos, recomienda productos y cobra — mientras tú te enfocas en lo que sabes hacer."
      cajas={relevantCajas}
      conversation={conversation}
    />
  )
}
