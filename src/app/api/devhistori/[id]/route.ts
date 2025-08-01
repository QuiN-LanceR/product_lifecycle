import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';

// GET - Fetch single dev history
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
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
      WHERE dh.id = $1
    `;

    const result = await getPool().query(query, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Dev history not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching dev history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dev history' },
      { status: 500 }
    );
  }
}

// PUT - Update dev history
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { id_produk, tipe_pekerjaan, tanggal_mulai, tanggal_akhir, version, deskripsi, status } = body;

    const query = `
      UPDATE tbl_produk_dev_histori 
      SET id_produk = $1, tipe_pekerjaan = $2, tanggal_mulai = $3, tanggal_akhir = $4, 
          version = $5, deskripsi = $6, status = $7, updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;

    const result = await getPool().query(query, [id_produk, tipe_pekerjaan, tanggal_mulai, tanggal_akhir, version, deskripsi, status, id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Dev history not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Dev history updated successfully'
    });
  } catch (error) {
    console.error('Error updating dev history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update dev history' },
      { status: 500 }
    );
  }
}

// DELETE - Delete dev history
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const query = 'DELETE FROM tbl_produk_dev_histori WHERE id = $1 RETURNING *';
    const result = await getPool().query(query, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Dev history not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Dev history deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting dev history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete dev history' },
      { status: 500 }
    );
  }
}