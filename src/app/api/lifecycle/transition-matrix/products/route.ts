import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stage = searchParams.get('stage');
  const segment = searchParams.get('segment');

  if (!stage || !segment) {
    return NextResponse.json(
      { success: false, error: 'Stage and segment parameters are required' },
      { status: 400 }
    );
  }

  const client = await getPool().connect();
  try {
    const query = `
      SELECT 
        p.id,
        p.produk as name,
        p.harga,
        p.created_at,
        st.stage,
        seg.segmen as segment,
        k.kategori as category
      FROM public.tbl_produk p
      JOIN public.tbl_stage st ON p.id_stage = st.id
      JOIN public.tbl_segmen seg ON p.id_segmen = seg.id
      LEFT JOIN public.tbl_kategori k ON p.id_kategori = k.id
      WHERE st.stage = $1 AND seg.segmen = $2
      ORDER BY p.created_at DESC
    `;

    const result = await client.query(query, [stage, segment]);
    
    return NextResponse.json({
      success: true,
      data: {
        stage,
        segment,
        count: result.rows.length,
        products: result.rows.map(row => ({
          id: row.id,
          name: row.name,
          price: row.harga,
          category: row.category || 'Tidak ada kategori',
          createdAt: row.created_at
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching products by stage and segment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}