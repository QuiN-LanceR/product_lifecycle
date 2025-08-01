import { NextRequest, NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ success: false, message: "Kategori tidak ditemukan" }, { status: 400 });
  }

  const client = await getPool().connect();

  try {
    const checkResult = await client.query(
      `SELECT COUNT(*) FROM tbl_produk WHERE id_kategori = $1`,
      [id]
    );
    
    const productCount = parseInt(checkResult.rows[0].count, 10);
    if (productCount > 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Kategori tidak dapat dihapus karena sedang digunakan" 
      }, { status: 400 });
    }
    
    await client.query(`DELETE FROM tbl_kategori WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (err) {
    console.error("Delete kategori error:", err);
    return NextResponse.json({ success: false, message: "Gagal menghapus kategori" }, { status: 500 });
  } finally {
    client.release();
  }
}