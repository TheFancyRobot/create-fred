import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mkdir, rm, readFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { generateProject } from '../src/generator';
import { ProjectOptions } from '../src/prompts';
import { validateProjectName, getProviderPackageName, getProviderEnvVar } from '../src/utils';

const TEST_DIR = join(process.cwd(), 'test-projects');

describe('Integration Tests', () => {
  beforeEach(async () => {
    try {
      if (existsSync(TEST_DIR)) {
        await rm(TEST_DIR, { recursive: true, force: true });
      }
      await mkdir(TEST_DIR, { recursive: true });
    } catch (error) {
      // Ignore errors
    }
  });

  afterEach(async () => {
    try {
      if (existsSync(TEST_DIR)) {
        await rm(TEST_DIR, { recursive: true, force: true });
      }
    } catch (error) {
      // Ignore errors
    }
  });

  it('should generate a complete project with all features', async () => {
    const options: ProjectOptions = {
      projectName: 'integration-test-project',
      provider: 'openai',
      model: 'gpt-4',
      apiKey: 'test-key-123',
      includeExamples: true,
      skipInstall: true,
    };

    const projectPath = join(TEST_DIR, options.projectName);

    // Validate project name
    const validation = validateProjectName(options.projectName);
    expect(validation.valid).toBe(true);

    // Generate project
    await generateProject(projectPath, options);

    // Verify all files exist
    const expectedFiles = [
      'package.json',
      'tsconfig.json',
      '.env.example',
      '.env',
      '.gitignore',
      'README.md',
      'src/index.ts',
      'src/server.ts',
      'src/config.json',
      'src/tools/example-tool.ts',
      'src/agents/default-agent.ts',
      'src/examples/basic.ts',
    ];

    for (const file of expectedFiles) {
      const filePath = join(projectPath, file);
      expect(existsSync(filePath)).toBe(true);
    }

    // Verify package.json content
    const packageJson = JSON.parse(await readFile(join(projectPath, 'package.json'), 'utf-8'));
    expect(packageJson.name).toBe('integration-test-project');
    expect(packageJson.dependencies).toHaveProperty('fred');
    expect(packageJson.dependencies).toHaveProperty('@ai-sdk/openai');
    expect(packageJson.dependencies).toHaveProperty('ai');

    // Verify .env content
    const envContent = await readFile(join(projectPath, '.env'), 'utf-8');
    expect(envContent).toContain('OPENAI_API_KEY=test-key-123');

    // Verify README contains project-specific information
    const readme = await readFile(join(projectPath, 'README.md'), 'utf-8');
    expect(readme).toContain('integration-test-project');
    expect(readme).toContain('openai');
    expect(readme).toContain('gpt-4');

    // Verify src/index.ts contains provider and model
    const indexTs = await readFile(join(projectPath, 'src/index.ts'), 'utf-8');
    expect(indexTs).toContain('openai');
    expect(indexTs).toContain('gpt-4');
  });

  it('should generate project with different providers correctly', async () => {
    const providers = ['groq', 'anthropic', 'google'];

    for (const provider of providers) {
      const options: ProjectOptions = {
        projectName: `test-${provider}`,
        provider,
        model: 'test-model',
        includeExamples: false,
        skipInstall: true,
      };

      const projectPath = join(TEST_DIR, options.projectName);
      await generateProject(projectPath, options);

      // Verify provider package is correct
      const packageJson = JSON.parse(await readFile(join(projectPath, 'package.json'), 'utf-8'));
      const expectedPackage = getProviderPackageName(provider);
      expect(packageJson.dependencies).toHaveProperty(expectedPackage);

      // Verify env var is correct
      const envExample = await readFile(join(projectPath, '.env.example'), 'utf-8');
      const expectedEnvVar = getProviderEnvVar(provider);
      expect(envExample).toContain(expectedEnvVar);

      // Clean up
      await rm(projectPath, { recursive: true, force: true });
    }
  });

  it('should generate valid TypeScript configuration', async () => {
    const options: ProjectOptions = {
      projectName: 'typescript-test',
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      includeExamples: false,
      skipInstall: true,
    };

    const projectPath = join(TEST_DIR, options.projectName);
    await generateProject(projectPath, options);

    const tsconfig = JSON.parse(await readFile(join(projectPath, 'tsconfig.json'), 'utf-8'));
    expect(tsconfig.compilerOptions).toBeDefined();
    expect(tsconfig.compilerOptions.target).toBe('ES2022');
    expect(tsconfig.compilerOptions.module).toBe('ESNext');
    expect(tsconfig.include).toContain('src/**/*');
  });

  it('should generate valid config.json structure', async () => {
    const options: ProjectOptions = {
      projectName: 'config-test',
      provider: 'openai',
      model: 'gpt-4',
      includeExamples: false,
      skipInstall: true,
    };

    const projectPath = join(TEST_DIR, options.projectName);
    await generateProject(projectPath, options);

    const config = JSON.parse(await readFile(join(projectPath, 'src/config.json'), 'utf-8'));
    expect(config.intents).toBeDefined();
    expect(Array.isArray(config.intents)).toBe(true);
    expect(config.agents).toBeDefined();
    expect(Array.isArray(config.agents)).toBe(true);
    expect(config.tools).toBeDefined();
    expect(Array.isArray(config.tools)).toBe(true);
    expect(config.defaultAgentId).toBeDefined();
  });
});

