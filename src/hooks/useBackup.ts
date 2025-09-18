import { useState } from 'react';
import { BackupData, Workout, Exercise, UserPreferences } from '../types';
import { db } from '../db';
import toast from 'react-hot-toast';

export const useBackup = () => {
  const [loading, setLoading] = useState(false);

  const createBackup = async (): Promise<BackupData> => {
    setLoading(true);
    try {
      const [workouts, exercises, preferences] = await Promise.all([
        db.workouts.toArray(),
        db.exercises.toArray(),
        db.preferences.toArray()
      ]);

      const backupData: BackupData = {
        workouts,
        exercises,
        preferences: preferences[0] || {
          id: 'default',
          theme: 'system',
          defaultRestTime: 60,
          defaultTimerSettings: {
            type: 'single',
            workTime: 30,
            restTime: 60,
            rounds: 1,
            cycles: 1,
            preparationTime: 5,
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
            useGemini: true
          }
        },
        exportDate: new Date(),
        version: '1.0'
      };

      return backupData;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error('Errore nella creazione del backup');
    } finally {
      setLoading(false);
    }
  };

  const exportBackup = async () => {
    try {
      const backupData = await createBackup();

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fitness-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Backup esportato con successo!');
    } catch (error) {
      toast.error('Errore nell\'esportazione del backup');
      console.error('Error exporting backup:', error);
    }
  };

  const importBackup = async (file: File): Promise<void> => {
    setLoading(true);
    try {
      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);

      // Valida il backup
      if (!backupData.workouts || !backupData.exercises || !backupData.preferences) {
        throw new Error('File di backup non valido');
      }

      // Chiedi conferma all'utente
      const confirmed = window.confirm(
        `Sei sicuro di voler importare ${backupData.workouts.length} schede e ${backupData.exercises.length} esercizi?\n\n` +
        'Questa operazione sovrascriverà i dati esistenti.'
      );

      if (!confirmed) {
        return;
      }

      // Cancella i dati esistenti
      await Promise.all([
        db.workouts.clear(),
        db.exercises.clear(),
        db.preferences.clear()
      ]);

      // Importa i nuovi dati
      await Promise.all([
        db.workouts.bulkAdd(backupData.workouts),
        db.exercises.bulkAdd(backupData.exercises),
        db.preferences.add(backupData.preferences)
      ]);

      toast.success('Backup importato con successo!');
    } catch (error) {
      console.error('Error importing backup:', error);
      throw new Error('Errore nell\'importazione del backup');
    } finally {
      setLoading(false);
    }
  };

  const exportWorkout = async (workout: Workout) => {
    try {
      const blob = new Blob([JSON.stringify(workout, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workout.name || 'scheda'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Scheda esportata con successo!');
    } catch (error) {
      toast.error('Errore nell\'esportazione della scheda');
      console.error('Error exporting workout:', error);
    }
  };

  const importWorkout = async (file: File): Promise<Workout> => {
    setLoading(true);
    try {
      const text = await file.text();
      const workout: Workout = JSON.parse(text);

      // Valida la scheda
      if (!workout.name || !workout.exercises) {
        throw new Error('File di scheda non valido');
      }

      // Genera un nuovo ID per evitare conflitti
      const importedWorkout: Workout = {
        ...workout,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isCustom: true
      };

      // Importa gli esercizi personalizzati se presenti
      const customExercises = workout.exercises
        .filter(we => we.exercise.isCustom)
        .map(we => we.exercise);

      if (customExercises.length > 0) {
        // Verifica se gli esercizi già esistono
        const existingExercises = await db.exercises
          .where('name')
          .anyOf(customExercises.map(e => e.name))
          .toArray();

        const existingNames = new Set(existingExercises.map(e => e.name));
        const newExercises = customExercises.filter(e => !existingNames.has(e.name));

        if (newExercises.length > 0) {
          await db.exercises.bulkAdd(newExercises);
        }
      }

      // Importa la scheda
      await db.workouts.add(importedWorkout);

      toast.success('Scheda importata con successo!');
      return importedWorkout;
    } catch (error) {
      console.error('Error importing workout:', error);
      throw new Error('Errore nell\'importazione della scheda');
    } finally {
      setLoading(false);
    }
  };

  const shareWorkout = async (workout: Workout) => {
    try {
      const workoutText = `${workout.name}\n\n${workout.description}\n\nEsercizi:\n${workout.exercises.map(ex => `• ${ex.exercise.name} - ${ex.sets.length} serie`).join('\n')}`;

      if (navigator.share) {
        await navigator.share({
          title: workout.name,
          text: workoutText
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(workoutText);
        toast.success('Scheda copiata negli appunti!');
      } else {
        // Fallback: apri una finestra con il testo
        const newWindow = window.open('', '_blank', 'width=600,height=400');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>${workout.name}</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                  h1 { color: #2563eb; }
                  pre { background: #f3f4f6; padding: 15px; border-radius: 8px; }
                </style>
              </head>
              <body>
                <h1>${workout.name}</h1>
                <pre>${workoutText}</pre>
                <p>Copia questo testo per condividere la scheda.</p>
              </body>
            </html>
          `);
        }
      }
    } catch (error) {
      console.error('Error sharing workout:', error);
      toast.error('Errore nella condivisione della scheda');
    }
  };

  const getStorageInfo = async () => {
    try {
      const [workouts, exercises, sessions] = await Promise.all([
        db.workouts.toArray(),
        db.exercises.toArray(),
        db.sessions.toArray()
      ]);

      return {
        workouts: workouts.length,
        exercises: exercises.length,
        sessions: sessions.length,
        lastBackup: localStorage.getItem('lastBackupDate') || undefined
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  };

  const clearAllData = async () => {
    const confirmed = window.confirm(
      'Sei sicuro di voler cancellare tutti i dati?\n\n' +
      'Questa operazione è irreversibile e cancellerà:\n' +
      '• Tutte le schede di allenamento\n' +
      '• Tutti gli esercizi personalizzati\n' +
      '• Tutte le sessioni completate\n' +
      '• Tutte le preferenze'
    );

    if (!confirmed) {
      return;
    }

    try {
      await Promise.all([
        db.workouts.clear(),
        db.exercises.clear(),
        db.sessions.clear(),
        db.preferences.clear()
      ]);

      // Re-inizializza i dati di default
      await db.initializeDefaultData();

      localStorage.removeItem('lastBackupDate');
      toast.success('Tutti i dati sono stati cancellati');
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error('Errore nella cancellazione dei dati');
    }
  };

  return {
    loading,
    exportBackup,
    importBackup,
    exportWorkout,
    importWorkout,
    shareWorkout,
    getStorageInfo,
    clearAllData,
    createBackup
  };
};