/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { useTheme } from '@/context/ThemeContext';
import TransitionSpeedAnalysisHeader from './TransitionSpeedAnalysisHeader';
import TransitionSpeedAnalysisChart from './TransitionSpeedAnalysisChart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TransitionData {
  transition: string;
  actualDuration: number;
  plannedDuration: number;
  efficiency: number;
  totalTransitions: number;
  standardDeviation?: number;
  minDuration?: number;
  maxDuration?: number;
  medianDuration?: number;
}

interface ApiResponse {
  success: boolean;
  analysisType: string;
  timeUnit: string;
  data: {
    segments: string[];
    transitions: string[];
    timeUnit: string;
    data: { [key: string]: TransitionData[] };
    summary: {
      totalSegments: number;
      totalTransitions: number;
      avgEfficiency: number;
    };
  };
}

const TransitionSpeedAnalysis: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Fixed values - no more filters
  const timeUnit = 'months';
  const analysisType = 'duration';

  const transitionColors = {
    'Introduction → Growth': '#3B82F6',
    'Growth → Maturity': '#10B981', 
    'Maturity → Decline': '#F59E0B'
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/lifecycle/transition-speed?unit=${timeUnit}&type=${analysisType}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chartData = useMemo(() => {
    if (!data?.data?.data || !data?.data?.segments) return null;

    const segments = data.data.segments;
    const segmentData = data.data.data;
    const transitions = data.data.transitions || ['Introduction → Growth', 'Growth → Maturity', 'Maturity → Decline'];

    // Buat dataset untuk setiap transition
    const datasets = transitions.map(transition => {
      const transitionData = segments.map(segment => {
        const segmentTransitions = segmentData[segment] || [];
        const transitionItem = segmentTransitions.find(t => t.transition === transition);
        return transitionItem?.actualDuration || 0;
      });
      
      const baseColor = transitionColors[transition as keyof typeof transitionColors] || '#6B7280';
      
      return {
        label: transition,
        data: transitionData,
        backgroundColor: baseColor + '80',
        borderColor: baseColor,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
        hoverBackgroundColor: baseColor + 'CC',
        hoverBorderColor: baseColor,
        hoverBorderWidth: 3
      };
    });

    return {
      labels: segments,
      datasets
    };
  }, [data]);

  const chartOptions: ChartOptions<'bar'> = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index' as const,
      },
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            color: isDarkMode ? '#E5E7EB' : '#374151',
            usePointStyle: true,
            padding: 20,
            font: {
              size: 13,
              weight: 600
            },
            boxWidth: 12,
            boxHeight: 12
          }
        },
        tooltip: {
          backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          titleColor: isDarkMode ? '#F3F4F6' : '#1F2937',
          bodyColor: isDarkMode ? '#E5E7EB' : '#374151',
          borderColor: isDarkMode ? '#374151' : '#E5E7EB',
          borderWidth: 1,
          cornerRadius: 12,
          displayColors: true,
          titleFont: {
            size: 14,
            weight: 'bold' as const
          },
          bodyFont: {
            size: 13
          },
          padding: 12,
          callbacks: {
            title: (context: any) => {
              return `Segmen: ${context[0].label}`;
            },
            label: (context: any) => {
              const value = context.parsed.y;
              return `${context.dataset.label}: ${value} bulan`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: isDarkMode ? '#374151' : '#F3F4F6',
            display: false
          },
          ticks: {
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
            font: {
              size: 12,
              weight: 600
            },
            padding: 8,
            maxRotation: 45,
            minRotation: 0
          },
          title: {
            display: true,
            text: 'Segmen',
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
            font: {
              size: 14,
              weight: 600
            },
            padding: 16
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: isDarkMode ? '#374151' : '#F3F4F6',
            drawBorder: false
          },
          ticks: {
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
            font: {
              size: 12,
              weight: 500
            },
            padding: 8,
            callback: function(value: any) {
              return value + ' bulan';
            }
          },
          title: {
            display: true,
            text: 'Durasi (Bulan)',
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
            font: {
              size: 14,
              weight: 600
            },
            padding: 16
          }
        }
      },
      datasets: {
        bar: {
          categoryPercentage: 0.8,
          barPercentage: 0.9
        }
      }
    };
  }, [isDarkMode]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Memuat data analisis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-6">⚠️</div>
            <p className="text-red-500 mb-6 font-semibold text-lg">{error}</p>
            <button 
              onClick={fetchData}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <TransitionSpeedAnalysisHeader />
      
      <TransitionSpeedAnalysisChart
        chartData={chartData}
        chartOptions={chartOptions}
      />
    </div>
  );
};

export default TransitionSpeedAnalysis;