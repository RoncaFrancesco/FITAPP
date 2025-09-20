import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './hooks/useTheme';
import { db } from './db';

// Lazy loading delle pagine per ottimizzare le performance
const HomePage = React.lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const WorkoutsPage = React.lazy(() => import('./pages/WorkoutsPage').then(module => ({ default: module.WorkoutsPage })));
const CreateWorkoutPage = React.lazy(() => import('./pages/CreateWorkoutPage').then(module => ({ default: module.CreateWorkoutPage })));
const AICoachPage = React.lazy(() => import('./pages/AICoachPage').then(module => ({ default: module.AICoachPage })));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const TimerPage = React.lazy(() => import('./pages/TimerPage').then(module => ({ default: module.TimerPage })));

// Componente di loading
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 relative overflow-hidden flex flex-col">
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

    <div className="flex-1 flex items-center justify-center relative z-10">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
    </div>

    {/* Footer */}
    <footer className="relative z-10 bg-black/5 dark:bg-black/20 backdrop-blur-sm border-t border-white/10 dark:border-gray-800/50">
      <div className="max-w-4xl mx-auto px-4 py-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © 2025 · Tutti i diritti riservati
        </p>
      </div>
    </footer>
  </div>
);

// Componente principale dell'app
const AppContent: React.FC = () => {
  const { isDark } = useTheme();

  useEffect(() => {
    // Inizializza il database
    const initializeApp = async () => {
      try {
        await db.open();
        await db.initializeDefaultData();
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    initializeApp();

    // Registra il service worker per PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Richiedi notifiche push se supportato
    if ('Notification' in navigator && 'serviceWorker' in navigator) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        }
      });
    }
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="App">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/workouts" element={<WorkoutsPage />} />
            <Route path="/create-workout" element={<CreateWorkoutPage />} />
            <Route path="/create-workout/:workoutId" element={<CreateWorkoutPage />} />
            <Route path="/ai-coach" element={<AICoachPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/timer" element={<TimerPage />} />
            </Routes>
        </Suspense>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: isDark ? '#374151' : '#ffffff',
              color: isDark ? '#ffffff' : '#1f2937',
              border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: isDark ? '#ffffff' : '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: isDark ? '#ffffff' : '#ffffff',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

// Componente per gestire il redirect di GitHub Pages
const GitHubPagesRedirect: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const path = params.get('p');

    if (path && path !== '/') {
      // Reindirizza al path corretto
      window.history.replaceState({}, '', path);
    }
  }, [location]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <GitHubPagesRedirect />
      <AppContent />
    </Router>
  );
};

export default App;