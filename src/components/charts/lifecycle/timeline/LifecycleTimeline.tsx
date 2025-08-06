"use client";
import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../../../ui/dropdown/DropdownItem";
import { Dropdown } from "../../../ui/dropdown/Dropdown";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface TimelineProduct {
  id: number;
  name: string;
  kategori: string;
  stage_start: string;
  stage_end: string;
  stage_date: string;
}

interface TimelineDataPoint {
  x: number;
  y: number;
  productCount: number;
  products?: TimelineProduct[];
}

interface TimelineDataset {
  label: string;
  data: TimelineDataPoint[];
  backgroundColor: string;
  borderColor: string;
  pointRadius: number;
  pointHoverRadius: number;
  products: {
    year: number;
    month: number;
    stage: string;
    products: TimelineProduct[];
  }[];
}

interface TimelineApiResponse {
  success: boolean;
  data: {
    datasets: TimelineDataset[];
    yearRange: {
      min: number;
      max: number;
    };
    lastUpdated: string;
  };
}

export default function LifecycleTimeline() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [timelineData, setTimelineData] = useState<TimelineDataset[]>([]);
  const [yearRange, setYearRange] = useState({ min: 2018, max: 2025 });
  const [lastUpdated, setLastUpdated] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    checkTheme();

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchTimelineData();
  }, []);

  const fetchTimelineData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/lifecycle/timeline');
      const result: TimelineApiResponse = await response.json();
      
      if (result.success) {
        setTimelineData(result.data.datasets);
        setYearRange(result.data.yearRange);
        setLastUpdated(result.data.lastUpdated);
      } else {
        throw new Error('Failed to fetch timeline data');
      }
    } catch (err) {
      console.error('Error fetching timeline data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      // Fallback to sample data if API fails
      setTimelineData([
        {
          label: 'Pembangunan',
          data: [{ x: 2022, y: 4, productCount: 1 }],
          backgroundColor: '#06B6D4',
          borderColor: '#06B6D4',
          pointRadius: 8,
          pointHoverRadius: 10,
          products: []
        },
        {
          label: 'Transmisi',
          data: [{ x: 2023, y: 2, productCount: 1 }],
          backgroundColor: '#10B981',
          borderColor: '#10B981',
          pointRadius: 8,
          pointHoverRadius: 10,
          products: []
        },
        {
          label: 'Distribusi',
          data: [{ x: 2021, y: 8, productCount: 1 }],
          backgroundColor: '#F59E0B',
          borderColor: '#F59E0B',
          pointRadius: 8,
          pointHoverRadius: 10,
          products: []
        },
        {
          label: 'Korporat',
          data: [{ x: 2018, y: 6, productCount: 1 }],
          backgroundColor: '#8B5CF6',
          borderColor: '#8B5CF6',
          pointRadius: 8,
          pointHoverRadius: 10,
          products: []
        },
        {
          label: 'Pelayanan Pelanggan',
          data: [{ x: 2021, y: 3, productCount: 1 }],
          backgroundColor: '#EF4444',
          borderColor: '#EF4444',
          pointRadius: 8,
          pointHoverRadius: 10,
          products: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleExport = () => {
    console.log('Export timeline data');
    closeDropdown();
  };

  const handleRefresh = () => {
    fetchTimelineData();
    closeDropdown();
  };

  const chartData = {
    datasets: timelineData
  };

  const options: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false,
      },
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            family: 'Outfit, sans-serif'
          },
          color: isDark ? '#E5E7EB' : '#374151'
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        titleColor: isDark ? '#F9FAFB' : '#111827',
        bodyColor: isDark ? '#E5E7EB' : '#374151',
        borderColor: isDark ? '#374151' : '#E5E7EB',
        borderWidth: 1,
        callbacks: {
          title: function(context) {
            return context[0].dataset.label;
          },
          label: function(context) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = months[Math.round(context.parsed.x) - 1];
            const year = Math.round(context.parsed.y);
            const dataPoint = context.raw as TimelineDataPoint;
            const productCount = dataPoint.productCount || 1;
            return [
              `${month} ${year}`,
              `${productCount} produk`
            ];
          },
          afterLabel: function(context) {
            const dataPoint = context.raw as TimelineDataPoint;
            if (dataPoint.products && dataPoint.products.length > 0) {
              return dataPoint.products.slice(0, 3).map(p => `• ${p.name}`);
            }
            return [];
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        min: 0.5,
        max: 12.5,
        ticks: {
          stepSize: 1,
          color: isDark ? '#9CA3AF' : '#6B7280',
          font: {
            size: 11,
            family: 'Outfit, sans-serif'
          },
          callback: function(value) {
            const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const roundedValue = Math.round(value as number);
            return months[roundedValue] || '';
          }
        },
        title: {
          display: true,
          text: 'Bulan',
          color: isDark ? '#9CA3AF' : '#6B7280',
          font: {
            size: 12,
            family: 'Outfit, sans-serif'
          }
        },
        grid: {
          color: isDark ? '#374151' : '#E5E7EB',
          lineWidth: 1
        }
      },
      y: {
        min: yearRange.min - 0.5,
        max: yearRange.max + 0.5,
        ticks: {
          stepSize: 1,
          color: isDark ? '#9CA3AF' : '#6B7280',
          font: {
            size: 11,
            family: 'Outfit, sans-serif'
          },
          callback: function(value) {
            return Math.round(value as number);
          }
        },
        title: {
          display: true,
          text: 'Tahun',
          color: isDark ? '#9CA3AF' : '#6B7280',
          font: {
            size: 12,
            family: 'Outfit, sans-serif'
          }
        },
        grid: {
          color: isDark ? '#374151' : '#E5E7EB',
          lineWidth: 1
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'point'
    },
    elements: {
      point: {
        hoverBackgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        hoverBorderWidth: 2,
        borderWidth: 2
      }
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800">
        <div className="px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Product Lifecycle Timeline
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Timeline visualization of product launches across different segments
              </p>
            </div>
          </div>
        </div>
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="relative h-80 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-500 dark:text-gray-400">Loading timeline data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800">
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Product Lifecycle Timeline
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Timeline visualization of product launches across different segments
            </p>
            {lastUpdated && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Last updated: {lastUpdated}
              </p>
            )}
          </div>

          <div className="relative inline-block">
            <button onClick={toggleDropdown} className="dropdown-toggle">
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={handleRefresh}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Refresh Data
              </DropdownItem>
              <DropdownItem
                onItemClick={handleExport}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Export
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              Error: {error}
            </p>
          </div>
        )}
      </div>

      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="relative h-64">
          {timelineData.length > 0 ? (
            <Scatter data={chartData} options={options} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  No timeline data available
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}