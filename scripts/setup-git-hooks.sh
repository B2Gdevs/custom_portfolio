#!/bin/bash

# Setup script to install git hooks for monorepo auto-sync
# This should be run after cloning the repository

set -e

MONOREPO_ROOT="$(dirname "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")")"
cd "$MONOREPO_ROOT"

HOOKS_DIR=".git/hooks"
POST_PUSH_HOOK="$HOOKS_DIR/post-push"

echo "🔧 Setting up git hooks for monorepo auto-sync..."

# Ensure hooks directory exists
if [ ! -d "$HOOKS_DIR" ]; then
  echo "❌ Git hooks directory not found. Are you in a git repository?"
  exit 1
fi

# Create the post-push hook
cat > "$POST_PUSH_HOOK" << 'HOOK_EOF'
#!/bin/bash

# Post-push hook to automatically sync changed packages to their GitHub repos
# To disable: set MONOREPO_AUTO_SYNC=false or create .monorepo-no-sync file

# Check if auto-sync is disabled
if [ "$MONOREPO_AUTO_SYNC" = "false" ] || [ -f ".monorepo-no-sync" ]; then
  exit 0
fi

# Get the root directory of the monorepo
MONOREPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$MONOREPO_ROOT"

# Check if sync script exists
if [ ! -f "scripts/sync-package-to-repo.sh" ]; then
  exit 0
fi

# Get the branch that was pushed
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Only sync on main branch pushes
if [ "$BRANCH" != "main" ]; then
  exit 0
fi

echo ""
echo "🔄 Auto-syncing changed packages to their GitHub repos..."

# Get list of packages
PACKAGES_DIR="packages"
if [ ! -d "$PACKAGES_DIR" ]; then
  exit 0
fi

# Find packages that have changes in the last commit
CHANGED_PACKAGES=()

for pkg_dir in "$PACKAGES_DIR"/*; do
  if [ ! -d "$pkg_dir" ]; then
    continue
  fi
  
  pkg_name=$(basename "$pkg_dir")
  
  # Skip if no .git directory (package not set up for sync)
  if [ ! -d "$pkg_dir/.git" ]; then
    continue
  fi
  
  # Check if package files changed in the last commit
  if git diff-tree --no-commit-id --name-only -r HEAD | grep -q "^packages/$pkg_name/"; then
    CHANGED_PACKAGES+=("$pkg_name")
  fi
done

# Sync changed packages
if [ ${#CHANGED_PACKAGES[@]} -eq 0 ]; then
  echo "✅ No packages with changes to sync"
  exit 0
fi

echo "📦 Found ${#CHANGED_PACKAGES[@]} package(s) with changes: ${CHANGED_PACKAGES[*]}"
echo ""

for pkg in "${CHANGED_PACKAGES[@]}"; do
  echo "🔄 Syncing $pkg..."
  if ./scripts/sync-package-to-repo.sh "$pkg" 2>&1 | grep -v "Already on 'main'"; then
    echo "✅ $pkg synced successfully"
  else
    echo "⚠️  $pkg sync had issues (check output above)"
  fi
  echo ""
done

echo "✅ Package sync complete"
exit 0
HOOK_EOF

# Make the hook executable
chmod +x "$POST_PUSH_HOOK"

echo "✅ Git hook installed: $POST_PUSH_HOOK"
echo ""
echo "📝 The post-push hook will automatically sync changed packages to their"
echo "   GitHub repos when you push to the main branch."
echo ""
echo "💡 To disable auto-sync:"
echo "   - Temporary: MONOREPO_AUTO_SYNC=false git push"
echo "   - Permanent: touch .monorepo-no-sync"
echo ""

