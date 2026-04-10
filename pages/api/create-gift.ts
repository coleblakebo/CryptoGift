import type { NextApiRequest, NextApiResponse } from 'next'

import { createGift, CreateGiftInput } from '../../lib/gifts'

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeAmountDisplay(value: unknown) {
  const text = normalizeText(value)
  if (!text) {
    return ''
  }

  if (/^[\d,.]+$/.test(text)) {
    return `$${text}`
  }

  return text
}

function normalizeEmail(value: unknown) {
  return normalizeText(value).toLowerCase()
}

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

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.recipientEmail)) {
    return res.status(400).json({ error: 'Please enter a valid recipient email.' })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.senderEmail)) {
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
