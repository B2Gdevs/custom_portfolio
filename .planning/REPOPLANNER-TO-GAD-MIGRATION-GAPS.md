# RepoPlanner → GAD — migration gaps (living doc)

**Goal:** One planning system — **GAD** (`gad` CLI, `.planning/*.xml`, `gad-config.toml`, `gad sink`, evals). **RepoPlanner** (`vendor/repo-planner`, `loop-cli.mjs`) should shrink to zero *behavior* we depend on: no parallel CLI surface, no duplicate skills, no second source of truth for agent workflows.

**Related:** `apps/portfolio/content/docs/global/planning/plans/rp-migration/KICKOFF.mdx` (schema / GUI direction).

---

## 1. Monorepo scripts (root `package.json`)

| Script | Still uses RP | GAD / target |
|--------|----------------|--------------|
| `pnpm planning` | `scripts/run-planning-cli.mjs` → `loop-cli.mjs` | Route to `node vendor/get-anything-done/bin/gad.cjs` for read-only commands; **init** / **embed** need GAD equivalents or a thin adapter |
| `planning:init*` | RP `init` | `gad` workspace/bootstrap story + templates (partially overlaps `gad migrate-schema`, etc.) |
| `planning:snapshot` | RP snapshot | **`gad snapshot --projectid <id>`** (already canonical for agents) |
| `planning:embed-packs` | `loop-cli pack embed-build` → `builtin-packs.json` | **`gad pack`** / **`gad sink`** pipeline or port embed-build into GAD |
| `planning:report-view` / `planning:ui` | RP report viewer | Replace with docs site + `gad` output, or embed UI that consumes GAD JSON |
| `planning:checklist` | RP | Fold into GAD task templates or docs |

**Gap:** `scripts/run-planning-cli.mjs` is the single choke point; it must be deleted or reduced to a deprecated shim once replacements exist.

---

## 2. Portfolio app (`apps/portfolio`)

Heavy **`repo-planner`** npm dependency (`file:../../vendor/repo-planner`):

- **Embedded cockpit:** `RepoPlannerCockpitClient`, `PlanningCockpit`, pack modal, `/apps/repo-planner` — React bundle from RP package.
- **APIs:** `planning-state`, `planning-cli/run` (spawns `loop-cli`), `planning-metrics`, `planning-reports/latest`, `planning-templates/minimal` — wired through `@/lib/repo-planner/*` (re-exports of `vendor/repo-planner/lib/*`).
- **Live bundle:** `buildLivePlanningBundle` uses RP **`planning-parse-core`** + **`planning-workflow.mjs`** for the agent-loop JSON shape.

**Gap:** Replace live-bundle and cockpit data path with **GAD-backed** parsers + a single JSON contract (or call `gad` with `--json` from server where appropriate). Large UI effort if we keep a visual cockpit.

---

## 3. Documentation & IA

- Entire **`/docs/repo-planner`** tree (getting-started, decisions, archived hand-authored planning).
- Blog and **HumanLoopPlanningSection** still link **RepoPlanner on GitHub** and `/apps/repo-planner`.
- **`lib/docs.ts`** and **site apps** registry describe “RepoPlanner” as a first-class product.

**Gap:** Rename IA to **GAD** where accurate, redirect old URLs, archive RP-specific tutorials into a historical section.

---

## 4. Skills (duplicate RP vs GAD)

- **Monorepo:** many **`skills/rp-*`** and **`.claude/skills/rp-*`** (plan-phase, execute-phase, map-codebase, etc.).
- **`.codex/skills/gad-*`** mirrors several workflows.

**Gap:** Deprecate **`rp-*`** skill entries (pointer to **`gad-*`**), then remove duplicate SKILL.md bodies once agents are migrated. No net-new `rp-*` work.

---

## 5. `vendor/repo-planner` submodule

Contains **`scripts/loop-cli.mjs`** (large), **`lib/planning-parse-core`**, **`planning-pack`**, cockpit host components, embed builders.

**Gap:** Long term: **archive** or **strip** CLI + skills from this package; keep only what the site still imports until portfolio is migrated. Alternatively fold stable parsers into **`get-anything-done`** and delete duplicate code paths.

---

## 6. Tests

Many **`apps/portfolio/tests/unit/lib/repo-planner-*.test.ts`** and vitest alias **`@/vendor/repo-planner`**.

**Gap:** Replace with GAD integration tests (`gad snapshot`, `gad refs verify`) and slim adapters.

---

## 7. Misc references

- **`next.config.ts`** / **`REPOPLANNER_PROJECT_ROOT`** — env contract for RP child processes.
- **Reader / books:** `RepoPlannerCockpitClient`, builtin packs — product naming still says “Repo Planner” in places.
- **Vitest / path aliases** pointing at `vendor/repo-planner`.

---

## Suggested migration phases (order is negotiable)

1. **CLI:** Add GAD equivalents for **embed-pack** and **minimal init** (or document one-time manual steps), then switch root `planning:*` scripts off `loop-cli`.
2. **Agents:** Prefer **`gad snapshot`** everywhere; mark `pnpm planning:snapshot` deprecated.
3. **Portfolio APIs:** Swap `buildLivePlanningBundle` inputs to GAD-owned parsers or `gad --json` subprocess (cache carefully).
4. **UI:** Either rename cockpit to “Planning” + GAD branding or replace with lighter read-only views fed by GAD.
5. **Docs & skills:** Deprecate RP naming; **`rp-*` → `gad-*`** skill migration.
6. **Vendor:** Shrink **`repo-planner`** to a compatibility layer or remove submodule when imports hit zero.

---

*Update this file as gaps close.*
