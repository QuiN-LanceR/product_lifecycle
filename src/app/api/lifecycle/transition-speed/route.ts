import { NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function GET() {
  const client = await getPool().connect();
  try {
    // Query untuk menghitung rata-rata waktu produk di setiap stage
    // Asumsi: ada kolom created_at dan updated_at di tbl_produk
    // atau ada tabel history untuk tracking perubahan stage
    const speedQuery = `
        WITH stage_durations AS (
            SELECT 
                st.stage,
                p.id as product_id,
                p.created_at,
                p.updated_at,
                EXTRACT(EPOCH FROM (p.updated_at - p.created_at)) / 86400 as days_in_stage
            FROM public.tbl_produk p
            JOIN public.tbl_stage st ON p.id_stage = st.id
            WHERE p.created_at IS NOT NULL AND p.updated_at IS NOT NULL
        )
        SELECT 
            stage,
            COUNT(*) as product_count,
            ROUND(AVG(days_in_stage)::numeric, 1) as average_days
        FROM stage_durations
        GROUP BY stage
        ORDER BY 
            CASE stage
                WHEN 'Introduction' THEN 1
                WHEN 'Growth' THEN 2
                WHEN 'Maturity' THEN 3
                WHEN 'Decline' THEN 4
                ELSE 5
            END
    `;

    const result = await client.query(speedQuery);
    
    // Format data untuk response
    const speedData = result.rows.map(row => ({
      stage: row.stage,
      averageDays: parseFloat(row.average_days) || 0,
      productCount: parseInt(row.product_count, 10)
    }));

    // Jika tidak ada data, berikan data default
    if (speedData.length === 0) {
      const defaultData = [
        { stage: 'Introduction', averageDays: 45, productCount: 0 },
        { stage: 'Growth', averageDays: 120, productCount: 0 },
        { stage: 'Maturity', averageDays: 365, productCount: 0 },
        { stage: 'Decline', averageDays: 180, productCount: 0 }
      ];
      
      return NextResponse.json({
        success: true,
        data: defaultData
      });
    }

    return NextResponse.json({
      success: true,
      data: speedData
    });

  } catch (error) {
    console.error("Error fetching transition speed data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch transition speed data",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}