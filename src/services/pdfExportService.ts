import puppeteer from 'puppeteer';
import { TimelineExportData } from '@/types/timeline.types';

export class PDFExportService {
  static async generateTimelinePDF(data: TimelineExportData): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      const htmlContent = this.generateHTMLContent(data);
      
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        printBackground: true
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  private static generateHTMLContent(data: TimelineExportData): string {
    const chartData = this.prepareChartData(data);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Timeline Siklus Hidup Produk</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8fafc;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
          }
          .chart-container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
          }
          .summary-section {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
          }
          .summary-card {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          .summary-card h4 {
            margin: 0 0 8px 0;
            color: #1e293b;
            font-size: 14px;
          }
          .summary-card p {
            margin: 0;
            color: #64748b;
            font-size: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th, td {
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
            font-size: 12px;
          }
          th {
            background-color: #f1f5f9;
            font-weight: 600;
            color: #374151;
          }
          .metadata {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            font-size: 12px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Timeline Siklus Hidup Produk</h1>
          <p>Analisis Timeline Produk Berdasarkan Segmen dan Waktu</p>
          <p>Diekspor pada: ${data.metadata.exportDate}</p>
        </div>

        <div class="chart-container">
          <h2>Grafik Timeline</h2>
          <canvas id="timelineChart" width="800" height="400"></canvas>
        </div>

        <div class="summary-section">
          <h2>Ringkasan Berdasarkan Segmen</h2>
          <div class="summary-grid">
            ${data.summaryBySegment.map(segment => `
              <div class="summary-card">
                <h4>${segment.segmen}</h4>
                <p><strong>${segment.totalProducts}</strong> produk</p>
                <p><strong>${segment.stages.length}</strong> stage</p>
                <p>Tahun: ${segment.yearRange}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="summary-section">
          <h2>Detail Berdasarkan Segmen</h2>
          <table>
            <thead>
              <tr>
                <th>Segmen</th>
                <th>Total Produk</th>
                <th>Jumlah Stage</th>
                <th>Daftar Stage</th>
                <th>Rentang Tahun</th>
              </tr>
            </thead>
            <tbody>
              ${data.summaryBySegment.map(segment => `
                <tr>
                  <td>${segment.segmen}</td>
                  <td>${segment.totalProducts}</td>
                  <td>${segment.stages.length}</td>
                  <td>${segment.stages.join(', ')}</td>
                  <td>${segment.yearRange}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="metadata">
          <strong>Metadata:</strong><br>
          Total Produk: ${data.metadata.totalProducts} | 
          Rentang Data: ${data.metadata.dateRange} | 
          Total Segmen: ${data.summaryBySegment.length} | 
          Total Tahun: ${data.summaryByYear.length}
        </div>

        <script>
          const ctx = document.getElementById('timelineChart').getContext('2d');
          const chartData = ${JSON.stringify(chartData)};
          
          new Chart(ctx, {
            type: 'scatter',
            data: chartData,
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Timeline Siklus Hidup Produk'
                },
                legend: {
                  display: true,
                  position: 'bottom'
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
                  min: 1,
                  max: 12,
                  ticks: {
                    stepSize: 1,
                    callback: function(value) {
                      const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
                                    'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
                      // Bulatkan nilai untuk menghilangkan desimal dari jitter
                      const roundedValue = Math.round(value);
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
                      return Math.round(value);
                    }
                  }
                }
              }
            }
          });
        </script>
      </body>
      </html>
    `;
  }

  private static prepareChartData(data: TimelineExportData) {
    const segmentColors: Record<string, string> = {
      'Pembangunan': '#06B6D4',
      'Transmisi': '#10B981', 
      'Distribusi': '#F59E0B',
      'Korporat': '#8B5CF6',
      'Pelayanan Pelanggan': '#EF4444'
    };

    const datasets = data.summaryBySegment.map(segment => {
      const segmentProducts = data.products.filter(p => p.segmen === segment.segmen);
      
      const chartData = segmentProducts.map(product => {
        const date = new Date(product.stage_date);
        
        // Add jitter untuk menyebarkan titik yang bertumpuk (sama seperti di API timeline)
        const monthJitter = (Math.random() - 0.5) * 1.0;  // ±0.5
        const yearJitter = (Math.random() - 0.5) * 0.6;   // ±0.3
        
        return {
          x: (date.getMonth() + 1) + monthJitter,  // Bulan + jitter
          y: date.getFullYear() + yearJitter       // Tahun + jitter
        };
      });

      return {
        label: segment.segmen,
        data: chartData,
        backgroundColor: segmentColors[segment.segmen] || '#6B7280',
        borderColor: segmentColors[segment.segmen] || '#6B7280',
        pointRadius: 6,
        pointHoverRadius: 8
      };
    });

    return { datasets };
  }
}