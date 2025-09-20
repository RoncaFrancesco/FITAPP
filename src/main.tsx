import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Importa il font Inter
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// Service Worker Registration con cache invalidation aggressiva
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Cancella TUTTA la cache all'avvio
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        }).then(() => {
          console.log('Cache cleared completely');
        });
      }

      // Unregister any existing service worker first
      navigator.serviceWorker.getRegistrations().then(registrations => {
        return Promise.all(registrations.map(reg => reg.unregister()));
      }).then(() => {
        // Register new service worker
        navigator.serviceWorker.register('/sw.js?' + Date.now())
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    });
  }
};

// Inizializza il tema base prima del rendering (solo per evitare flash)
const initializeTheme = () => {
  // Applica solo la classe di base senza forzare stili
  // Il tema completo verrà gestito dal hook useTheme
  const savedTheme = localStorage.getItem('theme') || 'system';

  let shouldApplyDark = false;
  if (savedTheme === 'dark') {
    shouldApplyDark = true;
  } else if (savedTheme === 'system') {
    shouldApplyDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // Applica solo le classi necessarie per Tailwind
  if (shouldApplyDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

initializeTheme();

// Register Service Worker con cache invalidation aggressiva
registerServiceWorker();

// Forza ricaricamento se rileva asset vecchi (problema Vercel cache)
setTimeout(() => {
  const currentScript = document.querySelector('script[src*="index-"]');
  if (currentScript) {
    const src = currentScript.getAttribute('src');
    if (src && src.includes('index-C3smKjg4.js')) {
      console.log('Rilevata vecchia versione degli asset, ricarico...');
      window.location.reload();
    }
  }
}, 1000);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);