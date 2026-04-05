# Session Handoff — 2026-04-05

**Session:** s-mnkqq67t-gnzz (continued)
**Phase:** 05 (global)
**Methodology version:** 1.0.0

## Completed this session (2026-04-05 continued)
- **v6 cli-efficiency eval:** session-scoped `gad state` + `gad phases` by default when session active. token_reduction: 0.940, composite: 0.976 — all three targets met simultaneously. Decision: gad-14.
- **eval-run + eval-report skills:** `gad:eval-run` and `gad:eval-report` skills written. portfolio-bare eval redesigned as real agent sessions (not automated harness). `gad session new --fresh` declares context mode. `contextMode` field in session JSON + ctx column in `gad session list`. template/ directory for fresh eval copies. Decision: gad-15.
- **Parser 100% field coverage:** Fixed task-registry-reader (`<task\s` regex, `agent-id`, `commands[]`), roadmap-reader (`depends`, `milestone`, `readDocFlow`), decisions-reader.cjs (new), requirements-reader.cjs (new), requirementsXmlToMd rewritten (no longer a tag-stripper). New CLI: `gad decisions`, `gad requirements`. tests/parser-coverage.test.cjs: **43/43 passing**.

## Remaining
- Run planning-migration eval v2 (compile grime-time + any new roots into sink)
- Sink auto-create for new sections: already works (mkdirSync recursive by root.id) — needs test
- Continue migrating docs + running trace for cli-efficiency v7 if needed

## Resume
```sh
gad context --session s-mnkqq67t-gnzz --json
```
- **Task 5 (missing-arg UX):** eval run/score/diff and session resume/close now print available choices + rerun hint instead of blind citty error. `required: true` replaced with custom guards. Helpers: `listEvalProjectsHint()` and `listActiveSessionsHint()`. Decision: gad-12.
- **Task 1 (gad context rebuild):** `gad context` now inlines all file contents by default. `--refs` flag = old lightweight mode. JSON mode also inlines content unless `--refs`. Decision: gad-09.
- **Task 2 (gad snapshot):** `gad snapshot [--project <id>]` added. Inlines every .planning/ file (priority order: STATE, ROADMAP, REQUIREMENTS, DECISIONS, TASK-REGISTRY, then alpha). Decision: gad-10.
- **Task 3+4 (eval subcommands):** Added `eval status` (coverage gaps), `eval runs`, `eval show`, `eval scores`. All follow missing-arg UX pattern. Updated evalCmd subCommands.
- **Task 6 (vendor registration):** grime-time-site registered as GAD root (id=grime-time). Only vendor with existing .planning/. mb-cli-framework, gad-manuscript, repub-builder have none yet.
- **Task 7 (gad sink):** `gad sink status/compile/decompile/validate` added. Decision: gad-11.
- **Decisions captured:** gad-09 through gad-12 written to DECISIONS.xml.

- **gad eval trace:** `list/show/diff/report/write` subcommands. TRACE.json schema defined. Backfilled v2 and v3 traces for cli-efficiency. Diff correctly shows U5 improved v2→v3 (Truncated→Full). Report shows U6/U7/U8 as persistent problem units. Decision: gad-13.

- **planning-migration eval v1 (score 0.978):** docs-compiler.cjs rewritten — XML support, correct path (`planning/state.mdx`), safe-overwrite (`generated: true` guard). grime-time: 6 MDX sink files created from XML (81/81 decisions, 18/18 phases, 120/120 tasks — lossless). Human-authored global/repo-planner sink preserved. RUN.md + SCORE.md + TRACE.json written.

## Remaining queue
- ~~gad eval trace list/show/diff/report~~ ✓ done
- ~~gad eval version~~ ✓ done — prints methodology + CLI version
- ~~gad projects audit~~ ✓ done — per-project: dir, required files, format, sink exists, sink fresh
- ~~planning-migration eval run~~ ✓ done (v1 score: 0.978)
- Run cli-efficiency v4 (U6/U7/U8 fixes — documented in SCORE.md)

## cli-efficiency v4 targets — DONE
- ✓ U6: `gad tasks` goal 60→200 chars + `--full` flag (no truncation)
- ✓ U7: `gad phases --full` prints complete goal per phase as readable blocks
- ✓ U8: `touchStateXml()` writes ISO date to `<last-updated>` on session new/resume
- ✓ v4 eval written: composite 0.920. U6 Full. U7/U8 still partial — fixes documented in SCORE.md.

- ✓ v5 eval: composite **0.950** (target hit). completeness = 1.000 first time. U7 Full (active phase goals in JSON), U8 Full (ISO date from STATE.xml). Token trend: v2:1480 → v3:1358 → v4:2093 → v5:2341.

## v6 target: token_reduction ≥ 0.90 — DONE ✓
- ✓ `gad state` + `gad phases` scope to session project by default (no flag needed)
- `getActiveSessionProjectId()` reads most-recent non-closed session → projectId
- Actual CLI tokens: 1,104 (projected ~1,300)
- token_reduction: 0.940 (projected 0.92) — exceeded target
- v6 eval: composite **0.976** — all three metrics hit target simultaneously for first time
- Decision: gad-14

## Resume
```sh
gad context --session s-mnkqq67t-gnzz --json
```

---

# Previous session notes (2026-04-04 final)

**Session:** s-mnkqq67t-gnzz
**Phase:** 05 (global) / Phase 7 (repo-planner: GAD migration)
**Methodology version:** 1.0.0 (formalizing now)

## Safety backup
Planning sink backed up: `.tmp/planning-sink-backup-20260404`
Do NOT delete until migration eval passes lossless round-trip.

## Completed this session
- cli-efficiency v3 (scientific format, score 0.914)
- DEFINITIONS.md — formal context/fidelity/formula spec
- repo-planner registered as GAD project
- skills/manuscript migrated; skills/README.md catalog
- DECISIONS.xml gad-01 to gad-05
- next-action truncation removed; gad state --full / --json restructured
- koodo-reader + kookit submodules removed
- CLI-SPEC.md written — canonical spec for all future gad commands
- planning-migration eval project skeleton created
- planning sink backed up

## Implementation queue

### PHASE A — gad eval + gad trace (implement first, reference CLI-SPEC.md)
- gad eval status — all projects + eval coverage gap flags
- gad eval runs/show/scores subcommands
- gad eval trace list/show/diff/report
- Missing-arg: print list + rerun hint, never error blind
- gad eval run --baseline --projectid — portfolio-bare as control variable (YELLOW)
- gad eval version — GAD methodology version

### PHASE B — gad projects audit + gad sink
- gad projects audit — format violations, missing files, sink gaps
- gad sink status/compile/decompile/diff/validate
- Lossless round-trip requirement: compile(decompile(x))=x

### PHASE C — vendor registration + format migration
- Register: grime-time-site (has XML), mb-cli-framework, repub-builder, gad-manuscript
- Compliance rules in CLI-SPEC.md
- Run gad sink validate on each before touching files

### PHASE D — planning-migration eval run
- Baseline: .tmp/planning-sink-backup-20260404
- Trace all file touches; evaluate format_compliance + lossless_roundtrip + trace_coverage

## Questions for user before Phase C
1. grime-time-site: migrate XML in place or keep XML + add MD alongside?
2. gad-manuscript: register in this repo's planning-config.toml or standalone?
3. GAD v1.0.0 defining characteristics vs pre-1.0 GSD loop?

## Resume
```sh
gad context --session s-mnkqq67t-gnzz --json
# read vendor/get-anything-done/docs/CLI-SPEC.md before any new command implementation
```

## Answers received 2026-04-04

### Q1: Format flexibility (CRITICAL — changes CLI-SPEC)
- Sub-repos and .planning/ dirs can be XML, MD, or MDX — any format stays as-is
- The SINK normalizes to MDX only (that is the sink's contract)
- GAD CLI must parse all three formats (XML, MD, MDX) transparently
- compile: any format → MDX in sink
- decompile: MDX from sink → back to original format (XML if it was XML, MD if MD)
- The CLI and coding agents must be format-agnostic — methodology is the constant
- gad sink validate checks: can we parse this? does it round-trip? not: is it MDX?

### Q2: gad-manuscript = self-contained repo
- NOT registered in this repo's planning-config.toml
- Domain translator pattern: standalone repo that adapts GAD base to a vertical
- References GAD core skills but owns its own skill set and evals

### Q3: GAD v1.0.0 defining shift = skills-first + evaluation
- Pre-1.0 (GSD/ralph-wiggum): workflow-heavy, agents followed long workflow docs
- v1.0.0: skills are first-class, evaluated, versioned alongside methodology
- Key shifts:
  1. Skills have SKILL.md definitions (agent-agnostic, not Claude Code-specific)
  2. Every skill is evaluated — does it produce correct output?
  3. CLI provides context efficiency (replaces raw file reads)
  4. Evals are scientific (actual content, fidelity levels, agent simulation)
  5. Planning docs are parsed/compiled/decompiled by CLI — not just read
  6. Trace: what an agent retrieves is measured and compared to CLI equivalent
  7. Domain translators extend GAD to verticals (gad-manuscript = first translator)

## Snapshot discussion — 2026-04-04

### What RepoPlanner snapshot actually did (from loop-cli.mjs + planning-parse-core.mjs):
- Parsed ALL planning files (XML state, roadmap, task-registry, phase PLAN.xml files)
- Per-phase: extracted code/doc file refs from task commands ("files likely in mind")
- Token estimates per section (same ~4 chars/token we use now)
- Phase open questions surfaced
- Requirements doc stats (paths, char counts, token counts)
- Produced a structured "planning pack" — full project orientation in one call

### Key distinction (captured for next session):
- `gad context` (fully parsed) = what you need RIGHT NOW to continue work (session-scoped)
- `gad snapshot` = FULL project planning state — all phases, all tasks, file refs per phase,
  open questions, token stats — for deep orientation, handoffs, and eval baselines

These are TWO different commands, not one.
Skills alone are NOT enough — skills are methodology, not state capture.
The snapshot IS the state capture mechanism. It feeds agents a planning pack.

### gad snapshot target output:
{
  "project": "global",
  "methodology": "1.0.0",
  "timestamp": "...",
  "state": { currentPhase, milestone, status, nextAction, openTasks },
  "phases": [{ id, status, title, openQuestions[], fileRefs[] }],
  "tasks": { inProgress: [...], planned: [...] },
  "conventions": { loop, buildCommands, compactionProtocol },
  "tokenStats": { total, bySection: { state, phases, tasks, conventions } },
  "refs": { stale: [], active: [] }   // from STATE.xml references, filtered
}

### What to implement next session (PHASE A addition):
- `gad snapshot [--projectid <id>] [--json]` — full planning pack, one call
- `gad context` rebuilt to return parsed inline content (not refs), use --refs for old mode
- snapshot becomes the eval input — "what did the agent get?"
