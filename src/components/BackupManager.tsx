import React, { useState, useEffect } from 'react';
import { useBackup } from '../hooks/useBackup';
import { Upload, Download, Trash2, Database, Calendar, Share2, AlertTriangle, Info } from 'lucide-react';

interface BackupManagerProps {
  onImportSuccess?: () => void;
}

export const BackupManager: React.FC<BackupManagerProps> = ({ onImportSuccess }) => {
  const { loading, exportBackup, importBackup, getStorageInfo, clearAllData } = useBackup();
  const [storageInfo, setStorageInfo] = useState<{
    workouts: number;
    exercises: number;
    sessions: number;
    lastBackup?: string;
  } | null>(null);

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    const info = await getStorageInfo();
    if (info) {
      setStorageInfo(info);
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importBackup(file);
      await loadStorageInfo();
      onImportSuccess?.();
    } catch (error) {
      console.error('Import error:', error);
    }

    // Reset the input
    event.target.value = '';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Mai';
    return new Date(dateString).toLocaleDateString('it', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-2 flex items-center justify-center">
          <span className="w-2 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mr-3"></span>
          Gestione Backup
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Esporta e importa i tuoi dati per mantenerli al sicuro
        </p>
      </div>

      {/* Info Storage */}
      {storageInfo && (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-purple-600" />
            Riepilogo Dati
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-center border border-blue-200 dark:border-blue-800/50">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{storageInfo.workouts}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Schede</div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 text-center border border-green-200 dark:border-green-800/50">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{storageInfo.exercises}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Esercizi</div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 text-center border border-purple-200 dark:border-purple-800/50">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{storageInfo.sessions}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sessioni</div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4 text-center border border-orange-200 dark:border-orange-800/50">
              <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                {formatDate(storageInfo.lastBackup)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ultimo backup</div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Completo */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/50">
        <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-4 flex items-center">
          <Download className="w-5 h-5 mr-2 text-purple-600" />
          Backup Completo
        </h3>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Cosa include il backup?</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Tutte le schede di allenamento</li>
              <li>• Tutti gli esercizi personalizzati</li>
              <li>• Sessioni completate</li>
              <li>• Preferenze e impostazioni</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={exportBackup}
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Download className="w-5 h-5" />
              <span>{loading ? 'Esportazione...' : 'Esporta Backup'}</span>
            </button>

            <div className="flex-1">
              <label className="block">
                <span className="sr-only">Importa backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  disabled={loading}
                  className="hidden"
                  id="backup-import"
                />
                <label
                  htmlFor="backup-import"
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg cursor-pointer"
                >
                  <Upload className="w-5 h-5" />
                  <span>{loading ? 'Importazione...' : 'Importa Backup'}</span>
                </label>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Gestione Dati */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/50">
        <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2 text-purple-600" />
          Gestione Dati
        </h3>

        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-300 mb-1">Attenzione</h4>
                <p className="text-sm text-red-700 dark:text-red-400">
                  La cancellazione dei dati è irreversibile. Assicurati di avere un backup prima di procedere.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={clearAllData}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <Trash2 className="w-5 h-5" />
            <span>Cancella Tutti i Dati</span>
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/50">
        <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-3 flex items-center">
          <Info className="w-5 h-5 mr-2 text-purple-600" />
          Consigli per il backup
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>• Esegui un backup regolarmente per non perdere i tuoi dati</p>
          <p>• Salva i file di backup in un luogo sicuro (cloud, USB, etc.)</p>
          <p>• Prima di importare un backup, esporta quello attuale per sicurezza</p>
          <p>• Verifica l'integrità dei file di backup importati</p>
        </div>
      </div>
    </div>
  );
};