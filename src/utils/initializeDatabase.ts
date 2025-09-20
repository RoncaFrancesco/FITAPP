import { db } from '../db';
import { populateExercises } from '../data/exercises';
import { UserPreferences, Goal, ExperienceLevel, Equipment, MuscleGroup } from '../types';

export const initializeDatabase = async () => {
  try {
    console.log('Inizializzazione database...');
    await db.open();

    // Popola gli esercizi
    const exerciseCount = await populateExercises();
    console.log(`✅ Popolati ${exerciseCount} esercizi`);

    // Crea le preferenze utente predefinite se non esistono
    const existingPrefs = await db.preferences.get('default');
    if (!existingPrefs) {
      const defaultPrefs: UserPreferences = {
        id: 'default',
        theme: 'system',
        defaultRestTime: 60,
        defaultTimerSettings: {
          type: 'single',
          workTime: 30,
          restTime: 60,
          rounds: 1,
          cycles: 1,
          preparationTime: 5,
          soundEnabled: true,
          vibrationEnabled: true
        },
        language: 'it',
        units: 'metric',
        notifications: {
          workoutReminders: true,
          achievementAlerts: true
        },
        ai: {
          useGemini: false,
          settings: {
            providers: [],
            defaultProvider: 'chat.z.ai',
            fallbackToTemplates: true,
            enableCaching: true,
            autoDetectProviders: true,
            smartProviderSelection: true
          }
        }
      };

      await db.preferences.add(defaultPrefs);
      console.log('✅ Preferenze predefinite create');
    }

    console.log('✅ Database inizializzato con successo!');
    return true;
  } catch (error) {
    console.error('❌ Errore durante l\'inizializzazione del database:', error);
    throw error;
  }
};

// Funzione per verificare lo stato del database
export const getDatabaseStatus = async () => {
  try {
    await db.open();

    const exerciseCount = await db.exercises.count();
    const workoutCount = await db.workouts.count();
    const sessionCount = await db.sessions.count();
    const hasPreferences = await db.preferences.get('default');

    return {
      exercises: exerciseCount,
      workouts: workoutCount,
      sessions: sessionCount,
      preferences: !!hasPreferences,
      total: exerciseCount + workoutCount + sessionCount + (hasPreferences ? 1 : 0)
    };
  } catch (error) {
    console.error('Errore nel verificare lo stato del database:', error);
    return null;
  }
};

// Funzione per ripristinare il database (svuotare e ripopolare)
export const resetDatabase = async () => {
  try {
    console.log('🔄 Reset del database...');
    await db.open();

    // Svuota tutte le tabelle
    await Promise.all([
      db.exercises.clear(),
      db.workouts.clear(),
      db.sessions.clear(),
      db.preferences.clear()
    ]);

    console.log('✅ Database svuotato');

    // Re-inizializza
    await initializeDatabase();

    console.log('✅ Database ripristinato con successo!');
    return true;
  } catch (error) {
    console.error('❌ Errore durante il reset del database:', error);
    throw error;
  }
};