# Portfolio v2 — reader-only app (`@portfolio/v2`)

Next.js + Payload app that ships the **full repub reader** (workspace, shelf, annotations, uploads) on a single route (`/`). Reader UI is vendored under `lib/reader-ui/` (no `@portfolio/repub-builder` dependency).

## Develop

From the monorepo root (so workspace deps resolve):

```sh
pnpm install
pnpm run dev:portfolio-v2
```

Ensure the repo root has `.env` / `.env.local` with Payload + database variables (see root `.env.example`). Optional: `NEXT_PUBLIC_MAIN_SITE_URL` adds one “Main site” link in the reader shell.

## Books manifest

`public/books/manifest.json` is **not** committed by default. Generate or copy it — see `public/books/README.md`.

## Build

```sh
pnpm run build:portfolio-v2
```

## Vercel

- **Root Directory:** `apps/portfolio-v2` (this folder).
- **Framework:** Next.js (auto-detected). **`vercel.json`** sets `installCommand` + `buildCommand` so the monorepo installs from the repo root and **`pnpm run build`** always runs (avoids deploys that skip `next build` and miss `.next`).
- Leave **Output Directory** empty (Vercel handles Next.js output).
- **`next.config.ts`:** When `VERCEL=1`, file tracing uses **this app directory only** and omits `../../node_modules` NFT globs so the deploy package does not include pnpm symlink trees (fixes “invalid deployment package … symlinked directories”). Local builds still trace from the monorepo root like `apps/portfolio`.
- If an old error persists after fixing config, redeploy with **Clear build cache** once.
- Copy environment variables from your main portfolio project (Payload, DB, S3, Clerk, `PAYLOAD_SECRET`, flags).
