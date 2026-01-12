import { mkdir, writeFile, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { ProjectOptions } from './prompts';
import { getProviderPackageName, getProviderEnvVar } from './utils';

// Get template directory - handle both dev and production builds
function getTemplateDir(): string {
  // In development, templates are in src/templates
  // In production build, templates should be copied to dist/templates
  const devPath = join(import.meta.dir, 'templates');
  const prodPath = join(import.meta.dir, '..', 'templates');
  
  if (existsSync(devPath)) {
    return devPath;
  }
  if (existsSync(prodPath)) {
    return prodPath;
  }
  // Fallback: try relative to current file
  return join(import.meta.dir, 'templates');
}

const TEMPLATE_DIR = getTemplateDir();

export interface TemplateVariables {
  PROJECT_NAME: string;
  PROVIDER: string;
  MODEL: string;
  PROVIDER_PACKAGE: string;
  ENV_VAR_NAME: string;
  API_KEY_PLACEHOLDER: string;
  FRED_VERSION: string;
}

/**
 * Process template content by replacing variables
 */
export function processTemplate(content: string, vars: TemplateVariables): string {
  let processed = content;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    processed = processed.replace(regex, value);
  }
  return processed;
}

/**
 * Get template variables from project options
 */
export function getTemplateVariables(options: ProjectOptions): TemplateVariables {
  const providerPackage = getProviderPackageName(options.provider);
  const envVarName = getProviderEnvVar(options.provider);
  const apiKeyPlaceholder = options.apiKey ? options.apiKey : 'your-api-key-here';

  return {
    PROJECT_NAME: options.projectName,
    PROVIDER: options.provider,
    MODEL: options.model,
    PROVIDER_PACKAGE: providerPackage,
    ENV_VAR_NAME: envVarName,
    API_KEY_PLACEHOLDER: apiKeyPlaceholder,
    FRED_VERSION: 'latest', // Will use latest from NPM
  };
}

/**
 * Read template file
 */
async function readTemplateFile(templatePath: string): Promise<string> {
  const fullPath = join(TEMPLATE_DIR, templatePath);
  if (!existsSync(fullPath)) {
    throw new Error(`Template file not found: ${fullPath}`);
  }
  return readFile(fullPath, 'utf-8');
}

/**
 * Write file to destination
 */
async function writeFileToDest(destPath: string, content: string): Promise<void> {
  // Ensure directory exists
  const dir = dirname(destPath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  await writeFile(destPath, content, 'utf-8');
}

/**
 * Copy and process template file
 */
async function copyTemplateFile(
  templatePath: string,
  destPath: string,
  vars: TemplateVariables
): Promise<void> {
  const content = await readTemplateFile(templatePath);
  const processed = processTemplate(content, vars);
  await writeFileToDest(destPath, processed);
}

/**
 * Generate project files
 */
export async function generateProject(
  destPath: string,
  options: ProjectOptions
): Promise<void> {
  const vars = getTemplateVariables(options);

  // Create directory structure
  await mkdir(destPath, { recursive: true });
  await mkdir(join(destPath, 'src'), { recursive: true });
  await mkdir(join(destPath, 'src', 'tools'), { recursive: true });
  await mkdir(join(destPath, 'src', 'agents'), { recursive: true });
  if (options.includeExamples) {
    await mkdir(join(destPath, 'src', 'examples'), { recursive: true });
  }

  // Generate files
  const files: Array<[string, string]> = [
    ['package.json.template', 'package.json'],
    ['tsconfig.json.template', 'tsconfig.json'],
    ['flox.nix.template', 'flox.nix'],
    ['.env.example.template', '.env.example'],
    ['.gitignore.template', '.gitignore'],
    ['README.md.template', 'README.md'],
    ['src/index.ts.template', 'src/index.ts'],
    ['src/dev-chat.ts.template', 'src/dev-chat.ts'],
    ['src/server.ts.template', 'src/server.ts'],
    ['src/config.json.template', 'src/config.json'],
  ];

  if (options.includeExamples) {
    files.push(
      ['src/tools/example-tool.ts.template', 'src/tools/example-tool.ts'],
      ['src/agents/default-agent.ts.template', 'src/agents/default-agent.ts'],
      ['src/examples/basic.ts.template', 'src/examples/basic.ts']
    );
  }

  // Copy and process all template files
  for (const [templatePath, destFile] of files) {
    const dest = join(destPath, destFile);
    await copyTemplateFile(templatePath, dest, vars);
  }

  // Create .env file if API key provided
  if (options.apiKey) {
    const envContent = `${vars.ENV_VAR_NAME}=${options.apiKey}\n`;
    await writeFileToDest(join(destPath, '.env'), envContent);
  }
}

