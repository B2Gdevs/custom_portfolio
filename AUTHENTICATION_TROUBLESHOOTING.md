# Authentication Troubleshooting

## Issue: "Not authenticated with GitHub CLI"

### Symptoms
```
❌ Not authenticated with GitHub CLI
Run: gh auth login
```

### Solutions

#### 1. Complete the Login Flow

If you started `gh auth login` but didn't finish:

```bash
# Check current status
gh auth status

# If not logged in, run login again
gh auth login

# Follow the prompts:
# - Select: GitHub.com
# - Select: HTTPS
# - Select: Yes (authenticate Git)
# - Select: Login with a web browser
# - Copy the code and press Enter
# - Complete authentication in browser
```

#### 2. Verify Authentication

```bash
# Check authentication status
npm run package:verify

# Or manually
gh auth status
npm whoami
```

#### 3. Refresh Authentication

If authentication seems stuck:

```bash
# Refresh GitHub auth
gh auth refresh

# Verify
gh auth status
```

#### 4. Re-authenticate

If nothing works:

```bash
# Logout and login again
gh auth logout
gh auth login

# Verify
gh auth status
```

## Issue: npm Token Creation Fails

### Symptoms
```
❌ Failed to create npm token
```

### Solutions

#### 1. Verify npm Login

```bash
# Check if logged in
npm whoami

# If not, login
npm login
```

#### 2. Check npm Permissions

Make sure your npm account has publish permissions for the `@portfolio` scope.

#### 3. Create Token Manually

```bash
# Create token manually
npm token create --read-only=false

# Copy the token (starts with npm_)
# Then add it manually to GitHub secrets
```

## Package Manager: npm vs pnpm vs turbo

### Current Setup: npm Workspaces ✅

**We're using npm workspaces** - this is the right choice because:

- ✅ Built into npm (no extra installation)
- ✅ Simple and reliable
- ✅ All our scripts are designed for it
- ✅ Works perfectly for your use case

### When to Consider Alternatives

**pnpm:**
- Use if you have 10+ packages
- Use if disk space is a concern
- Use if you want stricter dependency resolution

**Turborepo:**
- Use if build times become slow
- Use if you need advanced caching
- Use if you want task orchestration

### Recommendation

**Stick with npm workspaces** - it's working well and there's no need to switch unless you encounter specific issues.

See [PACKAGE_MANAGER_GUIDE.md](PACKAGE_MANAGER_GUIDE.md) for more details.

## Quick Fix Commands

```bash
# Verify everything
npm run package:verify

# If GitHub auth fails
gh auth login
gh auth refresh

# If npm auth fails
npm login
npm whoami

# Then try again
npm run package:tokens:all
```

## Still Having Issues?

1. **Check authentication:**
   ```bash
   npm run package:verify
   ```

2. **Check GitHub CLI:**
   ```bash
   gh auth status
   ```

3. **Check npm:**
   ```bash
   npm whoami
   ```

4. **Try manual token creation:**
   ```bash
   npm token create
   # Then add to GitHub secrets manually
   ```

