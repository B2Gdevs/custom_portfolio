# Setup Organization Secret via Web UI

Since you need org admin permissions, here's how to set it up via the web:

## Step 1: Go to Organization Secrets

**URL:** https://github.com/organizations/MagicbornStudios/settings/secrets/actions

## Step 2: Add Secret

1. Click **"New organization secret"**
2. **Name**: `NPM_TOKEN`
3. **Secret**: Paste your npm token (starts with `npm_`)
4. **Repository access**: 
   - Select "Selected repositories"
   - Choose all your package repos (dialogue-forge, etc.)
   - OR select "All repositories" if you want it available everywhere
5. Click **"Add secret"**

## Step 3: Verify

The secret is now available to all selected repos automatically!

## How It Works

- **Organization secrets** are available to all repos you select
- **Workflows automatically use them** - no changes needed!
- **Update once** - when token expires, update the org secret
- **All packages** automatically get the new token

## Updating Token (Every 90 Days)

1. Create new token at: https://www.npmjs.com/settings/magicborn/tokens
2. Go to: https://github.com/organizations/MagicbornStudios/settings/secrets/actions
3. Click on `NPM_TOKEN` secret
4. Click "Update"
5. Paste new token
6. Save

**That's it!** All packages automatically use the new token.

## Benefits

✅ **One place to manage** - Update org secret, all repos get it
✅ **Automatic** - No per-repo setup needed
✅ **Secure** - Stored in GitHub secrets
✅ **Easy rotation** - Update once every 90 days

