import type { Metadata } from 'next'
import { DM_Serif_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import { safeJsonLd } from './lib/format'

const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], display: 'swap', variable: '--serif' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'], display: 'swap', variable: '--sans' })

export const metadata: Metadata = {
  metadataBase: new URL('https://stefna.app'),
  title: 'Stefna — Tu negocio, en rumbo.',
  description: 'Presencia digital completa para tu negocio. Web, posicionamiento, encargado de WhatsApp y cobros. Todo armado y operado por nosotros. Tú no tocas nada.',
  keywords: 'presencia digital pymes chile, página web negocio, whatsapp negocio, marketing digital pyme',
  openGraph: {
    title: 'Stefna — Tu negocio, en rumbo.',
    description: 'Presencia digital completa para tu negocio en Chile. Sin configurar nada.',
    url: 'https://stefna.app',
    siteName: 'Stefna',
    locale: 'es_CL',
    type: 'website',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Stefna',
  url: 'https://stefna.app',
  logo: 'https://stefna.app/logo.svg',
  description: 'Presencia digital completa para negocios pequeños en Chile: web, SEO local, encargado de WhatsApp 24/7 y cobros integrados, operados por Stefna.',
  areaServed: { '@type': 'Country', name: 'Chile' },
  sameAs: ['https://stefna.co'],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué incluye Stefna?',
      acceptedAnswer: { '@type': 'Answer', text: 'Página web con dominio propio, Google Maps, SEO local, encargado de WhatsApp 24/7 y cobros integrados. Todo armado y operado por nosotros.' },
    },
    {
      '@type': 'Question',
      name: '¿Tengo que configurar algo?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. Solo completas un formulario de 5 pasos y nosotros operamos todo. Tu negocio queda online en 72 horas.' },
    },
    {
      '@type': 'Question',
      name: '¿Hay contrato?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. Cancelas cuando quieras. El dominio siempre es tuyo.' },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta?',
      acceptedAnswer: { '@type': 'Answer', text: 'Armas tu plan eligiendo las cajas que necesitas. Desde $89.000 CLP/mes (solo web) hasta $345.000 CLP/mes (todo incluido). Lo más popular: web + WhatsApp + cobros + SEO a $266.000/mes.' },
    },
  ],
}

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Cómo empezar con Stefna',
  step: [
    { '@type': 'HowToStep', name: 'Crea tu cuenta', text: 'Completa nombre, email y WhatsApp en stefna.app/empezar' },
    { '@type': 'HowToStep', name: 'Cuéntanos del negocio', text: 'Nombre, rubro y ciudad. Opcional: conecta BSale para pre-llenar tu catálogo.' },
    { '@type': 'HowToStep', name: 'Define horarios y canal WA', text: 'Si ya tienes número de WhatsApp lo usamos; si no, te damos uno nuevo.' },
    { '@type': 'HowToStep', name: 'Elige plan', text: 'Arranque, Completo o Total — todos sin contrato.' },
    { '@type': 'HowToStep', name: 'Pago y lanzamiento', text: 'En 72 horas tu negocio queda online con web, SEO y encargado de WhatsApp.' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${dmSerif.variable} ${dmSans.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(howToSchema) }} />
      </head>
      <body className={dmSans.className}>{children}</body>
    </html>
  )
}
