import type { NextApiRequest, NextApiResponse } from 'next'

import { sendGiftClaimedEmail } from '../../lib/email'
import { claimGift } from '../../lib/gifts'
import { checkRateLimit, getRequestIp } from '../../lib/rate-limit'

type ClaimRequest = {
  giftId: string
  walletAddress?: string
  senderAlreadyHasAddress?: boolean
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const ip = getRequestIp(req)
  const rateLimit = checkRateLimit(`claim-gift:${ip}`, {
    limit: 12,
    windowMs: 15 * 60 * 1000
  })

  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds))
    return res.status(429).json({ error: 'Too many claim attempts. Please try again later.' })
  }

  const body = req.body as Partial<ClaimRequest>
  const senderAlreadyHasAddress = Boolean(body.senderAlreadyHasAddress)
  const walletAddress = body.walletAddress?.trim() || null

  if (!body.giftId || (!senderAlreadyHasAddress && !walletAddress)) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  try {
    const gift = await claimGift(body.giftId, senderAlreadyHasAddress ? null : walletAddress)
    const email = await sendGiftClaimedEmail(gift)
    return res.status(200).json({ ok: true, gift, email })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save'
    const statusCode = message.includes('not found')
      ? 404
      : message.includes('already')
        ? 409
        : 500
    return res.status(statusCode).json({ error: message })
  }
}
