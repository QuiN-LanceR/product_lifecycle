import { NextResponse } from 'next/server';
import { getPool } from '@/lib/database';

export async function GET() {
  try {
    const query = `
      SELECT 
        p.id,
        p.produk as name,
        s.stage,
        seg.segmen as segment,
        p.created_at
      FROM tbl_produk p
      LEFT JOIN tbl_stage s ON p.id_stage = s.id
      LEFT JOIN tbl_segmen seg ON p.id_segmen = seg.id
      ORDER BY p.created_at DESC
    `;

    const result = await getPool().query(query);
    const totalProducts = result.rows.length;

    return NextResponse.json({
      success: true,
      total: totalProducts,
      products: result.rows
    });

  } catch (error) {
    console.error('Error fetching all products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}