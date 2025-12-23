# Quick Commands Reference

## 🔐 First Time Setup

```bash
# 1. Authenticate GitHub CLI
gh auth login

# 2. Authenticate npm
npm login

# 3. Verify setup
npm run package:check
```

## 📦 Package Management

### Create New Package Repo

```bash
# Using npm script
npm run package:setup <package-name> "Description"

# Or directly
./scripts/setup-package-repo.sh <package-name> "Description"
```

**Example:**
```bash
npm run package:setup my-package "My awesome package"
```

### Publish Package

```bash
# Using npm script
npm run package:publish <package-name> [patch|minor|major]

# Or directly
./scripts/publish-package.sh <package-name> patch
```

**Example:**
```bash
npm run package:publish dialogue-forge patch
```

### Complete Workflow

```bash
# Build, sync, and publish
npm run package:workflow <package-name>

# Or specific action
npm run package:workflow <package-name> sync
```

**Example:**
```bash
npm run package:workflow dialogue-forge
```

## 🔄 Common Workflows

### Update and Publish Package

```bash
# 1. Make changes in packages/<package-name>/

# 2. Run complete workflow
npm run package:workflow <package-name>

# Or step by step:
cd packages/<package-name>
npm run build
./sync-to-repo.sh
cd ../..
npm run package:publish <package-name> patch
```

### Just Sync to GitHub

```bash
cd packages/<package-name>
./sync-to-repo.sh
```

### Just Build

```bash
cd packages/<package-name>
npm run build
```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run package:check` | Check authentication status |
| `npm run package:setup <name>` | Create GitHub repo for package |
| `npm run package:publish <name>` | Publish package to npm |
| `npm run package:workflow <name>` | Run complete workflow |

## 🎯 Examples

### Setup dialogue-forge (already done)

```bash
npm run package:setup dialogue-forge "Visual dialogue editor"
```

### Publish dialogue-forge update

```bash
# After making changes
npm run package:workflow dialogue-forge
```

### Create and publish new package

```bash
# 1. Create package files in packages/my-package/
# 2. Setup repo
npm run package:setup my-package "My new package"
# 3. Build and publish
npm run package:workflow my-package
```

