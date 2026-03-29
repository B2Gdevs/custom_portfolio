# Implementation plan (Ralph Wiggum state)

Restarted **2026-03-30** with **minimal** `pnpm planning:init` (no templates/phases/reports under `.planning/`). **Migrate** prior **Done** / **Next** / **Notes** from:

- `.planning-archive/2026-03-29-pre-barebones/IMPLEMENTATION_PLAN.md`

## Done

- [x] **Route hygiene (2026-03-29):** Dialogue Forge at **`/apps/dialogue-forge`**; **308** from `/dialogue-forge`; **removed** `app/books/*` pages; **308** `/books` → `/apps/reader`; planning: [route conventions](../apps/portfolio/content/docs/documentation/route-conventions.mdx), **`documentation-site-06-05`**, **`books-reader-03-03`**. Verify: **`pnpm run build`**.
- [x] **EPUB planning supplement:** `repub epub` supports repeatable **`--planning <dir>`**; **`runEpub`** appends bundled `.md`/`.mdx`/`.xml`/`.toml`/`.txt` as spine appendix; **`scripts/build-books.cjs`** reads **`book.json` `epubPlanningDirs`**; Mordred's Tale points at **`apps/portfolio/content/docs/books/planning`**. Books planning MDX (**task-registry** `books-reader-02-02`, **planning-docs**, **state**) updated. Verify: **`pnpm run build:books`**.
- [x] Archive prior `.planning/` to `.planning-archive/2026-03-29-pre-barebones/`; bare re-init; root **`AGENTS.md`** + **`integration.mdx`** updated; CLI **`--minimal`** + **`migratePhaseMarkdown`** missing-`phases/` fix in **`vendor/repo-planner`**
- [x] **`documentation-site-05`** (2026-03-28): shadcn oklch theme + IBM Plex + `dark` on `<html>`; `globals.css` `@theme inline` + legacy aliases; docs section `state.mdx` / `task-registry.mdx` / `decisions.mdx` updated.
- [x] **`books-ai-01-05`** (2026-03-30): live Copilot turns now fetch RAG context from the sidecar search pipeline, inject retrieved excerpts into `agent/run` requests server-side, and render a collapsible Sources panel with snippets and deep links in the site chat; unit/e2e/build/lint verification rerun after explicit IBM Plex font weights were added for stable `next/font` builds.
- (further content migrated from archive)

## Next

- [ ] **URL taxonomy + apps hub:** [Route conventions](../apps/portfolio/content/docs/documentation/route-conventions.mdx) — implement `documentation-site-06-02`–`06-03` (`/apps`, redirects from `/docs/apps`, repo-planner route move, link sweep).
- [ ] **Reader shell + repub runtime:** [Books task registry](../apps/portfolio/content/docs/books/task-registry.mdx) **`books-reader-03`** — library overview in `/apps/reader`, export reader UI from **`@portfolio/repub-builder`** (runtime subpath TBD), Kookit-informed chrome.
- [ ] **Cockpit embed (shared modal body):** [Reader + Repo Planner embed plan](../apps/portfolio/content/docs/documentation/reader-repo-planner-embed-architecture.mdx) — **`books-reader-03-06`**, **`documentation-site-08`**, **`repo-planner-integration-02`**.
- [ ] Merge archive narrative into this file and into **REQUIREMENTS.md**.
- [ ] `books-ai-01-10`: live dev `429 insufficient_quota` mismatch (see [books state](../apps/portfolio/content/docs/books/state.mdx)).
- [ ] Run `pnpm planning snapshot` after TASK-REGISTRY reflects real work.

## In progress

- (none)
