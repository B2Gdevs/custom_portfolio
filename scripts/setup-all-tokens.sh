#!/bin/bash

# Setup npm tokens for all packages
# Usage: ./scripts/setup-all-tokens.sh

set -e

echo "🔐 Setting up npm tokens for all packages..."
echo ""

# Check if GitHub CLI is available
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) not found"
  echo "Install: https://cli.github.com/"
  exit 1
fi

# Check if authenticated (more robust check)
echo "🔍 Checking GitHub CLI authentication..."
AUTH_STATUS=$(gh auth status 2>&1 || echo "")

# Try multiple ways to detect authentication
if echo "$AUTH_STATUS" | grep -qE "(Logged in|✓|github.com.*as)" || gh api user &> /dev/null; then
  if gh api user &> /dev/null; then
    USER=$(gh api user --jq .login 2>/dev/null || echo "unknown")
    echo "✅ GitHub CLI authenticated as: $USER"
  else
    echo "✅ GitHub CLI authenticated"
  fi
else
  echo "❌ Not authenticated with GitHub CLI"
  echo ""
  echo "Debug output:"
  echo "$AUTH_STATUS"
  echo ""
  echo "Try:"
  echo "  1. gh auth login"
  echo "  2. gh auth refresh"
  echo "  3. Then run this script again"
  exit 1
fi
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
echo "   This token will be used for all packages"
echo "   Token will have publish permissions"
echo ""
echo "   ⏳ This may take a moment..."
echo ""

# Create token and capture it (with timeout handling)
TOKEN_OUTPUT=$(npm token create --read-only=false 2>&1 || echo "ERROR")
NPM_TOKEN=$(echo "$TOKEN_OUTPUT" | grep -oE 'npm_[a-zA-Z0-9]+' | head -1)

if [ -z "$NPM_TOKEN" ]; then
  echo "❌ Failed to create npm token"
  echo ""
  echo "Output: $TOKEN_OUTPUT"
  echo ""
  echo "Try manually: npm token create"
  exit 1
fi

echo "✅ NPM token created: ${NPM_TOKEN:0:20}..."
echo ""

# Get all packages
PACKAGES=$(find packages -maxdepth 1 -type d -not -path packages 2>/dev/null | sed 's|packages/||' | sort)

if [ -z "$PACKAGES" ]; then
  echo "⚠️  No packages found in packages/ directory"
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
  
  # Check if repo exists
  if ! gh repo view "MagicbornStudios/$pkg" &> /dev/null; then
    echo "⚠️  Repo MagicbornStudios/$pkg not found, skipping..."
    FAIL_COUNT=$((FAIL_COUNT + 1))
    continue
  fi
  
  # Add secret
  if gh secret set NPM_TOKEN --repo "MagicbornStudios/$pkg" --body "$NPM_TOKEN" 2>/dev/null; then
    echo "✅ Token added to $pkg"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    # Check if it already exists
    if gh secret list --repo "MagicbornStudios/$pkg" 2>/dev/null | grep -q "NPM_TOKEN"; then
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
  fi
done

echo ""
echo "📊 Summary:"
echo "  ✅ Success: $SUCCESS_COUNT"
echo "  ❌ Failed: $FAIL_COUNT"
echo ""
echo "🔒 Token is stored securely in GitHub secrets"
echo ""
echo "⚠️  Save this token - you won't see it again:"
echo "   ${NPM_TOKEN:0:20}..."
