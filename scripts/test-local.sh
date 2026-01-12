#!/bin/bash

# Quick local testing script
# Generates a project and opens it for manual testing

set -e

PROJECT_NAME="${1:-test-project}"

echo "🚀 Generating test project: $PROJECT_NAME"
echo ""

# Build if needed
if [ ! -d "dist" ]; then
  echo "📦 Building create-fred..."
  bun run build
fi

# Generate project
echo "📝 Generating project..."
bun run dist/index.js "$PROJECT_NAME" --provider groq --model llama-3-70b-8192 --yes

echo ""
echo "✅ Project generated!"
echo ""
echo "Next steps:"
echo "  cd $PROJECT_NAME"
echo "  fred provider list"
echo "  fred provider add anthropic"
echo "  fred agent create"
echo "  fred tool create"
echo ""
echo "To test with local fred package:"
echo "  cd $PROJECT_NAME"
echo "  bun link ../../fred  # If fred is in parent directory"
echo ""
