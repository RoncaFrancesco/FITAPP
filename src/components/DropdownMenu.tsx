import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Home, Dumbbell, Brain, Timer, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DropdownMenuProps {
  currentPage?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ currentPage = 'home' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'home',
      title: 'Home',
      icon: <Home className="w-5 h-5" />,
      action: () => navigate('/')
    },
    {
      id: 'workouts',
      title: 'Le mie Schede',
      icon: <Dumbbell className="w-5 h-5" />,
      action: () => navigate('/workouts')
    },
    {
      id: 'ai-coach',
      title: 'AI Coach',
      icon: <Brain className="w-5 h-5" />,
      action: () => navigate('/ai-coach')
    },
    {
      id: 'timer',
      title: 'Timer',
      icon: <Timer className="w-5 h-5" />,
      action: () => navigate('/timer')
    },
    {
      id: 'settings',
      title: 'Impostazioni',
      icon: <Settings className="w-5 h-5" />,
      action: () => navigate('/settings')
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  currentPage === item.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <span className="font-medium">{item.title}</span>
                </div>
                {currentPage === item.id && (
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};