/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { getPool } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const pool = getPool();

    // Query data sesuai dengan struktur tabel yang benar
    const distributionResult = await pool.query(`
      SELECT 
        s.stage,
        COUNT(p.id) as count
      FROM tbl_stage s
      LEFT JOIN tbl_produk p ON p.id_stage = s.id
      GROUP BY s.id, s.stage
      ORDER BY s.id
    `);
    const distributionData = distributionResult.rows;

    const matrixResult = await pool.query(`
      SELECT 
        s1.stage as from_stage,
        s2.stage as to_stage,
        COUNT(p.id) as count
      FROM tbl_stage s1
      CROSS JOIN tbl_stage s2
      LEFT JOIN tbl_produk p ON p.id_stage = s2.id
      WHERE s1.id != s2.id
      GROUP BY s1.id, s1.stage, s2.id, s2.stage
      ORDER BY s1.id, s2.id
    `);
    const matrixData = matrixResult.rows;

    // Query untuk timeline berdasarkan created_at produk
    const timelineResult = await pool.query(`
      SELECT 
        p.produk as nama_produk,
        s.stage,
        seg.segmen,
        p.created_at
      FROM tbl_produk p
      JOIN tbl_stage s ON p.id_stage = s.id
      JOIN tbl_segmen seg ON p.id_segmen = seg.id
      ORDER BY p.created_at DESC
      LIMIT 20
    `);
    const timelineData = timelineResult.rows;

    // Hitung total produk
    const totalProducts = distributionData.reduce((sum: any, item: any) => sum + parseInt(item.count), 0);

    // Buat stages untuk matrix
    const allStages = [...new Set([
      ...matrixData.map((item: any) => item.from_stage),
      ...matrixData.map((item: any) => item.to_stage)
    ])];

    // HTML sederhana
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Product Lifecycle Dashboard</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                color: #333;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #ddd;
                padding-bottom: 20px;
            }
            .section {
                margin-bottom: 40px;
                page-break-inside: avoid;
            }
            .section-title {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 15px;
                color: #2563eb;
            }
            .grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
            }
            .distribution-item {
                display: flex;
                justify-content: space-between;
                padding: 10px;
                margin: 5px 0;
                background: #f8f9fa;
                border-radius: 5px;
                border-left: 4px solid #2563eb;
            }
            .matrix-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
            }
            .matrix-table th,
            .matrix-table td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: center;
            }
            .matrix-table th {
                background: #f1f5f9;
                font-weight: bold;
            }
            .matrix-cell {
                font-weight: bold;
            }
            .total-box {
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
                margin-top: 20px;
            }
            .timeline-item {
                display: flex;
                justify-content: space-between;
                padding: 8px;
                margin: 3px 0;
                background: #f8f9fa;
                border-radius: 3px;
                font-size: 14px;
            }
            .timeline-full {
                grid-column: 1 / -1;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Product Lifecycle Dashboard</h1>
            <p>Comprehensive analysis of product lifecycle stages and transitions</p>
            <p>Generated on: ${new Date().toLocaleDateString('id-ID', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</p>
        </div>

        <div class="grid">
            <div class="section">
                <div class="section-title">Product Distribution</div>
                ${distributionData.map((item: any) => {
                    const percentage = totalProducts > 0 ? ((parseInt(item.count) / totalProducts) * 100).toFixed(1) : '0';
                    return `
                        <div class="distribution-item">
                            <span>${item.stage}</span>
                            <span><strong>${item.count}</strong> (${percentage}%)</span>
                        </div>
                    `;
                }).join('')}
                <div class="total-box">Total Products: ${totalProducts}</div>
            </div>

            <div class="section">
                <div class="section-title">Transition Matrix</div>
                <table class="matrix-table">
                    <thead>
                        <tr>
                            <th>From \\ To</th>
                            ${allStages.map((stage: any) => `<th>${stage}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${allStages.map((fromStage: any) => {
                            return `
                                <tr>
                                    <th>${fromStage}</th>
                                    ${allStages.map((toStage: any) => {
                                        const transition = matrixData.find((item: any) => 
                                            item.from_stage === fromStage && item.to_stage === toStage
                                        );
                                        const count = transition ? transition.count : 0;
                                        const bgColor = count > 0 ? '#e0f2fe' : 'transparent';
                                        return `<td class="matrix-cell" style="background-color: ${bgColor}">${count}</td>`;
                                    }).join('')}
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>

            <div class="section timeline-full">
                <div class="section-title">Recent Product Timeline</div>
                ${timelineData.map((item: any) => {
                    const date = new Date(item.created_at).toLocaleDateString('id-ID');
                    return `
                        <div class="timeline-item">
                            <span><strong>${item.nama_produk}</strong> - ${item.stage}</span>
                            <span>${date} • ${item.segmen}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    </body>
    </html>
    `;

    // Generate PDF
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
        top: '15mm',
        right: '10mm',
        bottom: '15mm',
        left: '10mm'
      },
      printBackground: true
    });

    await browser.close();

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = `lifecycle-dashboard-${timestamp}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Error exporting PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export PDF' },
      { status: 500 }
    );
  }
}