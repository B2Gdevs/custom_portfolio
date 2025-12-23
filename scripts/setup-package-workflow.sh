#!/bin/bash

# Setup GitHub Actions workflow for a package
# This creates the publish workflow in the package's GitHub repo
# Usage: ./scripts/setup-package-workflow.sh <package-name>

set -e

PACKAGE_NAME="$1"

if [ -z "$PACKAGE_NAME" ]; then
  echo "❌ Error: Package name required"
  echo "Usage: ./scripts/setup-package-workflow.sh <package-name>"
  exit 1
fi

PACKAGE_DIR="packages/$PACKAGE_NAME"
WORKFLOW_DIR="$PACKAGE_DIR/.github/workflows"
TEMPLATE=".github/workflows/package-publish.yml.template"

if [ ! -d "$PACKAGE_DIR" ]; then
  echo "❌ Package directory not found: $PACKAGE_DIR"
  exit 1
fi

if [ ! -f "$TEMPLATE" ]; then
  echo "❌ Workflow template not found: $TEMPLATE"
  exit 1
fi

echo "🔧 Setting up GitHub Actions workflow for $PACKAGE_NAME..."

# Create .github/workflows directory
mkdir -p "$WORKFLOW_DIR"

# Copy template to package
cp "$TEMPLATE" "$WORKFLOW_DIR/publish.yml"

echo "✅ Workflow created: $WORKFLOW_DIR/publish.yml"
echo ""
echo "📝 Next steps:"
echo "   1. Commit and push the workflow:"
echo "      cd $PACKAGE_DIR"
echo "      git add .github/workflows/publish.yml"
echo "      git commit -m 'Add GitHub Actions publish workflow'"
echo "      git push"
echo ""
echo "   2. Add NPM_TOKEN secret to GitHub repo:"
echo "      - Go to: https://github.com/MagicbornStudios/$PACKAGE_NAME/settings/secrets/actions"
echo "      - Add secret: NPM_TOKEN"
echo "      - Value: Your npm token (get with: npm token create)"
echo ""

