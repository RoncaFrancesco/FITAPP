import React from 'react';
import { useTimer } from '../hooks/useTimer';
import { TimerSettings } from '../types';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

interface TimerDisplayProps {
  initialSettings: TimerSettings;
  onSettingsChange?: (settings: TimerSettings) => void;
  className?: string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  initialSettings,
  onSettingsChange,
  className = ''
}) => {
  const { state, settings, start, pause, resume, reset, updateSettings, presets } = useTimer(initialSettings);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseTime = () => {
    switch (state.currentPhase) {
      case 'preparation':
        return settings.preparationTime;
      case 'work':
        return settings.workTime;
      case 'rest':
        return settings.restTime;
      case 'complete':
        return 0;
      default:
        return 0;
    }
  };

  const getPhaseColor = () => {
    switch (state.currentPhase) {
      case 'preparation':
        return 'text-blue-600';
      case 'work':
        return 'text-green-600';
      case 'rest':
        return 'text-orange-600';
      case 'complete':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPhaseText = () => {
    switch (state.currentPhase) {
      case 'preparation':
        return 'Preparazione';
      case 'work':
        return 'Lavoro';
      case 'rest':
        return 'Riposo';
      case 'complete':
        return 'Completato!';
      default:
        return '';
    }
  };

  const progress = getPhaseTime() > 0 ? (state.currentTime / getPhaseTime()) * 100 : 0;

  // Rimuoviamo i preset e lasciamo solo le funzionalità base del timer

  return (
    <div className={`w-full max-w-md mx-auto p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl ${className}`}>
      {/* Header semplificato */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center">
          <span className="w-2 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mr-3"></span>
          Timer {settings.type.charAt(0).toUpperCase() + settings.type.slice(1)}
        </h2>
      </div>

      {/* Display principale */}
      <div className="relative w-80 h-80 mx-auto mb-8">
        {/* Cerchio di progresso */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * progress) / 100}
            className={getPhaseColor()}
          />
        </svg>

        {/* Testo centrale */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-5xl font-bold ${getPhaseColor()}`}>
            {formatTime(getPhaseTime() - state.currentTime)}
          </div>
          <div className="text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">
            {getPhaseText()}
          </div>
          {settings.type !== 'single' && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Round {state.currentRound}/{settings.rounds}
              {settings.cycles > 1 && ` • Ciclo ${state.currentCycle}/${settings.cycles}`}
            </div>
          )}
        </div>
      </div>

      {/* Info sessione */}
      <div className="flex justify-between text-sm text-gray-600 mb-4">
        <span>Tempo totale: {formatTime(state.totalTime)}</span>
        <span>{settings.type === 'tabata' ? 'Tabata' : settings.type === 'hiit' ? 'HIIT' : settings.type === 'circuit' ? 'Circuit' : 'Singolo'}</span>
      </div>

      {/* Controlli */}
      <div className="flex justify-center space-x-6 mb-8">
        {!state.isActive ? (
          <button
            onClick={start}
            className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <Play className="w-10 h-10 ml-1" />
          </button>
        ) : state.isPaused ? (
          <button
            onClick={resume}
            className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <Play className="w-10 h-10 ml-1" />
          </button>
        ) : (
          <button
            onClick={pause}
            className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <Pause className="w-10 h-10" />
          </button>
        )}

        {(state.isActive || state.currentTime > 0) && (
          <button
            onClick={reset}
            className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <RotateCcw className="w-10 h-10" />
          </button>
        )}
      </div>

      {/* Spazio vuoto invece dei preset */}
      <div className="h-4"></div>

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