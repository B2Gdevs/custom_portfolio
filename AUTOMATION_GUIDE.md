# Package Automation Guide

This guide explains how to use the automation scripts to manage packages, create GitHub repos, and publish to npm - all from local commands.

## 🔐 Authentication Setup

### 1. GitHub CLI Authentication

```bash
# Install GitHub CLI (if not installed)
brew install gh  # macOS
# or visit: https://cli.github.com/

# Authenticate
gh auth login

# Verify
gh auth status
```

This stores your GitHub token securely in your system keychain.

### 2. NPM Authentication

```bash
# Login to npm
npm login

# Verify
npm whoami
```

This stores your npm token in `~/.npmrc`.

## 📦 Available Scripts

### Setup Environment Check

```bash
./scripts/setup-env.sh
```

Checks if GitHub CLI and npm are authenticated.

### Create Package Repository

```bash
./scripts/setup-package-repo.sh <package-name> [description]
```

**Example:**
```bash
./scripts/setup-package-repo.sh dialogue-forge "Visual dialogue editor"
```

**What it does:**
- Creates GitHub repo: `MagicbornStudios/<package-name>`
- Initializes git in package directory
- Sets up remote
- Creates `.gitignore` and `sync-to-repo.sh`
- Makes initial commit and push

### Publish Package to NPM

```bash
./scripts/publish-package.sh <package-name> [version-bump]
```

**Version bumps:**
- `patch` (default) - 0.1.0 → 0.1.1
- `minor` - 0.1.0 → 0.2.0
- `major` - 0.1.0 → 1.0.0
- `none` - Don't bump version

**Example:**
```bash
./scripts/publish-package.sh dialogue-forge patch
```

**What it does:**
- Bumps version (if specified)
- Builds the package
- Verifies package contents
- Checks npm authentication
- Prompts for confirmation
- Publishes to npm
- Optionally syncs to GitHub

### Complete Workflow

```bash
./scripts/package-workflow.sh <package-name> [action]
```

**Actions:**
- `setup` - Create GitHub repo
- `build` - Build package
- `sync` - Sync to GitHub
- `publish` - Publish to npm
- `all` (default) - Run everything

**Example:**
```bash
# Run complete workflow
./scripts/package-workflow.sh dialogue-forge

# Or run specific action
./scripts/package-workflow.sh dialogue-forge sync
```

## 🚀 Typical Workflow

### First Time Setup (New Package)

1. **Create the package in monorepo:**
   ```bash
   # Create package directory and files
   mkdir -p packages/my-package
   # ... add package files ...
   ```

2. **Setup GitHub repo:**
   ```bash
   ./scripts/setup-package-repo.sh my-package "My package description"
   ```

3. **Build and test:**
   ```bash
   cd packages/my-package
   npm run build
   ```

4. **Publish:**
   ```bash
   ./scripts/publish-package.sh my-package patch
   ```

### Updating Existing Package

1. **Make changes in monorepo:**
   ```bash
   # Edit files in packages/my-package/
   ```

2. **Run complete workflow:**
   ```bash
   ./scripts/package-workflow.sh my-package
   ```

   Or step by step:
   ```bash
   # Build
   cd packages/my-package
   npm run build
   
   # Sync to GitHub
   ./sync-to-repo.sh
   
   # Publish
   cd ../..
   ./scripts/publish-package.sh my-package patch
   ```

## 🔒 Security Notes

### How Authentication Works

1. **GitHub CLI (`gh`):**
   - Stores token in system keychain (macOS) or credential manager
   - Token is never exposed in scripts
   - Uses `gh` command which handles auth securely

2. **NPM:**
   - Stores token in `~/.npmrc`
   - Scripts use `npm` commands which read from config
   - Token is never hardcoded

### Best Practices

- ✅ Never commit tokens or credentials
- ✅ Use `gh auth login` and `npm login` (not API keys directly)
- ✅ Scripts use environment variables when needed
- ✅ All authentication is handled by official CLI tools

### Environment Variables (Optional)

If you need additional configuration, create `.env.local`:

```bash
# .env.local (optional, not committed)
GITHUB_ORG=MagicbornStudios
NPM_SCOPE=@portfolio
```

Scripts can read these if needed, but default behavior works without them.

## 📋 Script Details

### `setup-package-repo.sh`

- Uses GitHub CLI to create repos
- No API keys needed (uses `gh` auth)
- Creates all necessary files
- Sets up git remote

### `publish-package.sh`

- Uses npm CLI (reads from `~/.npmrc`)
- Handles version bumping
- Builds before publishing
- Prompts for confirmation

### `package-workflow.sh`

- Orchestrates all steps
- Can run individual actions
- Handles errors gracefully

## 🐛 Troubleshooting

### "GitHub CLI not authenticated"

```bash
gh auth login
gh auth status
```

### "npm not authenticated"

```bash
npm login
npm whoami
```

### "Repository already exists"

The script will continue and just update the remote. This is fine if you're re-running setup.

### "Permission denied"

Make sure scripts are executable:
```bash
chmod +x scripts/*.sh
```

## 🔄 Integration with Monorepo

These scripts are designed to work within the monorepo:

- Packages stay in `packages/` directory
- Each package has its own git repo (nested)
- Monorepo tracks all packages
- Package repos are for distribution only

## 📚 Related Documentation

- [PACKAGE_SYNC_WORKFLOW.md](PACKAGE_SYNC_WORKFLOW.md) - Manual sync workflow
- [PUBLISHING_READY.md](PUBLISHING_READY.md) - Publishing checklist
- [packages/dialogue-forge/PUBLISHING.md](packages/dialogue-forge/PUBLISHING.md) - Package-specific guide

