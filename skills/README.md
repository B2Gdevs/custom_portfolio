# Planning skills (GAD)

**Canonical methodology** lives in **`vendor/get-anything-done/skills/`** — see that directory’s [README](https://github.com/MagicbornStudios/get-anything-done/blob/main/skills/README.md) for the skill catalog and **`rp-*` → `gad:*` migration map**.

This **`skills/`** tree keeps **short `rp-*` stubs** so older prompts and bookmarks still resolve, but each stub only points at the GAD skill file. **Do not extend the `rp-*` copies** — edit **`vendor/get-anything-done/skills/<name>/SKILL.md`** instead.

## The loop (GAD names)

```
gad:new-project → gad:plan-phase → gad:execute-phase → gad:verify-phase
       ↑                ↑                                      |
 gad:milestone     gad:add-todo                         gad:check-todos
                  gad:quick                                     |
                  gad:debug ←──── (when things break) ─────────┘
```

`gad:check-todos` is the re-entry point after any context reset. `gad:session` bridges pausing mid-phase.

## Universal install (local agents)

To copy **GAD** skills into **`.agents/skills/`** (or use your agent’s loader), prefer copying from **`vendor/get-anything-done/skills/*/SKILL.md`**, or use the upstream repo’s install instructions for [get-anything-done](https://github.com/MagicbornStudios/get-anything-done).

Repo-root **`.agents/`** may be **gitignored** — the **`skills/`** copy in this monorepo stays the **tracked** reference for deprecated **`rp-*` aliases** and reviews.

## Deprecated `rp-*` folders here

Each `rp-*/SKILL.md` is a **pointer** to the matching file under `vendor/get-anything-done/skills/`. Legacy names:

| Stub folder | Canonical GAD skill |
|-------------|---------------------|
| `rp-new-project` | `gad:new-project` |
| `rp-plan-phase` | `gad:plan-phase` |
| `rp-execute-phase` | `gad:execute-phase` |
| `rp-verify-work` | `gad:verify-phase` |
| `rp-check-todos` | `gad:check-todos` |
| `rp-debug` | `gad:debug` |
| `rp-map-codebase` | `gad:map-codebase` |
| `rp-session` | `gad:session` (plus `gad session` CLI) |
| `rp-milestone` | `gad:milestone` |
| `rp-add-todo` | `gad:add-todo` |
| `rp-quick` | `gad:quick` |
| `rp-manuscript` | `gad:manuscript` |

## CLI

```bash
pnpm gad snapshot --projectid global
# or
node vendor/get-anything-done/bin/gad.cjs snapshot --projectid <id>
```

## RepoPlanner (upstream, frozen)

The **`repo-planner`** git submodule tracks **upstream `main`**: **pre-skills** framework (cockpit + CLI) **plus** the static **`apps/landing`** explainer. Orphan experiments after skills live on upstream **`gad-planner`** only. This monorepo does **not** document RepoPlanner inside the submodule — see **`.planning/REPOPLANNER-TO-GAD-MIGRATION-GAPS.md`**. **No** committed **`gad-ui`** package; see `vendor/get-anything-done/packages/gad-ui/README.md`.
