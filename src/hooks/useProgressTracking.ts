import { useState, useCallback, useEffect } from 'react';
import { db } from '../db';
import { Workout, WorkoutSession, ExerciseProgress, Set, Goal, MuscleGroup } from '../types';

interface ProgressStats {
  totalWorkouts: number;
  totalSessions: number;
  averageWorkoutDuration: number;
  totalVolume: number; // peso totale sollevato
  favoriteExercises: string[];
  muscleGroupDistribution: Record<MuscleGroup, number>;
  weeklyProgress: {
    week: string;
    workouts: number;
    volume: number;
  }[];
  personalRecords: {
    exerciseId: string;
    exerciseName: string;
    type: 'weight' | 'reps' | 'duration';
    value: number;
    date: Date;
  }[];
  monthlySummary: {
    month: string;
    workouts: number;
    duration: number;
    volume: number;
  }[];
}

interface ProgressFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  muscleGroups?: MuscleGroup[];
  goals?: Goal[];
}

export const useProgressTracking = () => {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ProgressFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 giorni fa
      end: new Date()
    }
  });

  // Calcola le statistiche di progresso
  const calculateStats = useCallback(async (filters: ProgressFilters): Promise<ProgressStats> => {
    try {
      await db.open();

      // Recupera tutti i workout nel range di date
      const workouts = await db.workouts
        .where('createdAt')
        .between(filters.dateRange.start, filters.dateRange.end)
        .toArray();

      // Recupera tutte le sessioni completate
      const sessions = await db.sessions
        .where('startTime')
        .between(filters.dateRange.start, filters.dateRange.end)
        .filter((session: any) => session.completed)
        .toArray();

      // Calcola statistiche base
      const totalWorkouts = workouts.length;
      const totalSessions = sessions.length;

      // Calcola durata media
      const totalDuration = sessions.reduce((sum: number, session: any) => {
        if (session.endTime) {
          return sum + (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60); // minuti
        }
        return sum;
      }, 0);
      const averageWorkoutDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

      // Calcola volume totale (peso x ripetizioni)
      const totalVolume = sessions.reduce((sum: number, session: any) => {
        return sum + session.exerciseProgress.reduce((exerciseSum: number, exerciseProgress: any) => {
          return exerciseSum + exerciseProgress.completedSets.reduce((setSum: number, set: any) => {
            return setSum + (set.weight || 0) * set.reps;
          }, 0);
        }, 0);
      }, 0);

      // Trova gli esercizi più frequenti
      const exerciseFrequency = new Map<string, number>();
      sessions.forEach((session: any) => {
        session.exerciseProgress.forEach((progress: any) => {
          const exerciseId = progress.workoutExerciseId;
          exerciseFrequency.set(exerciseId, (exerciseFrequency.get(exerciseId) || 0) + 1);
        });
      });

      const favoriteExercises = Array.from(exerciseFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([exerciseId]) => exerciseId);

      // Distribuzione per gruppi muscolari
      const muscleGroupDistribution: Record<MuscleGroup, number> = {
        [MuscleGroup.CHEST]: 0,
        [MuscleGroup.BACK]: 0,
        [MuscleGroup.SHOULDERS]: 0,
        [MuscleGroup.ARMS]: 0,
        [MuscleGroup.LEGS]: 0,
        [MuscleGroup.CORE]: 0,
        [MuscleGroup.CARDIO]: 0,
        [MuscleGroup.STRETCHING]: 0
      };

      sessions.forEach((session: any) => {
        session.exerciseProgress.forEach((progress: any) => {
          // Dovremmo avere l'esercizio completo qui, per ora usiamo un mapping semplificato
          // In una versione reale, faresti join con la tabella esercizi
        });
      });

      // Progresso settimanale
      const weeklyProgress = calculateWeeklyProgress(sessions);

      // Record personali
      const personalRecords = await calculatePersonalRecords(sessions);

      // Riepilogo mensile
      const monthlySummary = calculateMonthlySummary(sessions);

      return {
        totalWorkouts,
        totalSessions,
        averageWorkoutDuration,
        totalVolume,
        favoriteExercises,
        muscleGroupDistribution,
        weeklyProgress,
        personalRecords,
        monthlySummary
      };
    } catch (error) {
      console.error('Error calculating progress stats:', error);
      throw error;
    }
  }, []);

  const calculateWeeklyProgress = (sessions: WorkoutSession[]) => {
    const weeklyData = new Map<string, { workouts: number; volume: number }>();

    sessions.forEach((session: any) => {
      const weekStart = getWeekStart(session.startTime);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, { workouts: 0, volume: 0 });
      }

      const week = weeklyData.get(weekKey)!;
      week.workouts += 1;

      // Calcola volume per questa sessione
      const sessionVolume = session.exerciseProgress.reduce((sum: number, progress: any) => {
        return sum + progress.completedSets.reduce((setSum: number, set: any) => {
          return setSum + (set.weight || 0) * set.reps;
        }, 0);
      }, 0);

      week.volume += sessionVolume;
    });

    return Array.from(weeklyData.entries())
      .map(([week, data]) => ({
        week,
        workouts: data.workouts,
        volume: data.volume
      }))
      .sort((a, b) => a.week.localeCompare(b.week));
  };

  const calculatePersonalRecords = async (sessions: WorkoutSession[]) => {
    const records: ProgressStats['personalRecords'] = [];
    const exerciseStats = new Map<string, { maxWeight: number; maxReps: number; maxDuration: number }>();

    sessions.forEach((session: any) => {
      session.exerciseProgress.forEach((progress: any) => {
        const exerciseId = progress.workoutExerciseId;

        if (!exerciseStats.has(exerciseId)) {
          exerciseStats.set(exerciseId, { maxWeight: 0, maxReps: 0, maxDuration: 0 });
        }

        const stats = exerciseStats.get(exerciseId)!;

        progress.completedSets.forEach((set: any) => {
          if (set.weight && set.weight > stats.maxWeight) {
            stats.maxWeight = set.weight;
          }
          if (set.reps > stats.maxReps) {
            stats.maxReps = set.reps;
          }
          if (set.duration && set.duration > stats.maxDuration) {
            stats.maxDuration = set.duration;
          }
        });
      });
    });

    // Converti in record personali (qui dovrei recuperare i nomi degli esercizi)
    // Per ora uso una versione semplificata
    exerciseStats.forEach((stats, exerciseId) => {
      if (stats.maxWeight > 0) {
        records.push({
          exerciseId,
          exerciseName: `Exercise ${exerciseId}`, // Dovrebbe essere il nome reale
          type: 'weight',
          value: stats.maxWeight,
          date: new Date() // Dovrebbe essere la data del record
        });
      }
      if (stats.maxReps > 0) {
        records.push({
          exerciseId,
          exerciseName: `Exercise ${exerciseId}`,
          type: 'reps',
          value: stats.maxReps,
          date: new Date()
        });
      }
    });

    return records;
  };

  const calculateMonthlySummary = (sessions: WorkoutSession[]) => {
    const monthlyData = new Map<string, { workouts: number; duration: number; volume: number }>();

    sessions.forEach((session: any) => {
      const monthKey = session.startTime.toISOString().substring(0, 7); // YYYY-MM

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { workouts: 0, duration: 0, volume: 0 });
      }

      const month = monthlyData.get(monthKey)!;
      month.workouts += 1;

      if (session.endTime) {
        month.duration += (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
      }

      const sessionVolume = session.exerciseProgress.reduce((sum: number, progress: any) => {
        return sum + progress.completedSets.reduce((setSum: number, set: any) => {
          return setSum + (set.weight || 0) * set.reps;
        }, 0);
      }, 0);

      month.volume += sessionVolume;
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        workouts: data.workouts,
        duration: data.duration,
        volume: data.volume
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  // Carica le statistiche
  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const newStats = await calculateStats(filters);
      setStats(newStats);
    } catch (error) {
      console.error('Error loading progress stats:', error);
    } finally {
      setLoading(false);
    }
  }, [calculateStats, filters]);

  // Aggiorna i filtri
  const updateFilters = useCallback((newFilters: Partial<ProgressFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Esporta i dati di progresso
  const exportProgressData = useCallback(async () => {
    try {
      const csvContent = generateProgressCSV(stats);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fitness-progress-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting progress data:', error);
    }
  }, [stats]);

  const generateProgressCSV = (stats: ProgressStats | null): string => {
    if (!stats) return '';

    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Workouts', stats.totalWorkouts.toString()],
      ['Total Sessions', stats.totalSessions.toString()],
      ['Average Duration (min)', stats.averageWorkoutDuration.toFixed(1)],
      ['Total Volume (kg)', stats.totalVolume.toString()],
      ['Favorite Exercises', stats.favoriteExercises.slice(0, 3).join(', ')],
      ...Object.entries(stats.muscleGroupDistribution).map(([group, count]) =>
        [`${group} Workouts`, count.toString()]
      )
    ];

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Carica le statistiche all'avvio e quando i filtri cambiano
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    filters,
    updateFilters,
    refreshStats: loadStats,
    exportProgressData
  };
};

// Hook per il tracking in tempo reale durante i workout
export const useWorkoutTracker = (workoutId: string) => {
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [currentExercise, setCurrentExercise] = useState<number>(0);
  const [tracking, setTracking] = useState(false);

  const startSession = useCallback(async () => {
    try {
      await db.open();

      const session: WorkoutSession = {
        id: crypto.randomUUID(),
        workoutId,
        startTime: new Date(),
        completed: false,
        exerciseProgress: [],
        notes: ''
      };

      await db.sessions.add(session);
      setActiveSession(session);
      setTracking(true);
    } catch (error) {
      console.error('Error starting workout session:', error);
    }
  }, [workoutId]);

  const updateExerciseProgress = useCallback(async (
    exerciseIndex: number,
    completedSets: Set[],
    notes: string = ''
  ) => {
    if (!activeSession) return;

    try {
      await db.open();

      const progress: ExerciseProgress = {
        workoutExerciseId: exerciseIndex.toString(),
        completedSets,
        startTime: new Date(),
        notes
      };

      // Aggiorna la sessione
      const updatedProgress = [...activeSession.exerciseProgress];
      if (exerciseIndex < updatedProgress.length) {
        updatedProgress[exerciseIndex] = progress;
      } else {
        updatedProgress.push(progress);
      }

      await db.sessions.update(activeSession.id, {
        exerciseProgress: updatedProgress
      });

      setActiveSession(prev => prev ? { ...prev, exerciseProgress: updatedProgress } : null);
    } catch (error) {
      console.error('Error updating exercise progress:', error);
    }
  }, [activeSession]);

  const completeSession = useCallback(async (notes: string = '') => {
    if (!activeSession) return;

    try {
      await db.open();

      await db.sessions.update(activeSession.id, {
        endTime: new Date(),
        completed: true,
        notes
      });

      setActiveSession(prev => prev ? { ...prev, endTime: new Date(), completed: true, notes } : null);
      setTracking(false);
    } catch (error) {
      console.error('Error completing workout session:', error);
    }
  }, [activeSession]);

  return {
    activeSession,
    currentExercise,
    tracking,
    startSession,
    updateExerciseProgress,
    completeSession,
    setCurrentExercise
  };
};