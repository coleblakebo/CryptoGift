import Link from 'next/link'
import Head from 'next/head'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { slugify } from '../lib/gift-utils'

type Stage = 'form' | 'success'

type FormState = {
  recipientName: string
  recipientEmail: string
  senderName: string
  senderEmail: string
  occasion: string
  coin: string
  amountDisplay: string
  messageFromYou: string
  giftId: string
}

const holidayOptions = ['Birthday', 'Easter', "St. Patrick's Day"]

const initialState: FormState = {
  recipientName: '',
  recipientEmail: '',
  senderName: '',
  senderEmail: '',
  occasion: '',
  coin: 'BTC',
  amountDisplay: '',
  messageFromYou: '',
  giftId: ''
}

export default function CreateGiftPage() {
  const [stage, setStage] = useState<Stage>('form')
  const [form, setForm] = useState<FormState>(initialState)
  const [slugTouched, setSlugTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdGiftId, setCreatedGiftId] = useState('')

  const shareUrl = useMemo(() => {
    if (!createdGiftId || typeof window === 'undefined') {
      return ''
    }

    return `${window.location.origin}/gift/${createdGiftId}`
  }, [createdGiftId])

  useEffect(() => {
    if (slugTouched) {
      return
    }

    const suggestedSlug = [form.recipientName, form.occasion, String(new Date().getFullYear())]
      .map(slugify)
      .filter(Boolean)
      .join('-')

    setForm((current) => ({
      ...current,
      giftId: suggestedSlug
    }))
  }, [form.recipientName, form.occasion, slugTouched])

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }))
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/create-gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          origin: typeof window === 'undefined' ? '' : window.location.origin
        })
      })
      const payload = (await response.json()) as { error?: string; gift?: { giftId: string } }

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to create gift.')
      }

      setCreatedGiftId(payload.gift?.giftId || '')
      setForm(initialState)
      setSlugTouched(false)
      setStage('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gift.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Create a Gift | KindredCoins</title>
        <meta
          name="description"
          content="Create a KindredCoins gift link, personalize the occasion, and share it with a recipient for manual crypto fulfillment."
        />
        <meta property="og:title" content="Create a Gift | KindredCoins" />
        <meta
          property="og:description"
          content="Create a KindredCoins gift link, personalize the occasion, and share it with a recipient for manual crypto fulfillment."
        />
      </Head>
      <div className="page-root landing-page create-page">
        <div className="landing-glow glow-one" />
        <div className="landing-glow glow-two" />
        <div className="landing-gridline gridline-left" />
        <div className="landing-gridline gridline-right" />
        <div className="landing-coin coin-float landing-coin-one" />
        <div className="landing-coin coin-float landing-coin-two" />
        <div className="landing-coin coin-float landing-coin-three" />
        <div className="landing-orbit orbit-one" />
        <div className="landing-orbit orbit-two" />

        <main className="card card-wide landing-card create-card">
          {stage === 'form' ? (
            <>
              <section className="landing-kicker">KindredCoins Studio</section>
              <h1 className="page-title create-title">Create a new gift</h1>
              <p className="page-copy create-copy">
                Create the gift record here, send the link, and fulfill the crypto manually after it is
                claimed.
              </p>

              <form className="gift-form create-form" onSubmit={submit}>
              <label className="field">
                <span>Recipient name</span>
                <input
                  className="input"
                  value={form.recipientName}
                  onChange={(event) => updateField('recipientName', event.target.value)}
                  placeholder="Izzy D"
                />
              </label>

              <label className="field">
                <span>Recipient email</span>
                <input
                  className="input"
                  type="email"
                  value={form.recipientEmail}
                  onChange={(event) => updateField('recipientEmail', event.target.value)}
                  placeholder="izzy@example.com"
                />
              </label>

              <label className="field">
                <span>From</span>
                <input
                  className="input"
                  value={form.senderName}
                  onChange={(event) => updateField('senderName', event.target.value)}
                  placeholder="Uncle Cole"
                />
              </label>

              <label className="field">
                <span>Sender email</span>
                <input
                  className="input"
                  type="email"
                  value={form.senderEmail}
                  onChange={(event) => updateField('senderEmail', event.target.value)}
                  placeholder="cole@example.com"
                />
              </label>

              <label className="field">
                <span>Holiday / Occasion</span>
                <select
                  className="input"
                  value={form.occasion}
                  onChange={(event) => updateField('occasion', event.target.value)}
                >
                  <option value="">No holiday / default theme</option>
                  {holidayOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <div className="two-up">
                <label className="field">
                  <span>Coin</span>
                  <select
                    className="input"
                    value={form.coin}
                    onChange={(event) => updateField('coin', event.target.value)}
                  >
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="SOL">SOL</option>
                    <option value="XRP">XRP</option>
                  </select>
                </label>

                <label className="field">
                  <span>Amount display</span>
                  <input
                    className="input"
                    value={form.amountDisplay}
                    onChange={(event) => updateField('amountDisplay', event.target.value)}
                    placeholder="$10"
                  />
                </label>
              </div>

              <label className="field">
                <span>Gift URL slug</span>
                <input
                  className="input"
                  value={form.giftId}
                  onChange={(event) => {
                    setSlugTouched(true)
                    updateField('giftId', slugify(event.target.value))
                  }}
                  placeholder="izzy-d-st-patricks-day-2026"
                />
              </label>

              <label className="field">
                <span>Message</span>
                <textarea
                  className="input textarea"
                  value={form.messageFromYou}
                  onChange={(event) => updateField('messageFromYou', event.target.value)}
                  placeholder="Optional note for the gift reveal"
                />
              </label>

              {error ? <div className="error">{error}</div> : null}

              <div className="actions">
                <button className="primary landing-primary" type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Gift'}
                </button>
                <Link href="/gift/izzy-d-easter-2026" className="secondary-link create-secondary-link">
                  View sample gift
                </Link>
              </div>
              </form>
            </>
          ) : (
            <section className="create-success">
              <div className="landing-kicker">Gift ready</div>
              <h2 className="create-title">Gift created</h2>
              <p className="create-copy">
                This record is ready to share and will flip to claimed when the recipient submits.
              </p>
              <div className="summary summary-success create-summary">
                <input className="input" readOnly value={shareUrl} />
                <div className="actions">
                  <button
                    className="primary landing-primary"
                    type="button"
                    onClick={() => {
                      setStage('form')
                      setCreatedGiftId('')
                    }}
                  >
                    Create Another
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  )
}
