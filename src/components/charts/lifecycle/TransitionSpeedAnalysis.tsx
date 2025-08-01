"use client";
import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import { Dropdown } from "../../ui/dropdown/Dropdown";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SpeedData {
  stage: string;
  averageDays: number;
  productCount: number;
}

interface ApiResponse {
  success: boolean;
  data: SpeedData[];
}

export default function TransitionSpeedAnalysis() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/lifecycle/transition-speed');
        const result = await response.json();
        
        if (result.success) {
          setData(result);
        } else {
          setError('Failed to fetch transition speed data');
        }
      } catch (err) {
        setError('Error fetching data');
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
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
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-44 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-56"></div>
              </div>
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
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

  const chartData = {
    labels: data.data.map(item => item.stage),
    datasets: [
      {
        label: 'Average Days',
        data: data.data.map(item => item.averageDays),
        backgroundColor: [
          'rgba(6, 182, 212, 0.8)',   // Cyan
          'rgba(16, 185, 129, 0.8)',  // Green
          'rgba(245, 158, 11, 0.8)',  // Orange
          'rgba(239, 68, 68, 0.8)'    // Red
        ],
        borderColor: [
          'rgb(6, 182, 212)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        titleColor: isDark ? '#F9FAFB' : '#111827',
        bodyColor: isDark ? '#E5E7EB' : '#374151',
        borderColor: isDark ? '#374151' : '#E5E7EB',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const stageData = data.data[context.dataIndex];
            return [
              `Average: ${context.parsed.y} days`,
              `Products: ${stageData.productCount}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: isDark ? '#E5E7EB' : '#374151',
          font: {
            family: 'Outfit, sans-serif',
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? '#374151' : '#E5E7EB'
        },
        ticks: {
          color: isDark ? '#E5E7EB' : '#374151',
          font: {
            family: 'Outfit, sans-serif',
            size: 12
          },
          callback: function(value) {
            return value + ' days';
          }
        }
      }
    }
  };

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Transition Speed Analysis
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Average time products spend in each lifecycle stage
            </p>
          </div>
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <MoreDotIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            {isOpen && (
              <Dropdown isOpen onClose={closeDropdown}>
                <DropdownItem onClick={() => console.log('Export')}>Export Data</DropdownItem>
                <DropdownItem onClick={() => console.log('Refresh')}>Refresh</DropdownItem>
              </Dropdown>
            )}
          </div>
        </div>
        
        <div className="h-80">
          <Bar data={chartData} options={options} />
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString('id-ID')}
          </p>
        </div>
      </div>
    </div>
  );
}