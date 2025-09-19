import React, { useState, useEffect } from 'react';
import { Workout, WorkoutSession as WorkoutSessionType, ExerciseProgress, Set } from '../types';
import { TimerDisplay } from './TimerDisplay';
import { Navigation } from './Navigation';
import { TimerSettings } from '../types';
import { Play, Pause, CheckCircle, Clock, ArrowRight, Edit, Save, X, ArrowLeft } from 'lucide-react';

interface WorkoutSessionProps {
  workout: Workout;
  onComplete: (session: WorkoutSessionType) => void;
  onPause: () => void;
  onExit: () => void;
}

export const WorkoutSession: React.FC<WorkoutSessionProps> = ({
  workout,
  onComplete,
  onPause,
  onExit
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [session, setSession] = useState<WorkoutSessionType>({
    id: crypto.randomUUID(),
    workoutId: workout.id,
    startTime: new Date(),
    completed: false,
    exerciseProgress: workout.exercises.map(exercise => ({
      workoutExerciseId: exercise.id,
      completedSets: [],
      notes: ''
    })),
    notes: ''
  });

  const [showTimer, setShowTimer] = useState(false);
  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    type: 'single',
    workTime: 30,
    restTime: 60,
    rounds: 1,
    cycles: 1,
    preparationTime: 5,
    soundEnabled: true,
    vibrationEnabled: true
  });

  const [editingSet, setEditingSet] = useState<{ exerciseIndex: number; setIndex: number } | null>(null);
  const [editValues, setEditValues] = useState<{ reps: number; weight?: number; notes?: string }>({ reps: 0 });

  const currentExercise = workout.exercises[currentExerciseIndex];
  const currentProgress = session.exerciseProgress[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === workout.exercises.length - 1;

  // Imposta il timer di riposo
  useEffect(() => {
    if (currentExercise) {
      setTimerSettings(prev => ({
        ...prev,
        restTime: currentExercise.restTime
      }));
    }
  }, [currentExercise]);

  // Aggiorna i set completati
  const updateSet = (exerciseIndex: number, setIndex: number, updates: Partial<Set>) => {
    setSession((prev: WorkoutSessionType) => {
      const newProgress = [...prev.exerciseProgress];
      const exerciseProgress = { ...newProgress[exerciseIndex] };
      const completedSets = [...exerciseProgress.completedSets];

      if (setIndex < completedSets.length) {
        completedSets[setIndex] = { ...completedSets[setIndex], ...updates };
      } else {
        completedSets.push({
          ...currentExercise.sets[setIndex],
          ...updates,
          completed: updates.completed ?? true
        });
      }

      exerciseProgress.completedSets = completedSets;
      newProgress[exerciseIndex] = exerciseProgress;

      return { ...prev, exerciseProgress: newProgress };
    });
  };

  const startEditingSet = (exerciseIndex: number, setIndex: number) => {
    const exercise = workout.exercises[exerciseIndex];
    const progress = session.exerciseProgress[exerciseIndex];
    const setToEdit = progress.completedSets[setIndex] || exercise.sets[setIndex];

    setEditingSet({ exerciseIndex, setIndex });
    setEditValues({
      reps: setToEdit.actualReps || setToEdit.reps,
      weight: setToEdit.actualWeight || setToEdit.weight,
      notes: setToEdit.notes || ''
    });
  };

  const saveEditSet = () => {
    if (editingSet) {
      updateSet(editingSet.exerciseIndex, editingSet.setIndex, {
        actualReps: editValues.reps,
        actualWeight: editValues.weight,
        notes: editValues.notes
      });
      setEditingSet(null);
    }
  };

  const cancelEditSet = () => {
    setEditingSet(null);
  };

  const markSetCompleted = (exerciseIndex: number, setIndex: number) => {
    updateSet(exerciseIndex, setIndex, { completed: true });

    // Mostra il timer dopo aver completato un set
    setShowTimer(true);
  };

  const nextExercise = () => {
    if (!isLastExercise) {
      setCurrentExerciseIndex(prev => prev + 1);
      setShowTimer(false);
    } else {
      completeWorkout();
    }
  };

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      setShowTimer(false);
    }
  };

  const completeWorkout = () => {
    const completedSession = {
      ...session,
      endTime: new Date(),
      completed: true
    };
    onComplete(completedSession);
  };

  const isExerciseCompleted = (exerciseIndex: number) => {
    const exercise = workout.exercises[exerciseIndex];
    const progress = session.exerciseProgress[exerciseIndex];
    return progress.completedSets.length === exercise.sets.length &&
           progress.completedSets.every((set: any) => set.completed);
  };

  const allSetsCompleted = currentProgress.completedSets.length === currentExercise.sets.length &&
    currentProgress.completedSets.every((set: any) => set.completed);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-purple-400/20 to-blue-400/20 animate-pulse"
            style={{
              width: `${Math.random() * 80 + 20}px`,
              height: `${Math.random() * 80 + 20}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 5}s`
            }}
          />
        ))}
      </div>

          {/* Navigation */}
      <div className="relative z-10">
        <Navigation showBackButton={true} currentPage="Workout Session" />

      <div className="max-w-4xl mx-auto px-4 py-6 relative z-10">
        <h1 className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-6 text-center">
          {workout.name}
        </h1>
        {/* Pulsante pausa prominente */}
        <div className="mb-6">
          <button
            onClick={onPause}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
          >
            <Pause className="w-6 h-6" />
            <span className="font-medium text-lg">Pausa Allenamento</span>
          </button>
        </div>
      </div>

        {/* Progresso totale */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Esercizio {currentExerciseIndex + 1} di {workout.exercises.length}
            </span>
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              {session.exerciseProgress.filter((p: any) => {
                const exercise = workout.exercises.find(e => e.id === p.workoutExerciseId);
                return exercise && p.completedSets.length === exercise.sets.length;
              }).length} / {workout.exercises.length} completati
            </span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-300 shadow-lg"
              style={{ width: `${((currentExerciseIndex + 1) / workout.exercises.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timer */}
      {showTimer && (
        <div className="px-4 pb-4 relative z-10 animate-fade-in-up">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6">
            <TimerDisplay
              initialSettings={timerSettings}
              onSettingsChange={setTimerSettings}
            />
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowTimer(false)}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 shadow-lg font-medium"
              >
                Continua Allenamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Esercizio corrente */}
      <div className="px-4 pb-4 relative z-10 animate-fade-in-up">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-3 flex items-center">
            <span className="w-2 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mr-3"></span>
            {currentExercise.exercise.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{currentExercise.exercise.description}</p>

          <div className="flex flex-wrap gap-3 mb-6">
            <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium flex items-center">
              💪 {currentExercise.exercise.muscleGroup}
            </span>
            <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium flex items-center">
              📊 {currentExercise.exercise.difficulty}
            </span>
            <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium flex items-center">
              🏋️ {currentExercise.exercise.equipment.join(', ')}
            </span>
          </div>

          {/* Istruzioni */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <span className="w-2 h-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full mr-3"></span>
              Istruzioni:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
              {currentExercise.exercise.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-3 text-purple-600 font-bold">•</span>
                  <span className="leading-relaxed">{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Set */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
            <span className="w-2 h-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mr-3"></span>
            Serie:
          </h3>
          <div className="space-y-3">
            {currentExercise.sets.map((set, setIndex) => {
              const completedSet = currentProgress.completedSets[setIndex];
              const isCompleted = completedSet?.completed || false;

              return (
                <div key={setIndex} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 rounded-2xl shadow-md transform hover:scale-[1.02] transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 rounded-xl px-3 py-2 min-w-[3rem] text-center">
                      {setIndex + 1}
                    </span>

                    {editingSet?.exerciseIndex === currentExerciseIndex && editingSet.setIndex === setIndex ? (
                      <div className="flex items-center space-x-3">
                        <input
                          type="number"
                          value={editValues.reps}
                          onChange={(e) => setEditValues(prev => ({ ...prev, reps: parseInt(e.target.value) || 0 }))}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300"
                          placeholder="Reps"
                        />
                        <input
                          type="number"
                          value={editValues.weight || ''}
                          onChange={(e) => setEditValues(prev => ({ ...prev, weight: parseFloat(e.target.value) || undefined }))}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300"
                          placeholder="Kg"
                        />
                        <button
                          onClick={saveEditSet}
                          className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={cancelEditSet}
                          className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {completedSet?.actualReps || set.reps} reps
                        </span>
                        {set.weight !== undefined && (
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {completedSet?.actualWeight || set.weight} kg
                          </span>
                        )}
                        {completedSet?.notes && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 italic bg-gray-100 dark:bg-gray-800/50 rounded-lg px-2 py-1">
                            "{completedSet.notes}"
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {!isCompleted && (
                      <button
                        onClick={() => markSetCompleted(currentExerciseIndex, setIndex)}
                        className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 shadow-md"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}

                    {isCompleted && (
                      <button
                        onClick={() => startEditingSet(currentExerciseIndex, setIndex)}
                        className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-300 transform hover:scale-105"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div className="mb-6">
          <label htmlFor="sessionNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <span className="w-2 h-6 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-full mr-3"></span>
            Note:
          </label>
          <textarea
            id="sessionNotes"
            name="sessionNotes"
            value={currentProgress.notes}
            onChange={(e) => {
              setSession((prev: WorkoutSessionType) => {
                const newProgress = [...prev.exerciseProgress];
                newProgress[currentExerciseIndex] = {
                  ...newProgress[currentExerciseIndex],
                  notes: e.target.value
                };
                return { ...prev, exerciseProgress: newProgress };
              });
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300"
            rows={4}
            placeholder="Aggiungi note su questo esercizio..."
          />
        </div>

        {/* Navigazione */}
        <div className="flex justify-between items-center">
          <button
            onClick={previousExercise}
            disabled={currentExerciseIndex === 0}
            className={`flex items-center space-x-3 px-6 py-3 rounded-2xl transition-all duration-300 font-medium ${
              currentExerciseIndex === 0
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transform hover:scale-105'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Precedente</span>
          </button>

          {allSetsCompleted ? (
            <button
              onClick={nextExercise}
              className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 shadow-lg font-medium"
            >
              <span>{isLastExercise ? 'Completa Allenamento' : 'Prossimo Esercizio'}</span>
              {isLastExercise ? (
                <span className="text-xl">🎉</span>
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </button>
          ) : (
            <button
              onClick={() => setShowTimer(true)}
              className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 shadow-lg font-medium"
            >
              <Clock className="w-5 h-5" />
              <span>Timer Riposo</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/5 dark:bg-black/20 backdrop-blur-sm border-t border-white/10 dark:border-gray-800/50 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 · Tutti i diritti riservati
          </p>
        </div>
      </footer>
    </div>
  );
};