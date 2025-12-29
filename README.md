# Portfolio V2 - Monorepo

A monorepo containing a sleek portfolio site and publishable npm packages. Built with Next.js, MDX, SQLite, and Drizzle ORM. This README explains project structure, how to run the portfolio and package demos, and how to develop and publish packages.

## 🏗️ Monorepo Structure

This repository is a monorepo that groups the main portfolio application and related packages (libraries and demos). The layout is intentionally simple so package demos can be run locally and packages can be published independently.

```
custom_portfolio/
├── apps/
│   └── portfolio/          # Main Next.js portfolio application (apps/portfolio)
├── packages/
│   └── dialogue-forge/     # Visual dialogue editor package (library + demo + bin)
│       ├── src/            # Library source (TypeScript)
│       ├── demo/           # Standalone demo app (Next/Vite)
│       └── bin/            # CLI entry (dialogue-forge)
└── packages-shared/
    └── server-template/    # Reusable demo server template used by package demos
```

Notes:
- Packages are normal npm packages — each has its own package.json and scripts.
- The dialogue-forge package name is @magicborn/dialogue-forge (see packages/dialogue-forge/package.json).

## 🚀 Quick Start

### Install root dependencies

From the repository root run:

```bash
npm install
```

### Setup git hooks (recommended)

After cloning, set up git hooks for automatic package syncing:

```bash
npm run setup
# or
./scripts/setup-git-hooks.sh
```

This installs a post-push hook that automatically syncs changed packages to their GitHub repos when you push to `main`. See [MONOREPO_SYNC.md](./MONOREPO_SYNC.md) for details.

This installs dependencies for the workspace. If you use pnpm or yarn workspaces, you can use those instead (pnpm install, yarn install).

### Run the Portfolio App (local dev)

```bash
# From root (workspace-aware)
npm run dev
# or run directly in the app folder
cd apps/portfolio && npm install && npm run dev
```

Visit http://localhost:3000 to see the portfolio.

### Run Package Demos (Dialogue Forge)

There are two common ways to run the Dialogue Forge demo: locally from the monorepo, or via the package's published CLI/bin. The package.json for dialogue-forge contains the authoritative scripts.

Local (recommended for development):

```bash
# From the package demo directory
cd packages/dialogue-forge/demo && npm install && npm run dev

# Or using the package's dev script from the package root which runs the demo:
cd packages/dialogue-forge && npm install && npm run dev
```

Published / installed usage (when the package is published to npm):

The dialogue-forge package is published under the @magicborn scope (package.json: "name": "@magicborn/dialogue-forge"). When published, the package exposes a CLI binary named "dialogue-forge" (see the "bin" field in package.json). You can run the CLI demo with npx:

```bash
# Run the CLI/demo via npx (will download from npm if not installed locally)
npx @magicborn/dialogue-forge
# or (npx may resolve the bin name directly):
npx dialogue-forge
```

If you want to install the library into another project:

```bash
npm install @magicborn/dialogue-forge
```

And import it in code:

```tsx
import { DialogueEditorV2 } from '@magicborn/dialogue-forge';
```

(See packages/dialogue-forge/README.md for package-specific usage and API docs.)

## 📦 Packages

Each package lives in packages/ and has its own package.json. The dialogue-forge package includes:
- name: @magicborn/dialogue-forge
- bin: dialogue-forge -> bin/dialogue-forge.js
- dev script: "dev" runs the demo (cd demo && npm install && npm run dev)
- build script: builds TypeScript outputs to dist/

When developing packages locally you can either run their demo directly (cd packages/<pkg>/demo) or use your package manager's workspace filters:

```bash
# npm (workspaces-aware) from repo root to run a package script:
npm --workspace=@magicborn/dialogue-forge run dev
# or with pnpm (filter):
pnpm --filter @magicborn/dialogue-forge dev
```

## 🔧 Development Scripts

Common scripts available from the repository or package roots:

- npm run dev — run the portfolio app in development (workspace root or apps/portfolio)
- npm run build — build the portfolio (and packages if scripted)
- npm run lint — run linters (if configured)

Package-level examples (packages/dialogue-forge):

```bash
cd packages/dialogue-forge
npm run build       # build the library (tsc -> dist)
npm run dev         # runs the demo: cd demo && npm install && npm run dev
npm run test        # run tests (vitest)
```

## 📝 Publishing

Packages are published to npm under their scopes as declared in each package.json. For this repo the dialogue-forge package uses the @magicborn scope. Before publishing, ensure:

1. package.json has correct name, version, and publishConfig (access/registry)
2. You have an NPM_TOKEN secret configured on the CI/publishing environment
3. Run the package build locally: cd packages/dialogue-forge && npm run build

Example publish steps (manual):

```bash
cd packages/dialogue-forge
npm publish --access public
```

The repo contains workflow templates to automate package sync and publishing; see .github/workflows/README.md for details.

## Database Commands

```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

## Admin Interface

The admin interface is only available in development for security. Access it at /admin when running the dev server.

## Content Management

Add content as Markdown/MDX files under content/docs, content/projects, or content/blog. Use YAML frontmatter for metadata: 

```markdown
---
title: My Project
description: A cool project
date: 2024-01-01
tags: [react, nextjs]
---

# My Project

Content goes here...
```

## Notes and Changes in this update

- Fixed dialogue-forge install/run instructions to match packages/dialogue-forge/package.json (package name: @magicborn/dialogue-forge; dev script runs demo; bin name: dialogue-forge).
- Clarified local demo vs published usage and added workspace examples.

---

## License

MIT
