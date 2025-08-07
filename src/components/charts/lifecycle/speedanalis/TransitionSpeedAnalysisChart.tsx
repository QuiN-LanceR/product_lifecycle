/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';

interface TransitionSpeedAnalysisChartProps {
  chartData: any;
  chartOptions: ChartOptions<'bar'>;
}

const TransitionSpeedAnalysisChart: React.FC<TransitionSpeedAnalysisChartProps> = ({
  chartData,
  chartOptions
}) => {
  return (
    <div className="h-[400px] w-full">
      {chartData && (
        <Bar data={chartData} options={chartOptions} />
      )}
    </div>
  );
};

export default TransitionSpeedAnalysisChart;