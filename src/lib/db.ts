import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg'

import { loadLocalEnv } from './env'

declare global {
  // Reuse one pool during local hot reload to avoid connection churn.
  // eslint-disable-next-line no-var
  var kindredCoinsPgPool: Pool | undefined
}

function getDatabaseUrl() {
  loadLocalEnv()

  return (
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    ''
  )
}

function createPool() {
  const connectionString = getDatabaseUrl()
  if (!connectionString) {
    throw new Error('Postgres is not configured.')
  }

  return new Pool({
    connectionString,
    max: process.env.NODE_ENV === 'production' ? 10 : 5
  })
}

export function getPool() {
  if (!global.kindredCoinsPgPool) {
    global.kindredCoinsPgPool = createPool()
  }

  return global.kindredCoinsPgPool
}

export async function query<T extends QueryResultRow>(
  text: string,
  values?: unknown[]
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, values)
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>) {
  const client = await getPool().connect()

  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
