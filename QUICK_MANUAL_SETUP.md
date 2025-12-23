# Quick Manual Setup (5 Minutes)

## ✅ Do This Right Now

### 1. Create npm Token (2 min)

**Go to:** https://www.npmjs.com/settings/magicborn/tokens

1. Click **"Generate New Token"**
2. Name: `package-publishing`
3. Type: **Granular Access Token**
4. Expiration: **90 days**
5. Permissions: **Read and write packages**
6. Click **"Generate Token"**
7. **COPY THE TOKEN** (starts with `npm_`)

### 2. Add to GitHub (1 min)

**Go to:** https://github.com/MagicbornStudios/dialogue-forge/settings/secrets/actions

1. Click **"New repository secret"**
2. Name: `NPM_TOKEN`
3. Value: Paste your token
4. Click **"Add secret"**

### 3. Verify (30 sec)

```bash
gh secret list -R MagicbornStudios/dialogue-forge
```

Should show `NPM_TOKEN`

### 4. Done! ✅

Now when you push to main, it will automatically publish to npm!

## Test It

```bash
# Make a tiny change
cd packages/dialogue-forge
echo "# Test" >> README.md
git add README.md  
git commit -m "Test"
git push origin main

# Check Actions tab - should publish automatically!
```

## That's It!

No more CLI commands needed. Just use the web interfaces - they're more reliable anyway!

