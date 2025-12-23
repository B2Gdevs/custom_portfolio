# Quick Organization Secret Setup

## ✅ Do This Now (2 Minutes)

### Step 1: Add Organization Secret via Web

**Go to:** https://github.com/organizations/MagicbornStudios/settings/secrets/actions

1. Click **"New organization secret"**
2. **Name**: `NPM_TOKEN`
3. **Secret**: Your npm token (the one you just created)
4. **Repository access**: 
   - Select "Selected repositories"
   - Choose: `dialogue-forge` (and any other package repos)
   - OR "All repositories" if you want it everywhere
5. Click **"Add secret"**

### Step 2: Done! ✅

That's it! All your package repos can now use this token automatically.

## 🔄 When Token Expires (90 Days)

1. Create new token: https://www.npmjs.com/settings/magicborn/tokens
2. Go to: https://github.com/organizations/MagicbornStudios/settings/secrets/actions
3. Click on `NPM_TOKEN`
4. Click "Update"
5. Paste new token
6. Save

**All packages automatically use the new token!**

## ✨ Benefits

- ✅ **One token for all packages**
- ✅ **Update once, all repos get it**
- ✅ **No per-repo setup needed**
- ✅ **Easy rotation every 90 days**

## 📋 Note

You need **organization admin** permissions to set org secrets. If you don't have that, you can:
- Ask an org admin to set it
- Or set it per-repo (less ideal but works)

