import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Menu,
  X,
  Home,
  Settings,
  Dumbbell,
  Clock,
  Brain,
  Activity,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface NavigationProps {
  title?: string;
  showBackButton?: boolean;
  currentPage?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  title,
  showBackButton = false,
  currentPage
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Chiudi il menu quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const menuItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/',
      description: 'Torna alla pagina principale'
    },
    {
      icon: Dumbbell,
      label: 'Le tue Schede',
      path: '/workouts',
      description: 'Gestisci le tue schede di allenamento'
    },
    {
      icon: Clock,
      label: 'Timer',
      path: '/timer',
      description: 'Imposta timer per gli allenamenti'
    },
    {
      icon: Brain,
      label: 'AI Coach',
      path: '/ai-coach',
      description: 'Il tuo personal trainer intelligente'
    },
    {
      icon: Settings,
      label: 'Impostazioni',
      path: '/settings',
      description: 'Configura l\'applicazione'
    },
  ];

  const isActive = (path: string) => {
    return window.location.pathname === path;
  };

  return (
    <nav className="relative z-20">
      <div className="flex items-center justify-between p-4">
        {/* Freccia indietro */}
        {showBackButton && (
          <button
            onClick={handleBack}
            className="p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            title="Torna indietro"
          >
            <ArrowLeft className="w-6 h-6 text-purple-600" />
          </button>
        )}

        {/* Spaziatore centrale per mantenere l'equilibrio */}
        <div className="flex-1"></div>

        {/* Menu a tendina */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            title="Menu"
          >
            <Menu className="w-6 h-6 text-purple-600" />
          </button>

          {/* Dropdown menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden animate-fade-in-up">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Menu Navigazione
                  </h3>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full group flex items-center justify-between p-3 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                          active
                            ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 border border-purple-200 dark:border-purple-700/50'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            active
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 group-hover:text-purple-600 dark:group-hover:text-purple-400'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <div className={`font-medium ${
                              active
                                ? 'text-purple-700 dark:text-purple-300'
                                : 'text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400'
                            }`}>
                              {item.label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {item.description}
                            </div>
                          </div>
                        </div>
                        {active ? (
                          <ChevronRight className="w-5 h-5 text-purple-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Stato corrente */}
                {currentPage && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Activity className="w-4 h-4" />
                      <span>Pagina corrente:</span>
                    </div>
                    <div className="mt-1 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 rounded-lg px-3 py-2">
                      {currentPage}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};