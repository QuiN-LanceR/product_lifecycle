import { NextRequest, NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ success: false, message: "Segmen tidak ditemukan" }, { status: 400 });
  }

  const client = await getPool().connect();

  try {
    // Periksa apakah segmen digunakan oleh tabel lain
    const checkResult = await client.query(
      `SELECT COUNT(*) FROM tbl_produk WHERE id_segmen = $1`,
      [id]
    );
    
    const productCount = parseInt(checkResult.rows[0].count, 10);
    if (productCount > 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Segmen tidak dapat dihapus karena sedang digunakan" 
      }, { status: 400 });
    }
    
    await client.query(`DELETE FROM tbl_segmen WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: "Segmen berhasil dihapus" });
  } catch (err) {
    console.error("Delete segmen error:", err);
    return NextResponse.json({ success: false, message: "Gagal menghapus segmen" }, { status: 500 });
  } finally {
    client.release();
  }
}