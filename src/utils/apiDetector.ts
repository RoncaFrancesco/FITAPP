import { AIProvider, AIProviderConfig } from '../types';

export interface APIDetectionResult {
  provider: AIProvider;
  confidence: number;
  baseUrl?: string;
  model?: string;
  notes?: string;
}

export class APIDetector {
  private static patterns = {
    openai: {
      keyPatterns: [/^sk-/, /^sk-proj-/],
      urlPatterns: [
        /api\.openai\.com/,
        /openai\.com/,
        /oai\.herokuapp\.com/
      ],
      defaultBaseUrl: 'https://api.openai.com/v1',
      defaultModel: 'gpt-3.5-turbo',
      models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-4o']
    },
    google: {
      keyPatterns: [/^AIza[0-9A-Za-z\-_]{35}$/],
      urlPatterns: [
        /generativelanguage\.googleapis\.com/,
        /googleapis\.com/
      ],
      defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      defaultModel: 'gemini-pro',
      models: ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash']
    },
    claude: {
      keyPatterns: [/^sk-ant-api03-/, /^sk-ant-api02-/],
      urlPatterns: [
        /api\.anthropic\.com/,
        /anthropic\.com/,
        /claude\.ai/
      ],
      defaultBaseUrl: 'https://api.anthropic.com/v1',
      defaultModel: 'claude-3-sonnet-20240229',
      models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307']
    },
    mistral: {
      keyPatterns: [/^[a-zA-Z0-9]{32,}$/],
      urlPatterns: [
        /api\.mistral\.ai/,
        /mistral\.ai/
      ],
      defaultBaseUrl: 'https://api.mistral.ai/v1',
      defaultModel: 'mistral-small-latest',
      models: ['mistral-large-latest', 'mistral-small-latest', 'mistral-medium-latest', 'codestral-latest']
    },
    openrouter: {
      keyPatterns: [/^sk-or-v1-/, /^sk-or-/],
      urlPatterns: [
        /openrouter\.ai/,
        /openrouter\.com/
      ],
      defaultBaseUrl: 'https://openrouter.ai/api/v1',
      defaultModel: 'anthropic/claude-3-sonnet',
      models: ['anthropic/claude-3-opus', 'anthropic/claude-3-sonnet', 'openai/gpt-4-turbo', 'meta/llama-3-70b']
    },
    'chat.z.ai': {
      keyPatterns: [/^[a-zA-Z0-9\-_]{20,}$/],
      urlPatterns: [
        /chat\.z\.ai/,
        /z\.ai/
      ],
      defaultBaseUrl: 'https://chat.z.ai/v1',
      defaultModel: 'gpt-3.5-turbo',
      models: ['gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet']
    },
    local: {
      keyPatterns: [],
      urlPatterns: [/localhost/, /127\.0\.0\.1/, /0\.0\.0\.0/],
      defaultBaseUrl: 'http://localhost:8000/v1',
      defaultModel: 'gpt-3.5-turbo',
      models: ['gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet']
    },
    custom: {
      keyPatterns: [],
      urlPatterns: [],
      defaultBaseUrl: '',
      defaultModel: 'gpt-3.5-turbo',
      models: ['gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet']
    }
  };

  static detectFromApiKey(apiKey: string): APIDetectionResult[] {
    const results: APIDetectionResult[] = [];

    for (const [provider, config] of Object.entries(this.patterns)) {
      for (const pattern of config.keyPatterns) {
        if (pattern.test(apiKey)) {
          results.push({
            provider: provider as AIProvider,
            confidence: 0.9,
            baseUrl: config.defaultBaseUrl,
            model: config.defaultModel,
            notes: `Detected from API key pattern: ${pattern}`
          });
          break;
        }
      }
    }

    return results;
  }

  static detectFromUrl(url: string): APIDetectionResult[] {
    const results: APIDetectionResult[] = [];

    for (const [provider, config] of Object.entries(this.patterns)) {
      for (const pattern of config.urlPatterns) {
        if (pattern.test(url)) {
          results.push({
            provider: provider as AIProvider,
            confidence: 0.8,
            baseUrl: config.defaultBaseUrl,
            model: config.defaultModel,
            notes: `Detected from URL pattern: ${pattern}`
          });
          break;
        }
      }
    }

    return results;
  }

  static detectFromModel(model: string): APIDetectionResult[] {
    const results: APIDetectionResult[] = [];

    for (const [provider, config] of Object.entries(this.patterns)) {
      if (config.models.some(m => model.toLowerCase().includes(m.toLowerCase()))) {
        results.push({
          provider: provider as AIProvider,
          confidence: 0.7,
          baseUrl: config.defaultBaseUrl,
          model: config.defaultModel,
          notes: `Detected from model name: ${model}`
        });
      }
    }

    return results;
  }

  static detectProvider(input: { apiKey?: string; baseUrl?: string; model?: string }): APIDetectionResult[] {
    const allResults: APIDetectionResult[] = [];

    if (input.apiKey) {
      allResults.push(...this.detectFromApiKey(input.apiKey));
    }

    if (input.baseUrl) {
      allResults.push(...this.detectFromUrl(input.baseUrl));
    }

    if (input.model) {
      allResults.push(...this.detectFromModel(input.model));
    }

    // Deduplica e ordina per confidence
    const uniqueResults = allResults.reduce((acc, result) => {
      const existing = acc.find(r => r.provider === result.provider);
      if (!existing || result.confidence > existing.confidence) {
        return acc.filter(r => r.provider !== result.provider).concat(result);
      }
      return acc;
    }, [] as APIDetectionResult[]);

    return uniqueResults.sort((a, b) => b.confidence - a.confidence);
  }

  static createConfigFromDetection(result: APIDetectionResult, apiKey?: string): AIProviderConfig {
    return {
      provider: result.provider,
      apiKey: apiKey || '',
      baseUrl: result.baseUrl,
      model: result.model,
      maxTokens: 2000,
      temperature: 0.7,
      enabled: true,
      priority: this.getDefaultPriority(result.provider),
      autoDetected: true,
      lastUsed: new Date(),
      successRate: 1.0
    };
  }

  private static getDefaultPriority(provider: AIProvider): number {
    const priorities: Record<AIProvider, number> = {
      'openai': 1,
      'claude': 2,
      'google': 3,
      'mistral': 4,
      'openrouter': 5,
      'chat.z.ai': 6,
      'local': 7,
      'custom': 8
    };
    return priorities[provider] || 10;
  }

  static validateConfig(config: AIProviderConfig): boolean {
    const patterns = this.patterns[config.provider];
    if (!patterns) return true; // Allow custom providers

    if (config.apiKey) {
      return patterns.keyPatterns.some((pattern: RegExp) => pattern.test(config.apiKey!));
    }

    if (config.baseUrl) {
      return patterns.urlPatterns.some((pattern: RegExp) => pattern.test(config.baseUrl!));
    }

    return false;
  }

  static getAvailableModels(provider: AIProvider): string[] {
    const patterns = this.patterns[provider];
    return patterns?.models || [];
  }

  static getDefaultModel(provider: AIProvider): string {
    const patterns = this.patterns[provider];
    return patterns?.defaultModel || 'gpt-3.5-turbo';
  }

  static getProviderInfo(provider: AIProvider) {
    const patterns = this.patterns[provider];
    return {
      name: provider.charAt(0).toUpperCase() + provider.slice(1),
      baseUrl: patterns?.defaultBaseUrl,
      defaultModel: patterns?.defaultModel,
      models: patterns?.models || [],
      description: this.getProviderDescription(provider)
    };
  }

  private static getProviderDescription(provider: AIProvider): string {
    const descriptions = {
      'openai': 'OpenAI GPT models - Versatile and powerful AI assistant',
      'claude': 'Anthropic Claude - Helpful, harmless, and honest AI',
      'google': 'Google Gemini - Advanced multimodal AI',
      'mistral': 'Mistral AI - High-performance European models',
      'openrouter': 'OpenRouter - Access to multiple AI providers',
      'chat.z.ai': 'Chat.z.ai - Alternative AI service',
      'local': 'Local AI models - Run models on your device',
      'custom': 'Custom API endpoint - Configure your own provider'
    };
    return descriptions[provider] || 'Unknown AI provider';
  }
}