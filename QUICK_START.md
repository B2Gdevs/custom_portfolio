# Quick Start Guide

## 🎯 The Goal

Users can run your packages immediately with zero setup:

```bash
npx @portfolio/dialogue-forge
```

This downloads the package, installs dependencies, and starts a branded demo server.

## 📁 What's Been Created

### Monorepo Structure
```
portfolio-v2/
├── apps/
│   └── portfolio/          # Main portfolio site
├── packages-shared/
│   └── server-template/     # Reusable branded demo server
├── packages/
│   └── dialogue-forge/
│       ├── src/             # Library code
│       ├── demo/            # Demo app (bundled with package)
│       └── bin/             # npx executable script
└── package.json            # Workspace config
```

### Key Files

1. **`packages/dialogue-forge/package.json`**
   - Added `"bin"` entry for npx execution
   - Added `demo/` and `bin/` to `files` array

2. **`packages/dialogue-forge/bin/dialogue-forge.js`**
   - Executable script that starts the demo server
   - Handles dependency installation automatically

3. **`packages/dialogue-forge/demo/`**
   - Complete Next.js app showcasing the library
   - Uses shared server template for branding

4. **`packages-shared/server-template/`**
   - Reusable components (BrandedLayout, etc.)
   - Update once, all packages get the update

## 🚀 Testing Locally

### 1. Install Workspace Dependencies
```bash
npm install
```

### 2. Test the Demo
```bash
cd packages/dialogue-forge/demo
npm install
npm run dev
```

Visit `http://localhost:3000` to see the demo.

### 3. Test npx Execution
```bash
# From root directory
node packages/dialogue-forge/bin/dialogue-forge.js
```

This simulates what happens when someone runs `npx @portfolio/dialogue-forge`.

## 📦 Publishing

### Before Publishing

1. **Build the library**:
```bash
cd packages/dialogue-forge
npm run build
```

2. **Create `.npmignore`** (optional, but recommended):
```
src/
node_modules/
*.test.ts
*.test.tsx
tsconfig.json
vitest.config.ts
```

3. **Test the package locally**:
```bash
cd packages/dialogue-forge
npm pack
```

This creates a `.tgz` file you can test installing.

### Publishing

```bash
cd packages/dialogue-forge
npm publish --access public
```

After publishing, users can:
```bash
npx @portfolio/dialogue-forge
```

## 🎨 Updating Branding

To update branding across all packages:

1. Edit `packages-shared/server-template/components/BrandedLayout.tsx`
2. Update logo, colors, links, etc.
3. All package demos automatically use the updated template

## ➕ Creating New Packages

1. Copy the structure from `packages/dialogue-forge/`
2. Update package name in `package.json`
3. Create `bin/[package-name].js` (copy from dialogue-forge and update paths)
4. Customize the demo app
5. Build and publish

## ✅ What Works Now

- ✅ Monorepo workspace configuration
- ✅ Shared server template with branding
- ✅ Dialogue Forge demo app structure
- ✅ npx executable script
- ✅ Package.json configured for publishing

## 🔜 Next Steps

1. **Fix portfolio app imports** - Update `app/dialogue-forge/page.tsx` to use package imports
2. **Build dialogue-forge** - Run `npm run build` in the package
3. **Test everything** - Make sure demo works end-to-end
4. **Publish** - When ready, publish to npm

## 💡 Key Benefits

- **Zero setup for users**: `npx` handles everything
- **Consistent branding**: Update template once, all packages update
- **Easy publishing**: Standard npm workflow
- **Standalone demos**: Each package can run independently
- **Marketing ready**: Professional branded demos out of the box

