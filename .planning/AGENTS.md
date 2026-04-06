# `.planning/AGENTS.md` -- root planning section (XML)

Read **root [`AGENTS.md`](../AGENTS.md) first** — it defines the GAD loop (gad-18) and session start. This file covers the XML schema used in `.planning/`.

## What this folder is

`.planning/` is the root planning section: XML files + `planning-config.toml`. It follows the same loop as docs sections (state → tasks → roadmap → decisions), but files are `.xml` for machines and the GAD CLI.

| File | Role |
| --- | --- |
| `STATE.xml` | Current phase, `next-action` |
| `TASK-REGISTRY.xml` | Tasks by phase with status |
| `ROADMAP.xml` | Phase goals, status, depends |
| `REQUIREMENTS.xml` | Stub — points to canonical requirements paths |
| `DECISIONS.XML` | Decision atoms |
| `ERRORS-AND-ATTEMPTS.xml` | Failure / attempt log |

## planning-config.toml

Registry of all planning roots and docs projects. The GAD CLI reads this to resolve `--projectid` flags.

- `[[planning.roots]]` = repos with `.planning/` dirs, full GAD tracking
- `[[docs.projects]]` = domain projects, may not have repo yet, lives in sink

## GAD CLI

Run via `node vendor/get-anything-done/bin/gad.cjs` from repo root. Key commands:

| Command | What |
| --- | --- |
| `gad snapshot --projectid <id>` | Full context for a project — one command |
| `gad state` | Current phase + next-action |
| `gad tasks` | Tasks for current phase |
| `gad phases` | All phases with status |
| `gad sink sync` | Compile planning → docs sink |
| `gad projects list` | All registered projects |

## TASK-REGISTRY.xml pattern

```xml
<task id="01-01" agent-id="" status="planned">
  <goal>One-line outcome.</goal>
  <keywords>area,topic</keywords>
</task>
```

Status values: `planned` | `in-progress` | `done` | `blocked`.

## Context compaction

Auto-compact handles context limits. After compaction: `gad snapshot --projectid <id>` to re-hydrate. Never stop work.

## Done gate

Executable behavior is not done without tests. If a phase is missing tests, continue it — do not mark done.
