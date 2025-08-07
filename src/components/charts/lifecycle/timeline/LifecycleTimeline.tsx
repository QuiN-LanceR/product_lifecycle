/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { ChevronDownIcon, PDFLight, PDFDark, ExcelIcon } from "@/icons";
import { TimelineApiResponse } from '@/types/timeline.types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function LifecycleTimeline() {
  const [timelineData, setTimelineData] = useState<TimelineApiResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'excel' | 'pdf' | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode
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

  useEffect(() => {
    fetchTimelineData();
  }, []);

  const fetchTimelineData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/lifecycle/timeline');
      const data: TimelineApiResponse = await response.json();
      
      if (data.success) {
        setTimelineData(data.data);
      } else {
        throw new Error('Failed to fetch timeline data');
      }
    } catch (error) {
      console.error('Error fetching timeline data:', error);
      setError('Gagal memuat data timeline');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      setExportType('excel');
      setIsDropdownOpen(false);
      
      const response = await fetch('/api/lifecycle/timeline/export');
      
      if (!response.ok) {
        throw new Error('Failed to export Excel');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Timeline_Siklus_Hidup_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      setError('Gagal mengekspor Excel');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      setExportType('pdf');
      setIsDropdownOpen(false);
      
      const response = await fetch('/api/lifecycle/timeline/export-pdf');
      
      if (!response.ok) {
        throw new Error('Failed to export PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Timeline_Siklus_Hidup_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setError('Gagal mengekspor PDF');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const chartData = timelineData ? {
    datasets: timelineData.datasets
  } : { datasets: [] };

  const options: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Timeline Siklus Hidup Produk',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            const point = context[0];
            const month = Math.round(point.parsed.x);
            const year = Math.round(point.parsed.y);
            const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                              'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            return `${monthNames[month]} ${year}`;
          },
          label: function(context) {
            const datasetLabel = context.dataset.label || '';
            const productCount = (context.raw as any).productCount || 1;
            return `${datasetLabel}: ${productCount} produk`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Bulan'
        },
        min: 0.5,
        max: 12.5,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
                          'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
            // Bulatkan nilai untuk menghilangkan desimal dari jitter
            const roundedValue = Math.round(value as number);
            return months[roundedValue] || roundedValue;
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Tahun'
        },
        ticks: {
          stepSize: 1,
          callback: function(value) {
            // Bulatkan nilai tahun untuk menghilangkan desimal dari jitter
            return Math.round(value as number);
          }
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchTimelineData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Timeline Siklus Hidup Produk
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Visualisasi timeline produk berdasarkan segmen dan waktu. 
            Setiap titik menunjukkan produk pada tahap tertentu.
          </p>
          {timelineData && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Terakhir diperbarui: {timelineData.lastUpdated}
            </p>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isExporting}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting {exportType === 'excel' ? 'Excel' : 'PDF'}...
              </>
            ) : (
              <>
                Export Data
                <ChevronDownIcon className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
          
          {isDropdownOpen && !isExporting && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  <ExcelIcon className="mr-3 h-4 w-4 text-green-600" />
                  Export Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  {isDark ? (
                    <PDFDark className="mr-3 h-4 w-4" />
                  ) : (
                    <PDFLight className="mr-3 h-4 w-4" />
                  )}
                  Export PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {timelineData && timelineData.datasets.length > 0 ? (
        <div className="h-96">
          <Scatter data={chartData} options={options} />
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-600 dark:text-gray-400">Tidak ada data timeline tersedia</p>
          <button
            onClick={fetchTimelineData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      )}
    </div>
  );
}