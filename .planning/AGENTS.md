# `.planning/AGENTS.md` -- root planning section (XML)

Companion to **repository root** [`AGENTS.md`](../AGENTS.md). Read **root `AGENTS.md` first**; it explains how the **Global docs section** is the human-first planning entrypoint and how **`.planning/`** maps to section **`planning/`** folders as the machine layer.

## What this folder is

**`.planning/`** is the **root planning section**: **RepoPlanner-shaped XML** + **`planning-config.toml`**. It is **not** special-cased as a separate "tool-only" silo -- it follows the same loop as a docs section (**state -> tasks -> roadmap/requirements pointers -> decisions**), except files are **`.xml`** for machines and the CLI.

| File | Role | Docs "equivalent" (conceptual) |
| --- | --- | --- |
| **`STATE.xml`** | Current phase, `next-action`, references | Section **`planning/state.mdx`** |
| **`TASK-REGISTRY.xml`** | Tasks, `status`, verification commands | Section **`planning/task-registry.mdx`** |
| **`ROADMAP.xml`** | Phase goals, `status`, `depends` | Section **`planning/roadmap.mdx`** when present + **[`documentation/roadmap.mdx`](../apps/portfolio/content/docs/documentation/roadmap.mdx)** for human overview |
| **`REQUIREMENTS.xml`** | Stub: points to **canonical** requirements paths | Not a narrative file -- see stub content |
| **`DECISIONS.xml`** | Decision atoms | Section **`decisions.mdx`** |
| **`ERRORS-AND-ATTEMPTS.xml`** | Failure / attempt log | Section **`errors-and-attempts.mdx`** |

**Canonical monorepo requirements narrative:** [`documentation/requirements.mdx`](../apps/portfolio/content/docs/documentation/requirements.mdx).  
**Section requirements narratives:** `apps/portfolio/content/docs/<section>/requirements.mdx`.  
**Cross-cutting queue:** [`documentation/planning/state.mdx`](../apps/portfolio/content/docs/documentation/planning/state.mdx) (table).  
**Human-first global loop:** [`global/requirements.mdx`](../apps/portfolio/content/docs/global/requirements.mdx), [`global/planning/roadmap.mdx`](../apps/portfolio/content/docs/global/planning/roadmap.mdx), [`global/planning/state.mdx`](../apps/portfolio/content/docs/global/planning/state.mdx), [`global/planning/task-registry.mdx`](../apps/portfolio/content/docs/global/planning/task-registry.mdx), [`global/planning/decisions.mdx`](../apps/portfolio/content/docs/global/planning/decisions.mdx), and [`global-planning.mdx`](../apps/portfolio/content/docs/global/global-planning.mdx).  
**Do not** author long prose in **repo-root `REQUIREMENTS.md`** or recreate **`.planning/REQUIREMENTS.md`**.

## Trigger phrases -> what to do

| User says (examples) | Your first reads | Then |
| --- | --- | --- |
| *Plan this*, *roadmap this* | **`ROADMAP.xml`**, **`TASK-REGISTRY.xml`**, **[documentation/requirements.mdx](../apps/portfolio/content/docs/documentation/requirements.mdx)** | Add/change **phases** or **tasks**; align **[documentation/roadmap.mdx](../apps/portfolio/content/docs/documentation/roadmap.mdx)** when the overview table should change |
| *What's next?* | **Global** + relevant **section** `state` / `task-registry`, then **`STATE.xml`** (`next-action`) and **`TASK-REGISTRY.xml`** | Pick **one** phase, then one task; implement; set **`done`** only after verification and tests where behavior changed; refresh `next-action` |
| *Requirements*, *scope* | **[documentation/requirements.mdx](../apps/portfolio/content/docs/documentation/requirements.mdx)** + affected **section** **`requirements.mdx`** / **`planning/roadmap.mdx`** | Edit MDX; keep **`REQUIREMENTS.xml`** stub paths accurate |
| *Decisions* | **`DECISIONS.xml`** | Append **Decision** atoms |
| *Planning loop* | Root **`AGENTS.md`**, then **this file** | Verify -> commit |

## `TASK-REGISTRY.xml` -- pattern

Edit **`@_status`**: `planned` | `in-progress` | `done` | `blocked`.

```xml
<task id="01-01" agent-id="" status="planned">
  <goal>One-line outcome.</goal>
  <keywords>area,topic</keywords>
  <commands><command>pnpm run lint</command></commands>
  <depends></depends>
</task>
```

## `ROADMAP.xml` -- pattern

```xml
<phase id="01">
  <goal>Phase intent.</goal>
  <status>active</status>
  <depends></depends>
</phase>
```

## `STATE.xml`

- **`next-action`** -- one concrete next step for agents.
- **`references`** -- root **`AGENTS.md`**, **this file**, **Global docs planning**, **`documentation/requirements.mdx`**, key **`.xml`** paths. If an older clone still has **`IMPLEMENTATION_PLAN.md`**, migrate or delete it; it is not part of the living loop.

## Done gate

- **Executable behavior is not done without tests.**
- If a phase is still missing tests, split or continue it; do not mark the row `done`.
- Use Global + section planning to define the phase **definition of done** before relying on CLI or cockpit summaries.

## GAD CLI (preferred for state inspection)

**`gad`** is the canonical planning CLI. Run via `node vendor/get-anything-done/bin/gad.cjs` from the repo root:

| Command | What it does |
| --- | --- |
| `gad workspace show` | Show all planning roots from `planning-config.toml` |
| `gad projects list` | List projects and their current phase/status |
| `gad state show` | Show current phase and next action from STATE |
| `gad phases list` | List all phases with status |
| `gad tasks list` | List tasks for current or specified phase |
| `gad eval list` | List eval projects and run history |
| `gad eval score --project <name>` | Generate `SCORE.md` for latest eval run |
| `gad migrate-schema [--yes]` | Preview or execute XML -> Markdown schema migration |

The GAD CLI reads both XML (current format) and MD (target format) via fallback. All `gad` commands work against the current `.planning/*.xml` files without migration.

**Migration gate:** `gad migrate-schema --yes` converts `STATE.xml`, `ROADMAP.xml`, `DECISIONS.xml`, `REQUIREMENTS.xml`, `ERRORS-AND-ATTEMPTS.xml` to Markdown and archives the XML files. `TASK-REGISTRY.xml` requires manual merge into `STATE.md`. Do not run until all in-progress tasks are complete.

## Optional RP CLI (legacy)

**`pnpm planning ...`** forwards to **`vendor/repo-planner/scripts/loop-cli.mjs`** (see **[getting-started.mdx](../apps/portfolio/content/docs/repo-planner/getting-started.mdx)**). Reports default to **`.planning-reports/`**. Prefer `gad` over the RP CLI for new work.

## Encoding policy

Keep the **operational layer** ASCII-first: **`.planning/*.xml`**, **this file**, and operator/planning docs such as requirements, state, decisions, and repo-planner section docs should prefer ASCII punctuation (`--`, `->`, `...`, plain quotes). Public-facing prose, narrative content, and polished article copy may keep Unicode typography where it improves readability.

When a task changes **portfolio or app UI strings** (navigation, catalogs, modals, on-site MDX visible to visitors), also read root **`AGENTS.md`**, section **Public site copy** (editorial / utility / orienting registers and examples), and ship prose that matches that guide -- not implementation notes copied from task descriptions.

## Forbidden (minimal layout)

Do **not** commit **`.planning/REQUIREMENTS.md`** or narrative **`.md`** here except **this** `AGENTS.md`. Do **not** keep **`.planning/IMPLEMENTATION_PLAN.md`** in the minimal tree. Upstream templates live under **`vendor/repo-planner/.planning/templates/`** for **full** init only.
