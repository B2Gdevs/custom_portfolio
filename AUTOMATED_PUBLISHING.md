# Automated Publishing Workflow

## Overview

This setup ensures that:
1. **Monorepo main** → Syncs to **Package repo main**
2. **Package repo main** → Automatically publishes to **NPM**

All publishing happens automatically when you push to main branches.

## Workflow Architecture

```
┌─────────────────┐
│  Monorepo Main  │
│  (Development)  │
└────────┬────────┘
         │
         │ Push to main
         ↓
┌─────────────────────────┐
│  sync-packages.yml      │
│  (GitHub Actions)       │
└────────┬────────────────┘
         │
         │ Syncs package
         ↓
┌─────────────────┐
│ Package Repo    │
│ Main Branch     │
└────────┬────────┘
         │
         │ Push to main
         ↓
┌─────────────────────────┐
│  publish.yml            │
│  (GitHub Actions)       │
└────────┬────────────────┘
         │
         │ Publishes
         ↓
┌─────────────────┐
│      NPM        │
│   Published     │
└─────────────────┘
```

## Setup Steps

### 1. Initial Package Setup

```bash
# Create package repo with workflow
./scripts/setup-package-repo.sh dialogue-forge "Description"
```

This automatically:
- Creates GitHub repo
- Copies publish workflow template
- Sets up git remote

### 2. Add NPM Token to GitHub

```bash
# Automated way
./scripts/setup-npm-token.sh dialogue-forge

# Or manually:
# 1. Create token: npm token create
# 2. Go to: https://github.com/MagicbornStudios/dialogue-forge/settings/secrets/actions
# 3. Add secret: NPM_TOKEN
```

### 3. Commit and Push Workflow

```bash
cd packages/dialogue-forge
git add .github/workflows/publish.yml
git commit -m "Add automated publish workflow"
git push origin main
```

## How It Works

### From Monorepo

When you push to monorepo main:

1. **sync-packages.yml** triggers
2. Detects changed packages
3. Syncs each package to its GitHub repo
4. Commits and pushes to package repo main

### From Package Repo

When package repo main is updated (by sync or direct push):

1. **publish.yml** triggers
2. Builds the package
3. Publishes to npm
4. Creates GitHub release (if version bumped)

## Usage

### Normal Development Flow

```bash
# 1. Make changes in monorepo
cd packages/dialogue-forge
# ... edit files ...

# 2. Commit to monorepo
cd ../..
git add packages/dialogue-forge
git commit -m "Update dialogue-forge"
git push origin main

# 3. Automatic sync happens via GitHub Actions
# 4. Automatic publish happens via GitHub Actions
```

### Manual Sync (if needed)

```bash
cd packages/dialogue-forge
./sync-to-repo.sh
```

This pushes to package repo main, which triggers automatic publish.

### Manual Publish (with version bump)

```bash
# Via GitHub CLI
gh workflow run publish.yml -R MagicbornStudios/dialogue-forge -f version_bump=patch

# Or via GitHub UI
# Go to Actions → Publish Package → Run workflow
```

## Version Management

### Automatic Version Bump

When manually triggering publish workflow, you can specify:
- `patch` - 0.1.0 → 0.1.1
- `minor` - 0.1.0 → 0.2.0
- `major` - 0.1.0 → 1.0.0

### Manual Version Update

If you want to update version in monorepo first:

```bash
cd packages/dialogue-forge
npm version patch  # or minor, major
git add package.json
git commit -m "Bump version"
git push
```

The sync will pick up the version change and publish it.

## Monitoring

### Check Sync Status

```bash
# View monorepo workflow runs
gh run list --workflow=sync-packages.yml

# View package workflow runs
gh run list -R MagicbornStudios/dialogue-forge --workflow=publish.yml
```

### View Workflow Logs

```bash
# Monorepo sync logs
gh run view <run-id> --workflow=sync-packages.yml

# Package publish logs
gh run view <run-id> -R MagicbornStudios/dialogue-forge --workflow=publish.yml
```

## Troubleshooting

### Sync Not Triggering

- Check that files in `packages/**` were actually changed
- Verify workflow file exists: `.github/workflows/sync-packages.yml`
- Check Actions tab in monorepo

### Publish Not Triggering

- Verify workflow exists in package repo: `.github/workflows/publish.yml`
- Check NPM_TOKEN secret is set
- Verify token has publish permissions
- Check Actions tab in package repo

### Version Not Bumping

- Version bump only happens on manual trigger with `version_bump` input
- Automatic sync/publish uses existing version
- To bump version, either:
  - Update in monorepo before sync
  - Manually trigger workflow with version_bump input

## Best Practices

1. **Always commit to monorepo first** - Let sync handle package repo
2. **Use semantic versioning** - Update version before major releases
3. **Test before pushing** - Run `npm run build` locally first
4. **Monitor Actions** - Check workflow runs after pushing
5. **Keep secrets secure** - Never commit tokens

## Adding New Packages

1. Create package in monorepo
2. Run: `./scripts/setup-package-repo.sh <package-name>`
3. Add NPM_TOKEN: `./scripts/setup-npm-token.sh <package-name>`
4. Update `sync-packages.yml` matrix with new package
5. Commit and push

The new package will automatically sync and publish!

