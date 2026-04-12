import type { Industry } from './types'

export const INDUSTRY_LABELS: Record<Industry, string> = {
  deli: 'Charcutería/Deli',
  restaurant: 'Restaurante/Café',
  bakery: 'Panadería/Pastelería',
  bar: 'Bar/Botillería',
  retail: 'Tienda/Retail',
  beauty: 'Salud/Belleza',
  workshop: 'Taller/Reparaciones',
  services: 'Servicios',
  education: 'Educación/Clases',
  other: 'Otro',
}

export const INDUSTRIES: Industry[] = [
  'deli', 'restaurant', 'bakery', 'bar', 'retail',
  'beauty', 'workshop', 'services', 'education', 'other',
]

export const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const
export type Weekday = typeof WEEKDAYS[number]
