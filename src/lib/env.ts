import fs from 'fs'
import path from 'path'

let envLoaded = false

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
