import { describe, expect, it } from 'vitest'

import { buildGiftClaimedEmailContent, buildGiftEmailContent } from '../../src/lib/email'
import type { Gift } from '../../src/lib/gifts'

const gift: Gift = {
  giftId: 'izzy-birthday-2026',
  giftUrl: null,
  recipientName: 'Izzy <D>',
  recipientEmail: 'izzy@example.com',
  senderName: 'Uncle Cole',
  senderEmail: 'cole@example.com',
  occasion: 'Birthday',
  coin: 'BTC',
  amountDisplay: '$25',
  messageFromYou: 'Happy birthday & enjoy!',
  status: 'unopened',
  walletAddress: null,
  claimedAt: null,
  createdAt: '2026-04-12T00:00:00.000Z'
}

describe('gift email content', () => {
  it('builds recipient gift email content with escaped html', () => {
    const content = buildGiftEmailContent(gift, 'https://kindredcoins.com/gift/izzy-birthday-2026')

    expect(content.subject).toBe('Uncle Cole sent you a KindredCoins gift')
    expect(content.text).toContain('Izzy <D>')
    expect(content.text).toContain('https://kindredcoins.com/gift/izzy-birthday-2026')
    expect(content.html).toContain('Izzy &lt;D&gt;')
    expect(content.html).toContain('Happy birthday &amp; enjoy!')
    expect(content.html).not.toContain('Izzy <D>')
  })

  it('builds sender claim email content with wallet details', () => {
    const claimedGift: Gift = {
      ...gift,
      status: 'claimed',
      walletAddress: 'bc1qtest<wallet>',
      claimedAt: '2026-04-12T01:00:00.000Z'
    }

    const content = buildGiftClaimedEmailContent(
      claimedGift,
      'https://kindredcoins.com/gift/izzy-birthday-2026'
    )

    expect(content.subject).toBe('Izzy <D> claimed their KindredCoins gift')
    expect(content.text).toContain('Wallet address: bc1qtest<wallet>')
    expect(content.text).toContain('Claimed at: 2026-04-12T01:00:00.000Z')
    expect(content.html).toContain('bc1qtest&lt;wallet&gt;')
    expect(content.html).not.toContain('bc1qtest<wallet>')
  })

  it('builds sender claim email content when the sender already has the wallet address', () => {
    const claimedGift: Gift = {
      ...gift,
      status: 'claimed',
      walletAddress: null,
      claimedAt: '2026-04-12T01:00:00.000Z'
    }

    const content = buildGiftClaimedEmailContent(
      claimedGift,
      'https://kindredcoins.com/gift/izzy-birthday-2026'
    )

    expect(content.text).toContain(
      'Wallet address: Recipient said you already have their wallet address.'
    )
    expect(content.html).toContain(
      'Wallet address: Recipient said you already have their wallet address.'
    )
  })
})
