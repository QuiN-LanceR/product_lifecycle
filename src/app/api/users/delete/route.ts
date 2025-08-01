import { NextRequest, NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 400 });
  }

  const client = await getPool().connect();

  try {
    await client.query(`DELETE FROM tbl_user WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: "User berhasil dihapus" });
  } catch (err) {
    console.error("Delete user error:", err);
    return NextResponse.json({ success: false, message: "Gagal menghapus user" }, { status: 500 });
  } finally {
    client.release();
  }
}
