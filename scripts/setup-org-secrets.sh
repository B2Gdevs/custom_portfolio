#!/bin/bash

# Setup organization-level secrets for all packages
# Usage: ./scripts/setup-org-secrets.sh [npm-token]

set -e

ORG="MagicbornStudios"
NPM_TOKEN="$1"

echo "🔐 Setting up organization-level secrets..."
echo ""

# Check GitHub CLI
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI not found"
  exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
  echo "❌ Not authenticated"
  echo "Run: gh auth login"
  exit 1
fi

# Get npm token if not provided
if [ -z "$NPM_TOKEN" ]; then
  echo "📝 npm token not provided"
  echo ""
  read -p "Enter your npm token (or press Enter to skip): " NPM_TOKEN
fi

# Set organization secret
if [ -n "$NPM_TOKEN" ]; then
  echo "🔐 Setting NPM_TOKEN organization secret..."
  
  if gh secret set NPM_TOKEN --org "$ORG" --body "$NPM_TOKEN" 2>/dev/null; then
    echo "✅ NPM_TOKEN set at organization level"
  else
    echo "⚠️  Failed to set secret (may need org admin permissions)"
    echo "   You can set it manually at:"
    echo "   https://github.com/organizations/$ORG/settings/secrets/actions"
  fi
else
  echo "⚠️  Skipping npm token setup"
fi

echo ""
echo "✅ Organization secrets setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Update workflows to use org secrets (already done in template)"
echo "   2. For existing packages, update their workflows:"
echo "      - Change: secrets.NPM_TOKEN"
echo "      - To: secrets.ORG_NPM_TOKEN (or keep both for fallback)"
echo ""
echo "🔗 Manage org secrets:"
echo "   https://github.com/organizations/$ORG/settings/secrets/actions"

