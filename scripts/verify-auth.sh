#!/bin/bash

# Verify authentication for GitHub CLI and npm
# Usage: ./scripts/verify-auth.sh

set -e

echo "🔍 Verifying authentication..."
echo ""

# Check GitHub CLI
echo "📦 GitHub CLI:"
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI not installed"
  echo "   Install: brew install gh"
  exit 1
fi

echo "✅ GitHub CLI installed"

# Check GitHub authentication
echo "🔐 Checking GitHub authentication..."
AUTH_OUTPUT=$(gh auth status 2>&1 || echo "not authenticated")

if echo "$AUTH_OUTPUT" | grep -q "Logged in"; then
  echo "✅ GitHub CLI authenticated"
  echo "$AUTH_OUTPUT" | grep -E "(Logged in|github.com)" | head -2
else
  echo "❌ GitHub CLI not authenticated"
  echo ""
  echo "To authenticate:"
  echo "  1. Run: gh auth login"
  echo "  2. Follow the prompts"
  echo "  3. Complete the browser authentication"
  echo ""
  echo "If you just authenticated, wait a few seconds and try again"
  exit 1
fi

echo ""

# Check npm
echo "📦 npm:"
if ! command -v npm &> /dev/null; then
  echo "❌ npm not installed"
  exit 1
fi

echo "✅ npm installed"

# Check npm authentication
echo "🔐 Checking npm authentication..."
if npm whoami &> /dev/null; then
  NPM_USER=$(npm whoami)
  echo "✅ npm authenticated as: $NPM_USER"
else
  echo "❌ npm not authenticated"
  echo ""
  echo "To authenticate:"
  echo "  1. Run: npm login"
  echo "  2. Enter your credentials"
  exit 1
fi

echo ""
echo "✅ All authentication verified!"
echo ""
echo "You can now run:"
echo "  npm run package:tokens:all"

