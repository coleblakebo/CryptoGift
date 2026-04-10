# CryptoGift - E-Card MVP

Minimal Next.js MVP for personalized crypto gift links. You create a gift record, send the recipient a URL, and when they submit their wallet address the same Airtable record flips from `unopened` to `claimed` for manual fulfillment.

Quick start

1. Install dependencies:

```bash
cd CryptoGift
npm install
```

2. Run the dev server:

```bash
npm run dev
```

3. Try the main flows:

```bash
http://localhost:3000/create
http://localhost:3000/gift/izzy-d-easter-2026
```

What this includes
- A gift creation UI at `/create`.
- A dynamic gift reveal and claim page at `/gift/[id]`.
- A single Airtable table for the full gift lifecycle.
- Creator fields for recipient name, recipient email, sender, occasion, coin, amount, slug, and message.
- Local JSON fallback in `data/gifts.json` for development backup.

Current Airtable fields
- `giftId`
- `recipientName`
- `recipientEmail`
- `senderName`
- `occasion`
- `coin`
- `amountDisplay`
- `messageFromYou`
- `status`
- `walletAddress`
- `claimedAt`
- `createdAt`

Current lifecycle
- `unopened`: gift exists and is ready to share.
- `claimed`: recipient submitted a wallet address.
- `sent`: owner manually sent the crypto.

Notes
- Airtable is the durable source of truth and can trigger automations using `recipientEmail`.
- Local JSON is only a dev fallback and is not durable on Vercel.
- The app never sends crypto automatically and does not handle private keys.
