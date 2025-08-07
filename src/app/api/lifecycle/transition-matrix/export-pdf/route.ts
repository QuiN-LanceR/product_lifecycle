import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const selectedSegment = searchParams.get('segment') || 'Semua Segmen';
  const selectedStage = searchParams.get('stage') || 'Semua Tahap';

  const client = await getPool().connect();
  try {
    // Query untuk mendapatkan data stages
    const stagesQuery = `
      SELECT stage 
      FROM public.tbl_stage 
      ORDER BY 
        CASE stage 
          WHEN 'Introduction' THEN 1
          WHEN 'Growth' THEN 2
          WHEN 'Maturity' THEN 3
          WHEN 'Decline' THEN 4
          ELSE 5
        END
    `;
    
    // Query untuk mendapatkan data segments
    const segmentsQuery = `
      SELECT segmen 
      FROM public.tbl_segmen 
      ORDER BY segmen
    `;
    
    // Query untuk mendapatkan matrix data dengan filter
    let matrixQuery = `
      SELECT 
        st.stage,
        sg.segmen,
        COUNT(p.id) as count
      FROM public.tbl_stage st
      CROSS JOIN public.tbl_segmen sg
      LEFT JOIN public.tbl_produk p ON st.id = p.id_stage AND sg.id = p.id_segmen
    `;
    
    const queryParams: string[] = [];
    let paramIndex = 1;
    
    if (selectedSegment !== 'Semua Segmen') {
      matrixQuery += ` WHERE sg.segmen = $${paramIndex}`;
      queryParams.push(selectedSegment);
      paramIndex++;
    }
    
    if (selectedStage !== 'Semua Tahap') {
      matrixQuery += selectedSegment !== 'Semua Segmen' ? ' AND' : ' WHERE';
      matrixQuery += ` st.stage = $${paramIndex}`;
      queryParams.push(selectedStage);
    }
    
    matrixQuery += `
      GROUP BY st.id, st.stage, sg.id, sg.segmen
      ORDER BY 
        CASE st.stage 
          WHEN 'Introduction' THEN 1
          WHEN 'Growth' THEN 2
          WHEN 'Maturity' THEN 3
          WHEN 'Decline' THEN 4
          ELSE 5
        END,
        sg.segmen
    `;

    const [stagesResult, segmentsResult, matrixResult] = await Promise.all([
      client.query(stagesQuery),
      client.query(segmentsQuery),
      client.query(matrixQuery, queryParams)
    ]);
    
    let stages = stagesResult.rows.map(row => row.stage);
    let segments = segmentsResult.rows.map(row => row.segmen);
    
    // Filter stages dan segments jika ada filter
    if (selectedStage !== 'Semua Tahap') {
      stages = stages.filter(stage => stage === selectedStage);
    }
    if (selectedSegment !== 'Semua Segmen') {
      segments = segments.filter(segment => segment === selectedSegment);
    }
    
    // Membuat matrix data
    const matrixData: number[][] = [];
    
    stages.forEach((stage, stageIndex) => {
      matrixData[stageIndex] = [];
      segments.forEach((segment, segmentIndex) => {
        const matrixRow = matrixResult.rows.find(
          row => row.stage === stage && row.segmen === segment
        );
        matrixData[stageIndex][segmentIndex] = matrixRow ? parseInt(matrixRow.count) : 0;
      });
    });
    
    // Fungsi untuk mendapatkan warna background berdasarkan nilai
    const getIntensityColor = (value: number): string => {
      if (value === 0) return '#f3f4f6'; // bg-gray-100
      if (value <= 2) return '#ecfeff'; // bg-cyan-100
      if (value <= 5) return '#cffafe'; // bg-cyan-200
      if (value <= 9) return '#67e8f9'; // bg-cyan-300
      return '#22d3ee'; // bg-cyan-400
    };
    
    // Fungsi untuk mendapatkan warna teks berdasarkan nilai
    const getTextColor = (value: number): string => {
      if (value === 0) return '#6b7280'; // text-gray-500
      if (value <= 5) return '#374151'; // text-gray-700
      return '#ffffff'; // text-white
    };

    // Generate HTML untuk PDF
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Transition Matrix Report</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #ffffff;
                color: #333;
                line-height: 1.6;
                padding: 20px;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            .header {
                text-align: center;
                margin-bottom: 40px;
                padding: 30px;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                border-radius: 16px;
                border: 1px solid #e2e8f0;
            }
            .header h1 {
                color: #1e293b;
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 8px;
            }
            .header .subtitle {
                color: #64748b;
                font-size: 16px;
                margin-bottom: 12px;
            }
            .header .timestamp {
                color: #94a3b8;
                font-size: 14px;
            }
            .filter-section {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 30px;
            }
            .filter-section h3 {
                color: #374151;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 12px;
            }
            .filter-item {
                display: inline-block;
                margin-right: 24px;
                font-size: 14px;
                color: #6b7280;
            }
            .filter-item strong {
                color: #374151;
                font-weight: 600;
            }
            .matrix-wrapper {
                background-color: #ffffff;
                border-radius: 16px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                border: 1px solid #e5e7eb;
                overflow: hidden;
                margin-bottom: 30px;
            }
            .matrix-table {
                width: 100%;
                border-collapse: collapse;
            }
            .matrix-table th {
                background-color: #f9fafb;
                color: #374151;
                font-weight: 600;
                padding: 16px 12px;
                text-align: center;
                border-bottom: 2px solid #e5e7eb;
                font-size: 14px;
            }
            .matrix-table th:first-child {
                text-align: left;
                background-color: #f3f4f6;
                border-right: 1px solid #e5e7eb;
            }
            .matrix-table td {
                padding: 8px;
                text-align: center;
                border-bottom: 1px solid #f3f4f6;
            }
            .matrix-table td:first-child {
                text-align: left;
                padding: 16px 12px;
                font-weight: 600;
                color: #374151;
                background-color: #f9fafb;
                border-right: 1px solid #e5e7eb;
                font-size: 14px;
            }
            .matrix-cell {
                width: 160px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                font-weight: 700;
                font-size: 14px;
                margin: 0 auto;
                border: 1px solid #e5e7eb;
                transition: all 0.2s ease;
            }
            .legend-section {
                background-color: #f8fafc;
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                border: 1px solid #e2e8f0;
            }
            .legend-title {
                font-size: 16px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 16px;
            }
            .legend-container {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            .legend-item {
                width: 24px;
                height: 24px;
                border: 1px solid #d1d5db;
                border-radius: 4px;
            }
            .legend-label {
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
            }
            .summary-section {
                margin-top: 30px;
                padding: 20px;
                background-color: #f8fafc;
                border-radius: 12px;
                border: 1px solid #e2e8f0;
            }
            .summary-title {
                font-size: 18px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 12px;
            }
            .summary-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
            }
            .stat-item {
                background-color: #ffffff;
                padding: 16px;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
                text-align: center;
            }
            .stat-value {
                font-size: 24px;
                font-weight: 700;
                color: #1e293b;
            }
            .stat-label {
                font-size: 14px;
                color: #64748b;
                margin-top: 4px;
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
                body { margin: 0; padding: 15px; }
                .header { page-break-after: avoid; }
                .matrix-wrapper { page-break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Transition Matrix Report</h1>
                <p class="subtitle">Visualization of product transitions between lifecycle stages vs segmentation</p>
                <p class="timestamp">Generated on ${new Date().toLocaleString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
            </div>
            
            <div class="filter-section">
                <h3>Filter Information</h3>
                <div class="filter-item"><strong>Segment:</strong> ${selectedSegment}</div>
                <div class="filter-item"><strong>Stage:</strong> ${selectedStage}</div>
            </div>
            
            <div class="matrix-wrapper">
                <table class="matrix-table">
                    <thead>
                        <tr>
                            <th>Stage / Segment</th>
                            ${segments.map(segment => `<th>${segment}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${stages.map((stage, stageIndex) => `
                            <tr>
                                <td>${stage}</td>
                                ${segments.map((segment, segmentIndex) => {
                                  const value = matrixData[stageIndex][segmentIndex];
                                  const bgColor = getIntensityColor(value);
                                  const textColor = getTextColor(value);
                                  return `
                                    <td>
                                        <div class="matrix-cell" style="background-color: ${bgColor}; color: ${textColor};">
                                            ${value}
                                        </div>
                                    </td>
                                  `;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="legend-section">
                <div class="legend-title">Color Scale Legend</div>
                <div class="legend-container">
                    <span class="legend-label">0</span>
                    <div class="legend-item" style="background-color: #f3f4f6;"></div>
                    <div class="legend-item" style="background-color: #ecfeff;"></div>
                    <div class="legend-item" style="background-color: #cffafe;"></div>
                    <div class="legend-item" style="background-color: #67e8f9;"></div>
                    <div class="legend-item" style="background-color: #22d3ee;"></div>
                    <span class="legend-label">9+</span>
                </div>
            </div>
            
            <div class="summary-section">
                <div class="summary-title">Summary Statistics</div>
                <div class="summary-stats">
                    <div class="stat-item">
                        <div class="stat-value">${matrixData.flat().reduce((sum, val) => sum + val, 0)}</div>
                        <div class="stat-label">Total Products</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${stages.length}</div>
                        <div class="stat-label">Lifecycle Stages</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${segments.length}</div>
                        <div class="stat-label">Market Segments</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${matrixData.flat().filter(val => val > 0).length}</div>
                        <div class="stat-label">Active Combinations</div>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p>Product Lifecycle Management System - Transition Matrix Report</p>
                <p>This report shows the distribution of products across different lifecycle stages and market segments.</p>
            </div>
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
      landscape: segments.length > 4, // Landscape jika banyak kolom
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true, // Penting untuk mempertahankan warna background
      preferCSSPageSize: true
    });
    
    await browser.close();
    
    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = `transition-matrix-${timestamp}.pdf`;
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });
    
  } catch (error) {
    console.error('Error exporting transition matrix to PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export transition matrix to PDF' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}