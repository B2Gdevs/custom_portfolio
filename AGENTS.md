# Agent guide (Ralph Wiggum loop)

Operational commands and loop state. Keep this file lean (~60 lines).

## Loop

1. Read code state and `.planning/IMPLEMENTATION_PLAN.md`.
2. Pick one task; implement it.
3. Run verification (below); update plan and commit.
4. Exit; next iteration starts with fresh context.

## Root (monorepo)

- Install: `pnpm install` (from repo root).
- Build app: `pnpm run build` (runs `npm run build --workspace=@portfolio/app`).
- Lint: `pnpm run lint`.

## App (apps/portfolio)

- Build: `pnpm run build` from root, or `cd apps/portfolio && pnpm run build`.
- Type-check: part of `next build`; or `cd apps/portfolio && npx tsc --noEmit`.
- Lint: `pnpm run lint` from root (targets app).

## Verification gates

- `pnpm install` succeeds.
- `pnpm run build` succeeds (Next.js + TypeScript).
- `pnpm run lint` passes.

## Artifacts

- `.planning/` – Ralph Wiggum state (plan, progress).
- `AGENTS.md` – this file.

## Conventions

- One logical task per iteration when using the loop.
- Update `.planning/IMPLEMENTATION_PLAN.md` after each task (done / in progress / next).
- Prefer backpressure: fix failing build/lint before adding features.
