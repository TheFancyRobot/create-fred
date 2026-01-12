# create-fred

CLI tool to scaffold new [Fred](https://github.com/yourusername/fred) projects - A flexible framework for building AI agents with intent-based routing.

## Installation

```bash
# Using Bun
bunx create-fred my-project

# Using npm
npx create-fred my-project

# Using pnpm
pnpm create fred my-project

# Using yarn
yarn create fred my-project
```

## Usage

### Interactive Mode

Run without arguments to use interactive prompts:

```bash
bunx create-fred
```

The CLI will ask you:
- Project name
- AI provider (OpenAI, Groq, Anthropic, etc.)
- Model selection
- API key (optional)
- Whether to include examples

### Command-Line Flags

You can also provide options via flags:

```bash
bunx create-fred my-agent \
  --provider groq \
  --model llama-3-70b-8192 \
  --api-key your-api-key-here
```

### Options

- `-n, --name <name>` - Project name
- `-p, --provider <provider>` - AI provider (openai, groq, anthropic, etc.)
- `-m, --model <model>` - Model name (e.g., gpt-4, llama-3-70b-8192)
- `-k, --api-key <key>` - API key (will be added to .env)
- `--no-install` - Skip dependency installation
- `-t, --template <name>` - Template name (default: "default")
- `-y, --yes` - Skip all prompts, use defaults
- `-h, --help` - Show help message

### Examples

```bash
# Create a project with OpenAI
bunx create-fred my-agent --provider openai --model gpt-4

# Create a project with Groq
bunx create-fred my-agent --provider groq --model llama-3-70b-8192

# Create a project with all defaults (non-interactive)
bunx create-fred my-agent --yes

# Create a project without installing dependencies
bunx create-fred my-agent --no-install
```

### After Project Creation

Once your project is created, dependencies are automatically installed and you can immediately use the embedded CLI:

```bash
cd my-agent

# Use the fred CLI to manage your project
fred provider add anthropic
fred agent create
fred tool create
```

## What Gets Created

The CLI scaffolds a complete Fred project with:

- **Project structure**: TypeScript configuration, package.json, and source directories
- **Example code**: Basic agent setup with tools, intents, and a default agent
- **Server mode**: HTTP server with OpenAI-compatible chat API
- **Configuration files**: Example config.json for declarative setup
- **Environment setup**: .env.example with provider-specific variables
- **Flox configuration**: `flox.nix` for consistent development environments (optional)
- **Embedded CLI**: Built-in `fred` command for managing your project
- **Documentation**: README with getting started instructions

### Development Environment with Flox

Projects created with `create-fred` include a `flox.nix` file for consistent development environments:

```bash
cd my-project

# Activate Flox environment (optional)
flox activate

# Install dependencies
bun install

# Start development
bun run dev
```

Flox provides:
- Consistent Bun version across all developers
- Isolated development environment
- Easy team onboarding

**Note**: Flox is optional. You can use Bun directly if preferred.

### Embedded CLI Commands

After creating a project, you can use the embedded `fred` CLI to manage your project:

```bash
# Add a new AI provider
fred provider add groq

# Remove a provider
fred provider remove openai

# List installed providers
fred provider list

# Create a new agent (interactive)
fred agent create

# Create a new tool (interactive)
fred tool create

# Show help
fred help
```

**Note**: Dependencies are automatically installed during project creation, so the `fred` CLI is ready to use immediately!

## Supported Providers

- OpenAI
- Groq
- Anthropic
- Google
- Mistral
- Cohere
- Vercel AI
- Azure OpenAI
- Fireworks
- xAI
- Ollama
- Perplexity
- Replicate
- Together AI
- And more...

## Development

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run with coverage
bun test --coverage
```

## Requirements

- [Bun](https://bun.sh) runtime (for running the generated project)
- [Flox](https://flox.dev) (optional, for consistent development environments)
- AI provider API key

## License

MIT

