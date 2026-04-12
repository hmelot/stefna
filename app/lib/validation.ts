// UX-only client validation. Server-side validation lives in the Worker.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const MIN_PHONE_LENGTH = 8

export const isValidEmail = (s: string): boolean => EMAIL_RE.test(s.trim())
export const isValidPhone = (s: string): boolean => s.trim().length >= MIN_PHONE_LENGTH
