# Complete Workflow Guide

## 📚 Table of Contents

1. [Initial Setup](#initial-setup)
2. [Daily Development Workflow](#daily-development-workflow)
3. [Publishing Packages](#publishing-packages)
4. [What to Expect](#what-to-expect)
5. [Troubleshooting](#troubleshooting)
6. [Quick Reference](#quick-reference)

---

## 🚀 Initial Setup

### Step 1: Authenticate Services

```bash
# Authenticate GitHub CLI
gh auth login

# Authenticate npm
npm login

# Verify authentication
npm run package:check
```

### Step 2: Setup Existing Packages

For packages that already exist (like `dialogue-forge`):

```bash
# Setup publish workflows for all packages
npm run package:workflows:all

# Setup npm tokens for all packages (one token for all)
npm run package:tokens:all

# Or setup individual package
npm run package:setup dialogue-forge
npm run package:token dialogue-forge
```

### Step 3: Verify Setup

```bash
# Check status of all packages
npm run package:status

# Or check specific package
npm run package:status dialogue-forge
```

**Expected output:**
- ✅ Git repo initialized
- ✅ Remote configured
- ✅ Publish workflow exists
- ✅ Package info displayed

---

## 💻 Daily Development Workflow

### Making Changes to a Package

1. **Edit package code:**
   ```bash
   # Edit files in packages/<package-name>/
   # No need to cd into package directory
   ```

2. **Test locally:**
   ```bash
   # Build the package
   npm run package:build <package-name>
   
   # Or build all packages
   npm run package:build
   ```

3. **Commit to monorepo:**
   ```bash
   git add packages/<package-name>
   git commit -m "Update <package-name>: description"
   git push origin main
   ```

4. **Automatic sync and publish:**
   - GitHub Actions automatically syncs to package repo
   - Package repo automatically publishes to npm
   - No manual steps needed!

### Manual Sync (if needed)

If you want to sync without waiting for the workflow:

```bash
# Sync specific package
npm run package:sync <package-name>

# Sync all packages
npm run package:sync
```

---

## 📦 Publishing Packages

### Automatic Publishing (Recommended)

**This happens automatically when you push to monorepo main!**

1. Commit changes to monorepo
2. Push to main branch
3. GitHub Actions syncs to package repo
4. Package repo automatically publishes to npm

**That's it!** No manual steps needed.

### Manual Publishing

If you need to publish manually (e.g., for version bump):

```bash
# Publish with version bump
npm run package:publish <package-name> patch   # 0.1.0 → 0.1.1
npm run package:publish <package-name> minor   # 0.1.0 → 0.2.0
npm run package:publish <package-name> major   # 0.1.0 → 1.0.0

# Or via GitHub Actions UI:
# Go to package repo → Actions → Publish Package → Run workflow
```

### Version Management

**Automatic publishing** uses the version already in `package.json`.

**To bump version before publishing:**

```bash
cd packages/<package-name>
npm version patch  # or minor, major
git add package.json
git commit -m "Bump version"
git push
```

The sync will pick up the version change and publish it.

---

## 📋 What to Expect

### When You Push to Monorepo Main

1. **Immediate:**
   - Your commit appears in monorepo
   - GitHub Actions workflow starts

2. **Within 1-2 minutes:**
   - `sync-packages.yml` runs
   - Package is synced to its GitHub repo
   - New commit appears in package repo

3. **Within 2-3 minutes:**
   - `publish.yml` runs in package repo
   - Package is built
   - Package is published to npm
   - GitHub release is created (if version changed)

### Monitoring Workflows

```bash
# View monorepo sync workflow
gh run list --workflow=sync-packages.yml

# View package publish workflow
gh run list -R MagicbornStudios/<package-name> --workflow=publish.yml

# View specific run
gh run view <run-id>
```

### Expected Timeline

```
0:00 - Push to monorepo
0:30 - Sync workflow starts
1:00 - Package synced to GitHub repo
1:30 - Publish workflow starts
2:00 - Package published to npm
2:30 - GitHub release created (if version bumped)
```

### Success Indicators

✅ **Sync successful:**
- New commit in package repo
- Commit message: "Sync from monorepo main branch [skip ci]"

✅ **Publish successful:**
- Package appears on npm
- Version matches package.json
- GitHub release created (if version bumped)

---

## 🔧 Creating New Packages

### Step 1: Create Package Structure

```bash
# Create package directory and files
mkdir -p packages/my-new-package
# ... add package files ...
```

### Step 2: Setup Package Repo

```bash
# Create GitHub repo and setup
npm run package:setup my-new-package "Description of package"
```

This automatically:
- Creates GitHub repo: `MagicbornStudios/my-new-package`
- Initializes git in package directory
- Sets up remote
- Creates `.gitignore` and `sync-to-repo.sh`
- Copies publish workflow template
- Makes initial commit and push

### Step 3: Add to Sync Workflow

Edit `.github/workflows/sync-packages.yml`:

```yaml
matrix:
  package:
    - dialogue-forge
    - my-new-package  # Add here
```

### Step 4: Setup NPM Token

```bash
# Add npm token to package repo
npm run package:token my-new-package
```

### Step 5: Commit Workflow

```bash
cd packages/my-new-package
git add .github/workflows/publish.yml
git commit -m "Add publish workflow"
git push origin main
```

### Step 6: Verify

```bash
# Check status
npm run package:status my-new-package
```

---

## 🐛 Troubleshooting

### Sync Not Working

**Symptoms:**
- No new commits in package repo after monorepo push

**Solutions:**
1. Check Actions tab in monorepo
2. Verify workflow file exists: `.github/workflows/sync-packages.yml`
3. Check package is in matrix: `.github/workflows/sync-packages.yml`
4. Verify `GITHUB_TOKEN` has permissions

**Manual sync:**
```bash
npm run package:sync <package-name>
```

### Publish Not Working

**Symptoms:**
- Package not appearing on npm
- Workflow failing

**Solutions:**
1. Check Actions tab in package repo
2. Verify `NPM_TOKEN` secret exists:
   ```bash
   gh secret list -R MagicbornStudios/<package-name>
   ```
3. Verify token has publish permissions
4. Check workflow file exists: `packages/<package-name>/.github/workflows/publish.yml`

**Manual publish:**
```bash
npm run package:publish <package-name> none
```

### Build Failures

**Symptoms:**
- Build errors in workflow logs

**Solutions:**
1. Test build locally:
   ```bash
   npm run package:build <package-name>
   ```
2. Check TypeScript errors
3. Verify dependencies are installed
4. Check `package.json` scripts

### Version Issues

**Symptoms:**
- Wrong version published
- Version not bumping

**Solutions:**
1. Check version in `package.json`
2. For automatic bump, use manual workflow trigger with `version_bump` input
3. Or update version in monorepo before sync

---

## 📖 Quick Reference

### Package Management Commands

All commands work from root directory:

```bash
# List all packages
npm run package:list

# Check package status
npm run package:status [package-name]

# Build package(s)
npm run package:build [package-name]

# Sync to GitHub
npm run package:sync [package-name]

# Publish to npm
npm run package:publish [package-name] [patch|minor|major]

# Setup new package
npm run package:setup <package-name> "Description"

# Setup npm token
npm run package:token <package-name>

# Setup workflow
npm run package:workflow <package-name>

# Setup all tokens
npm run package:tokens:all

# Setup all workflows
npm run package:workflows:all
```

### Workflow Commands

```bash
# Check environment
npm run package:check

# View workflow runs
gh run list --workflow=sync-packages.yml
gh run list -R MagicbornStudios/<package> --workflow=publish.yml

# View workflow logs
gh run view <run-id>
gh run view <run-id> --log
```

### Git Commands

```bash
# Normal workflow
git add packages/<package-name>
git commit -m "Update <package-name>"
git push origin main

# With version bump
cd packages/<package-name>
npm version patch
git add package.json
git commit -m "Bump version"
cd ../..
git add packages/<package-name>
git commit -m "Update <package-name>"
git push origin main
```

---

## 🎯 Best Practices

### Development

1. **Always test locally first:**
   ```bash
   npm run package:build <package-name>
   ```

2. **Commit to monorepo, not package repos:**
   - Package repos are synced automatically
   - All development happens in monorepo

3. **Use descriptive commit messages:**
   ```bash
   git commit -m "Update dialogue-forge: Add new feature X"
   ```

### Publishing

1. **Let automation handle it:**
   - Just push to main, automation does the rest

2. **Version bumps:**
   - Update in monorepo before pushing
   - Or use manual workflow trigger

3. **Monitor workflows:**
   - Check Actions tab after pushing
   - Verify publish succeeded

### Package Management

1. **Use root-level commands:**
   - No need to `cd` into packages
   - All commands work from root

2. **Check status regularly:**
   ```bash
   npm run package:status
   ```

3. **Keep workflows updated:**
   - When adding new packages, update sync workflow matrix

---

## 📚 Related Documentation

- [AUTOMATED_PUBLISHING.md](AUTOMATED_PUBLISHING.md) - Detailed automation guide
- [AUTOMATION_GUIDE.md](AUTOMATION_GUIDE.md) - Script usage
- [QUICK_COMMANDS.md](QUICK_COMMANDS.md) - Command reference
- [SETUP_COMPLETE.md](SETUP_COMPLETE.md) - Initial setup checklist

---

## ✅ Summary

**Your workflow is now:**
1. Edit code in monorepo
2. Commit and push to main
3. Everything else is automatic!

**No manual steps needed for:**
- Syncing to package repos
- Building packages
- Publishing to npm
- Creating GitHub releases

**Just code and push!** 🚀

