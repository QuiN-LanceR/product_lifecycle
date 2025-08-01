import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Segment ID is required' },
        { status: 400 }
      );
    }

    const client = await getPool().connect();
    
    try {
      // Get segment details
      const segmentQuery = `
        SELECT id, segmen as name 
        FROM tbl_segmen 
        WHERE id = $1
      `;
      const segmentResult = await client.query(segmentQuery, [id]);
      
      if (segmentResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Segment not found' },
          { status: 404 }
        );
      }

      // Get products in this segment
      const productsQuery = `
        SELECT 
          p.id,
          p.produk as name,
          s.stage as stage,
          seg.segmen as segment,
          p.created_at
        FROM tbl_produk p
        JOIN tbl_stage s ON p.id_stage = s.id
        JOIN tbl_segmen seg ON p.id_segmen = seg.id
        WHERE p.id_segmen = $1
        ORDER BY seg.id DESC
      `;
      const productsResult = await client.query(productsQuery, [id]);
      
      const segment = {
        id: segmentResult.rows[0].id,
        name: segmentResult.rows[0].name,
        totalProducts: productsResult.rows.length
      };

      return NextResponse.json({
        success: true,
        data: {
          segment,
          products: productsResult.rows
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching segment products:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}