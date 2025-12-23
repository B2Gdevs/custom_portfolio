#!/bin/bash

# Alternative: Setup using GitHub token instead of gh auth
# This is useful if gh auth login isn't persisting
# Usage: ./scripts/setup-token-auth.sh

set -e

echo "🔐 Alternative Authentication Setup"
echo ""
echo "If 'gh auth login' isn't working, you can use a GitHub token instead."
echo ""

# Check if token already exists
if [ -n "$GH_TOKEN" ]; then
  echo "✅ GH_TOKEN environment variable is set"
  echo "   Using existing token"
  export GITHUB_TOKEN="$GH_TOKEN"
else
  echo "📝 To use token-based authentication:"
  echo ""
  echo "1. Create a GitHub Personal Access Token:"
  echo "   https://github.com/settings/tokens/new"
  echo ""
  echo "2. Required scopes:"
  echo "   - repo (full control)"
  echo "   - write:packages (if publishing packages)"
  echo ""
  echo "3. Set the token:"
  echo "   export GH_TOKEN=your_token_here"
  echo "   export GITHUB_TOKEN=your_token_here"
  echo ""
  echo "4. Or add to ~/.zshrc or ~/.bashrc:"
  echo "   echo 'export GH_TOKEN=your_token_here' >> ~/.zshrc"
  echo "   echo 'export GITHUB_TOKEN=your_token_here' >> ~/.zshrc"
  echo ""
  echo "5. Then run this script again"
  echo ""
  
  read -p "Do you have a token ready? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your GitHub token: " -s TOKEN
    echo
    export GH_TOKEN="$TOKEN"
    export GITHUB_TOKEN="$TOKEN"
    echo "✅ Token set for this session"
    echo ""
    echo "To make it permanent, add to ~/.zshrc:"
    echo "  export GH_TOKEN=$TOKEN"
    echo "  export GITHUB_TOKEN=$TOKEN"
  else
    echo "Create a token at: https://github.com/settings/tokens/new"
    exit 1
  fi
fi

# Test the token
echo "🔍 Testing token..."
if gh api user --jq .login &> /dev/null; then
  USER=$(gh api user --jq .login)
  echo "✅ Token works! Authenticated as: $USER"
  echo ""
  echo "You can now run:"
  echo "  npm run package:tokens:all"
else
  echo "❌ Token doesn't work"
  echo "   Make sure the token has the correct scopes"
  exit 1
fi

