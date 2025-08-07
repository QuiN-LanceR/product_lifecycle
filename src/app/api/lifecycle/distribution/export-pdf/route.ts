/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    // Query yang sama dengan endpoint stats
    const statsQuery = `
        SELECT 
            st.id,
            st.stage,
            st.icon_light,
            st.icon_dark,
            COUNT(p.id) as count
        FROM public.tbl_stage st
        LEFT JOIN public.tbl_produk p ON st.id = p.id_stage
        GROUP BY st.id, st.stage, st.icon_light, st.icon_dark
        ORDER BY st.id
    `;

    const result = await client.query(statsQuery);
    
    // Query untuk total produk
    const totalQuery = `SELECT COUNT(*) as total FROM public.tbl_produk`;
    const totalResult = await client.query(totalQuery);
    
    const stages = result.rows.map(row => ({
      id: row.id,
      stage: row.stage,
      icon_light: row.icon_light,
      icon_dark: row.icon_dark,
      count: parseInt(row.count, 10)
    }));
    
    const totalProducts = parseInt(totalResult.rows[0].total, 10);
    
    // Warna yang sama dengan useChartConfig (mode light)
    const colors = ['#60A5FA', '#34D399', '#FBBF24', '#F87171'];
    
    // Generate SVG doughnut chart yang lebih akurat
    const generateDoughnutSVG = (data: any[], colors: string[]) => {
      const size = 400;
      const center = size / 2;
      const outerRadius = 140;
      const innerRadius = 84; // 60% cutout seperti di chart asli
      const total = data.reduce((sum, item) => sum + item.count, 0);
      
      if (total === 0) {
        return {
          svg: `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
              <circle cx="${center}" cy="${center}" r="${outerRadius}" fill="#F3F4F6" stroke="#E5E7EB" stroke-width="2"/>
              <circle cx="${center}" cy="${center}" r="${innerRadius}" fill="white"/>
              <text x="${center}" y="${center - 10}" text-anchor="middle" dominant-baseline="middle" font-weight="bold" font-size="16" fill="#6B7280">Total</text>
              <text x="${center}" y="${center + 15}" text-anchor="middle" dominant-baseline="middle" font-weight="bold" font-size="20" fill="#6B7280">0</text>
            </svg>
          `,
          legends: '<div style="color: #6B7280; font-style: italic;">No data available</div>'
        };
      }
      
      let currentAngle = -Math.PI / 2; // Start from top
      let paths = '';
      let legends = '';
      
      data.forEach((item, index) => {
        if (item.count === 0) return;
        
        const percentage = (item.count / total) * 100;
        const angle = (item.count / total) * 2 * Math.PI;
        const endAngle = currentAngle + angle;
        
        // Calculate path for arc
        const x1 = center + outerRadius * Math.cos(currentAngle);
        const y1 = center + outerRadius * Math.sin(currentAngle);
        const x2 = center + outerRadius * Math.cos(endAngle);
        const y2 = center + outerRadius * Math.sin(endAngle);
        const x3 = center + innerRadius * Math.cos(endAngle);
        const y3 = center + innerRadius * Math.sin(endAngle);
        const x4 = center + innerRadius * Math.cos(currentAngle);
        const y4 = center + innerRadius * Math.sin(currentAngle);
        
        const largeArcFlag = angle > Math.PI ? 1 : 0;
        
        const pathData = [
          `M ${x1} ${y1}`,
          `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          `L ${x3} ${y3}`,
          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
          'Z'
        ].join(' ');
        
        const color = colors[index % colors.length];
        paths += `<path d="${pathData}" fill="${color}" stroke="#ffffff" stroke-width="2"/>`;
        
        // Add percentage text if > 5% (sama seperti di chart asli)
        if (percentage > 5) {
          const textAngle = currentAngle + angle / 2;
          const textRadius = (outerRadius + innerRadius) / 2;
          const textX = center + textRadius * Math.cos(textAngle);
          const textY = center + textRadius * Math.sin(textAngle);
          
          paths += `
            <text x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="middle" 
                  fill="white" font-weight="bold" font-size="14" 
                  stroke="#374151" stroke-width="0.5">
              ${percentage.toFixed(1)}%
            </text>
          `;
        }
        
        // Generate legend dengan format yang sama
        legends += `
          <div style="display: flex; align-items: center; margin-bottom: 12px; font-size: 14px;">
            <div style="width: 16px; height: 16px; background-color: ${color}; margin-right: 12px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"></div>
            <span style="color: #374151; font-weight: 500;">${item.stage}: ${item.count} produk (${percentage.toFixed(1)}%)</span>
          </div>
        `;
        
        currentAngle = endAngle;
      });
      
      return {
        svg: `
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            ${paths}
            <!-- Center label -->
            <text x="${center}" y="${center - 12}" text-anchor="middle" dominant-baseline="middle" 
                  font-weight="bold" font-size="16" fill="#374151">Total</text>
            <text x="${center}" y="${center + 8}" text-anchor="middle" dominant-baseline="middle" 
                  font-weight="bold" font-size="20" fill="#374151">${total}</text>
          </svg>
        `,
        legends
      };
    };
    
    const { svg, legends } = generateDoughnutSVG(stages, colors);
    
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Product Distribution Report</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #fff;
                padding: 20px;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e5e7eb;
            }
            .header h1 {
                font-size: 28px;
                color: #1f2937;
                margin-bottom: 10px;
                font-weight: 700;
            }
            .header p {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 5px;
            }
            .chart-container {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin: 40px 0;
                gap: 40px;
            }
            .chart-wrapper {
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .legend-wrapper {
                flex: 1;
                padding-left: 20px;
                padding-top: 40px;
            }
            .legend-title {
                font-size: 18px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 20px;
            }
            .summary {
                background-color: #f9fafb;
                padding: 20px;
                border-radius: 8px;
                margin-top: 30px;
            }
            .summary h3 {
                font-size: 18px;
                color: #374151;
                margin-bottom: 15px;
            }
            .summary-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
            }
            .summary-item {
                background-color: white;
                padding: 15px;
                border-radius: 6px;
                border: 1px solid #e5e7eb;
            }
            .summary-item strong {
                color: #1f2937;
                font-size: 16px;
            }
            .total-summary {
                background-color: #3b82f6;
                color: white;
                text-align: center;
                padding: 20px;
                border-radius: 8px;
                margin-top: 15px;
            }
            .total-summary strong {
                font-size: 24px;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 12px;
            }
            @media print {
                body { margin: 0; }
                .header { page-break-after: avoid; }
                .chart-container { page-break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Product Distribution Report</h1>
            <p>Distribution of products across lifecycle stages</p>
            <p>Generated on ${new Date().toLocaleString('id-ID')}</p>
        </div>
        
        <div class="chart-container">
            <div class="chart-wrapper">
                ${svg}
            </div>
            <div class="legend-wrapper">
                <h3 class="legend-title">Stage Distribution</h3>
                ${legends}
            </div>
        </div>
        
        <div class="summary">
            <h3>Summary Statistics</h3>
            <div class="summary-grid">
                ${stages.map(stage => `
                    <div class="summary-item">
                        <strong>${stage.stage}:</strong> ${stage.count} products ${totalProducts > 0 ? `(${((stage.count / totalProducts) * 100).toFixed(1)}%)` : ''}
                    </div>
                `).join('')}
            </div>
            <div class="total-summary">
                <strong>Total Products: ${totalProducts}</strong>
            </div>
        </div>
        
        <div class="footer">
            <p>Product Lifecycle Management System - Generated automatically</p>
        </div>
    </body>
    </html>
    `;
    
    // Generate PDF menggunakan Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: false,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true,
      preferCSSPageSize: true
    });
    
    await browser.close();
    
    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = `product-distribution-${timestamp}.pdf`;
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });
    
  } catch (error) {
    console.error('Error exporting product distribution to PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export product distribution to PDF' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}