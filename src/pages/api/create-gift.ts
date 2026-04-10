import type { NextApiRequest, NextApiResponse } from 'next'

import { createGift, CreateGiftInput } from '../../lib/gifts'
import {
  isValidEmail,
  normalizeAmountDisplay,
  normalizeEmail,
  normalizeText
} from '../../lib/gift-utils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const body = req.body as Partial<CreateGiftInput>
  const payload: CreateGiftInput = {
    giftId: normalizeText(body.giftId),
    recipientName: normalizeText(body.recipientName),
    recipientEmail: normalizeEmail(body.recipientEmail),
    senderName: normalizeText(body.senderName) || 'Uncle Cole',
    senderEmail: normalizeEmail(body.senderEmail),
    occasion: normalizeText(body.occasion),
    coin: normalizeText(body.coin).toUpperCase(),
    amountDisplay: normalizeAmountDisplay(body.amountDisplay),
    messageFromYou: normalizeText(body.messageFromYou),
    origin: normalizeText(body.origin)
  }

  if (
    !payload.giftId ||
    !payload.recipientName ||
    !payload.recipientEmail ||
    !payload.senderName ||
    !payload.senderEmail ||
    !payload.coin ||
    !payload.amountDisplay
  ) {
    return res.status(400).json({ error: 'Please fill out every field.' })
  }

  if (!isValidEmail(payload.recipientEmail)) {
    return res.status(400).json({ error: 'Please enter a valid recipient email.' })
  }

  if (!isValidEmail(payload.senderEmail)) {
    return res.status(400).json({ error: 'Please enter a valid sender email.' })
  }

  try {
    const gift = await createGift(payload)
    return res.status(200).json({ ok: true, gift })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create gift.'
    const statusCode = message.includes('already exists') ? 409 : 500
    return res.status(statusCode).json({ error: message })
  }
}
