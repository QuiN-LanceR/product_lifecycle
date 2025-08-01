import { NextRequest, NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ success: false, message: "Produk tidak ditemukan" }, { status: 400 });
  }

  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    
    // Hapus attachment terlebih dahulu
    await client.query(`DELETE FROM tbl_attachment_produk WHERE produk_id = $1`, [id]);
    
    // Kemudian hapus produk
    await client.query(`DELETE FROM tbl_produk WHERE id = $1`, [id]);
    
    await client.query('COMMIT');
    
    return NextResponse.json({ success: true, message: "Produk berhasil dihapus" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Delete product error:", err);
    return NextResponse.json({ success: false, message: "Gagal menghapus produk" }, { status: 500 });
  } finally {
    client.release();
  }
}