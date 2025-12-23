#!/bin/bash

# Update organization npm token (when it expires)
# Usage: ./scripts/update-org-npm-token.sh [new-token]

set -e

ORG="MagicbornStudios"
NEW_TOKEN="$1"

echo "🔄 Updating organization npm token..."
echo ""

if [ -z "$NEW_TOKEN" ]; then
  echo "📝 No token provided"
  echo ""
  echo "Get your new token from:"
  echo "  https://www.npmjs.com/settings/magicborn/tokens"
  echo ""
  read -p "Enter new npm token: " NEW_TOKEN
fi

if [ -z "$NEW_TOKEN" ]; then
  echo "❌ Token required"
  exit 1
fi

# Update organization secret
echo "🔐 Updating NPM_TOKEN in organization..."
if gh secret set NPM_TOKEN --org "$ORG" --body "$NEW_TOKEN" 2>/dev/null; then
  echo "✅ Token updated successfully!"
  echo ""
  echo "All package repos will now use the new token automatically."
else
  echo "❌ Failed to update token"
  echo ""
  echo "You may need to:"
  echo "  1. Have org admin permissions"
  echo "  2. Update manually at:"
  echo "     https://github.com/organizations/$ORG/settings/secrets/actions"
fi

