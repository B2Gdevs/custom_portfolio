# Agent guide — *Mordred's Legacy* (fiction only)

Applies to **Book 2** planning under this folder and manuscript under `books/mordreds_legacy/`. Does **not** replace root `AGENTS.md` for software or site work.

## Canonical tutorial (mandatory reference)

Read the blog article **“How we write books with planning documents and the manuscript loop”** (`/blog/how-we-write-books-with-planning-documents-and-the-manuscript-loop`) **before** inventing new steps for beat locking, task picking, or verification. It is the **detailed, repeatable** walkthrough; this file only encodes **hard rules** and **order**.

- Re-read the article when **Act II/III outline** work begins, when **Kael vs prequel continuity** is in play, or when you **change how tasks are grouped**.
- **Planning pack** downloads mirror these docs for offline use (see article + site modal).

## Read order (this stream)

1. **Blog article** (continuity + task patterns; *Rune Path* sections when Kael’s past matters).
2. **[Roadmap](roadmap.mdx)** — `ml-outline-01` → `ml-book2-02` → `ml-book2-03`.
3. **[State](state.mdx)** — act scaffold, Ch1 spine, chronology vs *The Rune Path*, next queue.
4. **[Task registry](task-registry.mdx)** — one executable row per session when drafting or outlining.
5. **[Decisions](decisions.mdx)** — `ML-*` locks (POV, Kael age at Alun, armor, series order).

Cross-title: **`apps/portfolio/content/docs/books/planning/state.mdx`** (Magicborn line) + [Rune Path state](../magicborn-rune-path/planning/state.mdx) when Kael’s past or gap years matter.

## Implementation vs planning

- **Manuscript** — `books/mordreds_legacy/chapters/`; keep **Alun POV** and **Kael at 42** per decisions unless a task explicitly revisits a lock.
- **Planning** — Beat tables and open questions on **state**; promote answers to **decisions** with stable ids (`ML-*`).
- **Canon from Book 1** — [Mordred's Tale decisions](../mordreds-tale/planning/decisions.mdx) and Tale **state** for events already in prose; no retcon without a new decision + task.

## Loop (one task)

1. Align with **roadmap** phase and **one** **task-registry** row.
2. Draft or outline; new tensions → **state** forward questions or **decisions** rows (with ids).
3. Verify per registry (**build:books**, read-aloud, outline review).
4. Update **state** next queue and task **status**.

## Continuity with the prequel

*Magicborn: The Rune Path* is **chronologically before** Legacy but **not** “Book 3” as sequel order. When Kael’s dialogue or memory touches the past, check [Rune Path decisions](../magicborn-rune-path/planning/decisions.mdx) (`MRP-TIMELINE`, `MRP-PREQUEL-END`) and shared tasks **`ml-book2-02-03`** / **`mrp-outline-02-02`**. The article explains how those joint tasks should show up in session work.

## Software caveat

If you change **app code**, **tests** may be required per root `AGENTS.md`. Pure fiction tasks do not substitute build gates for tests on code paths.
