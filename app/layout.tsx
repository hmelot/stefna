import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stefna — Tu negocio, en rumbo.',
  description: 'Presencia digital para negocios que quieren crecer. Web, posicionamiento, cobros y atención — todo resuelto.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
