import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Workout, Exercise, WorkoutExercise, Set } from '../types';
import { db } from '../db';
import { ExerciseSelector } from '../components/ExerciseSelector';
import { Navigation } from '../components/Navigation';
import { Save, Trash2, Plus, Minus, ArrowLeft, Clock, Target, Download, Upload, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const CreateWorkoutPage: React.FC = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<Partial<Workout>>({
    name: '',
    description: '',
    exercises: [],
    estimatedDuration: 30,
    tags: [],
    isCustom: true
  });

  useEffect(() => {
    if (workoutId) {
      loadWorkout();
    }
  }, [workoutId]);

  const loadWorkout = async () => {
    try {
      const existingWorkout = await db.workouts.get(workoutId!);
      if (existingWorkout) {
        setWorkout(existingWorkout);
      }
    } catch (error) {
      toast.error('Errore nel caricamento della scheda');
      console.error('Error loading workout:', error);
    }
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    const newWorkoutExercise: WorkoutExercise = {
      id: crypto.randomUUID(),
      exercise,
      sets: [
        {
          reps: 10,
          weight: undefined,
          duration: undefined,
          completed: false
        }
      ],
      restTime: 60,
      notes: '',
      order: workout.exercises?.length || 0
    };

    setWorkout(prev => ({
      ...prev,
      exercises: [...(prev.exercises || []), newWorkoutExercise]
    }));
  };

  const handleExerciseRemove = (exerciseId: string) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises?.filter(ex => ex.id !== exerciseId) || []
    }));
  };

  const handleCustomExerciseAdd = async (exerciseData: Omit<Exercise, 'id'>) => {
    try {
      const newExercise: Exercise = {
        ...exerciseData,
        id: crypto.randomUUID()
      };

      // Salva l'esercizio personalizzato nel database
      await db.exercises.add(newExercise);

      // Aggiungi alla scheda
      handleExerciseSelect(newExercise);
      toast.success('Esercizio personalizzato aggiunto!');
    } catch (error) {
      toast.error('Errore nell\'aggiunta dell\'esercizio personalizzato');
      console.error('Error adding custom exercise:', error);
    }
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof Set, value: any) => {
    setWorkout(prev => {
      const exercises = [...(prev.exercises || [])];
      const exercise = exercises[exerciseIndex];
      const sets = [...exercise.sets];

      sets[setIndex] = { ...sets[setIndex], [field]: value };
      exercises[exerciseIndex] = { ...exercise, sets };

      return { ...prev, exercises };
    });
  };

  const addSet = (exerciseIndex: number) => {
    setWorkout(prev => {
      const exercises = [...(prev.exercises || [])];
      const exercise = exercises[exerciseIndex];
      const lastSet = exercise.sets[exercise.sets.length - 1];

      const newSet: Set = {
        reps: lastSet.reps,
        weight: lastSet.weight,
        duration: lastSet.duration,
        completed: false
      };

      exercises[exerciseIndex] = {
        ...exercise,
        sets: [...exercise.sets, newSet]
      };

      return { ...prev, exercises };
    });
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    if (workout.exercises?.[exerciseIndex].sets.length === 1) {
      toast.error('Ogni esercizio deve avere almeno una serie');
      return;
    }

    setWorkout(prev => {
      const exercises = [...(prev.exercises || [])];
      const exercise = exercises[exerciseIndex];

      exercises[exerciseIndex] = {
        ...exercise,
        sets: exercise.sets.filter((_, i) => i !== setIndex)
      };

      return { ...prev, exercises };
    });
  };

  const updateRestTime = (exerciseIndex: number, restTime: number) => {
    setWorkout(prev => {
      const exercises = [...(prev.exercises || [])];
      exercises[exerciseIndex] = {
        ...exercises[exerciseIndex],
        restTime
      };

      return { ...prev, exercises };
    });
  };

  const updateExerciseNotes = (exerciseIndex: number, notes: string) => {
    setWorkout(prev => {
      const exercises = [...(prev.exercises || [])];
      exercises[exerciseIndex] = {
        ...exercises[exerciseIndex],
        notes
      };

      return { ...prev, exercises };
    });
  };

  const moveExercise = (fromIndex: number, toIndex: number) => {
    setWorkout(prev => {
      const exercises = [...(prev.exercises || [])];
      const [removed] = exercises.splice(fromIndex, 1);
      exercises.splice(toIndex, 0, removed);

      // Aggiorna gli ordini
      return {
        ...prev,
        exercises: exercises.map((ex, index) => ({ ...ex, order: index }))
      };
    });
  };

  const exportWorkout = () => {
    const workoutData = {
      ...workout,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(workoutData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workout.name || 'scheda'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Scheda esportata!');
  };

  const shareWorkout = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: workout.name || 'Scheda Allenamento',
          text: workout.description || 'Check out this workout!',
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback - copy to clipboard
      const workoutText = `${workout.name}\n\n${workout.description}\n\nEsercizi:\n${workout.exercises?.map(ex => `• ${ex.exercise.name}`).join('\n')}`;

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(workoutText);
        toast.success('Scheda copiata negli appunti!');
      } else {
        toast.error('Condivisione non supportata su questo dispositivo');
      }
    }
  };

  const saveWorkout = async () => {
    if (!workout.name?.trim()) {
      toast.error('Inserisci un nome per la scheda');
      return;
    }

    if (!workout.exercises || workout.exercises.length === 0) {
      toast.error('Aggiungi almeno un esercizio');
      return;
    }

    setLoading(true);

    try {
      const workoutData: Workout = {
        ...workout,
        id: workoutId || crypto.randomUUID(),
        name: workout.name.trim(),
        description: workout.description?.trim() || '',
        exercises: workout.exercises,
        createdAt: workoutId ? workout.createdAt! : new Date(),
        updatedAt: new Date(),
        isCustom: true,
        estimatedDuration: workout.estimatedDuration || 30,
        tags: workout.tags || []
      } as Workout;

      if (workoutId) {
        await db.workouts.update(workoutId, workoutData);
        toast.success('Scheda aggiornata!');
      } else {
        await db.workouts.add(workoutData);
        toast.success('Scheda creata!');
      }

      navigate('/workouts');
    } catch (error) {
      toast.error('Errore nel salvataggio della scheda');
      console.error('Error saving workout:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkout = async () => {
    if (workoutId && confirm('Sei sicuro di voler eliminare questa scheda?')) {
      try {
        await db.workouts.delete(workoutId);
        toast.success('Scheda eliminata');
        navigate('/workouts');
      } catch (error) {
        toast.error('Errore nell\'eliminazione della scheda');
        console.error('Error deleting workout:', error);
      }
    }
  };

  const totalSets = workout.exercises?.reduce((acc, ex) => acc + ex.sets.length, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
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
      <Navigation showBackButton={true} currentPage="Crea Scheda" />

      <div className="max-w-4xl mx-auto px-4 py-6 relative z-10">
        <h1 className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-6 text-center">
          {workoutId ? 'Modifica Scheda' : 'Crea Scheda'}
        </h1>
        {/* Azioni rapide */}
        <div className="flex justify-end space-x-2 mb-4">
          <button
            onClick={exportWorkout}
            className="p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            title="Esporta scheda"
          >
            <Download className="w-6 h-6 text-blue-600" />
          </button>
          <button
            onClick={shareWorkout}
            className="p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            title="Condividi scheda"
          >
            <Share2 className="w-6 h-6 text-green-600" />
          </button>
          {workoutId && (
            <button
              onClick={deleteWorkout}
              className="p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              title="Elimina scheda"
            >
              <Trash2 className="w-6 h-6 text-red-600" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-6 relative z-10">
        {/* Informazioni scheda */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-6 animate-fade-in-up">
          <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-6 flex items-center">
            <span className="w-2 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mr-3"></span>
            Informazioni Scheda
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome Scheda *
              </label>
              <input
                type="text"
                value={workout.name || ''}
                onChange={(e) => setWorkout(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300"
                placeholder="Nome della scheda"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrizione
              </label>
              <textarea
                value={workout.description || ''}
                onChange={(e) => setWorkout(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300"
                rows={4}
                placeholder="Descrizione della scheda"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Durata Stimata (minuti)
                </label>
                <input
                  type="number"
                  value={workout.estimatedDuration || 30}
                  onChange={(e) => setWorkout(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 30 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (separati da virgola)
                </label>
                <input
                  type="text"
                  value={workout.tags?.join(', ') || ''}
                  onChange={(e) => setWorkout(prev => ({
                    ...prev,
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300"
                  placeholder="forza, ipertrofia, gambe"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Selettore esercizi */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 animate-fade-in-up">
          <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-6 flex items-center">
            <span className="w-2 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mr-3"></span>
            Seleziona Esercizi
          </h2>
          <ExerciseSelector
            selectedExercises={workout.exercises?.map(ex => ex.exercise) || []}
            onExerciseSelect={handleExerciseSelect}
            onExerciseRemove={handleExerciseRemove}
            onCustomExerciseAdd={handleCustomExerciseAdd}
          />
        </div>

        {/* Esercizi selezionati */}
        {workout.exercises && workout.exercises.length > 0 && (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mt-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mr-3"></span>
                Esercizi Selezionati ({workout.exercises.length})
              </h2>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 rounded-full px-4 py-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-700 dark:text-purple-300">{totalSets} serie totali</span>
                </div>
                <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-700 dark:text-blue-300">{workout.estimatedDuration} min</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {workout.exercises.map((workoutExercise, exerciseIndex) => (
                <div key={workoutExercise.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-200 dark:border-purple-800/50 transform hover:scale-[1.01] transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-purple-700 dark:text-purple-300 mb-2">
                        {exerciseIndex + 1}. {workoutExercise.exercise.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">{workoutExercise.exercise.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {exerciseIndex > 0 && (
                        <button
                          onClick={() => moveExercise(exerciseIndex, exerciseIndex - 1)}
                          className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-purple-600"
                          title="Sposta su"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                      )}
                      {exerciseIndex < (workout.exercises?.length || 0) - 1 && (
                        <button
                          onClick={() => moveExercise(exerciseIndex, exerciseIndex + 1)}
                          className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-purple-600 transform rotate-180"
                          title="Sposta giù"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleExerciseRemove(workoutExercise.exercise.id)}
                        className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-red-600"
                        title="Rimuovi esercizio"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Serie */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-purple-600" />
                        Serie
                      </h4>
                      <button
                        onClick={() => addSet(exerciseIndex)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Aggiungi serie</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {workoutExercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="flex items-center space-x-3 bg-white dark:bg-gray-800/50 rounded-xl p-3 shadow-sm">
                          <span className="w-12 text-sm font-semibold text-purple-600 bg-purple-100 dark:bg-purple-900/30 rounded-lg py-1 text-center">
                            {setIndex + 1}
                          </span>

                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300"
                            placeholder="Reps"
                            min="1"
                          />

                          <input
                            type="number"
                            value={set.weight || ''}
                            onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || undefined)}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300"
                            placeholder="Kg"
                            step="0.5"
                          />

                          {workoutExercise.sets.length > 1 && (
                            <button
                              onClick={() => removeSet(exerciseIndex, setIndex)}
                              className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-red-600"
                              title="Rimuovi serie"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tempo di riposo */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-blue-600" />
                      Tempo di riposo tra le serie (secondi)
                    </label>
                    <input
                      type="number"
                      value={workoutExercise.restTime}
                      onChange={(e) => updateRestTime(exerciseIndex, parseInt(e.target.value) || 60)}
                      className="w-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300"
                      min="0"
                      max="600"
                    />
                  </div>

                  {/* Note esercizio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Note
                    </label>
                    <textarea
                      value={workoutExercise.notes || ''}
                      onChange={(e) => updateExerciseNotes(exerciseIndex, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300"
                      rows={3}
                      placeholder="Note specifiche per questo esercizio..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pulsanti azione */}
        <div className="flex justify-end space-x-4 mt-8 animate-fade-in-up">
          <button
            onClick={() => navigate('/workouts')}
            className="px-8 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 font-medium"
          >
            Annulla
          </button>
          <button
            onClick={saveWorkout}
            disabled={loading || !workout.name?.trim() || !workout.exercises?.length}
            className={`px-8 py-4 text-white rounded-2xl transition-all duration-300 flex items-center space-x-3 font-medium shadow-lg ${
              loading || !workout.name?.trim() || !workout.exercises?.length
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-xl transform hover:scale-105'
            }`}
          >
            <Save className="w-6 h-6" />
            <span>{loading ? 'Salvataggio...' : (workoutId ? 'Aggiorna' : 'Crea')}</span>
          </button>
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