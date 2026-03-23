# Books & reader – requirements

Single living document for books tooling and the RichEPub reader. Update this as we flesh out scope.

## Books source of truth

- **Location:** Repo-root `books/<slug>/` (e.g. `books/mordreds_tale/`).
- **Structure:** `chapters/<chapter-dir>/*.md` (or `.mdx`), optional `images/`, optional `book.json`.
- **Metadata:** `book.json` may contain `title`, `author`, `description`. If missing, title is derived from slug.

## Tooling

- **Build script:** Root-level `scripts/build-books.cjs` (invoked via `pnpm run build:books`).
- **Input:** `books/<slug>/` for each slug (directory listing under `books/`).
- **Output:** `apps/portfolio/public/books/<slug>/book.epub` and `apps/portfolio/public/books/manifest.json`.
- **Manifest:** Array of `{ slug, title, description?, hasEpub }`. The books list (`lib/books.ts`) reads from this at runtime.

## repub CLI and packages

- **repub-cli (repub-builder):** CLI with subcommands `repub build`, `repub read`, `repub epub`. Install from this repo only (no npm publish). See `packages/repub-builder/README.md`. (Legacy: `repub pack` for .repub has been removed; in-app reader is EPUB-only.)
- **book-components:** MDX authoring components (BookRoot, Chapter, Section, ChapterTitle, PartDivider, Callout, Blockquote, Figure, CodeBlock, BookMeta). **Wired:** `repub epub` compiles `.mdx` with `@mdx-js/mdx` and book-components; `.md` uses marked.

## Vendored desktop reader (Koodo / Kookit)

- **Kookit** (vendor/kookit): [B2Gdevs/kookit](https://github.com/B2Gdevs/kookit). We add a **.repub renderer** (RepubRender): unpack ZIP, repub.json + content/index.html + assets, expose to reader. See [.planning/VENDORING.md](.planning/VENDORING.md).
- **Koodo Reader** (vendor/koodo-reader): [B2Gdevs/koodo-reader](https://github.com/B2Gdevs/koodo-reader). Vendored so we can register .repub and fix issues. When submodule is checked out, wire .repub to Kookit’s RepubRender.
- **Embeddable reader:** Portfolio uses the in-app EPUB reader (react-reader / epub.js). Koodo is the desktop app we extend to open .repub when the submodule is wired.

## Formats

- **EPUB:** Universal format. Built from markdown/MDX → HTML; images inlined as base64. Served at `/books/<slug>/book.epub` for download. Plain .md must not fail for epub.
- **RichEPub (.repub):** Web-only. ZIP with `repub.json`, `content/index.html`, and `assets/`. Unpacked and rendered in a sandboxed iframe by the portfolio reader. No npm at runtime.

## RichEPub content

- **Today:** Markdown compiled with marked; `.mdx` compiled with `@mdx-js/mdx` and book-components (Callout, ChapterTitle, Figure, etc.) at pack/epub build time. Single static HTML document with nav + sections; images in `assets/images/`.
- **Future (optional):** Reader app (Vite + React) that consumes book MDX + shared component library; build that app into .repub.

## Reader

- **Portfolio reader:** In-app EPUB reader (react-reader / epub.js). Reads `book.epub` at `/books/<slug>/read` and in **BookReaderEmbed** (docs/articles). Location persisted in localStorage by slug.
- **Front-page activation:** The homepage can defer mounting the embedded reader, but the primary CTA must load the featured book into that reader when invoked.
- **Book selection:** The homepage reader area should expose the available books list; entries without a built EPUB should remain visible but disabled as `coming soon`.
- **Koodo Reader (desktop):** Primary consumer-facing reader build (Electron). Can be extended to open .repub when submodule is wired.
- **Standalone:** Same .epub file works in any EPUB reader; .repub remains for Koodo/Kookit when wired.

## Verification gates

- **Before any release:** `pnpm install`, `pnpm run build`, and `pnpm run lint` must all pass. Lint is not optional; lint failures block release.

## Releases and .releases

- **Three release artifacts:** (1) **repub-builder** tarball, (2) **repub-reader** tarball, (3) **Koodo Reader** desktop build (Electron). The **reader** (Koodo desktop) is the priority consumer-facing build; repub-reader is the embeddable SDK used by the portfolio.
- Artifacts are published to GitHub Releases (this repo or fork repos as specified).
- **Download script:** `scripts/download-releases.cjs` (or equivalent) downloads the latest release artifacts into **`.releases/`** in this repo. Success criterion: you can run the script and get builds under `.releases/`.

## Submodules and forks

- We push to **this repo** and to **vendored repos**. For `vendor/kookit` and `vendor/koodo-reader` we maintain **forks** (e.g. under MagicbornStudios or same org) so we can push our patches (RepubRender, .repub wiring, build config). `.gitmodules` points to those forks; upstream (B2Gdevs) remains the source of truth for pulling updates. Fork URLs are documented in [.planning/VENDORING.md](.planning/VENDORING.md).

## Distribution

- **Repub-builder** and **book-components** are **GitHub-repo only**. No npm publish. Consume via clone or workspace. README version automation: script + workflow substitute version into README on release.

## Portfolio experience redesign

- **Goal:** Reposition the portfolio so the first impression is **author / artist / world-builder**, not **software architect**.
- **Primary entry point:** The landing page should lead with the book and an immediate path to start reading.
- **Secondary creative lane:** Songs and audio work should appear on the home page as a distinct section, using placeholders or BandLab embeds until the final catalog is ready.
- **Resume access:** The site should expose a clear `resumes` destination where tailored resumes can be found quickly and opened in standalone print-friendly pages.
- **Resume design source of truth:** Resume visual direction, print standards, and references should live in `.planning/RESUME_DESIGN_GUIDELINES.md` so new resume variants stay printable and aesthetically consistent.
- **Technical work:** Projects, docs, blog, and tooling still matter, but should live as clear secondary navigation destinations without dominating the first screen.
- **Implementation rule:** Keep the existing Next.js/Vercel stack for the first redesign pass. Match the **content sequencing and atmosphere** of inspirational sites, not their exact implementation details.
- **Placeholder-friendly:** Fake covers, descriptions, track art, and CTA copy are acceptable in early iterations as long as routes and components work end-to-end.
- **Motion / depth:** The redesign should use layered motion and selective 3D to create presence, but must retain good mobile behavior, reasonable performance, and a reduced-motion fallback.
- **Scrollbar consistency:** Shared shell scrollbars (page, site sidebar, docs sidebar, overlays) should use the same thin visual treatment without causing layout drift when they appear.
- **Design source of truth:** Detailed IA, content order, and 3D decisions live in `.planning/PORTFOLIO_EXPERIENCE_REDESIGN.md`.

## Documentation IA

- **Section-first docs:** The docs area should be organized around active sections such as `books/` and `dialogue-forge/`, not generic buckets like “Core Concepts”.
- **Planning-doc oriented:** Each active section should expose planning-style documentation as first-class pages, with `planning docs`, `state`, `task registry`, `errors and attempts`, and `decisions` appearing before general implementation notes.
- **XML-inspired structure:** Those section planning pages should mirror the old XML planning breakdown in page form rather than using vague prose placeholders.
- **Compact schema:** Planning pages should use compact repeated structures that are easy for humans to scan and easy for the site to parse later, favoring fixed fields, tables, and explicit record ids over paragraph-heavy prose.
- **Nested planning folder:** In section navigation, planning pages should live inside a `Planning Docs` folder that is collapsed by default and can be expanded to select those pages.
- **Remove stale docs:** Unsupported or abandoned sections like `richepub` and `book-editor`, plus obsolete top-level docs that only describe those systems, should be removed from the portfolio docs experience.
- **Expandable later:** More section folders can be added as the site grows, but the docs shell should already assume real section folders are the unit of organization.
