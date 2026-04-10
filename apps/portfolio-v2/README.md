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

- **Install:** `pnpm install` from the monorepo root.
- **Build:** `pnpm --filter @portfolio/v2 run build` (or set the app root to `apps/portfolio-v2` and use the equivalent).
- Copy environment variables from your main portfolio project (Payload, DB, S3, Clerk, `PAYLOAD_SECRET`, flags).
