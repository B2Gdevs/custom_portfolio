# GitHub CLI Authentication Fix

## Problem: `gh auth login` Not Persisting

If you've logged in multiple times but `gh auth status` still says you're not authenticated, try these solutions:

## Solution 1: Use Token-Based Authentication (Recommended)

Instead of `gh auth login`, use a GitHub Personal Access Token:

### Step 1: Create Token

1. Go to: https://github.com/settings/tokens/new
2. Name: "Package Management"
3. Expiration: 90 days (or your preference)
4. Scopes needed:
   - ✅ `repo` (full control)
   - ✅ `write:packages` (for publishing)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)

### Step 2: Set Token

```bash
# For current session
export GH_TOKEN=your_token_here
export GITHUB_TOKEN=your_token_here

# To make permanent, add to ~/.zshrc:
echo 'export GH_TOKEN=your_token_here' >> ~/.zshrc
echo 'export GITHUB_TOKEN=your_token_here' >> ~/.zshrc
source ~/.zshrc
```

### Step 3: Use Token-Based Script

```bash
# Setup tokens using token auth
GH_TOKEN=your_token_here ./scripts/setup-all-tokens-with-token.sh

# Or if exported:
./scripts/setup-all-tokens-with-token.sh
```

## Solution 2: Fix gh auth login

### Try These Steps

1. **Clear existing auth:**
   ```bash
   gh auth logout
   ```

2. **Login again with explicit host:**
   ```bash
   gh auth login --hostname github.com
   ```

3. **Check keychain permissions:**
   ```bash
   # macOS: Check if keychain access is blocked
   # System Preferences → Security & Privacy → Privacy → Full Disk Access
   # Make sure Terminal/iTerm has access
   ```

4. **Try different auth method:**
   ```bash
   gh auth login --web
   ```

5. **Refresh auth:**
   ```bash
   gh auth refresh
   ```

## Solution 3: Manual Token Setup

If nothing works, manually add tokens to GitHub secrets:

1. **Create npm token:**
   ```bash
   npm token create
   # Copy the token (starts with npm_)
   ```

2. **Add to each package repo manually:**
   - Go to: https://github.com/MagicbornStudios/<package-name>/settings/secrets/actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm token
   - Click "Add secret"

## Quick Test

```bash
# Test if token works
export GH_TOKEN=your_token_here
gh api user

# Should show your user info
```

## Why This Happens

- Keychain permissions on macOS
- Multiple GitHub accounts
- Credential helper issues
- Token expiration

## Recommendation

**Use token-based authentication** - it's more reliable and works consistently.

```bash
# 1. Create token at github.com/settings/tokens
# 2. Export it
export GH_TOKEN=your_token_here

# 3. Add to ~/.zshrc for persistence
echo 'export GH_TOKEN=your_token_here' >> ~/.zshrc

# 4. Use token-based scripts
GH_TOKEN=your_token_here ./scripts/setup-all-tokens-with-token.sh
```

