# KindredCoins

A small Next.js app for creating and sharing crypto gift links. KindredCoins lets you create a gift, send the recipient their URL, and track the same Postgres record from `unopened` to `claimed` for manual fulfillment.

## Quick Start

1. Clone the repo and open it in VS Code.

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the project root:

```env
POSTGRES_URL=your_pooled_connection_string
POSTGRES_URL_NON_POOLING=your_direct_connection_string
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=KindredCoins <gifts@kindredcoins.com>
EMAIL_REPLY_TO=hello@kindredcoins.com
NEXT_PUBLIC_SITE_URL=https://kindredcoins.com
```

4. Initialize the database schema:

```bash
npm run db:init
```

If you already have data in Airtable and want to migrate it into Postgres first, add your old Airtable env vars to `.env.local` temporarily and run:

```env
AIRTABLE_API_KEY=your_airtable_token
AIRTABLE_BASE_ID=your_base_id
AIRTABLE_TABLE=gifts-dev
```

```bash
npm run db:import:airtable
```

If `RESEND_API_KEY` or `EMAIL_FROM` is missing, gift creation and claiming still work. The sender can copy the share link manually and claim confirmation just skips the email step.

5. Run the dev server:

```bash
npm run dev
```

6. Run the unit tests:

```bash
npm test
```

7. Open the main flows:

```text
http://localhost:3000/create
http://localhost:3000/gift/izzy-d-easter-2026
```

## What It Does

- Creates gift records at `/create`.
- Shows a themed gift reveal page at `/gift/[id]`.
- Stores gifts in Postgres using environment-driven database config.
- Lets recipients either submit a wallet address or mark that the sender already has it.
- Can email the recipient their gift link on create and email the sender when the gift is claimed.
- Supports default, birthday, Easter, and St. Patrick's Day gift experiences.

## Repo Layout

- `src/pages`
  Next.js pages, routes, and API handlers.

- `src/lib`
  Postgres logic and shared helpers.

- `src/styles`
  Global app styling and holiday theme CSS.

- `tests/unit`
  Unit tests for reusable logic.

## Postgres Schema

The app uses a single `gifts` table. The included [sql/init.sql](/Users/coleblakeborough/Projects/KindredCoins/sql/init.sql:1) script creates these columns:

- `gift_id`
- `recipient_name`
- `recipient_email`
- `sender_name`
- `sender_email`
- `occasion`
- `coin`
- `amount_display`
- `message_from_you`
- `status`
- `wallet_address`
- `claimed_at`
- `created_at`

## Status Lifecycle

- `unopened`: gift was created and is ready to share
- `claimed`: recipient claimed the gift
- `sent`: crypto was manually fulfilled by the sender

## Git Workflow

- `main` is the production branch.
- `develop` is the integration branch for upcoming releases.
- Create feature branches from `develop`.
- Open feature PRs into `develop`.
- Open a release pull request from `develop` into `main` when you are ready to ship.

Example branch names:

- `feature/easter-theme`
- `feature/postgres-migration`
- `fix/mobile-bunny`

## CI / CD

- GitHub Actions runs `npm test` and `npm run build` on pushes and pull requests for `develop`, `main`, and working branches.
- GitHub Actions also runs CodeQL and a scheduled/package `npm audit` security scan.
- A separate `Main Merge Guard` workflow can be required on `main` so only `develop` is allowed to merge into `main`.
- Connect the GitHub repo to Vercel for hosting.
- Use `main` as the production branch in Vercel.
- Use `develop` and feature branches for preview deployments.
- Add your Postgres env vars in Vercel for Production and Preview environments.

Recommended Vercel env vars:

- `POSTGRES_URL`
- `POSTGRES_URL_NON_POOLING`
- `NEXT_PUBLIC_SITE_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `EMAIL_REPLY_TO`

## Milestones And Releases

- Use GitHub Milestones to group work like `MVP polish`, `Public beta`, or `Open launch`.
- Attach issues and PRs to milestones as you plan work.
- Treat merges to `main` as releases to production.
- A GitHub Actions release workflow now creates a GitHub Release automatically on every merge or push to `main`.
- Automatic releases currently use tags like `release-YYYYMMDD-HHMMSS-<sha>`.
- If you want formal semantic versions later, you can switch this to `v0.1.0`, `v0.2.0`, and `v0.2.1`.

## Notes

- Postgres is the only source of truth.
- The app saves `giftId` as the canonical identifier. Full gift URLs should be derived at runtime from the current origin.
- During development, the full gift URL can change if you use tunnels like ngrok or Cloudflare Tunnel.
- The app does not send crypto automatically and does not manage private keys.
