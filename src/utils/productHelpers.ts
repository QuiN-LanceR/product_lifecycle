export const getStageBadgeColor = (stage: string): string => {
  const colors: Record<string, string> = {
    'Introduction': 'bg-gradient-to-b from-[#FFBE62] to-[#FF9500] text-white',
    'Growth': 'bg-gradient-to-b from-[#0EA976] to-[#006846] text-white',
    'Maturity': 'bg-gradient-to-b from-[#4791F2] to-[#0E458D] text-white',
    'Decline': 'bg-gradient-to-b from-[#F85124] to-[#86270E] text-white'
  };
  return colors[stage] || 'bg-gradient-to-b from-gray-500 to-gray-700 text-white';
};

export const getSegmentBadgeColor = (segmen: string): string => {
  const colors: Record<string, string> = {
    'Korporat': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'Distribusi': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'Pelayanan Pelanggan': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'EP & Pembangkit': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    'Transmisi': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  };
  return colors[segmen] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
};