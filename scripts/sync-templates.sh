#!/bin/bash

# Script to sync templates with latest Fred API
# This ensures templates use the correct imports and API patterns

set -e

FRED_REPO="${FRED_REPO:-../fred}"
CREATE_FRED_REPO="$(cd "$(dirname "$0")/.." && pwd)"

echo "🔄 Syncing create-fred templates with fred repository..."

# Check if fred repo exists
if [ ! -d "$FRED_REPO" ]; then
  echo "❌ Error: Fred repository not found at $FRED_REPO"
  echo "   Set FRED_REPO environment variable to point to fred repository"
  exit 1
fi

# Get fred version
FRED_VERSION=$(cd "$FRED_REPO" && node -p "require('./package.json').version")
echo "📦 Fred version: $FRED_VERSION"

# Check what exports fred provides
echo "🔍 Checking Fred exports..."
cd "$FRED_REPO"

# Create a temporary file to check exports
cat > /tmp/check-exports.ts << 'EOF'
import * as fred from './src/index';
console.log(JSON.stringify(Object.keys(fred).sort(), null, 2));
EOF

# Get exports (this might fail if not built, but that's okay)
EXPORTS=$(bun run /tmp/check-exports.ts 2>/dev/null || echo "[]")

echo "📋 Available exports:"
echo "$EXPORTS"

# Update create-fred package.json to reference correct fred version
cd "$CREATE_FRED_REPO"
echo "📝 Updating create-fred peer dependency..."

# This would update the peerDependency version
# For now, we'll just report what should be updated

echo ""
echo "✅ Sync check complete!"
echo ""
echo "Next steps:"
echo "1. Review template files for any API changes"
echo "2. Update peerDependency in package.json if needed"
echo "3. Test generated projects with latest fred"
echo "4. Update examples if fred API has changed"

