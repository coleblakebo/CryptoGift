# CryptoGift

A small Next.js app for creating and sharing crypto gift links. You create a gift, send the recipient their URL, and when they claim it the same Airtable record flips from `unopened` to `claimed` for manual fulfillment.

## Quick Start

1. Clone the repo and open it in VS Code.

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the project root:

```env
AIRTABLE_API_KEY=your_airtable_token
AIRTABLE_BASE_ID=your_base_id
AIRTABLE_TABLE=Claims
```

4. Run the dev server:

```bash
npm run dev
```

5. Run the unit tests:

```bash
npm test
```

6. Open the main flows:

```text
http://localhost:3000/create
http://localhost:3000/gift/izzy-d-easter-2026
```

## What It Does

- Creates gift records at `/create`.
- Shows a themed gift reveal page at `/gift/[id]`.
- Stores gifts in a single Airtable table.
- Lets recipients either submit a wallet address or mark that the sender already has it.
- Supports default, birthday, Easter, and St. Patrick's Day gift experiences.

## Repo Layout

- `src/pages`
  Next.js pages, routes, and API handlers.

- `src/lib`
  Airtable logic and shared helpers.

- `src/styles`
  Global app styling and holiday theme CSS.

- `tests/unit`
  Unit tests for reusable logic.

## Airtable Fields

Recommended fields in your `Claims` table:

- `giftId`
- `giftUrl`
- `recipientName`
- `recipientEmail`
- `senderName`
- `senderEmail`
- `occasion`
- `coin`
- `amountDisplay`
- `messageFromYou`
- `status`
- `walletAddress`
- `claimedAt`
- `createdAt`

## Status Lifecycle

- `unopened`: gift was created and is ready to share
- `claimed`: recipient claimed the gift
- `sent`: crypto was manually fulfilled by the sender

## Git Workflow

- `main` is the production branch.
- `develop` is the integration branch for upcoming releases.
- Create feature branches from `develop`.
- Open feature pull requests into `develop`.
- Open a release pull request from `develop` into `main` when you are ready to ship.

Example branch names:

- `feature/easter-theme`
- `feature/airtable-automation`
- `fix/mobile-bunny`

## CI / CD

- GitHub Actions runs `npm test` and `npm run build` on pushes and pull requests for `develop`, `main`, and working branches.
- A separate `Main Merge Guard` workflow can be required on `main` so only `develop` is allowed to merge into `main`.
- Connect the GitHub repo to Vercel for hosting.
- Use `main` as the production branch in Vercel.
- Use `develop` and feature branches for preview deployments.
- Add your Airtable env vars in Vercel for Production and Preview environments.

Recommended Vercel env vars:

- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`
- `AIRTABLE_TABLE`

## Milestones And Releases

- Use GitHub Milestones to group work like `MVP polish`, `Public beta`, or `Open launch`.
- Attach issues and PRs to milestones as you plan work.
- Treat merges to `main` as releases to production.
- A GitHub Actions release workflow now creates a GitHub Release automatically on every merge or push to `main`.
- Automatic releases currently use tags like `release-YYYYMMDD-HHMMSS-<sha>`.
- If you want formal semantic versions later, you can switch this to `v0.1.0`, `v0.2.0`, and `v0.2.1`.

## Notes

- Airtable is the only source of truth.
- The app saves `giftId` as the canonical identifier and can also store the full `giftUrl` used at creation time.
- During development, the full gift URL can change if you use tunnels like ngrok or Cloudflare Tunnel.
- The app does not send crypto automatically and does not manage private keys.
