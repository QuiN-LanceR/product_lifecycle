import React from 'react';

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-3"></div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-12 mb-1"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
          </div>
          <div className="text-right">
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16 mb-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
          </div>
        </div>
        
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        
        <div className="flex items-center mb-4">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded mr-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
      </div>
      
      <div className="px-4 py-3 bg-gray-50/30 dark:bg-gray-900/30">
        <div className="flex items-center justify-center gap-2">
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;