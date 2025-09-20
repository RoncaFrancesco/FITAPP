import { useState, useEffect } from 'react';
import { UserPreferences } from '../types';
import { db } from '../db';

export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    applyTheme();
  }, [theme]);

  const loadPreferences = async () => {
    try {
      // Ensure database is initialized
      await db.open();
      await db.initializeDefaultData();

      const preferences = await db.preferences.get('default');
      if (preferences) {
        console.log('Loading theme from database:', preferences.theme);
        setTheme(preferences.theme);
      } else {
        console.log('No preferences found, using default: system');
      }
    } catch (error) {
      console.error('Error loading theme preferences:', error);
      // Try localStorage as fallback
      try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          console.log('Loading theme from localStorage:', savedTheme);
          setTheme(savedTheme as 'light' | 'dark' | 'system');
        }
      } catch (localError) {
        console.error('Failed to load theme from localStorage:', localError);
      }
    }
  };

  const applyTheme = () => {
    let dark = false;

    if (theme === 'system') {
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      dark = theme === 'dark';
    }

    console.log('Applying theme:', theme, '->', dark ? 'dark' : 'light');

    setIsDark(dark);

    // Rimuovi classe opposta e aggiungi quella corretta
    if (dark) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';

      // Forza stili su body per testare
      document.body.style.backgroundColor = '#0f172a';
      document.body.style.color = '#f8fafc';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';

      // Forza stili su body per testare
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#0f172a';
    }

    console.log('Document classList after:', document.documentElement.className);
    console.log('Body styles:', document.body.style.backgroundColor, document.body.style.color);

    // Test Tailwind dark mode
    setTimeout(() => {
      const testElement = document.querySelector('h1, .card, body') || document.body;
      const computedStyle = window.getComputedStyle(testElement);
      console.log('Test element background:', computedStyle.backgroundColor);
      console.log('Test element color:', computedStyle.color);
      console.log('HTML has dark class:', document.documentElement.classList.contains('dark'));
    }, 100);
  };

  const setThemePreference = async (newTheme: 'light' | 'dark' | 'system') => {
    try {
      console.log('Setting theme to:', newTheme);

      // Applica il tema immediatamente
      setTheme(newTheme);

      // Salva in localStorage immediatamente
      localStorage.setItem('theme', newTheme);

      // Salva nel database in modo sincrono
      try {
        await db.open();
        await db.initializeDefaultData();

        const existing = await db.preferences.get('default');

        if (existing) {
          await db.preferences.update('default', { theme: newTheme });
          console.log('Theme updated in database:', newTheme);
        } else {
          await db.preferences.add({
            id: 'default',
            theme: newTheme,
            defaultRestTime: 60,
            defaultTimerSettings: {
              type: 'single',
              workTime: 30,
              restTime: 10,
              rounds: 3,
              cycles: 1,
              preparationTime: 3,
              soundEnabled: true,
              vibrationEnabled: true
            },
            language: 'it',
            units: 'metric',
            notifications: {
              workoutReminders: true,
              achievementAlerts: true
            },
            ai: {
              useGemini: false
            }
          });
          console.log('Theme created in database:', newTheme);
        }
      } catch (error) {
        console.error('Database theme save failed:', error);
      }

    } catch (error) {
      console.error('Error setting theme preference:', error);
      localStorage.setItem('theme', newTheme);
    }
  };

  // Ascolta i cambiamenti del tema di sistema
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return {
    theme,
    isDark,
    setTheme: setThemePreference
  };
};