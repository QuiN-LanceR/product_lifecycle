import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';

// GET - Fetch stage history with pagination and search
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
      whereClause = `WHERE (p.produk as nama_produk ILIKE $${paramIndex} OR sp.stage ILIKE $${paramIndex} OR sn.stage ILIKE $${paramIndex} OR sh.catatan ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const query = `
      SELECT 
        sh.id,
        sh.id_produk,
        p.produk as nama_produk,
        sh.stage_previous as stage_previous_id,
        sh.stage_now as stage_now_id,
        sp.stage as stage_previous_name,
        sn.stage as stage_now_name,
        sh.catatan,
        sh.created_at,
        sh.updated_at
      FROM tbl_stage_histori sh
      LEFT JOIN tbl_produk p ON sh.id_produk = p.id
      LEFT JOIN tbl_stage sp ON sh.stage_previous = sp.id
      LEFT JOIN tbl_stage sn ON sh.stage_now = sn.id
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM tbl_stage_histori sh
      LEFT JOIN tbl_produk p ON sh.id_produk = p.id
      LEFT JOIN tbl_stage sp ON sh.stage_previous = sp.id
      LEFT JOIN tbl_stage sn ON sh.stage_now = sn.id
      ${whereClause}
    `;

    const [dataResult, countResult] = await Promise.all([
      getPool().query(query, queryParams),
      getPool().query(countQuery, search ? [`%${search}%`] : [])
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Error fetching stage history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch stage history' },
      { status: 500 }
    );
  }
}