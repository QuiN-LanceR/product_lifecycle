import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';

// GET - Fetch master dev history list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const offset = (page - 1) * limit;

    let whereClause = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryParams: any[] = [limit, offset];
    let paramIndex = 3;

    if (search) {
      whereClause = `WHERE (p.produk ILIKE $${paramIndex} OR dh.tipe_pekerjaan ILIKE $${paramIndex} OR dh.version ILIKE $${paramIndex} OR dh.deskripsi ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const query = `
      SELECT 
        dh.id,
        dh.id_produk,
        p.produk as nama_produk,
        dh.tipe_pekerjaan,
        dh.tanggal_mulai,
        dh.tanggal_akhir,
        dh.version,
        dh.deskripsi,
        dh.status,
        dh.created_at,
        dh.updated_at
      FROM tbl_produk_dev_histori dh
      LEFT JOIN tbl_produk p ON dh.id_produk = p.id
      ${whereClause}
      ORDER BY dh.${sortBy} ${sortOrder}
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM tbl_produk_dev_histori dh
      LEFT JOIN tbl_produk p ON dh.id_produk = p.id
      ${whereClause}
    `;

    const [dataResult, countResult] = await Promise.all([
      getPool().query(query, queryParams),
      getPool().query(countQuery, queryParams.slice(2))
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      devHistoris: dataResult.rows,
      total,
      perPage: limit,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching master dev history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dev history' },
      { status: 500 }
    );
  }
}