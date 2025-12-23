#!/bin/bash

# Complete workflow: Setup repo, build, sync, and publish
# Usage: ./scripts/package-workflow.sh <package-name> [action]
# Actions: setup, build, sync, publish, all

set -e

PACKAGE_NAME="$1"
ACTION="${2:-all}"

if [ -z "$PACKAGE_NAME" ]; then
  echo "❌ Error: Package name required"
  echo "Usage: ./scripts/package-workflow.sh <package-name> [action]"
  echo "  Actions: setup, build, sync, publish, all (default)"
  exit 1
fi

PACKAGE_DIR="packages/$PACKAGE_NAME"

if [ ! -d "$PACKAGE_DIR" ]; then
  echo "❌ Package directory not found: $PACKAGE_DIR"
  exit 1
fi

cd "$PACKAGE_DIR"

case "$ACTION" in
  setup)
    echo "🔧 Setting up repository..."
    ../scripts/setup-package-repo.sh "$PACKAGE_NAME"
    ;;
  
  build)
    echo "🔨 Building package..."
    npm run build
    echo "✅ Build complete"
    ;;
  
  sync)
    echo "🔄 Syncing to GitHub..."
    if [ -f "sync-to-repo.sh" ]; then
      ./sync-to-repo.sh
    else
      echo "❌ Sync script not found. Run 'setup' first."
      exit 1
    fi
    ;;
  
  publish)
    echo "📤 Publishing to npm..."
    ../scripts/publish-package.sh "$PACKAGE_NAME" "none"
    ;;
  
  all|*)
    echo "🚀 Running complete workflow for $PACKAGE_NAME..."
    echo ""
    
    # Build
    echo "1️⃣  Building..."
    npm run build
    echo ""
    
    # Sync to GitHub
    echo "2️⃣  Syncing to GitHub..."
    if [ -f "sync-to-repo.sh" ]; then
      ./sync-to-repo.sh || echo "⚠️  GitHub sync skipped (may need setup)"
    else
      echo "⚠️  Sync script not found. Run 'setup' first."
    fi
    echo ""
    
    # Publish
    echo "3️⃣  Publishing to npm..."
    read -p "   Publish to npm now? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      ../scripts/publish-package.sh "$PACKAGE_NAME" "patch"
    else
      echo "   Skipped. Run 'publish' action separately."
    fi
    ;;
esac

echo ""
echo "✅ Workflow complete!"

