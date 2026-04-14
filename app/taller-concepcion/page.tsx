import type { Metadata } from 'next'
import RubroLayout from '../components/RubroLayout'
import { CAJAS } from '../lib/cajas'

export const metadata: Metadata = {
  title: 'Presencia digital para talleres en Concepción — Stefna',
  description: 'Web, posicionamiento y cotizaciones por WhatsApp para tu taller en Concepción. Todo operado por nosotros.',
  openGraph: {
    title: 'Presencia digital para talleres en Concepción',
    description: 'Tu taller en Concepción, siempre abierto. Web, cotizaciones por WhatsApp y cobros — operados por Stefna.',
    url: 'https://stefna.app/taller-concepcion',
  },
}

const relevantCajas = CAJAS.filter(c => ['web', 'seo', 'payments', 'whatsapp'].includes(c.id))

const conversation = [
  { from: 'client' as const, text: 'Hola, se me rompió la pantalla del iPhone 14, cuánto sale?' },
  { from: 'encargado' as const, text: 'Hola! Cambio de pantalla iPhone 14:\n\n· Pantalla original Apple — $189.000\n· Pantalla alternativa premium — $89.000\n\nAmbas con 3 meses de garantía. El cambio demora aprox 45 minutos.\n\n¿Quieres agendar una hora? Estamos en Barros Arana 520, Concepción.' },
  { from: 'client' as const, text: 'La alternativa premium. Puedo ir mañana en la mañana?' },
  { from: 'encargado' as const, text: 'Perfecto! Te agendo:\n\n· Mañana 10:00\n· Cambio pantalla iPhone 14 (alternativa premium) — $89.000\n· Garantía: 3 meses\n\nTrae tu cargador para que probemos todo antes de entregártelo. Nos vemos!' },
]

export default function Page() {
  return (
    <RubroLayout
      rubro="Taller"
      city="Concepción"
      description="Tu taller de reparaciones pierde cotizaciones cuando no puedes contestar. Armamos tu web, te posicionamos en Google y ponemos un asistente de WhatsApp que cotiza, agenda y cobra — mientras tú reparas."
      cajas={relevantCajas}
      conversation={conversation}
    />
  )
}
