# Implementation plan (Ralph Wiggum state)

Read this each iteration; pick one task; update after completing.

## Done

- [x] Blitzpanel resume expansion follow-up: rebuilt `blitzpanel_resume.html` with deeper professional summary, expanded past experience, current project detail, and additional talents while keeping the printable editorial style.
- [x] Portfolio nav + resume follow-up: added a Blitzpanel-tailored resume (including current side-project narrative) and updated navigation with direct tabs for projects/books/songs plus GitHub and live side-project links.
- [x] Resume library UX follow-up: add an explicit direct-download list on `/resumes` so every discovered HTML resume appears as a visible list item link.
- [x] Resume library download follow-up: add explicit `/resumes/download/[slug]` attachment routes and wire the `/resumes` cards to direct file downloads for every discovered HTML resume.
- [x] Resume library follow-up: treat `misc/html_resumes` as the website source set so resume pages can discover those HTML files, surface metadata, and offer direct downloads.
- [x] Resume print follow-up: make the Capital Factory resume print with the same editorial multi-column layout as the live page, and update the resume design guidelines to prefer screen-matching print output when stable.
- [x] Resume follow-up: add a new standalone `your dream job` resume tailored to Capital Factory's open Austin role and register it in the `/resumes` library.
- [x] Resume standards follow-up: restyle the Capital Factory resume to match the light editorial direction and add a source-of-truth guidelines doc for printable resume design.
- [x] Nest section planning pages under a collapsed `Planning Docs` folder in the docs section tree instead of showing them as flat sibling links.
- [x] Replace generic section planning placeholders with XML-structured docs pages (`planning docs`, `state`, `task registry`, `errors and attempts`, `decisions`) and make that planning group sort first inside each docs section.
- [x] Documentation cleanup: remove obsolete `book-editor`, `richepub`, and generic top-level docs, then regroup the docs experience around active section folders such as `books` and `dialogue-forge`.
- [x] Portfolio redesign phase 1: replace the tech-first home hero with a book-first landing experience.
- [x] Portfolio redesign phase 2: add a featured-book "read now" section on `/` with working embedded reader preview and placeholder world-building copy.
- [x] Portfolio redesign phase 3: add a `Listen` route and placeholder song dataset with working BandLab embeds.
- [x] Portfolio redesign phase 4: add a direct `Projects`, `Blog`, and `Docs` hub on `/` and convert the shared shell to a styled sidebar.
- [x] Fix Vercel deployment blocker: upgrade `next-mdx-remote` to `6.0.0` and pin root `packageManager` to `pnpm@10.28.0` so Vercel uses the expected pnpm major.
- [x] Fix Vercel build: add `onLoadExampleDialogue` and `onLoadExampleFlags` to `DialogueEditorV2` exported props type (packages/dialogue-forge).
- [x] Add AGENTS.md and .planning with Ralph Wiggum loop artifacts.
- [x] Repub plan: README version script + workflow; repub-cli (build/read/epub); vendor Kookit + Koodo Reader submodules; .repub renderer in Kookit (RepubRender); book-components package; .planning docs (REQUIREMENTS, VENDORING, this plan).
- [x] EPUB-only reader: RichEPub/.repub removed from portfolio; in-app reader is react-reader (epub.js); repub-reader and `repub pack` removed.
- [x] Portfolio redesign follow-up: add a resume hub with direct printable resume pages and fold it into the public site navigation.
- [x] Scrollbar polish follow-up: keep page and sidebar scrollbars visually aligned with stable gutters across the main site and docs shells.
- [x] Docs planning follow-up: rewrite section planning pages into compact XML-style record layouts that are readable and parseable.
- [x] Documentation: global planning page (Mermaid, id namespaces, `.planning` cross-refs) at `content/docs/global/global-planning.mdx` + `mermaid` dependency and MDX `pre` handling.
- [x] Planning ids: document `books-*` streams (`reader`, `publishing`, `ai`, including `books-ai-00` vs `books-ai-01`) aligned to `<namespace>-<stream>-<phase>-<task>`; `magicborn` in `lib/docs.ts` + planning-pack `SECTION_LABELS`; REQUIREMENTS task convention uses namespace/stream wording; books planning-docs links to global planning.
- [x] RepoPlanner: `vendor/repo-planner` submodule; root `pnpm planning*` scripts + workspace CLI deps; **`content/docs/global/`** (`/docs/global/global-planning`); **`content/docs/repo-planner/`**; architecture/design/resume/portfolio/vendoring moved from `.planning` to **documentation** MDX; `.planning/VENDORING.md` stub; XML bootstrap (`pnpm planning:init`) alongside existing `.planning/*.md`.
- [x] Books reader follow-up: make the homepage reader load on demand from its CTA and show visible disabled upcoming-book choices.
- [x] Books reader spread fix: restore visible two-page desktop spreads after `build:books` by pairing authored pages into shared EPUB spine documents and lowering the in-app spread threshold to match the actual reader viewport.
- [x] Books reader shell polish: remove the shared public footer from `/books/[bookSlug]/read`, let the reader page consume the full available shell height, and add a collapsible desktop sidebar for more reading room.
- [x] Books reader header polish: compact the read-page top bar, keep the active book title prominent, convert book switching to a tabgroup, and add motion to the desktop sidebar collapse/expand transition.
- [x] Books reader TOC motion polish: animate the in-reader contents sidebar and backdrop so the EPUB reader panel opens and closes with the same eased motion language as the site shell.
- [x] Books reader local upload + frozen runtime: allow opening arbitrary local `.epub` files in the in-app reader and add a separate production-style reader build/run path for reading without `next dev` hot reload.
- [x] Books reader build cleanup + versioning: remove stale `.repub` artifacts from active book outputs, remove the obsolete repub release/download path, and store frozen reader builds as versioned snapshots with a default `latest` runner.
- [x] Ch3 manuscript: Jack lair intercut dateline uses **earlier** flashback wording so chronology matches Morgana’s present thread.
- [x] Reader annotations + export: CFI highlights/comments, IndexedDB, JSON import/export, optional `META-INF/portfolio-annotations.json` repack, planning panel on read route.
- [x] Site AI chat: CopilotKit + OpenAI (`gpt-4o-mini` default) with floating bubble.
- [x] Planning portal: build-time export of section planning MDX to `public/planning-pack/site/`, demo pack + generic planning-agent `AGENTS.md`, `manifest.json`, Zustand modal registry, planning pack modal (nav + hero entry points).

## Books & reader

- **Requirements:** [.planning/REQUIREMENTS.md](.planning/REQUIREMENTS.md) — includes **Reader + AI roadmap (phases)** (shipped vs planned).
- **Architecture / conventions:** [architecture-conventions.mdx](../apps/portfolio/content/docs/documentation/architecture-conventions.mdx)
- **Design / styling:** [design-styling.mdx](../apps/portfolio/content/docs/documentation/design-styling.mdx)
- **Vendoring (Koodo/Kookit/RepoPlanner):** [vendoring.mdx](../apps/portfolio/content/docs/documentation/vendoring.mdx) · pointer [.planning/VENDORING.md](.planning/VENDORING.md)
- **Books docs (mirrored tasks):** [task-registry.mdx](apps/portfolio/content/docs/books/task-registry.mdx), [state.mdx](apps/portfolio/content/docs/books/state.mdx)

Artifacts: `packages/repub-builder` (CLI, epub only), `packages/book-components` (MDX components), `vendor/kookit` (with RepubRender), `vendor/koodo-reader` (submodule; wire .repub when checked out).

### Reader / annotations / site AI — phase snapshot (2026-03-28)

| Track | Shipped in repo | Still open (see REQUIREMENTS phase table + Next below) |
| --- | --- | --- |
| Manuscript | Ch3 Jack dateline + `MT-CH3-JACK-DATELINE` | — |
| Reader annotations | P1–P3 + P3b per REQUIREMENTS | P4 build merge, P5 EPUB planning spine |
| Site AI | CopilotKit + `/api/copilotkit` + layout-gated bubble | AI-v1a-AI-v1d Payload + `sqlite-vec` RAG planning, then AI-v2 stack evaluation |

**Process:** Prefer updating REQUIREMENTS phase table and books **task registry** / **state** before coding new reader or AI scope. Early implementation of annotations/chat is acknowledged in REQUIREMENTS; future work should stay plan-first per AGENTS.md.

## Release & lint

- [x] **Lint:** Fix all ESLint errors so `pnpm run lint` passes (warnings remain in dialogue-forge, etc.).
- [x] **Submodules:** Init done. B2Gdevs/kookit and B2Gdevs/koodo-reader are our forks; `.gitmodules` points to them. Push this repo (with submodule refs) and push each vendor submodule to B2Gdevs when patches are ready.
- [x] **Release workflows:** repub-builder tarball glob fixed (`portfolio-repub-builder-*.tgz`); repub-reader release added (tag `repub-reader-v*`); Koodo Reader release workflow added (tag `koodo-reader-v*`, builds from vendor/koodo-reader). **Wire .repub in Koodo** (see VENDORING.md) when reader is built.
- [x] **.releases:** `.releases/` in gitignore; `scripts/download-releases.cjs` downloads repub-builder, repub-reader, and Koodo Reader assets into `.releases/`. Run with optional tag args or leave empty for latest.

## Planning portal & agent doc hierarchy

Cross-cutting work tracked in **documentation** section: [task-registry.mdx](apps/portfolio/content/docs/documentation/task-registry.mdx) phase `documentation-site-03`. Spec: [.planning/REQUIREMENTS.md](.planning/REQUIREMENTS.md) **Planning packs & homepage modal**.

| Step | Task | Id (documentation section) |
| --- | --- | --- |
| 1 | Document and adopt **read order** + `repoPath` / `taskPhase` frontmatter; keep **root `AGENTS.md`** and `.planning` in sync. | `documentation-site-03-01` |
| 2 | **Demo pack** static `.md` under `public/planning-pack/demo/` + generic **planning agent** `AGENTS.md`. | `documentation-site-03-02` |
| 3 | **Build-time** export: section planning MDX → `public/planning-pack/site/` + `manifest.json` (**no** public `.planning`). | `documentation-site-03-03` |
| 4 | **Modal registry** (Zustand) + planning pack UI: tabs, PDF-style thumbnails, hover download/expand. | `documentation-site-03-04` |
| 5 | List **only existing** files; no placeholders for missing section `AGENTS.md`. | `documentation-site-03-05` |

**Global planning (human index):** [global-planning.mdx](apps/portfolio/content/docs/global/global-planning.mdx) at `/docs/global/global-planning` — layers (`.planning` vs section docs), id shape `<namespace>-<stream>-<phase>-<task>`, cross-reference conventions, Mermaid workflow diagrams; exported in planning-pack `.md` with fenced `mermaid` blocks. Linked from root `AGENTS.md`, [global/planning-docs.mdx](apps/portfolio/content/docs/global/planning-docs.mdx), and [documentation/planning-docs.mdx](apps/portfolio/content/docs/documentation/planning-docs.mdx). **RepoPlanner:** `vendor/repo-planner`, root `pnpm planning*` — [repo-planner docs](apps/portfolio/content/docs/repo-planner/planning-docs.mdx).

## Next (planning-first refactor queue)

- [ ] **Phase 1 - product boundary cleanup:** formalize `repo` vs `client-local` vs `server` ownership for every active feature; remove any assumption that public visitors can write manuscript/planning data or that authored content belongs in the DB.
- [ ] **Phase 1a - content source cleanup:** deprecate DB-backed `projects` / `blog_posts` / `docs` as planned source-of-truth collections in `apps/portfolio/lib/db/schema.ts`; keep file-authored content repo-first.
- [ ] **Phase 2 - service extraction:** introduce domain service folders for content, books/reader, chat, and admin so routes/components stop owning mixed UI + IO logic.
- [ ] **Phase 2a - state boundary rules:** introduce storage adapters for `localStorage` / IndexedDB flows and only add Zustand or React Query where shared client state or async caching is justified.
- [ ] **Phase 3 - owner-only admin posture:** keep `/admin` local/dev or explicitly auth-gated; if Payload is introduced, scope it to narrow owner-operated collections such as messages/inbox or other internal records, not blog/docs/books publishing.
- [ ] **Books AI planning:** tracked in [task-registry.mdx](apps/portfolio/content/docs/books/task-registry.mdx) as `books-ai-01-01` through `books-ai-01-07` (Payload collections, `sqlite-vec` with `text-embedding-3-small` `1536d`, `magicborn` worldbuilding ingest scope, hybrid rerank/filter, citation panel, basic-auth admin and ingest flow).
- [ ] **Books reader follow-up:** tracked as `books-reader-02-01` / `books-reader-02-02` for annotation merge and optional planning XHTML in the EPUB spine.
- [ ] **Books publishing follow-up:** tracked as `books-publishing-01-01` / `books-publishing-01-02` for editions/progression planning and the next visible book EPUB.
- [ ] **AI hardening:** rate limits, abuse logging, and post-RAG operational cleanup.
- [ ] **Assistant UI / Tool UI / MCP:** evaluate via `books-ai-01-07`; add read-only MCP apps when the agent stack stabilizes.
- [ ] Portfolio redesign phase 5: replace current PCB / dev aesthetic on the public landing page with the literary visual system in [portfolio-experience-redesign.mdx](../apps/portfolio/content/docs/documentation/portfolio-experience-redesign.mdx).
- [ ] Portfolio redesign phase 6: evaluate selective WebGL or React Three Fiber additions only after the non-WebGL experience is stable.
- [x] Wire book-components into repub pack/epub when building from .mdx (MDX compiler + component map).
- [ ] Upgrade Next.js 16.0.8 → 16.1.6 (security; see nextjs.org blog).
- [ ] Resolve Turbopack shiki warning: add `shiki` to app deps or adjust serverExternalPackages if rehype-pretty-code breaks.
- [ ] Peer dep: react-youtube-embed / styled-jsx expect React 15/16; app uses 19 (warning only; fix if runtime issues).
- [ ] pnpm: run `pnpm approve-builds` if native deps (e.g. better-sqlite3, sharp) fail on Vercel.

## In progress

- (none)

## Notes

- **Planning reset (2026-03-28):** clarified the product boundary: visitors are read-only by default, browser authoring must be local-first/export-oriented unless explicitly gated, repo files remain the canonical source for authored content, and the DB is reserved for narrow owner-critical operational data. Refactor stages now live in [architecture-conventions.mdx](../apps/portfolio/content/docs/documentation/architecture-conventions.mdx).
- **RAG direction (2026-03-28):** planning now assumes a slim Payload CMS + SQLite backend for chat retrieval data, with `sqlite-vec` as the vector layer. Repo content stays canonical; indexed chunks are the retrieval copy. Source scope is docs/projects/blog plus `magicborn` worldbuilding material, ingest is script-first with an admin trigger, admin uses basic auth, embeddings default to `text-embedding-3-small` at `1536` dimensions, retrieval uses an FTS5 BM25 rerank pass, chat reads only from the last completed ingest run, removed sources drop out of the active corpus immediately on commit, and source ids remain stable across reindex runs.
- **Blitzpanel resume expansion (2026-03-24):** `blitzpanel_resume.html` now reads like a fuller traditional resume with expanded professional summary, richer past/current experience detail, Blitzpanel-relevant project highlights, and an explicit additional-talents section tied to the current stack and active work.
- **Blitzpanel follow-up (2026-03-24):** added `blitzpanel_resume.html` to `misc/html_resumes` and registered metadata so it appears first in `/resumes`; updated sidebar top tabs to include Projects, Books, Songs, and an external GitHub shortcut; removed the previous `Current shape` copy card; added direct external links for GitHub and `dungeon-break-docs.vercel.app` in the Projects nav section.
- **Resume download list follow-up (2026-03-24):** `/resumes` now includes a `Direct source downloads` bullet list that enumerates every discovered file from `misc/html_resumes` (including axiom/autohdr/bild/openweb variants) with direct attachment links.
- **Resume download follow-up (2026-03-24):** `/resumes` now points each card to `/resumes/download/<slug>` with `download` hints, and the new download route always serves the source HTML as an attachment so all listed resumes download reliably from the library page.
- **Resume library follow-up (2026-03-23):** the website now treats `apps/portfolio/misc/html_resumes/` as the source set for the public resume library, including file discovery, metadata extraction with per-file fallbacks, and direct HTML downloads.
- **Resume print follow-up (2026-03-23):** `dream_job_resume.html` print styles now preserve the live editorial grid, cards, and paper-toned treatment instead of flattening into a stripped-down single column, and [resume-design-guidelines.mdx](../apps/portfolio/content/docs/documentation/resume-design-guidelines.mdx) states that resume print mode should match the live layout whenever it remains stable in browser PDF export.
- **Resume update (2026-03-23):** added `/resumes/your-dream-job` backed by `dream_job_resume.html`, with a more cinematic Austin/Capital Factory-specific narrative emphasizing founder empathy, community building, and startup ecosystem support.
- **Resume standards (2026-03-23):** `dream_job_resume.html` now uses a lighter editorial palette with print behavior documented in [resume-design-guidelines.mdx](../apps/portfolio/content/docs/documentation/resume-design-guidelines.mdx), including the preference to preserve the live layout when browser PDF export keeps it stable.
- **Verification (2026-03-23):** `pnpm install`, `pnpm run build`, and `pnpm run lint` all complete successfully; lint still reports the existing warning-only backlog in unrelated files.
- **Deploy fix:** `apps/portfolio` now depends on `next-mdx-remote@^6.0.0`; `pnpm-lock.yaml` no longer contains `5.0.0`; root `package.json` pins `pnpm@10.28.0` for Vercel parity.
- **Redesign direction:** Follow the sequencing and atmosphere of `davidwhyte.com/experience` without cloning its stack; in this repo we keep Next.js and ship a book-first landing page before exploring heavier 3D.
- **Redesign shipped:** `/` now leads with `mordreds_tale`, uses the front-page reader as the main reading surface, introduces a music lane via BandLab embeds, and keeps projects/blog/docs explicit in both the page content and the sidebar shell.
- **Sidebar polish:** The thin dark scrollbar treatment is shared across the main site sidebar and the docs sidebar, staying visually hidden until hover or active scrolling.
- **Resume hub:** `/resumes` now lists the tailored resumes, and `/resumes/<slug>` serves each HTML resume as a standalone printable document using the existing source files in `apps/portfolio/misc/html_resumes`.
- **Planning docs shape:** section planning pages in `books` and `dialogue-forge` now use compact record tables with stable field names instead of paragraph-heavy placeholder prose.
- **Verification (2026-03-16):** `pnpm run build` passes after the planning-doc rewrite. Root lint was not rerun because the existing `apps/portfolio/components/books/EpubViewer.tsx:144` blocker is unrelated to the MDX content changes.
- **Books reader fix (2026-03-16):** the homepage reader now mounts only when requested, the CTA actually loads the featured EPUB into the front-page reader, the second book is visible as a disabled `coming soon` option, and `EpubViewer` now uses the direct EPUB URL instead of wrapping the file in a blob URL.
- **Verification (2026-03-16):** `pnpm run lint` now completes with warnings only; the prior `EpubViewer` error is gone. `pnpm run build` passes after the books reader fix.
- **Docs IA:** The docs area now groups content by real section folders instead of hardcoded legacy buckets; unsupported `book-editor` and `richepub` docs plus obsolete top-level docs were removed, and active sections now expose XML-inspired planning pages inside a collapsed `Planning Docs` folder.
- **Build:** Type fixes in app (mdx.tsx ComponentProps per element; projects mediaItems cast). Current tree builds successfully; lint completes with warnings only.
- **Submodules:** B2Gdevs/kookit and B2Gdevs/koodo-reader are our forks; `.gitmodules` is correct. Push vendor submodules to B2Gdevs when we have patches to publish.
- **Book-components:** `packages/repub-builder` uses `@mdx-js/mdx` + `@portfolio/book-components`; `repub epub` compiles `.mdx` with `mdxToHtml()`. `.md` uses marked.
- **Book pipeline:** `pnpm run build:books` builds repub-builder, then runs `scripts/build-books.cjs` which calls `repub epub` per book. Output: `book.epub` and manifest with `hasEpub` only.
- **Books spread fix (2026-03-20):** `repub epub` now wraps two authored pages into each generated spine document so epub.js has adjacent page content to show in spreads, and `EpubViewer` now enables spreads based on the real reader container width (`1050px`) instead of the previous `1200px` cutoff that the sidebar layout never reached.
- **Verification (2026-03-20):** `node scripts/build-books.cjs`, `pnpm run build`, and `pnpm run lint` all pass for this reader fix; lint still reports the existing warning-only backlog.
- **Books shell polish (2026-03-20):** the shared layout now hides the site footer on `/books/[bookSlug]/read`, persists a desktop sidebar collapsed state in localStorage, defaults the read route to the compact icon rail, and lets the reader page fill the remaining shell height instead of reserving extra viewport space for the old footer layout.
- **Verification (2026-03-20):** `pnpm run build` and `pnpm run lint` pass after the read-page shell changes; lint remains warning-only in existing unrelated files.
- **Books header polish (2026-03-20):** the read-page header now uses a tighter vertical rhythm, keeps the current book title as the primary identifier, exposes the available books as a real tablist, and animates the desktop sidebar between full and compact states instead of snapping between widths.
- **Verification (2026-03-20):** `pnpm run build` and `pnpm run lint` pass after the animated sidebar and tabgroup update; lint remains warning-only in the existing unrelated backlog.
- **Books reader TOC motion (2026-03-20):** `EpubViewer` now animates the contents overlay fade, the sidebar slide-in/out, and the contents list entrance so the reader drawer no longer snaps open over the book.
- **Verification (2026-03-20):** `pnpm run build` and `pnpm run lint` pass after the EPUB reader TOC motion update; lint remains warning-only in the existing unrelated backlog.
- **Books local upload + frozen runtime (2026-03-20):** `/books/upload/read` now opens arbitrary local `.epub` files inside the same reader workspace, the library page links to that flow, built-in book read pages can temporarily switch to a local upload, and `EpubViewer` accepts either fetched EPUB URLs or in-memory uploaded EPUB bytes.
- **Standalone reader runtime (2026-03-20):** root scripts now build a frozen production snapshot into `.standalone/portfolio-reader` and run it on port `3410` via `next start`, so reading can happen against a non-hot-reloading build while `pnpm dev` continues separately.
- **Verification (2026-03-20):** `pnpm run lint` passes with the existing warning-only backlog, `pnpm run build:reader:standalone` succeeds, and `node scripts/run-reader-standalone.cjs` stays up until manually stopped / timeout.
- **Reader build cleanup + versioning (2026-03-20):** `build:books` now deletes stale `.repub` artifacts from active public book outputs, the committed `public/books/*.repub` files and `release-repub.yml` automation were removed, the old tracked `.standalone/portfolio-reader` mirror was deleted, and versioned reader builds now live under `apps/portfolio/.reader-builds/portfolio-reader/<build-id>`.
- **Reader build commands (2026-03-20):** `pnpm build:reader` creates a new versioned non-dev reader build by running `next build` against an isolated `distDir`, `pnpm reader` runs the latest build via plain `next start`, `pnpm reader <build-id>` runs a previous build, and `pnpm reader:list` shows the available build ids.
- **Reader launcher fix (2026-03-20):** the reader runner accepts shorthand invocations such as `pnpm reader --latest`, `pnpm reader latest`, and `pnpm reader <build-id>`, and the `next start` launcher now defaults to `127.0.0.1` unless `READER_HOST` is explicitly set so it does not inherit the Windows machine-name `HOSTNAME`.
- **Optional done:** shiki in app deps; Next/MDX pinned via overrides; styled-jsx>react override for React 19.
