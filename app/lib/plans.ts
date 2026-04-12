import type { PlanId, Industry } from './types'

export type Plan = {
  id: PlanId
  name: string
  price: string
  priceValue: number
  description: string
  items: string[]
  featured?: boolean
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Arranque',
    price: '49.000',
    priceValue: 49_000,
    description: 'Para el negocio que quiere aparecer online por primera vez.',
    items: ['Web + dominio propio', 'Google Maps y SEO básico', 'Link de cobro', 'Soporte por WhatsApp'],
  },
  {
    id: 'complete',
    name: 'Completo',
    price: '149.000',
    priceValue: 149_000,
    description: 'Para el negocio que quiere crecer sin contratar a nadie.',
    items: ['Todo de Arranque', 'Encargado de WhatsApp 24/7', 'Cobros integrados', 'SEO local activo', 'Dashboard de resultados'],
    featured: true,
  },
  {
    id: 'total',
    name: 'Total',
    price: '249.000',
    priceValue: 249_000,
    description: 'Para el negocio que quiere dominar su mercado local.',
    items: ['Todo de Completo', 'Redes sociales automáticas', 'Reportes mensuales', 'Soporte prioritario'],
  },
]

export const getPlan = (id: PlanId): Plan => {
  const p = PLANS.find(plan => plan.id === id)
  if (!p) throw new Error(`Unknown plan: ${id}`)
  return p
}

export const recommendedPlanFor: Record<Industry, PlanId> = {
  deli: 'complete',
  restaurant: 'complete',
  bakery: 'complete',
  bar: 'complete',
  retail: 'complete',
  beauty: 'starter',
  workshop: 'starter',
  services: 'starter',
  education: 'starter',
  other: 'complete',
}
