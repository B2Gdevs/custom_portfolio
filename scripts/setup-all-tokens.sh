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

# Check if authenticated
if ! gh auth status &> /dev/null; then
  echo "❌ Not authenticated with GitHub CLI"
  echo "Run: gh auth login"
  exit 1
fi

# Get npm token
echo "📝 Creating npm token..."
echo "   This token will be used for all packages"
echo ""

NPM_TOKEN=$(npm token create --read-only=false 2>&1 | grep -oP 'npm_\w+' | head -1)

if [ -z "$NPM_TOKEN" ]; then
  echo "❌ Failed to create npm token"
  echo "   Try manually: npm token create"
  exit 1
fi

echo "✅ NPM token created: ${NPM_TOKEN:0:20}..."
echo ""

# Get all packages
PACKAGES=$(find packages -maxdepth 1 -type d -not -path packages | sed 's|packages/||' | sort)

if [ -z "$PACKAGES" ]; then
  echo "⚠️  No packages found"
  exit 0
fi

# Add token to each package repo
for pkg in $PACKAGES; do
  echo "🔐 Adding token to $pkg..."
  
  # Check if repo exists
  if ! gh repo view "MagicbornStudios/$pkg" &> /dev/null; then
    echo "⚠️  Repo MagicbornStudios/$pkg not found, skipping..."
    continue
  fi
  
  # Add secret
  if gh secret set NPM_TOKEN --repo "MagicbornStudios/$pkg" --body "$NPM_TOKEN" 2>/dev/null; then
    echo "✅ Token added to $pkg"
  else
    echo "⚠️  Failed to add token to $pkg (may already exist)"
  fi
done

echo ""
echo "✅ Setup complete!"
echo "🔒 Token is stored securely in GitHub secrets for all packages"

