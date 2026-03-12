# Agent guide (Ralph Wiggum loop)

Operational commands and loop state. Keep this file lean (~60 lines).

## Mandatory context

At the start of every session, read **[.planning/REQUIREMENTS.md](.planning/REQUIREMENTS.md)** and **[.planning/IMPLEMENTATION_PLAN.md](.planning/IMPLEMENTATION_PLAN.md)**. They are the source of truth for scope, gates, and next tasks. Never start implementation of a feature or release step before the relevant requirements and implementation-plan tasks are written (or updated) in .planning. If something is ambiguous, document the assumption or open question in REQUIREMENTS or IMPLEMENTATION_PLAN and either ask the user or implement once decided.

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
- `pnpm run lint` passes. Lint failures block release.
- This repo produces three release artifacts: **repub-builder** tarball, **repub-reader** tarball, **Koodo Reader desktop** build. Builds are downloadable into `.releases/` via `scripts/download-releases.cjs`.

## GSD (Get Shit Done) – Codex

- Installed locally: `.codex/skills/gsd-*` (31 skills).
- **Codex CLI:** Run `codex` from project root (Codex loads local `.codex/skills`). Install with `npm install -g @openai/codex` if needed.
- [GSD repo](https://github.com/gsd-build/get-shit-done). Reinstall: clone repo, `node bin/install.js --codex --local` from project root.

### Get started with GSD

1. **Verify:** From project root run `codex`, then in the session run **`$gsd-help`**. You should see the GSD command list.
2. **This repo (existing codebase):** Run **`$gsd-map-codebase`** first so GSD understands the stack. Then **`$gsd-new-project`** (or **`$gsd-new-milestone`**). GSD creates PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md under `.planning/`.
3. **Per phase:** **`$gsd-discuss-phase N`** (optional), **`$gsd-plan-phase N`**, **`$gsd-execute-phase N`**, **`$gsd-verify-work N`**. Repeat for each phase.
4. **Quick one-off tasks:** **`$gsd-quick`** and describe what you want.
5. **Reference:** [GSD README](https://github.com/gsd-build/get-shit-done).

## Artifacts

- `.planning/` – Ralph Wiggum state (plan, progress); GSD also uses `.planning/`.
- `.codex/` – GSD skills for Codex (local install).
- `AGENTS.md` – this file.

## Conventions

- One logical task per iteration when using the loop.
- Update `.planning/IMPLEMENTATION_PLAN.md` after each task (done / in progress / next).
- Prefer backpressure: fix failing build/lint before adding features.
