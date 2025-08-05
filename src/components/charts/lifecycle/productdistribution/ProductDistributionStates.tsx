import React from 'react';

interface LoadingStateProps {
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ className = "" }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-6"></div>
      <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
);

interface ErrorStateProps {
  error: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, className = "" }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
    <div className="text-center text-red-500">
      <p>Error: {error}</p>
    </div>
  </div>
);