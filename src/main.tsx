import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Importa il font Inter
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// Service Worker Registration
const registerServiceWorker = () => {
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
};

// Inizializza il tema prima del rendering
const initializeTheme = () => {
  // Verifica se c'è un tema salvato nel localStorage
  const savedTheme = localStorage.getItem('theme') || 'system';
  document.documentElement.setAttribute('data-theme', savedTheme);

  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (savedTheme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }
};

initializeTheme();

// Register Service Worker
registerServiceWorker();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);