import { useState, useEffect } from 'react';
import { ChartEvent, ActiveElement } from 'chart.js';

interface UseChartConfigProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  onChartClick: (stageId: string) => void;
}

export const useChartConfig = ({ data, onChartClick }: UseChartConfigProps) => {
  const [isDark, setIsDark] = useState(false);

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

  const handleChartClick = (event: ChartEvent, elements: ActiveElement[]) => {
    if (elements.length > 0 && data?.stages) {
      const elementIndex = elements[0].index;
      const stageId = data.stages[elementIndex]?.id;
      if (stageId) {
        onChartClick(stageId);
      }
    }
  };

  const defaultColors = isDark 
    ? ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
    : ['#60A5FA', '#34D399', '#FBBF24', '#F87171'];

  const chartData = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    labels: data?.stages?.map((stage: any) => stage.stage) || [],
    datasets: [
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: data?.stages?.map((stage: any) => stage.count) || [],
        backgroundColor: defaultColors,
        borderColor: isDark ? '#374151' : '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 4,
        hoverBorderColor: isDark ? '#9CA3AF' : '#D1D5DB',
        hoverBackgroundColor: defaultColors.map(color => color + 'DD') // Tambahkan transparansi saat hover
      }
    ]
  };

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
          color: isDark ? '#E5E7EB' : '#374151',
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        titleColor: isDark ? '#F9FAFB' : '#111827',
        bodyColor: isDark ? '#E5E7EB' : '#374151',
        borderColor: isDark ? '#374151' : '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        usePointStyle: true,
        pointStyle: 'circle',
        position: 'nearest' as const,
        intersect: true, // Ubah ke true untuk Doughnut chart
        mode: 'point' as const, // Ubah ke 'point' untuk Doughnut chart
        animation: {
          duration: 200
        },
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
        hoverBorderWidth: 4,
        borderAlign: 'inner' as const
      }
    },
    interaction: {
      intersect: true, // Ubah ke true untuk deteksi hover yang lebih baik
      mode: 'point' as const // Ubah ke 'point' untuk Doughnut chart
    }
  };

  return {
    chartData,
    chartOptions,
    isDark
  };
};