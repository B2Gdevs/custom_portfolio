# Manual Token Setup (If Script Hangs)

If `npm run package:tokens:all` is hanging, here's how to set it up manually:

## Quick Manual Setup

### Step 1: Create npm Token Manually

```bash
# This might prompt for 2FA or confirmation
npm token create

# You'll see output like:
# ┌──────────────────────────────────────────────────────────────┐
# │                    npm token                                  │
# ├──────────────────────────────────────────────────────────────┤
# │ npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  │
# └──────────────────────────────────────────────────────────────┘
```

**Copy the token** (starts with `npm_`)

### Step 2: Add to GitHub Secrets

```bash
# Add token to dialogue-forge repo
gh secret set NPM_TOKEN --repo MagicbornStudios/dialogue-forge --body "npm_YOUR_TOKEN_HERE"
```

Replace `npm_YOUR_TOKEN_HERE` with the actual token from step 1.

### Step 3: Verify

```bash
# Check if secret exists
gh secret list -R MagicbornStudios/dialogue-forge

# Should show:
# NPM_TOKEN
```

## Alternative: Use GitHub Web UI

1. **Create npm token:**
   ```bash
   npm token create
   ```

2. **Add via GitHub:**
   - Go to: https://github.com/MagicbornStudios/dialogue-forge/settings/secrets/actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm token
   - Click "Add secret"

## Why It Might Hang

`npm token create` can hang if:
- Waiting for 2FA confirmation
- Network issues
- npm registry timeout

**Solution:** Run it manually in a separate terminal, then add the token via `gh secret set` command above.

