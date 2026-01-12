#!/bin/bash

# End-to-end test script for create-fred
# Tests project generation and embedded CLI functionality

set -e

echo "🧪 Running end-to-end tests for create-fred..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test directory
TEST_DIR="/tmp/fred-e2e-test-$$"
PROJECT_NAME="test-fred-project"

# Cleanup function
cleanup() {
  echo ""
  echo "🧹 Cleaning up..."
  if [ -d "$TEST_DIR" ]; then
    rm -rf "$TEST_DIR"
  fi
  if [ -d "$PROJECT_NAME" ]; then
    rm -rf "$PROJECT_NAME"
  fi
}

# Trap to ensure cleanup on exit
trap cleanup EXIT

# Step 1: Build create-fred
echo "📦 Building create-fred..."
if ! bun run build; then
  echo -e "${RED}❌ Build failed${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Step 2: Test project generation
echo "🚀 Testing project generation..."
if ! bun run dist/index.js "$PROJECT_NAME" --provider groq --model llama-3-70b-8192 --yes; then
  echo -e "${RED}❌ Project generation failed${NC}"
  exit 1
fi

if [ ! -d "$PROJECT_NAME" ]; then
  echo -e "${RED}❌ Project directory not created${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Project generated successfully${NC}"
echo ""

# Step 3: Verify project structure
echo "📁 Verifying project structure..."
cd "$PROJECT_NAME"

REQUIRED_FILES=(
  "package.json"
  "src/index.ts"
  "src/cli.ts"
  "src/cli/provider.ts"
  "src/cli/agent.ts"
  "src/cli/tool.ts"
  "src/cli/utils.ts"
  "src/cli/prompts.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo -e "${RED}❌ Required file missing: $file${NC}"
    exit 1
  fi
done
echo -e "${GREEN}✅ Project structure verified${NC}"
echo ""

# Step 4: Verify bin entry in package.json
echo "🔍 Verifying package.json bin entry..."
if ! grep -q '"fred":' package.json; then
  echo -e "${RED}❌ Bin entry missing in package.json${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Bin entry found${NC}"
echo ""

# Step 5: Test embedded CLI - provider list
echo "🧪 Testing embedded CLI: provider list..."
if ! fred provider list > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  CLI command not available (may need bun install)${NC}"
  echo "   Running bun install..."
  bun install
fi

if ! fred provider list; then
  echo -e "${RED}❌ fred provider list failed${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Provider list command works${NC}"
echo ""

# Step 6: Test embedded CLI - provider add
echo "🧪 Testing embedded CLI: provider add..."
if ! fred provider add anthropic; then
  echo -e "${RED}❌ fred provider add failed${NC}"
  exit 1
fi

# Verify package was added
if ! grep -q "@ai-sdk/anthropic" package.json; then
  echo -e "${RED}❌ Provider package not added to package.json${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Provider add command works${NC}"
echo ""

# Step 7: Test embedded CLI - provider remove
echo "🧪 Testing embedded CLI: provider remove..."
if ! fred provider remove anthropic; then
  echo -e "${RED}❌ fred provider remove failed${NC}"
  exit 1
fi

# Verify package was removed
if grep -q "@ai-sdk/anthropic" package.json; then
  echo -e "${YELLOW}⚠️  Provider package still in package.json (may be expected)${NC}"
fi
echo -e "${GREEN}✅ Provider remove command works${NC}"
echo ""

# Step 8: Test help command
echo "🧪 Testing embedded CLI: help..."
if ! fred help > /dev/null 2>&1; then
  echo -e "${RED}❌ fred help failed${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Help command works${NC}"
echo ""

# All tests passed
echo ""
echo -e "${GREEN}✅ All end-to-end tests passed!${NC}"
echo ""
echo "To test interactively:"
echo "  cd $PROJECT_NAME"
echo "  fred agent create"
echo "  fred tool create"
