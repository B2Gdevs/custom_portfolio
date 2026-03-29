# Agent guide (monorepo)

**Start here.** This file defines how **planning**, **documentation**, and the **Ralph-style loop** work in this repository.

## Planning model: two layers, one workflow

**`.planning/`** at the repo root is the **root planning section**. It uses **XML + `planning-config.toml` + `.planning/AGENTS.md`** -- same *roles* as a docs section, different *format* (machine-friendly, RepoPlanner-aligned).

Each docs **section** should converge on a literal **`planning/`** folder with **`planning-docs.mdx` -> `state.mdx` -> `task-registry.mdx` -> `decisions.mdx`** (and optional **`errors-and-attempts.mdx`**, `roadmap.mdx`, and `plans/`) in **MDX** for humans and the public site.

| Role | Root (`.planning/`) | Docs section (`content/docs/<section>/planning/`) |
| --- | --- | --- |
| **Index / playbook** | `.planning/AGENTS.md` | `planning-docs.mdx` |
| **Current pointer** | `STATE.xml` | `state.mdx` |
| **Tasks** | `TASK-REGISTRY.xml` | `task-registry.mdx` |
| **Phases / timeline** | `ROADMAP.xml` | `roadmap.mdx` when present; otherwise phase ids in `task-registry.mdx`; cross-section overview = [`documentation/roadmap.mdx`](apps/portfolio/content/docs/documentation/roadmap.mdx) |
| **Requirements narrative** | `REQUIREMENTS.xml` (stub -> paths below) | **Per-section** needs live in that section's pages; **monorepo-wide** scope = [`documentation/requirements.mdx`](apps/portfolio/content/docs/documentation/requirements.mdx) |
| **Cross-cutting queue** | Mirror or link in `STATE.xml` `next-action` / tasks | [`documentation/planning/state.mdx`](apps/portfolio/content/docs/documentation/planning/state.mdx) **Cross-cutting queue** |
| **Decisions** | `DECISIONS.xml` | `decisions.mdx` |
| **Attempts / errors** | `ERRORS-AND-ATTEMPTS.xml` | `errors-and-attempts.mdx` |
| **One-off phase plans** | `.planning/phases/<phase-id>/` after full init | `plans/<phase-id>/` |

**Do not** treat **repo-root `REQUIREMENTS.md`** as the canonical requirements document. It is at most a **stub or legacy pointer**. **Do not** add **`.planning/REQUIREMENTS.md`** or treat **`.planning/IMPLEMENTATION_PLAN.md`** as the living planning source. If a phase needs a temporary plan, store it inside that phase's planning folder.

---

## Mandatory read order (agents)

1. **This file** (`AGENTS.md`).
2. **Scope of your work:**
   - **Monorepo / XML / RepoPlanner / cross-section gates:** **`.planning/AGENTS.md`**, then **`ROADMAP.xml`**, **`STATE.xml`**, **`TASK-REGISTRY.xml`**, stub **`REQUIREMENTS.xml`**, then **[documentation/requirements.mdx](apps/portfolio/content/docs/documentation/requirements.mdx)** and **[documentation/planning/state.mdx](apps/portfolio/content/docs/documentation/planning/state.mdx)**.
   - **Section-scoped work:** that section's **`planning/`** folder first: **`planning-docs.mdx` -> `roadmap.mdx` when present -> `state.mdx` -> `task-registry.mdx` -> `decisions.mdx`**.
3. **Diagrams, task-id grammar, planning-pack policy, and one-off plan placement:** **[global-planning.mdx](apps/portfolio/content/docs/global/global-planning.mdx)**.
4. **Section overview table:** **[documentation/roadmap.mdx](apps/portfolio/content/docs/documentation/roadmap.mdx)**.
5. **Operators / RepoPlanner CLI:** **[repo-planner/planning/planning-docs.mdx](apps/portfolio/content/docs/repo-planner/planning/planning-docs.mdx)**, **[repo-planner/getting-started.mdx](apps/portfolio/content/docs/repo-planner/getting-started.mdx)**, and **[repo-planner/planning/decisions.mdx](apps/portfolio/content/docs/repo-planner/planning/decisions.mdx)**.

Active sections today include **`global/`**, **`documentation/`**, **`books/`**, **`repo-planner/`**, **`blog/`**, **`projects/`**, **`listen/`**, **`magicborn/`**, **`dialogue-forge/`**, and **`editor/`**.

---

## Loop

1. Read code state and the **planning layer** you are changing (`.planning/*.xml` and/or section **roadmap/state/task-registry**).
2. Pick **one** task; implement.
3. Run **verification**; mark **`done`** in **`TASK-REGISTRY.xml`** and/or the relevant section `planning/task-registry.mdx`; refresh **`.planning/STATE.xml`** when it helps the next agent; update **`documentation/requirements.mdx`**, **`documentation/planning/state.mdx`**, or the relevant **roadmap** when monorepo scope or queue priority changes.
4. Exit; next iteration starts with fresh context.

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
