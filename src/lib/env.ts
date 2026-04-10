import fs from 'fs'
import path from 'path'

let envLoaded = false

type AirtableRuntimeConfig = {
  apiKey?: string
  baseId?: string
  tableName?: string
  source: 'default' | 'dev' | 'prod'
}

export function loadLocalEnv() {
  if (envLoaded || process.env.NODE_ENV === 'production') {
    return
  }

  envLoaded = true

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const dotenv = require('dotenv')
    dotenv.config({ path: path.join(process.cwd(), '.env.local') })
  } catch {
    // Ignore missing dotenv at runtime and fall back to manual parsing.
  }

  try {
    const envPath = path.join(process.cwd(), '.env.local')
    if (!fs.existsSync(envPath)) {
      return
    }

    const raw = fs.readFileSync(envPath, 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) {
        continue
      }

      const eq = trimmed.indexOf('=')
      if (eq === -1) {
        continue
      }

      let key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (key.charCodeAt(0) === 0xfeff) {
        key = key.slice(1)
      }
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }

      if (key && value && !process.env[key]) {
        process.env[key] = value
      }
    }
  } catch {
    // Leave process env as-is if the local file cannot be parsed.
  }
}

function normalizeAirtableEnv(value: string | undefined) {
  if (!value) {
    return null
  }

  const normalized = value.trim().toLowerCase()
  if (normalized === 'production' || normalized === 'prod') {
    return 'prod' as const
  }
  if (normalized === 'development' || normalized === 'dev') {
    return 'dev' as const
  }

  return null
}

export function resolveAirtableEnv(env: NodeJS.ProcessEnv): AirtableRuntimeConfig {
  const defaultConfig = {
    apiKey: env.AIRTABLE_API_KEY,
    baseId: env.AIRTABLE_BASE_ID,
    tableName: env.AIRTABLE_TABLE
  }

  const requestedLocalEnv = normalizeAirtableEnv(env.AIRTABLE_LOCAL_ENV || env.AIRTABLE_ENV)
  const hasScopedLocalConfig =
    Boolean(env.AIRTABLE_DEV_API_KEY || env.AIRTABLE_DEV_BASE_ID || env.AIRTABLE_DEV_TABLE) ||
    Boolean(env.AIRTABLE_PROD_API_KEY || env.AIRTABLE_PROD_BASE_ID || env.AIRTABLE_PROD_TABLE)

  if (env.NODE_ENV !== 'production' && (requestedLocalEnv || hasScopedLocalConfig)) {
    const selectedEnv = requestedLocalEnv || 'dev'
    const scopedConfig =
      selectedEnv === 'prod'
        ? {
            apiKey: env.AIRTABLE_PROD_API_KEY,
            baseId: env.AIRTABLE_PROD_BASE_ID,
            tableName: env.AIRTABLE_PROD_TABLE
          }
        : {
            apiKey: env.AIRTABLE_DEV_API_KEY,
            baseId: env.AIRTABLE_DEV_BASE_ID,
            tableName: env.AIRTABLE_DEV_TABLE
          }

    return {
      apiKey: scopedConfig.apiKey || defaultConfig.apiKey,
      baseId: scopedConfig.baseId || defaultConfig.baseId,
      tableName: scopedConfig.tableName || defaultConfig.tableName,
      source: selectedEnv
    }
  }

  return {
    ...defaultConfig,
    source: 'default'
  }
}
