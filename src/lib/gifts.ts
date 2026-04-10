import { loadLocalEnv } from './env'
import { buildGiftUrl, toGiftStatus } from './gift-utils'

export type GiftStatus = 'unopened' | 'claimed' | 'sent'

export type Gift = {
  giftId: string
  giftUrl?: string | null
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
  origin?: string
  recipientName: string
  recipientEmail: string
  senderName: string
  senderEmail: string
  occasion: string
  coin: string
  amountDisplay: string
  messageFromYou: string
}

function getAirtableConfig() {
  loadLocalEnv()

  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID
  const tableName = process.env.AIRTABLE_TABLE

  return {
    apiKey,
    baseId,
    tableName,
    enabled: Boolean(apiKey && baseId && tableName)
  }
}

function mapAirtableFieldsToGift(fields: Record<string, unknown>): Gift {
  const status = toGiftStatus(fields.status)

  return {
    giftId: String(fields.giftId || ''),
    giftUrl: fields.giftUrl ? String(fields.giftUrl) : null,
    recipientName: String(fields.recipientName || ''),
    recipientEmail: String(fields.recipientEmail || ''),
    senderName: String(fields.senderName || 'Uncle Cole'),
    senderEmail: String(fields.senderEmail || ''),
    occasion: String(fields.occasion || ''),
    coin: String(fields.coin || ''),
    amountDisplay: String(fields.amountDisplay || ''),
    messageFromYou: String(fields.messageFromYou || ''),
    status,
    walletAddress: fields.walletAddress ? String(fields.walletAddress) : null,
    claimedAt: fields.claimedAt ? String(fields.claimedAt) : null,
    createdAt: fields.createdAt ? String(fields.createdAt) : null
  }
}

async function fetchAirtableGiftRecordById(giftId: string) {
  const config = getAirtableConfig()
  if (!config.enabled) {
    return null
  }

  const formula = `({giftId}='${giftId.replace(/'/g, "\\'")}')`
  const url =
    `https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(config.tableName || '')}` +
    `?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.apiKey}`
    }
  })

  if (!response.ok) {
    throw new Error(`Airtable fetch failed with ${response.status}`)
  }

  const payload = (await response.json()) as {
    records?: Array<{ id: string; fields: Record<string, unknown> }>
  }
  const record = payload.records?.[0]
  if (!record) {
    return null
  }

  return {
    recordId: record.id,
    gift: mapAirtableFieldsToGift(record.fields)
  }
}

export async function getGiftById(giftId: string) {
  const config = getAirtableConfig()
  if (!config.enabled) {
    throw new Error('Airtable is not configured.')
  }

  const airtableRecord = await fetchAirtableGiftRecordById(giftId)
  return airtableRecord?.gift || null
}

export async function createGift(input: CreateGiftInput) {
  const config = getAirtableConfig()
  if (!config.enabled) {
    throw new Error('Airtable is not configured.')
  }

  const existing = await getGiftById(input.giftId)
  if (existing) {
    throw new Error('A gift with that URL slug already exists.')
  }

  const now = new Date().toISOString()
  const giftUrl = buildGiftUrl(input.origin, input.giftId)
  const gift: Gift = {
    ...input,
    giftUrl,
    status: 'unopened',
    createdAt: now
  }

  const fields = {
    giftId: gift.giftId,
    giftUrl: gift.giftUrl,
    recipientName: gift.recipientName,
    recipientEmail: gift.recipientEmail,
    senderName: gift.senderName,
    senderEmail: gift.senderEmail,
    occasion: gift.occasion,
    coin: gift.coin,
    amountDisplay: gift.amountDisplay,
    messageFromYou: gift.messageFromYou,
    status: gift.status,
    createdAt: gift.createdAt
  }

  let response = await fetch(
    `https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(config.tableName || '')}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields })
    }
  )

  if (!response.ok) {
    const text = await response.text()

    if (
      (text.includes('senderEmail') || text.includes('giftUrl')) &&
      text.includes('Unknown field name')
    ) {
      const fallbackFields = { ...fields }
      if (text.includes('senderEmail')) {
        delete fallbackFields.senderEmail
      }
      if (text.includes('giftUrl')) {
        delete fallbackFields.giftUrl
      }
      response = await fetch(
        `https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(config.tableName || '')}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fields: fallbackFields })
        }
      )
    } else {
      throw new Error(`Airtable create failed: ${response.status} ${text}`)
    }
  }

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Airtable create failed: ${response.status} ${text}`)
  }

  return gift
}

export async function claimGift(giftId: string, walletAddress: string | null) {
  const existing = await getGiftById(giftId)
  if (!existing) {
    throw new Error('Gift not found.')
  }
  if (existing.status !== 'unopened') {
    throw new Error(`Gift already ${existing.status}.`)
  }

  const updatedGift: Gift = {
    ...existing,
    walletAddress,
    claimedAt: new Date().toISOString(),
    status: 'claimed'
  }

  const config = getAirtableConfig()
  if (!config.enabled) {
    throw new Error('Airtable is not configured.')
  }

  const airtableRecord = await fetchAirtableGiftRecordById(giftId)
  if (!airtableRecord) {
    throw new Error('Gift not found in Airtable.')
  }

  const response = await fetch(
    `https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(config.tableName || '')}/${airtableRecord.recordId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          walletAddress: updatedGift.walletAddress,
          claimedAt: updatedGift.claimedAt,
          status: updatedGift.status
        }
      })
    }
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Airtable claim update failed: ${response.status} ${text}`)
  }

  return updatedGift
}
