import fs from 'node:fs/promises'
import path from 'node:path'

import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL

if (!connectionString) {
  console.error(
    'Missing Postgres connection string. Set POSTGRES_URL or POSTGRES_URL_NON_POOLING first.'
  )
  process.exit(1)
}

const sqlPath = path.join(process.cwd(), 'sql', 'init.sql')
const sql = await fs.readFile(sqlPath, 'utf8')
const pool = new Pool({ connectionString })

try {
  await pool.query(sql)
  console.log('Postgres schema initialized.')
} finally {
  await pool.end()
}
