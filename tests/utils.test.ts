import { describe, it, expect } from 'bun:test';
import {
  validateProjectName,
  getProviderPackageName,
  getProviderEnvVar,
  getDefaultModel,
} from '../src/utils';

describe('utils', () => {
  describe('validateProjectName', () => {
    it('should validate a valid project name', () => {
      const result = validateProjectName('my-project');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty project name', () => {
      const result = validateProjectName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject project name with invalid characters', () => {
      const result = validateProjectName('my<project>');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('invalid characters');
    });

    it('should reject reserved names', () => {
      const result = validateProjectName('con');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('reserved');
    });

    it('should accept names with hyphens and underscores', () => {
      expect(validateProjectName('my-project').valid).toBe(true);
      expect(validateProjectName('my_project').valid).toBe(true);
      expect(validateProjectName('myProject123').valid).toBe(true);
    });
  });

  describe('getProviderPackageName', () => {
    it('should return correct package name for openai', () => {
      expect(getProviderPackageName('openai')).toBe('@ai-sdk/openai');
    });

    it('should return correct package name for groq', () => {
      expect(getProviderPackageName('groq')).toBe('@ai-sdk/groq');
    });

    it('should return correct package name for anthropic', () => {
      expect(getProviderPackageName('anthropic')).toBe('@ai-sdk/anthropic');
    });

    it('should handle case-insensitive provider names', () => {
      expect(getProviderPackageName('OPENAI')).toBe('@ai-sdk/openai');
      expect(getProviderPackageName('Groq')).toBe('@ai-sdk/groq');
    });

    it('should return default format for unknown providers', () => {
      expect(getProviderPackageName('unknown')).toBe('@ai-sdk/unknown');
    });

    it('should handle azure alias', () => {
      expect(getProviderPackageName('azure')).toBe('@ai-sdk/azure-openai');
    });
  });

  describe('getProviderEnvVar', () => {
    it('should return correct env var for openai', () => {
      expect(getProviderEnvVar('openai')).toBe('OPENAI_API_KEY');
    });

    it('should return correct env var for groq', () => {
      expect(getProviderEnvVar('groq')).toBe('GROQ_API_KEY');
    });

    it('should handle case-insensitive provider names', () => {
      expect(getProviderEnvVar('OPENAI')).toBe('OPENAI_API_KEY');
      expect(getProviderEnvVar('Groq')).toBe('GROQ_API_KEY');
    });

    it('should return default format for unknown providers', () => {
      expect(getProviderEnvVar('unknown')).toBe('UNKNOWN_API_KEY');
    });

    it('should handle azure alias', () => {
      expect(getProviderEnvVar('azure')).toBe('AZURE_OPENAI_API_KEY');
    });
  });

  describe('getDefaultModel', () => {
    it('should return correct default model for openai', () => {
      expect(getDefaultModel('openai')).toBe('gpt-3.5-turbo');
    });

    it('should return correct default model for groq', () => {
      expect(getDefaultModel('groq')).toBe('llama-3-70b-8192');
    });

    it('should return correct default model for anthropic', () => {
      expect(getDefaultModel('anthropic')).toBe('claude-3-5-sonnet-20241022');
    });

    it('should handle case-insensitive provider names', () => {
      expect(getDefaultModel('OPENAI')).toBe('gpt-3.5-turbo');
      expect(getDefaultModel('Groq')).toBe('llama-3-70b-8192');
    });

    it('should return gpt-3.5-turbo as fallback for unknown providers', () => {
      expect(getDefaultModel('unknown')).toBe('gpt-3.5-turbo');
    });
  });
});

