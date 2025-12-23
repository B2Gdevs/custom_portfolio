# Monorepo Architecture Plan

## Overview

Each package will be:
1. **Installable as a library**: `npm install @portfolio/dialogue-forge`
2. **Executable via npx**: `npx @portfolio/dialogue-forge` (runs demo)
3. **Standalone demo included**: Demo app bundled with package

## Structure

```
portfolio-v2/
├── apps/
│   └── portfolio/              # Main portfolio site (moved from root)
├── packages/
│   ├── dialogue-forge/        # Library code
│   │   ├── src/               # Source code
│   │   ├── demo/              # Demo Next.js app (included in package)
│   │   ├── bin/               # Executable script for npx
│   │   └── package.json       # With "bin" entry
│   └── [future-packages]/
├── packages-shared/
│   ├── server-template/       # Reusable Next.js demo server template
│   │   ├── components/        # Branded layout, nav, footer
│   │   ├── app/               # Next.js app structure
│   │   └── package.json
│   └── branding/              # Shared branding assets
└── package.json               # Root workspace config
```

## Package Structure

Each package (`packages/dialogue-forge/package.json`):
```json
{
  "name": "@portfolio/dialogue-forge",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "dialogue-forge": "./bin/dialogue-forge.js"
  },
  "files": [
    "dist",
    "demo",
    "bin",
    "README.md"
  ]
}
```

## Execution Flow

1. User runs: `npx @portfolio/dialogue-forge`
2. npx downloads package (if not installed)
3. Executes `bin/dialogue-forge.js`
4. Script starts Next.js dev server in `demo/` directory
5. Demo uses shared server template for branding
6. Demo imports library from `../dist` or `../src`

## Shared Server Template

The `packages-shared/server-template` provides:
- Branded header/nav with your logo
- Footer with links to portfolio, docs, etc.
- Consistent styling
- Auto-discovery of package features
- Marketing sections

Packages depend on it: `"@portfolio/server-template": "workspace:*"`

## Benefits

✅ **Immediate execution**: `npx @portfolio/dialogue-forge` works instantly
✅ **No setup required**: Demo bundled, dependencies included
✅ **Consistent branding**: Update template once, all packages update
✅ **Easy publishing**: Standard npm publish workflow
✅ **Library + Demo**: Same package, dual purpose

