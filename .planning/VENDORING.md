# Vendoring Koodo Reader and Kookit

- **Kookit:** [B2Gdevs/kookit](https://github.com/B2Gdevs/kookit) – rendering engine (EPUB, PDF, MD, etc.). Vendored at `vendor/kookit`.
- **Koodo Reader:** [B2Gdevs/koodo-reader](https://github.com/B2Gdevs/koodo-reader) – desktop ebook app. Vendored at `vendor/koodo-reader`.

We push to **this repo** and to **vendored repos**. We maintain **forks** of kookit and koodo-reader (e.g. `MagicbornStudios/kookit`, `MagicbornStudios/koodo-reader`) so we can push our patches. `.gitmodules` is updated to point to the fork URLs; upstream (B2Gdevs) remains the source for pulling updates.

## Submodules

- `vendor/kookit` and `vendor/koodo-reader` are git submodules. After clone, run:
  ```bash
  git submodule update --init --recursive
  ```
- Fork URLs: `.gitmodules` points to B2Gdevs (our forks).
- To update submodule from remote: `git submodule update --remote vendor/kookit` (or `vendor/koodo-reader`).

## Our changes in Kookit

- **RepubRender:** `vendor/kookit/src/renders/RepubRender.ts` – unpacks .repub (ZIP), rewrites asset refs to blob URLs, builds a single-section book and renders via `GeneralRender`/iframe. Exported from `vendor/kookit/src/index.ts`.
- **Build output:** `rollup.config.js` was changed to output to `vendor/kookit/dist/` instead of a hardcoded `D:\Project\koodo-reader` path so the package builds in this repo.

## Wiring Koodo Reader to .repub

When `vendor/koodo-reader` is checked out (submodule init):

1. In the Koodo Reader app, find where supported file extensions or format types are defined (e.g. `.epub`, `.pdf`).
2. Add `.repub` to the list and map it to format `"REPUB"` (or the key Koodo uses to select a renderer).
3. Where the app instantiates a kookit render (e.g. `new EpubRender(buffer, config)`), add a branch for `.repub` / REPUB that uses `new RepubRender(buffer, config)` and then `renderTo(element)`.

The portfolio uses the in-app EPUB reader only; .repub is for Koodo Reader (desktop) when wired. Koodo is the desktop app we extend to open .repub files.
