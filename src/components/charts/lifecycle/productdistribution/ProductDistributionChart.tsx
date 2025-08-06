import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ProductDistributionChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartOptions: any;
  totalProducts: number;
}

const segmentLabelPlugin = {
  id: 'segmentLabel',
  beforeDatasetsDraw: () => {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterDatasetsDraw: (chart: any) => {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    
    if (!meta || !meta.data || meta.data.length === 0) return;
    
    const centerX = meta.data[0].x;
    const centerY = meta.data[0].y;
    const total = chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
    
    ctx.save();
    
    // Deteksi dark mode dari chart options atau DOM
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#E5E7EB' : '#374151';
    
    // Gambar label di tengah chart
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Gambar teks dengan shadow untuk kontras yang lebih baik
    ctx.shadowColor = isDark ? '#000000' : '#FFFFFF';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    ctx.fillText('Total', centerX, centerY - 12);
    
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillText(total.toString(), centerX, centerY + 8);
    
    // Gambar persentase pada setiap segmen
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = isDark ? '#000000' : '#374151';
    ctx.lineWidth = 2;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta.data.forEach((arc: any, index: number) => {
      const value = chart.data.datasets[0].data[index];
      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
      
      // Hitung posisi tengah dari setiap arc
      const angle = (arc.startAngle + arc.endAngle) / 2;
      const radius = (arc.innerRadius + arc.outerRadius) / 2;
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      // Hanya tampilkan persentase jika cukup besar (> 5%)
      if (parseFloat(percentage) > 5) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Gambar outline text untuk kontras
        ctx.strokeText(`${percentage}%`, x, y);
        // Gambar text utama
        ctx.fillText(`${percentage}%`, x, y);
      }
    });
    
    ctx.restore();
  }
};

const ProductDistributionChart: React.FC<ProductDistributionChartProps> = ({
  chartData,
  chartOptions
}) => {
  return (
    <div className="relative h-[410px] mb-4">
      <Doughnut 
        data={chartData} 
        options={{
          ...chartOptions,
          // Pastikan hover detection bekerja dengan baik
          onHover: (event, elements) => {
            if (event.native?.target) {
              (event.native.target as HTMLElement).style.cursor = elements.length > 0 ? 'pointer' : 'default';
            }
          }
        }}
        plugins={[segmentLabelPlugin]} 
      />
    </div>
  );
};

export default ProductDistributionChart;