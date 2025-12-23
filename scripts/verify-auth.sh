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
AUTH_OUTPUT=$(gh auth status 2>&1 || echo "")

# Try multiple ways to detect authentication
if echo "$AUTH_OUTPUT" | grep -qE "(Logged in|✓|github.com.*as)"; then
  echo "✅ GitHub CLI authenticated"
  echo "$AUTH_OUTPUT" | grep -E "(Logged in|github.com|as)" | head -3
elif gh api user &> /dev/null; then
  # If API call works, we're authenticated even if status check is weird
  USER=$(gh api user --jq .login 2>/dev/null || echo "unknown")
  echo "✅ GitHub CLI authenticated (verified via API)"
  echo "   User: $USER"
else
  echo "❌ GitHub CLI not authenticated"
  echo ""
  echo "Debug info:"
  echo "$AUTH_OUTPUT"
  echo ""
  echo "To authenticate:"
  echo "  1. Run: gh auth login"
  echo "  2. Follow the prompts"
  echo "  3. Complete the browser authentication"
  echo ""
  echo "If you just authenticated, try:"
  echo "  gh auth refresh"
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

