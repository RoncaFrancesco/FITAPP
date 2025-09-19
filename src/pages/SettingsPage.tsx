import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { useTheme } from '../hooks/useTheme';
import { useBackup } from '../hooks/useBackup';
import { BackupManager } from '../components/BackupManager';
import { UserPreferences, TimerSettings } from '../types';
import { db } from '../db';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  Bell,
  Weight,
  Languages,
  Key,
  Info,
  ArrowLeft,
  Save,
  Trash2,
  Database,
  Download,
  Upload
} from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, isDark, setTheme } = useTheme();
  const { loading, exportBackup, importWorkout, shareWorkout } = useBackup();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [showBackup, setShowBackup] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [workoutFile, setWorkoutFile] = useState<File | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      // Ensure database is initialized
      await db.open();
      await db.initializeDefaultData();

      const prefs = await db.preferences.get('default');
      if (prefs) {
        setPreferences(prefs);
        setApiKey(prefs.ai?.apiKey || '');
      } else {
        // Create default preferences if none exist
        const defaultPrefs = {
          id: 'default',
          theme: 'system' as const,
          defaultRestTime: 60,
          defaultTimerSettings: {
            type: 'single' as const,
            workTime: 30,
            restTime: 60,
            rounds: 1,
            cycles: 1,
            preparationTime: 5,
            soundEnabled: true,
            vibrationEnabled: true
          },
          language: 'it' as const,
          units: 'metric' as const,
          notifications: {
            workoutReminders: true,
            achievementAlerts: true
          },
          ai: {
            useGemini: true,
            apiKey: ''
          }
        };
        await db.preferences.add(defaultPrefs);
        setPreferences(defaultPrefs);
        setApiKey('');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      // Set default preferences even if database fails
      const fallbackPrefs = {
        id: 'default',
        theme: 'system' as const,
        defaultRestTime: 60,
        defaultTimerSettings: {
          type: 'single' as const,
          workTime: 30,
          restTime: 60,
          rounds: 1,
          cycles: 1,
          preparationTime: 5,
          soundEnabled: true,
          vibrationEnabled: true
        },
        language: 'it' as const,
        units: 'metric' as const,
        notifications: {
          workoutReminders: true,
          achievementAlerts: true
        },
        ai: {
          useGemini: true,
          apiKey: ''
        }
      };
      setPreferences(fallbackPrefs);
      setApiKey('');
    } finally {
      setLoadingPrefs(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    try {
      setLoadingPrefs(true);
      await db.preferences.update('default', {
        ...preferences,
        ai: {
          ...preferences.ai,
          apiKey
        }
      });
      toast.success('Preferenze salvate!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Errore nel salvataggio delle preferenze');
    } finally {
      setLoadingPrefs(false);
    }
  };

  const updateTimerSettings = (updates: Partial<TimerSettings>) => {
    if (!preferences) return;

    setPreferences(prev => ({
      ...prev!,
      defaultTimerSettings: {
        ...prev!.defaultTimerSettings,
        ...updates
      }
    }));
  };

  const handleWorkoutImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const workout = await importWorkout(file);
      toast.success('Scheda importata con successo!');
      navigate('/workouts');
    } catch (error) {
      toast.error('Errore nell\'importazione della scheda');
    }

    event.target.value = '';
  };

  const resetPreferences = async () => {
    if (confirm('Sei sicuro di voler ripristinare le impostazioni predefinite?')) {
      try {
        // Assicuriamoci che il database sia aperto
        await db.open();

        // Eliminiamo le preferenze esistenti
        await db.preferences.delete('default');

        // Forziamo la reinizializzazione dei dati predefiniti
        await db.initializeDefaultData();

        // Ricarichiamo le preferenze con un piccolo ritardo per assicurare che il database abbia aggiornato
        setTimeout(async () => {
          await loadPreferences();
          toast.success('Impostazioni ripristinate!');
        }, 100);
      } catch (error) {
        console.error('Error resetting preferences:', error);
        toast.error('Errore nel ripristino delle impostazioni');

        // Tentativo di ripristino di emergenza
        try {
          const defaultPrefs = {
            id: 'default',
            theme: 'system' as const,
            defaultRestTime: 60,
            defaultTimerSettings: {
              type: 'single' as const,
              workTime: 30,
              restTime: 60,
              rounds: 1,
              cycles: 1,
              preparationTime: 5,
              soundEnabled: true,
              vibrationEnabled: true
            },
            language: 'it' as const,
            units: 'metric' as const,
            notifications: {
              workoutReminders: true,
              achievementAlerts: true
            },
            ai: {
              useGemini: true
            }
          };
          await db.preferences.add(defaultPrefs);
          await loadPreferences();
          toast.success('Impostazioni ripristinate (modalità sicura)!');
        } catch (fallbackError) {
          console.error('Fallback reset failed:', fallbackError);
        }
      }
    }
  };

  if (showBackup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
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
        <div className="relative z-10 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowBackup(false)}
              className="p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6 text-purple-600" />
            </button>
            <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center">
              <span className="w-2 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mr-3"></span>
              Gestione Backup
            </h1>
            <div className="w-12"></div> {/* Spacer per centrare il titolo */}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 pb-8">
          <div className="max-w-4xl mx-auto">
            <BackupManager onImportSuccess={() => setShowBackup(false)} />
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
  }

  if (loadingPrefs || !preferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 relative overflow-hidden flex items-center justify-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
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
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
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
      <Navigation showBackButton={true} currentPage="Impostazioni" />

      <div className="max-w-4xl mx-auto px-4 py-6 relative z-10">
        <h1 className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-6 text-center">
          Impostazioni
        </h1>

        <div className="space-y-6">

        {/* Tema */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2" />
            Aspetto
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tema dell'app
              </label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                    theme === 'light'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Sun className="w-5 h-5 text-yellow-500" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Chiaro</div>
                      <div className="text-sm text-gray-500">Tema chiaro sempre attivo</div>
                    </div>
                  </div>
                  {theme === 'light' && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  )}
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                    theme === 'dark'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Moon className="w-5 h-5 text-purple-500" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Scuro</div>
                      <div className="text-sm text-gray-500">Tema scuro sempre attivo</div>
                    </div>
                  </div>
                  {theme === 'dark' && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  )}
                </button>

                <button
                  onClick={() => setTheme('system')}
                  className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                    theme === 'system'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Monitor className="w-5 h-5 text-gray-500" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Sistema</div>
                      <div className="text-sm text-gray-500">Segui le impostazioni del dispositivo</div>
                    </div>
                  </div>
                  {theme === 'system' && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {isDark ? (
                    <Moon className="w-5 h-5 text-purple-500" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Tema attuale: {theme === 'system' ? `Sistema (${isDark ? 'Scuro' : 'Chiaro'})` : theme === 'dark' ? 'Scuro' : 'Chiaro'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Le modifiche vengono applicate immediatamente
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Monitor className="w-5 h-5 mr-2" />
            Timer Predefiniti
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tempo di riposo predefinito (secondi)
                </label>
                <input
                  type="number"
                  value={preferences.defaultRestTime}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev!,
                    defaultRestTime: parseInt(e.target.value) || 60
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max="600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tempo di preparazione (secondi)
                </label>
                <input
                  type="number"
                  value={preferences.defaultTimerSettings.preparationTime}
                  onChange={(e) => updateTimerSettings({ preparationTime: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max="30"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">Notifiche timer</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={preferences.defaultTimerSettings.soundEnabled}
                    onChange={(e) => updateTimerSettings({ soundEnabled: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Abilita suoni</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={preferences.defaultTimerSettings.vibrationEnabled}
                    onChange={(e) => updateTimerSettings({ vibrationEnabled: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Abilita vibrazione</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Lingua e Unità */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Languages className="w-5 h-5 mr-2" />
            Lingua e Unità
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lingua
              </label>
              <select
                value={preferences.language}
                onChange={(e) => setPreferences(prev => ({
                  ...prev!,
                  language: e.target.value as 'it' | 'en'
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="it">Italiano</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unità di misura
              </label>
              <select
                value={preferences.units}
                onChange={(e) => setPreferences(prev => ({
                  ...prev!,
                  units: e.target.value as 'metric' | 'imperial'
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="metric">Metrico (kg, cm)</option>
                <option value="imperial">Imperial (lbs, ft)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifiche */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifiche
          </h2>

          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.notifications.workoutReminders}
                onChange={(e) => setPreferences(prev => ({
                  ...prev!,
                  notifications: {
                    ...prev!.notifications,
                    workoutReminders: e.target.checked
                  }
                }))}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Promemoria allenamenti</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.notifications.achievementAlerts}
                onChange={(e) => setPreferences(prev => ({
                  ...prev!,
                  notifications: {
                    ...prev!.notifications,
                    achievementAlerts: e.target.checked
                  }
                }))}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Avvisi obiettivi raggiunti</span>
            </label>
          </div>
        </div>

        {/* AI */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Integrazione AI
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key (opzionale)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Inserisci la tua API key per funzionalità AI avanzate"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Con una API key puoi generare schede più accurate e personalizzate
              </p>
            </div>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.ai.useGemini}
                onChange={(e) => setPreferences(prev => ({
                  ...prev!,
                  ai: {
                    ...prev!.ai,
                    useGemini: e.target.checked
                  }
                }))}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Usa AI per generare schede</span>
            </label>
          </div>
        </div>

        {/* Gestione Dati */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Gestione Dati
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowBackup(true)}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Database className="w-5 h-5" />
              <span>Backup e Ripristino</span>
            </button>

            <button
              onClick={exportBackup}
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
            >
              <Download className="w-5 h-5" />
              <span>{loading ? 'Esportazione...' : 'Esporta Backup'}</span>
            </button>

            <div>
              <label className="block">
                <span className="sr-only">Importa scheda</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleWorkoutImport}
                  className="hidden"
                  id="workout-import"
                />
                <label
                  htmlFor="workout-import"
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  <Upload className="w-5 h-5" />
                  <span>Importa Scheda</span>
                </label>
              </label>
            </div>

            <button
              onClick={resetPreferences}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span>Ripristina Impostazioni</span>
            </button>
          </div>
        </div>

        {/* Informazioni */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Informazioni
          </h2>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Versione</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Ultimo aggiornamento</span>
              <span>{new Date().toLocaleDateString('it')}</span>
            </div>
            <div className="flex justify-between">
              <span>Sviluppatore</span>
              <span>Francesco Ronca</span>
            </div>
          </div>
        </div>

        {/* Pulsante salva */}
        <div className="flex justify-end animate-fade-in-up">
          <button
            onClick={savePreferences}
            disabled={loadingPrefs}
            className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Save className="w-6 h-6" />
            <span className="font-medium text-lg">{loadingPrefs ? 'Salvataggio...' : 'Salva Impostazioni'}</span>
          </button>
        </div>
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