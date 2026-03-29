# @portfolio/repub-builder

Build **RichEPub** (`.repub`) files from a Vite + React + Tailwind project. The output is a ZIP container with a manifest (`repub.json`), entry HTML, and bundled assets.

**Distribution:** This package is not published to npm. Install from this repo or from a [GitHub Release](https://github.com/MagicbornStudios/custom_portfolio/releases) tarball:

```bash
npm install https://github.com/MagicbornStudios/custom_portfolio/releases/download/repub-v{{VERSION}}/portfolio-repub-builder-{{VERSION}}.tgz
```

## Usage

From a repub project directory (with `vite.config.ts` and build output in `dist/`):

```bash
npx repub-build
# or
npx repub-build /path/to/repub-project
```

Options:

- `--skip-install` – Skip `npm install` before build
- `--skip-build` – Skip Vite build; use existing `dist/`

Output: a `.repub` file (ZIP) in the project directory.

## Programmatic API

```ts
import { buildRepub } from '@portfolio/repub-builder';

const outPath = await buildRepub({ projectDir: process.cwd() });
console.log('Built:', outPath);
```

## Format

See the [RichEPub format spec](https://github.com/MagicbornStudios/custom_portfolio/tree/main/apps/portfolio/content/docs/richepub) for the container layout and `repub.json` schema.

## Roadmap: manuscript EPUB + reader runtime

This package already powers **CLI / build-time** manuscript → EPUB for `books/<slug>/` (see repo `scripts/build-books.cjs`). **Planned:** add a **documented runtime surface** (React reader shell / workspace, optional Next.js route-handler helpers) so **`@portfolio/repub-builder`** is the single vertical for both **build** and **in-browser reading** — see [Route conventions](https://github.com/MagicbornStudios/custom_portfolio/blob/main/apps/portfolio/content/docs/documentation/route-conventions.mdx) and books decision **`BOOKS-READER-RUNTIME-REPUB-PACKAGE`**.
