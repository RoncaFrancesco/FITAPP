import React from 'react';
import { DropdownMenu } from './DropdownMenu';
import { BackButton } from './BackButton';

interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showMenu?: boolean;
  currentPage?: string;
  backFallback?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBackButton = false,
  showMenu = true,
  currentPage = 'home',
  backFallback = '/'
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBackButton && <BackButton fallback={backFallback} />}
            {title && (
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {showMenu && <DropdownMenu currentPage={currentPage} />}
          </div>
        </div>
      </div>
    </div>
  );
};