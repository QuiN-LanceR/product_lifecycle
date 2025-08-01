import { NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function GET() {
  const client = await getPool().connect(); 
  try {
    // Query untuk menghitung produk berdasarkan segmen
    const segmentsQuery = `
        SELECT 
            s.id,
            s.segmen as name,
            s.icon_light,
            s.icon_dark,
            COUNT(p.id) as product_count
        FROM public.tbl_segmen s
        LEFT JOIN public.tbl_produk p ON s.id = p.id_segmen
        GROUP BY s.id, s.segmen, s.icon_light, s.icon_dark
        ORDER BY s.segmen
    `;

    const result = await client.query(segmentsQuery);
    
    const segments = result.rows.map(row => {
      return {
        id: row.id,
        name: row.name,
        productCount: parseInt(row.product_count, 10),
        icon_light: row.icon_light,
        icon_dark: row.icon_dark,
      };
    });

    return NextResponse.json({
      success: true,
      data: segments
    });

  } catch (error) {
    console.error("Error fetching segments data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch segments data",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}