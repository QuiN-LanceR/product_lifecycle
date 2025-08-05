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
      if (value <= 9) return '#a7f3d0'; // bg-cyan-300
      return '#06b6d4'; // bg-cyan-500
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
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #ffffff;
                color: #333;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 20px;
            }
            .header h1 {
                color: #1f2937;
                font-size: 28px;
                margin: 0 0 10px 0;
                font-weight: 600;
            }
            .header p {
                color: #6b7280;
                font-size: 14px;
                margin: 5px 0;
            }
            .filter-info {
                background-color: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 25px;
            }
            .filter-info h3 {
                margin: 0 0 10px 0;
                color: #374151;
                font-size: 16px;
            }
            .filter-item {
                display: inline-block;
                margin-right: 20px;
                font-size: 14px;
                color: #6b7280;
            }
            .filter-item strong {
                color: #374151;
            }
            .matrix-container {
                overflow-x: auto;
                margin-bottom: 25px;
            }
            .matrix-table {
                width: 100%;
                border-collapse: collapse;
                background-color: white;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                border-radius: 8px;
                overflow: hidden;
            }
            .matrix-table th {
                background-color: #f3f4f6;
                color: #374151;
                font-weight: 600;
                padding: 12px 8px;
                text-align: center;
                border-bottom: 2px solid #e5e7eb;
                font-size: 12px;
            }
            .matrix-table th:first-child {
                text-align: left;
                background-color: #f9fafb;
            }
            .matrix-table td {
                padding: 4px;
                text-align: center;
                border-bottom: 1px solid #f3f4f6;
            }
            .matrix-table td:first-child {
                text-align: left;
                padding: 12px 8px;
                font-weight: 500;
                color: #374151;
                background-color: #f9fafb;
                border-right: 1px solid #e5e7eb;
                font-size: 12px;
            }
            .matrix-cell {
                width: 60px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                font-weight: bold;
                font-size: 12px;
                margin: 0 auto;
                border: 1px solid #e5e7eb;
            }
            .legend {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin-top: 20px;
                padding: 15px;
                background-color: #f9fafb;
                border-radius: 8px;
            }
            .legend-item {
                width: 20px;
                height: 20px;
                border: 1px solid #e5e7eb;
                border-radius: 3px;
            }
            .legend-label {
                font-size: 12px;
                color: #6b7280;
                margin: 0 5px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 12px;
            }
            @media print {
                body { margin: 0; }
                .header { page-break-after: avoid; }
                .matrix-table { page-break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Transition Matrix Report</h1>
            <p>Visualization of product transitions between lifecycle stages vs segmentation</p>
            <p>Generated on ${new Date().toLocaleString('id-ID')}</p>
        </div>
        
        <div class="filter-info">
            <h3>Filter Information</h3>
            <div class="filter-item"><strong>Segment:</strong> ${selectedSegment}</div>
            <div class="filter-item"><strong>Stage:</strong> ${selectedStage}</div>
        </div>
        
        <div class="matrix-container">
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
        
        <div class="legend">
            <span class="legend-label">0</span>
            <div class="legend-item" style="background-color: #f3f4f6;"></div>
            <div class="legend-item" style="background-color: #ecfeff;"></div>
            <div class="legend-item" style="background-color: #cffafe;"></div>
            <div class="legend-item" style="background-color: #a7f3d0;"></div>
            <div class="legend-item" style="background-color: #67e8f9;"></div>
            <div class="legend-item" style="background-color: #06b6d4;"></div>
            <span class="legend-label">9+</span>
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