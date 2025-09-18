import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  fallback?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ fallback = '/', className = '' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${className}`}
      aria-label="Torna indietro"
    >
      <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
    </button>
  );
};