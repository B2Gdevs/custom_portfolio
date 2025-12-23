#!/bin/bash

# Setup script to create a new package repository on GitHub
# Usage: ./scripts/setup-package-repo.sh <package-name> [description]

set -e

PACKAGE_NAME="$1"
DESCRIPTION="${2:-Package from MagicbornStudios monorepo}"
ORG="MagicbornStudios"

if [ -z "$PACKAGE_NAME" ]; then
  echo "❌ Error: Package name required"
  echo "Usage: ./scripts/setup-package-repo.sh <package-name> [description]"
  exit 1
fi

# Check for GitHub CLI
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) not found"
  echo "Install: https://cli.github.com/"
  exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
  echo "❌ Not authenticated with GitHub CLI"
  echo "Run: gh auth login"
  exit 1
fi

PACKAGE_DIR="packages/$PACKAGE_NAME"
REPO_URL="https://github.com/$ORG/$PACKAGE_NAME.git"

echo "🚀 Setting up repository for $PACKAGE_NAME..."

# Check if package directory exists
if [ ! -d "$PACKAGE_DIR" ]; then
  echo "❌ Package directory not found: $PACKAGE_DIR"
  exit 1
fi

# Create GitHub repository
echo "📦 Creating GitHub repository..."
gh repo create "$ORG/$PACKAGE_NAME" \
  --public \
  --description "$DESCRIPTION" \
  --clone=false \
  || {
    echo "⚠️  Repository might already exist, continuing..."
  }

# Initialize git in package directory if not already
cd "$PACKAGE_DIR"

if [ ! -d ".git" ]; then
  echo "🔧 Initializing git repository..."
  git init
  git branch -M main
fi

# Add remote (update if exists)
if git remote get-url origin &> /dev/null; then
  echo "🔄 Updating remote URL..."
  git remote set-url origin "$REPO_URL"
else
  echo "📡 Adding remote origin..."
  git remote add origin "$REPO_URL"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
  echo "📝 Creating .gitignore..."
  cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json

# Build output
dist/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Testing
coverage/
.nyc_output/

# Environment
.env
.env.local
EOF
fi

# Create sync script if it doesn't exist
if [ ! -f "sync-to-repo.sh" ]; then
  echo "📝 Creating sync script..."
  cat > sync-to-repo.sh << 'EOFSYNC'
#!/bin/bash
# Sync package to its own GitHub repo
set -e
PACKAGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PACKAGE_DIR"
git add -A
git commit -m "Update package from monorepo" || echo "No changes to commit"
git push -u origin main || git push -u origin master
echo "✅ Sync complete!"
EOFSYNC
  chmod +x sync-to-repo.sh
fi

# Make initial commit and push
echo "💾 Making initial commit..."
git add -A
git commit -m "Initial commit: $PACKAGE_NAME package" || echo "Already committed"

echo "🚀 Pushing to GitHub..."
git push -u origin main || git push -u origin master || {
  echo "⚠️  Push failed. You may need to push manually:"
  echo "   cd $PACKAGE_DIR"
  echo "   git push -u origin main"
}

echo "✅ Repository setup complete!"
echo "📦 GitHub: https://github.com/$ORG/$PACKAGE_NAME"
echo "🔄 Sync: cd $PACKAGE_DIR && ./sync-to-repo.sh"

