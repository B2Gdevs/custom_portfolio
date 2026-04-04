# Session Handoff

**Saved:** 2026-04-03
**Phase:** `global-planning-03` — GAD eval framework (complete)

## Position

| Field | Value |
|-------|-------|
| Current task | global-planning-03 shipped; state.mdx updated |
| Task status | All eval framework components implemented and committed |
| Last action | Committed eval framework to get-anything-done submodule + monorepo bump |
| Next action | global-planning-04: RP migration — remove redundant skills, adopt GAD MD schema |

## What was done this session

### EPUB static fallback (committed 3f5ba19)
- `getStaticPublicBuiltEpubPath` helper in `published-artifact-resolve.ts`
- Fallback redirect logic in artifact route at all failure points (no Payload row, local file missing, S3 miss, S3 error)
- `vercel.json` updated: `pnpm run build:books` runs before Next.js build
- E2E test suite: `playwright.reader.config.ts` + `reader.spec.ts` with 3 test cases
- Unit test for static path helper

### global-planning-03 — GAD eval framework (committed 61d8cc1)

**Files in `vendor/get-anything-done`:**
- `lib/trace-writer.cjs` — TRACE log append, parse, doc-drift detection, standard artifact set
- `lib/score-generator.cjs` — SCORE.md generation, drift metrics, composite stability index
- `bin/gad.cjs` — added `gad eval score` and `gad eval diff` subcommands
- `evals/README.md` — eval framework overview (structure, CLI, trace format, RUN.md schema)
- `evals/portfolio-bare/AGENTS.md` — eval project instructions for coding agent
- `evals/portfolio-bare/gad.json` — eval project config (type=eval, scoring weights)
- `evals/portfolio-bare/v1/RUN.md` — baseline run (78% coverage, 142 edits, 284k tokens)
- `evals/portfolio-bare/v1/SCORE.md` — baseline score (no drift, first run)

**Verified working:**
- `gad eval list` — shows portfolio-bare, 1 run
- `gad eval score --project portfolio-bare` — generates SCORE.md
- `gad eval diff v1 v2 --project portfolio-bare` — diffs two runs (tested with temp v2)

### State updates
- `global-planning-02` → `complete` in global planning state.mdx
- `global-planning-03` → `planning` in global planning state.mdx

## Commits made this session

```
3f5ba19 feat(reader): static EPUB fallback + vercel build:books; mark global-planning-02 complete
61d8cc1 feat(eval): gad eval framework + reader e2e test suite; bump get-anything-done
```

## Next phase: global-planning-04

**Goal:** RP migration — remove redundant skills, adopt GAD MD schema, become GUI-only

Key tasks:
1. Identify GSD skills that are now redundant with GAD CLI commands
2. Remove or deprecate them in `~/.claude/get-shit-done/`
3. Migrate any remaining RP XML plan files to GAD MD schema
4. Update AGENTS.md to reflect GAD-first workflow
5. Update state.mdx: global-planning-04 status → planning

## Key technical notes

### eval framework
- `evals/<project>/gad.json` with `"type": "eval"` marks it as eval project
- `RUN.md` fields used for scoring: `edit_count`, `skill_calls`, `total_tokens`, `task_count`, `requirement_coverage`
- Baseline is automatically the lexicographically first version (v1)
- Composite stability index: weighted average (coverage 40%, edits 20%, tokens 15%, skills 15%, tasks 10%)
- Doc drift: any file in run dir outside STANDARD_ARTIFACTS set is flagged

### EPUB fallback
- `getStaticPublicBuiltEpubPath(slug)` returns `apps/portfolio/public/books/<slug>/book.epub`
- Route redirects 307 to `/books/<slug>/book.epub` (public static serving)
- Vercel build now runs `pnpm run build:books` first so EPUBs exist at deploy time

## Open questions (still active)

| Id | Question | Blocking? |
|----|----------|-----------|
| oq-09 | Sub-CLI discovery: scan packs at startup vs explicit config registration | gad-manuscript |
| gad-cli-oq-04 | Auto-TTY fallback: warn line before JSON or silent? | Non-interactive UX |
| gad-eval-oq-01 | Who runs the eval agent — claude CLI? Codex? automated script? | `gad eval run` full impl |
| gad-eval-oq-02 | How to freeze baseline? First run auto, or manually designated? | Drift calculation |
| gad-eval-oq-03 | Does GAD-TRACE.log get parsed by CLI or append-only from hook? | TRACE implementation |
