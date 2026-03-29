# Agent guide (monorepo)

**Start here.** This file defines how **planning**, **documentation**, and the **Ralph-style loop** work in this repository.

## Planning model: two layers, one workflow

**`.planning/`** at the repo root is the **root planning section**. It uses **XML + `planning-config.toml` + `.planning/AGENTS.md`** — same *roles* as a docs section, different *format* (machine-friendly, RepoPlanner-aligned).

Each **`apps/portfolio/content/docs/<section>/`** folder is a **section** with **`planning-docs.mdx` → `state.mdx` → `task-registry.mdx` → `decisions.mdx`** (and optional **`errors-and-attempts.mdx`**) in **MDX** for humans and the public site.

| Role | Root (`.planning/`) | Docs section (`content/docs/<section>/`) |
| --- | --- | --- |
| **Index / playbook** | `.planning/AGENTS.md` | `planning-docs.mdx` |
| **Current pointer** | `STATE.xml` | `state.mdx` |
| **Tasks** | `TASK-REGISTRY.xml` | `task-registry.mdx` |
| **Phases / timeline** | `ROADMAP.xml` | Phase ids in `task-registry.mdx`; **section roadmap** = [`documentation/roadmap.mdx`](apps/portfolio/content/docs/documentation/roadmap.mdx) |
| **Requirements narrative** | `REQUIREMENTS.xml` (stub → paths below) | **Per-section** needs live in that section’s pages; **monorepo-wide** scope = [`documentation/requirements.mdx`](apps/portfolio/content/docs/documentation/requirements.mdx) |
| **Cross-cutting queue** | Mirror or link in `STATE.xml` `next-action` / tasks | [`documentation/state.mdx`](apps/portfolio/content/docs/documentation/state.mdx) **Cross-cutting queue** |
| **Decisions** | `DECISIONS.xml` | `decisions.mdx` |
| **Attempts / errors** | `ERRORS-AND-ATTEMPTS.xml` | `errors-and-attempts.mdx` |

**Do not** treat **repo-root `REQUIREMENTS.md`** as the canonical requirements document. It is at most a **stub or legacy pointer** (some bootstraps create it). **Do not** add **`.planning/REQUIREMENTS.md`** or **`.planning/IMPLEMENTATION_PLAN.md`**. There is **no** `IMPLEMENTATION_PLAN.md` workflow.

---

## Mandatory read order (agents)

1. **This file** (`AGENTS.md`).
2. **Scope of your work:**
   - **Monorepo / XML / RepoPlanner / cross-section gates:** **`.planning/AGENTS.md`**, then **`STATE.xml`**, **`TASK-REGISTRY.xml`**, **`ROADMAP.xml`**, stub **`REQUIREMENTS.xml`**, then **[documentation/requirements.mdx](apps/portfolio/content/docs/documentation/requirements.mdx)** and **[documentation/state.mdx](apps/portfolio/content/docs/documentation/state.mdx)** (cross-cutting queue).
   - **Section-scoped work (one product area):** that section’s **`planning-docs.mdx` → `state.mdx` → `task-registry.mdx` → `decisions.mdx`**. For **global docs IA**, use **`content/docs/global/`** the same way.
3. **Diagrams, task-id grammar, Mermaid, planning-pack policy:** **[global-planning.mdx](apps/portfolio/content/docs/global/global-planning.mdx)** (`/docs/global/global-planning`).
4. **Section overview table:** **[documentation/roadmap.mdx](apps/portfolio/content/docs/documentation/roadmap.mdx)**.
5. **Operators — RepoPlanner CLI:** `pnpm planning …` — **[repo-planner/integration.mdx](apps/portfolio/content/docs/repo-planner/integration.mdx)**. **Embedded cockpit:** `/docs/apps/repo-planner` (moving to `/apps` per route conventions). **CLI reports:** **`.planning-reports/`** (`REPOPLANNER_REPORTS_DIR`).

Active sections today include **`global/`**, **`documentation/`**, **`books/`**, **`repo-planner/`**, **`blog/`**, **`projects/`**, **`listen/`**, **`magicborn/`**, **`dialogue-forge/`**, **`editor/`**.

---

## Loop

1. Read code state and the **planning layer** you are changing (`.planning/*.xml` and/or section **state** + **task-registry**).
2. Pick **one** task; implement.
3. Run **verification** (below); mark **`done`** in **`TASK-REGISTRY.xml`** and/or the **section** `task-registry.mdx`; refresh **`.planning/STATE.xml`** when it helps the next agent; update **`documentation/requirements.mdx`** or **`documentation/state.mdx`** when **monorepo scope** or **cross-cutting queue** changes — not root **`REQUIREMENTS.md`**.
4. Exit; next iteration starts with fresh context.

### Machine-local paths in planning MDX

| Field | Purpose |
| --- | --- |
| `repoPath` | Repo-relative path to the `.mdx` file. |
| `taskPhase` | Optional phase id (e.g. `documentation-site-07`). |

Reference tasks **by id** in conversation (`books-ai-01-04`, `documentation-site-07-01`).

---

## Root (monorepo)

- Install: `pnpm install` (repo root).
- Build app: `pnpm run build` (runs `npm run build --workspace=@portfolio/app`).
- Lint: `pnpm run lint`.

## App (`apps/portfolio`)

- Dev: `pnpm dev` — Next + debounced **books** watcher (`public/books/`, see `public/books/README.md`).
- Build / typecheck / lint: as above.

## Verification gates

- `pnpm install` succeeds.
- `pnpm run build` succeeds.
- `pnpm run lint` passes.
- Release artifacts: **Koodo Reader** desktop — `.releases/` via `scripts/download-releases.cjs`.

## GSD (Codex)

GSD may create files under **`.planning/`**; this repo’s **canonical** agent loop is described **above**. Prefer **section MDX** + **`.planning/*.xml`** over duplicating narrative in root **`REQUIREMENTS.md`**.

## Artifacts (quick reference)

| Path | Role |
| --- | --- |
| `apps/portfolio/content/docs/<section>/` | Section planning **MDX** |
| `.planning/` | Root planning **XML** + `.planning/AGENTS.md` |
| `documentation/requirements.mdx` | **Monorepo requirements** narrative |
| `documentation/state.mdx` | **Cross-cutting queue** |
| `documentation/roadmap.mdx` | **Section / root overview** table |
| `vendor/repo-planner/` | RepoPlanner **submodule** (bump intentionally) |
| `.planning-reports/` | CLI usage / reports (gitignored) |
| `.planning-archive/` | Read-only snapshots |
| Root `REQUIREMENTS.md` | **Stub only** — see file header |

## Conventions

- One logical task per iteration.
- Prefer backpressure: fix failing build/lint before adding features.
