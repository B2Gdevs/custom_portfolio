# Session Handoff

**Saved:** 2026-04-03
**Phase:** `global-planning-04` — RP migration (in progress)

## Position

| Field | Value |
|-------|-------|
| Current task | Deprecation notices done; XML migration gated on in-progress tasks |
| Task status | Partial — rp-* deprecated, AGENTS.md updated, KICKOFF created. XML migration blocked. |
| Last action | Bumped repo-planner submodule with rp-* deprecation notices |
| Next action | Check what in-progress TASK-REGISTRY.xml tasks (02-01, 03-02, 05-01) need, or move to other active work |

## What was done this session

### EPUB static fallback (committed 3f5ba19)
- Route fallback to public/books/<slug>/book.epub at all failure points
- Vercel build now runs build:books before Next.js build
- Unit + E2E tests

### global-planning-02 (already committed, marked complete)

### global-planning-03 — GAD eval framework (committed 61d8cc1)
- `lib/trace-writer.cjs`, `lib/score-generator.cjs`
- `gad eval score / diff` commands
- `evals/portfolio-bare/` with AGENTS.md, gad.json, v1 baseline run + SCORE.md

### global-planning-04 — RP migration (partial, committed d330be4)
- `.planning/AGENTS.md` updated with GAD CLI command table + migration gate note
- `global/planning/plans/rp-migration/KICKOFF.mdx` created (migration steps, success criteria)
- `global/planning/state.mdx`: global-planning-03 → complete, global-planning-04 → planning
- All 11 rp-* SKILL.md files in vendor/repo-planner deprecated with gad: pointer
- repo-planner submodule bumped

## XML migration gate (still blocked)

`gad migrate-schema --yes` is blocked until these TASK-REGISTRY.xml tasks complete:
- `02-01`: shared data/storage provider abstraction (global-data-01 series)
- `03-02`: large git blobs, off-repo publish path (partially done — EPUB artifacts live)
- `05-01`: cross-project observability (Vercel Analytics, logging)

## Next candidates

| Option | Notes |
|--------|-------|
| `05-01` observability pass | Wire Vercel Analytics to portfolio + Grime Time; moderate scope |
| `global-auth-03-03` | CLI invites + role-template/revoke — complex auth work |
| `global-auth-03-04` | Clerk integration (in-progress per state.mdx) |
| `02-01` data/storage | Large architectural task — global-data-01 series |

The next highest-value, bounded task is `05-01` (observability) — it completes a concrete gap and unblocks the XML migration gate (one of the 3 remaining in-progress tasks).

## Key technical notes

### rp-* deprecation
- All 11 rp-* skills now have deprecation notice at top of content (after frontmatter)
- rp-manuscript is NOT deprecated (no direct gad: equivalent yet; gad-manuscript is future)
- XML migration requires manual TASK-REGISTRY.xml → STATE.md merge after `gad migrate-schema --yes`

### gad CLI location
- `node vendor/get-anything-done/bin/gad.cjs` from repo root
- Or `npm link` from vendor/get-anything-done for global `gad` command

## Open questions (still active)

| Id | Question | Blocking? |
|----|----------|-----------|
| oq-09 | Sub-CLI discovery: scan packs at startup vs explicit config registration | gad-manuscript |
| rp-migration-oq-01 | Does vendor/repo-planner read MD files directly or only through pnpm planning CLI? | XML migration |
| rp-migration-oq-02 | Should rp-* skills be removed entirely or just deprecated with a pointer? | Done for now (deprecated) |
| gad-eval-oq-01 | Who runs the eval agent — claude CLI? Codex? automated script? | `gad eval run` full impl |
