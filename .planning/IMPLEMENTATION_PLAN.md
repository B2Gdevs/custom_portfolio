# Implementation plan (Ralph Wiggum state)

Restarted **2026-03-30** with **minimal** `pnpm planning:init` (no templates/phases/reports under `.planning/`). Historical **Done** / **Next** / **Notes** from the pre-barebones era were merged into **[documentation/requirements.mdx](../apps/portfolio/content/docs/documentation/requirements.mdx)** and **[books planning-docs](../apps/portfolio/content/docs/books/planning-docs.mdx)**; the **`.planning-archive/`** tree was then **removed**.

## Done

- [x] **Planning/operator encoding policy (2026-03-29):** normalize `.planning` and operator-facing planning docs to ASCII-first punctuation so terminal, CLI, and XML-oriented surfaces do not render typographic Unicode inconsistently; keep public-facing prose and narrative docs free to use richer typography.
- [x] **Route hygiene (2026-03-29):** Dialogue Forge at **`/apps/dialogue-forge`**; **308** from `/dialogue-forge`; **removed** `app/books/*` pages; **308** `/books` -> `/apps/reader`; planning: [route conventions](../apps/portfolio/content/docs/documentation/route-conventions.mdx), **`documentation-site-06-05`**, **`books-reader-03-03`**. Verify: **`pnpm run build`**.
- [x] **EPUB planning supplement:** `repub epub` supports repeatable **`--planning <dir>`**; **`runEpub`** appends bundled `.md`/`.mdx`/`.xml`/`.toml`/`.txt` as spine appendix; **`scripts/build-books.cjs`** reads **`book.json` `epubPlanningDirs`**; Mordred's Tale points at **`apps/portfolio/content/docs/books/planning`**. Books planning MDX (**task-registry** `books-reader-02-02`, **planning-docs**, **state**) updated. Verify: **`pnpm run build:books`**.
- [x] Archive prior `.planning/` to **`.planning-archive/2026-03-29-pre-barebones/`** (later **removed** after doc migration); bare re-init; root **`AGENTS.md`** + **`repo-planner/*.mdx`** updated; CLI **`--minimal`** + **`migratePhaseMarkdown`** missing-`phases/` fix in **`vendor/repo-planner`**
- [x] **`documentation-site-05`** (2026-03-28): shadcn oklch theme + IBM Plex + `dark` on `<html>`; `globals.css` `@theme inline` + legacy aliases; docs section `state.mdx` / `task-registry.mdx` / `decisions.mdx` updated.
- [x] **`books-ai-01-05`** (2026-03-30): live Copilot turns now fetch RAG context from the sidecar search pipeline, inject retrieved excerpts into `agent/run` requests server-side, and render a collapsible Sources panel with snippets and deep links in the site chat; unit/e2e/build/lint verification rerun after explicit IBM Plex font weights were added for stable `next/font` builds.
- [x] **Repo Planner embed built-in packs (2026-03-28):** shared **`vendor/repo-planner/scripts/lib/embed-builtin-packs-build.mjs`**; CLI **`pnpm planning pack embed-build`**; root **`pnpm planning:embed-packs`** + portfolio **`build-planning-embed-packs.cjs`** call the same builder; package export **`repo-planner/embed-builtin-packs-build`**. `PlanningPackGallery` + types; cockpit **`builtinPacks`** / **`surfaceBuiltinPackId`**. Verify: `pnpm planning pack embed-build --help`, `pnpm planning:embed-packs`, `pnpm run build`.
- [x] **Surface cleanup pass (2026-03-30):** real BandLab listen rows replaced fake placeholders; `/apps` is the canonical tool hub with repo-planner moved there and explicit Docs/App nav split; `/resumes` is now a preview gallery with hover actions; blog/projects/listen now share an identity-aware archive shell with type-to-open search hardening. Verify: `pnpm --filter @portfolio/app test:unit`, `pnpm run lint`, `pnpm run build`.
- [x] **`.planning` phase 01 closure (2026-03-28):** `.planning-archive/` removed; **`documentation/requirements.mdx`** records migration; **`pnpm planning -- --version`**; **`engines.node` >= 22** (root, repub-builder, repo-planner). Verify: `pnpm planning -- --version`, `pnpm --filter @portfolio/repub-builder run repub -- --version`, `pnpm run build`.
- (further content migrated from archive)

## Next

- [ ] **Reader shell + repub runtime:** [Books task registry](../apps/portfolio/content/docs/books/task-registry.mdx) **`books-reader-03`** -- built-in library shelf in `/apps/reader`, richer manifest metadata for covers/authors/status, Koodo-inspired cover cards, and runtime export from **`@portfolio/repub-builder`**.
- [ ] **Cockpit embed (shared modal body):** [Reader + Repo Planner embed plan](../apps/portfolio/content/docs/documentation/reader-repo-planner-embed-architecture.mdx) -- **`books-reader-03-06`**, **`documentation-site-08`**, **`repo-planner-integration-02`**.
- [ ] **Planning IA reset:** [Documentation task registry](../apps/portfolio/content/docs/documentation/task-registry.mdx) -- execute **`documentation-site-10-01`**-`10-03` so section planning moves into literal `planning/` folders and roadmap/state/task-registry/decisions become the uncontested living loop.
- [ ] **Optional stale-route guard:** add the **`documentation-site-06-04`** grep/CI check for lingering `/docs/apps` references outside redirect/history docs.
- [ ] `books-ai-01-10`: live dev `429 insufficient_quota` mismatch (see [books state](../apps/portfolio/content/docs/books/state.mdx)).
- [ ] Run `pnpm planning snapshot` after TASK-REGISTRY reflects real work.

## In progress

- (none)
