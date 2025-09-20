import { useState, useCallback, useEffect } from 'react';
import { AIProvider, AIProviderConfig, AISettings, AiWorkoutRequest, Workout, Goal, ExperienceLevel, Equipment } from '../types';
import { db } from '../db';
import { APIDetector } from '../utils/apiDetector';

interface ProviderInterface {
  name: string;
  generateWorkout(request: AiWorkoutRequest, config: AIProviderConfig): Promise<Workout>;
  validateConfig(config: AIProviderConfig): boolean;
}

class OpenAIProvider implements ProviderInterface {
  name = 'OpenAI';

  async generateWorkout(request: AiWorkoutRequest, config: AIProviderConfig): Promise<Workout> {
    const response = await fetch(`${config.baseUrl || 'https://api.openai.com'}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Sei un esperto personal trainer. Crea schede di allenamento personalizzate basate sulle esigenze dell\'utente. Rispondi sempre con un JSON valido.'
          },
          {
            role: 'user',
            content: this.formatPrompt(request)
          }
        ],
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return this.parseWorkoutResponse(data.choices[0].message.content);
  }

  validateConfig(config: AIProviderConfig): boolean {
    return !!(config.apiKey && config.apiKey.startsWith('sk-'));
  }

  private formatPrompt(request: AiWorkoutRequest): string {
    return `
Crea una scheda di allenamento personalizzata basata sui seguenti requisiti:

Obiettivi: ${request.goals.join(', ')}
Livello di esperienza: ${request.experienceLevel}
Tempo disponibile: ${request.timeAvailable} minuti
Attrezzatura disponibile: ${request.equipment.join(', ')}

Preferenze aggiuntive:
- Giorni di allenamento: ${request.preferences.workoutDays}
- Gruppi muscolari preferiti: ${request.preferences.preferredMuscleGroups.join(', ')}
- Infortuni da evitare: ${request.preferences.avoidInjuries.join(', ')}

Genera una scheda completa in formato JSON con struttura simile a:
{
  "name": "Nome scheda",
  "description": "Descrizione",
  "exercises": [
    {
      "exerciseName": "Nome esercizio",
      "sets": 3,
      "reps": 12,
      "restTime": 60,
      "notes": "Note"
    }
  ],
  "estimatedDuration": ${request.timeAvailable}
}`;
  }

  private parseWorkoutResponse(content: string): Workout {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found');
    }

    const data = JSON.parse(jsonMatch[0]);
    return {
      id: crypto.randomUUID(),
      name: data.name || 'Allenamento OpenAI',
      description: data.description || 'Scheda generata da OpenAI',
      exercises: (data.exercises || []).map((ex: any, index: number) => ({
        id: crypto.randomUUID(),
        exercise: {
          id: crypto.randomUUID(),
          name: ex.exerciseName || ex.name,
          description: `Esercizio: ${ex.exerciseName || ex.name}`,
          instructions: ['Esegui con tecnica corretta'],
          muscleGroup: 'full-body' as any,
          equipment: ['a corpo libero'] as any[],
          difficulty: 'intermedio' as any,
          category: 'forza' as any,
          isCustom: true
        },
        sets: Array.from({ length: ex.sets || 3 }, () => ({
          reps: ex.reps || 12,
          weight: ex.weight || undefined,
          duration: ex.duration || undefined,
          completed: false
        })),
        restTime: ex.restTime || 60,
        notes: ex.notes || '',
        order: index
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: true,
      estimatedDuration: data.estimatedDuration || 60,
      tags: ['ai', 'openai']
    };
  }
}

class ClaudeProvider implements ProviderInterface {
  name = 'Claude';

  async generateWorkout(request: AiWorkoutRequest, config: AIProviderConfig): Promise<Workout> {
    const response = await fetch(`${config.baseUrl || 'https://api.anthropic.com'}/v1/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey!,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-sonnet-20240229',
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.7,
        messages: [
          {
            role: 'user',
            content: this.formatPrompt(request)
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    return this.parseWorkoutResponse(content);
  }

  validateConfig(config: AIProviderConfig): boolean {
    return !!(config.apiKey && config.apiKey.startsWith('sk-ant-api'));
  }

  private formatPrompt(request: AiWorkoutRequest): string {
    return `Crea una scheda di allenamento personalizzata basata su questi requisiti:

Obiettivi: ${request.goals.join(', ')}
Livello: ${request.experienceLevel}
Tempo: ${request.timeAvailable} minuti
Attrezzatura: ${request.equipment.join(', ')}

Rispondi solo con JSON valido:
{
  "name": "Nome scheda",
  "description": "Descrizione",
  "exercises": [
    {
      "exerciseName": "Nome esercizio",
      "sets": 3,
      "reps": 12,
      "restTime": 60
    }
  ],
  "estimatedDuration": ${request.timeAvailable}
}`;
  }

  private parseWorkoutResponse(content: string): Workout {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found');
    }

    const data = JSON.parse(jsonMatch[0]);
    return {
      id: crypto.randomUUID(),
      name: data.name || 'Allenamento Claude',
      description: data.description || 'Scheda generata da Claude',
      exercises: (data.exercises || []).map((ex: any, index: number) => ({
        id: crypto.randomUUID(),
        exercise: {
          id: crypto.randomUUID(),
          name: ex.exerciseName || ex.name,
          description: `Esercizio: ${ex.exerciseName || ex.name}`,
          instructions: ['Esegui con tecnica corretta'],
          muscleGroup: 'full-body' as any,
          equipment: ['a corpo libero'] as any[],
          difficulty: 'intermedio' as any,
          category: 'forza' as any,
          isCustom: true
        },
        sets: Array.from({ length: ex.sets || 3 }, () => ({
          reps: ex.reps || 12,
          weight: ex.weight || undefined,
          duration: ex.duration || undefined,
          completed: false
        })),
        restTime: ex.restTime || 60,
        notes: ex.notes || '',
        order: index
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: true,
      estimatedDuration: data.estimatedDuration || 60,
      tags: ['ai', 'claude']
    };
  }
}

class MistralProvider implements ProviderInterface {
  name = 'Mistral';

  async generateWorkout(request: AiWorkoutRequest, config: AIProviderConfig): Promise<Workout> {
    const response = await fetch(`${config.baseUrl || 'https://api.mistral.ai'}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model || 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content: 'Sei un esperto personal trainer. Crea schede di allenamento personalizzate. Rispondi sempre con JSON valido.'
          },
          {
            role: 'user',
            content: this.formatPrompt(request)
          }
        ],
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    return this.parseWorkoutResponse(data.choices[0].message.content);
  }

  validateConfig(config: AIProviderConfig): boolean {
    return !!(config.apiKey && config.apiKey.length >= 32);
  }

  private formatPrompt(request: AiWorkoutRequest): string {
    return `Crea una scheda di allenamento personalizzata:

Obiettivi: ${request.goals.join(', ')}
Livello: ${request.experienceLevel}
Tempo: ${request.timeAvailable} minuti
Attrezzatura: ${request.equipment.join(', ')}

Rispondi con JSON valido:
{
  "name": "Nome scheda",
  "description": "Descrizione",
  "exercises": [
    {
      "exerciseName": "Nome esercizio",
      "sets": 3,
      "reps": 12,
      "restTime": 60
    }
  ],
  "estimatedDuration": ${request.timeAvailable}
}`;
  }

  private parseWorkoutResponse(content: string): Workout {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found');
    }

    const data = JSON.parse(jsonMatch[0]);
    return {
      id: crypto.randomUUID(),
      name: data.name || 'Allenamento Mistral',
      description: data.description || 'Scheda generata da Mistral',
      exercises: (data.exercises || []).map((ex: any, index: number) => ({
        id: crypto.randomUUID(),
        exercise: {
          id: crypto.randomUUID(),
          name: ex.exerciseName || ex.name,
          description: `Esercizio: ${ex.exerciseName || ex.name}`,
          instructions: ['Esegui con tecnica corretta'],
          muscleGroup: 'full-body' as any,
          equipment: ['a corpo libero'] as any[],
          difficulty: 'intermedio' as any,
          category: 'forza' as any,
          isCustom: true
        },
        sets: Array.from({ length: ex.sets || 3 }, () => ({
          reps: ex.reps || 12,
          weight: ex.weight || undefined,
          duration: ex.duration || undefined,
          completed: false
        })),
        restTime: ex.restTime || 60,
        notes: ex.notes || '',
        order: index
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: true,
      estimatedDuration: data.estimatedDuration || 60,
      tags: ['ai', 'mistral']
    };
  }
}

class OpenRouterProvider implements ProviderInterface {
  name = 'OpenRouter';

  async generateWorkout(request: AiWorkoutRequest, config: AIProviderConfig): Promise<Workout> {
    const response = await fetch(`${config.baseUrl || 'https://openrouter.ai'}/api/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'FITAPP AI Coach'
      },
      body: JSON.stringify({
        model: config.model || 'anthropic/claude-3-sonnet',
        messages: [
          {
            role: 'system',
            content: 'Sei un esperto personal trainer. Crea schede di allenamento personalizzate. Rispondi sempre con JSON valido.'
          },
          {
            role: 'user',
            content: this.formatPrompt(request)
          }
        ],
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return this.parseWorkoutResponse(data.choices[0].message.content);
  }

  validateConfig(config: AIProviderConfig): boolean {
    return !!(config.apiKey && config.apiKey.startsWith('sk-or-'));
  }

  private formatPrompt(request: AiWorkoutRequest): string {
    return `Crea una scheda di allenamento personalizzata:

Obiettivi: ${request.goals.join(', ')}
Livello: ${request.experienceLevel}
Tempo: ${request.timeAvailable} minuti
Attrezzatura: ${request.equipment.join(', ')}

Rispondi con JSON valido:
{
  "name": "Nome scheda",
  "description": "Descrizione",
  "exercises": [
    {
      "exerciseName": "Nome esercizio",
      "sets": 3,
      "reps": 12,
      "restTime": 60
    }
  ],
  "estimatedDuration": ${request.timeAvailable}
}`;
  }

  private parseWorkoutResponse(content: string): Workout {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found');
    }

    const data = JSON.parse(jsonMatch[0]);
    return {
      id: crypto.randomUUID(),
      name: data.name || 'Allenamento OpenRouter',
      description: data.description || 'Scheda generata da OpenRouter',
      exercises: (data.exercises || []).map((ex: any, index: number) => ({
        id: crypto.randomUUID(),
        exercise: {
          id: crypto.randomUUID(),
          name: ex.exerciseName || ex.name,
          description: `Esercizio: ${ex.exerciseName || ex.name}`,
          instructions: ['Esegui con tecnica corretta'],
          muscleGroup: 'full-body' as any,
          equipment: ['a corpo libero'] as any[],
          difficulty: 'intermedio' as any,
          category: 'forza' as any,
          isCustom: true
        },
        sets: Array.from({ length: ex.sets || 3 }, () => ({
          reps: ex.reps || 12,
          weight: ex.weight || undefined,
          duration: ex.duration || undefined,
          completed: false
        })),
        restTime: ex.restTime || 60,
        notes: ex.notes || '',
        order: index
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: true,
      estimatedDuration: data.estimatedDuration || 60,
      tags: ['ai', 'openrouter']
    };
  }
}

class GoogleProvider implements ProviderInterface {
  name = 'Google';

  async generateWorkout(request: AiWorkoutRequest, config: AIProviderConfig): Promise<Workout> {
    const response = await fetch(`${config.baseUrl || 'https://generativelanguage.googleapis.com'}/v1beta/models/${config.model || 'gemini-pro'}:generateContent?key=${config.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: this.formatPrompt(request) }] }],
        generationConfig: {
          maxOutputTokens: config.maxTokens || 2000,
          temperature: config.temperature || 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    return this.parseWorkoutResponse(content);
  }

  validateConfig(config: AIProviderConfig): boolean {
    return !!(config.apiKey && config.apiKey.startsWith('AIza'));
  }

  private formatPrompt(request: AiWorkoutRequest): string {
    return `Crea una scheda di allenamento personalizzata in formato JSON con questi requisiti:

Obiettivi: ${request.goals.join(', ')}
Livello: ${request.experienceLevel}
Tempo: ${request.timeAvailable} minuti
Attrezzatura: ${request.equipment.join(', ')}

Struttura JSON richiesta:
{
  "name": "Nome scheda",
  "description": "Descrizione",
  "exercises": [
    {
      "exerciseName": "Nome esercizio",
      "sets": 3,
      "reps": 12,
      "restTime": 60
    }
  ],
  "estimatedDuration": ${request.timeAvailable}
}`;
  }

  private parseWorkoutResponse(content: string): Workout {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found');
    }

    const data = JSON.parse(jsonMatch[0]);
    return {
      id: crypto.randomUUID(),
      name: data.name || 'Allenamento Google',
      description: data.description || 'Scheda generata da Google Gemini',
      exercises: (data.exercises || []).map((ex: any, index: number) => ({
        id: crypto.randomUUID(),
        exercise: {
          id: crypto.randomUUID(),
          name: ex.exerciseName || ex.name,
          description: `Esercizio: ${ex.exerciseName || ex.name}`,
          instructions: ['Esegui con tecnica corretta'],
          muscleGroup: 'full-body' as any,
          equipment: ['a corpo libero'] as any[],
          difficulty: 'intermedio' as any,
          category: 'forza' as any,
          isCustom: true
        },
        sets: Array.from({ length: ex.sets || 3 }, () => ({
          reps: ex.reps || 12,
          weight: ex.weight || undefined,
          duration: ex.duration || undefined,
          completed: false
        })),
        restTime: ex.restTime || 60,
        notes: ex.notes || '',
        order: index
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: true,
      estimatedDuration: data.estimatedDuration || 60,
      tags: ['ai', 'google']
    };
  }
}

export const useMultiProviderAI = () => {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(false);

  // Inizializza le impostazioni predefinite
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        await db.open();
        const prefs = await db.preferences.get('default');

        if (prefs?.ai?.settings) {
          setSettings(prefs.ai.settings);
        } else {
          // Impostazioni predefinite con rilevamento automatico
          const defaultSettings: AISettings = {
            providers: [],
            defaultProvider: 'chat.z.ai',
            fallbackToTemplates: true,
            enableCaching: true,
            autoDetectProviders: true,
            smartProviderSelection: true
          };

          // Se c'è una chiave API vecchia, prova a rilevare il provider
          if (prefs?.ai?.apiKey) {
            const detected = APIDetector.detectFromApiKey(prefs.ai.apiKey);
            if (detected.length > 0) {
              const config = APIDetector.createConfigFromDetection(detected[0], prefs.ai.apiKey);
              defaultSettings.providers = [config];
              defaultSettings.defaultProvider = config.provider;
            }
          }

          setSettings(defaultSettings);
          await saveSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Error initializing AI settings:', error);
      }
    };

    initializeSettings();
  }, []);

  const saveSettings = useCallback(async (newSettings: AISettings) => {
    try {
      await db.open();
      await db.preferences.update('default', {
        ai: {
          ...((await db.preferences.get('default'))?.ai || {}),
          settings: newSettings
        }
      });
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving AI settings:', error);
    }
  }, []);

  const generateWorkout = useCallback(async (request: AiWorkoutRequest): Promise<Workout> => {
    if (!settings) {
      throw new Error('AI settings not initialized');
    }

    setLoading(true);

    try {
      // Ordina i provider per priorità
      const enabledProviders = settings.providers
        .filter(p => p.enabled)
        .sort((a, b) => a.priority - b.priority);

      for (const config of enabledProviders) {
        try {
          const provider = createProvider(config.provider);

          if (!provider.validateConfig(config)) {
            console.warn(`Invalid config for provider: ${config.provider}`);
            continue;
          }

          const workout = await provider.generateWorkout(request, config);
          return workout;
        } catch (error) {
          console.warn(`Provider ${config.provider} failed:`, error);
          continue;
        }
      }

      // Fallback a template
      if (settings.fallbackToTemplates) {
        return generateTemplateWorkout(request);
      }

      throw new Error('All AI providers failed and fallback is disabled');
    } finally {
      setLoading(false);
    }
  }, [settings]);

  const createProvider = (providerType: AIProvider): ProviderInterface => {
    switch (providerType) {
      case 'openai':
        return new OpenAIProvider();
      case 'google':
        return new GoogleProvider();
      case 'claude':
        return new ClaudeProvider();
      case 'mistral':
        return new MistralProvider();
      case 'openrouter':
        return new OpenRouterProvider();
      case 'chat.z.ai':
        return new OpenAIProvider();
      default:
        throw new Error(`Unsupported provider: ${providerType}`);
    }
  };

  const updateProvider = useCallback(async (providerConfig: AIProviderConfig) => {
    if (!settings) return;

    const newSettings = {
      ...settings,
      providers: settings.providers.map(p =>
        p.provider === providerConfig.provider ? { ...providerConfig, lastUsed: new Date() } : p
      )
    };

    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  const autoDetectAndAddProvider = useCallback(async (input: { apiKey?: string; baseUrl?: string; model?: string }) => {
    if (!settings) return;

    const detected = APIDetector.detectProvider(input);
    if (detected.length > 0) {
      const bestMatch = detected[0];
      const config = APIDetector.createConfigFromDetection(bestMatch, input.apiKey);

      // Rimuovi provider esistenti dello stesso tipo
      const existingProviders = settings.providers.filter(p => p.provider !== config.provider);

      const newSettings = {
        ...settings,
        providers: [...existingProviders, config]
      };

      await saveSettings(newSettings);
      return config;
    }
    return null;
  }, [settings, saveSettings]);

  const testProvider = useCallback(async (config: AIProviderConfig): Promise<boolean> => {
    try {
      const provider = createProvider(config.provider);
      if (!provider.validateConfig(config)) {
        return false;
      }

      // Test con una richiesta semplice
      const testRequest = {
        goals: [Goal.GENERAL_FITNESS],
        experienceLevel: ExperienceLevel.BEGINNER,
        timeAvailable: 30,
        equipment: [Equipment.BODYWEIGHT],
        preferences: {
          workoutDays: 3,
          preferredMuscleGroups: [],
          avoidInjuries: []
        }
      };

      await provider.generateWorkout(testRequest, config);
      return true;
    } catch (error) {
      console.error(`Provider ${config.provider} test failed:`, error);
      return false;
    }
  }, []);

  const getProviderStats = useCallback(() => {
    if (!settings) return {};

    return settings.providers.reduce((stats, provider) => {
      stats[provider.provider] = {
        enabled: provider.enabled,
        lastUsed: provider.lastUsed,
        successRate: provider.successRate || 0,
        autoDetected: provider.autoDetected || false
      };
      return stats;
    }, {} as Record<string, any>);
  }, [settings]);

  const addProvider = useCallback(async (providerConfig: AIProviderConfig) => {
    if (!settings) return;

    const newSettings = {
      ...settings,
      providers: [...settings.providers, providerConfig]
    };

    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  const removeProvider = useCallback(async (provider: AIProvider) => {
    if (!settings) return;

    const newSettings = {
      ...settings,
      providers: settings.providers.filter(p => p.provider !== provider)
    };

    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  return {
    settings,
    loading,
    generateWorkout,
    updateProvider,
    addProvider,
    removeProvider,
    saveSettings,
    autoDetectAndAddProvider,
    testProvider,
    getProviderStats
  };
};

// Funzione di fallback per template (da spostare in un file utils separato)
function generateTemplateWorkout(request: AiWorkoutRequest): Workout {
  return {
    id: crypto.randomUUID(),
    name: 'Scheda Template',
    description: 'Scheda generata da template',
    exercises: [
      {
        id: crypto.randomUUID(),
        exercise: {
          id: crypto.randomUUID(),
          name: 'Squat',
          description: 'Squat a corpo libero',
          instructions: ['Esegui squat con tecnica corretta'],
          muscleGroup: 'gambe' as any,
          equipment: ['a corpo libero'] as any[],
          difficulty: 'principiante' as any,
          category: 'forza' as any,
          isCustom: true
        },
        sets: Array.from({ length: 3 }, () => ({
          reps: 12,
          weight: undefined,
          duration: undefined,
          completed: false
        })),
        restTime: 60,
        notes: '',
        order: 0
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    isCustom: true,
    estimatedDuration: request.timeAvailable,
    tags: ['template']
  };
}