# Session Handoff

**Saved:** 2026-04-03
**Phase:** `global-planning-01` — Make GAD self-contained, rename gsd:→gad:, add planning-config.toml support, ship net-new commands

## Position

| Field | Value |
|-------|-------|
| Current task | `gad-01-A1` — Add `get-shit-done-cc` as peerDependency in GAD package.json |
| Task status | not started — was about to begin when context ran out |
| Last action | Read `vendor/get-anything-done/package.json` and first 80 lines of `bin/install.js` — context hit 94% |
| Next action | Edit `vendor/get-anything-done/package.json`: rename package to `get-anything-done`, add `peerDependencies: { "get-shit-done-cc": ">=1.30.0" }`, update `bin` key, update `name`/`description`/`repository`/`homepage` to MagicbornStudios/get-anything-done |

## In-progress work

No uncommitted changes. All planning docs written this session are clean. Only `vendor/get-anything-done` and `vendor/gad-manuscript` submodule pointers need committing.

Uncommitted changes:
- `vendor/get-anything-done` — submodule added, no internal changes yet
- `vendor/gad-manuscript` — submodule added (empty repo)
- `apps/portfolio/content/docs/global/planning/plans/gad-architecture/PLAN.mdx` — written
- `apps/portfolio/content/docs/global/planning/plans/gad-architecture/KICKOFF.mdx` — written
- `apps/portfolio/content/docs/global/planning/plans/gad-architecture/TASKS.mdx` — written
- `apps/portfolio/content/docs/global/planning/plans/gad-cli/PLAN.mdx` — written
- `apps/portfolio/content/docs/global/planning/plans/gad-eval/PLAN.mdx` — written
- `apps/portfolio/content/docs/global/planning/plans/gad-manuscript/PLAN.mdx` — written
- `apps/portfolio/content/docs/global/planning/decisions.mdx` — dec-07 through dec-22 added
- `apps/portfolio/content/docs/global/planning/state.mdx` — oq-04 through oq-11, global-planning-01 through 05

## Decisions made this session

All decisions written to `decisions.mdx` (dec-07 through dec-22). Key ones:

| Decision | What was decided | Why |
|----------|-----------------|-----|
| GAD positioning | GAD = GSD-powered platform layer, not competitor | GSD owns runtime, GAD owns monorepo/CLI/packs/eval |
| Command prefix | `gad:` replaces `gsd:` entirely when GAD installed | Avoid dual-prefix confusion |
| planning-config.toml | Canonical config format; `[[planning.roots]]` = multi-project registry | Portfolio already uses this format |
| Autonomous | Default GAD workflow, not a special mode | When AI gets a milestone, autonomous runs it |
| Removed commands | workstreams, list/new/remove-workspace, ui-phase, ui-review, secure-phase, pr-branch, ship, profile-user | Use gad CLI instead |
| Parallelism | Sequential by default; parallel only for explicitly independent tasks | Token cost + conflict rate risk |
| gad-manuscript | Separate repo, sub-CLI registering into gad | New repo MagicbornStudios/gad-manuscript created |
| Eval isolation | Git worktrees per run | Clean state, reproducible baselines |

## Open questions (in state.mdx)

| Id | Question | Blocking? |
|----|----------|-----------|
| oq-09 | Sub-CLI discovery: scan packs at startup vs explicit config registration | gad-manuscript registration |
| oq-10 | gad-manuscript STATE.md: replace or extend base GAD template | gad-manuscript work |
| oq-11 | Mordred's Tale requirements source: from portfolio MDX or separate? | gad-manuscript eval |

## Task list for global-planning-01

Full list in `apps/portfolio/content/docs/global/planning/plans/gad-architecture/TASKS.mdx`.

### Stream A — Install/dependency
- `gad-01-A1` ← **START HERE** — rename package + add peerDep in package.json
- `gad-01-A2` — update bin/install.js: run GSD install first, write GAD_TOOLS_PATH
- `gad-01-A3` — smoke test in clean dir

### Stream B — Command prefix rename
- `gad-01-B1` — rename commands/gsd/ → commands/gad/
- `gad-01-B2` — update all frontmatter name: gsd:* → gad:*
- `gad-01-B3` — remove trimmed commands (10 files)
- `gad-01-B4` — update install.js + help.md

### Stream C — planning-config.toml support
- `gad-01-C1` — write bin/gad-config.cjs: reads toml, returns roots/docs_sink/ignore
- `gad-01-C2` — fallback to config.json sub_repos if no toml
- `gad-01-C3` — scaffold planning-config.toml template

### Stream D — Net-new GAD commands
- `gad-01-D1` — gad workspace sync command
- `gad-01-D2` — gad workspace add + show
- `gad-01-D3` — gad docs compile command
- `gad-01-D4` — gad migrate-schema command
- `gad-01-D5` — gad eval run skeleton (worktree)
- `gad-01-D6` — gad eval list + portfolio-bare eval project

### Stream E — README
- `gad-01-E1` — GAD README.md
- `gad-01-E2` — CHANGELOG.md v1.32.0

## Context that won't survive the reset

- `bin/install.js` is large (65k tokens). Only read the first 80 lines. The relevant section for A2 is the install loop — search for where it writes commands to `~/.claude/commands/gsd/`. That's the section to update to write `commands/gad/` instead.
- GAD's `bin/install.js` handles Claude Code, Codex, OpenCode, Gemini, Copilot — multi-runtime. The command directory path varies per runtime. Search for `gsd` in that file to find all the path references to update.
- "Community commands" = upstream GSD PRs from external contributors, nothing we wrote. GAD fork IS GSD at v1.31.0, just named differently. Our work = the net-new commands in Stream D.
- The GSD SDK (`vendor/get-anything-done/sdk/`) wraps gsd-tools.cjs via shell-out — it is NOT a rewrite. Don't touch the SDK for global-planning-01.
- `planning-config.toml` parser needs a TOML library. Check if `@iarna/toml` or similar is available in the monorepo before adding a new dep. Alternatively, write a minimal TOML parser for the subset we need (simple key=value + [[array of tables]]).

## Verify state before resuming

```bash
git status --short
git log --oneline -5
ls vendor/get-anything-done/
ls vendor/gad-manuscript/
ls apps/portfolio/content/docs/global/planning/plans/gad-architecture/
```

## First commit to make on resume

```bash
git add apps/portfolio/content/docs/global/planning/plans/ \
        apps/portfolio/content/docs/global/planning/decisions.mdx \
        apps/portfolio/content/docs/global/planning/state.mdx \
        vendor/get-anything-done \
        vendor/gad-manuscript \
        .gitmodules
git commit -m "docs(global-planning): GAD architecture spec, CLI, eval, manuscript plans + decisions dec-07 through dec-22"
```

Then start `gad-01-A1`.
