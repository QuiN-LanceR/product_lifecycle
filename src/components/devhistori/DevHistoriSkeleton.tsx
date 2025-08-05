import React from 'react';

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-3 py-4 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-10 border-r border-gray-200 dark:border-gray-700">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
    </td>
    <td className="px-4 py-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    </td>
    <td className="px-4 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
    </td>
    <td className="px-4 py-4 text-center sticky right-0 bg-white dark:bg-gray-800 z-10 border-l border-gray-200 dark:border-gray-700">
      <div className="flex justify-center gap-1">
        <div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </td>
  </tr>
);

interface DevHistoriSkeletonProps {
  rows?: number;
}

const DevHistoriSkeleton: React.FC<DevHistoriSkeletonProps> = ({ rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <SkeletonRow key={idx} />
      ))}
    </>
  );
};

export default DevHistoriSkeleton;