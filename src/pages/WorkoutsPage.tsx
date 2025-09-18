import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Workout, WorkoutSession } from '../types';
import { db } from '../db';
import { Navigation } from '../components/Navigation';
import { WorkoutSession as WorkoutSessionComponent } from '../components/WorkoutSession';
import { Plus, Play, Calendar, Trash2, Edit, Clock, Dumbbell, Target } from 'lucide-react';
import toast from 'react-hot-toast';

export const WorkoutsPage: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<{ workout: Workout } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const workoutList = await db.workouts.toArray();
      setWorkouts(workoutList);
    } catch (error) {
      toast.error('Errore nel caricamento delle schede');
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const startWorkout = (workout: Workout) => {
    setActiveSession({ workout });
  };

  const handleSessionComplete = (session: WorkoutSession) => {
    // Salva la sessione nel database
    db.sessions.add(session)
      .then(() => {
        toast.success('Allenamento completato!');
        setActiveSession(null);
      })
      .catch((error) => {
        toast.error('Errore nel salvataggio della sessione');
        console.error('Error saving session:', error);
      });
  };

  const handleSessionPause = () => {
    setActiveSession(null);
  };

  const deleteWorkout = async (workoutId: string) => {
    if (confirm('Sei sicuro di voler eliminare questa scheda?')) {
      try {
        await db.workouts.delete(workoutId);
        setWorkouts(prev => prev.filter(w => w.id !== workoutId));
        toast.success('Scheda eliminata');
      } catch (error) {
        toast.error('Errore nell\'eliminazione della scheda');
        console.error('Error deleting workout:', error);
      }
    }
  };

  const editWorkout = (workoutId: string) => {
    navigate(`/create-workout/${workoutId}`);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'principiante':
        return 'bg-green-100 text-green-700';
      case 'intermedio':
        return 'bg-yellow-100 text-yellow-700';
      case 'avanzato':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (activeSession) {
    return (
      <WorkoutSessionComponent
        workout={activeSession.workout}
        onComplete={handleSessionComplete}
        onPause={handleSessionPause}
        onExit={handleSessionPause}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-purple-400/20 to-blue-400/20 animate-pulse"
            style={{
              width: `${Math.random() * 60 + 20}px`,
              height: `${Math.random() * 60 + 20}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 5}s`
            }}
          />
        ))}
      </div>
      {/* Header */}
      <Navigation showBackButton={true} currentPage="Le tue Schede" />

      <div className="max-w-4xl mx-auto px-4 py-6 relative z-10">
        {/* Header con titolo e pulsante */}
        <div className="flex justify-between items-center mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Le tue Schede
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestisci i tuoi programmi di allenamento
            </p>
          </div>
          <button
            onClick={() => navigate('/create-workout')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Nuova Scheda</span>
          </button>
        </div>

        {/* Stats概览 */}
        {!loading && workouts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in-up">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Schede Totali</p>
                  <p className="text-3xl font-bold">{workouts.length}</p>
                </div>
                <Dumbbell className="w-12 h-12 text-purple-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Esercizi Totali</p>
                  <p className="text-3xl font-bold">{workouts.reduce((acc, w) => acc + w.exercises.length, 0)}</p>
                </div>
                <Target className="w-12 h-12 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Tempo Totale</p>
                  <p className="text-3xl font-bold">{formatDuration(workouts.reduce((acc, w) => acc + w.estimatedDuration, 0))}</p>
                </div>
                <Clock className="w-12 h-12 text-green-200" />
              </div>
            </div>
          </div>
        )}

        {/* Lista schede */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
            </div>
          ) : workouts.length === 0 ? (
            <div className="text-center py-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl animate-fade-in-up">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Dumbbell className="w-12 h-12 text-white animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-4">
                Inizia il tuo viaggio fitness
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg max-w-md mx-auto">
                Crea la tua prima scheda di allenamento personalizzata e raggiungi i tuoi obiettivi
              </p>
              <button
                onClick={() => navigate('/create-workout')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 mx-auto shadow-lg"
              >
                <Plus className="w-6 h-6" />
                <span className="font-medium text-lg">Crea la tua prima scheda</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workouts.map((workout) => (
                <div key={workout.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300 animate-fade-in-up">
                  {/* Header card */}
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold flex-1 mr-4">
                        {workout.name}
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editWorkout(workout.id)}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-300 transform hover:scale-110"
                        >
                          <Edit className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => deleteWorkout(workout.id)}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-300 transform hover:scale-110"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                    <p className="text-purple-100 text-sm opacity-90">
                      {workout.description}
                    </p>
                  </div>

                  {/* Contenuto card */}
                  <div className="p-6">
                    {/* Stats principali */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {workout.exercises.length}
                        </div>
                        <div className="text-xs text-gray-600">Esercizi</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {formatDuration(workout.estimatedDuration)}
                        </div>
                        <div className="text-xs text-gray-600">Durata</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold mb-1 ${
                          workout.exercises.length > 0
                            ? workout.exercises.reduce((acc, curr) => {
                                const difficultyScore = curr.exercise.difficulty === 'principiante' ? 1 :
                                                    curr.exercise.difficulty === 'intermedio' ? 2 : 3;
                                return acc + difficultyScore;
                              }, 0) / workout.exercises.length >= 2.5 ? 'text-red-600' :
                            workout.exercises.reduce((acc, curr) => {
                                const difficultyScore = curr.exercise.difficulty === 'principiante' ? 1 :
                                                    curr.exercise.difficulty === 'intermedio' ? 2 : 3;
                                return acc + difficultyScore;
                              }, 0) / workout.exercises.length >= 1.5 ? 'text-yellow-600' : 'text-green-600'
                            : 'text-green-600'
                        }`}>
                          {workout.exercises.length > 0
                            ? workout.exercises.reduce((acc, curr) => {
                                const difficultyScore = curr.exercise.difficulty === 'principiante' ? 1 :
                                                    curr.exercise.difficulty === 'intermedio' ? 2 : 3;
                                return acc + difficultyScore;
                              }, 0) / workout.exercises.length >= 2.5 ? '😤' :
                            workout.exercises.reduce((acc, curr) => {
                                const difficultyScore = curr.exercise.difficulty === 'principiante' ? 1 :
                                                    curr.exercise.difficulty === 'intermedio' ? 2 : 3;
                                return acc + difficultyScore;
                              }, 0) / workout.exercises.length >= 1.5 ? '💪' : '🌱'
                            : '🌱'}
                        </div>
                        <div className="text-xs text-gray-600">Livello</div>
                      </div>
                    </div>

                    {/* Tags */}
                    {workout.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {workout.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                        {workout.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            +{workout.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Gruppi muscolari principali */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {Array.from(new Set(workout.exercises.map(e => e.exercise.muscleGroup))).slice(0, 3).map((muscle, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                        >
                          {muscle}
                        </span>
                      ))}
                      {Array.from(new Set(workout.exercises.map(e => e.exercise.muscleGroup))).length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          +{Array.from(new Set(workout.exercises.map(e => e.exercise.muscleGroup))).length - 3}
                        </span>
                      )}
                    </div>

                    {/* Data creazione e pulsante azione */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Creato il {new Date(workout.createdAt).toLocaleDateString('it', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => startWorkout(workout)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                      >
                        <Play className="w-4 h-4" />
                        <span className="font-medium text-sm">Inizia</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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