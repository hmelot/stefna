import type { Metadata } from 'next'
import RubroLayout from '../components/RubroLayout'
import { CAJAS } from '../lib/cajas'

export const metadata: Metadata = {
  title: 'Presencia digital para panaderías en Santiago — Stefna',
  description: 'Web, posicionamiento y gestión de pedidos por WhatsApp para tu panadería en Santiago. Todo operado por nosotros.',
  openGraph: {
    title: 'Presencia digital para panaderías en Santiago',
    description: 'Tu panadería en Santiago, siempre abierta. Web, pedidos por WhatsApp y cobros — operados por Stefna.',
    url: 'https://stefna.app/panaderia-santiago',
  },
}

const relevantCajas = CAJAS.filter(c => ['web', 'whatsapp', 'payments', 'seo'].includes(c.id))

const conversation = [
  { from: 'client' as const, text: 'Hola, necesito un queque de chocolate para mañana, tienen?' },
  { from: 'encargado' as const, text: 'Hola! Sí, tenemos queques de chocolate. ¿Para cuántas personas?\n\n· Queque chocolate 8 personas — $8.900\n· Queque chocolate 15 personas — $14.500\n· Torta chocolate con ganache 12 personas — $22.000\n\nTambién podemos decorarlo con un mensaje si quieres.' },
  { from: 'client' as const, text: 'El de 15, que diga Feliz Cumple Sofía' },
  { from: 'encargado' as const, text: 'Perfecto! Queque chocolate 15 personas con "Feliz Cumple Sofía" — $14.500.\n\n¿Lo retiras en local o necesitas delivery? Estamos en Providencia, abiertos desde las 8am.' },
]

export default function Page() {
  return (
    <RubroLayout
      rubro="Panadería"
      city="Santiago"
      description="Tu panadería tiene clientes que quieren hacer pedidos a cualquier hora. Armamos tu web, te posicionamos en Google Maps y ponemos un asistente de WhatsApp que toma pedidos de tortas, panes y pasteles — 24/7, sin que toques el teléfono."
      cajas={relevantCajas}
      conversation={conversation}
    />
  )
}
