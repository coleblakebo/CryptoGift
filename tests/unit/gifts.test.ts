import { describe, expect, it } from 'vitest'

import { mapGiftRowToGift } from '../../src/lib/gifts'

describe('gift row mapping', () => {
  it('maps postgres rows to serialized gifts', () => {
    const gift = mapGiftRowToGift({
      gift_id: 'izzy-birthday-2026',
      recipient_name: 'Izzy',
      recipient_email: 'izzy@example.com',
      sender_name: 'Cole',
      sender_email: 'cole@example.com',
      occasion: 'Birthday',
      coin: 'BTC',
      amount_display: '$25',
      message_from_you: 'Happy birthday',
      status: 'claimed',
      wallet_address: 'bc1qabc123',
      claimed_at: new Date('2026-04-12T01:00:00.000Z'),
      created_at: new Date('2026-04-12T00:00:00.000Z')
    })

    expect(gift).toEqual({
      giftId: 'izzy-birthday-2026',
      recipientName: 'Izzy',
      recipientEmail: 'izzy@example.com',
      senderName: 'Cole',
      senderEmail: 'cole@example.com',
      occasion: 'Birthday',
      coin: 'BTC',
      amountDisplay: '$25',
      messageFromYou: 'Happy birthday',
      status: 'claimed',
      walletAddress: 'bc1qabc123',
      claimedAt: '2026-04-12T01:00:00.000Z',
      createdAt: '2026-04-12T00:00:00.000Z'
    })
  })

  it('falls back to unopened for unknown statuses', () => {
    const gift = mapGiftRowToGift({
      gift_id: 'unknown-status',
      recipient_name: 'Izzy',
      recipient_email: 'izzy@example.com',
      sender_name: 'Cole',
      sender_email: 'cole@example.com',
      occasion: '',
      coin: 'BTC',
      amount_display: '$25',
      message_from_you: '',
      status: 'migrated',
      wallet_address: null,
      claimed_at: null,
      created_at: null
    })

    expect(gift.status).toBe('unopened')
    expect(gift.claimedAt).toBeNull()
    expect(gift.createdAt).toBeNull()
  })
})
