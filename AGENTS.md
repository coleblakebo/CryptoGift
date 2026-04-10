# KindredCoins Agent Guide

## Project Summary

KindredCoins is a small Next.js Pages Router app for creating themed crypto gift links.

Core flow:

1. A sender creates a gift at `/create`.
2. The app stores the gift in Airtable.
3. The sender shares `/gift/[giftId]`.
4. The recipient opens the themed gift page and claims it.
5. The Airtable record flips from `unopened` to `claimed`.
6. Crypto is fulfilled manually outside the app.

## Stack

- Next.js 13 Pages Router
- React 18
- TypeScript
- Airtable as the only source of truth
- Plain CSS in `src/styles/globals.css`

## Important Files

- `src/pages/create.tsx`
  Gift creation UI and share-link success screen.

- `src/pages/gift/[id].tsx`
  Gift reveal, holiday theming, and claim flow.

- `src/pages/api/create-gift.ts`
  Validates and normalizes create requests.

- `src/pages/api/claim.ts`
  Validates claim submissions and updates status.

- `src/lib/gifts.ts`
  Airtable read/write logic and gift mapping.

- `src/lib/env.ts`
  Loads `.env.local` during local development.

- `src/styles/globals.css`
  Global styles plus holiday/theme visuals.

- `tests/unit`
  Unit tests for shared logic.

## Airtable

The app expects one Airtable table, currently configured via:

- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`
- `AIRTABLE_TABLE`

Recommended Airtable fields:

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

Status lifecycle:

- `unopened`
- `claimed`
- `sent`

`giftId` is the canonical identifier. `giftUrl` is helpful but secondary because domains can vary in development.

## Theming Rules

The base/default gift page should always work when no holiday is selected.

Current special holiday experiences live in `src/pages/gift/[id].tsx` and `src/styles/globals.css`:

- Birthday
- Easter
- St. Patrick's Day

When adding a new holiday:

1. Add it to the create flow in `src/pages/create.tsx`.
2. Keep the holiday naming consistent and controlled.
3. Add a clear fallback to the default theme when the holiday is blank or unknown.
4. Make mobile behavior intentional, not just desktop-first.

## Development Notes

- Run locally with `npm run dev`.
- Build-check with `npm run build`.
- Restart the dev server after changing `.env.local`.
- Unsaved `.env.local` changes will not be visible to the app.

## Git Workflow

- `main` is production.
- `develop` is the integration branch for upcoming releases.
- Do not work directly on `main`.
- Prefer branching from `develop` for feature work.
- When creating a PR, default the base branch to `develop`.
- Do not create PRs directly to `main` unless it is a release PR from `develop`.
- Merge feature branches into `develop` through pull requests.
- Merge `develop` into `main` when releasing.
- Pushes to `main` also trigger an automatic GitHub Release workflow.
- A GitHub Actions merge guard is used so `main` should only accept pull requests whose head branch is `develop`.

Suggested branch names:

- `feature/<name>`
- `fix/<name>`
- `chore/<name>`

## Change Guidance

- Preserve the sender/recipient creation flow unless explicitly changing product behavior.
- Preserve Airtable as the only source of truth.
- Do not reintroduce local JSON storage.
- Keep gift pages fun, clear, and mobile-friendly.
- Treat claimed and sent gifts as closed states.
- Be careful with optional fields returned through `getServerSideProps`; use `null` instead of `undefined` for serialized data.

## Testing Guidance

Before finishing meaningful changes:

1. Run `npm test`.
2. Run `npm run build`.
3. Manually sanity-check `/create`.
4. Manually sanity-check at least one `/gift/[id]` flow if the change touches gift rendering or claim behavior.
