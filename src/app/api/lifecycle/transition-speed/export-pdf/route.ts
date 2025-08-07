/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getPool } from '@/lib/database';
import puppeteer from 'puppeteer';

export async function POST(request: Request) {
  const { timeUnit = 'months', analysisType = 'duration' } = await request.json();
  
  const client = await getPool().connect();
  try {
    // Query yang sama dengan endpoint utama
    let query = '';
    
    if (analysisType === 'duration') {
      query = `
        WITH stage_order AS (
          SELECT 
            id,
            stage,
            CASE stage
              WHEN 'Introduction' THEN 1
              WHEN 'Growth' THEN 2
              WHEN 'Maturity' THEN 3
              WHEN 'Decline' THEN 4
              ELSE 5
            END as stage_order
          FROM public.tbl_stage
        ),
        transition_analysis AS (
          SELECT 
            p.id as product_id,
            p.produk as product_name,
            sg.segmen,
            sh.stage_previous,
            sh.stage_now,
            st_prev.stage as stage_previous_name,
            st_now.stage as stage_now_name,
            so_prev.stage_order as prev_order,
            so_now.stage_order as now_order,
            sh.tanggal_perubahan,
            CASE 
              WHEN LAG(sh.tanggal_perubahan) OVER (
                PARTITION BY p.id ORDER BY sh.tanggal_perubahan
              ) IS NOT NULL THEN
                EXTRACT(EPOCH FROM (
                  sh.tanggal_perubahan - LAG(sh.tanggal_perubahan) OVER (
                    PARTITION BY p.id ORDER BY sh.tanggal_perubahan
                  )
                )) / ${timeUnit === 'days' ? '86400' : '2592000'}
              ELSE 
                COALESCE(ist.interval ${timeUnit === 'days' ? '* 30' : ''}, ${timeUnit === 'days' ? '180' : '6'})
            END as actual_duration,
            COALESCE(ist.interval ${timeUnit === 'days' ? '* 30' : ''}, ${timeUnit === 'days' ? '180' : '6'}) as planned_duration,
            CASE 
              WHEN EXTRACT(EPOCH FROM (
                sh.tanggal_perubahan - LAG(sh.tanggal_perubahan) OVER (
                  PARTITION BY p.id ORDER BY sh.tanggal_perubahan
                )
              )) / ${timeUnit === 'days' ? '86400' : '2592000'} > 0 THEN
                ROUND(
                  (COALESCE(ist.interval ${timeUnit === 'days' ? '* 30' : ''}, ${timeUnit === 'days' ? '180' : '6'}) / 
                   (EXTRACT(EPOCH FROM (
                     sh.tanggal_perubahan - LAG(sh.tanggal_perubahan) OVER (
                       PARTITION BY p.id ORDER BY sh.tanggal_perubahan
                     )
                   )) / ${timeUnit === 'days' ? '86400' : '2592000'})) * 100, 2
                )
              ELSE 100
            END as efficiency_score
          FROM public.tbl_produk p
          JOIN public.tbl_segmen sg ON p.id_segmen = sg.id
          JOIN public.tbl_stage_histori sh ON p.id = sh.id_produk
          LEFT JOIN public.tbl_stage st_prev ON sh.stage_previous = st_prev.id
          LEFT JOIN public.tbl_stage st_now ON sh.stage_now = st_now.id
          LEFT JOIN stage_order so_prev ON sh.stage_previous = so_prev.id
          LEFT JOIN stage_order so_now ON sh.stage_now = so_now.id
          LEFT JOIN public.tbl_interval_stage ist ON (
            ist.id_produk = sh.id_produk AND 
            ist.id_stage = sh.stage_now
          )
          WHERE sh.stage_previous IS NOT NULL 
            AND sh.stage_now IS NOT NULL
            AND sh.tanggal_perubahan IS NOT NULL
            AND so_now.stage_order = so_prev.stage_order + 1
        ),
        transition_summary AS (
          SELECT 
            segmen,
            CONCAT(stage_previous_name, ' → ', stage_now_name) as transition_name,
            stage_previous_name,
            stage_now_name,
            now_order as target_stage_order,
            COUNT(*) as total_transitions,
            ROUND(AVG(actual_duration)::numeric, 1) as avg_actual_duration,
            ROUND(AVG(planned_duration)::numeric, 1) as avg_planned_duration,
            ROUND(AVG(efficiency_score)::numeric, 1) as avg_efficiency,
            ROUND(STDDEV(actual_duration)::numeric, 1) as duration_stddev,
            MIN(actual_duration) as min_duration,
            MAX(actual_duration) as max_duration,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY actual_duration) as median_duration
          FROM transition_analysis
          WHERE actual_duration IS NOT NULL
          GROUP BY segmen, stage_previous_name, stage_now_name, now_order
        )
        SELECT 
          segmen,
          transition_name,
          stage_previous_name,
          stage_now_name,
          target_stage_order,
          total_transitions,
          avg_actual_duration,
          avg_planned_duration,
          avg_efficiency,
          duration_stddev,
          min_duration,
          max_duration,
          median_duration
        FROM transition_summary
        ORDER BY segmen, target_stage_order
      `;
    }
    
    const result = await client.query(query);
    const segments = [...new Set(result.rows.map(row => row.segmen))];
    
    // Generate chart SVG untuk PDF
    const generateBarChartSVG = (data: any[]) => {
      const width = 800;
      const height = 400;
      const margin = { top: 40, right: 40, bottom: 80, left: 80 };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;
      
      const stages = ['Introduction', 'Growth', 'Maturity', 'Decline'];
      const stageColors = {
        'Introduction': '#3B82F6',
        'Growth': '#10B981', 
        'Maturity': '#F59E0B',
        'Decline': '#EF4444'
      };
      
      const maxValue = Math.max(...data.map(d => d.avg_actual_duration));
      const barWidth = chartWidth / (segments.length * stages.length + segments.length);
      
      let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
      
      // Background
      svg += `<rect width="${width}" height="${height}" fill="white"/>`;
      
      // Chart area
      svg += `<g transform="translate(${margin.left}, ${margin.top})">`;
      
      // Y-axis
      svg += `<line x1="0" y1="0" x2="0" y2="${chartHeight}" stroke="#e5e7eb" stroke-width="1"/>`;
      
      // X-axis
      svg += `<line x1="0" y1="${chartHeight}" x2="${chartWidth}" y2="${chartHeight}" stroke="#e5e7eb" stroke-width="1"/>`;
      
      // Y-axis labels
      for (let i = 0; i <= 5; i++) {
        const y = chartHeight - (i * chartHeight / 5);
        const value = (maxValue * i / 5).toFixed(0);
        svg += `<text x="-10" y="${y + 4}" text-anchor="end" font-size="12" fill="#6b7280">${value}</text>`;
        svg += `<line x1="0" y1="${y}" x2="${chartWidth}" y2="${y}" stroke="#f3f4f6" stroke-width="1"/>`;
      }
      
      // Bars
      segments.forEach((segment, segmentIndex) => {
        const segmentData = data.filter(d => d.segmen === segment);
        
        stages.forEach((stage, stageIndex) => {
          const stageData = segmentData.find(d => d.stage_previous_name === stage || d.stage_now_name === stage);
          const value = stageData ? stageData.avg_actual_duration : 0;
          
          const x = segmentIndex * (barWidth * stages.length + 20) + stageIndex * barWidth;
          const barHeight = (value / maxValue) * chartHeight;
          const y = chartHeight - barHeight;
          
          svg += `<rect x="${x}" y="${y}" width="${barWidth - 2}" height="${barHeight}" fill="${stageColors[stage as keyof typeof stageColors]}" opacity="0.8"/>`;
        });
        
        // Segment labels
        const labelX = segmentIndex * (barWidth * stages.length + 20) + (barWidth * stages.length) / 2;
        svg += `<text x="${labelX}" y="${chartHeight + 20}" text-anchor="middle" font-size="12" fill="#374151">${segment}</text>`;
      });
      
      svg += `</g>`;
      
      // Legend
      const legendY = height - 30;
      stages.forEach((stage, index) => {
        const legendX = margin.left + index * 120;
        svg += `<rect x="${legendX}" y="${legendY}" width="12" height="12" fill="${stageColors[stage as keyof typeof stageColors]}"/>`;
        svg += `<text x="${legendX + 18}" y="${legendY + 9}" font-size="12" fill="#374151">${stage}</text>`;
      });
      
      svg += `</svg>`;
      return svg;
    };
    
    const chartSVG = generateBarChartSVG(result.rows);
    
    // Generate HTML untuk PDF
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Transition Speed Analysis Report</title>
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
                text-align: center;
                margin: 40px 0;
            }
            .chart-title {
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 20px;
            }
            .summary-section {
                margin: 40px 0;
            }
            .summary-title {
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 20px;
                border-bottom: 2px solid #3b82f6;
                padding-bottom: 8px;
            }
            .summary-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .summary-item {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #3b82f6;
            }
            .summary-item h4 {
                font-size: 14px;
                color: #64748b;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .summary-item .value {
                font-size: 24px;
                font-weight: 700;
                color: #1e293b;
            }
            .data-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .data-table th {
                background: #f1f5f9;
                color: #475569;
                font-weight: 600;
                padding: 12px;
                text-align: left;
                border-bottom: 2px solid #e2e8f0;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .data-table td {
                padding: 12px;
                border-bottom: 1px solid #e2e8f0;
                font-size: 14px;
            }
            .data-table tr:hover {
                background: #f8fafc;
            }
            .efficiency-high { color: #059669; font-weight: 600; }
            .efficiency-medium { color: #d97706; font-weight: 600; }
            .efficiency-low { color: #dc2626; font-weight: 600; }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 12px;
            }
            @media print {
                body { margin: 0; padding: 15px; }
                .header { page-break-after: avoid; }
                .chart-container { page-break-inside: avoid; }
                .data-table { page-break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Transition Speed Analysis Report</h1>
            <p>Analysis of product lifecycle transition speeds and efficiency</p>
            <p>Time Unit: ${timeUnit === 'days' ? 'Days' : 'Months'} | Analysis Type: ${analysisType}</p>
            <p>Generated on ${new Date().toLocaleString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
        </div>
        
        <div class="chart-container">
            <div class="chart-title">Average Transition Duration by Segment and Stage</div>
            ${chartSVG}
        </div>
        
        <div class="summary-section">
            <h3 class="summary-title">Summary Statistics</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <h4>Total Segments</h4>
                    <div class="value">${segments.length}</div>
                </div>
                <div class="summary-item">
                    <h4>Total Transitions</h4>
                    <div class="value">${result.rows.reduce((sum, row) => sum + parseInt(row.total_transitions), 0)}</div>
                </div>
                <div class="summary-item">
                    <h4>Average Efficiency</h4>
                    <div class="value">${Math.round(result.rows.reduce((sum, row) => sum + parseFloat(row.avg_efficiency), 0) / result.rows.length)}%</div>
                </div>
                <div class="summary-item">
                    <h4>Analysis Type</h4>
                    <div class="value">${analysisType}</div>
                </div>
            </div>
        </div>
        
        <div class="summary-section">
            <h3 class="summary-title">Detailed Transition Data</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Segment</th>
                        <th>Transition</th>
                        <th>Total Transitions</th>
                        <th>Avg Actual Duration</th>
                        <th>Avg Planned Duration</th>
                        <th>Efficiency (%)</th>
                        <th>Min Duration</th>
                        <th>Max Duration</th>
                        <th>Median Duration</th>
                    </tr>
                </thead>
                <tbody>
                    ${result.rows.map(row => {
                      const efficiency = parseFloat(row.avg_efficiency);
                      const efficiencyClass = efficiency >= 80 ? 'efficiency-high' : 
                                             efficiency >= 60 ? 'efficiency-medium' : 'efficiency-low';
                      
                      return `
                        <tr>
                            <td>${row.segmen}</td>
                            <td>${row.transition_name}</td>
                            <td>${row.total_transitions}</td>
                            <td>${row.avg_actual_duration} ${timeUnit}</td>
                            <td>${row.avg_planned_duration} ${timeUnit}</td>
                            <td class="${efficiencyClass}">${row.avg_efficiency}%</td>
                            <td>${row.min_duration} ${timeUnit}</td>
                            <td>${row.max_duration} ${timeUnit}</td>
                            <td>${row.median_duration} ${timeUnit}</td>
                        </tr>
                      `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            <p>Product Lifecycle Management System - Transition Speed Analysis Report</p>
            <p>This report shows the analysis of transition speeds between lifecycle stages across different market segments.</p>
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
      landscape: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      printBackground: true
    });
    
    await browser.close();
    
    // Set headers untuk download
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="transition-speed-analysis-${new Date().toISOString().slice(0, 10)}.pdf"`);
    headers.set('Content-Type', 'application/pdf');
    
    return new NextResponse(pdfBuffer, { headers });
    
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate PDF",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}