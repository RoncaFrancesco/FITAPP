import React, { useState } from 'react';
import { useProgressTracking } from '../hooks/useProgressTracking';
import { useTheme } from '../hooks/useTheme';
import { Navigation } from '../components/Navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

// Importazione dinamica per evitare problemi con SSR
const ChartWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isClient, setIsClient] = useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
};

const ProgressPage: React.FC = () => {
  const { stats, loading, filters, updateFilters, exportProgressData } = useProgressTracking();
  const { isDark } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | '90'>('30');

  // Aggiorna i filtri quando cambia il periodo
  React.useEffect(() => {
    const days = parseInt(selectedPeriod);
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

    updateFilters({
      dateRange: { start, end }
    });
  }, [selectedPeriod, updateFilters]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex flex-col">
        <Navigation showBackButton={true} currentPage="Progressi" />
        <div className="flex-1 p-4">
          <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 h-80"></div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex flex-col">
        <Navigation showBackButton={true} currentPage="Progressi" />
        <div className="flex-1 p-4">
          <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Progressi
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Nessun dato disponibile. Inizia ad allenarti per vedere i tuoi progressi!
          </p>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex flex-col">
      {/* Header con navigazione */}
      <Navigation showBackButton={true} currentPage="Progressi" />

      <div className="flex-1 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            I Tuoi Progressi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Monitora i tuoi risultati e migliora le tue performance
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as '7' | '30' | '90')}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            >
              <option value="7">Ultimi 7 giorni</option>
              <option value="30">Ultimi 30 giorni</option>
              <option value="90">Ultimi 90 giorni</option>
            </select>

            <button
              onClick={exportProgressData}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Esporta Dati
            </button>
          </div>
        </div>

        {/* Statistiche principali */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Totali Allenamenti
            </h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats.totalSessions}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stats.totalWorkouts} schede create
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Durata Media
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {Math.round(stats.averageWorkoutDuration)}min
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              per sessione
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Volume Totale
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round(stats.totalVolume / 1000)}k
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              kg sollevati
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Record Personali
            </h3>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {stats.personalRecords.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              nuovi record
            </p>
          </div>
        </div>

        {/* Grafici */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Progresso settimanale */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Progresso Settimanale
            </h3>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#4b5563' : '#e5e7eb'} />
                  <XAxis
                    dataKey="week"
                    stroke={isDark ? '#9ca3af' : '#6b7280'}
                    tickFormatter={(value: string) => {
                      const date = new Date(value);
                      return `Week ${Math.ceil(date.getDate() / 7)}`;
                    }}
                  />
                  <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <Tooltip
                    contentStyle={isDark ? {
                      backgroundColor: '#1f2937',
                      borderColor: '#374151',
                      color: '#ffffff'
                    } : {}}
                  />
                  <Area
                    type="monotone"
                    dataKey="workouts"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    name="Allenamenti"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </div>

          {/* Distribuzione gruppi muscolari */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distribuzione Gruppi Muscolari
            </h3>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(stats.muscleGroupDistribution).map(([name, value]) => ({
                      name: name.charAt(0).toUpperCase() + name.slice(1),
                      value
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                  >
                    {Object.entries(stats.muscleGroupDistribution).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={isDark ? {
                      backgroundColor: '#1f2937',
                      borderColor: '#374151',
                      color: '#ffffff'
                    } : {}}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </div>

          {/* Volume mensile */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Andamento Volume Mensile
            </h3>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlySummary}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#4b5563' : '#e5e7eb'} />
                  <XAxis
                    dataKey="month"
                    stroke={isDark ? '#9ca3af' : '#6b7280'}
                    tickFormatter={(value: string) => {
                      const [year, month] = value.split('-');
                      const date = new Date(parseInt(year), parseInt(month) - 1);
                      return date.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' });
                    }}
                  />
                  <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <Tooltip
                    contentStyle={isDark ? {
                      backgroundColor: '#1f2937',
                      borderColor: '#374151',
                      color: '#ffffff'
                    } : {}}
                  />
                  <Bar dataKey="volume" fill="#82ca9d" name="Volume (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </div>

          {/* Esercizi preferiti */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Esercizi Preferiti
            </h3>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.favoriteExercises.slice(0, 8).map((exercise, index) => ({
                  name: `Esercizio ${index + 1}`,
                  value: index + 1
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#4b5563' : '#e5e7eb'} />
                  <XAxis
                    dataKey="name"
                    stroke={isDark ? '#9ca3af' : '#6b7280'}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <Tooltip
                    contentStyle={isDark ? {
                      backgroundColor: '#1f2937',
                      borderColor: '#374151',
                      color: '#ffffff'
                    } : {}}
                  />
                  <Bar dataKey="value" fill="#ffc658" name="Frequenza" />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </div>
        </div>

        {/* Record personali */}
        {stats.personalRecords.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Record Personali Recenti
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.personalRecords.slice(0, 6).map((record, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {record.exerciseName}
                  </h4>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {record.value} {record.type === 'weight' ? 'kg' : record.type === 'reps' ? 'rip' : 'sec'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {record.type === 'weight' ? 'Massimo peso' : record.type === 'reps' ? 'Massime ripetizioni' : 'Massima durata'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export { ProgressPage };
export default ProgressPage;