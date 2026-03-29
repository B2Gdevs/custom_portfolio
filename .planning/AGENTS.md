# `.planning/AGENTS.md` -- root planning section (XML)

Companion to **repository root** [`AGENTS.md`](../AGENTS.md). Read **root `AGENTS.md` first**; it explains how **`.planning/`** maps to section **`planning/`** folders (same workflow, different format).

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
**Cross-cutting queue:** [`documentation/state.mdx`](../apps/portfolio/content/docs/documentation/state.mdx) (table).  
**Do not** author long prose in **repo-root `REQUIREMENTS.md`** or recreate **`.planning/REQUIREMENTS.md`**.

## Trigger phrases -> what to do

| User says (examples) | Your first reads | Then |
| --- | --- | --- |
| *Plan this*, *roadmap this* | **`ROADMAP.xml`**, **`TASK-REGISTRY.xml`**, **[documentation/requirements.mdx](../apps/portfolio/content/docs/documentation/requirements.mdx)** | Add/change **phases** or **tasks**; align **[documentation/roadmap.mdx](../apps/portfolio/content/docs/documentation/roadmap.mdx)** when the overview table should change |
| *What's next?* | **`STATE.xml`** (`next-action`), **`TASK-REGISTRY.xml`**, relevant **section** `planning/task-registry.mdx` | Pick **one** task; implement; set **`done`**; refresh `next-action` |
| *Requirements*, *scope* | **[documentation/requirements.mdx](../apps/portfolio/content/docs/documentation/requirements.mdx)** + affected **section** pages | Edit MDX; keep **`REQUIREMENTS.xml`** stub paths accurate |
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
- **`references`** -- root **`AGENTS.md`**, **this file**, **`documentation/requirements.mdx`**, key **`.xml`** paths. Treat **`IMPLEMENTATION_PLAN.md`** as a legacy pointer only.

## Optional CLI

**`pnpm planning ...`** forwards to **`vendor/repo-planner/scripts/loop-cli.mjs`** (see **[getting-started.mdx](../apps/portfolio/content/docs/repo-planner/getting-started.mdx)**). Reports default to **`.planning-reports/`**.

## Encoding policy

Keep the **operational layer** ASCII-first: **`.planning/*.xml`**, **this file**, and operator/planning docs such as requirements, state, decisions, and repo-planner section docs should prefer ASCII punctuation (`--`, `->`, `...`, plain quotes). Public-facing prose, narrative content, and polished article copy may keep Unicode typography where it improves readability.

## Forbidden (minimal layout)

Do **not** commit **`.planning/REQUIREMENTS.md`** or narrative **`.md`** here except **this** `AGENTS.md`. **`.planning/IMPLEMENTATION_PLAN.md`** is a temporary compatibility pointer, not the living loop. Upstream templates live under **`vendor/repo-planner/.planning/templates/`** for **full** init only.
