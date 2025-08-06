"use client";
import React from 'react';

interface TransitionMatrixChartProps {
  stages: string[];
  segments: string[];
  matrixData: number[][];
  lastUpdated: string;
  onCellClick: (stage: string, segment: string, value: number) => void;
}

export default function TransitionMatrixChart({
  stages,
  segments,
  matrixData,
  lastUpdated,
  onCellClick
}: TransitionMatrixChartProps) {
  const getIntensityColor = (value: number) => {
    if (value === 0) return 'bg-gray-100 dark:bg-gray-700';
    if (value <= 2) return 'bg-cyan-100 dark:bg-cyan-900/30';
    if (value <= 4) return 'bg-cyan-200 dark:bg-cyan-800/50';
    if (value <= 6) return 'bg-cyan-300 dark:bg-cyan-700/70';
    if (value <= 8) return 'bg-cyan-400 dark:bg-cyan-600/80';
    return 'bg-cyan-500 dark:bg-cyan-500/90';
  };

  const getTextColor = (value: number) => {
    if (value === 0) return 'text-gray-400 dark:text-gray-500';
    if (value <= 4) return 'text-cyan-800 dark:text-cyan-200';
    return 'text-white dark:text-white';
  };

  return (
    <div className="px-5 pb-5 sm:px-6 sm:pb-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"></th>
              {segments.map((segment) => (
                <th key={segment} className="text-center p-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 min-w-[80px]">
                  <div className="truncate" title={segment}>
                    {segment}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stages.map((stage, stageIndex) => (
              <tr key={stage} className="border-b border-gray-100 dark:border-gray-800">
                <td className="p-2 text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px] border-r border-gray-200 dark:border-gray-700">
                  <div className="truncate" title={stage}>
                    {stage}
                  </div>
                </td>
                {segments.map((segment, segmentIndex) => {
                  const value = matrixData[stageIndex][segmentIndex];
                  return (
                    <td key={segment} className="p-1 text-center">
                      <div 
                        className={`w-40 h-10 flex items-center justify-center rounded-lg text-sm font-bold border border-gray-200 dark:border-gray-600 ${
                          getIntensityColor(value)
                        } ${getTextColor(value)} transition-all duration-200 hover:scale-105 hover:shadow-md mx-auto ${
                          value > 0 ? 'cursor-pointer' : 'cursor-default'
                        }`}
                        onClick={() => onCellClick(stage, segment, value)}
                        title={value > 0 ? `Klik untuk melihat detail ${value} produk` : ''}
                      >
                        {value}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Color Scale Legend */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">0</span>
        <div className="flex border border-gray-200 dark:border-gray-600 rounded">
          <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600"></div>
          <div className="w-4 h-4 bg-cyan-100 dark:bg-cyan-900/30 border-r border-gray-200 dark:border-gray-600"></div>
          <div className="w-4 h-4 bg-cyan-200 dark:bg-cyan-800/50 border-r border-gray-200 dark:border-gray-600"></div>
          <div className="w-4 h-4 bg-cyan-300 dark:bg-cyan-700/70 border-r border-gray-200 dark:border-gray-600"></div>
          <div className="w-4 h-4 bg-cyan-400 dark:bg-cyan-600/80 border-r border-gray-200 dark:border-gray-600"></div>
          <div className="w-4 h-4 bg-cyan-500 dark:bg-cyan-500/90"></div>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">9+</span>
      </div>
      
      {/* Update Info */}
      <div className="mt-3 flex items-center justify-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Terakhir diperbarui: {lastUpdated}
        </span>
      </div>
    </div>
  );
}