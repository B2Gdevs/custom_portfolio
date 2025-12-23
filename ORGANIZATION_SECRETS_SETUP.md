# Organization-Level Secrets Setup

## ✅ Benefits

- **One token for all packages** - Update once, all repos use it
- **Automatic access** - All repos in org can use org secrets
- **Easy updates** - Update token in one place when it expires

## 🚀 Setup (One Time)

### Step 1: Set Organization Secret

```bash
# Using your npm token (replace with your actual token)
gh secret set NPM_TOKEN --org MagicbornStudios --body "npm_YOUR_TOKEN_HERE"
```

Or use the helper script:
```bash
./scripts/setup-org-secrets.sh "npm_YOUR_TOKEN_HERE"
```

### Step 2: Verify

```bash
# Check org secrets (requires org admin)
gh secret list --org MagicbornStudios
```

Or check via web:
https://github.com/organizations/MagicbornStudios/settings/secrets/actions

### Step 3: Workflows Already Configured

All workflows already use `secrets.NPM_TOKEN` which automatically includes:
- Repository-level secrets (if set)
- Organization-level secrets (what we just set)

**No workflow changes needed!** ✅

## 🔄 Updating Token (Every 90 Days)

When your token expires:

### Step 1: Create New Token

1. Go to: https://www.npmjs.com/settings/magicborn/tokens
2. Generate new token
3. Copy it

### Step 2: Update Organization Secret

```bash
./scripts/update-org-npm-token.sh "npm_NEW_TOKEN_HERE"
```

Or manually:
```bash
gh secret set NPM_TOKEN --org MagicbornStudios --body "npm_NEW_TOKEN_HERE"
```

**That's it!** All packages automatically use the new token.

## 📋 How It Works

### GitHub Secrets Priority

GitHub Actions checks secrets in this order:
1. **Repository secrets** (if set) - highest priority
2. **Organization secrets** (what we set) - fallback
3. **Environment secrets** (if using environments)

Since we set it at org level, all repos can use it automatically.

### Workflow Configuration

Your workflows use:
```yaml
env:
  NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

This automatically:
- ✅ Uses repo secret if it exists
- ✅ Falls back to org secret if repo secret doesn't exist
- ✅ Works for all repos in the organization

## 🎯 Current Setup

- ✅ Organization secret: `NPM_TOKEN` set
- ✅ All workflows configured to use it
- ✅ All packages can publish automatically

## 🔍 Managing Secrets

### View Organization Secrets

```bash
gh secret list --org MagicbornStudios
```

### Update Organization Secret

```bash
gh secret set NPM_TOKEN --org MagicbornStudios --body "new_token"
```

### Via Web UI

https://github.com/organizations/MagicbornStudios/settings/secrets/actions

## ✨ Benefits Summary

- **One place to update** - Update org secret, all repos get it
- **Automatic** - No per-repo setup needed
- **Secure** - Tokens stored in GitHub secrets
- **Easy rotation** - Update once every 90 days

## 🚀 Next Steps

1. ✅ Token is set at org level
2. ✅ Workflows are configured
3. ✅ Ready to publish!

Just push to main and packages will publish automatically using the org secret!

