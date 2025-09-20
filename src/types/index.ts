export interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  muscleGroup: MuscleGroup;
  equipment: Equipment[];
  difficulty: Difficulty;
  category: ExerciseCategory;
  imageUrl?: string;
  videoUrl?: string;
  isCustom: boolean;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  exercises: WorkoutExercise[];
  createdAt: Date;
  updatedAt: Date;
  isCustom: boolean;
  estimatedDuration: number; // in minutes
  tags: string[];
}

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: Set[];
  restTime: number; // seconds between sets
  notes?: string;
  order: number;
}

export interface Set {
  reps: number;
  weight?: number; // kg
  duration?: number; // seconds for time-based exercises
  completed: boolean;
  actualReps?: number;
  actualWeight?: number;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  exerciseProgress: ExerciseProgress[];
  notes: string;
}

export interface ExerciseProgress {
  workoutExerciseId: string;
  completedSets: Set[];
  startTime?: Date;
  endTime?: Date;
  notes: string;
}

export interface TimerSettings {
  type: 'single' | 'sequence' | 'tabata' | 'hiit' | 'circuit';
  workTime: number; // seconds
  restTime: number; // seconds
  rounds: number;
  cycles: number;
  preparationTime: number; // seconds before starting
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface UserPreferences {
  id: string;
  theme: 'light' | 'dark' | 'system';
  defaultRestTime: number;
  defaultTimerSettings: TimerSettings;
  language: 'it' | 'en';
  units: 'metric' | 'imperial';
  notifications: {
    workoutReminders: boolean;
    achievementAlerts: boolean;
  };
  ai: {
    apiKey?: string;
    useGemini: boolean;
    settings?: AISettings; // Nuovo sistema multi-provider
  };
}

export interface AiWorkoutRequest {
  goals: Goal[];
  experienceLevel: ExperienceLevel;
  timeAvailable: number; // minutes
  equipment: Equipment[];
  preferences: {
    workoutDays: number;
    preferredMuscleGroups: MuscleGroup[];
    avoidInjuries: string[];
  };
}

export interface BackupData {
  workouts: Workout[];
  exercises: Exercise[];
  preferences: UserPreferences;
  exportDate: Date;
  version: string;
}

export enum MuscleGroup {
  CHEST = 'petto',
  BACK = 'schiena',
  SHOULDERS = 'spalle',
  ARMS = 'braccia',
  LEGS = 'gambe',
  CORE = 'core',
  CARDIO = 'cardio',
  STRETCHING = 'stretching'
}

export enum Equipment {
  BODYWEIGHT = 'a corpo libero',
  DUMBBELLS = 'manubri',
  BARBELL = 'bilanciere',
  KETTLEBELL = 'kettlebell',
  RESISTANCE_BANDS = 'elastici',
  BENCH = 'panca',
  PULLUP_BAR = 'sbarra',
  MACHINE = 'macchina',
  CABLE = 'cavi',
  MEDICINE_BALL = 'palla medica',
  FOAM_ROLLER = 'foam roller',
  PARALLELS = 'parallele',
  OTHER = 'altro'
}

export enum Difficulty {
  BEGINNER = 'principiante',
  INTERMEDIATE = 'intermedio',
  ADVANCED = 'avanzato'
}

export enum ExerciseCategory {
  STRENGTH = 'forza',
  HYPERTROPHY = 'ipertrofia',
  ENDURANCE = 'resistenza',
  FLEXIBILITY = 'flessibilità',
  BALANCE = 'equilibrio',
  POWER = 'potenza',
  CARDIO = 'cardio'
}

export enum Goal {
  STRENGTH = 'forza',
  MUSCLE_GAIN = 'ipertrofia',
  FAT_LOSS = 'definizione',
  ENDURANCE = 'resistenza',
  FLEXIBILITY = 'flessibilità',
  GENERAL_FITNESS = 'fitness generale'
}

// Mappa tra Goal e ExerciseCategory per compatibilità
export const goalToCategoryMap: Record<Goal, ExerciseCategory> = {
  [Goal.STRENGTH]: ExerciseCategory.STRENGTH,
  [Goal.MUSCLE_GAIN]: ExerciseCategory.HYPERTROPHY,
  [Goal.FAT_LOSS]: ExerciseCategory.CARDIO,
  [Goal.ENDURANCE]: ExerciseCategory.ENDURANCE,
  [Goal.FLEXIBILITY]: ExerciseCategory.FLEXIBILITY,
  [Goal.GENERAL_FITNESS]: ExerciseCategory.STRENGTH
};

export enum ExperienceLevel {
  BEGINNER = 'principiante',
  INTERMEDIATE = 'intermedio',
  ADVANCED = 'avanzato'
}

// Tipi per il sistema AI multi-provider
export type AIProvider = 'chat.z.ai' | 'openai' | 'google' | 'claude' | 'mistral' | 'local' | 'openrouter' | 'custom';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
  enabled: boolean;
  priority: number; // Per fallback automatico
  autoDetected?: boolean; // Se rilevato automaticamente
  lastUsed?: Date; // Per tracking dell'utilizzo
  successRate?: number; // Per performance tracking
}

export interface AISettings {
  providers: AIProviderConfig[];
  defaultProvider: AIProvider;
  fallbackToTemplates: boolean;
  enableCaching: boolean;
  autoDetectProviders: boolean;
  smartProviderSelection: boolean;
}

// Estendo l'interfaccia UserPreferences per supportare il nuovo sistema
export interface EnhancedUserPreferences extends UserPreferences {
  ai: UserPreferences['ai'] & {
    settings?: AISettings; // Nuovo sistema multi-provider
  };
}