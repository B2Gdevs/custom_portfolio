# Package Manager Guide

## Current Setup: npm Workspaces

This monorepo uses **npm workspaces** which is built into npm (no extra installation needed).

### Why npm Workspaces?

- ✅ Built into npm (no extra tools)
- ✅ Simple and reliable
- ✅ Works with all npm commands
- ✅ Good for our use case

### Alternative Options

#### pnpm
- **Pros**: Faster, disk-efficient, strict dependency resolution
- **Cons**: Requires installation, different from npm
- **When to use**: If you have many packages or want stricter dependency management

#### Turborepo
- **Pros**: Fast builds, caching, task orchestration
- **Cons**: Extra dependency, more complex setup
- **When to use**: If you need advanced build caching and task pipelines

## Current Commands (npm)

All our scripts work with npm workspaces:

```bash
# Package management
npm run package:list
npm run package:status
npm run package:build
npm run package:sync
npm run package:publish

# Workspace commands
npm run dev --workspace=@portfolio/app
npm install --workspace=@portfolio/dialogue-forge
```

## If You Want to Switch

### To pnpm

1. **Install pnpm:**
   ```bash
   npm install -g pnpm
   ```

2. **Update package.json:**
   ```json
   {
     "packageManager": "pnpm@8.0.0"
   }
   ```

3. **Install dependencies:**
   ```bash
   pnpm install
   ```

4. **Update scripts:**
   - Change `npm run` to `pnpm run`
   - Change `npm install` to `pnpm install`
   - Workspace syntax: `pnpm --filter @portfolio/app dev`

### To Turborepo

1. **Install:**
   ```bash
   npm install -D turbo
   ```

2. **Create turbo.json:**
   ```json
   {
     "pipeline": {
       "build": {
         "dependsOn": ["^build"],
         "outputs": ["dist/**"]
       },
       "dev": {
         "cache": false
       }
     }
   }
   ```

3. **Update scripts:**
   ```json
   {
     "scripts": {
       "build": "turbo run build",
       "dev": "turbo run dev"
     }
   }
   ```

## Recommendation

**Stick with npm workspaces** for now because:
- ✅ Already set up and working
- ✅ No extra dependencies
- ✅ All scripts are designed for npm
- ✅ Simple and reliable

**Consider switching if:**
- You have 10+ packages
- Build times become slow
- You need advanced caching
- You want stricter dependency management

## Current Script Compatibility

All our scripts use:
- `npm` commands (works with npm workspaces)
- Standard shell scripts (work with any package manager)
- GitHub CLI (independent of package manager)

**They will work with:**
- ✅ npm (current)
- ✅ pnpm (with minor script updates)
- ✅ yarn (with minor script updates)

**For Turborepo:**
- Scripts would need updates to use `turbo` commands
- But can still use npm/pnpm for package management

## Quick Reference

### npm (Current)
```bash
npm run package:build dialogue-forge
npm install --workspace=@portfolio/app
```

### pnpm (If switched)
```bash
pnpm --filter @portfolio/dialogue-forge build
pnpm install --filter @portfolio/app
```

### turbo (If added)
```bash
turbo run build --filter=dialogue-forge
turbo run dev
```

## Conclusion

**Current setup (npm workspaces) is perfect for your needs.** No need to switch unless you encounter specific issues that pnpm or turbo would solve.

