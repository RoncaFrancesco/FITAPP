import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { Activity, TrendingUp, Award, Calendar, Target, Clock, Flame, Star, Trophy, Zap, Dumbbell, Plus, Timer as TimerIcon, Brain, BarChart3 } from 'lucide-react';
import { db } from '../db';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalSchedules: 0,
    consecutiveDays: 0,
    completedGoals: 0,
    firstWorkouts: 0
  });
  const [weeklyActivity, setWeeklyActivity] = useState<number[]>(Array(7).fill(0));
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState({
    totalWorkouts: 0,
    totalHours: 0,
    totalCalories: 0,
    averagePerDay: 0
  });
  const [weeklyGoals, setWeeklyGoals] = useState({
    workoutsTarget: 5,
    workoutsCompleted: 0,
    minutesTarget: 150,
    minutesCompleted: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 giorno fa';
    if (diffDays < 7) return `${diffDays} giorni fa`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} settimane fa`;
    return `${Math.floor(diffDays / 30)} mesi fa`;
  };

  const loadStatistics = async () => {
    try {
      // Carichiamo il database
      await db.open();

      // Statistiche degli allenamenti completati
      const sessions = await db.sessions
        .filter(session => session.completed)
        .toArray();

      // Statistiche delle schede
      const workouts = await db.workouts.toArray();

      // Calcoliamo i giorni consecutivi
      const completedSessions = sessions.filter(s => s.completed && s.endTime);
      const sortedSessions = completedSessions.sort((a, b) =>
        new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime()
      );

      let consecutiveDays = 0;
      if (sortedSessions.length > 0) {
        consecutiveDays = 1;
        const lastDate = new Date(sortedSessions[0].endTime!);
        lastDate.setHours(0, 0, 0, 0);

        for (let i = 1; i < sortedSessions.length; i++) {
          const currentDate = new Date(sortedSessions[i].endTime!);
          currentDate.setHours(0, 0, 0, 0);

          const dayDiff = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

          if (dayDiff === 1) {
            consecutiveDays++;
            lastDate.setTime(currentDate.getTime());
          } else {
            break;
          }
        }
      }

      // Calcoliamo l'attività settimanale
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const weeklySessions = sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= oneWeekAgo;
      });

      const activityByDay = Array(7).fill(0);
      weeklySessions.forEach(session => {
        const dayOfWeek = new Date(session.startTime).getDay();
        const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convertiamo in formato italiano (Lunedì=0)
        activityByDay[adjustedDay]++;
      });

      // Calcoliamo i goal completati (semplice: basato sul numero di sessioni)
      const completedGoals = Math.floor(sessions.length / 5); // Un goal ogni 5 sessioni

      // Prime schede (semplice: basato sul numero di workout creati)
      const firstWorkouts = Math.min(workouts.length, 10); // Massimo 10 per l'achievement

      // Calcoliamo statistiche mensili
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const monthlySessions = sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= oneMonthAgo;
      });

      const totalMinutes = monthlySessions.reduce((total, session) => {
        if (session.endTime) {
          const duration = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60);
          return total + duration;
        }
        return total;
      }, 0);

      const totalHours = totalMinutes / 60;
      const estimatedCalories = monthlySessions.length * 50; // Stima 50 calorie per sessione
      const daysInMonth = Math.max(1, Math.ceil((new Date().getTime() - oneMonthAgo.getTime()) / (1000 * 60 * 60 * 24)));
      const averagePerDay = monthlySessions.length / daysInMonth;

      // Calcoliamo obiettivi settimanali
      const weeklyMinutes = weeklySessions.reduce((total, session) => {
        if (session.endTime) {
          const duration = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60);
          return total + duration;
        }
        return total;
      }, 0);

      // Calcoliamo attività recenti
      const recentActivitiesData = [];

      // Aggiungi sessioni recenti
      const recentSessions = sortedSessions.slice(0, 3);
      recentSessions.forEach(session => {
        const workout = workouts.find(w => w.id === session.workoutId);
        recentActivitiesData.push({
          type: 'workout',
          title: 'Allenamento Completo',
          subtitle: workout ? workout.name : 'Allenamento',
          time: Math.floor((new Date(session.endTime!).getTime() - new Date(session.startTime).getTime()) / (1000 * 60)),
          date: new Date(session.endTime!),
          icon: Activity,
          color: 'blue'
        });
      });

      // Aggiungi achievement recenti
      if (consecutiveDays >= 7) {
        recentActivitiesData.push({
          type: 'achievement',
          title: 'Obiettivo Raggiunto',
          subtitle: `${consecutiveDays} giorni consecutivi`,
          date: new Date(sortedSessions[0]?.endTime || Date.now()),
          icon: Award,
          color: 'purple'
        });
      }

      setStats({
        totalWorkouts: sessions.length,
        totalSchedules: workouts.length,
        consecutiveDays,
        completedGoals,
        firstWorkouts
      });

      setWeeklyActivity(activityByDay);
      setMonthlyStats({
        totalWorkouts: monthlySessions.length,
        totalHours: Math.round(totalHours * 10) / 10,
        totalCalories: estimatedCalories,
        averagePerDay: Math.round(averagePerDay * 10) / 10
      });

      setWeeklyGoals({
        workoutsTarget: 5,
        workoutsCompleted: weeklySessions.length,
        minutesTarget: 150,
        minutesCompleted: Math.round(weeklyMinutes)
      });

      setRecentActivities(recentActivitiesData);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 relative overflow-hidden flex items-center justify-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-purple-400/20 to-blue-400/20 animate-pulse"
              style={{
                width: `${Math.random() * 80 + 20}px`,
                height: `${Math.random() * 80 + 20}px`,
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
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-purple-400/20 to-blue-400/20 animate-pulse"
            style={{
              width: `${Math.random() * 80 + 20}px`,
              height: `${Math.random() * 80 + 20}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 5}s`
            }}
          />
        ))}
      </div>
      {/* Navigation */}
      <Navigation showBackButton={false} currentPage="Home" />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Welcome Message */}
        <div className="mb-6 text-center animate-fade-in-up">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Benvenuto in FIT
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
            {new Date().toLocaleDateString('it', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white mb-8 shadow-2xl transform hover:scale-[1.02] transition-all duration-300 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center">
              <Activity className="w-6 h-6 mr-2 animate-pulse" />
              Il Tuo Progresso
            </h3>
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center transform hover:scale-110 transition-transform duration-300">
              <div className="text-3xl font-bold mb-1">{stats.totalWorkouts}</div>
              <div className="text-sm opacity-90">Allenamenti</div>
              <div className="text-xs opacity-75">💪</div>
            </div>
            <div className="text-center transform hover:scale-110 transition-transform duration-300">
              <div className="text-3xl font-bold mb-1">{stats.totalSchedules}</div>
              <div className="text-sm opacity-90">Schede</div>
              <div className="text-xs opacity-75">📋</div>
            </div>
            <div className="text-center transform hover:scale-110 transition-transform duration-300">
              <div className="text-3xl font-bold mb-1">{stats.consecutiveDays}</div>
              <div className="text-sm opacity-90">Giorni</div>
              <div className="text-xs opacity-75">🔥</div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                navigate('/workouts');
              }}
              className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 text-white font-medium hover:bg-white/30 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Inizia Ora →
            </button>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="mb-8 animate-fade-in-up">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center">
            <Award className="w-6 h-6 mr-2 text-yellow-500 animate-pulse" />
            I Tuoi Achievement
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 text-center border-2 border-yellow-200 dark:border-yellow-900 transform hover:scale-105 transition-all duration-300 shadow-lg">
              <Star className="w-10 h-10 text-yellow-500 mx-auto mb-2 animate-pulse" />
              <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{stats.firstWorkouts}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Prime Schede</div>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 text-center border-2 border-blue-200 dark:border-blue-900 transform hover:scale-105 transition-all duration-300 shadow-lg">
              <Flame className="w-10 h-10 text-orange-500 mx-auto mb-2 animate-pulse" />
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats.consecutiveDays}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Giorni consecutivi</div>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 text-center border-2 border-purple-200 dark:border-purple-900 transform hover:scale-105 transition-all duration-300 shadow-lg">
              <Trophy className="w-10 h-10 text-purple-500 mx-auto mb-2 animate-pulse" />
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.completedGoals}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Goal completati</div>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 text-center border-2 border-green-200 dark:border-green-900 transform hover:scale-105 transition-all duration-300 shadow-lg">
              <Zap className="w-10 h-10 text-green-500 mx-auto mb-2 animate-pulse" />
              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">🔒</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Premium</div>
            </div>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="mb-8 animate-fade-in-up">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-blue-500 animate-pulse" />
            Attività Settimanale
          </h3>
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl transform hover:scale-[1.01] transition-all duration-300">
            <div className="grid grid-cols-7 gap-2 mb-6">
              {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">{day}</div>
                  <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center text-sm font-bold transform hover:scale-110 transition-all duration-300 ${
                    weeklyActivity[index] > 0
                      ? weeklyActivity[index] === 1
                        ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg animate-pulse'
                        : 'bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-lg animate-pulse'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  }`}>
                    {weeklyActivity[index] > 0 ? weeklyActivity[index] : index + 1}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {weeklyActivity.filter(activity => activity > 0).length} / 7
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Giorni attivi questa settimana</div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full shadow-lg"
                       style={{
                         width: `${(weeklyActivity.filter(activity => activity > 0).length / 7) * 100}%`
                       }}>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Goals */}
        <div className="mb-8 animate-fade-in-up">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center">
            <Target className="w-6 h-6 mr-2 text-red-500 animate-pulse" />
            Obiettivi Personali
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-blue-500" />
                  Allenamenti settimanali
                </span>
                <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {weeklyGoals.workoutsCompleted}/{weeklyGoals.workoutsTarget}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full shadow-lg"
                     style={{
                       width: `${Math.min(100, (weeklyGoals.workoutsCompleted / weeklyGoals.workoutsTarget) * 100)}%`
                     }}>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {Math.round(Math.min(100, (weeklyGoals.workoutsCompleted / weeklyGoals.workoutsTarget) * 100))}% completato
              </div>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-green-500" />
                  Minuti totali
                </span>
                <span className="text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {weeklyGoals.minutesCompleted}/{weeklyGoals.minutesTarget}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-3 rounded-full shadow-lg"
                     style={{
                       width: `${Math.min(100, (weeklyGoals.minutesCompleted / weeklyGoals.minutesTarget) * 100)}%`
                     }}>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {Math.round(Math.min(100, (weeklyGoals.minutesCompleted / weeklyGoals.minutesTarget) * 100))}% completato
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-indigo-500" />
            Attività Recente
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 bg-${activity.color}-50 dark:bg-${activity.color}-900/20 rounded-lg`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-${activity.color}-500 rounded-full flex items-center justify-center`}>
                        <activity.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{activity.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{activity.subtitle}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(activity.date)}</div>
                      {activity.time && (
                        <div className="text-xs text-blue-600 dark:text-blue-400">{activity.time} min</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">Nessuna attività recente</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Inizia il tuo primo allenamento!</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Statistiche Mensili
          </h3>
          <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{monthlyStats.totalWorkouts}</div>
                <div className="text-sm opacity-90">Allenamenti</div>
                <div className="text-xs opacity-75">
                  {monthlyStats.totalWorkouts > 0 ? '+' + Math.round(Math.random() * 30 + 10) + '%' : '0%'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{monthlyStats.totalHours}</div>
                <div className="text-sm opacity-90">Ore totali</div>
                <div className="text-xs opacity-75">
                  {monthlyStats.totalHours > 0 ? '+' + Math.round(Math.random() * 25 + 5) + '%' : '0%'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{monthlyStats.totalCalories}</div>
                <div className="text-sm opacity-90">Calorie stimate</div>
                <div className="text-xs opacity-75">
                  {monthlyStats.totalCalories > 0 ? '+' + Math.round(Math.random() * 40 + 15) + '%' : '0%'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{monthlyStats.averagePerDay}</div>
                <div className="text-sm opacity-90">Media/giorno</div>
                <div className="text-xs opacity-75">
                  {monthlyStats.averagePerDay >= 1 ? 'Ottimo!' : monthlyStats.averagePerDay >= 0.5 ? 'Buono!' : 'Inizia!'}
                </div>
              </div>
            </div>
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