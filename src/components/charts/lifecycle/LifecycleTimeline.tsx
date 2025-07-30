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
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import { Dropdown } from "../../ui/dropdown/Dropdown";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function LifecycleTimeline() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

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

  // Sample data berdasarkan gambar
  const timelineData = {
    datasets: [
      {
        label: 'Pembangunan',
        data: [
          { x: 2022, y: 4 }, // Apr 2022
        ],
        backgroundColor: '#06B6D4',
        borderColor: '#06B6D4',
        pointRadius: 8,
        pointHoverRadius: 10,
      },
      {
        label: 'Transmisi',
        data: [
          { x: 2023, y: 2 }, // Feb 2023
        ],
        backgroundColor: '#10B981',
        borderColor: '#10B981',
        pointRadius: 8,
        pointHoverRadius: 10,
      },
      {
        label: 'Distribusi',
        data: [
          { x: 2021, y: 8 }, // Aug 2021
        ],
        backgroundColor: '#F59E0B',
        borderColor: '#F59E0B',
        pointRadius: 8,
        pointHoverRadius: 10,
      },
      {
        label: 'Korporat',
        data: [
          { x: 2018, y: 6 }, // Jun 2018
        ],
        backgroundColor: '#8B5CF6',
        borderColor: '#8B5CF6',
        pointRadius: 8,
        pointHoverRadius: 10,
      },
      {
        label: 'Pelayanan Pelanggan',
        data: [
          { x: 2021, y: 3 }, // Mar 2021
        ],
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
        pointRadius: 8,
        pointHoverRadius: 10,
      },
    ],
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
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = months[context.parsed.y - 1];
            return `${month} ${context.parsed.x}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        min: 2018,
        max: 2025,
        ticks: {
          stepSize: 1,
          color: isDark ? '#9CA3AF' : '#6B7280',
          font: {
            size: 11,
            family: 'Outfit, sans-serif'
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
      },
      y: {
        min: 0,
        max: 12,
        ticks: {
          stepSize: 1,
          color: isDark ? '#9CA3AF' : '#6B7280',
          font: {
            size: 11,
            family: 'Outfit, sans-serif'
          },
          callback: function(value) {
            const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return months[value as number] || '';
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
      }
    },
    interaction: {
      intersect: false,
      mode: 'point'
    }
  };

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

      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="relative h-80">
          <Scatter data={timelineData} options={options} />
        </div>
      </div>
    </div>
  );
}