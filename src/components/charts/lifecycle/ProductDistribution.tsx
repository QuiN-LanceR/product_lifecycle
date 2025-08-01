"use client";
import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import { Dropdown } from "../../ui/dropdown/Dropdown";

ChartJS.register(ArcElement, Tooltip, Legend);

// Interface untuk data dari API
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

interface ApiResponse {
  success: boolean;
  data: {
    stats: DashboardStats;
    stages: StageData[];
  };
}

// Plugin untuk menampilkan persentase pada setiap segment
const segmentLabelPlugin = {
  id: 'segmentLabels',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterDraw: (chart: any) => {
    const { ctx, data } = chart;
    const meta = chart.getDatasetMeta(0);
    const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
    
    if (total === 0) return; // Avoid division by zero
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta.data.forEach((element: any, index: number) => {
      const { x, y } = element.tooltipPosition();
      const value = data.datasets[0].data[index];
      const percentage = Math.round((value / total) * 100);
      
      // Only show percentage if value > 0
      if (value > 0) {
        ctx.save();
        ctx.font = 'bold 14px Outfit, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(`${percentage}%`, x, y);
        ctx.restore();
      }
    });
  }
};

export default function ProductDistribution() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/stats');
        const result = await response.json();
        
        if (result.success) {
          setData(result);
        } else {
          setError('Failed to fetch data');
        }
      } catch (err) {
        setError('Error fetching data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

    // Loading state
  if (loading) {
    return (
      <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800 shadow-sm">
        <div className="px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="relative h-80 flex items-center justify-center">
            <div className="w-64 h-64 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800 shadow-sm">
        <div className="px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400">{error || 'No data available'}</p>
          </div>
        </div>
      </div>
    );
  }

  const { stats } = data.data;
  
  // Prepare chart data from API response
  const chartData = {
    labels: ['Introduction', 'Growth', 'Maturity', 'Decline'],
    datasets: [
      {
        data: [stats.introduction, stats.growth, stats.maturity, stats.decline],
        backgroundColor: [
          '#06B6D4', // Cyan for Introduction
          '#10B981', // Green for Growth  
          '#F59E0B', // Orange for Maturity
          '#EF4444'  // Red for Decline
        ],
        borderWidth: 2,
        borderColor: isDark ? '#374151' : '#FFFFFF',
        cutout: '60%'
      }
    ]
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
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
          color: isDark ? '#E5E7EB' : '#374151',
          generateLabels: function(chart): import('chart.js').LegendItem[] {
            const data = chart.data;
            if (data.labels && data.datasets.length) {
              return (data.labels as string[]).map((label, i): import('chart.js').LegendItem => {
                const dataset = data.datasets[0];
                
                // Warna default untuk dark/light mode
                const defaultColors = isDark 
                  ? ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']
                  : ['#DC2626', '#D97706', '#059669', '#2563EB', '#7C3AED', '#DB2777', '#0891B2', '#65A30D'];
                
                // Ambil warna dari dataset atau gunakan default
                let fillColor: string;
                if (Array.isArray(dataset.backgroundColor)) {
                  fillColor = dataset.backgroundColor[i] || defaultColors[i % defaultColors.length];
                } else if (typeof dataset.backgroundColor === 'string') {
                  fillColor = dataset.backgroundColor;
                } else {
                  fillColor = defaultColors[i % defaultColors.length];
                }
                
                // Border color yang sesuai dengan dark mode
                let strokeColor: string;
                if (Array.isArray(dataset.borderColor)) {
                  strokeColor = dataset.borderColor[i] || (isDark ? '#374151' : '#E5E7EB');
                } else if (typeof dataset.borderColor === 'string') {
                  strokeColor = dataset.borderColor;
                } else {
                  strokeColor = isDark ? '#374151' : '#E5E7EB';
                }
                
                return {
                  text: `${label}`,
                  fillStyle: fillColor,
                  strokeStyle: strokeColor,
                  lineWidth: typeof dataset.borderWidth === 'number' ? dataset.borderWidth : 2,
                  pointStyle: 'circle' as const,
                  hidden: false,
                  index: i,
                  // Tambahan untuk styling yang lebih baik di dark mode
                  fontColor: isDark ? '#E5E7EB' : '#374151'
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        titleColor: isDark ? '#F9FAFB' : '#111827',
        bodyColor: isDark ? '#E5E7EB' : '#374151',
        borderColor: isDark ? '#374151' : '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((context.parsed / total) * 100) : 0;
            return `${context.label}: ${context.parsed} produk (${percentage}%)`;
          },
          afterLabel: function() {
            return `Total: ${stats.total} produk`;
          },
          labelColor: function(context) {
            // Warna kotak kecil di tooltip yang sesuai dengan dark mode
            const dataset = context.dataset;
            let backgroundColor: string;
            
            if (Array.isArray(dataset.backgroundColor)) {
              backgroundColor = dataset.backgroundColor[context.dataIndex] as string;
            } else {
              backgroundColor = dataset.backgroundColor as string || (isDark ? '#3B82F6' : '#2563EB');
            }
            
            return {
              borderColor: isDark ? '#374151' : '#E5E7EB',
              backgroundColor: backgroundColor,
              borderWidth: 1
            };
          }
        }
      },
    }
  };

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Product Lifecycle Distribution
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Current distribution of products across lifecycle stages
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Total: {stats.total} produk
            </p>
          </div>

          <div className="relative inline-block">
            <button onClick={toggleDropdown} className="dropdown-toggle">
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View More
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Export
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Chart Container dengan height yang konsisten */}
      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="relative h-80 flex items-center justify-center">
          <Doughnut 
            data={chartData} 
            options={options}
            plugins={[segmentLabelPlugin]}
          />
        </div>
      </div>
    </div>
  );
}