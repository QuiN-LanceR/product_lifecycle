import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ success: false, message: "Stage tidak ditemukan" }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    // Periksa apakah stage digunakan oleh tabel lain
    const checkResult = await client.query(
      `SELECT COUNT(*) FROM tbl_produk WHERE id_stage = $1`,
      [id]
    );
    
    const productCount = parseInt(checkResult.rows[0].count, 10);
    if (productCount > 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Stage tidak dapat dihapus karena sedang digunakan" 
      }, { status: 400 });
    }
    
    await client.query(`DELETE FROM tbl_stage WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: "Stage berhasil dihapus" });
  } catch (err) {
    console.error("Delete stage error:", err);
    return NextResponse.json({ success: false, message: "Gagal menghapus stage" }, { status: 500 });
  } finally {
    client.release();
  }
}