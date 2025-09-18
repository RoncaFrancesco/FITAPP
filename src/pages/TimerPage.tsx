import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { TimerDisplay } from '../components/TimerDisplay';
import { TimerSettings } from '../types';
import { ArrowLeft, Clock, Zap, Target, Play, Dumbbell, Activity, Heart } from 'lucide-react';

export const TimerPage: React.FC = () => {
  const navigate = useNavigate();
  const [timerName, setTimerName] = useState('');
  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    type: 'circuit',
    workTime: 45,
    restTime: 15,
    rounds: 6,
    cycles: 1,
    preparationTime: 5,
    soundEnabled: true,
    vibrationEnabled: true
  });
  const [isEditing, setIsEditing] = useState(true);

  const handleTimerStart = () => {
    if (timerName.trim()) {
      setIsEditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-purple-400/20 to-blue-400/20 animate-pulse"
            style={{
              width: `${Math.random() * 100 + 30}px`,
              height: `${Math.random() * 100 + 30}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 15 + 10}s`
            }}
          />
        ))}
      </div>

      {/* Header semplificato */}
      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6 text-purple-600" />
          </button>
          <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center">
            <span className="w-2 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mr-3"></span>
            Circuit Timer
          </h1>
          <div className="w-12"></div> {/* Spacer per centrare il titolo */}
        </div>
      </div>

      {/* Contenuto principale */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8 relative z-10">
        <div className="w-full max-w-2xl">
          {isEditing ? (
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 animate-fade-in-up">
              <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-6 text-center flex items-center justify-center">
                <span className="w-2 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mr-3"></span>
                Crea il tuo Timer
              </h2>

              {/* Nome timer */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome Timer
                </label>
                <input
                  type="text"
                  value={timerName}
                  onChange={(e) => setTimerName(e.target.value)}
                  placeholder="Inserisci un nome per il tuo timer"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Impostazioni timer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tempo di Lavoro (secondi)
                  </label>
                  <input
                    type="number"
                    value={timerSettings.workTime}
                    onChange={(e) => setTimerSettings(prev => ({ ...prev, workTime: parseInt(e.target.value) || 30 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="1"
                    max="600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tempo di Riposo (secondi)
                  </label>
                  <input
                    type="number"
                    value={timerSettings.restTime}
                    onChange={(e) => setTimerSettings(prev => ({ ...prev, restTime: parseInt(e.target.value) || 15 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="1"
                    max="600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Round
                  </label>
                  <input
                    type="number"
                    value={timerSettings.rounds}
                    onChange={(e) => setTimerSettings(prev => ({ ...prev, rounds: parseInt(e.target.value) || 1 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="1"
                    max="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tempo di Preparazione (secondi)
                  </label>
                  <input
                    type="number"
                    value={timerSettings.preparationTime}
                    onChange={(e) => setTimerSettings(prev => ({ ...prev, preparationTime: parseInt(e.target.value) || 5 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                    max="30"
                  />
                </div>
              </div>

              {/* Opzioni */}
              <div className="space-y-3 mb-6">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={timerSettings.soundEnabled}
                    onChange={(e) => setTimerSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Abilita suoni</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={timerSettings.vibrationEnabled}
                    onChange={(e) => setTimerSettings(prev => ({ ...prev, vibrationEnabled: e.target.checked }))}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Abilita vibrazione</span>
                </label>
              </div>

              {/* Pulsante start */}
              <button
                onClick={handleTimerStart}
                disabled={!timerName.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg"
              >
                Inizia Timer
              </button>
            </div>
          ) : (
            <div className="animate-fade-in-up">
              {/* Info Timer */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center space-x-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                  <Activity className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">{timerName}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {timerSettings.workTime}s lavoro • {timerSettings.restTime}s riposo • {timerSettings.rounds} round
                </p>
              </div>

              {/* Timer principale */}
              <TimerDisplay
                initialSettings={timerSettings}
                onSettingsChange={setTimerSettings}
              />

              {/* Pulsante modifica */}
              <div className="text-center mt-6">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-2xl hover:bg-gray-700 transition-colors"
                >
                  Modifica Timer
                </button>
              </div>
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