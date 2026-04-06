# Agent guide (monorepo)

**Start here.** This file defines how **planning**, **documentation**, and the **Ralph-style loop** work in this repository.

## Planning: GAD + RepoPlanner

This repo uses **GAD** (get-anything-done) as the planning framework. The canonical loop is defined in [`vendor/get-anything-done/AGENTS.md`](vendor/get-anything-done/AGENTS.md).

### Session start

```sh
# For vendor projects (GAD tracks itself, grime-time, repub-builder, etc):
node vendor/get-anything-done/bin/gad.cjs snapshot --projectid <id>

# For docs sections (global, documentation, books, etc):
# Read the section's planning/ folder directly
```

Do NOT manually read 10+ planning files. `gad snapshot` gives you everything in one command.

### The loop (gad-18)

1. `gad snapshot` or `gad state` + `gad tasks` — know where you are
2. Pick one task (status=planned)
3. Implement it
4. Update TASK-REGISTRY.xml (mark done), STATE.xml (next-action), DECISIONS.xml (if new decisions)
5. Commit

### Context exhaustion (gad-17)

Auto-compact handles it. After compaction, run `gad snapshot` to re-hydrate and continue. Never stop work, never ask to restart, never start a "fresh session."

### Planning layers

| Layer | Format | Where |
| --- | --- | --- |
| Vendor projects | XML (.planning/) | `vendor/<project>/.planning/` — tracked by GAD |
| Docs sections | MDX (planning/) | `apps/portfolio/content/docs/<section>/planning/` |
| Root planning | XML | `.planning/` — monorepo-wide coordination |

Reference tasks by id in conversation (`books-ai-01-04`, `12-03`).

---

## Root (monorepo)

- Install: `pnpm install` (repo root).
- Build app: `pnpm run build` (runs `npm run build --workspace=@portfolio/app`).
- Lint: `pnpm run lint`.

## App (`apps/portfolio`)

- Dev: `pnpm dev` -- Next + debounced **books** watcher (`public/books/`, see `public/books/README.md`).
- Build / typecheck / lint: as above.

## Verification gates

- `pnpm install` succeeds.
- `pnpm run build` succeeds.
- `pnpm run lint` passes.
- Release artifacts: **Koodo Reader** desktop -- `.releases/` via `scripts/download-releases.cjs`.

## Context compaction

Auto-compact handles context limits. After compaction, run `gad snapshot --projectid <id>` to re-hydrate. Never stop work, never ask to restart.

## Artifacts (quick reference)

| Path | Role |
| --- | --- |
| `apps/portfolio/content/docs/<section>/planning/` | Section planning **MDX** |
| `.planning/` | Root planning **XML** + `.planning/AGENTS.md` |
| `documentation/requirements.mdx` | **Monorepo requirements** narrative |
| `documentation/planning/state.mdx` | **Cross-cutting queue** |
| `documentation/roadmap.mdx` | **Section / root overview** table |
| `vendor/repo-planner/` | RepoPlanner **submodule** |
| `.planning-reports/` | CLI usage / reports (gitignored) |
| `.planning-archive/` | **Removed** (2026-03-28); migration notes in **`documentation/requirements.mdx`** (**Planning archive** section) |
| Root `REQUIREMENTS.md` | **Stub only** -- see file header |

## Conventions

- One logical task per iteration.
- Prefer backpressure: fix failing build/lint before adding features.

### Portfolio UI (`apps/portfolio/components`)

**shadcn-style primitives** live under **`components/ui/`** — the code is **vendored into the repo** (not a black-box npm package). **Own and edit** those files for **design-system** needs (tokens, variants, a11y). **Do not** put product rules, section copy, or route logic in `ui/`.

**Composition:** build features under **`components/<domain>/`** (e.g. `content/`, `listen/`, `layout/`). Rough **atomic mapping**: `ui/*` ≈ atoms (buttons, inputs, sidebar shell); reusable **domain** pieces (e.g. discovery filter chips) ≈ molecules; **page-level** sections ≈ organisms. **Deduplicate** repeated UI in **domain** folders first; touch **`ui/`** only when the primitive is wrong for the whole app.

## Public site copy (portfolio and apps)

**Audience-facing** strings must read like finished product, not a dev log. Most of the site mixes two registers; use the one that matches the surface you are editing.

### Registers (what most of the app sounds like)

1. **Editorial / catalog** -- Used for **hero summaries**, **listen track and preset descriptions**, **project narratives**, **blog intros**, and anywhere the reader should *feel* the work. Typical shape: **one or two sentences**, concrete imagery, present tense or timeless statements. Often a short setup plus a **colon or dash** and a **list of qualities** (mood, stakes, texture). Examples already in the repo: listen rows in [`apps/portfolio/lib/listen-catalog.ts`](apps/portfolio/lib/listen-catalog.ts) ("A sharp-edged introduction…", "This lane can hold songs that feel like…"). Match **density and vocabulary** to the neighboring rows, not to a ticket comment.

2. **Utility / navigation** -- Used for **mega-menu items**, **button labels**, **empty states that instruct**, **short card subtitles**. Typical shape: **few words**, **verb or noun phrase**, no backstory. Examples: "Open the BandLab track page.", "Browse the full projects grid.", "Start reading". Descriptions explain **what the user gets** in one line, not how it was built.

3. **Orienting / section chrome** -- Section kickers plus headlines (e.g. home archive gateway): **honest, slightly editorial**, still **scannable**. One line of context under the headline is enough; avoid stacking three paragraphs of process.

**Documentation** pages on `/docs` are allowed to name **planning loops, architecture, and requirements** in plain language (see [`ArchiveGateway`](apps/portfolio/components/home/ArchiveGateway.tsx) card copy) -- that is still **reader-facing technical prose**, not internal task logs.

### Wording and content to prefer

- **Name the thing** -- Titles use **real release or product names**, not generic labels ("BandLab effect preset") unless the product is literally unnamed.
- **Describe the experience** -- For creative entries, say what it **sounds like**, **feels like**, or **is for**; for tools, say what **opens** or **what you can do next**.
- **Concrete over abstract** -- Prefer specific nouns (instruments, moods, use cases) over "robust", "seamless", "leverage", "solutions".
- **One thought per sentence** in utility copy; **one short paragraph** for most card bodies unless the pattern in that grid already uses more.

### Wording to avoid (on the site and in app UI)

- **Implementation diary** -- Phrases like "now surfaced", "replaces fake…", "filler rows", "for the listening room", "live link", "so the catalog only shows real entries". Those belong in **`task-registry` / PR descriptions**, not in `listen-catalog`, menus, or MDX shown to visitors.
- **Passive vendor-speak** -- "A publicly listed BandLab track…" -- say what the **piece is**, not where it was listed.
- **Duplication** -- Never paste the same sentence twice in one view; fix the UI or data if that happens.
- **Placeholder tone** -- "Lorem", "TODO copy", "placeholder title", or strings that only make sense to someone who read the last commit.

### Planning vs ship

- **`TASK-REGISTRY.xml`**, section **`task-registry.mdx`**, **`STATE.xml` goals**, and **`decisions.mdx`** may stay **technical and task-shaped**.
- When work **ships strings users see** (catalog, nav, modals, onboarding, visible MDX), **rewrite** into one of the registers above before merge.

### Quick check

Read your line **next to** an existing row in the same component or file. If it sounds like a **commit message** or a **standup note**, rewrite it. If it sounds like it could sit in a **liner note, README section, or app store description** for that product, you are closer to the house style.
