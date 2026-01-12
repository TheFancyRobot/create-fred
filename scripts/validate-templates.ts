#!/usr/bin/env bun

/**
 * Script to validate that create-fred templates are compatible with fred
 * Run this after updating fred to ensure templates still work
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const FRED_REPO = process.env.FRED_REPO || '../fred';
const TEMPLATES_DIR = join(import.meta.dir, '..', 'src', 'templates');

interface ImportCheck {
  file: string;
  imports: string[];
  valid: boolean;
  errors: string[];
}

const FRED_EXPORTS = [
  'Fred',
  'Tool',
  'Intent',
  'Action',
  'AgentConfig',
  'AgentInstance',
  'AgentResponse',
  'ToolRegistry',
  'AgentManager',
  'IntentMatcher',
  'IntentRouter',
  'ContextManager',
  'AIProvider',
  'ProviderConfig',
  'OpenAIProvider',
  'GroqProvider',
  'FrameworkConfig',
  'ServerApp', // Exported from server.ts
];

// Sub-path exports (e.g., 'fred/server/app')
const FRED_SUBPATH_EXPORTS: Record<string, string[]> = {
  'server/app': ['ServerApp'],
};

interface ImportInfo {
  imports: string[];
  subpath?: string;
}

function extractImports(content: string): ImportInfo[] {
  const namedImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]fred(?:[\/]([^'"]+))?['"]/g;
  const defaultImportRegex = /import\s+(\w+)\s+from\s+['"]fred(?:[\/]([^'"]+))?['"]/g;
  const results: ImportInfo[] = [];

  let match;
  while ((match = namedImportRegex.exec(content)) !== null) {
    const namedImports = match[1]
      .split(',')
      .map((i) => i.trim().split(/\s+as\s+/)[0].trim());
    results.push({
      imports: namedImports,
      subpath: match[2],
    });
  }

  // Also check for default imports
  while ((match = defaultImportRegex.exec(content)) !== null) {
    results.push({
      imports: ['default'],
      subpath: match[2],
    });
  }

  return results;
}

function checkTemplateFile(filePath: string): ImportCheck {
  const content = readFileSync(filePath, 'utf-8');
  const importInfos = extractImports(content);
  const errors: string[] = [];
  const allImports: string[] = [];

  for (const importInfo of importInfos) {
    allImports.push(...importInfo.imports);

    // Check subpath exports if applicable
    if (importInfo.subpath) {
      const subpathExports = FRED_SUBPATH_EXPORTS[importInfo.subpath];
      if (!subpathExports) {
        errors.push(`Unknown subpath: fred/${importInfo.subpath}`);
      } else {
        for (const imp of importInfo.imports) {
          if (imp === 'default') continue;
          if (!subpathExports.includes(imp)) {
            errors.push(`Unknown export in fred/${importInfo.subpath}: ${imp}`);
          }
        }
      }
    } else {
      // Check main exports
      for (const imp of importInfo.imports) {
        if (imp === 'default') continue;
        if (!FRED_EXPORTS.includes(imp)) {
          errors.push(`Unknown export: ${imp}`);
        }
      }
    }
  }

  return {
    file: filePath,
    imports: allImports,
    valid: errors.length === 0,
    errors,
  };
}

function findAllTemplates(dir: string): string[] {
  const files: string[] = [];

  function walkDir(currentDir: string) {
    const entries = readdirSync(currentDir);

    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.endsWith('.template')) {
        files.push(fullPath);
      }
    }
  }

  walkDir(dir);
  return files;
}

async function main() {
  console.log('🔍 Validating create-fred templates against Fred exports...\n');

  if (!existsSync(TEMPLATES_DIR)) {
    console.error(`❌ Templates directory not found: ${TEMPLATES_DIR}`);
    process.exit(1);
  }

  const templateFiles = findAllTemplates(TEMPLATES_DIR);
  const results: ImportCheck[] = [];

  for (const file of templateFiles) {
    const result = checkTemplateFile(file);
    results.push(result);
  }

  // Report results
  let allValid = true;
  console.log('📋 Validation Results:\n');

  for (const result of results) {
    const relativePath = result.file.replace(join(import.meta.dir, '..'), '');
    if (result.valid) {
      console.log(`✅ ${relativePath}`);
      if (result.imports.length > 0) {
        console.log(`   Imports: ${result.imports.join(', ')}`);
      }
    } else {
      console.log(`❌ ${relativePath}`);
      console.log(`   Imports: ${result.imports.join(', ')}`);
      for (const error of result.errors) {
        console.log(`   ⚠️  ${error}`);
      }
      allValid = false;
    }
    console.log('');
  }

  if (!allValid) {
    console.log('❌ Some templates have invalid imports!');
    console.log('\n💡 Tip: Run this after updating fred to catch breaking changes early.');
    process.exit(1);
  }

  console.log('✅ All templates are valid!');
  console.log('\n📦 Available Fred exports:');
  console.log(FRED_EXPORTS.map((e) => `   - ${e}`).join('\n'));
}

if (import.meta.main) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

