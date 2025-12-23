# npm Token Creation Fix

## Problem: "Token name is required"

npm now requires a token name when creating tokens. The old command doesn't work.

## ✅ Solution: Use Token Name

### Option 1: Use the Helper Script

```bash
./scripts/create-npm-token.sh
```

This will:
- Prompt for a token name
- Create the token with that name
- Optionally add it to GitHub secrets

### Option 2: Manual Creation

```bash
# Create token with a name
npm token create "package-publishing"

# Or with a descriptive name
npm token create "monorepo-packages-$(date +%Y%m%d)"
```

**Then add to GitHub:**
```bash
# Copy the token from output (starts with npm_)
gh secret set NPM_TOKEN --repo MagicbornStudios/dialogue-forge --body "npm_YOUR_TOKEN"
```

### Option 3: Updated Script

The `setup-all-tokens.sh` script has been updated to include a token name automatically.

```bash
npm run package:tokens:all
```

## What Changed

npm now requires:
- ✅ Token name (required)
- ✅ 2FA enabled (if you have it)
- ✅ Granular tokens (90 day expiration)

## Quick Command

```bash
# Create token with name
npm token create "package-publishing"

# Copy the token from output
# Then add to GitHub:
gh secret set NPM_TOKEN --repo MagicbornStudios/dialogue-forge --body "YOUR_TOKEN"
```

