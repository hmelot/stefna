import type { Metadata } from 'next'
import RubroLayout from '../components/RubroLayout'
import { CAJAS } from '../lib/cajas'

export const metadata: Metadata = {
  title: 'Presencia digital para tiendas en Santiago — Stefna',
  description: 'Web, posicionamiento y ventas por WhatsApp para tu tienda en Santiago. Catálogo, cobros y delivery operados por nosotros.',
  openGraph: {
    title: 'Presencia digital para tiendas en Santiago',
    description: 'Tu tienda en Santiago, siempre abierta. Web, catálogo por WhatsApp y cobros — operados por Stefna.',
    url: 'https://stefna.app/tienda-santiago',
  },
}

const relevantCajas = CAJAS.filter(c => ['web', 'whatsapp', 'payments', 'seo'].includes(c.id))

const conversation = [
  { from: 'client' as const, text: 'Hola, tienen la mochila negra que vi en Instagram?' },
  { from: 'encargado' as const, text: 'Hola! Sí, la mochila urbana negra está disponible:\n\n· Mochila Urban 25L negra — $34.900\n· Tiene compartimento para notebook 15", bolsillo antirrobo y tela impermeable\n\nTambién tenemos en gris oscuro y verde militar. ¿Cuál te gusta?' },
  { from: 'client' as const, text: 'La negra. Hacen envío a Maipú?' },
  { from: 'encargado' as const, text: 'Sí! Envío a Maipú por Starken, llega en 1-2 días hábiles — $3.500.\n\nTu pedido:\n· Mochila Urban 25L negra — $34.900\n· Envío Maipú — $3.500\nTotal: $38.400\n\n¿Te mando el link de pago?' },
]

export default function Page() {
  return (
    <RubroLayout
      rubro="Tienda"
      city="Santiago"
      description="Tu tienda recibe consultas por Instagram y WhatsApp que no alcanzas a responder. Armamos tu web con catálogo, te posicionamos en Google y ponemos un asistente de WhatsApp que vende, recomienda y cobra — 24/7."
      cajas={relevantCajas}
      conversation={conversation}
    />
  )
}
