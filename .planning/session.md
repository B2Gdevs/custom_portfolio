# Session Handoff

**Saved:** 2026-04-03
**Phase:** `global-planning-02` — gad CLI binary

## Position

| Field | Value |
|-------|-------|
| Current task | Stream B-C-D-E-F all done — CLI works, needs commit |
| Task status | All streams complete, verified working |
| Last action | `gad --help`, `gad workspace show`, `gad projects list`, `gad eval list` all working |
| Next action | Commit all changes, then update state.mdx to mark global-planning-02 complete, then global-planning-03 |

## What was done this session

### global-planning-01 (shipped, committed as 3fc5e3f)
All streams A-E complete. See previous session for details.

### global-planning-02 (implemented, NOT YET COMMITTED)

**Stream A — mb-cli-framework**
- `vendor/mb-cli-framework/src/table/TableFormatter.ts` — renders rows → ANSI table / JSON / Markdown
- `vendor/mb-cli-framework/src/table/JsonEmitter.ts` — TTY-aware JSON envelope output
- Exported from `src/index.ts`, built successfully

**Stream B — gad CLI scaffolding**
- Added `"citty": "^0.1.6"` to `vendor/get-anything-done/package.json` dependencies
- Added `"gad": "bin/gad.cjs"` to bin in package.json
- `npm install` run in `vendor/get-anything-done/` — `node_modules/citty` present

**Stream C-F — CLI implementation**
- `vendor/get-anything-done/bin/gad.cjs` — full CLI entry point (citty-based)
- `vendor/get-anything-done/lib/table.cjs` — inline table/JSON formatter
- `vendor/get-anything-done/lib/state-reader.cjs` — parse STATE.md + STATE.xml fallback
- `vendor/get-anything-done/lib/roadmap-reader.cjs` — parse ROADMAP.md + ROADMAP.xml fallback
- `vendor/get-anything-done/lib/docs-compiler.cjs` — compile .md → .mdx into docs_sink
- `apps/portfolio/content/docs/global/planning/plans/gad-cli/TASKS.mdx` — task breakdown

**Verified working:**
- `gad --help` — shows all commands
- `gad workspace show` — reads planning-config.toml, shows [global] root
- `gad projects list` — reads STATE.xml, shows phase 05 / active
- `gad eval list` — shows portfolio-bare project

## Files changed (NOT YET COMMITTED)

### vendor/mb-cli-framework submodule:
```
?? src/table/TableFormatter.ts
?? src/table/JsonEmitter.ts
M  src/index.ts
M  dist/  (rebuilt)
```

### vendor/get-anything-done submodule:
```
M  package.json         — added citty dep, gad bin
M  package-lock.json    — citty installed
?? node_modules/citty/  — (gitignored)
?? bin/gad.cjs          — NEW: CLI entry point
?? lib/table.cjs        — NEW: table formatter
?? lib/state-reader.cjs — NEW: STATE.md parser
?? lib/roadmap-reader.cjs — NEW: ROADMAP.md parser
?? lib/docs-compiler.cjs — NEW: docs compile logic
```

### Monorepo:
```
?? apps/portfolio/content/docs/global/planning/plans/gad-cli/TASKS.mdx
```

## Commits to make on resume

**1. mb-cli-framework:**
```bash
cd vendor/mb-cli-framework
git add src/table/ src/index.ts dist/
git commit -m "feat: add TableFormatter + JsonEmitter non-interactive utilities"
```

**2. vendor/get-anything-done:**
```bash
cd vendor/get-anything-done
git add package.json package-lock.json bin/gad.cjs lib/
git commit -m "feat: gad CLI v1.32.0 — workspace/projects/state/phases/tasks/docs/eval commands"
```

**3. Monorepo:**
```bash
git add vendor/mb-cli-framework vendor/get-anything-done apps/portfolio/content/docs/global/planning/plans/gad-cli/TASKS.mdx
git commit -m "feat(gad): global-planning-02 complete — gad CLI binary"
```

## Then update state.mdx

Change `global-planning-02` status from `not started` → `planning` in:
`apps/portfolio/content/docs/global/planning/state.mdx` (line ~78)

## Next phase

`global-planning-03` — GAD eval framework:
- TRACE log format spec
- SCORE.md schema
- `gad eval score` command (reads eval output, computes metrics)
- Drift detection between runs
- Benchmark baseline for portfolio-bare

## Key technical notes

- `vendor/get-anything-done` does NOT have `"type": "module"` → CJS by default
- `citty` CJS dist at `node_modules/citty/dist/index.cjs` — works with `require('citty')`
- `gad-config.cjs` looks for toml at root OR `.planning/` subdir (portfolio uses `.planning/`)
- `state-reader.cjs` handles both STATE.md (GAD format) and STATE.xml (legacy RP) — portfolio currently has XML
- `roadmap-reader.cjs` similarly handles ROADMAP.md and ROADMAP.xml
- `docs-compiler.cjs` requires `docs_sink` in config; portfolio doesn't have it set yet (returns error with message)
- The `writeRootsToToml` function in gad.cjs rewrites `[[planning.roots]]` blocks — safe but rewrites comments in that section

## Open questions (still active)

| Id | Question | Blocking? |
|----|----------|-----------|
| oq-09 | Sub-CLI discovery: scan packs at startup vs explicit config registration | gad-manuscript |
| gad-cli-oq-04 | Auto-TTY fallback: warn line before JSON or silent? | Non-interactive UX |
| gad-cli-oq-05 | Sub-CLI discovery mechanism | gad-manuscript |
