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
import { Bar } from 'react-chartjs-2';
import { useTheme } from '@/context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StageData {
  stage: string;
  intervalDays: number;
  segmen: string;
}

interface ApiResponse {
  success: boolean;
  data: StageData[];
}

const TransitionSpeedAnalysis: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const stageColors = {
    'Introduction': '#3B82F6',
    'Growth': '#10B981', 
    'Maturity': '#F59E0B',
    'Decline': '#EF4444'
  };

  const stages = ['Introduction', 'Growth', 'Maturity', 'Decline'];
  const segments = ['Distribusi', 'EP & Pembangkit', 'Korporat', 'Pelayanan Pelanggan', 'Transmisi'];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulasi data dummy untuk grouped bar chart
      const dummyData: StageData[] = [];
      
      segments.forEach(segment => {
        stages.forEach(stage => {
          dummyData.push({
            stage,
            segmen: segment,
            intervalDays: Math.floor(Math.random() * 300) + 30 // Random 30-330 hari
          });
        });
      });
      
      setData({ success: true, data: dummyData });
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
    if (!data?.data) return null;

    // Buat dataset untuk setiap stage
    const datasets = stages.map(stage => {
      const stageData = segments.map(segment => {
        const segmentStageData = data.data.find(d => d.segmen === segment && d.stage === stage);
        return segmentStageData?.intervalDays || 0;
      });
      
      const baseColor = stageColors[stage as keyof typeof stageColors] || '#6B7280';
      
      return {
        label: stage,
        data: stageData,
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
              weight: 600 // Changed from "600" to 600 (number)
            },
            boxWidth: 12,
            boxHeight: 12
          }
        },
        title: {
          display: true,
          text: 'Transition Speed Analysis',
          color: isDarkMode ? '#F3F4F6' : '#1F2937',
          font: {
            size: 20,
            weight: 'bold' as const
          },
          padding: {
            bottom: 30
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
              return `${context.dataset.label}: ${value} hari`;
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
              weight: 600 // Changed from "600" to 600 (number)
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
              weight: 600 // Changed from "600" to 600 (number)
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
              weight: 500 // Changed from "500" to 500 (number)
            },
            padding: 8,
            callback: function(value: any) {
              return value + ' hari';
            }
          },
          title: {
            display: true,
            text: 'Interval (Hari)',
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
            font: {
              size: 14,
              weight: 600 // Changed from "600" to 600 (number)
            },
            padding: 16
          }
        }
      },
      // Konfigurasi untuk grouped bar chart
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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Memuat data analisis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Chart Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="h-[500px]">
          {chartData && (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TransitionSpeedAnalysis;