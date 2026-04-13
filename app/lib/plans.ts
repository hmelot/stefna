import type { PlanId } from './types'

export type Plan = {
  id: PlanId
  name: string
  price: number
  description: string
  items: string[]
  featured?: boolean
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Arranque',
    price: 89_000,
    description: 'Para el negocio que quiere aparecer online por primera vez.',
    items: ['Web + dominio propio', 'Google Maps', 'Link de cobro', 'Soporte por WhatsApp'],
  },
  {
    id: 'complete',
    name: 'Completo',
    price: 266_000,
    description: 'Para el negocio que quiere crecer sin contratar a nadie.',
    items: ['Todo de Arranque', 'Encargado de WhatsApp 24/7', 'Cobros integrados', 'SEO local activo', 'Dashboard de resultados'],
    featured: true,
  },
  {
    id: 'total',
    name: 'Total',
    price: 345_000,
    description: 'Para el negocio que quiere dominar su mercado local.',
    items: ['Todo de Completo', 'Redes sociales automáticas', 'Reportes mensuales', 'Soporte prioritario'],
  },
]

export const getPlan = (id: PlanId): Plan => {
  const p = PLANS.find(plan => plan.id === id)
  if (!p) throw new Error(`Unknown plan: ${id}`)
  return p
}

// recommendedPlanFor removed — onboarding now uses cajas model (see lib/cajas.ts)
