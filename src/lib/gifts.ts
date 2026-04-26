import { query, withTransaction } from './db'
import { toGiftStatus } from './gift-utils'

type GiftRow = {
  gift_id: string
  recipient_name: string
  recipient_email: string
  sender_name: string
  sender_email: string
  occasion: string
  coin: string
  amount_display: string
  message_from_you: string
  status: string
  wallet_address: string | null
  claimed_at: Date | string | null
  created_at: Date | string | null
}

export type GiftStatus = 'unopened' | 'claimed' | 'sent'

export type Gift = {
  giftId: string
  recipientName: string
  recipientEmail: string
  senderName: string
  senderEmail: string
  occasion: string
  coin: string
  amountDisplay: string
  messageFromYou: string
  status: GiftStatus
  walletAddress?: string | null
  claimedAt?: string | null
  createdAt?: string | null
}

export type CreateGiftInput = {
  giftId: string
  recipientName: string
  recipientEmail: string
  senderName: string
  senderEmail: string
  occasion: string
  coin: string
  amountDisplay: string
  messageFromYou: string
}

function toIsoString(value: Date | string | null) {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString()
}

export function mapGiftRowToGift(row: GiftRow): Gift {
  const status = toGiftStatus(row.status)

  return {
    giftId: row.gift_id,
    recipientName: row.recipient_name,
    recipientEmail: row.recipient_email,
    senderName: row.sender_name || 'Uncle Cole',
    senderEmail: row.sender_email,
    occasion: row.occasion,
    coin: row.coin,
    amountDisplay: row.amount_display,
    messageFromYou: row.message_from_you,
    status,
    walletAddress: row.wallet_address,
    claimedAt: toIsoString(row.claimed_at),
    createdAt: toIsoString(row.created_at)
  }
}

const giftColumns = `
  gift_id,
  recipient_name,
  recipient_email,
  sender_name,
  sender_email,
  occasion,
  coin,
  amount_display,
  message_from_you,
  status,
  wallet_address,
  claimed_at,
  created_at
`

export async function getGiftById(giftId: string) {
  const result = await query<GiftRow>(
    `SELECT ${giftColumns}
    FROM gifts
    WHERE gift_id = $1`,
    [giftId]
  )

  return result.rows[0] ? mapGiftRowToGift(result.rows[0]) : null
}

export async function createGift(input: CreateGiftInput) {
  try {
    const result = await query<GiftRow>(
      `INSERT INTO gifts (
        gift_id,
        recipient_name,
        recipient_email,
        sender_name,
        sender_email,
        occasion,
        coin,
        amount_display,
        message_from_you,
        status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, 'unopened'
      )
      RETURNING ${giftColumns}`,
      [
        input.giftId,
        input.recipientName,
        input.recipientEmail,
        input.senderName,
        input.senderEmail,
        input.occasion,
        input.coin,
        input.amountDisplay,
        input.messageFromYou
      ]
    )

    return mapGiftRowToGift(result.rows[0])
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : ''
    if (code === '23505') {
      throw new Error('A gift with that URL slug already exists.')
    }

    throw error
  }
}

export async function claimGift(giftId: string, walletAddress: string | null) {
  return withTransaction(async client => {
    const existingResult = await client.query<GiftRow>(
      `SELECT ${giftColumns}
      FROM gifts
      WHERE gift_id = $1
      FOR UPDATE`,
      [giftId]
    )

    const existingRow = existingResult.rows[0]
    if (!existingRow) {
      throw new Error('Gift not found.')
    }

    const existing = mapGiftRowToGift(existingRow)
    if (existing.status !== 'unopened') {
      throw new Error(`Gift already ${existing.status}.`)
    }

    const updatedResult = await client.query<GiftRow>(
      `UPDATE gifts
      SET
        wallet_address = $2,
        claimed_at = NOW(),
        status = 'claimed'
      WHERE gift_id = $1
      RETURNING ${giftColumns}`,
      [giftId, walletAddress]
    )

    return mapGiftRowToGift(updatedResult.rows[0])
  })
}
