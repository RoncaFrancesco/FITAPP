import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerSettings } from '../types';

export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  currentTime: number;
  currentRound: number;
  currentCycle: number;
  currentPhase: 'work' | 'rest' | 'preparation' | 'complete';
  totalTime: number;
}

export const useTimer = (initialSettings: TimerSettings) => {
  const [settings, setSettings] = useState<TimerSettings>(initialSettings);
  const [state, setState] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    currentTime: 0,
    currentRound: 1,
    currentCycle: 1,
    currentPhase: 'preparation',
    totalTime: 0
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inizializza l'audio
  useEffect(() => {
    audioRef.current = new Audio('/sounds/timer-beep.mp3');
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Calcola il tempo totale per ogni fase
  const calculatePhaseTime = useCallback((phase: TimerState['currentPhase'], round: number, cycle: number) => {
    switch (phase) {
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
  }, [settings]);

  // Riproduce suono di notifica
  const playSound = useCallback(() => {
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [settings.soundEnabled]);

  // Vibrazione per notifica
  const vibrate = useCallback(() => {
    if (settings.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }, [settings.vibrationEnabled]);

  // Avvia il timer
  const start = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: true,
      isPaused: false
    }));
  }, []);

  // Metti in pausa il timer
  const pause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: true
    }));
  }, []);

  // Riprendi il timer
  const resume = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: false
    }));
  }, []);

  // Resetta il timer
  const reset = useCallback(() => {
    setState({
      isActive: false,
      isPaused: false,
      currentTime: 0,
      currentRound: 1,
      currentCycle: 1,
      currentPhase: 'preparation',
      totalTime: 0
    });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  // Aggiorna le impostazioni del timer
  const updateSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Logica principale del timer
  useEffect(() => {
    if (!state.isActive || state.isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const phaseTime = calculatePhaseTime(state.currentPhase, state.currentRound, state.currentCycle);

    // Controlla se è tempo di cambiare fase
    if (state.currentTime >= phaseTime) {
      playSound();
      vibrate();

      let nextPhase: TimerState['currentPhase'] = state.currentPhase;
      let nextRound = state.currentRound;
      let nextCycle = state.currentCycle;

      switch (state.currentPhase) {
        case 'preparation':
          nextPhase = 'work';
          break;
        case 'work':
          if (settings.type === 'single') {
            nextPhase = 'complete';
          } else {
            nextPhase = 'rest';
          }
          break;
        case 'rest':
          nextRound++;
          if (nextRound > settings.rounds) {
            nextRound = 1;
            nextCycle++;
            if (nextCycle > settings.cycles) {
              nextPhase = 'complete';
            } else {
              nextPhase = 'preparation';
            }
          } else {
            nextPhase = 'work';
          }
          break;
        case 'complete':
          setState(prev => ({ ...prev, isActive: false }));
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return;
      }

      setState(prev => ({
        ...prev,
        currentPhase: nextPhase,
        currentRound: nextRound,
        currentCycle: nextCycle,
        currentTime: 0
      }));

      return;
    }

    // Avvia l'intervallo per aggiornare il tempo
    intervalRef.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        currentTime: prev.currentTime + 1,
        totalTime: prev.totalTime + 1
      }));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isActive, state.isPaused, state.currentTime, state.currentPhase, state.currentRound, state.currentCycle, settings, calculatePhaseTime, playSound, vibrate]);

  // Preset timer
  const presets = {
    tabata: {
      type: 'tabata' as const,
      workTime: 20,
      restTime: 10,
      rounds: 8,
      cycles: 1,
      preparationTime: 5,
      soundEnabled: true,
      vibrationEnabled: true
    },
    hiit: {
      type: 'hiit' as const,
      workTime: 30,
      restTime: 30,
      rounds: 10,
      cycles: 1,
      preparationTime: 5,
      soundEnabled: true,
      vibrationEnabled: true
    },
    circuit: {
      type: 'circuit' as const,
      workTime: 45,
      restTime: 15,
      rounds: 6,
      cycles: 1,
      preparationTime: 5,
      soundEnabled: true,
      vibrationEnabled: true
    },
    custom: settings
  };

  return {
    state,
    settings,
    start,
    pause,
    resume,
    reset,
    updateSettings,
    presets,
    intervalRef,
    audioRef
  };
};