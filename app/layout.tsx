import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stefna — Tu negocio, en movimiento',
  description: 'Presencia digital premium para negocios que quieren crecer.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
