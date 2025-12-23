#!/bin/bash

# Helper script to create npm token and add to GitHub secrets
# Usage: ./scripts/setup-npm-token.sh <package-name>

set -e

PACKAGE_NAME="$1"

if [ -z "$PACKAGE_NAME" ]; then
  echo "❌ Error: Package name required"
  echo "Usage: ./scripts/setup-npm-token.sh <package-name>"
  exit 1
fi

echo "🔐 Setting up NPM token for $PACKAGE_NAME..."
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

echo "📝 Creating npm token..."
echo "   This will create a token with publish permissions"
echo ""

# Create npm token
NPM_TOKEN=$(npm token create --read-only=false 2>&1 | grep -oP 'npm_\w+' | head -1)

if [ -z "$NPM_TOKEN" ]; then
  echo "❌ Failed to create npm token"
  echo "   Try manually: npm token create"
  exit 1
fi

echo "✅ NPM token created: ${NPM_TOKEN:0:20}..."
echo ""

# Add to GitHub secrets
echo "🔐 Adding token to GitHub secrets..."
gh secret set NPM_TOKEN --repo "MagicbornStudios/$PACKAGE_NAME" --body "$NPM_TOKEN" || {
  echo "⚠️  Failed to add secret via CLI"
  echo ""
  echo "📋 Manual steps:"
  echo "   1. Go to: https://github.com/MagicbornStudios/$PACKAGE_NAME/settings/secrets/actions"
  echo "   2. Click 'New repository secret'"
  echo "   3. Name: NPM_TOKEN"
  echo "   4. Value: $NPM_TOKEN"
  echo ""
  echo "⚠️  Save this token - it won't be shown again!"
  exit 1
}

echo "✅ NPM token added to GitHub secrets!"
echo ""
echo "🔒 Token is now stored securely in GitHub"
echo "   The workflow will use it automatically when publishing"

