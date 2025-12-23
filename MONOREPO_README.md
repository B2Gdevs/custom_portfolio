# Monorepo Overview

This is a monorepo containing:

1. **Portfolio App** (`apps/portfolio/`) - Your main portfolio website
2. **Packages** (`packages/*/`) - Publishable npm packages
3. **Shared Resources** (`packages-shared/*/`) - Reusable templates and utilities

## Structure

```
portfolio-v2/
├── apps/
│   └── portfolio/              # Main portfolio site
│       ├── app/               # Next.js app directory
│       ├── components/        # React components
│       ├── content/           # MDX/Markdown files
│       ├── lib/               # Utilities
│       └── package.json       # App dependencies
│
├── packages/
│   └── dialogue-forge/        # Dialogue editor package
│       ├── src/               # Library source code
│       ├── demo/              # Standalone demo app
│       ├── bin/               # npx executable
│       └── package.json       # Package config
│
└── packages-shared/
    └── server-template/       # Reusable demo server
        ├── components/        # Branded layout components
        └── app/               # Next.js template structure
```

## Workspace Configuration

The root `package.json` uses npm workspaces:

```json
{
  "workspaces": [
    "apps/*",
    "packages/*",
    "packages-shared/*"
  ]
}
```

## Running Apps

### Portfolio App

```bash
# From root
npm run dev

# Or from app directory
cd apps/portfolio
npm run dev
```

### Package Demos

```bash
# Development
cd packages/dialogue-forge/demo
npm run dev

# After publishing (for users)
npx @portfolio/dialogue-forge
```

## Package Development

### Creating a New Package

1. Copy structure from `packages/dialogue-forge/`
2. Update `package.json` with new name
3. Create `bin/[package-name].js` executable
4. Build demo app in `demo/` directory
5. Add to workspace (already configured)

### Building Packages

```bash
cd packages/[package-name]
npm run build
```

### Publishing

```bash
cd packages/[package-name]
npm publish --access public
```

**Note:** Packages are published under `@portfolio` scope by [@magicborn](https://www.npmjs.com/~magicborn)

## Shared Resources

### Server Template

The `packages-shared/server-template` provides:
- Branded header/nav
- Footer with links
- Consistent styling
- Next.js app structure

Update the template once, and all package demos get the update.

## Documentation

- [README.md](README.md) - Main readme
- [MONOREPO_PLAN.md](MONOREPO_PLAN.md) - Architecture plan
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Implementation details
- [QUICK_START.md](QUICK_START.md) - Quick reference

