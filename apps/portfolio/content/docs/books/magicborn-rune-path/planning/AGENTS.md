# Agent guide — *Magicborn: The Rune Path* (fiction only)

Applies to this **Kael prequel** stream: planning in this folder and manuscript under `books/magicborn_rune_path/`. Does **not** replace root `AGENTS.md` for software.

## Canonical tutorial (mandatory reference)

The blog article **“How we write books with planning documents and the manuscript loop”** (`/blog/how-we-write-books-with-planning-documents-and-the-manuscript-loop`) is **part of this book’s loop** for the duration of the public walkthrough:

- It carries **granular** guidance (diagrams, tables, **checkpoint journal sections**, scripted Assistant UI showcases).
- **This `AGENTS.md` does not duplicate that content.** It binds **behavior**: you follow the article’s pattern unless a **decision** or **task row** explicitly overrides it.
- **Every fiction session** for this title: skim **AGENTS.md**, then open the **article** section that matches your phase (outline vs draft vs continuity), then open **roadmap → state → task-registry**.

### Article + repo co-evolution (strict)

When you are working **both** the manuscript/planning **and** the article as the living case study:

1. **Planning and manuscript are source of truth** for story canon; the article **describes** what shipped in those files—it does not silently invent beats or task ids.
2. After a loop that changed **state**, **task-registry**, **decisions**, or **prose**, add or extend a **checkpoint section** in the article—not a spreadsheet “log.” Each checkpoint is a **journal block** with: **Planning (outcomes)** (snapshots of docs at that moment), **Implementation (outcomes)** (what merged and how it was verified), then **Conversation showcase** (Assistant UI script reconstructed from the real chat that produced those outcomes). Keep checkpoints in **reading order** through the life of the book.
3. **Do not** present article-only “demonstration” canon as if it were locked in `decisions.mdx`. If the article explores a hypothetical, label it as such in prose.

## Read order (this stream)

1. **Blog article** (this book’s checkpoint sections + demo).
2. **[Roadmap](roadmap.mdx)** — `mrp-outline-01` → `mrp-outline-02` → `mrp-draft-01`.
3. **[State](state.mdx)** — conceit, acts, timeline anchor (**17** vs **42** in Legacy), cast, next queue.
4. **[Task registry](task-registry.mdx)** — one queue; **one** task id per execution pass unless a row explicitly batches work.
5. **[Decisions](decisions.mdx)** — `MRP-*` locks (timeline, prequel end-state, carved rune rules when accepted).

Always keep **Legacy**’s Kael plausible: [Mordred's Legacy — State](../mordreds-legacy/planning/state.mdx) and [Legacy decisions](../mordreds-legacy/planning/decisions.mdx) (`ML-KAEL-AGE-AT-ALUN`).

## Implementation vs planning

- **Manuscript** — Dungeon/sortie voice, statute texture, Path mechanics must match **decisions** and in-world docs linked from **state** (e.g. statute under `content/docs/magicborn/`).
- **Planning** — New magic or timeline facts → **state** first; locks → **decisions** with `MRP-*` ids.
- **End state** — Prequel remains compatible with [`MRP-PREQUEL-END`](decisions.mdx) unless a **decision** revises it.

## Loop (one task)

1. Pick **one** **task-registry** row; confirm **roadmap** phase and the matching **article checkpoint** you will update when done.
2. Draft or outline; if a scene **breaks** a lock, stop—add a **decision** proposal or **state** flag; do not silently rewrite canon.
3. Run **`pnpm run build:books`** at repo root when the task’s **Verify** column requires it.
4. Update task **status** and **state** next queue.
5. If the article is in scope: add or extend the **checkpoint section**—planning snapshot, implementation snapshot, then refresh the **Conversation showcase** script when you have a real transcript worth teaching from.

## Gap years (~17 → 42)

Treat **`mrp-outline-02-02`** and Legacy **`ml-book2-02-03`** as **joint continuity** work. Prefer explicit “on-page vs ellipsis” notes on **state** before large montage in prose. The article should point readers at those task ids when explaining the bridge.

## Downloads / planning pack

This folder’s planning files (including **`AGENTS.md`**) are included in the site **Planning pack** export when the build runs `build-planning-pack.cjs`. Readers can open the **Planning pack** modal to download Markdown mirrors—same paths as under `content/docs/books/magicborn-rune-path/planning/`.

## Reader / EPUB

Built title slug: **`magicborn_rune_path`**. After `pnpm run build:books`, open the in-site reader for that slug to verify the manuscript the article discusses.

## Software caveat

Code or tooling changes follow root `AGENTS.md` and **tests** where required. Fiction-only tasks use checklist + build as gates.
