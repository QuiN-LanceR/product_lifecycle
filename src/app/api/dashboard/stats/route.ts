import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  const client = await pool.connect();
  try {
    // Query untuk menghitung produk berdasarkan stage
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
        ORDER BY st.stage
    `;

    const result = await client.query(statsQuery);
    
    // Query untuk total produk
    const totalQuery = `SELECT COUNT(*) as total FROM public.tbl_produk`;
    const totalResult = await client.query(totalQuery);
    
    // Inisialisasi stats dengan nilai default 0
    const stats = {
      introduction: 0,
      growth: 0,
      maturity: 0,
      decline: 0,
      total: parseInt(totalResult.rows[0].total, 10)
    };

    // Inisialisasi stages data untuk ikon
    const stages: Array<{
      id: string;
      stage: string;
      icon_light: string;
      icon_dark: string;
      count: number;
    }> = [];

    // Mapping hasil query ke stats object dan stages array
    result.rows.forEach(row => {
      const stageName = row.stage.toLowerCase();
      if (stats.hasOwnProperty(stageName)) {
        stats[stageName as keyof typeof stats] = parseInt(row.count, 10);
      }
      
      // Tambahkan data stage untuk ikon
      stages.push({
        id: row.id,
        stage: row.stage,
        icon_light: row.icon_light,
        icon_dark: row.icon_dark,
        count: parseInt(row.count, 10)
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        stats,
        stages
      }
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard statistics",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}