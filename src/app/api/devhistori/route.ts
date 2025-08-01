import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';

// GET - Fetch all dev history with pagination and search
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

    const [result, countResult] = await Promise.all([
      getPool().query(query, queryParams),
      getPool().query(countQuery, search ? [`%${search}%`] : [])
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching dev history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dev history' },
      { status: 500 }
    );
  }
}

// POST - Create new dev history
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_produk, tipe_pekerjaan, tanggal_mulai, tanggal_akhir, version, deskripsi, status } = body;

    const query = `
      INSERT INTO tbl_produk_dev_histori 
      (id_produk, tipe_pekerjaan, tanggal_mulai, tanggal_akhir, version, deskripsi, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;

    const result = await getPool().query(query, [
      id_produk, tipe_pekerjaan, tanggal_mulai, tanggal_akhir, version, deskripsi, status
    ]);

    return NextResponse.json({
      success: true,
      message: 'Dev history created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating dev history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create dev history' },
      { status: 500 }
    );
  }
}