# Testing create-fred Without Publishing

This guide explains how to test `create-fred` and the embedded CLI functionality locally without publishing to npm.

## Quick Start

### 1. Build create-fred

```bash
cd create-fred
bun run build
```

This creates the `dist/` directory with the compiled CLI and templates.

### 2. Test Using Local Path

You can test `create-fred` directly using Bun:

```bash
# From the create-fred directory
bun run src/index.ts my-test-project --provider groq --model llama-3-70b-8192
```

Or use the built version:

```bash
bun run dist/index.js my-test-project --provider groq --model llama-3-70b-8192
```

### 3. Test Using Bun Link (Recommended)

Create a local link so you can use `bunx create-fred`:

```bash
cd create-fred
bun link
```

Now you can test it from anywhere:

```bash
cd /tmp
bunx create-fred my-test-project --provider groq
```

### 4. Test Using Git URL (Alternative)

If your repo is on GitHub, you can test using the git URL:

```bash
bunx create-fred@github:yourusername/create-fred my-test-project
```

## Testing the Embedded CLI

After generating a project, test the embedded CLI:

```bash
cd my-test-project

# Test provider commands
fred provider list
fred provider add anthropic
fred provider remove anthropic

# Test agent creation (interactive)
fred agent create

# Test tool creation (interactive)
fred tool create

# Test help
fred help
```

## End-to-End Testing Workflow

### Automated Test Script

Use the provided test script:

```bash
cd create-fred
bun run test:e2e
```

This will:
1. Build create-fred
2. Generate a test project
3. Test the embedded CLI commands
4. Clean up

### Manual Testing Checklist

1. **Project Generation**
   - [ ] Generate project with default options
   - [ ] Generate project with custom provider
   - [ ] Generate project with --no-install flag
   - [ ] Verify all files are created correctly
   - [ ] Verify dependencies are installed (unless --no-install)

2. **Embedded CLI - Providers**
   - [ ] `fred provider list` shows installed providers
   - [ ] `fred provider add <provider>` installs package
   - [ ] `fred provider add <provider>` updates .env.example
   - [ ] `fred provider remove <provider>` removes package
   - [ ] `fred provider remove <provider>` updates .env.example
   - [ ] Error handling for invalid providers

3. **Embedded CLI - Agents**
   - [ ] `fred agent create` prompts for all fields
   - [ ] Agent file is created in `src/agents/`
   - [ ] Agent is imported in `src/index.ts`
   - [ ] Agent creation call is added to `src/index.ts`
   - [ ] Validation prevents duplicate agent IDs
   - [ ] Kebab-case validation works

4. **Embedded CLI - Tools**
   - [ ] `fred tool create` prompts for all fields
   - [ ] Tool file is created in `src/tools/`
   - [ ] Tool is imported in `src/index.ts`
   - [ ] Tool registration is added to `src/index.ts`
   - [ ] Validation prevents duplicate tool IDs
   - [ ] Kebab-case validation works

5. **Integration**
   - [ ] Generated project can run `bun run dev`
   - [ ] Generated project can run `bun run server`
   - [ ] CLI commands work after project generation
   - [ ] No additional dependencies needed for CLI

## Testing with Local Fred Package

If you're also developing the `fred` package locally:

### Option 1: Use Local Path in package.json

In the generated project's `package.json`, change:

```json
{
  "dependencies": {
    "fred": "file:../../fred"
  }
}
```

Then run `bun install` in the generated project.

### Option 2: Use Bun Link

```bash
# In the fred directory
cd ../fred
bun link

# In the generated project
cd my-test-project
bun link fred
```

### Option 3: Use Workspace (Monorepo Style)

If both repos are in the same parent directory, you can use Bun workspaces:

Create a `package.json` in the parent directory:

```json
{
  "name": "fred-workspace",
  "workspaces": ["fred", "create-fred"]
}
```

## Testing Different Scenarios

### Test with Different Providers

```bash
# Test each supported provider
for provider in openai groq anthropic google mistral; do
  bun run src/index.ts test-$provider --provider $provider --yes
  cd test-$provider
  fred provider list
  cd ..
  rm -rf test-$provider
done
```

### Test Interactive Prompts

```bash
# Test interactive mode (requires manual input)
bun run src/index.ts interactive-test
```

### Test Error Cases

```bash
# Test invalid project name
bun run src/index.ts "invalid/name"

# Test duplicate project
bun run src/index.ts test-project
bun run src/index.ts test-project  # Should fail

# Test invalid provider
bun run src/index.ts test --provider invalid-provider
```

## Debugging

### Enable Verbose Output

Add console.log statements or use a debugger:

```bash
# Run with Bun's debug mode
bun --inspect src/index.ts my-project
```

### Check Generated Files

```bash
# Verify template processing
cd my-test-project
cat package.json | grep -A 5 "bin"
cat src/cli.ts | head -20
```

### Test CLI Directly

```bash
cd my-test-project
bun run src/cli.ts help
bun run src/cli.ts provider list
```

## Continuous Testing

Create a test script that runs automatically:

```bash
#!/bin/bash
# test-all.sh

set -e

echo "Building create-fred..."
bun run build

echo "Testing project generation..."
TEST_DIR="/tmp/fred-test-$$"
bun run dist/index.js "$TEST_DIR" --provider groq --yes

echo "Testing embedded CLI..."
cd "$TEST_DIR"
fred provider list
fred provider add anthropic
fred provider remove anthropic

echo "Cleaning up..."
cd /
rm -rf "$TEST_DIR"

echo "✅ All tests passed!"
```

## Troubleshooting

### "Command not found: create-fred"

- Make sure you've run `bun link` in the create-fred directory
- Or use `bun run src/index.ts` directly

### "Command not found: fred"

- Make sure dependencies were installed (don't use --no-install)
- Check that `package.json` has the `bin` entry
- Run `bun install` in the generated project

### Templates not found

- Make sure `bun run build` copied templates to `dist/templates`
- Check that `build:copy-templates` script ran successfully

### Import errors in generated project

- Verify the `fred` package is installed
- Check that the generated project's `package.json` has correct dependencies
- Ensure `bun install` completed successfully
