import { useCallback } from 'react';
import { useTheme } from 'next-themes';

export const useChartOptimization = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getTooltipConfig = useCallback((customCallbacks?: any) => {
    return {
      enabled: true,
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      titleColor: isDark ? '#f9fafb' : '#111827',
      bodyColor: isDark ? '#e5e7eb' : '#374151',
      borderColor: isDark ? '#374151' : '#e5e7eb',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      displayColors: true,
      position: 'nearest' as const,
      intersect: false,
      mode: 'index' as const,
      ...customCallbacks
    };
  }, [isDark]);

  const getLegendConfig = useCallback(() => {
    return {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle',
        font: {
          size: 12,
          family: 'Outfit, sans-serif'
        },
        color: isDark ? '#e5e7eb' : '#374151'
      }
    };
  }, [isDark]);

  const getScaleConfig = useCallback(() => {
    return {
      grid: {
        color: isDark ? '#374151' : '#e5e7eb'
      },
      ticks: {
        color: isDark ? '#e5e7eb' : '#374151',
        font: {
          family: 'Outfit, sans-serif',
          size: 12
        }
      }
    };
  }, [isDark]);

  return {
    getTooltipConfig,
    getLegendConfig,
    getScaleConfig,
    isDark
  };
};