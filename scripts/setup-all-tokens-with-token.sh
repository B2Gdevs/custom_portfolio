#!/bin/bash

# Setup npm tokens using GitHub token (if gh auth isn't working)
# Usage: GH_TOKEN=your_token ./scripts/setup-all-tokens-with-token.sh
# Or: export GH_TOKEN=your_token first

set -e

echo "🔐 Setting up npm tokens for all packages (using token auth)..."
echo ""

# Check for token
if [ -z "$GH_TOKEN" ] && [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ No GitHub token found"
  echo ""
  echo "Set token:"
  echo "  export GH_TOKEN=your_token_here"
  echo "  export GITHUB_TOKEN=your_token_here"
  echo ""
  echo "Or run: ./scripts/setup-token-auth.sh"
  exit 1
fi

# Use token
export GITHUB_TOKEN="${GH_TOKEN:-$GITHUB_TOKEN}"
export GH_TOKEN="$GITHUB_TOKEN"

# Verify token works
echo "🔍 Verifying GitHub token..."
if ! gh api user --jq .login &> /dev/null; then
  echo "❌ Token doesn't work"
  echo "   Make sure token has correct scopes (repo, write:packages)"
  exit 1
fi

USER=$(gh api user --jq .login)
echo "✅ Authenticated as: $USER"
echo ""

# Check npm authentication
echo "🔍 Checking npm authentication..."
if ! npm whoami &> /dev/null; then
  echo "❌ Not authenticated with npm"
  echo "Run: npm login"
  exit 1
fi

NPM_USER=$(npm whoami)
echo "✅ npm authenticated as: $NPM_USER"
echo ""

# Get npm token
echo "📝 Creating npm token..."
TOKEN_OUTPUT=$(npm token create --read-only=false 2>&1)
NPM_TOKEN=$(echo "$TOKEN_OUTPUT" | grep -oP 'npm_\w+' | head -1)

if [ -z "$NPM_TOKEN" ]; then
  echo "❌ Failed to create npm token"
  echo ""
  echo "Output: $TOKEN_OUTPUT"
  exit 1
fi

echo "✅ NPM token created: ${NPM_TOKEN:0:20}..."
echo ""

# Get all packages
PACKAGES=$(find packages -maxdepth 1 -type d -not -path packages 2>/dev/null | sed 's|packages/||' | sort)

if [ -z "$PACKAGES" ]; then
  echo "⚠️  No packages found"
  exit 0
fi

echo "📦 Found packages:"
echo "$PACKAGES" | while read pkg; do
  echo "  - $pkg"
done
echo ""

# Add token to each package repo
SUCCESS_COUNT=0
FAIL_COUNT=0

for pkg in $PACKAGES; do
  echo "🔐 Adding token to $pkg..."
  
  if ! gh repo view "MagicbornStudios/$pkg" &> /dev/null; then
    echo "⚠️  Repo MagicbornStudios/$pkg not found, skipping..."
    FAIL_COUNT=$((FAIL_COUNT + 1))
    continue
  fi
  
  if gh secret set NPM_TOKEN --repo "MagicbornStudios/$pkg" --body "$NPM_TOKEN" 2>/dev/null; then
    echo "✅ Token added to $pkg"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  elif gh secret list --repo "MagicbornStudios/$pkg" 2>/dev/null | grep -q "NPM_TOKEN"; then
    echo "⚠️  Token already exists for $pkg, updating..."
    if gh secret set NPM_TOKEN --repo "MagicbornStudios/$pkg" --body "$NPM_TOKEN" 2>/dev/null; then
      echo "✅ Token updated for $pkg"
      SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
      echo "❌ Failed to update token for $pkg"
      FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
  else
    echo "❌ Failed to add token to $pkg"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
done

echo ""
echo "📊 Summary:"
echo "  ✅ Success: $SUCCESS_COUNT"
echo "  ❌ Failed: $FAIL_COUNT"

