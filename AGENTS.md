# Agent guide (monorepo)

**Start here.** This file defines how **planning**, **documentation**, and the **Ralph-style loop** work in this repository.

## Planning model: two layers, one workflow

**`.planning/`** at the repo root is the **root planning section**. It uses **XML + `planning-config.toml` + `.planning/AGENTS.md`** -- same *roles* as a docs section, different *format* (machine-friendly, RepoPlanner-aligned).

Each docs **section** should converge on a section-level **`requirements.mdx`** plus a literal **`planning/`** folder whose living records are **`roadmap.mdx` -> `state.mdx` -> `task-registry.mdx` -> `decisions.mdx`**. **`planning-docs.mdx`** remains a local playbook/index, with optional **`errors-and-attempts.mdx`** and **`plans/`** for support material.

| Role | Root (`.planning/`) | Docs section (`content/docs/<section>/planning/`) |
| --- | --- | --- |
| **Index / playbook** | `.planning/AGENTS.md` | `planning-docs.mdx` (local playbook, not the living record set) |
| **Current pointer** | `STATE.xml` | `state.mdx` |
| **Tasks** | `TASK-REGISTRY.xml` | `task-registry.mdx` |
| **Phases / timeline** | `ROADMAP.xml` | `planning/roadmap.mdx`; cross-section overview = [`documentation/roadmap.mdx`](apps/portfolio/content/docs/documentation/roadmap.mdx) |
| **Requirements narrative** | `REQUIREMENTS.xml` (stub -> paths below) | `requirements.mdx`; **monorepo-wide** scope also lives in [`documentation/requirements.mdx`](apps/portfolio/content/docs/documentation/requirements.mdx) |
| **Cross-cutting queue** | Mirror or link in `STATE.xml` `next-action` / tasks | [`documentation/planning/state.mdx`](apps/portfolio/content/docs/documentation/planning/state.mdx) **Cross-cutting queue** |
| **Decisions** | `DECISIONS.xml` | `decisions.mdx` |
| **Attempts / errors** | `ERRORS-AND-ATTEMPTS.xml` | `errors-and-attempts.mdx` |
| **One-off phase plans** | `.planning/phases/<phase-id>/` after full init | `plans/<phase-id>/` |

**Do not** treat **repo-root `REQUIREMENTS.md`** as the canonical requirements document. It is at most a **stub or legacy pointer**. **Do not** add **`.planning/REQUIREMENTS.md`** or treat **`.planning/IMPLEMENTATION_PLAN.md`** as the living planning source. If a phase needs a temporary plan, store it inside that phase's planning folder.

---

## Mandatory read order (agents)

1. **This file** (`AGENTS.md`).
2. **Global human-first planning entrypoint:** **[global/requirements.mdx](apps/portfolio/content/docs/global/requirements.mdx)**, then **[global/planning/roadmap.mdx](apps/portfolio/content/docs/global/planning/roadmap.mdx)**, **[global/planning/state.mdx](apps/portfolio/content/docs/global/planning/state.mdx)**, **[global/planning/task-registry.mdx](apps/portfolio/content/docs/global/planning/task-registry.mdx)**, **[global/planning/decisions.mdx](apps/portfolio/content/docs/global/planning/decisions.mdx)**, and **[global-planning.mdx](apps/portfolio/content/docs/global/global-planning.mdx)**.
3. **Scope of your work:**
   - **Section-scoped work:** read that section's **`requirements.mdx`**, then **`planning/roadmap.mdx`**, **`planning/state.mdx`**, **`planning/task-registry.mdx`**, and **`planning/decisions.mdx`**. Open **`planning/planning-docs.mdx`** only when you need the section-local playbook or index.
   - **Fiction / one novel (`books/<slug>/` + `content/docs/books/<slug>/planning/`):** read that stream's **`planning/AGENTS.md`** immediately after [books requirements](apps/portfolio/content/docs/books/requirements.mdx) when the task is **story or manuscript** (not reader/tooling code). That file defines the fiction loop; software rules below still apply if you touch code.
   - **Monorepo / XML / RepoPlanner / cross-section gates:** **`.planning/AGENTS.md`**, then **`ROADMAP.xml`**, **`STATE.xml`**, **`TASK-REGISTRY.xml`**, stub **`REQUIREMENTS.xml`**, then **[documentation/requirements.mdx](apps/portfolio/content/docs/documentation/requirements.mdx)** and **[documentation/planning/state.mdx](apps/portfolio/content/docs/documentation/planning/state.mdx)**.
4. **Section overview table:** **[documentation/roadmap.mdx](apps/portfolio/content/docs/documentation/roadmap.mdx)**.
5. **Operators / RepoPlanner CLI:** **[repo-planner/requirements.mdx](apps/portfolio/content/docs/repo-planner/requirements.mdx)**, **[repo-planner/planning/roadmap.mdx](apps/portfolio/content/docs/repo-planner/planning/roadmap.mdx)**, **[repo-planner/getting-started.mdx](apps/portfolio/content/docs/repo-planner/getting-started.mdx)**, and **[repo-planner/planning/decisions.mdx](apps/portfolio/content/docs/repo-planner/planning/decisions.mdx)**.

Active sections today include **`global/`**, **`documentation/`**, **`books/`**, **`repo-planner/`**, **`blog/`**, **`projects/`**, **`listen/`**, **`magicborn/`**, **`dialogue-forge/`**, and **`editor/`**.

---

## Loop

1. Read code state and the **planning layer** you are changing (Global first, then the relevant section, then **`.planning/*.xml`** when monorepo gates matter).
2. Pick **one phase**, then one task inside it.
3. If the phase is new, ambiguous, stale, or has no clear **definition of done**, create or refresh a short **kickoff** record before implementation. Include current phase **open questions** even when they are not blocking, and record answers as decisions when resolved. Store phase-local support docs under `planning/plans/<phase-id>/`.
4. Implement task-by-task until the phase meets its definition of done and its requirements.
5. Run **verification**. Any phase that changes executable behavior must include automated tests before it can be marked **`done`**. If tests are missing, the phase is not done.
6. Mark **`done`** in **`TASK-REGISTRY.xml`** and/or the relevant section `planning/task-registry.mdx`; refresh **state**, **roadmap**, **decisions**, **errors-and-attempts**, and **`.planning/STATE.xml`** when they changed.
7. Exit; next iteration starts with fresh context.

## Phase Rules

- Every phase should have: scope, non-goals, dependencies, verification, a clear **definition of done**, and visible phase **open questions** that agents surfaced while planning.
- Use a lightweight **kickoff** when a phase is underdefined; do not start large implementation from a vague roadmap row alone.
- **Tests required for done** is a hard rule for executable behavior. Docs-only or content-only phases still need concrete verification commands, but they do not substitute for tests on shipped behavior.
- Global planning exists to coordinate cross-section work and standards. Section planning exists to own local delivery. Do not duplicate the full same task graph in both places.

### Machine-local paths in planning MDX

| Field | Purpose |
| --- | --- |
| `repoPath` | Repo-relative path to the `.mdx` file. |
| `taskPhase` | Optional phase id (e.g. `documentation-site-07`). |

Reference tasks **by id** in conversation (`books-ai-01-04`, `documentation-site-10-01`).

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

## GSD (Codex)

GSD may create files under **`.planning/`**; this repo's **canonical** loop is described above. Prefer **roadmap/state/task-registry/decisions** over standalone implementation-plan files.

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
