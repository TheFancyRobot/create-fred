import kleur from 'kleur';
import ora from 'ora';

/**
 * Fetch available models from a provider's API
 */
export async function fetchModelsFromProvider(
  provider: string,
  apiKey: string
): Promise<string[] | null> {
  const spinner = ora('Fetching available models...').start();

  try {
    let models: string[] | null = null;

    switch (provider.toLowerCase()) {
      case 'openai':
        models = await fetchOpenAIModels(apiKey);
        break;
      case 'groq':
        models = await fetchGroqModels(apiKey);
        break;
      case 'anthropic':
        models = await fetchAnthropicModels(apiKey);
        break;
      case 'google':
        models = await fetchGoogleModels(apiKey);
        break;
      case 'mistral':
        models = await fetchMistralModels(apiKey);
        break;
      case 'cohere':
        models = await fetchCohereModels(apiKey);
        break;
      case 'fireworks':
        models = await fetchFireworksModels(apiKey);
        break;
      case 'xai':
        models = await fetchXaiModels(apiKey);
        break;
      case 'perplexity':
        models = await fetchPerplexityModels(apiKey);
        break;
      // Note: Some providers like Ollama, Replicate, Together don't have simple model list APIs
      // or require different authentication, so we'll skip them
      default:
        spinner.stop();
        return null;
    }

    if (models && models.length > 0) {
      spinner.succeed(kleur.green(`Found ${models.length} available models`));
      return models;
    } else {
      spinner.warn(kleur.yellow('No models found or API returned empty list'));
      return null;
    }
  } catch (error: any) {
    spinner.fail(kleur.yellow('Failed to fetch models from API'));
    if (error.message) {
      spinner.info(kleur.gray(`Error: ${error.message}`));
    }
    return null;
  }
}

/**
 * Fetch OpenAI models
 */
async function fetchOpenAIModels(apiKey: string): Promise<string[] | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const models = data.data
      ?.filter((model: any) => {
        const id = model.id.toLowerCase();
        // Filter for chat models (gpt-3.5, gpt-4, etc.)
        return (
          id.startsWith('gpt-') &&
          !id.includes('instruct') &&
          !id.includes('vision') &&
          !id.includes('embedding')
        );
      })
      .map((model: any) => model.id)
      .sort();

    return models || null;
  } catch (error: any) {
    throw new Error(`Failed to fetch OpenAI models: ${error.message}`);
  }
}

/**
 * Fetch Groq models
 */
async function fetchGroqModels(apiKey: string): Promise<string[] | null> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const models = data.data
      ?.map((model: any) => model.id)
      .filter((id: string) => !id.includes('embedding'))
      .sort();

    return models || null;
  } catch (error: any) {
    throw new Error(`Failed to fetch Groq models: ${error.message}`);
  }
}

/**
 * Fetch Anthropic models
 * Note: Anthropic doesn't have a public models endpoint, so we return known models
 * We validate the API key format instead of making a request
 */
async function fetchAnthropicModels(apiKey: string): Promise<string[] | null> {
  // Anthropic doesn't provide a models list API
  // Validate API key format (starts with 'sk-ant-')
  if (!apiKey.startsWith('sk-ant-')) {
    throw new Error('Invalid Anthropic API key format');
  }

  // Return known available models
  return [
    'claude-3-5-sonnet-20241022',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
  ];
}

/**
 * Fetch Google models
 */
async function fetchGoogleModels(apiKey: string): Promise<string[] | null> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const models = data.models
      ?.filter((model: any) => {
        const name = model.name.toLowerCase();
        return name.includes('gemini') && !name.includes('embedding');
      })
      .map((model: any) => model.name.replace('models/', ''))
      .sort();

    return models || null;
  } catch (error: any) {
    throw new Error(`Failed to fetch Google models: ${error.message}`);
  }
}

/**
 * Fetch Mistral models
 */
async function fetchMistralModels(apiKey: string): Promise<string[] | null> {
  try {
    const response = await fetch('https://api.mistral.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const models = data.data
      ?.map((model: any) => model.id)
      .filter((id: string) => !id.includes('embed'))
      .sort();

    return models || null;
  } catch (error: any) {
    throw new Error(`Failed to fetch Mistral models: ${error.message}`);
  }
}

/**
 * Fetch Cohere models
 */
async function fetchCohereModels(apiKey: string): Promise<string[] | null> {
  try {
    const response = await fetch('https://api.cohere.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const models = data.models
      ?.filter((model: any) => {
        const name = model.name.toLowerCase();
        return name.includes('command') || name.includes('chat');
      })
      .map((model: any) => model.name)
      .sort();

    return models || null;
  } catch (error: any) {
    throw new Error(`Failed to fetch Cohere models: ${error.message}`);
  }
}

/**
 * Fetch Fireworks models
 */
async function fetchFireworksModels(apiKey: string): Promise<string[] | null> {
  try {
    const response = await fetch('https://api.fireworks.ai/inference/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Fireworks API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const models = data.data
      ?.map((model: any) => model.id)
      .filter((id: string) => !id.includes('embed'))
      .sort();

    return models || null;
  } catch (error: any) {
    throw new Error(`Failed to fetch Fireworks models: ${error.message}`);
  }
}

/**
 * Fetch xAI models
 */
async function fetchXaiModels(apiKey: string): Promise<string[] | null> {
  try {
    const response = await fetch('https://api.x.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`xAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const models = data.data?.map((model: any) => model.id).sort();

    return models || null;
  } catch (error: any) {
    throw new Error(`Failed to fetch xAI models: ${error.message}`);
  }
}

/**
 * Fetch Perplexity models
 */
async function fetchPerplexityModels(apiKey: string): Promise<string[] | null> {
  try {
    const response = await fetch('https://api.perplexity.ai/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const models = data.data?.map((model: any) => model.id).sort();

    return models || null;
  } catch (error: any) {
    throw new Error(`Failed to fetch Perplexity models: ${error.message}`);
  }
}
