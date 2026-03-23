# Implementation plan (Ralph Wiggum state)

Read this each iteration; pick one task; update after completing.

## Done

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
- [x] Books reader follow-up: make the homepage reader load on demand from its CTA and show visible disabled upcoming-book choices.
- [x] Books reader spread fix: restore visible two-page desktop spreads after `build:books` by pairing authored pages into shared EPUB spine documents and lowering the in-app spread threshold to match the actual reader viewport.
- [x] Books reader shell polish: remove the shared public footer from `/books/[bookSlug]/read`, let the reader page consume the full available shell height, and add a collapsible desktop sidebar for more reading room.
- [x] Books reader header polish: compact the read-page top bar, keep the active book title prominent, convert book switching to a tabgroup, and add motion to the desktop sidebar collapse/expand transition.
- [x] Books reader TOC motion polish: animate the in-reader contents sidebar and backdrop so the EPUB reader panel opens and closes with the same eased motion language as the site shell.
- [x] Books reader local upload + frozen runtime: allow opening arbitrary local `.epub` files in the in-app reader and add a separate production-style reader build/run path for reading without `next dev` hot reload.

## Books & reader

- **Requirements:** [.planning/REQUIREMENTS.md](.planning/REQUIREMENTS.md)
- **Design / styling:** [.planning/DESIGN_STYLING.md](.planning/DESIGN_STYLING.md)
- **Vendoring (Koodo/Kookit):** [.planning/VENDORING.md](.planning/VENDORING.md)

Artifacts: `packages/repub-builder` (CLI, epub only), `packages/book-components` (MDX components), `vendor/kookit` (with RepubRender), `vendor/koodo-reader` (submodule; wire .repub when checked out).

## Release & lint

- [x] **Lint:** Fix all ESLint errors so `pnpm run lint` passes (warnings remain in dialogue-forge, etc.).
- [x] **Submodules:** Init done. B2Gdevs/kookit and B2Gdevs/koodo-reader are our forks; `.gitmodules` points to them. Push this repo (with submodule refs) and push each vendor submodule to B2Gdevs when patches are ready.
- [x] **Release workflows:** repub-builder tarball glob fixed (`portfolio-repub-builder-*.tgz`); repub-reader release added (tag `repub-reader-v*`); Koodo Reader release workflow added (tag `koodo-reader-v*`, builds from vendor/koodo-reader). **Wire .repub in Koodo** (see VENDORING.md) when reader is built.
- [x] **.releases:** `.releases/` in gitignore; `scripts/download-releases.cjs` downloads repub-builder, repub-reader, and Koodo Reader assets into `.releases/`. Run with optional tag args or leave empty for latest.

## Next (optional / when needed)

- [ ] Portfolio redesign phase 5: replace current PCB / dev aesthetic on the public landing page with the literary visual system in `.planning/PORTFOLIO_EXPERIENCE_REDESIGN.md`.
- [ ] Portfolio redesign phase 6: evaluate selective WebGL or React Three Fiber additions only after the non-WebGL experience is stable.
- [x] Wire book-components into repub pack/epub when building from .mdx (MDX compiler + component map).
- [ ] Upgrade Next.js 16.0.8 → 16.1.6 (security; see nextjs.org blog).
- [ ] Resolve Turbopack shiki warning: add `shiki` to app deps or adjust serverExternalPackages if rehype-pretty-code breaks.
- [ ] Peer dep: react-youtube-embed / styled-jsx expect React 15/16; app uses 19 (warning only; fix if runtime issues).
- [ ] pnpm: run `pnpm approve-builds` if native deps (e.g. better-sqlite3, sharp) fail on Vercel.

## In progress

- (none)

## Notes

- **Resume update (2026-03-23):** added `/resumes/your-dream-job` backed by `dream_job_resume.html`, with a more cinematic Austin/Capital Factory-specific narrative emphasizing founder empathy, community building, and startup ecosystem support.
- **Resume standards (2026-03-23):** `dream_job_resume.html` now uses a lighter editorial palette with a print-safe single-column fallback, and `.planning/RESUME_DESIGN_GUIDELINES.md` documents the preferred resume references plus non-negotiable print/layout standards for future variants.
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
- **Optional done:** shiki in app deps; Next/MDX pinned via overrides; styled-jsx>react override for React 19.
