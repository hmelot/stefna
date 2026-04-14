// UX-only client validation. Server-side validation lives in the Worker.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const PHONE_RE = /^\+?[\d\s\-()]{8,20}$/

export const isValidEmail = (s: string): boolean => s.trim().length <= 254 && EMAIL_RE.test(s.trim())
export const isValidPhone = (s: string): boolean => PHONE_RE.test(s.trim())
