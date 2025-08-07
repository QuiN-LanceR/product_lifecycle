import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          </div>
          <div className="flex space-x-3">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
          </div>
        </div>
        
        {/* Chart Skeleton */}
        <div className="h-[400px] bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
        
        {/* Info Cards Skeleton */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="text-center">
                <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-12 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-6">⚠️</div>
          <p className="text-red-500 mb-6 font-semibold text-lg">{error}</p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};