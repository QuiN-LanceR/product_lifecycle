import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Stage ID parameter is required' },
        { status: 400 }
      );
    }

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
      WHERE s.id = $1
      ORDER BY p.created_at DESC
    `;

    const result = await getPool().query(query, [id]);

    // Ambil nama stage untuk response
    const stageName = result.rows.length > 0 ? result.rows[0].stage : null;

    return NextResponse.json({
      success: true,
      stage: stageName,
      products: result.rows
    });

  } catch (error) {
    console.error('Error fetching products by stage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}