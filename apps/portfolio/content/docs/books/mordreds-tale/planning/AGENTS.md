# Agent guide — *Mordred's Tale* (fiction only)

This file applies when work is **this novel’s planning docs and/or manuscript** under `books/mordreds_tale/`. It does **not** replace root `AGENTS.md` for software, Repo Planner, or site code.

## Canonical tutorial (mandatory reference)

**Before you improvise workflow steps**, read (or re-read) the public blog article **“How we write books with planning documents and the manuscript loop”** on this site (`/blog/how-we-write-books-with-planning-documents-and-the-manuscript-loop`). That article is the **granular** source for vocabulary, loop diagrams, beat/task examples, EPUB layout, and the scripted Assistant UI demo pattern.

- **This `AGENTS.md` is intentionally short.** It states **non-negotiables** and **read order**. Details, examples, and “what good looks like” live in the **article** and in the planning MDX files themselves.
- **Authors and agents** should revisit the article when **starting a new phase**, **onboarding someone**, or **changing how beats map to tasks**—not only on first read.

## Read order (this stream)

1. **Blog article** (sections that match your current phase).
2. **[Roadmap](roadmap.mdx)** — phase sequence and dependencies (high level).
3. **[State](state.mdx)** — beat sheets, narrative fronts, manuscript position, forward questions, Magicborn-line cross-links.
4. **[Task registry](task-registry.mdx)** — the **single** queue of writing tasks; pick **one** row per session when executing.
5. **[Decisions](decisions.mdx)** — locked canon (`MT-*`, `FQ-*` resolutions). Treat as **law** for prose; do not contradict without a new decision row.

Also skim **`apps/portfolio/content/docs/books/planning/state.mdx`** (Magicborn line section) when a change might affect **series order** or **cross-title** beats. On the site: `/docs/books/planning/state#magicborn-line-world-order-and-chapter-beats`.

## What “implementation” means here

- **Planning edits** — Update `state.mdx` (beats, open questions, next queue), `task-registry.mdx` (status, dependencies), and `decisions.mdx` when canon locks.
- **Manuscript edits** — Prose in `books/mordreds_tale/chapters/` (and `book.json` / `chapter.json` when metadata changes).
- **Not implementation** — Long brainstorm-only chat with no file edits; prefer capturing outcomes in **state** or **decisions**.

## Loop (one task)

1. Confirm **roadmap** phase and **one** active **task-registry** id (matches **Next queue** / beat policy).
2. If the task is **draft or rework**: recap prior chapter ending and **Locked for draft** beats from **state** before touching prose.
3. Edit manuscript **or** planning files as the task describes; keep **POV, timeline, and magic** consistent with **decisions**.
4. **Verify** using the task’s **Verify** column (often chapter checklist + `pnpm run build:books` from repo root).
5. Mark the task row **done** / **in-progress** / **blocked** honestly; refresh **state** (manuscript position, forward questions).

## Spillover and adjacent chapters

- New canon questions → **Forward question** on **state** or **decisions** with a new id; never only in chat or inline prose comments.
- Beats that force an earlier chapter change → new **task-registry** rework row; no silent scope creep.
- **Part volumes** (`mordreds_tale_part_*`) follow packaging decisions; full-source **`mordreds_tale`** is the primary drafting tree unless the task says otherwise.

## Verification (fiction)

- **No automated unit tests** for story; **build** and **checklist** are the gates.
- After structural or metadata changes, run **`pnpm run build:books`** at repo root when the task registry expects it.

## Planning pack (downloads)

Section and stream planning MDX are exported to the site **Planning pack** modal. Use it to download the same markdown the article refers to without cloning the repo.

## Relationship to software agents

Ignore **“tests required for done”** for pure prose tasks. It still applies if you touch **TypeScript, CI, or reader** code—then follow root `AGENTS.md` and the relevant section planning.
