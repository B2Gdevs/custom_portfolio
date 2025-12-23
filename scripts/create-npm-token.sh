#!/bin/bash

# Create npm token with proper name
# Usage: ./scripts/create-npm-token.sh

set -e

echo "🔐 Creating npm token for package publishing..."
echo ""
echo "npm now requires a token name. Let's create one properly."
echo ""

# Prompt for token name
read -p "Enter a name for this token (e.g., 'package-publishing'): " TOKEN_NAME

if [ -z "$TOKEN_NAME" ]; then
  TOKEN_NAME="package-publishing-$(date +%Y%m%d)"
  echo "Using default name: $TOKEN_NAME"
fi

echo ""
echo "📝 Creating token: $TOKEN_NAME"
echo "   This will prompt for your npm password and 2FA code"
echo ""

# Create token with name
TOKEN_OUTPUT=$(npm token create "$TOKEN_NAME" --read-only=false 2>&1 || echo "ERROR")

if echo "$TOKEN_OUTPUT" | grep -qE "npm_[a-zA-Z0-9]+"; then
  NPM_TOKEN=$(echo "$TOKEN_OUTPUT" | grep -oE "npm_[a-zA-Z0-9]+" | head -1)
  echo ""
  echo "✅ Token created successfully!"
  echo ""
  echo "📋 Token: $NPM_TOKEN"
  echo ""
  echo "⚠️  Save this token - you won't see it again!"
  echo ""
  echo "Next step: Add to GitHub secrets"
  echo "  gh secret set NPM_TOKEN --repo MagicbornStudios/dialogue-forge --body '$NPM_TOKEN'"
  echo ""
  read -p "Add this token to GitHub secrets now? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔐 Adding token to package repos..."
    
    PACKAGES=$(find packages -maxdepth 1 -type d -not -path packages 2>/dev/null | sed 's|packages/||' | sort)
    
    for pkg in $PACKAGES; do
      if gh repo view "MagicbornStudios/$pkg" &> /dev/null; then
        echo "Adding to $pkg..."
        if gh secret set NPM_TOKEN --repo "MagicbornStudios/$pkg" --body "$NPM_TOKEN" 2>/dev/null; then
          echo "✅ Added to $pkg"
        else
          echo "⚠️  Failed or already exists for $pkg"
        fi
      fi
    done
    
    echo ""
    echo "✅ Done! Tokens added to all package repos."
  fi
else
  echo ""
  echo "❌ Failed to create token"
  echo ""
  echo "Output:"
  echo "$TOKEN_OUTPUT"
  echo ""
  echo "Try manually:"
  echo "  npm token create 'package-publishing'"
fi

