#!/bin/bash

# Script to manually sync all packages to their GitHub repos
# Usage: ./scripts/sync-all-packages.sh

set -e

MONOREPO_ROOT="$(dirname "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")")"
cd "$MONOREPO_ROOT"

PACKAGES_DIR="packages"

if [ ! -d "$PACKAGES_DIR" ]; then
  echo "❌ Packages directory not found"
  exit 1
fi

echo "🔄 Syncing all packages to their GitHub repos..."
echo ""

for pkg_dir in "$PACKAGES_DIR"/*; do
  if [ ! -d "$pkg_dir" ]; then
    continue
  fi
  
  pkg_name=$(basename "$pkg_dir")
  
  # Skip if no .git directory
  if [ ! -d "$pkg_dir/.git" ]; then
    echo "⏭️  Skipping $pkg_name (no git repo)"
    continue
  fi
  
  echo "📦 Syncing $pkg_name..."
  ./scripts/sync-package-to-repo.sh "$pkg_name" || echo "⚠️  Failed to sync $pkg_name"
  echo ""
done

echo "✅ All packages synced"

