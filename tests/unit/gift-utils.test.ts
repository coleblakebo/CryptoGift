import { describe, expect, it } from 'vitest'

import {
  isValidEmail,
  normalizeAmountDisplay,
  normalizeEmail,
  normalizeText,
  slugify,
  toGiftStatus
} from '../../src/lib/gift-utils'

describe('gift utils', () => {
  it('slugifies user-facing values into route-safe ids', () => {
    expect(slugify("Izzy D St. Patrick's Day 2026")).toBe('izzy-d-st-patrick-s-day-2026')
    expect(slugify('  Easter !!! ')).toBe('easter')
  })

  it('normalizes text and email values', () => {
    expect(normalizeText('  Uncle Cole  ')).toBe('Uncle Cole')
    expect(normalizeText(null)).toBe('')
    expect(normalizeEmail('  TEST@Example.COM  ')).toBe('test@example.com')
  })

  it('formats plain numeric amount displays as dollars', () => {
    expect(normalizeAmountDisplay('10')).toBe('$10')
    expect(normalizeAmountDisplay('1,000')).toBe('$1,000')
    expect(normalizeAmountDisplay('$25')).toBe('$25')
    expect(normalizeAmountDisplay('')).toBe('')
  })

  it('validates email addresses used in the create flow', () => {
    expect(isValidEmail('izzy@example.com')).toBe(true)
    expect(isValidEmail('bad-email')).toBe(false)
    expect(isValidEmail('izzy@')).toBe(false)
  })

  it('maps unknown statuses back to unopened', () => {
    expect(toGiftStatus('claimed')).toBe('claimed')
    expect(toGiftStatus('sent')).toBe('sent')
    expect(toGiftStatus('created')).toBe('unopened')
    expect(toGiftStatus(undefined)).toBe('unopened')
  })
})
