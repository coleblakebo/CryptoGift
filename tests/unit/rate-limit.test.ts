import { describe, expect, it } from 'vitest'

import { createMemoryRateLimiter, getRequestIp } from '../../src/lib/rate-limit'

describe('rate limit utilities', () => {
  it('allows requests until the limit is reached', () => {
    const checkRateLimit = createMemoryRateLimiter()

    expect(checkRateLimit('create:127.0.0.1', { limit: 2, windowMs: 1000, now: 1000 })).toMatchObject({
      allowed: true,
      remaining: 1
    })
    expect(checkRateLimit('create:127.0.0.1', { limit: 2, windowMs: 1000, now: 1200 })).toMatchObject({
      allowed: true,
      remaining: 0
    })
    expect(checkRateLimit('create:127.0.0.1', { limit: 2, windowMs: 1000, now: 1300 })).toMatchObject({
      allowed: false,
      remaining: 0
    })
  })

  it('resets the window after enough time passes', () => {
    const checkRateLimit = createMemoryRateLimiter()

    checkRateLimit('claim:127.0.0.1', { limit: 1, windowMs: 1000, now: 1000 })
    expect(checkRateLimit('claim:127.0.0.1', { limit: 1, windowMs: 1000, now: 1500 }).allowed).toBe(false)
    expect(checkRateLimit('claim:127.0.0.1', { limit: 1, windowMs: 1000, now: 2101 }).allowed).toBe(true)
  })

  it('prefers x-forwarded-for and normalizes ipv6-mapped ipv4 addresses', () => {
    expect(
      getRequestIp({
        headers: { 'x-forwarded-for': '203.0.113.7, 10.0.0.1' },
        socket: { remoteAddress: '::ffff:127.0.0.1' } as never
      })
    ).toBe('203.0.113.7')

    expect(
      getRequestIp({
        headers: {},
        socket: { remoteAddress: '::ffff:127.0.0.1' } as never
      })
    ).toBe('127.0.0.1')
  })
})
