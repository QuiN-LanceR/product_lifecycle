import { NextResponse } from 'next/server';
import { getPool } from '@/lib/database';

export async function GET() {
  try {
    const query = `
      SELECT 
        id,
        produk as nama_produk
      FROM tbl_produk
      ORDER BY produk ASC
    `;

    const result = await getPool().query(query);

    return NextResponse.json({
      success: true,
      products: result.rows
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}