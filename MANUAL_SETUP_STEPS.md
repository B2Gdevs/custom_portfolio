# Manual Token Setup - Step by Step

Since CLI commands aren't working, let's do this manually via web interfaces.

## Step 1: Create npm Token via Web

### Option A: Via npm Website (Recommended)

1. **Go to npm token page:**
   https://www.npmjs.com/settings/magicborn/tokens

2. **Click "Generate New Token"**

3. **Configure:**
   - **Token name**: `package-publishing` (or any name you like)
   - **Type**: **Granular Access Token**
   - **Expiration**: 90 days (max for write tokens)
   - **Permissions**:
     - ✅ **Read and write packages** (for publishing)
     - ✅ **Read profile** (if needed)

4. **Click "Generate Token"**

5. **Copy the token immediately** - it starts with `npm_` and you won't see it again!

### Option B: Via GitHub (if npm account is linked)

If your npm account is linked to GitHub:
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Scopes: `write:packages`, `read:packages`
4. Copy the token

## Step 2: Add Token to GitHub Secrets

### Via GitHub Web UI (Easiest)

1. **Go to your package repo:**
   https://github.com/MagicbornStudios/dialogue-forge/settings/secrets/actions

2. **Click "New repository secret"**

3. **Fill in:**
   - **Name**: `NPM_TOKEN`
   - **Secret**: Paste your npm token (the one starting with `npm_`)

4. **Click "Add secret"**

5. **Done!** ✅

### Via Command Line (if you have the token)

If you managed to get the token somehow:

```bash
gh secret set NPM_TOKEN --repo MagicbornStudios/dialogue-forge --body "npm_YOUR_TOKEN_HERE"
```

## Step 3: Verify It Worked

```bash
# Check if secret exists
gh secret list -R MagicbornStudios/dialogue-forge
```

Should show:
```
NPM_TOKEN
```

## Step 4: Test Publishing

Make a small change and push to test:

```bash
# Make a tiny change
cd packages/dialogue-forge
echo "# Test" >> README.md
git add README.md
git commit -m "Test publish"
git push origin main
```

Then check:
- GitHub Actions should run
- Package should publish to npm

## Troubleshooting

### "Token not found" in GitHub Actions

- Make sure secret name is exactly `NPM_TOKEN` (case-sensitive)
- Make sure you're using the npm token (starts with `npm_`)

### "Publish failed"

- Check token has write permissions
- Check token hasn't expired
- Check npm account has access to `@portfolio` scope

## Quick Checklist

- [ ] Created npm token via web
- [ ] Copied token (starts with `npm_`)
- [ ] Added to GitHub secrets as `NPM_TOKEN`
- [ ] Verified secret exists
- [ ] Ready to publish!

