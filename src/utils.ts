import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Validate project name
 */
export function validateProjectName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Project name cannot be empty' };
  }

  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (invalidChars.test(name)) {
    return {
      valid: false,
      error: 'Project name contains invalid characters',
    };
  }

  // Check for reserved names
  const reservedNames = ['con', 'prn', 'aux', 'nul', 'com1', 'com2', 'com3', 'com4', 'com5', 'com6', 'com7', 'com8', 'com9', 'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9'];
  if (reservedNames.includes(name.toLowerCase())) {
    return {
      valid: false,
      error: 'Project name is a reserved name',
    };
  }

  return { valid: true };
}

/**
 * Check if directory exists
 */
export function directoryExists(path: string): boolean {
  return existsSync(path);
}

/**
 * Get absolute path for project
 */
export function getProjectPath(projectName: string, cwd: string = process.cwd()): string {
  return join(cwd, projectName);
}

/**
 * Get provider package name
 */
export function getProviderPackageName(provider: string): string {
  const providerMap: Record<string, string> = {
    openai: '@ai-sdk/openai',
    groq: '@ai-sdk/groq',
    anthropic: '@ai-sdk/anthropic',
    google: '@ai-sdk/google',
    mistral: '@ai-sdk/mistral',
    cohere: '@ai-sdk/cohere',
    vercel: '@ai-sdk/vercel',
    'azure-openai': '@ai-sdk/azure-openai',
    'azure-anthropic': '@ai-sdk/azure-anthropic',
    azure: '@ai-sdk/azure-openai',
    fireworks: '@ai-sdk/fireworks',
    xai: '@ai-sdk/xai',
    ollama: '@ai-sdk/ollama',
    ai21: '@ai-sdk/ai21',
    nvidia: '@ai-sdk/nvidia',
    bedrock: '@ai-sdk/amazon-bedrock',
    'amazon-bedrock': '@ai-sdk/amazon-bedrock',
    cloudflare: '@ai-sdk/cloudflare',
    elevenlabs: '@ai-sdk/elevenlabs',
    lepton: '@ai-sdk/lepton',
    perplexity: '@ai-sdk/perplexity',
    replicate: '@ai-sdk/replicate',
    together: '@ai-sdk/together',
    upstash: '@ai-sdk/upstash',
  };

  return providerMap[provider.toLowerCase()] || `@ai-sdk/${provider.toLowerCase()}`;
}

/**
 * Get environment variable name for provider
 */
export function getProviderEnvVar(provider: string): string {
  const envMap: Record<string, string> = {
    openai: 'OPENAI_API_KEY',
    groq: 'GROQ_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    google: 'GOOGLE_API_KEY',
    mistral: 'MISTRAL_API_KEY',
    cohere: 'COHERE_API_KEY',
    vercel: 'VERCEL_API_KEY',
    'azure-openai': 'AZURE_OPENAI_API_KEY',
    'azure-anthropic': 'AZURE_ANTHROPIC_API_KEY',
    azure: 'AZURE_OPENAI_API_KEY',
    fireworks: 'FIREWORKS_API_KEY',
    xai: 'XAI_API_KEY',
    ollama: 'OLLAMA_API_KEY',
    ai21: 'AI21_API_KEY',
    nvidia: 'NVIDIA_API_KEY',
    bedrock: 'AWS_ACCESS_KEY_ID',
    'amazon-bedrock': 'AWS_ACCESS_KEY_ID',
    cloudflare: 'CLOUDFLARE_API_KEY',
    elevenlabs: 'ELEVENLABS_API_KEY',
    lepton: 'LEPTON_API_KEY',
    perplexity: 'PERPLEXITY_API_KEY',
    replicate: 'REPLICATE_API_KEY',
    together: 'TOGETHER_API_KEY',
    upstash: 'UPSTASH_API_KEY',
  };

  return envMap[provider.toLowerCase()] || `${provider.toUpperCase()}_API_KEY`;
}

/**
 * Get default model for provider
 */
export function getDefaultModel(provider: string): string {
  const modelMap: Record<string, string> = {
    openai: 'gpt-4o-mini',
    groq: 'llama-3.1-70b-versatile',
    anthropic: 'claude-3-5-sonnet-20241022',
    google: 'gemini-1.5-flash',
    mistral: 'mistral-small-latest',
    cohere: 'command-r',
    vercel: 'claude-3-5-sonnet-20241022',
    'azure-openai': 'gpt-4o-mini',
    'azure-anthropic': 'claude-3-5-sonnet-20241022',
    azure: 'gpt-4o-mini',
    fireworks: 'llama-v3-70b-instruct',
    xai: 'grok-beta',
    ollama: 'llama3.2',
    ai21: 'j2-ultra',
    nvidia: 'meta/llama-3-70b-instruct',
    bedrock: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    'amazon-bedrock': 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    cloudflare: 'llama-3-70b-instruct',
    elevenlabs: 'eleven_turbo_v2_5',
    lepton: 'llama-3-70b-instruct',
    perplexity: 'llama-3.1-sonar-large-128k-online',
    replicate: 'meta/llama-3-70b-instruct',
    together: 'meta/llama-3-70b-instruct',
    upstash: 'meta/llama-3-70b-instruct',
  };

  return modelMap[provider.toLowerCase()] || 'gpt-4o-mini';
}

