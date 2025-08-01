import { NextRequest, NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ success: false, message: "Jabatan tidak ditemukan" }, { status: 400 });
  }

  const client = await getPool().connect();

  try {
    // Periksa apakah jabatan digunakan oleh user
    const checkResult = await client.query(
      `SELECT COUNT(*) FROM tbl_user WHERE jabatan = $1`,
      [id]
    );
    
    const userCount = parseInt(checkResult.rows[0].count, 10);
    if (userCount > 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Jabatan tidak dapat dihapus karena sedang digunakan oleh pengguna" 
      }, { status: 400 });
    }
    
    await client.query(`DELETE FROM tbl_jabatan WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: "Jabatan berhasil dihapus" });
  } catch (err) {
    console.error("Delete jabatan error:", err);
    return NextResponse.json({ success: false, message: "Gagal menghapus jabatan" }, { status: 500 });
  } finally {
    client.release();
  }
}