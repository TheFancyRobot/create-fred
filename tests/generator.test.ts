import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mkdir, rm, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { processTemplate, getTemplateVariables, generateProject } from '../src/generator';
import { ProjectOptions } from '../src/prompts';

const TEST_DIR = join(process.cwd(), 'test-projects');

describe('generator', () => {
  beforeEach(async () => {
    // Clean up test directory before each test
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
    // Clean up test directory after each test
    try {
      if (existsSync(TEST_DIR)) {
        await rm(TEST_DIR, { recursive: true, force: true });
      }
    } catch (error) {
      // Ignore errors
    }
  });

  describe('processTemplate', () => {
    it('should replace all template variables', () => {
      const template = 'Hello {{PROJECT_NAME}}, using {{PROVIDER}} with {{MODEL}}';
      const vars = {
        PROJECT_NAME: 'test-project',
        PROVIDER: 'openai',
        MODEL: 'gpt-4',
        PROVIDER_PACKAGE: '@ai-sdk/openai',
        ENV_VAR_NAME: 'OPENAI_API_KEY',
        API_KEY_PLACEHOLDER: 'your-key',
        FRED_VERSION: 'latest',
      };

      const result = processTemplate(template, vars);
      expect(result).toBe('Hello test-project, using openai with gpt-4');
    });

    it('should handle multiple occurrences of the same variable', () => {
      const template = '{{PROJECT_NAME}} and {{PROJECT_NAME}}';
      const vars = {
        PROJECT_NAME: 'test',
        PROVIDER: 'openai',
        MODEL: 'gpt-4',
        PROVIDER_PACKAGE: '@ai-sdk/openai',
        ENV_VAR_NAME: 'OPENAI_API_KEY',
        API_KEY_PLACEHOLDER: 'your-key',
        FRED_VERSION: 'latest',
      };

      const result = processTemplate(template, vars);
      expect(result).toBe('test and test');
    });

    it('should leave unmatched variables as-is', () => {
      const template = '{{PROJECT_NAME}} and {{UNKNOWN_VAR}}';
      const vars = {
        PROJECT_NAME: 'test',
        PROVIDER: 'openai',
        MODEL: 'gpt-4',
        PROVIDER_PACKAGE: '@ai-sdk/openai',
        ENV_VAR_NAME: 'OPENAI_API_KEY',
        API_KEY_PLACEHOLDER: 'your-key',
        FRED_VERSION: 'latest',
      };

      const result = processTemplate(template, vars);
      expect(result).toBe('test and {{UNKNOWN_VAR}}');
    });
  });

  describe('getTemplateVariables', () => {
    it('should generate correct template variables', () => {
      const options: ProjectOptions = {
        projectName: 'my-project',
        provider: 'groq',
        model: 'llama-3-70b-8192',
        apiKey: 'test-key',
        includeExamples: true,
        skipInstall: false,
      };

      const vars = getTemplateVariables(options);
      expect(vars.PROJECT_NAME).toBe('my-project');
      expect(vars.PROVIDER).toBe('groq');
      expect(vars.MODEL).toBe('llama-3-70b-8192');
      expect(vars.PROVIDER_PACKAGE).toBe('@ai-sdk/groq');
      expect(vars.ENV_VAR_NAME).toBe('GROQ_API_KEY');
      expect(vars.API_KEY_PLACEHOLDER).toBe('test-key');
      expect(vars.FRED_VERSION).toBe('latest');
    });

    it('should use placeholder when API key is not provided', () => {
      const options: ProjectOptions = {
        projectName: 'my-project',
        provider: 'openai',
        model: 'gpt-4',
        includeExamples: true,
        skipInstall: false,
      };

      const vars = getTemplateVariables(options);
      expect(vars.API_KEY_PLACEHOLDER).toBe('your-api-key-here');
    });
  });

  describe('generateProject', () => {
    it('should generate all required files', async () => {
      const options: ProjectOptions = {
        projectName: 'test-project',
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        includeExamples: true,
        skipInstall: true,
      };

      const projectPath = join(TEST_DIR, options.projectName);
      await generateProject(projectPath, options);

      // Check that required files exist
      expect(existsSync(join(projectPath, 'package.json'))).toBe(true);
      expect(existsSync(join(projectPath, 'tsconfig.json'))).toBe(true);
      expect(existsSync(join(projectPath, '.env.example'))).toBe(true);
      expect(existsSync(join(projectPath, '.gitignore'))).toBe(true);
      expect(existsSync(join(projectPath, 'README.md'))).toBe(true);
      expect(existsSync(join(projectPath, 'src', 'index.ts'))).toBe(true);
      expect(existsSync(join(projectPath, 'src', 'server.ts'))).toBe(true);
      expect(existsSync(join(projectPath, 'src', 'config.json'))).toBe(true);
    });

    it('should generate example files when includeExamples is true', async () => {
      const options: ProjectOptions = {
        projectName: 'test-project',
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        includeExamples: true,
        skipInstall: true,
      };

      const projectPath = join(TEST_DIR, options.projectName);
      await generateProject(projectPath, options);

      expect(existsSync(join(projectPath, 'src', 'tools', 'example-tool.ts'))).toBe(true);
      expect(existsSync(join(projectPath, 'src', 'agents', 'default-agent.ts'))).toBe(true);
      expect(existsSync(join(projectPath, 'src', 'examples', 'basic.ts'))).toBe(true);
    });

    it('should not generate example files when includeExamples is false', async () => {
      const options: ProjectOptions = {
        projectName: 'test-project',
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        includeExamples: false,
        skipInstall: true,
      };

      const projectPath = join(TEST_DIR, options.projectName);
      await generateProject(projectPath, options);

      expect(existsSync(join(projectPath, 'src', 'tools', 'example-tool.ts'))).toBe(false);
      expect(existsSync(join(projectPath, 'src', 'agents', 'default-agent.ts'))).toBe(false);
      expect(existsSync(join(projectPath, 'src', 'examples', 'basic.ts'))).toBe(false);
    });

    it('should create .env file when API key is provided', async () => {
      const options: ProjectOptions = {
        projectName: 'test-project',
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        apiKey: 'test-api-key-123',
        includeExamples: false,
        skipInstall: true,
      };

      const projectPath = join(TEST_DIR, options.projectName);
      await generateProject(projectPath, options);

      const envFile = join(projectPath, '.env');
      expect(existsSync(envFile)).toBe(true);

      const envContent = await readFile(envFile, 'utf-8');
      expect(envContent).toContain('OPENAI_API_KEY=test-api-key-123');
    });

    it('should replace template variables in generated files', async () => {
      const options: ProjectOptions = {
        projectName: 'my-awesome-project',
        provider: 'groq',
        model: 'llama-3-70b-8192',
        includeExamples: false,
        skipInstall: true,
      };

      const projectPath = join(TEST_DIR, options.projectName);
      await generateProject(projectPath, options);

      const packageJson = await readFile(join(projectPath, 'package.json'), 'utf-8');
      expect(packageJson).toContain('"name": "my-awesome-project"');
      expect(packageJson).toContain('"@ai-sdk/groq"');

      const readme = await readFile(join(projectPath, 'README.md'), 'utf-8');
      expect(readme).toContain('# my-awesome-project');
      expect(readme).toContain('groq');
      expect(readme).toContain('llama-3-70b-8192');
    });
  });
});

