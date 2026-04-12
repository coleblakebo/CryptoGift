import { loadLocalEnv } from './env'
import type { Gift } from './gifts'
import { buildAbsoluteUrl, getSiteUrl } from './site'

type EmailConfig = {
  apiKey?: string
  from?: string
  replyTo?: string
  enabled: boolean
}

export type GiftEmailResult =
  | {
      sent: true
      id?: string
    }
  | {
      sent: false
      reason: string
    }

function getEmailConfig(): EmailConfig {
  loadLocalEnv()

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  const replyTo = process.env.EMAIL_REPLY_TO
  const enabled = process.env.EMAIL_ENABLED !== 'false'

  return {
    apiKey,
    from,
    replyTo,
    enabled
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function buildGiftEmailContent(gift: Gift, giftUrl: string) {
  const recipientName = escapeHtml(gift.recipientName)
  const senderName = escapeHtml(gift.senderName)
  const amount = escapeHtml(gift.amountDisplay)
  const coin = escapeHtml(gift.coin)
  const occasion = gift.occasion ? escapeHtml(gift.occasion) : ''
  const message = gift.messageFromYou ? escapeHtml(gift.messageFromYou) : ''
  const safeGiftUrl = escapeHtml(giftUrl)

  const subject = `${gift.senderName} sent you a KindredCoins gift`
  const preview = `${senderName} sent you ${amount} in ${coin}.`
  const text = [
    `Hi ${gift.recipientName},`,
    '',
    `${gift.senderName} sent you a KindredCoins gift: ${gift.amountDisplay} in ${gift.coin}.`,
    gift.occasion ? `Occasion: ${gift.occasion}` : '',
    gift.messageFromYou ? `Message: ${gift.messageFromYou}` : '',
    '',
    `Open your gift: ${giftUrl}`,
    '',
    'KindredCoins helps make crypto gifting feel personal. The sender handles crypto fulfillment manually after you claim.'
  ]
    .filter(Boolean)
    .join('\n')

  const html = `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;background:#fff7ef;color:#111;font-family:Georgia,'Times New Roman',serif;">
    <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preview)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff7ef;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #ffe2d4;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:30px 28px 12px 28px;">
                <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#d95c3d;font-weight:bold;">KindredCoins</div>
                <h1 style="font-size:32px;line-height:1.05;margin:14px 0 12px 0;color:#111;">${senderName} sent you a crypto gift</h1>
                <p style="font-size:17px;line-height:1.6;margin:0;color:#473b33;">Hi ${recipientName}, your gift is ready to open.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 28px;">
                <div style="background:#fff0ea;border-radius:14px;padding:18px 20px;border:1px solid #ffd6c7;">
                  <div style="font-size:24px;font-weight:bold;color:#111;">${amount} &middot; ${coin}</div>
                  ${occasion ? `<div style="margin-top:8px;color:#6b6b6b;">${occasion}</div>` : ''}
                  ${message ? `<p style="margin:14px 0 0 0;color:#333;line-height:1.5;">${message}</p>` : ''}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 30px 28px;">
                <a href="${safeGiftUrl}" style="display:inline-block;background:#ff7a5a;color:#ffffff;text-decoration:none;border-radius:10px;padding:13px 18px;font-weight:bold;">Open my gift</a>
                <p style="font-size:13px;line-height:1.5;color:#6b6b6b;margin:18px 0 0 0;">The sender handles crypto fulfillment manually after you claim.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  return {
    subject,
    html,
    text
  }
}

export async function sendGiftCreatedEmail(gift: Gift): Promise<GiftEmailResult> {
  const config = getEmailConfig()
  if (!config.enabled) {
    return { sent: false, reason: 'Email sending is disabled.' }
  }
  if (!config.apiKey || !config.from) {
    return { sent: false, reason: 'Email is not configured.' }
  }

  const giftUrl = buildAbsoluteUrl(`/gift/${gift.giftId}`, getSiteUrl())
  const content = buildGiftEmailContent(gift, giftUrl)

  let response: Response

  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `kindredcoins-gift-created-${gift.giftId}`
      },
      body: JSON.stringify({
        from: config.from,
        to: gift.recipientEmail,
        reply_to: config.replyTo || gift.senderEmail,
        subject: content.subject,
        html: content.html,
        text: content.text
      })
    })
  } catch {
    return { sent: false, reason: 'Email provider request failed.' }
  }

  const payload = (await response.json().catch(() => null)) as { id?: string; message?: string } | null
  if (!response.ok) {
    return {
      sent: false,
      reason: payload?.message || `Email provider returned ${response.status}.`
    }
  }

  return {
    sent: true,
    id: payload?.id
  }
}
