#!/bin/bash

# Root-level package management script
# Usage: ./scripts/manage-packages.sh <command> [package-name] [options]

set -e

COMMAND="$1"
PACKAGE_NAME="$2"
shift 2 || true

if [ -z "$COMMAND" ]; then
  echo "❌ Error: Command required"
  echo ""
  echo "Usage: ./scripts/manage-packages.sh <command> [package-name] [options]"
  echo ""
  echo "Commands:"
  echo "  setup <package> [description]  - Create package repo and setup"
  echo "  token <package>                 - Setup npm token for package"
  echo "  build [package]                - Build package(s)"
  echo "  sync [package]                 - Sync package to GitHub repo"
  echo "  publish [package] [bump]       - Publish package to npm"
  echo "  workflow [package]             - Add publish workflow to package"
  echo "  status [package]               - Check package status"
  echo "  list                           - List all packages"
  echo ""
  exit 1
fi

PACKAGES_DIR="packages"

# List all packages
list_packages() {
  if [ -d "$PACKAGES_DIR" ]; then
    find "$PACKAGES_DIR" -maxdepth 1 -type d -not -path "$PACKAGES_DIR" | sed "s|$PACKAGES_DIR/||" | sort
  fi
}

# Execute command for package(s)
execute_for_packages() {
  local cmd="$1"
  local pkg="$2"
  shift 2 || true
  
  if [ -z "$pkg" ]; then
    # Execute for all packages
    echo "🔄 Executing for all packages..."
    for p in $(list_packages); do
      echo ""
      echo "📦 Processing $p..."
      execute_for_package "$cmd" "$p" "$@"
    done
  else
    execute_for_package "$cmd" "$pkg" "$@"
  fi
}

execute_for_package() {
  local cmd="$1"
  local pkg="$2"
  shift 2 || true
  local pkg_dir="$PACKAGES_DIR/$pkg"
  
  if [ ! -d "$pkg_dir" ]; then
    echo "❌ Package not found: $pkg_dir"
    return 1
  fi
  
  case "$cmd" in
    setup)
      ./scripts/setup-package-repo.sh "$pkg" "$@"
      ;;
    token)
      ./scripts/setup-npm-token.sh "$pkg"
      ;;
    build)
      echo "🔨 Building $pkg..."
      (cd "$pkg_dir" && npm run build)
      ;;
    sync)
      echo "🔄 Syncing $pkg to GitHub..."
      if [ -f "$pkg_dir/sync-to-repo.sh" ]; then
        (cd "$pkg_dir" && ./sync-to-repo.sh)
      else
        echo "⚠️  Sync script not found. Run 'setup' first."
        return 1
      fi
      ;;
    publish)
      ./scripts/publish-package.sh "$pkg" "$@"
      ;;
    workflow)
      ./scripts/setup-package-workflow.sh "$pkg"
      ;;
    status)
      check_package_status "$pkg"
      ;;
    *)
      echo "❌ Unknown command: $cmd"
      return 1
      ;;
  esac
}

check_package_status() {
  local pkg="$1"
  local pkg_dir="$PACKAGES_DIR/$pkg"
  
  echo "📊 Status for $pkg:"
  echo ""
  
  # Check if package exists
  if [ ! -d "$pkg_dir" ]; then
    echo "❌ Package directory not found"
    return 1
  fi
  
  # Check git repo
  if [ -d "$pkg_dir/.git" ]; then
    echo "✅ Git repo initialized"
    if git -C "$pkg_dir" remote get-url origin &> /dev/null; then
      local remote=$(git -C "$pkg_dir" remote get-url origin)
      echo "   Remote: $remote"
    else
      echo "⚠️  No remote configured"
    fi
  else
    echo "❌ Git repo not initialized"
  fi
  
  # Check workflow
  if [ -f "$pkg_dir/.github/workflows/publish.yml" ]; then
    echo "✅ Publish workflow exists"
  else
    echo "⚠️  Publish workflow missing"
  fi
  
  # Check build
  if [ -d "$pkg_dir/dist" ]; then
    echo "✅ Built (dist/ exists)"
  else
    echo "⚠️  Not built (run: build $pkg)"
  fi
  
  # Check package.json
  if [ -f "$pkg_dir/package.json" ]; then
    local version=$(node -p "require('$pkg_dir/package.json').version" 2>/dev/null || echo "unknown")
    local name=$(node -p "require('$pkg_dir/package.json').name" 2>/dev/null || echo "unknown")
    echo "✅ Package: $name@$version"
  fi
}

case "$COMMAND" in
  list)
    echo "📦 Available packages:"
    list_packages | while read pkg; do
      echo "  - $pkg"
    done
    ;;
  setup|token|build|sync|publish|workflow|status)
    execute_for_packages "$COMMAND" "$PACKAGE_NAME" "$@"
    ;;
  *)
    echo "❌ Unknown command: $COMMAND"
    echo "Run without arguments to see usage"
    exit 1
    ;;
esac

