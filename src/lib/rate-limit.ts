import type { NextApiRequest } from 'next'

type RateLimitOptions = {
  limit: number
  windowMs: number
  now?: number
}

type RateLimitResult = {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

export function createMemoryRateLimiter() {
  const hitsByKey = new Map<string, number[]>()

  return function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
    const now = options.now ?? Date.now()
    const windowStart = now - options.windowMs
    const recentHits = (hitsByKey.get(key) || []).filter((timestamp) => timestamp > windowStart)

    if (recentHits.length >= options.limit) {
      const oldestHit = recentHits[0]
      const retryAfterMs = oldestHit + options.windowMs - now

      hitsByKey.set(key, recentHits)

      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000))
      }
    }

    recentHits.push(now)
    hitsByKey.set(key, recentHits)

    return {
      allowed: true,
      remaining: Math.max(0, options.limit - recentHits.length),
      retryAfterSeconds: 0
    }
  }
}

export function getRequestIp(req: Pick<NextApiRequest, 'headers' | 'socket'>) {
  const forwardedFor = req.headers['x-forwarded-for']
  const rawIp =
    typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0]?.trim()
      : req.socket.remoteAddress || 'unknown'

  return rawIp.replace(/^::ffff:/, '') || 'unknown'
}

export const checkRateLimit = createMemoryRateLimiter()
