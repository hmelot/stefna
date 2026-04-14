import type { CajaId, Industry } from './types'

export type Caja = {
  id: CajaId
  num: string
  name: string
  slug: string
  desc: string
  price: number
  included: boolean // true = always included in base, can't uncheck
  featured?: boolean
  items: string[]
  accent: string
  accentBorder: string
}

export const CAJAS: Caja[] = [
  {
    id: 'web',
    num: '01',
    name: 'Tu vitrina en internet',
    slug: 'Web',
    desc: 'Landing profesional con dominio propio. Apareces en Google Maps desde el día uno. Si ya tienes web, no la necesitas.',
    price: 89_000,
    included: false,
    items: ['Dominio .com propio', 'Diseño personalizado', 'Ficha Google Maps', 'Optimizada para móvil'],
    accent: 'rgba(93,202,165,0.08)',
    accentBorder: 'rgba(93,202,165,0.2)',
  },
  {
    id: 'seo',
    num: '02',
    name: 'Que te encuentren primero',
    slug: 'SEO local',
    desc: 'Cuando buscan tu rubro en tu ciudad, apareces tú — no la competencia.',
    price: 59_000,
    included: false,
    items: ['Google Business Profile', 'Keywords locales', 'Reseñas gestionadas', 'Reportes mensuales'],
    accent: 'rgba(93,165,202,0.08)',
    accentBorder: 'rgba(93,165,202,0.2)',
  },
  {
    id: 'whatsapp',
    num: '03',
    name: 'Gestión de pedidos por WhatsApp',
    slug: 'Pedidos WA',
    desc: 'Un asistente automatizado entrenado con tu negocio. Toma pedidos, recomienda productos, coordina delivery y cobra — 24/7, sin que toques el teléfono.',
    price: 89_000,
    included: false,
    featured: true,
    items: ['Entrenado con tu catálogo y precios', 'Toma pedidos completos', 'Recomienda como experto', 'Disponible 24/7'],
    accent: 'rgba(93,202,120,0.08)',
    accentBorder: 'rgba(93,202,120,0.25)',
  },
  {
    id: 'social',
    num: '04',
    name: 'Redes sin esfuerzo',
    slug: 'Redes',
    desc: 'Publicaciones semanales en Instagram y Facebook. Tu presencia activa sin que toques nada.',
    price: 79_000,
    included: false,
    items: ['4 posts por semana', 'Diseño con tu marca', 'Calendario editorial', 'Historias incluidas'],
    accent: 'rgba(165,93,202,0.08)',
    accentBorder: 'rgba(165,93,202,0.2)',
  },
  {
    id: 'payments',
    num: '05',
    name: 'Cobros sin fricción',
    slug: 'Cobros',
    desc: 'Tu cliente paga en 2 clicks desde WhatsApp. Link de pago, transferencia o tarjeta — sin POS, sin apps extra.',
    price: 29_000,
    included: false,
    items: ['MercadoPago integrado', 'Link de pago directo por WA', 'Confirmación automática al cliente'],
    accent: 'rgba(202,165,93,0.08)',
    accentBorder: 'rgba(202,165,93,0.2)',
  },
  {
    id: 'dashboard',
    num: '06',
    name: 'Control de tu negocio',
    slug: 'Panel',
    desc: 'Un panel intuitivo que te ayuda a tomar decisiones. Pedidos, visitas, conversaciones y todo lo que está pasando — en un solo lugar.',
    price: 0,
    included: false,
    items: ['Pedidos en tiempo real', 'Visitas a tu web por fuente', 'Conversaciones WA', 'Resumen semanal automático'],
    accent: 'rgba(202,93,93,0.08)',
    accentBorder: 'rgba(202,93,93,0.2)',
  },
]

export const getCaja = (id: CajaId): Caja => {
  const c = CAJAS.find(caja => caja.id === id)
  if (!c) throw new Error(`Unknown caja: ${id}`)
  return c
}

export const calcTotal = (selected: CajaId[]): number => {
  return CAJAS.filter(c => selected.includes(c.id)).reduce((sum, c) => sum + c.price, 0)
}

// What we recommend per industry — ordered by impact
export const recommendedCajasFor: Record<Industry, CajaId[]> = {
  deli: ['web', 'whatsapp', 'payments', 'seo'],
  restaurant: ['web', 'whatsapp', 'payments', 'seo'],
  bakery: ['web', 'whatsapp', 'payments', 'seo'],
  bar: ['web', 'seo', 'social'],
  retail: ['web', 'whatsapp', 'payments', 'seo'],
  beauty: ['web', 'seo', 'social'],
  workshop: ['web', 'seo', 'payments'],
  services: ['web', 'seo', 'payments'],
  education: ['web', 'seo', 'social'],
  other: ['web', 'whatsapp', 'seo'],
}
