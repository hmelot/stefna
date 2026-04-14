import type { PlanId } from './types'

export type Plan = {
  id: PlanId
  name: string
  price: number
  description: string
  items: string[]
  featured?: boolean
}

// Example plans shown on landing — actual pricing is per-caja in /empezar
export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Arranque',
    price: 89_000, // web only
    description: 'Para el negocio que quiere aparecer online por primera vez.',
    items: ['Web + dominio propio', 'Google Maps', 'Optimizada para móvil'],
  },
  {
    id: 'complete',
    name: 'Completo',
    price: 266_000, // web + seo + whatsapp + payments
    description: 'Para el negocio que quiere crecer sin contratar a nadie.',
    items: ['Web + dominio propio', 'Gestión de pedidos WhatsApp 24/7', 'Cobros integrados', 'SEO local activo'],
    featured: true,
  },
  {
    id: 'total',
    name: 'Total',
    price: 345_000, // web + seo + whatsapp + social + payments
    description: 'Para el negocio que quiere dominar su mercado local.',
    items: ['Todo de Completo', 'Redes sociales automáticas', 'Panel de control', 'Soporte prioritario'],
  },
]

export const getPlan = (id: PlanId): Plan => {
  const p = PLANS.find(plan => plan.id === id)
  if (!p) throw new Error(`Unknown plan: ${id}`)
  return p
}

// recommendedPlanFor removed — onboarding now uses cajas model (see lib/cajas.ts)
