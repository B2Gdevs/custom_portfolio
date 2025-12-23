#!/bin/bash

# Setup script to configure environment for package management
# This helps you set up GitHub CLI and npm authentication

set -e

echo "🔧 Setting up package management environment..."
echo ""

# Check GitHub CLI
echo "📦 Checking GitHub CLI..."
if command -v gh &> /dev/null; then
  echo "✅ GitHub CLI installed"
  if gh auth status &> /dev/null; then
    echo "✅ GitHub CLI authenticated"
    gh auth status
  else
    echo "⚠️  GitHub CLI not authenticated"
    echo "   Run: gh auth login"
  fi
else
  echo "❌ GitHub CLI not installed"
  echo "   Install: brew install gh (macOS) or https://cli.github.com/"
fi

echo ""

# Check npm
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
  echo "✅ npm installed"
  if npm whoami &> /dev/null; then
    NPM_USER=$(npm whoami)
    echo "✅ npm authenticated as: $NPM_USER"
  else
    echo "⚠️  npm not authenticated"
    echo "   Run: npm login"
  fi
else
  echo "❌ npm not installed"
fi

echo ""

# Check for .env file
if [ -f ".env.local" ]; then
  echo "✅ .env.local found"
else
  echo "ℹ️  No .env.local file (optional)"
  echo "   You can create one for additional configuration"
fi

echo ""
echo "✅ Setup check complete!"
echo ""
echo "Next steps:"
echo "  1. Authenticate GitHub: gh auth login"
echo "  2. Authenticate npm: npm login"
echo "  3. Create package repo: ./scripts/setup-package-repo.sh <package-name>"
echo "  4. Publish package: ./scripts/publish-package.sh <package-name>"

