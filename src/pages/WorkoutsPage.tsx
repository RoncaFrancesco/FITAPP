import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Workout, WorkoutSession } from '../types';
import { db } from '../db';
import { AppHeader } from '../components/AppHeader';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 relative overflow-hidden">
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
      <AppHeader title="Le tue Schede" showBackButton={true} currentPage="workouts" />

      <div className="max-w-4xl mx-auto px-4 py-6 relative z-10">
        <div className="flex justify-between items-center mb-6 animate-fade-in-up">
          <button
            onClick={() => navigate('/create-workout')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Nuova Scheda</span>
          </button>
        </div>

        {/* Lista schede */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
            </div>
          ) : workouts.length === 0 ? (
            <div className="text-center py-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl animate-fade-in-up">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Dumbbell className="w-12 h-12 text-white animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-4 flex items-center justify-center">
                <span className="w-2 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mr-3"></span>
                Nessuna scheda disponibile
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                Crea la tua prima scheda di allenamento per iniziare
              </p>
              <button
                onClick={() => navigate('/create-workout')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 mx-auto shadow-lg"
              >
                <Plus className="w-6 h-6" />
                <span className="font-medium text-lg">Crea Scheda</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {workouts.map((workout) => (
                <div key={workout.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300 animate-fade-in-up">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                          {workout.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-base mb-3">
                          {workout.description}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editWorkout(workout.id)}
                          className="p-3 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-xl transition-all duration-300 transform hover:scale-110"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteWorkout(workout.id)}
                          className="p-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl transition-all duration-300 transform hover:scale-110"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-3 mb-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-700/50 rounded-full px-3 py-1">
                        <Target className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">{workout.exercises.length} esercizi</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-700/50 rounded-full px-3 py-1">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{formatDuration(workout.estimatedDuration)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-700/50 rounded-full px-3 py-1">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{new Date(workout.createdAt).toLocaleDateString('it')}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {workout.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {workout.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-xs font-medium transform hover:scale-105 transition-all duration-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Gruppi muscolari */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Array.from(new Set(workout.exercises.map(e => e.exercise.muscleGroup))).map((muscle, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-xs font-medium transform hover:scale-105 transition-all duration-300"
                        >
                          💪 {muscle}
                        </span>
                      ))}
                    </div>

                    {/* Difficoltà media */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Difficoltà:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(
                          workout.exercises.length > 0
                            ? workout.exercises.reduce((acc, curr) => {
                                const difficultyScore = curr.exercise.difficulty === 'principiante' ? 1 :
                                                    curr.exercise.difficulty === 'intermedio' ? 2 : 3;
                                return acc + difficultyScore;
                              }, 0) / workout.exercises.length >= 2.5 ? 'avanzato' :
                            workout.exercises.reduce((acc, curr) => {
                                const difficultyScore = curr.exercise.difficulty === 'principiante' ? 1 :
                                                    curr.exercise.difficulty === 'intermedio' ? 2 : 3;
                                return acc + difficultyScore;
                              }, 0) / workout.exercises.length >= 1.5 ? 'intermedio' : 'principiante'
                            : 'principiante'
                        )}`}>
                          {workout.exercises.length > 0
                            ? workout.exercises.reduce((acc, curr) => {
                                const difficultyScore = curr.exercise.difficulty === 'principiante' ? 1 :
                                                    curr.exercise.difficulty === 'intermedio' ? 2 : 3;
                                return acc + difficultyScore;
                              }, 0) / workout.exercises.length >= 2.5 ? 'Avanzata' :
                            workout.exercises.reduce((acc, curr) => {
                                const difficultyScore = curr.exercise.difficulty === 'principiante' ? 1 :
                                                    curr.exercise.difficulty === 'intermedio' ? 2 : 3;
                                return acc + difficultyScore;
                              }, 0) / workout.exercises.length >= 1.5 ? 'Intermedia' : 'Principiante'
                            : 'Principiante'}
                        </span>
                      </div>

                      <button
                        onClick={() => startWorkout(workout)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 shadow-lg"
                      >
                        <Play className="w-5 h-5" />
                        <span className="font-medium">Inizia Allenamento</span>
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
            © 2025 · Tutti i diritti riservati · Creato da Francesco Ronca
          </p>
        </div>
      </footer>
    </div>
  );
};