# Session Handoff

**Saved:** 2026-04-03
**Phase:** `global-planning-01` — Make GAD self-contained, rename gsd:→gad:, add planning-config.toml support, ship net-new commands

## Position

| Field | Value |
|-------|-------|
| Current task | All streams complete — ready to commit and move to global-planning-02 |
| Task status | global-planning-01 implementation DONE, needs commit + A3 smoke test |
| Last action | Completed all 5 streams (A1-A2, B1-B4, C1-C3, D1-D6, E1-E2) |
| Next action | Commit `vendor/get-anything-done` changes, then A3 smoke test (manual), then mark global-planning-01 complete |

## What was done this session

All tasks in `global-planning-01` implemented:

### Stream A — Install/dependency
- **A1** ✓ — renamed package to `get-anything-done` v1.32.0, added `peerDependencies: {"get-shit-done-cc": ">=1.30.0"}`, updated bin/author/repo/homepage
- **A2** ✓ — `bin/install.js`: added `ensureGsdInstalled()` (runs `npx get-shit-done-cc@latest` with same flags), `writeGadToolsPath()` (writes `<configDir>/get-shit-done/.gad-env` JSON with `GAD_TOOLS_PATH`), called from `installAllRuntimes`
- **A3** — SKIP (manual smoke test, needs actual install)

### Stream B — Command prefix rename
- **B1** ✓ — renamed `commands/gsd/` → `commands/gad/`
- **B2** ✓ — all frontmatter `name: gsd:*` → `name: gad:*` (56 files, 0 remaining with `gsd:`)
- **B3** ✓ — removed 10 trimmed commands (workstreams, list/new/remove-workspace, ui-phase, ui-review, secure-phase, pr-branch, ship, profile-user)
- **B4** ✓ — `install.js` updated to use `commands/gad/`, `gad-*` skill prefixes; `help.md` updated; legacy cleanup still targets `commands/gsd/` (correct)

### Stream C — planning-config.toml
- **C1** ✓ — `bin/gad-config.cjs` written: reads `planning-config.toml` (root or `.planning/` subdir), returns `roots`, `docs_sink`, `ignore`, `sprintSize`, `profiles`; CLI entry point at `node bin/gad-config.cjs --root <dir>`
- **C2** ✓ — fallback to `config.json` `planning.sub_repos` already in `gad-config.cjs`
- **C3** ✓ — `get-shit-done/templates/planning-config.toml` written with annotated `[[planning.roots]]` example

### Stream D — Net-new commands
- **D1** ✓ — `commands/gad/workspace-sync.md`
- **D2** ✓ — `commands/gad/workspace-add.md` + `workspace-show.md`
- **D3** ✓ — `commands/gad/docs-compile.md`
- **D4** ✓ — `commands/gad/migrate-schema.md`
- **D5** ✓ — `commands/gad/eval-run.md` (git worktree skeleton)
- **D6** ✓ — `commands/gad/eval-list.md` + `evals/portfolio-bare/REQUIREMENTS.md`

### Stream E — README + CHANGELOG
- **E1** ✓ — `README.md` rewritten: GSD-powered positioning, 3-tier scaling model, canonical portfolio example
- **E2** ✓ — `CHANGELOG.md` v1.32.0 entries added

## Files changed in `vendor/get-anything-done`

```
M  CHANGELOG.md
M  README.md
M  bin/install.js          — ensureGsdInstalled, writeGadToolsPath, commands/gad paths
?? bin/gad-config.cjs      — NEW
D  commands/gsd/           — deleted (56 files)
?? commands/gad/           — NEW (56 files: 49 renamed + 7 new)
?? evals/portfolio-bare/REQUIREMENTS.md  — NEW
M  package.json            — renamed, version, peerDeps, bin, author, repo
?? get-shit-done/templates/planning-config.toml — NEW
```

## Commit to make

Inside `vendor/get-anything-done`:
```bash
git add -A
git commit -m "feat: GAD v1.32.0 — rename package, gad: prefix, planning-config.toml, workspace/docs/eval/migrate commands"
```

Then from repo root:
```bash
git add vendor/get-anything-done
git commit -m "feat(gad): v1.32.0 — foundation complete (global-planning-01)"
```

## Next phase

`global-planning-02` — `gad` CLI binary via mb-cli-framework:
- `gad workspace sync/add/show` as real CLI commands (not just slash commands)
- `gad docs compile` CLI
- `gad eval run/list` CLI
- Integration with `vendor/mb-cli-framework`

## Open questions (still active)

| Id | Question | Blocking? |
|----|----------|-----------|
| oq-09 | Sub-CLI discovery: scan packs at startup vs explicit config registration | gad-manuscript registration |
| oq-10 | gad-manuscript STATE.md: replace or extend base GAD template | gad-manuscript work |
| oq-11 | Mordred's Tale requirements source: from portfolio MDX or separate? | gad-manuscript eval |

## Important context for next session

- `bin/install.js` is large (~5600 lines). The GSD peer install calls `ensureGsdInstalled()` near line 5320 (before `installSdk`). The `writeGadToolsPath()` is called in `installAllRuntimes` after each runtime's `install()` call.
- `gad-config.cjs` looks for `planning-config.toml` at root OR `.planning/planning-config.toml` — portfolio uses the latter.
- New commands in `commands/gad/` follow the same frontmatter pattern as existing ones. The workspace-* and eval-* commands are sketch-level; real implementation happens in global-planning-02 (CLI) and gad-eval plan.
- `install.js` legacy cleanup block at line ~3894 correctly targets `commands/gsd` (old GSD path), while current GAD install uses `commands/gad`.
