# Startup

**First action in every session:** run the GAD snapshot for whichever project you're working on.

```sh
node vendor/get-anything-done/bin/gad.cjs snapshot --projectid <id>
```

Common project IDs: `get-anything-done`, `global`, `grime-time-site`, `repub-builder`, `mb-cli-framework`, `gad-manuscript`.

If the user doesn't specify a project, ask. If working on the GAD framework itself, use `get-anything-done`.

Do NOT manually read planning files. The snapshot gives you state, roadmap, tasks, decisions, and file refs in one low-token command. Pull more detail with individual commands (`gad tasks`, `gad decisions`, `gad phases`, `gad state`) only when needed.

# After auto-compact

Run `gad snapshot --projectid <id>` immediately to re-hydrate. Never stop work, never ask to restart, never start a "fresh session" (decision gad-17).

# GAD loop (decision gad-18)

1. `gad snapshot` — know where you are
2. Pick one task (status=planned) from the snapshot
3. Implement it
4. Update TASK-REGISTRY.xml (mark done), STATE.xml (next-action), DECISIONS.xml (if new decisions)
5. Commit

# Subagents

Subagents working on GAD-tracked projects should run `gad snapshot --projectid <id>` at the start of their work to get context. Pass the project ID in the agent prompt.

# Eval preservation contract (decision gad-38)

**Every implementation eval run MUST preserve its outputs to canonical paths.** After an
agent completes an eval, BEFORE the worktree is removed:

```sh
gad eval preserve <project> v<N> --from <worktree-path>
```

This copies code/planning to `evals/<project>/v<N>/run/` and build to
`apps/portfolio/public/evals/<project>/v<N>/`. Without this step, the agent's work is
lost. `tests/eval-preservation.test.cjs` will fail the build if you skip it.

Verify with `gad eval verify`. See `gad:eval-run` skill for the full procedure.

# Eval experimental design (decision gad-39, gad-40)

Eval projects are categorized by **mode** (greenfield vs brownfield) and **workflow**
(gad, bare, emergent). Shown in `gad eval list`.

| Mode | Start state |
|---|---|
| **greenfield** | Nothing — agent builds from scratch |
| **brownfield** | Inherits a baseline codebase from a previous run (specified in gad.json) |

| Workflow | Description |
|---|---|
| **gad** | Full GAD framework — .planning/ XML, AGENTS.md loop, skill triggers |
| **bare** | No framework — agent creates own workflow in `game/.planning/` |
| **emergent** | No framework but inherits skills from previous runs, evolves them |

All workflow artifacts (workflow, decisions, skills, notes) MUST live under
`game/.planning/` regardless of workflow. Source code stays in `src/`, assets in `public/`.

## Worktree management

```sh
gad worktree list [--agent-only]     # show all worktrees with status
gad worktree show <id>               # details on one worktree
gad worktree clean <id>              # remove a specific worktree
gad worktree prune --older-than 3d   # prune old agent worktrees
```

Use these to manage `.claude/worktrees/agent-*` directories created by eval agents.

# GAD CLI quick reference

| Command | Use when |
|---|---|
| `gad snapshot --projectid <id>` | Session start, post-compact, full context |
| `gad state --projectid <id>` | Just current phase + next-action |
| `gad tasks --projectid <id>` | Task list with statuses |
| `gad phases --projectid <id>` | Roadmap overview |
| `gad decisions --projectid <id>` | Decision log |
| `gad eval list` | List eval projects |
| `gad eval run <name>` | Generate eval prompt |
| `gad eval preserve <project> <version> --from <worktree>` | **MANDATORY** after eval agent completes |
| `gad eval verify` | Audit all eval runs for preserved artifacts |
| `gad eval open <project> [version]` | Serve eval build in browser |
| `gad eval review <project> <version> --score X` | Submit human review score |
| `gad eval report` | Cross-project eval comparison |
| `gad sprint show --projectid <id>` | Current sprint window |
| `gad verify --projectid <id>` | Verify phase completion |
| `gad log show` | Recent CLI + tool call log |
| `gad eval suite` | Generate prompts for all evals |
