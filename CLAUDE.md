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

# GAD CLI quick reference

| Command | Use when |
|---|---|
| `gad snapshot --projectid <id>` | Session start, post-compact, full context |
| `gad state --projectid <id>` | Just current phase + next-action |
| `gad tasks --projectid <id>` | Task list with statuses |
| `gad phases --projectid <id>` | Roadmap overview |
| `gad decisions --projectid <id>` | Decision log |
| `gad eval list` | List eval projects |
| `gad eval run <name>` | Run an eval |
| `gad sprint show --projectid <id>` | Current sprint window |
| `gad verify --projectid <id>` | Verify phase completion |
| `gad log show` | Recent CLI + tool call log |
| `gad log show --filter gad` | Only GAD CLI calls |
| `gad log stats` | CLI usage statistics |
| `gad eval suite` | Generate prompts for all evals |
| `gad eval report` | Cross-project eval comparison |
