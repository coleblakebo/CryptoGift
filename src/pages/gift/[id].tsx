import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import { FormEvent, useEffect, useState } from 'react'

import { getGiftById, Gift } from '../../lib/gifts'

type Stage = 'wrapped' | 'reveal' | 'form' | 'success'

type GiftPageProps = {
  gift: Gift | null
}

export const getServerSideProps: GetServerSideProps<GiftPageProps> = async ({ params }) => {
  const giftId = typeof params?.id === 'string' ? params.id : ''
  const gift = giftId ? await getGiftById(giftId) : null

  return {
    props: {
      gift
    }
  }
}

export default function GiftPage({ gift }: GiftPageProps) {
  const occasionText = gift?.occasion?.toLowerCase() || ''
  const pageTitle = gift?.recipientName
    ? `${gift.recipientName}'s Gift | KindredCoins`
    : 'Gift Reveal | KindredCoins'
  const pageDescription = gift
    ? `Open a KindredCoins gift for ${gift.recipientName} and claim the ${gift.coin} surprise.`
    : 'Open a KindredCoins gift link and claim your surprise.'
  const isBirthday = occasionText.includes('birthday') || occasionText.includes('bday')
  const isEaster = occasionText.includes('easter')
  const isStPatricks =
    occasionText.includes('st. patrick') ||
    occasionText.includes('st patrick') ||
    occasionText.includes('patrick') ||
    occasionText.includes('patty')
  const [stage, setStage] = useState<Stage>(
    gift?.status === 'claimed' || gift?.status === 'sent' ? 'success' : 'wrapped'
  )
  const [address, setAddress] = useState(gift?.walletAddress || '')
  const [senderAlreadyHasAddress, setSenderAlreadyHasAddress] = useState(
    (gift?.status === 'claimed' || gift?.status === 'sent') && !gift?.walletAddress
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (stage !== 'reveal') {
      return
    }

    let cancelled = false

    void import('canvas-confetti')
      .then(({ default: confetti }) => {
        if (cancelled) {
          return
        }

        confetti({
          particleCount: isBirthday ? 120 : isStPatricks ? 110 : isEaster ? 90 : 80,
          spread: isBirthday ? 90 : isStPatricks ? 85 : isEaster ? 75 : 60
        })
      })
      .catch(() => {
        // Skip the effect if the client-only confetti bundle cannot be loaded.
      })

    return () => {
      cancelled = true
    }
  }, [isBirthday, isEaster, isStPatricks, stage])

  if (!gift) {
    return <div style={{ padding: 40 }}>Gift not found.</div>
  }

  const validate = (addr: string) => {
    if (senderAlreadyHasAddress) return ''
    if (!addr || addr.trim().length < 20) return 'Please enter a valid wallet address.'
    if (gift.coin === 'ETH' && !addr.startsWith('0x')) return 'Ethereum addresses usually start with 0x.'
    return ''
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationError = validate(address)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftId: gift.giftId,
          walletAddress: senderAlreadyHasAddress ? null : address,
          senderAlreadyHasAddress
        })
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        throw new Error(payload.error || 'Network error')
      }

      setStage('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit. Try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Head>
      <div
        className={`page-root festive-page ${
          isBirthday
            ? 'birthday-page'
            : isEaster
              ? 'easter-page'
              : isStPatricks
                ? 'stpatricks-page'
                : 'default-gift-page'
        }`}
      >
        <div className="festive-orb orb-one" />
        <div className="festive-orb orb-two" />
        <div className="festive-orb orb-three" />
        <div className="festive-streamer streamer-left" />
        <div className="festive-streamer streamer-right" />
        {isBirthday ? (
          <div className="birthday-banner-wall" aria-hidden="true">
            <span>HAPPY BIRTHDAY</span>
            <span>HAPPY BIRTHDAY</span>
            <span>HAPPY BIRTHDAY</span>
          </div>
        ) : null}
      {isBirthday && (stage === 'reveal' || stage === 'success') ? (
        <div className="balloon-cluster" aria-hidden="true">
          <span className="balloon balloon-pink" />
          <span className="balloon balloon-gold" />
          <span className="balloon balloon-blue" />
          <span className="balloon balloon-coral" />
          <span className="balloon balloon-cream" />
        </div>
      ) : null}
      {isEaster ? (
        <div className="easter-garden" aria-hidden="true">
          <span className="egg egg-one" />
          <span className="egg egg-two" />
          <span className="egg egg-three" />
          <span className="egg egg-four" />
          <span className="grass-strip" />
        </div>
      ) : null}
      {isEaster && (stage === 'reveal' || stage === 'success') ? (
        <div className="bunny-pop" aria-hidden="true">
          <span className="bunny-ear left" />
          <span className="bunny-ear right" />
          <span className="bunny-head" />
          <span className="bunny-eye left" />
          <span className="bunny-eye right" />
          <span className="bunny-nose" />
        </div>
      ) : null}
      {isStPatricks ? (
        <div className="stpatricks-scene" aria-hidden="true">
          <span className="clover clover-one" />
          <span className="clover clover-two" />
          <span className="clover clover-three" />
          <span className="clover clover-four" />
          <span className="hill hill-left" />
          <span className="hill hill-right" />
          <span className="leprechaun leprechaun-bg">
            <span className="lep-hat" />
            <span className="lep-face" />
            <span className="lep-beard" />
          </span>
        </div>
      ) : null}
      {isStPatricks && (stage === 'reveal' || stage === 'success') ? (
        <div className="rainbow-burst" aria-hidden="true">
          <span className="rainbow-arc arc-red" />
          <span className="rainbow-arc arc-orange" />
          <span className="rainbow-arc arc-yellow" />
          <span className="rainbow-arc arc-green" />
          <span className="rainbow-arc arc-blue" />
          <span className="rainbow-arc arc-purple" />
          <span className="rainbow-cloud rainbow-cloud-left" />
          <span className="rainbow-cloud rainbow-cloud-right" />
          <span className="leprechaun leprechaun-pop">
            <span className="lep-hat" />
            <span className="lep-face" />
            <span className="lep-beard" />
          </span>
        </div>
      ) : null}

        <main
          className={`card gift-card ${
            isBirthday
              ? 'birthday-card'
              : isEaster
                ? 'easter-card'
                : isStPatricks
                  ? 'stpatricks-card'
                  : 'default-gift-card'
          }`}
        >
        {stage === 'wrapped' && (
          <section className="gift-landing">
            <div className="eyebrow">A surprise is waiting</div>
            <h2>Open your KindredCoins gift</h2>
            <p className="help">
              {gift.recipientName}, tap the{' '}
              {isEaster ? 'egg' : isStPatricks ? 'pot of gold' : 'present'} to see what is inside.
            </p>
            {isEaster ? (
              <button
                type="button"
                className="easter-egg-button"
                onClick={() => setStage('reveal')}
                aria-label="Open Easter egg"
              >
                <span className="egg-shadow" />
                <span className="egg-shell whole" />
                <span className="egg-shell top" />
                <span className="egg-shell bottom" />
                <span className="egg-pattern stripe-one" />
                <span className="egg-pattern stripe-two" />
                <span className="egg-pattern wave-band" />
                <span className="egg-pattern dot-one" />
                <span className="egg-pattern dot-two" />
                <span className="egg-highlight" />
              </button>
            ) : isStPatricks ? (
              <button
                type="button"
                className="pot-gold-button"
                onClick={() => setStage('reveal')}
                aria-label="Open pot of gold"
              >
                <span className="pot-handle" />
                <span className="pot-gold" />
                <span className="pot-rim" />
                <span className="pot-body" />
                <span className="gold-coin coin-one" />
                <span className="gold-coin coin-two" />
                <span className="gold-coin coin-three" />
                <span className="gold-spark spark-one" />
                <span className="gold-spark spark-two" />
                <span className="gold-spark spark-three" />
              </button>
            ) : (
              <button
                type="button"
                className="gift-box-button"
                onClick={() => setStage('reveal')}
                aria-label="Open gift"
              >
                <span className="gift-box-lid" />
                <span className="gift-box-ribbon-vertical" />
                <span className="gift-box-ribbon-horizontal" />
                <span className="gift-box-bow left" />
                <span className="gift-box-bow right" />
                <span className="gift-box-base" />
              </button>
            )}
          </section>
        )}

        {stage === 'reveal' && (
          <section>
            <h2>A Gift for {gift.recipientName}</h2>
            {gift.occasion ? <p className="occasion">{gift.occasion}</p> : null}
            <div className="amount">
              {gift.amountDisplay} · {gift.coin}
            </div>
            {gift.messageFromYou ? <p className="message">{gift.messageFromYou}</p> : null}
            <button className="primary" onClick={() => setStage('form')}>
              Claim My Gift
            </button>
          </section>
        )}

        {stage === 'form' && (
          <section>
            <h2>Claim your {gift.coin} gift</h2>
            <p className="help">Enter your wallet address, or let the sender know they already have it.</p>
            <form onSubmit={submit}>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={senderAlreadyHasAddress}
                  onChange={(event) => setSenderAlreadyHasAddress(event.target.checked)}
                />
                <span>Sender already has my address</span>
              </label>
              {!senderAlreadyHasAddress ? (
                <input
                  placeholder={`e.g. ${gift.coin === 'ETH' ? '0x...' : 'wallet address'}`}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="input"
                />
              ) : null}
              {error ? <div className="error">{error}</div> : null}
              <div className="actions">
                <button className="primary" type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Submit'}
                </button>
                <button type="button" onClick={() => setStage('reveal')}>
                  Back
                </button>
              </div>
            </form>
          </section>
        )}

        {stage === 'success' && (
          <section>
            <h2>All set!</h2>
            <p>
              {gift.recipientName}, your gift was claimed. {gift.senderName} is depositing the crypto to your wallet!
            </p>
            <div className="summary">
              <div>
                {gift.amountDisplay} · {gift.coin}
              </div>
              <div>
                {senderAlreadyHasAddress
                  ? 'Sender already has your address.'
                  : `To: ${address || gift.walletAddress}`}
              </div>
            </div>
          </section>
        )}
        </main>
      </div>
    </>
  )
}
