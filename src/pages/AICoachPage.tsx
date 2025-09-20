import React, { useState, useEffect } from 'react';
import { useAI } from '../hooks/useAI';
import { useTheme } from '../hooks/useTheme';
import { Navigation } from '../components/Navigation';
import { AiWorkoutRequest, Workout, MuscleGroup, Equipment, ExperienceLevel, Goal } from '../types';
import { Send, Bot, User, Save, Clock, Target, Dumbbell, Sparkles, ArrowLeft, Brain, Zap, TrendingUp, Heart, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const AICoachPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  const { messages, loading, generateWorkout, sendMessage, saveGeneratedWorkout, clearMessages, setMessages } = useAI();
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [workoutRequest, setWorkoutRequest] = useState<AiWorkoutRequest>({
    goals: [Goal.MUSCLE_GAIN],
    experienceLevel: ExperienceLevel.INTERMEDIATE,
    timeAvailable: 60,
    equipment: [Equipment.BODYWEIGHT],
    preferences: {
      workoutDays: 3,
      preferredMuscleGroups: [],
      avoidInjuries: []
    }
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Controlla se il messaggio contiene parole chiave per generare una scheda
    const lowerMessage = inputMessage.toLowerCase();
    if (lowerMessage.includes('scheda') || lowerMessage.includes('allenamento')) {
      setShowWorkoutForm(true);
      setInputMessage('');
      return;
    }

    sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleGenerateWorkout = async () => {
    setIsGenerating(true);
    try {
      const workout = await generateWorkout(workoutRequest);

      // Aggiungi messaggio con la scheda generata
      const workoutMessage = {
        id: crypto.randomUUID(),
        content: `Ho creato una scheda personalizzata per te basata sulle tue preferenze:\n\n**${workout.name}**\n${workout.description}\n\nEsercizi (${workout.exercises.length}):\n${workout.exercises.map(ex => `• ${ex.exercise.name} - ${ex.sets.length}x${ex.sets[0].reps}`).join('\n')}\n\nDurata stimata: ${workout.estimatedDuration} minuti`,
        type: 'ai' as const,
        timestamp: new Date(),
        workout
      };

      setMessages(prev => [...prev, workoutMessage]);
      setShowWorkoutForm(false);
    } catch (error) {
      toast.error('Errore nella generazione della scheda');
      console.error('Error generating workout:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveWorkout = (workout: Workout) => {
    saveGeneratedWorkout(workout);
    toast.success('Scheda salvata con successo!');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleGoal = (goal: Goal) => {
    setWorkoutRequest(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const toggleEquipment = (equipment: Equipment) => {
    setWorkoutRequest(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter(eq => eq !== equipment)
        : [...prev.equipment, equipment]
    }));
  };

  const toggleMuscleGroup = (muscleGroup: MuscleGroup) => {
    setWorkoutRequest(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        preferredMuscleGroups: prev.preferences.preferredMuscleGroups.includes(muscleGroup)
          ? prev.preferences.preferredMuscleGroups.filter(mg => mg !== muscleGroup)
          : [...prev.preferences.preferredMuscleGroups, muscleGroup]
      }
    }));
  };

  const addInjury = (injury: string) => {
    if (injury.trim() && !workoutRequest.preferences.avoidInjuries.includes(injury.trim())) {
      setWorkoutRequest(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          avoidInjuries: [...prev.preferences.avoidInjuries, injury.trim()]
        }
      }));
    }
  };

  const removeInjury = (injury: string) => {
    setWorkoutRequest(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        avoidInjuries: prev.preferences.avoidInjuries.filter(i => i !== injury)
      }
    }));
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('it', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-purple-400/20 to-blue-400/20 animate-pulse"
            style={{
              width: `${Math.random() * 100 + 20}px`,
              height: `${Math.random() * 100 + 20}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 5}s`
            }}
          />
        ))}
      </div>
      {/* Header */}
      <Navigation showBackButton={true} currentPage="AI Coach" />

      <div className="max-w-4xl mx-auto px-4 py-6 relative z-10">
        <h1 className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-6 text-center">
          AI Coach
        </h1>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 m-4 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-purple-100 text-lg">Il tuo personal trainer intelligente</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">150+</div>
            <div className="text-xs text-purple-200">Esercizi</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-xs text-purple-200">Disponibile</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">AI</div>
            <div className="text-xs text-purple-200">Intelligente</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => {
              const quickMessage = "Crea una scheda di allenamento completa per me";
              sendMessage(quickMessage);
            }}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1"
          >
            <div className="relative">
              <Dumbbell className="w-6 h-6 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-blue-600 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300 scale-125"></div>
            </div>
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">Nuova Scheda</div>
          </button>

          <button
            onClick={() => {
              const quickMessage = "Dammi consigli per migliorare la forza";
              sendMessage(quickMessage);
            }}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1"
          >
            <div className="relative">
              <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-green-600 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300 scale-125"></div>
            </div>
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 transition-colors">Forza</div>
          </button>

          <button
            onClick={() => {
              const quickMessage = "Allenamento per perdere peso";
              sendMessage(quickMessage);
            }}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1"
          >
            <div className="relative">
              <Heart className="w-6 h-6 text-red-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-red-600 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300 scale-125"></div>
            </div>
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 transition-colors">Dimagrimento</div>
          </button>

          <button
            onClick={() => {
              const quickMessage = "Timer HIIT per 20 minuti";
              sendMessage(quickMessage);
            }}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1"
          >
            <div className="relative">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-purple-600 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300 scale-125"></div>
            </div>
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-600 transition-colors">Timer</div>
          </button>
        </div>
      </div>

      {/* Chat container */}
      <div className="flex-1 overflow-hidden flex flex-col mx-4 mb-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Bot className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>

              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3 animate-pulse">
                Ciao! Sono il tuo AI Coach 🤖
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto text-lg">
                Posso creare schede personalizzate, darti consigli intelligenti e aiutarti a raggiungere i tuoi obiettivi fitness.
              </p>

              {/* Floating stats */}
              <div className="flex justify-center space-x-8 mb-6">
                <div className="text-center transform hover:scale-110 transition-transform duration-300">
                  <div className="text-3xl mb-1">💪</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Forza</div>
                </div>
                <div className="text-center transform hover:scale-110 transition-transform duration-300">
                  <div className="text-3xl mb-1">🎯</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Precisione</div>
                </div>
                <div className="text-center transform hover:scale-110 transition-transform duration-300">
                  <div className="text-3xl mb-1">⚡</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Velocità</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-2xl p-6 max-w-2xl mx-auto backdrop-blur-sm">
                <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Prova a chiedermi:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => sendMessage("Crea una scheda per principianti")}
                    className="text-left p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                      💪 Scheda per principianti
                    </div>
                  </button>
                  <button
                    onClick={() => sendMessage("Allenamento cardio a casa")}
                    className="text-left p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                      🏠 Cardio a casa
                    </div>
                  </button>
                  <button
                    onClick={() => sendMessage("Come aumentare la massa muscolare?")}
                    className="text-left p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                      📈 Aumentare massa muscolare
                    </div>
                  </button>
                  <button
                    onClick={() => sendMessage("Consigli per l'alimentazione")}
                    className="text-left p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                      🥗 Consigli alimentari
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-xl rounded-2xl p-4 shadow-lg backdrop-blur-sm transform transition-all duration-300 hover:scale-[1.02] ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none hover:shadow-xl'
                    : 'bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 rounded-bl-none border border-white/20 hover:shadow-xl'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {message.type === 'user' ? (
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                      <User className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <span className={`text-xs ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>

                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content.split('\n').map((line, i) => {
                    if (line.startsWith('**')) {
                      return (
                        <strong key={i} className="font-semibold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                          {line.replace(/\*\*/g, '')}
                        </strong>
                      );
                    }
                    return <span key={i} className="block mb-1">{line}</span>;
                  })}
                </div>

                {message.workout && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                        {message.workout.name}
                      </h4>
                      <button
                        onClick={() => handleSaveWorkout(message.workout!)}
                        className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{message.workout.description}</p>
                    <div className="space-y-2">
                      {message.workout.exercises.slice(0, 3).map((ex, index) => (
                        <div key={ex.id} className="flex justify-between text-sm bg-white/10 rounded-lg p-2">
                          <span className="font-medium">{index + 1}. {ex.exercise.name}</span>
                          <span className="bg-blue-600/30 px-2 py-1 rounded-full text-xs">{ex.sets.length}x{ex.sets[0].reps}</span>
                        </div>
                      ))}
                      {message.workout.exercises.length > 3 && (
                        <p className="text-xs text-blue-200 font-medium">
                          ...e altri {message.workout.exercises.length - 3} esercizi
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-blue-200">Durata: {message.workout.estimatedDuration} minuti</span>
                      <div className="flex space-x-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-xs text-green-400">Pronto</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Workout Form */}
        {showWorkoutForm && (
          <div className="bg-white border-t border-gray-200 p-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Crea la tua scheda personalizzata
            </h3>

            <div className="space-y-4">
              {/* Obiettivi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Obiettivi (seleziona uno o più)
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(Goal).map((goal) => (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        workoutRequest.goals.includes(goal)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Livello esperienza */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Livello di esperienza
                </label>
                <div className="flex gap-2">
                  {Object.values(ExperienceLevel).map((level) => (
                    <button
                      key={level}
                      onClick={() => setWorkoutRequest(prev => ({ ...prev, experienceLevel: level }))}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                        workoutRequest.experienceLevel === level
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tempo disponibile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempo disponibile (minuti)
                </label>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="15"
                  value={workoutRequest.timeAvailable}
                  onChange={(e) => setWorkoutRequest(prev => ({ ...prev, timeAvailable: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600 mt-1">
                  {workoutRequest.timeAvailable} minuti
                </div>
              </div>

              {/* Attrezzatura */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attrezzatura disponibile
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(Equipment).slice(0, 6).map((eq) => (
                    <button
                      key={eq}
                      onClick={() => toggleEquipment(eq)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        workoutRequest.equipment.includes(eq)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gruppi muscolari preferiti */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gruppi muscolari preferiti (opzionale)
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(MuscleGroup).slice(0, 6).map((mg) => (
                    <button
                      key={mg}
                      onClick={() => toggleMuscleGroup(mg)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        workoutRequest.preferences.preferredMuscleGroups.includes(mg)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {mg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Infortuni da evitare */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Infortuni da evitare (opzionale)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {workoutRequest.preferences.avoidInjuries.map((injury) => (
                    <span
                      key={injury}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center space-x-1"
                    >
                      <span>{injury}</span>
                      <button
                        onClick={() => removeInjury(injury)}
                        className="ml-1 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Aggiungi infortunio e premi Invio"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addInjury((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Pulsanti azione */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowWorkoutForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleGenerateWorkout}
                  disabled={isGenerating || workoutRequest.goals.length === 0}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                    isGenerating || workoutRequest.goals.length === 0
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generazione...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Genera Scheda</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input area */}
        {!showWorkoutForm && (
          <div className="bg-gradient-to-t from-white/80 to-transparent backdrop-blur-sm border-t border-white/20 p-4">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  id="aiCoachMessage"
                  name="aiCoachMessage"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Chiedimi qualsiasi cosa sulla tua scheda, esercizi o fitness..."
                  className="w-full px-4 py-3 bg-white/90 dark:bg-gray-800/90 border border-white/20 rounded-2xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-gray-200 transition-all duration-300 focus:shadow-lg"
                  rows={2}
                  disabled={loading}
                />
                {inputMessage && (
                  <div className="absolute top-2 right-2 text-xs text-gray-500 bg-white/50 rounded-full px-2 py-1">
                    {inputMessage.length}
                  </div>
                )}
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || loading}
                className={`p-3 rounded-2xl transition-all duration-300 shadow-lg backdrop-blur-sm transform ${
                  !inputMessage.trim() || loading
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl hover:scale-110 active:scale-95'
                }`}
              >
                <Send className="w-5 h-5 transform transition-transform duration-300 group-hover:rotate-12" />
              </button>
            </div>

            {/* Quick actions */}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setShowWorkoutForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <Target className="w-3 h-3 inline mr-1" />
                Crea scheda
              </button>
              <button
                onClick={() => setInputMessage('Dammi un timer per HIIT')}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-sm hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <Clock className="w-3 h-3 inline mr-1" />
                Timer HIIT
              </button>
              <button
                onClick={() => setInputMessage('Consigli per aumentare la forza')}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-sm hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <Dumbbell className="w-3 h-3 inline mr-1" />
                Aumenta forza
              </button>
              <button
                onClick={() => setInputMessage('Nutrizione per la massa muscolare')}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full text-sm hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                🥗 Nutrizione
              </button>
            </div>
          </div>
        )}
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