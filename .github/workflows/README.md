# GitHub Actions Workflows

## Monorepo Workflows

### `sync-packages.yml`

Automatically syncs package changes from monorepo to their individual GitHub repos when:
- Changes are pushed to `main` branch
- Files in `packages/**` are modified

**What it does:**
1. Detects which packages changed
2. Syncs each package to its GitHub repo
3. Commits and pushes to package repo's main branch

**Setup:**
- Uses `GITHUB_TOKEN` (automatically provided)
- No additional secrets needed

## Package Repo Workflows

### `publish.yml` (Template)

Automatically publishes package to npm when:
- Changes are pushed to `main` branch
- Package files (`package.json`, `src/**`, `dist/**`) are modified
- Manually triggered via `workflow_dispatch`

**What it does:**
1. Builds the package
2. Optionally bumps version (if specified)
3. Publishes to npm
4. Creates GitHub release (if version bumped)

**Setup Required:**
1. Copy template to package: `./scripts/setup-package-workflow.sh <package-name>`
2. Add NPM_TOKEN secret to package repo
3. Commit and push workflow file

**Secrets:**
- `NPM_TOKEN` - Your npm publish token

## Workflow Flow

```
Monorepo (main branch)
    ↓
sync-packages.yml triggers
    ↓
Syncs to Package Repo (main branch)
    ↓
publish.yml triggers
    ↓
Publishes to NPM
```

## Manual Triggers

### Sync Packages

```bash
# From monorepo
gh workflow run sync-packages.yml
```

### Publish Package

```bash
# From package repo or via GitHub UI
gh workflow run publish.yml -f version_bump=patch
```

## Adding New Packages

1. Create package in monorepo
2. Run: `./scripts/setup-package-repo.sh <package-name>`
3. This automatically:
   - Creates GitHub repo
   - Copies workflow template
   - Sets up git remote
4. Add NPM_TOKEN secret: `./scripts/setup-npm-token.sh <package-name>`
5. Commit and push workflow

## Troubleshooting

### Sync not working

- Check that workflow file exists in `.github/workflows/`
- Verify `GITHUB_TOKEN` has repo access
- Check workflow runs in Actions tab

### Publish not working

- Verify `NPM_TOKEN` secret exists in package repo
- Check token has publish permissions
- Verify package.json has correct name and version

