#!/bin/bash

# Check if npm tokens are set up for packages
# Usage: ./scripts/check-token-setup.sh [package-name]

set -e

PACKAGE_NAME="$1"

echo "🔍 Checking token setup..."
echo ""

if [ -z "$PACKAGE_NAME" ]; then
  # Check all packages
  PACKAGES=$(find packages -maxdepth 1 -type d -not -path packages 2>/dev/null | sed 's|packages/||' | sort)
  
  if [ -z "$PACKAGES" ]; then
    echo "⚠️  No packages found"
    exit 0
  fi
  
  for pkg in $PACKAGES; do
    echo "📦 Checking $pkg..."
    check_package_token "$pkg"
    echo ""
  done
else
  check_package_token "$PACKAGE_NAME"
fi

check_package_token() {
  local pkg="$1"
  
  # Check if secret exists
  if gh secret list --repo "MagicbornStudios/$pkg" 2>/dev/null | grep -q "NPM_TOKEN"; then
    echo "✅ NPM_TOKEN secret exists for $pkg"
  else
    echo "❌ NPM_TOKEN secret NOT found for $pkg"
    echo "   Run: npm run package:token $pkg"
  fi
}

