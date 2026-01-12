import { describe, it, expect, mock } from 'bun:test';
import { checkBunAvailable } from '../src/installer';
import { spawn } from 'child_process';

describe('installer', () => {
  describe('checkBunAvailable', () => {
    it('should return true if bun is available', async () => {
      // This test assumes Bun is installed (since we're running tests with Bun)
      const available = await checkBunAvailable();
      expect(available).toBe(true);
    });
  });

  // Note: Testing installDependencies would require mocking spawn
  // which is complex. In a real scenario, you might want to:
  // 1. Mock the spawn function
  // 2. Test the command construction
  // 3. Test error handling
  // For now, we'll skip this as it requires more complex setup
});

