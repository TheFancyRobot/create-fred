import prompts from 'prompts';
import { getDefaultModel, getProviderPackageName } from './utils';
import { fetchModelsFromProvider } from './model-fetcher';
import kleur from 'kleur';

export interface ProjectOptions {
  projectName: string;
  provider: string;
  model: string;
  apiKey?: string;
  includeExamples: boolean;
  skipInstall: boolean;
}

const PROVIDERS = [
  { title: 'OpenAI', value: 'openai', description: 'GPT-3.5, GPT-4, and more' },
  { title: 'Groq', value: 'groq', description: 'Fast inference with Llama models' },
  { title: 'Anthropic', value: 'anthropic', description: 'Claude models' },
  { title: 'Google', value: 'google', description: 'Gemini models' },
  { title: 'Mistral', value: 'mistral', description: 'Mistral AI models' },
  { title: 'Cohere', value: 'cohere', description: 'Command models' },
  { title: 'Vercel AI', value: 'vercel', description: 'Vercel AI SDK' },
  { title: 'Azure OpenAI', value: 'azure-openai', description: 'Azure-hosted OpenAI' },
  { title: 'Fireworks', value: 'fireworks', description: 'Fireworks AI' },
  { title: 'xAI', value: 'xai', description: 'Grok models' },
  { title: 'Ollama', value: 'ollama', description: 'Local models' },
  { title: 'Perplexity', value: 'perplexity', description: 'Perplexity AI' },
  { title: 'Replicate', value: 'replicate', description: 'Replicate models' },
  { title: 'Together AI', value: 'together', description: 'Together AI models' },
];

const MODELS_BY_PROVIDER: Record<string, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
  groq: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma-7b-it'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
  google: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro', 'gemini-pro-vision'],
  mistral: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest', 'pixtral-12b-2409'],
  cohere: ['command-r-plus', 'command-r', 'command', 'command-light'],
  vercel: ['claude-3-5-sonnet-20241022'],
  'azure-openai': ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
  fireworks: ['llama-v3-70b-instruct', 'llama-v3-8b-instruct', 'llama-v3.1-70b-instruct', 'llama-v3.1-8b-instruct'],
  xai: ['grok-beta', 'grok-2-vision-1212', 'grok-2-1212'],
  ollama: ['llama3.2', 'llama3.1', 'llama2', 'mistral', 'codellama', 'phi3'],
  perplexity: ['llama-3.1-sonar-large-128k-online', 'llama-3.1-sonar-small-128k-online', 'llama-3.1-sonar-huge-128k-online'],
  replicate: ['meta/llama-3-70b-instruct', 'meta/llama-3-8b-instruct', 'meta/llama-3.1-70b-instruct', 'meta/llama-3.1-8b-instruct'],
  together: ['meta/llama-3-70b-instruct', 'meta/llama-3-8b-instruct', 'meta/llama-3.1-70b-instruct', 'meta/llama-3.1-8b-instruct'],
};

export async function collectProjectOptions(
  flags: Partial<ProjectOptions>
): Promise<ProjectOptions> {
  const options: Partial<ProjectOptions> = { ...flags };

  // Project name
  if (!options.projectName) {
    const nameResponse = await prompts({
      type: 'text',
      name: 'projectName',
      message: 'What is your project name?',
      initial: 'my-fred-project',
      validate: (value: string) => {
        if (!value || value.trim().length === 0) {
          return 'Project name cannot be empty';
        }
        return true;
      },
    });

    if (!nameResponse.projectName) {
      process.exit(1);
    }

    options.projectName = nameResponse.projectName;
  }

  // Provider selection
  if (!options.provider) {
    const providerResponse = await prompts({
      type: 'select',
      name: 'provider',
      message: 'Which AI provider would you like to use?',
      choices: PROVIDERS,
      initial: 0,
    });

    if (!providerResponse.provider) {
      process.exit(1);
    }

    options.provider = providerResponse.provider;
  }

  // API key (optional, but needed for dynamic model fetching)
  if (!options.apiKey) {
    const apiKeyResponse = await prompts({
      type: 'text',
      name: 'apiKey',
      message: `Enter your ${options.provider} API key (optional, can be set later):`,
      initial: '',
    });

    options.apiKey = apiKeyResponse.apiKey || undefined;
  }

  // Model selection (with dynamic fetching if API key is provided)
  if (!options.model) {
    let models = MODELS_BY_PROVIDER[options.provider] || [getDefaultModel(options.provider)];
    
    // Try to fetch models dynamically if API key is provided
    if (options.apiKey && options.apiKey.trim()) {
      const fetchedModels = await fetchModelsFromProvider(options.provider, options.apiKey.trim());
      
      if (fetchedModels && fetchedModels.length > 0) {
        models = fetchedModels;
      } else {
        console.log(kleur.yellow('\n⚠ Using default model list (API fetch failed or not supported)\n'));
      }
    }

    const modelResponse = await prompts({
      type: 'select',
      name: 'model',
      message: 'Which model would you like to use?',
      choices: models.map((model) => ({ title: model, value: model })),
      initial: 0,
    });

    if (!modelResponse.model) {
      process.exit(1);
    }

    options.model = modelResponse.model;
  }

  // Include examples
  if (options.includeExamples === undefined) {
    const examplesResponse = await prompts({
      type: 'confirm',
      name: 'includeExamples',
      message: 'Include example tools and agents?',
      initial: true,
    });

    options.includeExamples = examplesResponse.includeExamples ?? true;
  }

  return {
    projectName: options.projectName!,
    provider: options.provider!,
    model: options.model!,
    apiKey: options.apiKey,
    includeExamples: options.includeExamples ?? true,
    skipInstall: options.skipInstall ?? false,
  };
}

export function showWelcomeMessage(): void {
  console.log(kleur.bold().cyan('\n╔══════════════════════════════════════╗'));
  console.log(kleur.bold().cyan('║        Welcome to Fred! 🎉          ║'));
  console.log(kleur.bold().cyan('╚══════════════════════════════════════╝\n'));
  console.log(kleur.gray('Let\'s create your AI agent project.\n'));
}

export function showSuccessMessage(projectName: string, projectPath: string, skipInstall: boolean = false): void {
  console.log(kleur.bold().green('\n✅ Project created successfully!\n'));
  console.log(kleur.bold('Next steps:'));
  console.log(kleur.gray(`  cd ${projectName}`));
  
  if (skipInstall) {
    console.log(kleur.gray('  bun install  # Install dependencies'));
  }
  
  if (!process.env[`${projectName.toUpperCase().replace(/-/g, '_')}_API_KEY`]) {
    console.log(kleur.gray('  # Set your API key in .env file'));
  }
  
  console.log(kleur.gray('  bun run dev  # Start development chat\n'));
  console.log(kleur.bold('CLI Commands:'));
  console.log(kleur.gray('  fred provider add <provider>  # Add an AI provider'));
  console.log(kleur.gray('  fred agent create            # Create a new agent'));
  console.log(kleur.gray('  fred tool create             # Create a new tool'));
  console.log(kleur.gray('  fred help                    # Show all commands\n'));
  console.log(kleur.dim(`Project location: ${projectPath}\n`));
}

