# Monorepo Implementation Guide

## ✅ What's Been Set Up

### 1. Workspace Configuration
- Root `package.json` configured with npm workspaces
- Workspaces: `apps/*`, `packages/*`, `packages-shared/*`

### 2. Shared Server Template
- Location: `packages-shared/server-template/`
- Provides branded layout, header, footer
- Reusable across all package demos
- Update once, all packages get the update

### 3. Dialogue Forge Package
- **Library code**: `packages/dialogue-forge/src/`
- **Demo app**: `packages/dialogue-forge/demo/`
- **Executable**: `packages/dialogue-forge/bin/dialogue-forge.js`
- **Package.json**: Updated with `bin` entry and `files` array

## 🚀 How It Works

### For Users (After Publishing)

```bash
# Install the package
npm install @portfolio/dialogue-forge

# Run the demo immediately
npx @portfolio/dialogue-forge
```

The `npx` command:
1. Downloads package if not installed
2. Executes `bin/dialogue-forge.js`
3. Script checks for dependencies in `demo/` directory
4. Installs if needed, then starts Next.js dev server
5. Opens demo at `http://localhost:3000`

### For Development

```bash
# Install all workspace dependencies
npm install

# Run portfolio app
npm run dev
# or
cd apps/portfolio && npm run dev

# Run dialogue-forge demo locally
cd packages/dialogue-forge/demo
npm run dev
```

## 📦 Package Structure

Each package follows this structure:

```
packages/[package-name]/
├── src/                    # Library source code
├── dist/                   # Built library (published)
├── demo/                   # Demo Next.js app (published)
│   ├── app/
│   ├── components/
│   ├── package.json
│   └── ...
├── bin/                    # Executable script (published)
│   └── [package-name].js
├── package.json            # With "bin" entry
└── README.md
```

## 🔧 Next Steps

### 1. Portfolio App Structure

The portfolio app is now located in `apps/portfolio/` and uses workspace package imports:
```tsx
// ✅ Current (in apps/portfolio/app/dialogue-forge/page.tsx)
import { DialogueEditorV2 } from '@portfolio/dialogue-forge/src/components/DialogueEditorV2';
```

**Note**: Using source imports (`/src/`) during development. After building, can use `@portfolio/dialogue-forge` directly.

### 2. Build Dialogue Forge

```bash
cd packages/dialogue-forge
npm run build
```

This creates the `dist/` directory that will be published.

### 3. Test the Demo Locally

```bash
cd packages/dialogue-forge/demo
npm install
npm run dev
```

### 4. Test npx Execution

```bash
# From root, test the bin script
node packages/dialogue-forge/bin/dialogue-forge.js
```

### 5. Set Up Publishing

1. **Create `.npmignore`** in `packages/dialogue-forge/`:
```
src/
node_modules/
*.test.ts
*.test.tsx
tsconfig.json
vitest.config.ts
```

2. **Set up Changesets** (optional but recommended):
```bash
npm install -D @changesets/cli
npx changeset init
```

3. **Publish**:
```bash
cd packages/dialogue-forge
npm publish --access public
```

## 🎨 Customizing the Server Template

To update branding across all packages:

1. Edit `packages-shared/server-template/components/BrandedLayout.tsx`
2. Update logo, colors, links
3. All package demos will use the updated template

## 📝 Creating New Packages

1. Copy `packages/dialogue-forge/` structure
2. Update package name in `package.json`
3. Create `bin/[package-name].js` (copy from dialogue-forge)
4. Update demo app to showcase your package
5. Add to workspace in root `package.json`

## ⚠️ Important Notes

- **Demo dependencies**: The demo's `package.json` must include all dependencies needed to run
- **Workspace protocol**: Use `"@portfolio/server-template": "workspace:*"` in demo package.json
- **Transpilation**: Next.js config includes `transpilePackages` for workspace packages
- **File inclusion**: `package.json` `files` array controls what gets published

## 🔍 Troubleshooting

### "Demo directory not found"
- Make sure `demo/` is in the `files` array in package.json
- Check that demo directory exists in published package

### "Module not found" in demo
- Ensure workspace dependencies are installed: `npm install`
- Check that demo's package.json has correct workspace references

### npx doesn't work
- Verify `bin` entry in package.json
- Check that bin script is executable: `chmod +x bin/*.js`
- Ensure script has shebang: `#!/usr/bin/env node`

