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
      const preferences = await db.preferences.get('default');
      if (preferences) {
        setTheme(preferences.theme);
      }
    } catch (error) {
      console.error('Error loading theme preferences:', error);
    }
  };

  const applyTheme = () => {
    let dark = false;

    if (theme === 'system') {
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      dark = theme === 'dark';
    }

    setIsDark(dark);

    // Applica le classi al documento
    if (dark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  };

  const setThemePreference = async (newTheme: 'light' | 'dark' | 'system') => {
    try {
      setTheme(newTheme);

      // Salva nel database
      await db.preferences.update('default', {
        theme: newTheme
      });
    } catch (error) {
      console.error('Error saving theme preference:', error);
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