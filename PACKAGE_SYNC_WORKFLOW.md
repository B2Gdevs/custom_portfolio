# Package Sync Workflow

## Overview

Each package in the monorepo has its own GitHub repository under the `MagicbornStudios` organization. This allows for:
- Independent versioning and releases
- Separate issue tracking
- Community contributions
- Clear package boundaries

## Repository Structure

```
portfolio-v2/                    # Monorepo (main development)
├── packages/
│   └── dialogue-forge/         # Package code
│       └── .git/               # Package's own git repo
│
MagicbornStudios/                # GitHub organization
└── dialogue-forge/              # Package's GitHub repo
```

## Workflow

### 1. Development in Monorepo

All development happens in the monorepo:
- Edit code in `packages/dialogue-forge/`
- Test locally
- Commit to monorepo

### 2. Sync to Package Repo

When ready to sync to the package's own repo:

```bash
cd packages/dialogue-forge
npm run sync
```

Or manually:
```bash
cd packages/dialogue-forge
git add -A
git commit -m "Update package from monorepo"
git push origin main
```

### 3. Publish to NPM

After syncing to GitHub:

```bash
cd packages/dialogue-forge
npm run build
npm publish --access public
```

## Setting Up a New Package Repo

### 1. Create GitHub Repository

1. Go to https://github.com/organizations/MagicbornStudios/repositories/new
2. Name: `[package-name]`
3. Description: Package description
4. Visibility: Public (for npm packages)
5. Don't initialize with README (we'll sync from monorepo)

### 2. Initialize Package Git Repo

```bash
cd packages/[package-name]
git init
git remote add origin https://github.com/MagicbornStudios/[package-name].git
```

### 3. Create Sync Script

Copy `packages/dialogue-forge/sync-to-repo.sh` and update:
- Package name
- Repository URL

### 4. Initial Push

```bash
cd packages/[package-name]
git add -A
git commit -m "Initial commit: [package-name] package"
git branch -M main
git push -u origin main
```

## Sync Script

Each package has a `sync-to-repo.sh` script that:
1. Checks git is initialized
2. Adds/updates remote origin
3. Stages all changes
4. Commits with standard message
5. Pushes to GitHub

**Usage:**
```bash
cd packages/[package-name]
./sync-to-repo.sh
```

## Best Practices

### When to Sync

- After significant feature additions
- Before publishing to npm
- When you want to create a GitHub release
- When you need separate issue tracking

### Commit Messages

Use descriptive commit messages:
- "Add feature X"
- "Fix bug Y"
- "Update dependencies"
- "Prepare for v0.2.0 release"

### Version Management

- Update version in `package.json` before publishing
- Tag releases in both monorepo and package repo
- Use semantic versioning

## Package Repositories

| Package | GitHub Repo | NPM Package |
|---------|-------------|-------------|
| dialogue-forge | [MagicbornStudios/dialogue-forge](https://github.com/MagicbornStudios/dialogue-forge) | `@portfolio/dialogue-forge` |

## Troubleshooting

### Remote Already Exists

If you get "remote origin already exists":
```bash
git remote set-url origin https://github.com/MagicbornStudios/[package-name].git
```

### Authentication Issues

Ensure you have:
- GitHub authentication set up
- Push access to `MagicbornStudios` organization
- Proper SSH keys or token configured

### Sync Conflicts

If the package repo has changes not in monorepo:
1. Pull from package repo: `git pull origin main`
2. Resolve conflicts
3. Push back to package repo
4. Consider if monorepo needs updates

