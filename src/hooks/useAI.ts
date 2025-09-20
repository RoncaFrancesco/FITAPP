import { useState, useCallback, useEffect } from 'react';
import { AiWorkoutRequest, Workout, Exercise, MuscleGroup, Equipment, ExperienceLevel, Goal, ExerciseCategory, Difficulty, goalToCategoryMap } from '../types';
import { db } from '../db';
import toast from 'react-hot-toast';
import { useContextualChat } from './useContextualChat';

export interface AIMessage {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  workout?: Workout;
}

export const useAI = (providedApiKey?: string) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>(providedApiKey || '');
  const [useContextualMode, setUseContextualMode] = useState(true);

  // Cache per le richieste AI
  const requestCache = new Map<string, Workout>();
  const { context, processing: contextualProcessing, processMessage, clearPendingActions, updateUserProfile } = useContextualChat();

  // Carica la chiave API dal database se non è fornita
  useEffect(() => {
    const loadApiKey = async () => {
      if (!providedApiKey) {
        try {
          await db.open();
          const prefs = await db.preferences.get('default');
          if (prefs?.ai?.apiKey) {
            setApiKey(prefs.ai.apiKey);
            console.log('AI API key loaded from database');
          }
        } catch (error) {
          console.error('Error loading AI API key:', error);
        }
      }
    };

    loadApiKey();
  }, [providedApiKey]);

  const generateWorkout = useCallback(async (request: AiWorkoutRequest): Promise<Workout> => {
    setLoading(true);

    try {
      // Verifica se abbiamo già una risposta in cache
      const cacheKey = JSON.stringify(request);
      if (requestCache.has(cacheKey)) {
        return requestCache.get(cacheKey)!;
      }

      // Prepara il prompt per l'AI
      const prompt = `
Crea una scheda di allenamento personalizzata basata sui seguenti requisiti:

Obiettivi: ${request.goals.join(', ')}
Livello di esperienza: ${request.experienceLevel}
Tempo disponibile: ${request.timeAvailable} minuti
Attrezzatura disponibile: ${request.equipment.join(', ')}

Preferenze aggiuntive:
- Giorni di allenamento: ${request.preferences.workoutDays}
- Gruppi muscolari preferiti: ${request.preferences.preferredMuscleGroups.join(', ')}
- Infortuni da evitare: ${request.preferences.avoidInjuries.join(', ')}

Genera una scheda completa con 4-8 esercizi, strutturata nel seguente formato JSON:

{
  "name": "Nome della scheda",
  "description": "Descrizione della scheda",
  "exercises": [
    {
      "exerciseName": "Nome esercizio",
      "sets": 3,
      "reps": 12,
      "weight": null,
      "restTime": 60,
      "notes": "Note specifiche"
    }
  ],
  "estimatedDuration": ${request.timeAvailable},
  "tags": ["tag1", "tag2"]
}

Istruzioni:
1. Scegli esercizi appropriati per il livello di esperienza e l'attrezzatura disponibile
2. Bilancia i gruppi muscolari in base agli obiettivi
3. Includi esercizi compound per efficienza
4. Adatta le ripetizioni in base agli obiettivi (forza: 6-8, ipertrofia: 8-12, resistenza: 12-15+)
5. Considera i tempi di recupero adeguati
6. Se menzionati infortuni, evita esercizi che potrebbero peggiorarli
7. Per esercizi a corpo libero, non includere peso
8. Aggiungi note utili per l'esecuzione corretta

Rispondi solo con il JSON valido, senza altro testo.
`;

      let response: Workout;

      // Tenta di usare l'API AI se disponibile
      if (apiKey) {
        try {
          response = await callChatZAI(prompt, cacheKey);
        } catch (error) {
          console.error('AI API error, falling back to templates:', error);
          response = generateTemplateWorkout(request);
        }
      } else {
        // Usa template predefiniti
        response = generateTemplateWorkout(request);
      }

      // Salva in cache
      requestCache.set(cacheKey, response);

      return response;
    } catch (error) {
      console.error('Error generating workout:', error);
      throw new Error('Errore nella generazione della scheda');
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  const callChatZAI = async (prompt: string, cacheKey: string): Promise<Workout> => {
    try {
      // Configurazione per chat.z.ai
      const response = await fetch('https://chat.z.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // o 'gpt-4' se disponibile
          messages: [
            {
              role: 'system',
              content: 'Sei un esperto personal trainer e allenatore fitness. Crea schede di allenamento personalizzate basate sulle esigenze dell\'utente. Rispondi sempre con un JSON valido che rappresenti una scheda di allenamento completa.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Estrai il JSON dalla risposta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const workoutData = JSON.parse(jsonMatch[0]);

      // Converti in Workout completo cercando gli esercizi nel database
      const workout: Workout = {
        id: crypto.randomUUID(),
        name: workoutData.name || 'Allenamento AI',
        description: workoutData.description || 'Scheda generata dall\'AI',
        exercises: await Promise.all((workoutData.exercises || []).map(async (ex: any) => {
          // Cerca l'esercizio nel database
          const exercise = await findBestMatch(ex.exerciseName || ex.name);

          return {
            id: crypto.randomUUID(),
            exercise,
            sets: Array.from({ length: ex.sets || 3 }, () => ({
              reps: ex.reps || 12,
              weight: ex.weight || null,
              duration: ex.duration || null,
              completed: false
            })),
            restTime: ex.restTime || 60,
            notes: ex.notes || '',
            order: 0
          };
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
        isCustom: true,
        estimatedDuration: workoutData.estimatedDuration || 30,
        tags: workoutData.tags || []
      };

      return workout;
    } catch (error) {
      console.error('Chat.z.ai API call failed:', error);
      throw error;
    }
  };

  const findBestMatch = async (exerciseName: string): Promise<Exercise> => {
    try {
      // Cerca esattamente per nome
      let exercise = await db.exercises
        .where('name')
        .equalsIgnoreCase(exerciseName)
        .first();

      if (exercise) return exercise;

      // Cerca per parole chiave
      const keywords = exerciseName.toLowerCase().split(' ');
      const allExercises = await db.exercises.toArray();

      // Punteggio ogni esercizio in base alle parole chiave
      const scoredExercises = allExercises.map(ex => ({
        exercise: ex,
        score: keywords.reduce((score, keyword) => {
          return score + (ex.name.toLowerCase().includes(keyword) ? 1 : 0);
        }, 0)
      })).filter(item => item.score > 0);

      // Prendi quello con il punteggio più alto
      if (scoredExercises.length > 0) {
        scoredExercises.sort((a, b) => b.score - a.score);
        return scoredExercises[0].exercise;
      }

      // Fallback: crea un esercizio generico
      return {
        id: crypto.randomUUID(),
        name: exerciseName,
        description: 'Esercizio generato dall\'AI',
        instructions: ['Esegui l\'esercizio con la tecnica corretta'],
        muscleGroup: 'altro' as MuscleGroup,
        equipment: ['a corpo libero'] as Equipment[],
        difficulty: Difficulty.BEGINNER,
        category: ExerciseCategory.STRENGTH,
        isCustom: true
      };
    } catch (error) {
      console.error('Error finding exercise match:', error);

      // Fallback completo
      return {
        id: crypto.randomUUID(),
        name: exerciseName,
        description: 'Esercizio generato dall\'AI',
        instructions: ['Esegui l\'esercizio con la tecnica corretta'],
        muscleGroup: 'altro' as MuscleGroup,
        equipment: ['a corpo libero'] as Equipment[],
        difficulty: Difficulty.BEGINNER,
        category: ExerciseCategory.STRENGTH,
        isCustom: true
      };
    }
  };

  const generateTemplateWorkout = (request: AiWorkoutRequest): Workout => {
    // Template predefiniti basati sulle richieste
    const templates = {
      principiante: {
        forza: {
          name: 'Forza Principiante',
          description: 'Scheda per principianti focalizzata sulla forza',
          exercises: ['Squat', 'Push-up', 'Plank', 'Bird dog'],
          sets: 3,
          reps: 10,
          rest: 90
        },
        ipertrofia: {
          name: 'Ipertrofia Principiante',
          description: 'Scheda per principianti per la massa muscolare',
          exercises: ['Squat', 'Push-up', 'Plank', 'Glute bridge'],
          sets: 3,
          reps: 12,
          rest: 60
        },
        resistenza: {
          name: 'Resistenza Principiante',
          description: 'Scheda per principianti per la resistenza',
          exercises: ['Jumping jacks', 'High knees', 'Mountain climber', 'Plank'],
          sets: 3,
          reps: 15,
          rest: 45
        }
      },
      intermedio: {
        forza: {
          name: 'Forza Intermedia',
          description: 'Scheda intermedia per la forza',
          exercises: ['Squat', 'Push-up', 'Pull-up', 'Plank', 'Lunges'],
          sets: 4,
          reps: 8,
          rest: 120
        },
        ipertrofia: {
          name: 'Ipertrofia Intermedia',
          description: 'Scheda intermedia per la massa muscolare',
          exercises: ['Squat', 'Push-up', 'Pull-up', 'Plank', 'Lunges', 'Russian twist'],
          sets: 4,
          reps: 10,
          rest: 90
        },
        resistenza: {
          name: 'Resistenza Intermedia',
          description: 'Scheda intermedia per la resistenza',
          exercises: ['Burpees', 'Jumping jacks', 'High knees', 'Mountain climber', 'Plank'],
          sets: 4,
          reps: 20,
          rest: 30
        }
      },
      avanzato: {
        forza: {
          name: 'Forza Avanzata',
          description: 'Scheda avanzata per la forza',
          exercises: ['Squat', 'Push-up', 'Pull-up', 'Handstand', 'Plank', 'Lunges'],
          sets: 5,
          reps: 6,
          rest: 180
        },
        ipertrofia: {
          name: 'Ipertrofia Avanzata',
          description: 'Scheda avanzata per la massa muscolare',
          exercises: ['Squat', 'Push-up', 'Pull-up', 'Plank', 'Lunges', 'Russian twist', 'Burpees'],
          sets: 5,
          reps: 8,
          rest: 120
        },
        resistenza: {
          name: 'Resistenza Avanzata',
          description: 'Scheda avanzata per la resistenza',
          exercises: ['Burpees', 'Jumping jacks', 'High knees', 'Mountain climber', 'Plank', 'Jump squat'],
          sets: 5,
          reps: 25,
          rest: 20
        }
      }
    };

    // Seleziona il template appropriato
    const level = request.experienceLevel;
    const primaryGoal = request.goals[0] || Goal.MUSCLE_GAIN;
    const template = (templates as any)[level]?.[primaryGoal] || templates.intermedio.ipertrofia;

    // Crea la workout basata sul template
    return {
      id: crypto.randomUUID(),
      name: template.name,
      description: template.description,
      exercises: template.exercises.map((exerciseName: string, index: number) => ({
        id: crypto.randomUUID(),
        exercise: {
          id: crypto.randomUUID(),
          name: exerciseName,
          description: `Esercizio ${exerciseName}`,
          instructions: [`Esegui ${exerciseName} con tecnica corretta`],
          muscleGroup: 'full-body' as MuscleGroup,
          equipment: ['a corpo libero'] as Equipment[],
          difficulty: level as ExperienceLevel,
          category: goalToCategoryMap[primaryGoal],
          isCustom: true
        },
        sets: Array.from({ length: template.sets }, () => ({
          reps: template.reps,
          weight: undefined,
          duration: undefined,
          completed: false
        })),
        restTime: template.rest,
        notes: '',
        order: index
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: true,
      estimatedDuration: request.timeAvailable,
      tags: [primaryGoal, level, 'template']
    };
  };

  const sendMessage = useCallback(async (content: string) => {
    // Aggiungi messaggio utente
    const userMessage: AIMessage = {
      id: crypto.randomUUID(),
      content,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Analizza il messaggio e genera una risposta
    try {
      // Per ora, implementiamo rispose semplici basate su keyword
      let response = '';

      if (content.toLowerCase().includes('scheda') || content.toLowerCase().includes('allenamento')) {
        // Chiedi informazioni per generare una scheda
        response = `Posso aiutarti a creare una scheda personalizzata! Per poterti aiutare al meglio, ho bisogno di sapere:

1. Quali sono i tuoi obiettivi? (forza, ipertrofia, definizione, resistenza)
2. Qual è il tuo livello di esperienza? (principiante, intermedio, avanzato)
3. Quanto tempo hai per l'allenamento?
4. Che attrezzatura hai a disposizione?

Dammi queste informazioni e creerò una scheda perfetta per te!`;
      } else if (content.toLowerCase().includes('timer') || content.toLowerCase().includes('cronometro')) {
        response = `Posso aiutarti con i timer! Ho diversi tipi di timer disponibili:

• **Timer Singolo**: Per riposo tra le serie
• **Tabata**: 20s lavoro, 10s riposo, 8 round
• **HIIT**: Personalizzabile con lavoro e riposo
• **Circuit**: Per circuit training con più esercizi

Quale timer ti interessa utilizzare?`;
      } else if (content.toLowerCase().includes('consiglio') || content.toLowerCase().includes('aiuto')) {
        response = `Sono qui per aiutarti! Ecco cosa posso fare per te:

• Creare schede di allenamento personalizzate
• Fornire consigli su esercizi e tecnica
• Suggerire timer per i tuoi allenamenti
• Rispondere a domande sul fitness

Cosa vorresti sapere?`;
      } else {
        // Per tutte le altre domande, usa l'API AI reale
        if (apiKey) {
          try {
            response = await callChatAIForAdvice(content);
          } catch (error) {
            console.error('AI API error for advice, using fallback:', error);
            response = generateFallbackAdvice(content);
          }
        } else {
          // Fallback a risposte predefinite se non c'è chiave API
          response = generateFallbackAdvice(content);
        }
      }

      // Aggiungi risposta AI
      const aiMessage: AIMessage = {
        id: crypto.randomUUID(),
        content: response,
        type: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error processing message:', error);

      // Messaggio di errore
      const errorMessage: AIMessage = {
        id: crypto.randomUUID(),
        content: 'Mi dispiace, ho riscontrato un problema. Riprova più tardi.',
        type: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  }, [apiKey]);

  const callChatAIForAdvice = async (content: string): Promise<string> => {
    try {
      const response = await fetch('https://chat.z.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Sei un esperto personal trainer e coach fitness. Rispondi alle domande degli utenti in modo dettagliato, professionale e amichevole. Fornisci consigli pratici e basati sulla scienza dello sport.'
            },
            {
              role: 'user',
              content: content
            }
          ],
          max_tokens: 1500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Chat.z.ai API call failed:', error);
      throw error;
    }
  };

  const generateFallbackAdvice = (content: string): string => {
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('dimagrimento') || lowerContent.includes('perdere peso') || lowerContent.includes('definizione')) {
      return `Per il dimagrimento efficace, ti consiglio:

🔥 **Strategie principali:**
- **Allenamento**: Combina esercizi cardio e di forza
- **Nutrizione**: Deficit calorico controllato (300-500 kcal al giorno)
- **Consistenza**: Allenamenti regolari e riposo adeguato

💪 **Esempio di scheda dimagrimento:**
- 20-30 minuti di cardio moderato
- 3-4 esercizi di forza per i principali gruppi muscolari
- 2-3 volte a settimana, con recupero adeguato

Vuoi che crei una scheda specifica per il tuo livello e obiettivi?`;
    }

    if (lowerContent.includes('massa') || lowerContent.includes('ipertrofia') || lowerContent.includes('aumentare')) {
      return `Per aumentare la massa muscolare:

🏋️ **Principi fondamentali:**
- **Sovraccarico progressivo**: Aumenta gradualmente pesi/ripetizioni
- **Nutrizione**: Surplus calorico e proteine adeguate (1.6-2.2g/kg)
- **Riposo**: 48-72 ore tra sessioni per lo stesso gruppo muscolare

💡 **Consigli pratici:**
- Concentrati su esercizi compound (squat, panca, stacchi)
- 8-12 ripetizioni per ipertrofia
- Dormi 7-9 ore per notte

Posso creare una scheda personalizzata per te!`;
    }

    if (lowerContent.includes('forza')) {
      return `Per migliorare la forza:

⚡ **Metodologia:**
- **Basse ripetizioni**: 3-6 ripetizioni con carichi pesanti
- **Lunga pausa**: 2-3 minuti di recupero tra le serie
- **Tecnica perfetta**: La forma è più importante del peso

📈 **Programma consigliato:**
- 3-4 sessioni a settimana
- Focus su esercizi multi-articolari
- Progressione graduale dei carichi

Hai una esperienza specifica con cui posso aiutarti?`;
    }

    // Fallback generico
    return `Sono un AI Coach fitness! Posso aiutarti con:

🏋️ **Allenamento**: Schede personalizzate, tecniche esecutive, programmi
🥗 **Nutrizione**: Consigli alimentari, integrazione, diete
💪 **Obiettivi**: Dimagrimento, massa muscolare, forza, resistenza
⏱️ **Timer**: HIIT, Tabata, circuit training

Cosa ti interessa specificamente? Posso creare programmi dettagliati per le tue esigenze!`;
  };

  const saveGeneratedWorkout = async (workout: Workout) => {
    try {
      await db.workouts.add(workout);
      toast.success('Scheda salvata con successo!');
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Errore nel salvataggio della scheda');
    }
  };

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Funzione per aggiornare la chiave API e salvarla nel database
  const updateApiKey = useCallback(async (newKey: string) => {
    setApiKey(newKey);

    // Salva nel database
    try {
      await db.open();
      await db.preferences.update('default', {
        ai: { apiKey: newKey }
      });
      console.log('AI API key saved to database');
    } catch (error) {
      console.error('Error saving AI API key:', error);
    }
  }, []);

  const generateSimpleResponse = async (content: string): Promise<string> => {
    // Per ora, implementiamo risposte semplici basate su keyword
    if (content.toLowerCase().includes('scheda') || content.toLowerCase().includes('allenamento')) {
      return `Posso aiutarti a creare una scheda personalizzata! Per poterti aiutare al meglio, ho bisogno di sapere:

1. Quali sono i tuoi obiettivi? (forza, ipertrofia, definizione, resistenza)
2. Qual è il tuo livello di esperienza? (principiante, intermedio, avanzato)
3. Quanto tempo hai per l'allenamento?
4. Che attrezzatura hai a disposizione?

Dammi queste informazioni e creerò una scheda perfetta per te!`;
    } else if (content.toLowerCase().includes('timer') || content.toLowerCase().includes('cronometro')) {
      return `Posso aiutarti con i timer! Ho diversi tipi di timer disponibili:

• **Timer Singolo**: Per riposo tra le serie
• **Tabata**: 20s lavoro, 10s riposo, 8 round
• **HIIT**: Personalizzabile con lavoro e riposo
• **Circuit**: Per circuit training con più esercizi

Quale timer ti interessa utilizzare?`;
    } else if (content.toLowerCase().includes('consiglio') || content.toLowerCase().includes('aiuto')) {
      return `Sono qui per aiutarti! Ecco cosa posso fare per te:

• Creare schede di allenamento personalizzate
• Fornire consigli su esercizi e tecnica
• Suggerire timer per i tuoi allenamenti
• Rispondere a domande sul fitness

Cosa vorresti sapere?`;
    } else {
      // Per tutte le altre domande, usa l'API AI reale
      if (apiKey) {
        try {
          return await callChatAIForAdvice(content);
        } catch (error) {
          console.error('AI API error for advice, using fallback:', error);
          return generateFallbackAdvice(content);
        }
      } else {
        // Fallback a risposte predefinite se non c'è chiave API
        return generateFallbackAdvice(content);
      }
    }
  };

  const toggleContextualMode = useCallback(() => {
    setUseContextualMode(prev => !prev);
  }, []);

  return {
    messages,
    loading: loading || contextualProcessing,
    generateWorkout,
    sendMessage,
    saveGeneratedWorkout,
    clearMessages,
    setMessages,
    setApiKey: updateApiKey,
    useContextualMode,
    toggleContextualMode,
    context,
    updateUserProfile,
    clearPendingActions
  };
};