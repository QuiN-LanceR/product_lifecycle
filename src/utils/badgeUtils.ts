export const getStageBadgeColor = (stage: string) => {
  switch (stage?.toLowerCase()) {
    case 'development':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'testing':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'released':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'deprecated':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export const getSegmentBadgeColor = (segment: string) => {
  switch (segment?.toLowerCase()) {
    case 'consumer':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'enterprise':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
    case 'government':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};