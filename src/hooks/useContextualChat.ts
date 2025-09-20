import { useState, useCallback, useEffect } from 'react';
import { AIMessage } from './useAI';
import { useMultiProviderAI } from './useMultiProviderAI';
import { AiWorkoutRequest, Goal, ExperienceLevel, Equipment, MuscleGroup } from '../types';

interface ConversationContext {
  userProfile?: {
    experienceLevel: ExperienceLevel;
    goals: Goal[];
    equipment: Equipment[];
    preferredMuscleGroups: MuscleGroup[];
    injuries: string[];
    workoutDays: number;
    timeAvailable: number;
  };
  currentWorkoutRequest?: Partial<AiWorkoutRequest>;
  conversationHistory: AIMessage[];
  pendingActions: {
    type: 'generate_workout' | 'create_timer' | 'show_exercises' | 'update_profile';
    data: any;
  }[];
  lastTopic?: string;
  contextExpiry?: Date;
}

interface Intent {
  type: 'greeting' | 'workout_request' | 'advice' | 'timer' | 'exercises' | 'profile' | 'feedback';
  confidence: number;
  entities: {
    goals?: Goal[];
    experience?: ExperienceLevel;
    time?: number;
    equipment?: Equipment[];
    muscleGroups?: MuscleGroup[];
    timerType?: string;
    exerciseName?: string;
  };
  action?: {
    type: 'generate' | 'show' | 'create' | 'update';
    parameters: any;
  };
}

export const useContextualChat = () => {
  const [context, setContext] = useState<ConversationContext>({
    conversationHistory: [],
    pendingActions: []
  });

  const [processing, setProcessing] = useState(false);
  const { generateWorkout, settings } = useMultiProviderAI();

  // Pulisci il contesto scaduto
  useEffect(() => {
    const interval = setInterval(() => {
      if (context.contextExpiry && new Date() > context.contextExpiry) {
        setContext(prev => ({
          ...prev,
          contextExpiry: undefined,
          lastTopic: undefined
        }));
      }
    }, 60000); // Controlla ogni minuto

    return () => clearInterval(interval);
  }, [context.contextExpiry]);

  const detectIntent = useCallback((message: string): Intent => {
    const lowerMessage = message.toLowerCase();

    const patterns = {
      greeting: /^(ciao|salve|buongiorno|buonasera|hey|hi|hello)/,
      workout_request: /(scheda|allenamento|workout|programma|piano)/,
      advice: /(consiglio|aiuto|help|consigliami|come|perché)/,
      timer: /(timer|cronometro|contatore|tabata|hiit)/,
      exercises: /(esercizi|esercizio|movimenti|tecnica)/,
      profile: /(profilo|obiettivi|livello|attrezzatura)/,
      feedback: /(grazie|perfetto|ottimo|bene|funziona)/
    };

    let detectedType: Intent['type'] = 'advice';
    let maxConfidence = 0;

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(lowerMessage)) {
        detectedType = type as Intent['type'];
        maxConfidence = 0.8;
        break;
      }
    }

    const entities = extractEntities(lowerMessage);
    const action = determineAction(detectedType, entities, context);

    return {
      type: detectedType,
      confidence: maxConfidence,
      entities,
      action
    };
  }, [context]);

  const extractEntities = (message: string) => {
    const entities: Intent['entities'] = {};

    const goalPatterns = {
      [Goal.STRENGTH]: /(forza|potenza|strength)/,
      [Goal.MUSCLE_GAIN]: /(massa|ipertrofia|muscoli|muscle)/,
      [Goal.FAT_LOSS]: /(dimagrimento|definizione|perdere peso|fat loss)/,
      [Goal.ENDURANCE]: /(resistenza|endurance|cardio)/,
      [Goal.FLEXIBILITY]: /(flessibilità|stretching|mobility)/,
      [Goal.GENERAL_FITNESS]: /(fitness|generale|mantenimento)/
    };

    entities.goals = Object.entries(goalPatterns)
      .filter(([, pattern]) => pattern.test(message))
      .map(([goal]) => goal as Goal);

    const expPatterns = {
      [ExperienceLevel.BEGINNER]: /(principiante|beginner|nuovo|inizio)/,
      [ExperienceLevel.INTERMEDIATE]: /(intermedio|medio|esperienza)/,
      [ExperienceLevel.ADVANCED]: /(avanzato|expert|professionista)/
    };

    for (const [level, pattern] of Object.entries(expPatterns)) {
      if (pattern.test(message)) {
        entities.experience = level as ExperienceLevel;
        break;
      }
    }

    const timeMatch = message.match(/(\d+)\s*(minuti|min|minutes|ore|hour|h)/);
    if (timeMatch) {
      const time = parseInt(timeMatch[1]);
      entities.time = message.includes('ora') || message.includes('hour') || message.includes('h') ? time * 60 : time;
    }

    const equipmentPatterns = {
      [Equipment.BODYWEIGHT]: /(corpo libero|bodyweight|senza attrezzi)/,
      [Equipment.DUMBBELLS]: /(manubri|dumbbells|pesi)/,
      [Equipment.BARBELL]: /(bilanciere|barbell)/,
      [Equipment.KETTLEBELL]: /(kettlebell|kb)/,
      [Equipment.RESISTANCE_BANDS]: /(elastici|bands)/,
      [Equipment.PULLUP_BAR]: /(sbarra|pullup|trazioni)/
    };

    entities.equipment = Object.entries(equipmentPatterns)
      .filter(([, pattern]) => pattern.test(message))
      .map(([equipment]) => equipment as Equipment);

    return entities;
  };

  const determineAction = (
    type: Intent['type'],
    entities: Intent['entities'],
    context: ConversationContext
  ): Intent['action'] => {
    switch (type) {
      case 'workout_request':
        if (entities.goals && entities.experience && entities.time) {
          return {
            type: 'generate' as const,
            parameters: { entities }
          };
        }
        return {
          type: 'show' as const,
          parameters: { type: 'workout_form' }
        };

      case 'timer':
        return {
          type: 'create' as const,
          parameters: { timerType: entities.timerType || 'standard' }
        };

      case 'exercises':
        return {
          type: 'show' as const,
          parameters: { category: entities.muscleGroups?.[0] }
        };

      case 'profile':
        return {
          type: 'update' as const,
          parameters: entities
        };

      default:
        return {
          type: 'show' as const,
          parameters: { type: 'general_help' }
        };
    }
  };

  const generateResponse = useCallback(async (intent: Intent, message: string): Promise<string> => {
    const { type, entities, action } = intent;

    switch (type) {
      case 'greeting':
        return generateGreetingResponse();
      case 'workout_request':
        return await handleWorkoutRequest(entities, action);
      case 'advice':
        return await generateAdviceResponse(message, entities);
      case 'timer':
        return generateTimerResponse(entities);
      case 'exercises':
        return generateExercisesResponse(entities);
      case 'profile':
        return handleProfileUpdate(entities);
      case 'feedback':
        return generateFeedbackResponse();
      default:
        return generateFallbackResponse();
    }
  }, [context, generateWorkout]);

  const generateGreetingResponse = (): string => {
    const hasProfile = context.userProfile;
    if (hasProfile) {
      return `Ciao! Sono il tuo AI Coach fitness. Sono pronto per aiutarti con i tuoi allenamenti. Oggi come vuoi procedere?`;
    }
    return `Ciao! Sono il tuo AI Coach personale. Posso aiutarti a:\n\n🏋️ Creare schede di allenamento personalizzate\n⏱️ Configurare timer per i tuoi workout\n💪 Fornire consigli su esercizi e tecnica\n📊 Tracciare i tuoi progressi\n\nPer iniziare, dimmi qual è il tuo obiettivo principale!`;
  };

  const handleWorkoutRequest = async (entities: Intent['entities'], action: Intent['action']): Promise<string> => {
    if (action?.type === 'generate' && action.parameters.entities) {
      const { goals, experience, time, equipment } = action.parameters.entities;
      if (!goals?.length || !experience || !time) {
        return `Per creare una scheda personalizzata ho bisogno di sapere:\n\n1. Qual è il tuo obiettivo? (forza, ipertrofia, dimagrimento, resistenza)\n2. Qual è il tuo livello? (principiante, intermedio, avanzato)\n3. Quanto tempo hai? (es: 30 minuti)\n\nDimmi queste informazioni e creerò la scheda perfetta per te!`;
      }
      try {
        const request: AiWorkoutRequest = {
          goals,
          experienceLevel: experience,
          timeAvailable: time,
          equipment: equipment || [Equipment.BODYWEIGHT],
          preferences: {
            workoutDays: context.userProfile?.workoutDays || 3,
            preferredMuscleGroups: context.userProfile?.preferredMuscleGroups || [],
            avoidInjuries: context.userProfile?.injuries || []
          }
        };
        const workout = await generateWorkout(request);
        setContext(prev => ({
          ...prev,
          pendingActions: [...prev.pendingActions, { type: 'generate_workout', data: workout }]
        }));
        return `Perfetto! Ho creato una scheda personalizzata per te:\n\n**${workout.name}**\n${workout.description}\n\n**Esercizi:** ${workout.exercises.length} esercizi\n**Durata stimata:** ${workout.estimatedDuration} minuti\n\nVuoi salvare questa scheda e iniziare l'allenamento?`;
      } catch (error) {
        return `Mi dispiace, ho avuto problemi a creare la scheda. Riprova tra poco o prova a riformulare la richiesta.`;
      }
    }
    return `Posso creare una scheda personalizzata per te! Dimmi:\n\n• Quali sono i tuoi obiettivi?\n• Qual è il tuo livello di esperienza?\n• Quanto tempo hai per l'allenamento?\n• Che attrezzatura hai a disposizione?`;
  };

  const generateAdviceResponse = async (message: string, entities: Intent['entities']): Promise<string> => {
    if (settings?.providers.some(p => p.enabled)) {
      try {
        const advice = await generateGenericAdvice(message);
        return advice;
      } catch (error) {
        console.log('AI advice failed, using fallback');
      }
    }
    return generateFallbackAdvice(message, entities);
  };

  const generateGenericAdvice = async (message: string): Promise<string> => {
    return `Come AI Coach, ti consiglio di mantenere la costanza negli allenamenti e di ascoltare sempre il tuo corpo. Ricorda che il riposo è importante quanto l'allenamento stesso!`;
  };

  const generateFallbackAdvice = (message: string, entities: Intent['entities']): string => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('dimagrimento') || lowerMessage.includes('peso')) {
      return `Per il dimagrimento efficace ti consiglio:\n\n🔥 **Allenamento**: Combina cardio e forza\n🥗 **Nutrizione**: Deficit calorico controllato\n💧 **Idratazione**: Bevi molta acqua\n😴 **Riposo**: 7-8 ore di sonno\n\nVuoi una scheda specifica per il dimagrimento?`;
    }
    if (lowerMessage.includes('massa') || lowerMessage.includes('muscoli')) {
      return `Per l'aumento di massa muscolare:\n\n🏋️ **Sovraccarico progressivo**: Aumenta gradualmente i carichi\n🥩 **Proteine**: 1.6-2.2g per kg di peso corporeo\n⏰ **Riposo**: 48-72 ore tra le sessioni\n💪 **Tecnica**: La forma è più importante del peso\n\nPosso creare una scheda specifica per te!`;
    }
    return `Sono qui per aiutarti! Posso fornirti consigli su:\n\n• Schede di allenamento personalizzate\n• Tecnica esecutiva degli esercizi\n• Strategie di allenamento\n• Nutrizione sportiva\n• Recupero e prevenzione infortuni\n\nCosa ti interessa approfondire?`;
  };

  const generateTimerResponse = (entities: Intent['entities']): string => {
    return `Posso aiutarti con i timer! Ho diversi tipi disponibili:\n\n⏱️ **Timer Singolo**: Perfetto per recupero tra le serie\n🔥 **Tabata**: 20s lavoro, 10s riposo, 8 round\n💪 **HIIT**: Personalizzabile con lavoro e riposo\n🔄 **Circuit**: Per allenamenti a circuito\n\nQuale timer preferisci utilizzare?`;
  };

  const generateExercisesResponse = (entities: Intent['entities']): string => {
    if (entities.muscleGroups?.length) {
      return `Ecco alcuni esercizi per ${entities.muscleGroups[0]}:\n\n• Esercizio 1\n• Esercizio 2\n• Esercizio 3\n\nVuoi che ti mostri la tecnica corretta o che crei una scheda completa?`;
    }
    return `Posso mostrarti esercizi per qualsiasi gruppo muscolare:\n\n💪 Petto\n🔙 Schiena\n🦾 Braccia\n🦵 Gambe\n🎯 Core\n\nQuale gruppo muscolari ti interessa?`;
  };

  const handleProfileUpdate = (entities: Intent['entities']): string => {
    if (entities.experience || entities.goals || entities.equipment) {
      setContext(prev => ({
        ...prev,
        userProfile: {
          ...prev.userProfile!,
          experienceLevel: entities.experience || prev.userProfile?.experienceLevel || ExperienceLevel.BEGINNER,
          goals: entities.goals || prev.userProfile?.goals || [],
          equipment: entities.equipment || prev.userProfile?.equipment || [Equipment.BODYWEIGHT]
        },
        contextExpiry: new Date(Date.now() + 30 * 60 * 1000)
      }));
    }
    return `Perfetto! Ho aggiornato il tuo profilo. Ora posso creare schede più personalizzate per te. Cosa vuoi fare ora?`;
  };

  const generateFeedbackResponse = (): string => {
    return `Grazie! 😊 Sono felice di esserti stato d'aiuto. Ricorda:\n\n📅 Costanza è la chiave del successo\n🎯 Sposta l'obiettivo, non il focus\n💯 Ogni allenamento è un progresso\n\nHai bisogno di altro? Sono qui per te!`;
  };

  const generateFallbackResponse = (): string => {
    return `Non ho capito perfettamente. Posso aiutarti con:\n\n🏋️ Schede di allenamento\n⏱️ Timer e cronometri\n💪 Consigli fitness\n📊 Progressi e statistiche\n\nRiformula la domanda o dimmi cosa ti serve esattamente!`;
  };

  const processMessage = useCallback(async (message: string): Promise<{ response: string; actions: any[] }> => {
    setProcessing(true);
    try {
      const intent = detectIntent(message);
      const response = await generateResponse(intent, message);
      setContext(prev => ({
        ...prev,
        conversationHistory: [
          ...prev.conversationHistory,
          { id: crypto.randomUUID(), content: message, type: 'user', timestamp: new Date() },
          { id: crypto.randomUUID(), content: response, type: 'ai', timestamp: new Date() }
        ],
        lastTopic: intent.type,
        contextExpiry: new Date(Date.now() + 30 * 60 * 1000)
      }));
      return { response, actions: context.pendingActions };
    } catch (error) {
      console.error('Error processing message:', error);
      return { response: 'Mi dispiace, ho riscontrato un problema. Riprova più tardi.', actions: [] };
    } finally {
      setProcessing(false);
    }
  }, [detectIntent, generateResponse, context.pendingActions]);

  const clearPendingActions = useCallback(() => {
    setContext(prev => ({ ...prev, pendingActions: [] }));
  }, []);

  const updateUserProfile = useCallback((profile: Partial<ConversationContext['userProfile']>) => {
    setContext(prev => ({ ...prev, userProfile: { ...prev.userProfile!, ...profile } }));
  }, []);

  return {
    context,
    processing,
    processMessage,
    clearPendingActions,
    updateUserProfile
  };
};
