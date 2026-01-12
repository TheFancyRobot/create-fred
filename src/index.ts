#!/usr/bin/env bun

import { parseArgs } from 'util';
import { validateProjectName, directoryExists, getProjectPath } from './utils';
import { showWelcomeMessage, showSuccessMessage, collectProjectOptions, ProjectOptions } from './prompts';
import { generateProject } from './generator';
import { installDependencies, checkBunAvailable } from './installer';
import kleur from 'kleur';
import ora from 'ora';

interface CLIArgs {
  name?: string;
  provider?: string;
  model?: string;
  'api-key'?: string;
  'no-install'?: boolean;
  template?: string;
  yes?: boolean;
  help?: boolean;
}

function parseCLIArgs(): CLIArgs {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      name: { type: 'string', short: 'n' },
      provider: { type: 'string', short: 'p' },
      model: { type: 'string', short: 'm' },
      'api-key': { type: 'string', short: 'k' },
      'no-install': { type: 'boolean' },
      template: { type: 'string', short: 't' },
      yes: { type: 'boolean', short: 'y' },
      help: { type: 'boolean', short: 'h' },
    },
    strict: false,
  });

  return values as CLIArgs;
}

function showHelp(): void {
  console.log(kleur.bold('Usage: create-fred [options] [project-name]\n'));
  console.log(kleur.bold('Options:'));
  console.log('  -n, --name <name>          Project name');
  console.log('  -p, --provider <provider> AI provider (openai, groq, anthropic, etc.)');
  console.log('  -m, --model <model>        Model name (e.g., gpt-4o, llama-3.1-70b-versatile)');
  console.log('  -k, --api-key <key>       API key (will be added to .env)');
  console.log('  --no-install              Skip dependency installation');
  console.log('  -t, --template <name>      Template name (default: "default")');
  console.log('  -y, --yes                  Skip all prompts, use defaults');
  console.log('  -h, --help                 Show this help message\n');
  console.log(kleur.bold('Examples:'));
  console.log('  create-fred my-agent');
  console.log('  create-fred my-agent --provider groq --model llama-3.1-70b-versatile');
  console.log('  create-fred my-agent --yes\n');
}

async function main(): Promise<void> {
  const args = parseCLIArgs();

  // Show help
  if (args.help) {
    showHelp();
    process.exit(0);
  }

  // Show welcome message
  showWelcomeMessage();

  // Check if Bun is available
  const bunAvailable = await checkBunAvailable();
  if (!bunAvailable) {
    console.error(kleur.red('Error: Bun is not installed or not in PATH.'));
    console.error(kleur.gray('Please install Bun from https://bun.sh'));
    process.exit(1);
  }

  // Get project name from args or first positional argument
  const projectName = args.name || process.argv[2];

  // Prepare options from flags
  // Note: skipInstall defaults to false - dependencies are installed by default
  const flagOptions: Partial<ProjectOptions> = {
    projectName,
    provider: args.provider,
    model: args.model,
    apiKey: args['api-key'],
    skipInstall: args['no-install'] || false, // Only skip if --no-install flag is provided
    includeExamples: true, // Default to true
  };

  // Collect project options (prompts if not provided via flags, or use defaults if --yes)
  let options: ProjectOptions;
  if (args.yes) {
    // Use defaults
    options = {
      projectName: projectName || 'my-fred-project',
      provider: args.provider || 'openai',
      model: args.model || 'gpt-4o-mini',
      apiKey: args['api-key'],
      includeExamples: true,
      skipInstall: args['no-install'] || false,
    };
  } else {
    options = await collectProjectOptions(flagOptions);
  }

  // Validate project name
  const validation = validateProjectName(options.projectName);
  if (!validation.valid) {
    console.error(kleur.red(`Error: ${validation.error}`));
    process.exit(1);
  }

  // Get project path
  const projectPath = getProjectPath(options.projectName);

  // Check if directory exists
  if (directoryExists(projectPath)) {
    console.error(kleur.red(`Error: Directory "${options.projectName}" already exists.`));
    process.exit(1);
  }

  // Generate project
  const spinner = ora('Creating project...').start();
  try {
    await generateProject(projectPath, options);
    spinner.succeed(kleur.green('Project created'));
  } catch (error) {
    spinner.fail(kleur.red('Failed to create project'));
    console.error(error);
    process.exit(1);
  }

  // Install dependencies (runs by default unless --no-install is specified)
  if (!options.skipInstall) {
    try {
      await installDependencies(projectPath, options);
    } catch (error) {
      console.error(kleur.yellow('Warning: Failed to install dependencies.'));
      console.error(kleur.gray('You can install them manually with: bun install'));
      console.error(error);
      // Don't exit - let user know they can install manually
    }
  } else {
    console.log(kleur.yellow('Skipping dependency installation (--no-install flag used)'));
    console.log(kleur.gray('Run "bun install" in the project directory to install dependencies.'));
  }

  // Show success message
  showSuccessMessage(options.projectName, projectPath, options.skipInstall);
}

// Run if this is the main module
if (import.meta.main) {
  main().catch((error) => {
    console.error(kleur.red('Fatal error:'), error);
    process.exit(1);
  });
}

