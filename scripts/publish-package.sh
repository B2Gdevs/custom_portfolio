#!/bin/bash

# Publish a package to npm
# Usage: ./scripts/publish-package.sh <package-name> [version-bump]

set -e

PACKAGE_NAME="$1"
VERSION_BUMP="${2:-patch}"  # patch, minor, major

if [ -z "$PACKAGE_NAME" ]; then
  echo "❌ Error: Package name required"
  echo "Usage: ./scripts/publish-package.sh <package-name> [version-bump]"
  echo "  version-bump: patch (default), minor, or major"
  exit 1
fi

PACKAGE_DIR="packages/$PACKAGE_NAME"

if [ ! -d "$PACKAGE_DIR" ]; then
  echo "❌ Package directory not found: $PACKAGE_DIR"
  exit 1
fi

cd "$PACKAGE_DIR"

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "❌ package.json not found"
  exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: $CURRENT_VERSION"

# Bump version if specified
if [ "$VERSION_BUMP" != "none" ]; then
  echo "🔢 Bumping version ($VERSION_BUMP)..."
  npm version "$VERSION_BUMP" --no-git-tag-version
  NEW_VERSION=$(node -p "require('./package.json').version")
  echo "✨ New version: $NEW_VERSION"
fi

# Build the package
echo "🔨 Building package..."
npm run build

# Verify what will be published
echo "🔍 Verifying package contents..."
npm pack --dry-run > /dev/null
echo "✅ Package contents verified"

# Check if logged in to npm
echo "🔐 Checking npm authentication..."
if ! npm whoami &> /dev/null; then
  echo "❌ Not logged in to npm"
  echo "Run: npm login"
  exit 1
fi

NPM_USER=$(npm whoami)
echo "✅ Logged in as: $NPM_USER"

# Confirm before publishing
read -p "🚀 Publish to npm? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Publishing cancelled"
  exit 1
fi

# Publish
echo "📤 Publishing to npm..."
npm publish --access public

# Get package name from package.json
PACKAGE_NPM_NAME=$(node -p "require('./package.json').name")
NEW_VERSION=$(node -p "require('./package.json').version")

echo "✅ Published successfully!"
echo "📦 Package: $PACKAGE_NPM_NAME@$NEW_VERSION"
echo "🔗 NPM: https://www.npmjs.com/package/$PACKAGE_NPM_NAME"

# Optionally sync to GitHub
read -p "🔄 Sync to GitHub repo? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  if [ -f "sync-to-repo.sh" ]; then
    ./sync-to-repo.sh
  else
    echo "⚠️  Sync script not found. Skipping GitHub sync."
  fi
fi

