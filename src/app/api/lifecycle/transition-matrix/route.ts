import { NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function GET() {
  const client = await getPool().connect();
  try {
    // Query untuk mendapatkan data stages
    const stagesQuery = `
      SELECT id, stage 
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
      SELECT id, segmen 
      FROM public.tbl_segmen 
      ORDER BY segmen
    `;
    
    // Query untuk mendapatkan matrix data (count produk berdasarkan stage dan segmen)
    const matrixQuery = `
      SELECT 
        st.stage,
        sg.segmen,
        COUNT(p.id) as count
      FROM public.tbl_stage st
      CROSS JOIN public.tbl_segmen sg
      LEFT JOIN public.tbl_produk p ON st.id = p.id_stage AND sg.id = p.id_segmen
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
      client.query(matrixQuery)
    ]);
    
    const stages = stagesResult.rows.map(row => row.stage);
    const segments = segmentsResult.rows.map(row => row.segmen);
    
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
    
    return NextResponse.json({
      success: true,
      data: {
        stages,
        segments,
        matrixData,
        lastUpdated: new Date().toLocaleString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      }
    });
    
  } catch (error) {
    console.error('Error fetching transition matrix data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transition matrix data' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}