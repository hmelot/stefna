import type { Metadata } from 'next'
import RubroLayout from '../components/RubroLayout'
import { CAJAS } from '../lib/cajas'

export const metadata: Metadata = {
  title: 'Presencia digital para cafés en Valparaíso — Stefna',
  description: 'Web, posicionamiento y redes sociales para tu café en Valparaíso. Todo operado por nosotros.',
  openGraph: {
    title: 'Presencia digital para cafés en Valparaíso',
    description: 'Tu café en Valparaíso, siempre visible. Web, SEO y redes sociales — operados por Stefna.',
    url: 'https://stefna.app/cafe-valparaiso',
  },
}

const relevantCajas = CAJAS.filter(c => ['web', 'seo', 'social', 'whatsapp'].includes(c.id))

const conversation = [
  { from: 'client' as const, text: 'Qué café de especialidad tienen hoy?' },
  { from: 'encargado' as const, text: 'Hoy tenemos dos orígenes:\n\n· Colombia Huila — notas de caramelo y nuez, cuerpo medio. Filtrado o espresso.\n· Etiopía Yirgacheffe — floral, cítrico, ideal en V60.\n\nAmbos a $3.200 la taza. También tenemos cold brew del Huila a $3.800.\n\n¿Vienes al local o quieres que te guardemos un V60 del Yirgacheffe?' },
  { from: 'client' as const, text: 'Voy para allá en 20min, guárdame el Yirgacheffe' },
  { from: 'encargado' as const, text: 'Listo! Te tenemos un V60 del Yirgacheffe esperando. Estamos en Cerro Alegre, Templeman 583. Nos vemos!' },
]

export default function Page() {
  return (
    <RubroLayout
      rubro="Café"
      city="Valparaíso"
      description="Tu café de especialidad merece que lo encuentren los que saben. Armamos tu web, te posicionamos en Google Maps y publicamos contenido en tus redes — para que los amantes del café en Valparaíso lleguen a ti."
      cajas={relevantCajas}
      conversation={conversation}
    />
  )
}
