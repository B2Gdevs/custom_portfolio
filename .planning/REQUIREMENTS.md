# Books & reader – requirements

Single living document for books tooling and the RichEPub reader. Update this as we flesh out scope.

## Books source of truth

- **Location:** Repo-root `books/<slug>/` (e.g. `books/mordreds_tale/`).
- **Structure:** `chapters/<chapter-dir>/*.md` (or `.mdx`), optional `images/`, optional `book.json`.
- **Metadata:** `book.json` may contain `title`, `author`, `description`. If missing, title is derived from slug.

## Tooling

- **Build script:** Root-level `scripts/build-books.cjs` (invoked via `pnpm run build:books`).
- **Input:** `books/<slug>/` for each slug (directory listing under `books/`).
- **Output:** `apps/portfolio/public/books/<slug>/book.epub`, `book.repub`, and `apps/portfolio/public/books/manifest.json`.
- **Manifest:** Array of `{ slug, title, description?, hasEpub, hasRepub }`. The books list (`lib/books.ts`) reads from this at runtime.

## repub CLI and packages

- **repub-cli (repub-builder):** CLI with subcommands `repub build`, `repub read`, `repub epub`, `repub pack`. Install from this repo only (no npm publish). See `packages/repub-builder/README.md`.
- **repub-reader:** Embeddable SDK package (`@portfolio/repub-reader`). Unpacks .repub (ZIP → blob URLs), renders entry HTML in iframe. Used by portfolio and BookReaderEmbed so books can be read without the full Koodo Reader app.
- **book-components:** MDX authoring components (BookRoot, Chapter, Section, ChapterTitle, PartDivider, Callout, Blockquote, Figure, CodeBlock, BookMeta). **Wired:** `repub pack` and `repub epub` compile `.mdx` files with `@mdx-js/mdx` and render using book-components as the component map; `.md` files use marked as before.

## Vendored desktop reader (Koodo / Kookit)

- **Kookit** (vendor/kookit): [B2Gdevs/kookit](https://github.com/B2Gdevs/kookit). We add a **.repub renderer** (RepubRender): unpack ZIP, repub.json + content/index.html + assets, expose to reader. See [.planning/VENDORING.md](.planning/VENDORING.md).
- **Koodo Reader** (vendor/koodo-reader): [B2Gdevs/koodo-reader](https://github.com/B2Gdevs/koodo-reader). Vendored so we can register .repub and fix issues. When submodule is checked out, wire .repub to Kookit’s RepubRender.
- **Embeddable reader:** The repub-reader package is independent; portfolio and other apps embed .repub without running Koodo. Koodo is the desktop app we extend to open .repub.

## Formats

- **EPUB:** Universal format. Built from markdown/MDX → HTML; images inlined as base64. Served at `/books/<slug>/book.epub` for download. Plain .md must not fail for epub.
- **RichEPub (.repub):** Web-only. ZIP with `repub.json`, `content/index.html`, and `assets/`. Unpacked and rendered in a sandboxed iframe by the portfolio reader. No npm at runtime.

## RichEPub content

- **Today:** Markdown compiled with marked; `.mdx` compiled with `@mdx-js/mdx` and book-components (Callout, ChapterTitle, Figure, etc.) at pack/epub build time. Single static HTML document with nav + sections; images in `assets/images/`.
- **Future (optional):** Reader app (Vite + React) that consumes book MDX + shared component library; build that app into .repub.

## Reader

- **Primary “reader” release:** The **Koodo Reader desktop app** (Electron) is the main consumer-facing reader build. **repub-reader** is the embeddable SDK used by the portfolio.
- **Portfolio reader (RepubViewer):** Uses repub-reader SDK; unpacks .repub, rewrites asset URLs to blob URLs, loads entry HTML in iframe.
- **Docs embed (BookReaderEmbed):** Same reader, embeddable in docs/articles; takes `slug` (and optional `title`), loads `/books/<slug>/book.repub`.
- **Standalone:** Same .repub file can be opened by any host that implements the reader (e.g. portfolio or a minimal static page), or by the vendored Koodo Reader once .repub is registered.

## Verification gates

- **Before any release:** `pnpm install`, `pnpm run build`, and `pnpm run lint` must all pass. Lint is not optional; lint failures block release.

## Releases and .releases

- **Three release artifacts:** (1) **repub-builder** tarball, (2) **repub-reader** tarball, (3) **Koodo Reader** desktop build (Electron). The **reader** (Koodo desktop) is the priority consumer-facing build; repub-reader is the embeddable SDK used by the portfolio.
- Artifacts are published to GitHub Releases (this repo or fork repos as specified).
- **Download script:** `scripts/download-releases.cjs` (or equivalent) downloads the latest release artifacts into **`.releases/`** in this repo. Success criterion: you can run the script and get builds under `.releases/`.

## Submodules and forks

- We push to **this repo** and to **vendored repos**. For `vendor/kookit` and `vendor/koodo-reader` we maintain **forks** (e.g. under MagicbornStudios or same org) so we can push our patches (RepubRender, .repub wiring, build config). `.gitmodules` points to those forks; upstream (B2Gdevs) remains the source of truth for pulling updates. Fork URLs are documented in [.planning/VENDORING.md](.planning/VENDORING.md).

## Distribution

- **Repub-builder**, **repub-reader**, and **book-components** are **GitHub-repo only**. No npm publish. Consume via clone or workspace. README version automation: script + workflow substitute version into README on release.
