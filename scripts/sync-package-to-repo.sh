#!/bin/bash

# Generic script to sync a package to its own GitHub repo
# Usage: ./scripts/sync-package-to-repo.sh <package-name>
# Example: ./scripts/sync-package-to-repo.sh yarn-source

set -e

if [ -z "$1" ]; then
  echo "❌ Usage: $0 <package-name>"
  echo "   Example: $0 yarn-source"
  exit 1
fi

PACKAGE_NAME="$1"
PACKAGE_DIR="packages/$PACKAGE_NAME"
REPO_URL="https://github.com/MagicbornStudios/$PACKAGE_NAME.git"

if [ ! -d "$PACKAGE_DIR" ]; then
  echo "❌ Package directory not found: $PACKAGE_DIR"
  exit 1
fi

echo "🔄 Syncing $PACKAGE_NAME to its own repository..."

cd "$PACKAGE_DIR"

# Initialize git repo if needed
if [ ! -d ".git" ]; then
  echo "📦 Initializing git repository..."
  git init
  git branch -M main
fi

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
  echo "📡 Adding remote origin..."
  git remote add origin "$REPO_URL"
else
  # Verify remote URL
  CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
  if [ "$CURRENT_REMOTE" != "$REPO_URL" ]; then
    echo "🔄 Updating remote URL..."
    git remote set-url origin "$REPO_URL"
  fi
fi

# Ensure we're on main branch
git checkout -b main 2>/dev/null || git checkout main

# Stage all files
echo "📦 Staging files..."
git add -A

# Check if there are changes
if git diff --staged --quiet && [ -z "$(git log --oneline 2>/dev/null)" ]; then
  # First commit - create initial commit
  echo "💾 Creating initial commit..."
  git commit -m "Initial commit: $PACKAGE_NAME package" || true
elif ! git diff --staged --quiet; then
  # Commit changes
  echo "💾 Committing changes..."
  git commit -m "Update package from monorepo" || echo "No changes to commit"
fi

# Push to remote main branch
echo "🚀 Pushing to GitHub main branch..."
echo "   Repository: $REPO_URL"
echo ""
echo "⚠️  If the repo doesn't exist on GitHub, create it first:"
echo "   https://github.com/organizations/MagicbornStudios/repositories/new"
echo "   Name: $PACKAGE_NAME"
echo "   Visibility: Public (or Private)"
echo "   DO NOT initialize with README, .gitignore, or license"
echo ""

git push -u origin main || {
  echo ""
  echo "❌ Push failed. Possible reasons:"
  echo "   1. Repository doesn't exist on GitHub - create it first"
  echo "   2. Authentication issue - check your GitHub credentials"
  echo "   3. Permission issue - ensure you have write access to MagicbornStudios org"
  echo ""
  echo "To create the repo manually:"
  echo "   gh repo create MagicbornStudios/$PACKAGE_NAME --public --source=. --remote=origin --push"
  echo ""
  exit 1
}

echo ""
echo "✅ Sync complete! $PACKAGE_NAME is now in its own repository"
echo "   View at: https://github.com/MagicbornStudios/$PACKAGE_NAME"


