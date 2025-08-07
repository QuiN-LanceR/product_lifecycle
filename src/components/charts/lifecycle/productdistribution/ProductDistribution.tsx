import React from 'react';
import { useProductDistribution } from '@/hooks/useProductDistribution';
import { useChartConfig } from '@/hooks/useChartConfig';
import ProductDistributionHeader from './ProductDistributionHeader';
import ProductDistributionChart from './ProductDistributionChart';
import ProductModal from './ProductModal';
import { LoadingState, ErrorState } from './ProductDistributionStates';

const ProductDistribution: React.FC = () => {
  const {
    data,
    loading,
    error,
    modalData,
    modalLoading,
    chartClickLoading,
    fetchProductsByStage,
    closeModal
  } = useProductDistribution();

  const { chartData, chartOptions } = useChartConfig({
    data,
    onChartClick: fetchProductsByStage
  });

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!data) return <ErrorState error="No data available" />;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative">
      {/* Loading overlay saat chart diklik */}
      {chartClickLoading && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 flex items-center justify-center z-10 rounded-xl">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Memuat data produk...</p>
          </div>
        </div>
      )}
      
      <ProductDistributionHeader
        totalProducts={data.stats.total}
      />
      
      <ProductDistributionChart 
        chartData={chartData} 
        chartOptions={chartOptions} 
        totalProducts={data.stats.total}
      />
      
      {modalData && (
        <ProductModal
          modalData={modalData}
          modalLoading={modalLoading}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default ProductDistribution;