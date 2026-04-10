import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'

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
  senderName: 'Uncle Cole',
  senderEmail: '',
  occasion: '',
  coin: 'BTC',
  amountDisplay: '',
  messageFromYou: '',
  giftId: ''
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
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
    <div className="page-root">
      <main className="card card-wide">
        {stage === 'form' ? (
          <>
            <section className="eyebrow">CryptoGift Studio</section>
            <h1 className="page-title">Create a new gift</h1>
            <p className="page-copy">
              Create the gift record here, send the link, and fulfill the crypto manually after it is
              claimed.
            </p>

            <form className="gift-form" onSubmit={submit}>
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
                <button className="primary" type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Gift'}
                </button>
                <Link href="/gift/izzy-d-easter-2026" className="secondary-link">
                  View sample gift
                </Link>
              </div>
            </form>
          </>
        ) : (
          <section>
            <h2>Gift created</h2>
            <p>This record is ready to share and will flip to claimed when the recipient submits.</p>
            <div className="summary summary-success">
              <input className="input" readOnly value={shareUrl} />
              <div className="actions">
                <button
                  className="primary"
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
  )
}
