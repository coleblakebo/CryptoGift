import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { buildAbsoluteUrl, getSiteUrl } from '../lib/site'

export default function App({ Component, pageProps }: AppProps) {
  const siteUrl = getSiteUrl()
  const ogImageUrl = buildAbsoluteUrl('/og-card.svg', siteUrl)

  return (
    <>
      <Head>
        <title>KindredCoins | Send Crypto as a Gift</title>
        <meta
          name="description"
          content="KindredCoins helps you create polished crypto gifts with shareable links and a simple manual fulfillment flow."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#08111f" />
        <meta name="application-name" content="KindredCoins" />
        <meta name="apple-mobile-web-app-title" content="KindredCoins" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="canonical" href={siteUrl} />
        <meta property="og:site_name" content="KindredCoins" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content="KindredCoins | Send Crypto as a Gift" />
        <meta
          property="og:description"
          content="Create themed crypto gifts, share the reveal link, and handle fulfillment manually with Postgres as the source of truth."
        />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="KindredCoins social card" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="KindredCoins | Send Crypto as a Gift" />
        <meta
          name="twitter:description"
          content="Create themed crypto gifts, share the reveal link, and handle fulfillment manually."
        />
        <meta name="twitter:image" content={ogImageUrl} />
      </Head>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </>
  )
}
