import path from 'node:path'

import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const airtableApiKey = process.env.AIRTABLE_API_KEY
const airtableBaseId = process.env.AIRTABLE_BASE_ID
const airtableTable = process.env.AIRTABLE_TABLE
const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL

if (!airtableApiKey || !airtableBaseId || !airtableTable) {
  console.error('Missing Airtable env vars. Set AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE.')
  process.exit(1)
}

if (!connectionString) {
  console.error('Missing Postgres connection string. Set POSTGRES_URL or POSTGRES_URL_NON_POOLING.')
  process.exit(1)
}

const baseUrl = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(airtableTable)}`
const headers = { Authorization: `Bearer ${airtableApiKey}` }
const pool = new Pool({ connectionString })

async function fetchAllRecords() {
  const records = []
  let offset = ''

  do {
    const search = new URLSearchParams({ pageSize: '100' })
    if (offset) {
      search.set('offset', offset)
    }

    const response = await fetch(`${baseUrl}?${search.toString()}`, { headers })
    if (!response.ok) {
      throw new Error(`Airtable export failed: ${response.status} ${await response.text()}`)
    }

    const payload = await response.json()
    records.push(...(payload.records || []))
    offset = payload.offset || ''
  } while (offset)

  return records
}

async function main() {
  const records = await fetchAllRecords()
  let imported = 0

  for (const record of records) {
    const fields = record.fields || {}
    const giftId = String(fields.giftId || '')
    if (!giftId) {
      continue
    }

    await pool.query(
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
        status,
        wallet_address,
        claimed_at,
        created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, COALESCE($13::timestamptz, NOW())
      )
      ON CONFLICT (gift_id) DO UPDATE SET
        recipient_name = EXCLUDED.recipient_name,
        recipient_email = EXCLUDED.recipient_email,
        sender_name = EXCLUDED.sender_name,
        sender_email = EXCLUDED.sender_email,
        occasion = EXCLUDED.occasion,
        coin = EXCLUDED.coin,
        amount_display = EXCLUDED.amount_display,
        message_from_you = EXCLUDED.message_from_you,
        status = EXCLUDED.status,
        wallet_address = EXCLUDED.wallet_address,
        claimed_at = EXCLUDED.claimed_at,
        created_at = EXCLUDED.created_at`,
      [
        giftId,
        String(fields.recipientName || ''),
        String(fields.recipientEmail || ''),
        String(fields.senderName || 'Uncle Cole'),
        String(fields.senderEmail || ''),
        String(fields.occasion || ''),
        String(fields.coin || ''),
        String(fields.amountDisplay || ''),
        String(fields.messageFromYou || ''),
        String(fields.status || 'unopened'),
        fields.walletAddress ? String(fields.walletAddress) : null,
        fields.claimedAt ? String(fields.claimedAt) : null,
        fields.createdAt ? String(fields.createdAt) : null
      ]
    )

    imported += 1
  }

  console.log(`Imported ${imported} Airtable records into Postgres.`)
}

try {
  await main()
} finally {
  await pool.end()
}
