# Next Steps - After Monorepo Migration

## ✅ Completed

- Portfolio app migrated to `apps/portfolio/`
- Monorepo structure created with workspaces
- Package imports updated
- Documentation updated
- Changes committed and pushed

## 🚀 Immediate Next Steps

### 1. Install Workspace Dependencies

```bash
npm install
```

This will install dependencies for all workspaces (portfolio app, packages, shared resources).

### 2. Test Portfolio App

```bash
# From root
npm run dev

# Or from app directory
cd apps/portfolio
npm run dev
```

Visit `http://localhost:3000` and verify:
- [ ] Portfolio loads correctly
- [ ] Dialogue Forge page works (`/dialogue-forge`)
- [ ] No import errors in console
- [ ] All pages render correctly

### 3. Test Package Demo

```bash
cd packages/dialogue-forge/demo
npm install
npm run dev
```

Visit `http://localhost:3000` and verify the demo works.

### 4. Build Dialogue Forge Package

```bash
cd packages/dialogue-forge
npm run build
```

This creates the `dist/` directory needed for publishing.

## 📦 Publishing Workflow

### Before First Publish

1. **Set npm user** (if not already):
   ```bash
   npm login
   ```
   Your npm user: [@magicborn](https://www.npmjs.com/~magicborn)

2. **Create `.npmignore`** in `packages/dialogue-forge/`:
   ```
   src/
   node_modules/
   *.test.ts
   *.test.tsx
   tsconfig.json
   vitest.config.ts
   .git/
   ```

3. **Update package.json** with proper version:
   ```json
   {
     "version": "0.1.0"
   }
   ```

### Publishing

```bash
cd packages/dialogue-forge
npm publish --access public
```

### After Publishing

Users can run:
```bash
npx @portfolio/dialogue-forge
```

## 🔧 Package Development

### Creating New Packages

1. Copy structure from `packages/dialogue-forge/`
2. Update `package.json`:
   - Change name to `@portfolio/[new-package-name]`
   - Update description
   - Update `bin` entry if needed
3. Create `bin/[package-name].js` (copy from dialogue-forge)
4. Build demo app in `demo/` directory
5. Test locally before publishing

### Updating Shared Template

To update branding across all packages:

1. Edit `packages-shared/server-template/components/BrandedLayout.tsx`
2. Make changes (logo, colors, links, etc.)
3. All package demos will use the updated template

## 📚 Documentation

- [README.md](README.md) - Main readme
- [MONOREPO_README.md](MONOREPO_README.md) - Monorepo overview
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Implementation details
- [QUICK_START.md](QUICK_START.md) - Quick reference
- [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md) - Migration details

## 🐛 Troubleshooting

### "Module not found" errors

- Run `npm install` from root to install all workspace dependencies
- Check that `apps/portfolio/package.json` has `@portfolio/dialogue-forge: "workspace:*"`

### Portfolio app won't start

- Make sure you're in `apps/portfolio/` or using `npm run dev` from root
- Check that `apps/portfolio/package.json` exists and has all dependencies

### Package imports not working

- Verify `apps/portfolio/tsconfig.json` has `@portfolio/*` paths
- Check `apps/portfolio/next.config.mjs` has `transpilePackages: ['@portfolio/dialogue-forge']`

## 🎯 Goals Achieved

✅ Portfolio is now an app in the monorepo
✅ Packages can be published and run via npx
✅ Shared server template for consistent branding
✅ Easy to create new packages
✅ All documentation updated

