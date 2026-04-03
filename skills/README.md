# RepoPlanner Skills

Agent skills for the [RepoPlanner](https://github.com/MagicbornStudios/RepoPlanner) planning methodology. Gives Claude the context to set up, read, and maintain structured planning docs — so humans and agents share the same source of truth.

## Skills

| Skill | What it does | Install |
|-------|-------------|---------|
| `repo-planner` | Core methodology: 5-doc loop, ID system, agent read order, monorepo layers | `npx skills add MagicbornStudios/repo-planner-skills/skills/repo-planner` |
| `rp-new-project` | Initialize a new project with full planning structure | `npx skills add MagicbornStudios/repo-planner-skills/skills/rp-new-project` |
| `rp-plan-phase` | Plan a phase: KICKOFF.md + task list | `npx skills add MagicbornStudios/repo-planner-skills/skills/rp-plan-phase` |

## Quick install (all three)

```bash
npx skills add MagicbornStudios/repo-planner-skills/skills/repo-planner
npx skills add MagicbornStudios/repo-planner-skills/skills/rp-new-project
npx skills add MagicbornStudios/repo-planner-skills/skills/rp-plan-phase
```

## What these skills do

### `repo-planner`
The foundation skill. Teaches Claude the RepoPlanner methodology:
- The 5-doc planning loop (requirements → roadmap → state → task-registry → decisions)
- Which files to read in which order before starting work
- How phase IDs work (`<namespace>-<stream>-<phase>[-<task>]`)
- When to require a kickoff before starting a phase
- How to layer planning across a monorepo (global/section/sub-project)
- How to update planning docs after execution

### `rp-new-project`
Sets up a new project's planning structure:
- Gathers requirements through conversation
- Creates PROJECT.md, REQUIREMENTS.md (with REQ-IDs), ROADMAP.md (phased), STATE.md, TASK-REGISTRY.md
- Validates 100% requirement coverage across phases
- Works for both simple repos and new monorepo sections

### `rp-plan-phase`
Plans a single phase:
- Runs a kickoff to establish goal, scope, non-goals, definition-of-done
- Breaks the phase into concrete, verifiable tasks with stable IDs
- Updates task registry and state
- Works with both `.md` and `.mdx` file formats

## How it differs from GSD

| | RepoPlanner Skills | GSD |
|--|-------------------|-----|
| Planning docs | MDX (human readable) + XML (machine) | Markdown only |
| ID system | Stable `namespace-stream-phase-task` IDs | Sequential phase numbers |
| Monorepo | Global/section/sub-project layers | Single `.planning/` root |
| Errors tracking | First-class `errors-and-attempts` doc | No equivalent |
| Cockpit UI | Embeddable Next.js cockpit | No UI |
| CLI | `repo-planner` npm package | Shell scripts |
| State | Cross-cutting queue + section state | Single STATE.md |

## About RepoPlanner

[RepoPlanner](https://github.com/MagicbornStudios/RepoPlanner) is an open-source planning system from [MagicbornStudios](https://github.com/MagicbornStudios). It provides:
- XML planning templates
- A CLI (`npx repo-planner`) for snapshot, task updates, and reports
- An embeddable Next.js cockpit for visualization
