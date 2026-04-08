# `.planning/AGENTS.md` -- root planning section (XML)

Read **root [`AGENTS.md`](../AGENTS.md) first** — it defines the GAD loop (gad-18) and session start. This file covers the XML schema used in `.planning/`.

## What this folder is

`.planning/` is the root planning section: XML files + **`gad-config.toml`** (legacy name `planning-config.toml` still works). It follows the same loop as docs sections (state → tasks → roadmap → decisions), but files are `.xml` for machines and the GAD CLI.

**RepoPlanner → GAD:** remaining dual-stack gaps (scripts, portfolio cockpit, docs, `rp-*` skills) are listed in **[`REPOPLANNER-TO-GAD-MIGRATION-GAPS.md`](REPOPLANNER-TO-GAD-MIGRATION-GAPS.md)**.

| File | Role |
| --- | --- |
| `STATE.xml` | Current phase, `next-action` |
| `TASK-REGISTRY.xml` | Tasks by phase with status |
| `ROADMAP.xml` | Phase goals, status, depends |
| `REQUIREMENTS.xml` | Stub — points to canonical requirements paths |
| `DECISIONS.XML` | Decision atoms |
| `ERRORS-AND-ATTEMPTS.xml` | Failure / attempt log |

## gad-config.toml (GAD config)

Registry of all planning roots and docs projects. The GAD CLI reads this to resolve `--projectid` flags.

- `[[planning.sections]]` = monorepo-wide root (path implied `.`) — use for the **global** docs section tied to repo-root `.planning/`
- `[[planning.roots]]` = vendor/subtree repos with a `path`, full GAD tracking
- `[[docs.projects]]` = domain projects, may not have repo yet, lives in sink

## GAD CLI

Run via `node vendor/get-anything-done/bin/gad.cjs` from repo root. Key commands:

| Command | What |
| --- | --- |
| `gad snapshot --projectid <id>` | Full context for a project — one command |
| `gad state` | Current phase + next-action |
| `gad tasks` | Tasks for current phase |
| `gad phases` | All phases with status |
| `gad sink sync` | Compile planning → docs sink |
| `gad projects list` | All registered projects |
| `gad refs` / `gad refs list` | Aggregate refs from decisions, requirements, phases (table); bare `refs` = list |
| `gad refs verify` | Ensure `<file path>` / `<reference>` in planning XML exist on disk |
| `gad refs migrate --from <old> --to <new>` | Dry-run path replace across planning XML; add `--apply` to write |
| `gad refs watch` | Re-run verify on change; use `--poll 3000` if native watch fails |

## TASK-REGISTRY.xml pattern

```xml
<task id="01-01" agent-id="" status="planned">
  <goal>One-line outcome.</goal>
  <keywords>area,topic</keywords>
</task>
```

Status values: `planned` | `in-progress` | `done` | `blocked`.

## Context compaction

Auto-compact handles context limits. After compaction: `gad snapshot --projectid <id>` to re-hydrate. Never stop work.

## Done gate

Executable behavior is not done without tests. If a phase is missing tests, continue it — do not mark done.

## UI layers (atomic design) — monorepo apps

Root **[`AGENTS.md`](../AGENTS.md)** defines the **Portfolio UI** convention: **`components/ui/`** holds vendored primitives (atoms: buttons, inputs, shell); **`components/<domain>/`** holds product composition (molecules/organisms). **Deduplicate in domain folders first**; change **`ui/`** only when the primitive is wrong app-wide. Vendored apps (e.g. Grime Time under `vendor/`) should follow the same split: shared chrome/tokens in one module (e.g. `adminPanelChrome.ts`), feature UI in a domain folder, not in `ui/` unless it is truly generic.

## File paths in planning XML — drift and verification

**Automatic rewrites do not happen** the way TypeScript updates imports: Git and the docs sink do not fix `<file path="…">` or `<reference>…</reference>` after a rename. Use **`gad refs migrate`** for a repo-wide string replace in planning XML (dry-run by default; `--apply` writes), then **`gad refs verify`**.

**Verify disk existence** (implementation lives in `vendor/get-anything-done/lib/planning-ref-verify.cjs`):

```sh
pnpm run verify:planning-refs
# same as:
node vendor/get-anything-done/bin/gad.cjs refs verify
```

This scans `**/.planning/**/*.xml` (skips `templates/`, tool-only dirs), resolves `src/…` and `.planning/…` relative to each project root (e.g. `vendor/grime-time-site`), and exits with an error if a reference is missing. It does not validate prose in MDX — only machine-readable XML tags.

**Related CLI:** `gad refs` / `gad refs list` aggregates decision/requirement/phase paths for review (no disk check). `gad refs watch` re-runs verify when `.planning/**/*.xml` changes (debounced); on Windows or if `fs.watch` fails, use `gad refs watch --poll 3000`.

**What GAD infers (and does not):** The CLI does **not** parse TypeScript or run the compiler. It only sees **strings** in planning XML (`<file path>`, `<reference>`) and in `gad refs list` output. **`gad refs verify`** checks those strings against the filesystem; **`gad refs migrate`** does literal find/replace. Skills (e.g. execute-phase) use **`gad snapshot`**, not `gad refs`, for bundled context — but any script or doc that still says `gad refs` means the **list** behavior.

**Conventions to reduce churn:** Prefer stable module or feature names in prose; put canonical file lists in `STATE.xml` `<references>` when one place should stay authoritative. Reserve full paths in `DECISIONS.xml` when a decision truly anchors to specific files.
