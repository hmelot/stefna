// Domain types. Identifiers in English, display labels in Spanish (see labels.ts).

export type PlanId = 'starter' | 'complete' | 'total'

export type CajaId = 'web' | 'seo' | 'social' | 'whatsapp' | 'payments' | 'dashboard'

export type Industry =
  | 'deli' | 'restaurant' | 'bakery' | 'bar' | 'retail'
  | 'beauty' | 'workshop' | 'services' | 'education' | 'other'

export type Status = 'green' | 'amber' | 'red' | 'gray'

export type WhatsappChannel = 'existing' | 'new'
