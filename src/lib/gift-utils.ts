import type { GiftStatus } from './gifts'

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export function normalizeAmountDisplay(value: unknown) {
  const text = normalizeText(value)
  if (!text) {
    return ''
  }

  if (/^[\d,.]+$/.test(text)) {
    return `$${text}`
  }

  return text
}

export function normalizeEmail(value: unknown) {
  return normalizeText(value).toLowerCase()
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function toGiftStatus(value: unknown): GiftStatus {
  return value === 'claimed' || value === 'sent' ? value : 'unopened'
}
