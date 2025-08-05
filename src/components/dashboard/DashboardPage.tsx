import React, { useState, useEffect } from 'react';
import { 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import { useNavigateWithLoading } from '@/hooks/useNavigateWithLoading';

interface StageData {
  id: number;
  stage: string;
  count: number;
  icon_light?: string;
  icon_dark?: string;
}

interface DashboardStats {
  total: number;
  stages: StageData[];
}

const DashboardPages = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    stages: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { navigateTo } = useNavigateWithLoading();

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard/stats');
      const result = await response.json();
      
      if (result.success) {
        setStats({
          total: result.data.stats.total,
          stages: result.data.stages
        });
      } else {
        throw new Error(result.message || 'Failed to fetch dashboard stats');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      setStats({
        total: 0,
        stages: []
      });
    } finally {
      setLoading(false);
    }
  }; 

  // Tambahkan function untuk handle stage click
  const handleStageClick = (id: number) => {
    const stageSlug = id;
    console.log(stageSlug)
    navigateTo(`/admin/dashboard/${stageSlug}`);
  };
  
  const handleTotalProductsClick = () => {
    navigateTo('/admin/dashboard/all');
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleRetry = () => {
    fetchDashboardStats();
  };

  // Warna sesuai gambar yang diberikan
  const getStageColors = (index: number) => {
    const colors = [
      {
        // Orange - Introduction Stage
        bg: 'bg-gradient-to-b from-[#FFB562] to-[#FF9500]',
        darkBg: 'dark:from-[#FF9500] dark:to-[#E6850E]',
        text: 'text-white'
      },
      {
        // Green - Growth Stage  
        bg: 'bg-gradient-to-b from-[#0EA976] to-[#006846]',
        darkBg: 'dark:from-[#0EA976] dark:to-[#006846]',
        text: 'text-white'
      },
      {
        // Blue - Maturity Stage
        bg: 'bg-gradient-to-b from-[#4791F2] to-[#0E458D]',
        darkBg: 'dark:from-[#4791F2] dark:to-[#0E458D]',
        text: 'text-white'
      },
      {
        // Red - Decline Stage
        bg: 'bg-gradient-to-b from-[#F85124] to-[#86270E]',
        darkBg: 'dark:from-[#F85124] dark:to-[#86270E]',
        text: 'text-white'
      }
    ];
    return colors[index % colors.length];
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24 animate-pulse"></div>
        </div>
        
        {/* Stage Cards Skeleton - Improved */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => {
            // Simulasi warna yang berbeda untuk setiap card
            const colors = [
              'bg-gradient-to-b from-blue-200 to-blue-300 dark:from-blue-700 dark:to-blue-800',
              'bg-gradient-to-b from-green-200 to-green-300 dark:from-green-700 dark:to-green-800', 
              'bg-gradient-to-b from-yellow-200 to-yellow-300 dark:from-yellow-700 dark:to-yellow-800',
              'bg-gradient-to-b from-red-200 to-red-300 dark:from-red-700 dark:to-red-800'
            ];
            
            return (
              <div key={`skeleton-${index}`} className={`rounded-2xl p-6 shadow-lg animate-pulse ${colors[index]} h-32`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-white/30">
                    <div className="w-5 h-5 bg-white/50 rounded"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="h-8 bg-white/40 rounded w-12"></div>
                  <div className="h-4 bg-white/30 rounded w-20"></div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Total Products Skeleton - Improved */}
        <div className="bg-gradient-to-b from-purple-200 to-purple-300 dark:from-purple-700 dark:to-purple-800 rounded-2xl p-8 shadow-lg animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-10 bg-white/40 rounded w-16"></div>
              <div className="h-5 bg-white/30 rounded w-32"></div>
              <div className="h-4 bg-white/20 rounded w-24"></div>
            </div>
            <div className="p-4 bg-white/30 rounded-2xl">
              <div className="w-12 h-12 bg-white/40 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
            Failed to Load Dashboard Data
          </h4>
          <p className="text-xs text-red-600 dark:text-red-300 mb-3">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <button
          onClick={handleRetry}
          className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>
      
      {/* Stage Cards - Dynamic Grid */}
      <div className={`grid gap-6 ${
        stats.stages.length === 1 ? 'grid-cols-1' :
        stats.stages.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
        stats.stages.length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
        stats.stages.length === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
        stats.stages.length === 5 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5' :
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-6'
      }`}>
        {stats.stages.map((stage, index) => {
          const colors = getStageColors(index);
          return (
            <div
              key={stage.id}
              onClick={() => handleStageClick(stage.id)}
              className={`${colors.bg} ${colors.darkBg} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  {stage.icon_light && stage.icon_dark ? (
                    <React.Fragment key={`icon-${stage.id}`}>
                      <Image
                        src={`/images/product/stage/${stage.icon_light}`}
                        alt={stage.stage}
                        width={20}
                        height={20}
                        className="block dark:hidden"
                      />
                      <Image
                        src={`/images/product/stage/${stage.icon_dark}`}
                        alt={stage.stage}
                        width={20}
                        height={20}
                        className="hidden dark:block"
                      />
                    </React.Fragment>
                  ) : (
                    <div className="w-5 h-5 bg-white/30 rounded"></div>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <h3 className={`text-3xl font-bold ${colors.text}`}>
                  {stage.count}
                </h3>
                <p className={`text-sm font-medium ${colors.text}`}>
                  {stage.stage}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Products - Di Bawah dengan warna ungu sesuai gambar */}
      <div 
        onClick={handleTotalProductsClick}
        className="bg-gradient-to-b from-[#5153FF] to-[#3D40CC] dark:from-[#5153FF] dark:to-[#3D40CC] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-4xl font-bold text-white">
              {stats.total}
            </h3>
            <p className="text-lg font-medium text-white">
              Total Products
            </p>
            <p className="text-sm text-white/90">
              All Products
            </p>
          </div>
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPages;