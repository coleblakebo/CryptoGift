import Link from 'next/link'
import Head from 'next/head'

export default function HomePage() {
  return (
    <>
      <Head>
        <title>KindredCoins | Send Crypto as a Gift</title>
        <meta
          name="description"
          content="Send a polished crypto gift in minutes with a festive reveal link that is clear and easy to claim."
        />
        <meta property="og:title" content="KindredCoins | Send Crypto as a Gift" />
        <meta
          property="og:description"
          content="Send a polished crypto gift in minutes with a festive reveal link that is clear and easy to claim."
        />
      </Head>
      <div className="page-root landing-page">
        <div className="landing-glow glow-one" />
        <div className="landing-glow glow-two" />
        <div className="landing-gridline gridline-left" />
        <div className="landing-gridline gridline-right" />
        <div className="landing-coin coin-float landing-coin-one" />
        <div className="landing-coin coin-float landing-coin-two" />
        <div className="landing-coin coin-float landing-coin-three" />
        <div className="landing-orbit orbit-one" />
        <div className="landing-orbit orbit-two" />

        <main className="card card-wide landing-card">
          <section className="landing-hero">
            <div className="landing-kicker">KindredCoins</div>
            <h1 className="landing-title">
              <span className="landing-title-line">Send Crypto with a</span>
              <span className="landing-title-highlight">fun twist.</span>
            </h1>
            <p className="landing-copy">
              KindredCoins helps you send a polished crypto gift in minutes with a link that feels
              festive, clear, and easy to claim.
            </p>
            <div className="landing-actions">
              <Link href="/create" className="primary landing-primary">
                <span>Create a Gift</span>
                <span className="landing-primary-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </>
  )
}
