# Implementation plan (Ralph Wiggum state)

Read this each iteration; pick one task; update after completing.

## Done

- [x] Fix Vercel build: add `onLoadExampleDialogue` and `onLoadExampleFlags` to `DialogueEditorV2` exported props type (packages/dialogue-forge).
- [x] Add AGENTS.md and .planning with Ralph Wiggum loop artifacts.
- [x] Repub plan: README version script + workflow; repub-cli (build/read/epub); vendor Kookit + Koodo Reader submodules; .repub renderer in Kookit (RepubRender); book-components package; .planning docs (REQUIREMENTS, VENDORING, this plan).
- [x] EPUB-only reader: RichEPub/.repub removed from portfolio; in-app reader is react-reader (epub.js); repub-reader and `repub pack` removed.

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

- [x] Wire book-components into repub pack/epub when building from .mdx (MDX compiler + component map).
- [ ] Upgrade Next.js 16.0.8 → 16.1.6 (security; see nextjs.org blog).
- [ ] Resolve Turbopack shiki warning: add `shiki` to app deps or adjust serverExternalPackages if rehype-pretty-code breaks.
- [ ] Peer dep: react-youtube-embed / styled-jsx expect React 15/16; app uses 19 (warning only; fix if runtime issues).
- [ ] pnpm: run `pnpm approve-builds` if native deps (e.g. better-sqlite3, sharp) fail on Vercel.

## In progress

- (none)

## Notes

- **Build:** Type fixes in app (mdx.tsx ComponentProps per element; projects mediaItems cast). `pnpm run build` and `pnpm run lint` pass.
- **Submodules:** B2Gdevs/kookit and B2Gdevs/koodo-reader are our forks; `.gitmodules` is correct. Push vendor submodules to B2Gdevs when we have patches to publish.
- **Book-components:** `packages/repub-builder` uses `@mdx-js/mdx` + `@portfolio/book-components`; `repub epub` compiles `.mdx` with `mdxToHtml()`. `.md` uses marked.
- **Book pipeline:** `pnpm run build:books` builds repub-builder, then runs `scripts/build-books.cjs` which calls `repub epub` per book. Output: `book.epub` and manifest with `hasEpub` only.
- **Optional done:** shiki in app deps; Next/MDX pinned via overrides; styled-jsx>react override for React 19.
