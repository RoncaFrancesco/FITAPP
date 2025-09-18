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
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Inizializza l'audio
  useEffect(() => {
    // Prova a caricare il file audio, se non funziona usa Web Audio API
    try {
      audioRef.current = new Audio('/sounds/timer-beep.mp3');
      // Preload l'audio
      audioRef.current.load();
    } catch (error) {
      console.warn('Could not load audio file, will use Web Audio API fallback:', error);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
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
  const playSound = useCallback((type: 'normal' | 'countdown' | 'finish' = 'normal') => {
    if (!settings.soundEnabled) return;

    // Prima prova con l'elemento audio
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Se fallisce, usa Web Audio API come fallback
        playBeepWithWebAudioAPI(type);
      });
    } else {
      // Usa Web Audio API come fallback
      playBeepWithWebAudioAPI(type);
    }
  }, [settings.soundEnabled]);

  // Fallback con Web Audio API
  const playBeepWithWebAudioAPI = useCallback((type: 'normal' | 'countdown' | 'finish' = 'normal') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Imposta frequenza e durata in base al tipo
      let frequency: number;
      let duration: number;
      let volume: number;

      switch (type) {
        case 'countdown':
          frequency = 600; // Beep più basso per countdown
          duration = 0.15;
          volume = 0.2;
          break;
        case 'finish':
          frequency = 1000; // Beep più alto per fine
          duration = 0.5;
          volume = 0.4;
          break;
        default:
          frequency = 800; // Beep normale
          duration = 0.1;
          volume = 0.3;
      }

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Web Audio API not available:', error);
    }
  }, []);

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
    if (countdownRef.current) {
      clearTimeout(countdownRef.current);
      countdownRef.current = null;
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
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
        countdownRef.current = null;
      }
      return;
    }

    const phaseTime = calculatePhaseTime(state.currentPhase, state.currentRound, state.currentCycle);

    // Controlla se è tempo di cambiare fase
    if (state.currentTime >= phaseTime) {
      // Determina il tipo di suono in base alla fase
      let soundType: 'normal' | 'countdown' | 'finish' = 'normal';
      if (state.currentPhase === 'work' || state.currentPhase === 'rest') {
        soundType = 'finish'; // Suono di fine fase
      } else {
        soundType = 'normal'; // Suono normale per preparazione
      }

      playSound(soundType);
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
          if (countdownRef.current) {
            clearTimeout(countdownRef.current);
            countdownRef.current = null;
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

    // Imposta i beep di countdown per gli ultimi 3 secondi
    if (countdownRef.current) {
      clearTimeout(countdownRef.current);
      countdownRef.current = null;
    }

    const timeRemaining = phaseTime - state.currentTime;
    if (timeRemaining <= 3 && timeRemaining > 0 && (state.currentPhase === 'work' || state.currentPhase === 'rest')) {
      // Programma i beep per i countdown
      for (let i = timeRemaining; i > 0; i--) {
        const delay = (phaseTime - i) * 1000;
        countdownRef.current = setTimeout(() => {
          playSound('countdown');
        }, delay);
      }
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
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
        countdownRef.current = null;
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