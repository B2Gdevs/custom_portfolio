#!/bin/bash

# Setup publish workflows for all packages
# Usage: ./scripts/setup-all-workflows.sh

set -e

echo "🔧 Setting up publish workflows for all packages..."
echo ""

TEMPLATE=".github/workflows/package-publish.yml.template"

if [ ! -f "$TEMPLATE" ]; then
  echo "❌ Workflow template not found: $TEMPLATE"
  exit 1
fi

# Get all packages
PACKAGES=$(find packages -maxdepth 1 -type d -not -path packages | sed 's|packages/||' | sort)

if [ -z "$PACKAGES" ]; then
  echo "⚠️  No packages found"
  exit 0
fi

for pkg in $PACKAGES; do
  pkg_dir="packages/$pkg"
  workflow_dir="$pkg_dir/.github/workflows"
  
  if [ ! -d "$pkg_dir" ]; then
    continue
  fi
  
  echo "🔧 Setting up workflow for $pkg..."
  
  # Create .github/workflows directory
  mkdir -p "$workflow_dir"
  
  # Copy template if workflow doesn't exist
  if [ ! -f "$workflow_dir/publish.yml" ]; then
    cp "$TEMPLATE" "$workflow_dir/publish.yml"
    echo "✅ Workflow created"
  else
    echo "⚠️  Workflow already exists, skipping..."
  fi
done

echo ""
echo "✅ All workflows set up!"
echo ""
echo "📝 Next steps:"
echo "   1. Commit workflows to each package repo"
echo "   2. Add NPM_TOKEN secrets (run: ./scripts/setup-all-tokens.sh)"

