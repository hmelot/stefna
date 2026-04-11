import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
