import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = 'Загрузка...', 
  fullScreen = false 
}) => {
  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50' 
    : 'flex flex-col items-center justify-center py-10';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-16 h-16 border-t-4 border-wb-purple border-solid rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-wb-purple-light border-solid rounded-full animate-pulse opacity-60"></div>
        </div>
        
        {message && (
          <div className="mt-4 text-wb-purple font-medium">
            {message}
          </div>
        )}
        
        <div className="mt-2 text-sm text-wb-text font-medium">
          Это может занять некоторое время
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;