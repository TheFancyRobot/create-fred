import { spawn } from 'child_process';
import ora from 'ora';
import kleur from 'kleur';
import { ProjectOptions } from './prompts';

/**
 * Install dependencies using Bun
 * This runs `bun install` which will:
 * 1. Install all dependencies from package.json
 * 2. Set up bin symlinks (for the `fred` CLI command)
 */
export async function installDependencies(
  projectPath: string,
  options: ProjectOptions
): Promise<void> {
  const spinner = ora('Installing dependencies...').start();

  try {
    // Run `bun install` to install all dependencies from package.json
    // This also sets up bin symlinks automatically
    await new Promise<void>((resolve, reject) => {
      const bun = spawn('bun', ['install'], {
        cwd: projectPath,
        stdio: 'pipe',
        shell: true,
      });

      let stderr = '';
      let stdout = '';

      bun.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      bun.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      bun.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Bun install failed: ${stderr || stdout}`));
        }
      });

      bun.on('error', (error) => {
        reject(new Error(`Failed to run bun: ${error.message}`));
      });
    });

    spinner.succeed(kleur.green('Dependencies installed successfully'));
  } catch (error) {
    spinner.fail(kleur.red('Failed to install dependencies'));
    throw error;
  }
}

/**
 * Check if Bun is available
 */
export async function checkBunAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const bun = spawn('bun', ['--version'], {
      stdio: 'pipe',
      shell: true,
    });

    bun.on('close', (code) => {
      resolve(code === 0);
    });

    bun.on('error', () => {
      resolve(false);
    });
  });
}

