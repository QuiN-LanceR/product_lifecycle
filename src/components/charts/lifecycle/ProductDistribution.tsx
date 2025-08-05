import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartEvent,
  ActiveElement
} from 'chart.js';
import { MoreDotIcon } from '../../../icons/index';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StageData {
  id: string;
  stage: string;
  icon_light: string;
  icon_dark: string;
  count: number;
}

interface DashboardStats {
  introduction: number;
  growth: number;
  maturity: number;
  decline: number;
  total: number;
}

interface DashboardResponse {
  stats: DashboardStats;
  stages: StageData[];
}

interface Product {
  id: number;
  name: string;
  stage: string;
  segment: string;
  created_at: string;
}

interface ProductModalData {
  stage: string;
  products: Product[];
}

// Plugin untuk menampilkan persentase di setiap segment chart
const segmentLabelPlugin = {
  id: 'segmentLabel',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterDatasetsDraw: (chart: any) => {
    const { ctx, data } = chart;
    const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
    
    if (total === 0) return;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chart.getDatasetMeta(0).data.forEach((arc: any, index: number) => {
      const value = data.datasets[0].data[index];
      const percentage = ((value / total) * 100).toFixed(1);
      
      if (value > 0) {
        const { x, y } = arc.tooltipPosition();
        
        ctx.save();
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add background for better readability
        const textWidth = ctx.measureText(`${percentage}%`).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - textWidth/2 - 4, y - 8, textWidth + 8, 16);
        
        // Draw percentage text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${percentage}%`, x, y);
        ctx.restore();
      }
    });
  }
};

const ProductDistribution: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalData, setModalData] = useState<ProductModalData | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/stats');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        if (!text) {
          throw new Error('Empty response from server');
        }
        
        const result = JSON.parse(text);
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || 'Failed to fetch data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error occurred');
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Detect dark mode
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const handleChartClick = async (event: ChartEvent, elements: ActiveElement[]) => {
    if (elements.length > 0 && data) {
      const elementIndex = elements[0].index;
      const stageNames = ['introduction', 'growth', 'maturity', 'decline'];
      const stageName = stageNames[elementIndex];
      
      // Find stage ID based on stage name
      const stageData = data.stages.find(stage => 
        stage.stage.toLowerCase() === stageName
      );

      if (stageData) {
        setModalLoading(true);
        setCurrentPage(1); // Reset to first page when opening modal
        try {
          const response = await fetch(`/api/dashboard/by-stage?id=${stageData.id}`);
          const result = await response.json();
          
          if (result.success) {
            setModalData({
              stage: result.stage,
              products: result.products
            });
          } else {
            console.error('Failed to fetch products:', result.error);
          }
        } catch (error) {
          console.error('Error fetching products:', error);
        } finally {
          setModalLoading(false);
        }
      }
    }
  };

  const closeModal = () => {
    setModalData(null);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Pagination logic
  const getPaginatedData = () => {
    if (!modalData) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return modalData.products.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    if (!modalData) return 0;
    return Math.ceil(modalData.products.length / itemsPerPage);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < getTotalPages()) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading || !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-6"></div>
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: ['Introduction', 'Growth', 'Maturity', 'Decline'],
    datasets: [
      {
        data: [data.stats.introduction, data.stats.growth, data.stats.maturity, data.stats.decline],
        backgroundColor: [
          '#3B82F6', // Blue for Introduction
          '#10B981', // Green for Growth
          '#F59E0B', // Yellow for Maturity
          '#EF4444'  // Red for Decline
        ],
        borderWidth: 2,
        borderColor: isDark ? '#374151' : '#ffffff',
        hoverBorderWidth: 3,
        hoverBorderColor: isDark ? '#4B5563' : '#f3f4f6'
      }
    ]
  };

  const getDefaultColor = () => isDark ? '#e5e7eb' : '#374151';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: handleChartClick,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
            weight: '500'
          },
          color: getDefaultColor()
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        titleColor: isDark ? '#f9fafb' : '#111827',
        bodyColor: isDark ? '#e5e7eb' : '#374151',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${label}: ${value} produk (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%',
    elements: {
      arc: {
        borderWidth: 2,
        hoverBorderWidth: 3
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  };

  const paginatedProducts = getPaginatedData();
  const totalPages = getTotalPages();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Product Distribution
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Distribusi produk berdasarkan tahap siklus hidup
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.stats.total}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total Produk
            </p>
          </div>
          <Dropdown
            isOpen={isOpen}
            onClick={toggleDropdown}
            onClose={closeDropdown}
            trigger={
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <MoreDotIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            }
          >
            <DropdownItem onClick={() => console.log('View More')}>View More</DropdownItem>
            <DropdownItem onClick={() => console.log('Export')}>Export</DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative h-80 mb-4">
        <Doughnut 
          data={chartData} 
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              legend: {
                ...chartOptions.plugins.legend,
                labels: {
                  ...chartOptions.plugins.legend.labels,
                  font: {
                    size: 12,
                    weight: 'bold' as const // Fix type by using string literal
                  }
                }
              }
            }
          }} 
          plugins={[segmentLabelPlugin]} 
        />
      </div>

      {/* Click instruction */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Klik pada bagian chart untuk melihat detail produk
        </p>
      </div>

      {/* Modal */}
      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Produk - {modalData.stage}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {modalData.products.length} produk ditemukan
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {modalLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : modalData.products.length > 0 ? (
                <>
                  {/* Table */}
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            No
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Nama Produk
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Stage
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Segmen
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Launch Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedProducts.map((product, index) => (
                          <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {product.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {product.stage}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {product.segment}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatDate(product.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                        <span>
                          Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, modalData.products.length)} dari {modalData.products.length} produk
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={goToPrevPage}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        {/* Page numbers */}
                        <div className="flex space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => goToPage(pageNum)}
                                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                  currentPage === pageNum
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    Tidak ada produk ditemukan untuk stage ini
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDistribution;