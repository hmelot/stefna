import type { Status } from './types'

export const formatCLP = (n: number): string => '$' + n.toLocaleString('es-CL')

const STATUS_COLORS: Record<Status, string> = {
  green: '#5DCAA5',
  amber: '#E0A85A',
  red: '#D9544F',
  gray: '#555555',
}

export const statusColor = (s: Status): string => STATUS_COLORS[s]

/** Escape JSON for safe embedding inside <script type="application/ld+json">. */
export const safeJsonLd = (value: unknown): string =>
  JSON.stringify(value).replace(/</g, '\\u003c')
