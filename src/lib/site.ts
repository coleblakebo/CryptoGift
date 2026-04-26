const DEFAULT_SITE_URL = 'https://kindredcoins.com'

export function getSiteUrl() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')

  return normalizeUrl(siteUrl || DEFAULT_SITE_URL)
}

export function normalizeUrl(value: string) {
  return value.replace(/\/+$/, '')
}

export function buildAbsoluteUrl(path: string, baseUrl = getSiteUrl()) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizeUrl(baseUrl)}${normalizedPath}`
}
