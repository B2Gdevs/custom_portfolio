# RepoPlanner → GAD — migration gaps (living doc)

**Goal:** One planning system — **GAD** (`gad` CLI, `.planning/*.xml`, `gad-config.toml`, `gad sink`, evals). **RepoPlanner** (`vendor/repo-planner`, `loop-cli.mjs`) should shrink to zero *behavior* we depend on: no parallel CLI surface, no duplicate skills, no second source of truth for agent workflows.

**Related:** `apps/portfolio/content/docs/global/planning/plans/rp-migration/KICKOFF.mdx` (schema / GUI direction).

**Tracking:** Root `.planning/` phase **06** + tasks **06-01**–**06-03** + decision **06-01**. Upstream **RepoPlanner** repo: **archive / read-only** (no further product work).

### Upstream RepoPlanner Git layout (separate repo)

**Do not** add monorepo-specific or GAD-specific documentation *inside* the RepoPlanner repository. Historical and policy notes for *this* monorepo stay here (this file, root `skills/README.md`, GAD under `vendor/get-anything-done/`).

| Branch | Contents |
|--------|----------|
| **`main`** | **Real RepoPlanner:** pre–`rp-*` skills snapshot **plus** **`apps/landing`** (static Next.js explainer, archive + GAD handoff). Submodule pin for this monorepo. **Vercel:** branch **`main`**, root **`apps/landing`**, Node 22+. |
| **`gad-planner`** | **Orphan** line: experiments after skills + GAD-era planning churn — **not** the product baseline. |

**Publish (upstream):** `development` was renamed to **`gad-planner`**; **`main`** is fast-forwarded with landing + lockfile refresh only (no merge of the skills line).

**Submodule consequence:** at this pin, **`vendor/repo-planner/.planning/`** holds **templates only** (no living `STATE.xml` / `ROADMAP.xml` in the submodule). Portfolio **docs sink** MDX that `source:` those paths may need to be repointed to root `.planning/` or frozen — treat as part of **06-03**.

### In progress (2026-04-08)

- `pnpm gad` / `pnpm planning` → **GAD CLI** (`vendor/get-anything-done/bin/gad.cjs`).
- `pnpm planning:snapshot` / `pnpm gad:snapshot` → `gad snapshot --projectid global`.
- Legacy RP: `scripts/run-legacy-repo-planner-cli.mjs` (stderr deprecation) for **init**, **embed-packs**, **checklist**, **report-view** only.
- `scripts/run-planning-cli.mjs` → thin forwarder to legacy (back-compat).

### Upstream `apps/landing` (Vercel) — build-only band (2026-04-09)

Decision **06-01** allows **narrow** maintenance so the public reference site keeps deploying: `apps/landing/package.json` lists **direct** dependencies for anything webpack/`tsc` resolves from the linked package (`fast-xml-parser`, `diff`, `@assistant-ui/react`, `@assistant-ui/react-ui`, …). The **repo-planner** root `package.json` also declares **`react` + `react-dom`** so TypeScript can resolve `react` from `components/**` paths during `next build` (npm does not hoist `node_modules` into a parent of those paths on Vercel). No features or roadmap work — task **06-04** (done) + [repo-planner planning docs](/docs/repo-planner/planning/planning-docs).

---

## 1. Monorepo scripts (root `package.json`)

| Script | Status (phase 06) |
|--------|-------------------|
| `pnpm gad` | **GAD** — full CLI |
| `pnpm planning` | **GAD** (same binary as `gad`) |
| `pnpm gad:snapshot` / `pnpm planning:snapshot` | **GAD** `snapshot --projectid global` |
| `planning:init*` | Legacy **`run-legacy-repo-planner-cli.mjs`** until GAD init |
| `planning:embed-packs` | Legacy embed-build until **`gad pack` / sink** owns it |
| `planning:report-view` / `planning:ui` | Legacy report viewer — **no committed `gad-ui` package** (06-02 closed: placeholder README only) |
| `planning:checklist` | Legacy until GAD checklist templates |

**Remaining gap:** delete legacy script and `vendor/repo-planner` submodule after **06-03** completes (portfolio imports removed). **`gad-ui` is not a prerequisite** — task 06-02 is closed without a React package.

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

- **Monorepo:** **`skills/rp-*`** and **`.claude/skills/rp-*`** are **thin stubs** pointing at **`vendor/get-anything-done/skills/*/SKILL.md`** (see root **`skills/README.md`**). Bodies are not duplicated.
- **`.codex/skills/gad-*`** mirrors several workflows.

**Remaining gap:** optional cleanup of old per-skill **`README.md`** under `rp-*` folders if they still reference external RepoPlanner install URLs; canonical install story is GAD skills + `pnpm gad`.

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
