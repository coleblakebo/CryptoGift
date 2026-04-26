import { describe, expect, it } from 'vitest'

import { resolveAirtableEnv } from '../../src/lib/env'

describe('resolveAirtableEnv', () => {
  it('uses default AIRTABLE_* vars when no scoped local config exists', () => {
    const config = resolveAirtableEnv({
      NODE_ENV: 'development',
      AIRTABLE_API_KEY: 'default-key',
      AIRTABLE_BASE_ID: 'default-base',
      AIRTABLE_TABLE: 'default-table'
    })

    expect(config).toEqual({
      apiKey: 'default-key',
      baseId: 'default-base',
      tableName: 'default-table',
      source: 'default'
    })
  })

  it('defaults local scoped config to dev', () => {
    const config = resolveAirtableEnv({
      NODE_ENV: 'development',
      AIRTABLE_DEV_API_KEY: 'dev-key',
      AIRTABLE_DEV_BASE_ID: 'dev-base',
      AIRTABLE_DEV_TABLE: 'gifts-dev',
      AIRTABLE_PROD_API_KEY: 'prod-key',
      AIRTABLE_PROD_BASE_ID: 'prod-base',
      AIRTABLE_PROD_TABLE: 'gifts-prod'
    })

    expect(config).toEqual({
      apiKey: 'dev-key',
      baseId: 'dev-base',
      tableName: 'gifts-dev',
      source: 'dev'
    })
  })

  it('lets local development opt into prod Airtable config', () => {
    const config = resolveAirtableEnv({
      NODE_ENV: 'development',
      AIRTABLE_LOCAL_ENV: 'prod',
      AIRTABLE_DEV_API_KEY: 'dev-key',
      AIRTABLE_DEV_BASE_ID: 'dev-base',
      AIRTABLE_DEV_TABLE: 'gifts-dev',
      AIRTABLE_PROD_API_KEY: 'prod-key',
      AIRTABLE_PROD_BASE_ID: 'prod-base',
      AIRTABLE_PROD_TABLE: 'gifts-prod'
    })

    expect(config).toEqual({
      apiKey: 'prod-key',
      baseId: 'prod-base',
      tableName: 'gifts-prod',
      source: 'prod'
    })
  })

  it('falls back to default vars when scoped values are incomplete', () => {
    const config = resolveAirtableEnv({
      NODE_ENV: 'development',
      AIRTABLE_LOCAL_ENV: 'prod',
      AIRTABLE_API_KEY: 'default-key',
      AIRTABLE_BASE_ID: 'default-base',
      AIRTABLE_TABLE: 'default-table',
      AIRTABLE_PROD_TABLE: 'gifts-prod'
    })

    expect(config).toEqual({
      apiKey: 'default-key',
      baseId: 'default-base',
      tableName: 'gifts-prod',
      source: 'prod'
    })
  })

  it('keeps production deployments on default AIRTABLE_* vars', () => {
    const config = resolveAirtableEnv({
      NODE_ENV: 'production',
      AIRTABLE_API_KEY: 'default-key',
      AIRTABLE_BASE_ID: 'default-base',
      AIRTABLE_TABLE: 'default-table',
      AIRTABLE_PROD_API_KEY: 'prod-key',
      AIRTABLE_PROD_BASE_ID: 'prod-base',
      AIRTABLE_PROD_TABLE: 'gifts-prod'
    })

    expect(config).toEqual({
      apiKey: 'default-key',
      baseId: 'default-base',
      tableName: 'default-table',
      source: 'default'
    })
  })
})
