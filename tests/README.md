# Tests

This directory contains tests for the `create-fred` CLI tool.

## Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test tests/utils.test.ts
```

## Test Structure

- **`utils.test.ts`** - Tests for utility functions (validation, provider mappings)
- **`generator.test.ts`** - Tests for template processing and file generation
- **`installer.test.ts`** - Tests for dependency installation (basic checks)
- **`integration.test.ts`** - End-to-end integration tests

## Test Coverage

The tests cover:
- Project name validation
- Provider package name mapping
- Environment variable name mapping
- Default model selection
- Template variable replacement
- File generation
- Directory structure creation
- Configuration file generation
- Integration scenarios

## Test Projects

Test projects are created in the `test-projects/` directory (which is gitignored) and cleaned up after each test run.

