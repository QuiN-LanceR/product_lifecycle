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

// Plugin untuk menampilkan persentase pada setiap segment
const segmentLabelPlugin = {
  id: 'segmentLabels',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterDraw: (chart: any) => {
    const { ctx, data } = chart;
    const meta = chart.getDatasetMeta(0);
    const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta.data.forEach((element: any, index: number) => {
      const { x, y } = element.tooltipPosition();
      const value = data.datasets[0].data[index];
      const percentage = Math.round((value / total) * 100);
      
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
    });
  }
};

export default function ProductDistribution() {
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

  const data = {
    labels: ['Introduction', 'Growth', 'Maturity', 'Decline'],
    datasets: [
      {
        data: [14, 43, 29, 14],
        backgroundColor: [
          '#06B6D4', // Cyan for Introduction
          '#10B981', // Green for Growth  
          '#F59E0B', // Orange for Maturity
          '#EF4444'  // Red for Decline
        ],
        borderWidth: 2,
        borderColor: '#FFFFFF',
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
          label: function(context) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      },
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-gray-800 sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Product Lifecycle Distribution
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Current distribution of products across lifecycle stages
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

     <div className="relative h-65 mb-6">
        <Doughnut 
          data={data} 
          options={options}
          plugins={[segmentLabelPlugin]}
        />
      </div>
    </div>
  );
}